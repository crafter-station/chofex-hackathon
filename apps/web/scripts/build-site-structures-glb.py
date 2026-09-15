#!/usr/bin/env python3
"""Build the built-structure layer: terraces, towns and the salt pans.

Without this the five stops are patches of bare hillside with a HUD box
floating over them. The landing's claim is that these are places people built,
so something built has to be visible.

What to model is decided by arithmetic, not taste. At the tour's 5 to 8 km
stand-off one screen pixel covers about 8 m of ground, which means:

    a single Inca terrace (3 m rise) ....... 0.4 px
    one house (15 m) ....................... 1.8 px
    a salt pan (5 m) ....................... 0.6 px
    Moray's main bowl (130 m) ............. 15 px
    Ollantaytambo's urban core (600 m) .... 71 px
    a terrace front (800 m) ............... 94 px

So the elements are invisible and the massing is not. Drawing real terrace
spacing here would produce a shimmering moire and nothing else; drawing the
bands they form produces terracing. Everything below is grouped to a size that
survives to the screen — terrace steps every ~45 m of elevation, town blocks
rather than houses, pan fields rather than pans.

The geometry follows the real mountain: terrace bands are contour lines pulled
straight out of the elevation model, so they bend where the ridge bends. They
are an abstraction of scale, not of shape.

Colour comes from the satellite drape at each site, lifted toward stone or
crop, so the structures sit in their landscape instead of on top of it.

Run: `python3 scripts/build-site-structures-glb.py`

Needs Pillow, numpy, scikit-image, and `bunx` for Draco compression.
"""

from __future__ import annotations

import json
import math
import struct
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from terrain_common import (  # noqa: E402
    ATTRIBUTION,
    DEM_ZOOM,
    HEIGHT_UNITS_PER_METER,
    METERS_PER_UNIT,
    ROOT,
    SACRED_VALLEY_AREA,
    SEA_LEVEL,
    ElevationSampler,
    ImagerySampler,
    Projection,
    align4,
    compress_with_draco,
    versioned_url,
)

GLB_OUT = ROOT / "public" / "models" / "site-structures.glb"
PLACE_OUT = ROOT / "components" / "landing" / "site-structures-place.ts"

DRACO_QUANTIZE = {"position": 14, "normal": 10, "texcoord": 12}

# Metres per scene unit across, and the 2x vertical exaggeration the terrain
# carries. Structures that ignored the second would sit visibly flatter than
# the ground they stand on.
ACROSS = 1.0 / METERS_PER_UNIT
UP = HEIGHT_UNITS_PER_METER


# Which way a face is meant to be seen from; see `Structures.triangle`.
SKYWARD = (0.0, 1.0, 0.0)


def metres(value: float) -> float:
    return value * ACROSS


class Structures:
    """Flat-shaded, vertex-coloured geometry in scene units."""

    def __init__(self) -> None:
        self.position: list[float] = []
        self.normal: list[float] = []
        self.colour: list[float] = []
        self.index: list[int] = []

    @staticmethod
    def _spread(colours, count):
        """Accept one colour for a face, or one per corner."""
        if colours and isinstance(colours[0], (tuple, list)):
            return list(colours)
        return [colours] * count

    def triangle(self, a, b, c, rgb, orient=None) -> None:
        """Add a triangle, wound so its face points along `orient`.

        The orientation argument is not a convenience. Winding decides which
        side of a face a renderer keeps, and these faces are generated from
        contour lines whose direction is whatever the marching-squares walk
        happened to produce — so roughly half of every terrace came out facing
        into the ground and was silently culled. Naming the side each face is
        meant to be seen from, and flipping the winding to match, is what makes
        the output independent of that. The same bug ate an earlier Moray whole.
        """
        ux, uy, uz = b[0] - a[0], b[1] - a[1], b[2] - a[2]
        vx, vy, vz = c[0] - a[0], c[1] - a[1], c[2] - a[2]
        nx = uy * vz - uz * vy
        ny = uz * vx - ux * vz
        nz = ux * vy - uy * vx
        length = math.sqrt(nx * nx + ny * ny + nz * nz)
        if length < 1e-12:
            return
        nx, ny, nz = nx / length, ny / length, nz / length

        flipped = False
        if orient is not None:
            if nx * orient[0] + ny * orient[1] + nz * orient[2] < 0:
                b, c = c, b
                nx, ny, nz = -nx, -ny, -nz
                flipped = True

        corners = self._spread(rgb, 3)
        if flipped:
            corners = [corners[0], corners[2], corners[1]]

        base = len(self.position) // 3
        for point, colour in zip((a, b, c), corners):
            self.position.extend(point)
            self.normal.extend((nx, ny, nz))
            self.colour.extend(colour)
        self.index.extend((base, base + 1, base + 2))

    def quad(self, a, b, c, d, rgb, orient=None) -> None:
        """Add a quad. `rgb` is one colour, or one per corner in a,b,c,d order.

        Per-corner colour is what carries the ambient occlusion: a terrace
        tread has to be dark where it meets the riser behind it and light at
        its open edge, and that gradient across a single face is the whole
        reason the steps read as steps rather than as painted stripes.
        """
        corners = self._spread(rgb, 4)
        self.triangle(a, b, c, [corners[0], corners[1], corners[2]], orient)
        self.triangle(a, c, d, [corners[0], corners[2], corners[3]], orient)

    def box(self, cx, cz, base_y, width, depth, height, angle, side, top) -> None:
        """An upright block, for a town's massing."""
        cos_a, sin_a = math.cos(angle), math.sin(angle)
        half_w, half_d = width / 2.0, depth / 2.0
        corners = []
        for dx, dz in ((-half_w, -half_d), (half_w, -half_d), (half_w, half_d), (-half_w, half_d)):
            corners.append((cx + dx * cos_a - dz * sin_a, cz + dx * sin_a + dz * cos_a))
        roof = base_y + height
        for i in range(4):
            x0, z0 = corners[i]
            x1, z1 = corners[(i + 1) % 4]
            self.quad(
                (x0, base_y, z0),
                (x1, base_y, z1),
                (x1, roof, z1),
                (x0, roof, z0),
                side,
                ((x0 + x1) / 2.0 - cx, 0.0, (z0 + z1) / 2.0 - cz),
            )
        self.quad(
            (corners[0][0], roof, corners[0][1]),
            (corners[1][0], roof, corners[1][1]),
            (corners[2][0], roof, corners[2][1]),
            (corners[3][0], roof, corners[3][1]),
            top,
            SKYWARD,
        )

    @property
    def triangles(self) -> int:
        return len(self.index) // 3


def local_heights(
    sampler: ElevationSampler,
    projection: Projection,
    cx: float,
    cz: float,
    radius: float,
    samples: int,
):
    """Square patch of terrain height around a point, in scene units."""
    xs = np.linspace(cx - radius, cx + radius, samples)
    zs = np.linspace(cz - radius, cz + radius, samples)
    grid = np.empty((samples, samples))
    for j, z in enumerate(zs):
        for i, x in enumerate(xs):
            grid[j, i] = sampler.height_at(projection, float(x), float(z))
    return grid, xs, zs


def terrace_bands(
    mesh: Structures,
    grid: np.ndarray,
    xs: np.ndarray,
    zs: np.ndarray,
    *,
    step_m: float,
    width_m: float,
    rise_m: float,
    bands: int,
    slope_min: float,
    slope_max: float,
    min_run_m: float,
    max_run_m: float,
    reach_m: float,
    centre: tuple[float, float],
    palette: "Palette",
) -> None:
    """Stepped bands following the real contours of a slope.

    Terraces are built where a hillside is steep enough to need retaining and
    shallow enough to farm, so the bands are placed by slope rather than
    sprinkled over everything — which also keeps them off cliffs and valley
    floors, where they would read as a mistake.
    """
    from skimage import measure

    span_x = float(xs[-1] - xs[0]) / (len(xs) - 1)
    span_z = float(zs[-1] - zs[0]) / (len(zs) - 1)
    from skimage import filters

    gradient_z, gradient_x = np.gradient(grid, span_z, span_x)
    # Slope as a ratio of real rise to real run, undoing the 2x exaggeration.
    slope = np.hypot(gradient_x, gradient_z) * (ACROSS / UP)
    # Smoothed before it is used as a test. Raw per-cell slope flickers in and
    # out of any window from one 14 m cell to the next, which breaks a contour
    # into dozens of fragments and leaves the hillside speckled instead of
    # terraced. Whether a slope is terraceable is a property of the hillside,
    # not of a single sample of it.
    slope = filters.gaussian(slope, sigma=1.6, preserve_range=True)

    low = float(np.percentile(grid, 22))
    high = float(np.percentile(grid, 78))
    span = max(high - low, 1e-9)
    step = step_m * UP
    levels = [low + step * i for i in range(bands) if low + step * i < high]

    half = metres(width_m) / 2.0
    drop = rise_m * UP

    # Contour points come out about one grid cell apart, so the stride that
    # thins them to a given spacing on the ground is a ratio of the two. An
    # earlier version divided the contour's *length* by a constant instead,
    # which collapsed every band to eight points however long it was.
    cell_m = span_x * METERS_PER_UNIT
    stride = max(1, int(round(30.0 / max(cell_m, 1e-6))))

    for level in levels:
        for contour in measure.find_contours(grid, level):
            points = contour[::stride]
            if len(points) < 3:
                continue

            # Walk the contour and cut it into runs of consecutive buildable
            # points, rather than filtering the points and joining whatever
            # survives. The difference is the whole look of the thing: filtered
            # points leave isolated specks strung along a ridge, which reads as
            # debris, while runs leave continuous ribbons, which reads as
            # terracing. A run that is too short to be a terrace is dropped.
            runs: list[list[tuple[float, float]]] = []
            current: list[tuple[float, float]] = []
            skipped = 0
            for row, col in points:
                ri, ci = int(round(row)), int(round(col))
                x = float(xs[0]) + col * span_x
                z = float(zs[0]) + row * span_z
                buildable = (
                    0 <= ri < grid.shape[0]
                    and 0 <= ci < grid.shape[1]
                    and slope_min <= slope[ri, ci] <= slope_max
                    # Terraces belong to a site, not to a mountain range. Without
                    # this the contours simply keep going and wrap the whole
                    # massif, which reads as a topographic map rather than as
                    # something anyone built.
                    and math.hypot(x - centre[0], z - centre[1]) <= metres(reach_m)
                )
                if buildable:
                    current.append((x, z))
                    skipped = 0
                    continue
                # A couple of unbuildable samples is a gully the terrace runs
                # past, not the end of the terrace. Only a sustained break ends
                # a run.
                skipped += 1
                if skipped <= 2:
                    continue
                if current:
                    runs.append(current)
                    current = []
            if current:
                runs.append(current)

            for run in runs:
                length = sum(
                    math.dist(run[i], run[i + 1]) for i in range(len(run) - 1)
                )
                if length < metres(min_run_m):
                    continue

                # And a terrace is a field, not a contour line. Long runs are
                # cut so the hillside carries several stacked platforms rather
                # than one ribbon wrapping every spur it meets.
                if length > metres(max_run_m):
                    keep = max(2, int(len(run) * metres(max_run_m) / length))
                    run = run[:keep]

                for i in range(len(run) - 1):
                    (x0, z0), (x1, z1) = run[i], run[i + 1]
                    dx, dz = x1 - x0, z1 - z0
                    segment = math.hypot(dx, dz)
                    if segment < 1e-9 or segment > metres(120):
                        continue
                    nx, nz = -dz / segment * half, dx / segment * half
                    top = level + drop

                    height_t = (level - low) / span
                    # The tread is tucked against the slope on its uphill edge
                    # and open to the sky on its downhill one. Grading the
                    # colour across that one face is what turns a flat ribbon
                    # into a step.
                    def tread_colour(px, pz, ao):
                        return palette.at(
                            px, pz, slope_t=0.12, height_t=height_t, ao=ao
                        )

                    mesh.quad(
                        (x0 - nx, top, z0 - nz),
                        (x1 - nx, top, z1 - nz),
                        (x1 + nx, top, z1 + nz),
                        (x0 + nx, top, z0 + nz),
                        [
                            tread_colour(x0 - nx, z0 - nz, AO_TUCKED),
                            tread_colour(x1 - nx, z1 - nz, AO_TUCKED),
                            tread_colour(x1 + nx, z1 + nz, AO_OPEN),
                            tread_colour(x0 + nx, z0 + nz, AO_OPEN),
                        ],
                        SKYWARD,
                    )
                    # The downhill face, which catches the raking sun and is
                    # what makes the steps read as steps rather than stripes.
                    def riser_colour(px, pz, ao):
                        return palette.at(
                            px, pz, slope_t=0.92, height_t=height_t, ao=ao
                        )

                    # And the wall is darkest where it meets the terrace below.
                    mesh.quad(
                        (x0 + nx, level - drop, z0 + nz),
                        (x1 + nx, level - drop, z1 + nz),
                        (x1 + nx, top, z1 + nz),
                        (x0 + nx, top, z0 + nz),
                        [
                            riser_colour(x0 + nx, z0 + nz, AO_TUCKED),
                            riser_colour(x1 + nx, z1 + nz, AO_TUCKED),
                            riser_colour(x1 + nx, z1 + nz, AO_OPEN),
                            riser_colour(x0 + nx, z0 + nz, AO_OPEN),
                        ],
                        (nx, 0.0, nz),
                    )


def settlement(
    mesh: Structures,
    sampler: ElevationSampler,
    projection: Projection,
    cx: float,
    cz: float,
    *,
    radius_m: float,
    blocks: int,
    block_m: float,
    height_m: float,
    grid_angle: float,
    seed: int,
    palette: "Palette",
) -> None:
    """A town's massing: blocks on a street grid, on ground flat enough to build.

    Blocks, not houses. One house is under two pixels at this range, but the
    regular grid a town makes is exactly the sort of pattern that reads as
    human from any distance — it is the only straight-edged thing on a
    mountain.
    """
    state = seed or 1

    def random() -> float:
        nonlocal state
        state ^= (state << 13) & 0xFFFFFFFF
        state ^= state >> 17
        state ^= (state << 5) & 0xFFFFFFFF
        return (state % 100000) / 100000

    radius = metres(radius_m)
    size = metres(block_m)
    cos_a, sin_a = math.cos(grid_angle), math.sin(grid_angle)
    placed = 0
    attempts = 0

    while placed < blocks and attempts < blocks * 40:
        attempts += 1
        # Lay candidates on a street grid, then jitter, so the result reads as
        # a plan rather than as scatter.
        gx = (round(random() * 8) - 4) * size * 1.7 + (random() - 0.5) * size * 0.35
        gz = (round(random() * 8) - 4) * size * 1.7 + (random() - 0.5) * size * 0.35
        x = cx + gx * cos_a - gz * sin_a
        z = cz + gx * sin_a + gz * cos_a
        if math.hypot(x - cx, z - cz) > radius:
            continue

        here = sampler.height_at(projection, x, z)
        # Reject anything on a slope a town would not stand on.
        rise = max(
            abs(sampler.height_at(projection, x + size, z) - here),
            abs(sampler.height_at(projection, x, z + size) - here),
        )
        if rise * (ACROSS / UP) / size > 0.28:
            continue

        wall = [
            palette.at(x, z, slope_t=0.85, height_t=0.35, ao=AO_TUCKED),
            palette.at(x, z, slope_t=0.85, height_t=0.35, ao=AO_TUCKED),
            palette.at(x, z, slope_t=0.85, height_t=0.5, ao=AO_SHADED),
            palette.at(x, z, slope_t=0.85, height_t=0.5, ao=AO_SHADED),
        ]
        roof = mix(palette.at(x, z, slope_t=0.0, height_t=0.8, ao=AO_OPEN), ROOF, 0.45)
        mesh.box(
            x,
            z,
            here - 1.0 * UP,
            size * (0.65 + random() * 0.5),
            size * (0.65 + random() * 0.5),
            (height_m * (0.7 + random() * 0.7)) * UP,
            grid_angle + (random() - 0.5) * 0.12,
            wall,
            roof,
        )
        placed += 1


def concentric_terraces(
    mesh: Structures,
    sampler: ElevationSampler,
    projection: Projection,
    cx: float,
    cz: float,
    *,
    radius_m: float,
    rings: int,
    depth_m: float,
    palette: "Palette",
) -> None:
    """Moray's bowls, which are not a contour problem but a lathe one.

    The published survey gives the geometry outright — rim radius, ring count,
    rim-to-floor depth — so this is measurement, not invention. At 15 px the
    rings themselves are what carries; the terracing inside them does not
    survive to the screen and is not attempted.
    """
    rim = sampler.height_at(projection, cx, cz)
    segments = 64

    # A bowl occludes itself: the deeper a ring sits, the less sky reaches it.
    # This is the cheap approximation the shape allows — darken by depth under
    # the rim — and it is what stops the rings reading as a flat spiral.
    def ring_colour(ring_index, slope_t, ao):
        depth_t = ring_index / max(rings, 1)
        return palette.at(
            cx,
            cz,
            slope_t=slope_t,
            height_t=1.0 - depth_t,
            ao=ao * (1.0 - 0.45 * depth_t),
        )
    # The innermost step closes on a floor rather than on a point: a ring of
    # zero radius degenerates and its geometry is dropped, which quietly cost
    # the bowl its last step and left it shallower than the survey says.
    floor_share = 0.16

    for ring in range(rings):
        outer = metres(radius_m) * (1 - (1 - floor_share) * ring / rings)
        inner = metres(radius_m) * (1 - (1 - floor_share) * (ring + 1) / rings)
        top = rim - (depth_m * UP) * (ring / rings)
        bottom = rim - (depth_m * UP) * ((ring + 1) / rings)
        for step in range(segments):
            a = step / segments * math.tau
            b = (step + 1) / segments * math.tau
            # Slightly out of round, the way the real sinkholes are.
            wobble_a = 1 + 0.05 * math.sin(a * 3)
            wobble_b = 1 + 0.05 * math.sin(b * 3)
            oa, ob = outer * wobble_a, outer * wobble_b
            ia, ib = inner * wobble_a, inner * wobble_b
            mesh.quad(
                (cx + ia * math.cos(a), top, cz + ia * math.sin(a)),
                (cx + ib * math.cos(b), top, cz + ib * math.sin(b)),
                (cx + ob * math.cos(b), top, cz + ob * math.sin(b)),
                (cx + oa * math.cos(a), top, cz + oa * math.sin(a)),
                [
                    ring_colour(ring, 0.1, AO_TUCKED),
                    ring_colour(ring, 0.1, AO_TUCKED),
                    ring_colour(ring, 0.1, AO_OPEN),
                    ring_colour(ring, 0.1, AO_OPEN),
                ],
                SKYWARD,
            )
            mesh.quad(
                (cx + ia * math.cos(a), bottom, cz + ia * math.sin(a)),
                (cx + ib * math.cos(b), bottom, cz + ib * math.sin(b)),
                (cx + ib * math.cos(b), top, cz + ib * math.sin(b)),
                (cx + ia * math.cos(a), top, cz + ia * math.sin(a)),
                [
                    ring_colour(ring + 1, 0.9, AO_TUCKED),
                    ring_colour(ring + 1, 0.9, AO_TUCKED),
                    ring_colour(ring, 0.9, AO_SHADED),
                    ring_colour(ring, 0.9, AO_SHADED),
                ],
                (-math.cos(a), 0.0, -math.sin(a)),
            )


def pan_field(
    mesh: Structures,
    sampler: ElevationSampler,
    projection: Projection,
    cx: float,
    cz: float,
    *,
    radius_m: float,
    cells: int,
    cell_m: float,
    seed: int,
    palette: "Palette",
) -> None:
    """The Salineras, as a field rather than as pans.

    One pan is 0.6 px. What reads from the air is the thing that makes the
    place photograph: a pale terraced sheet spilling down one ravine, bright
    against dark ground. So the cells are drawn at a size that survives, and
    the wet-to-dry gradient runs down the slope the way the water does.
    """
    state = seed or 1

    def random() -> float:
        nonlocal state
        state ^= (state << 13) & 0xFFFFFFFF
        state ^= state >> 17
        state ^= (state << 5) & 0xFFFFFFFF
        return (state % 100000) / 100000

    radius = metres(radius_m)
    size = metres(cell_m)
    placed = 0
    attempts = 0
    heights = []

    while placed < cells and attempts < cells * 40:
        attempts += 1
        x = cx + (random() - 0.5) * 2 * radius
        z = cz + (random() - 0.5) * 2 * radius
        if math.hypot(x - cx, z - cz) > radius:
            continue
        here = sampler.height_at(projection, x, z)
        heights.append((x, z, here))
        placed += 1

    if not heights:
        return
    lowest = min(h for _, _, h in heights)
    highest = max(h for _, _, h in heights)
    span = max(highest - lowest, 1e-6)

    for x, z, here in heights:
        # Wet at the top where the spring feeds them, crusted white below.
        dry = (here - lowest) / span
        ground = palette.ground(x, z)
        # Wet and dark where the spring feeds them, crusted white below. This
        # gradient is the signature of the place; without it the field is a
        # patch of grey dots.
        rgb = mix(mix(ground, BRINE, 0.72), mix(ground, CRUST, 0.88), 1 - dry)
        half = size / 2 * (0.7 + 0.6 * ((x * 37 + z * 53) % 1))
        top = here + 0.6 * UP
        mesh.quad(
            (x - half, top, z - half),
            (x + half, top, z - half),
            (x + half, top, z + half),
            (x - half, top, z + half),
            rgb,
            SKYWARD,
        )


# The Wall of the Six Monoliths, on the Temple Hill above Ollantaytambo's
# terraces. Widths and heights in metres, from published survey figures; the
# wall runs about 11 m end to end and the slabs stand 3 to 4 m proud.
#
# Six *different* blocks, because six identical ones announce themselves
# instantly — the irregularity is the whole signature of the thing. This is the
# one piece here whose form is arbitrary rather than derivable: it is a list of
# measurements, not a rule.
#
# Worth being plain about what this buys today: at the tour's 5 to 8 km
# stand-off a single monolith is 0.47 px and the whole wall is 1.77 px, so none
# of it is visible in the current framing. It is modelled so the geometry
# exists the day the camera comes closer or a detail view is added.
MONOLITH_SITE = (-13.2578, -72.2647)
MONOLITH_BEARING = 24.0
MONOLITHS = (
    # width, height, depth
    (1.55, 3.6, 0.85),
    (2.20, 4.0, 0.95),
    (1.30, 3.3, 0.80),
    (1.90, 3.9, 0.90),
    (1.70, 3.5, 0.85),
    (2.05, 3.8, 0.95),
)
# The thin upright spacers between them, which is how the wall is actually
# jointed and why it does not read as one slab.
MONOLITH_SPACER = 0.22


def monoliths(
    mesh: Structures,
    sampler: ElevationSampler,
    projection: Projection,
    palette: "Palette",
) -> None:
    cx, cz = projection.world(*MONOLITH_SITE)
    heading = math.radians(MONOLITH_BEARING)
    along_x, along_z = math.sin(heading), -math.cos(heading)

    total = sum(width for width, _, _ in MONOLITHS)
    total += MONOLITH_SPACER * (len(MONOLITHS) - 1)
    cursor = -total / 2.0

    for width, height, depth in MONOLITHS:
        offset = cursor + width / 2.0
        x = cx + along_x * metres(offset)
        z = cz + along_z * metres(offset)
        base = sampler.height_at(projection, x, z)
        stone = [
            palette.at(x, z, slope_t=1.0, height_t=0.3, ao=AO_SHADED),
            palette.at(x, z, slope_t=1.0, height_t=0.3, ao=AO_SHADED),
            palette.at(x, z, slope_t=1.0, height_t=0.75, ao=AO_OPEN),
            palette.at(x, z, slope_t=1.0, height_t=0.75, ao=AO_OPEN),
        ]
        mesh.box(
            x,
            z,
            base - metres(0.6),
            metres(width),
            metres(depth),
            height * UP,
            heading,
            stone,
            palette.at(x, z, slope_t=0.0, height_t=0.85, ao=AO_OPEN),
        )
        cursor += width + MONOLITH_SPACER


def mix(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


class Palette:
    """Surface colour from the ground it stands on, its slope and its height.

    Three things decided per vertex rather than one colour assigned per site.

    The drape is sampled at the structure's own position, so a terrace picks up
    whatever the mountain is doing underneath it and stays in key with the
    terrain wherever the site sits on it. Slope chooses the material: a flat
    tread is planted, a steep face is the retaining wall holding it up. Height
    runs a ramp across the site, darker and greener at the foot, paler and more
    ochre at the top, which is both what a cultivated hillside does and what
    keeps a stack of bands from reading as one flat sheet.

    Then ambient occlusion multiplies the lot. Flat shading gives facets but
    leaves an inside corner exactly as bright as an open face, so without this
    the steps are stripes. It is the cheapest part and the one that sells it.
    """

    def __init__(self, imagery: ImagerySampler, projection: Projection):
        self.imagery = imagery
        self.projection = projection
        self._cache: dict[tuple[int, int], tuple[float, float, float]] = {}

    def ground(self, x: float, z: float) -> tuple[float, float, float]:
        # Cached on a ~100 m lattice: the drape resolves 15 m and a per-vertex
        # fetch would sample the same tile thousands of times over.
        key = (int(x * 2), int(z * 2))
        hit = self._cache.get(key)
        if hit is None:
            lat, lon = self.projection.geo_from_world(x, z)
            hit = self.imagery.at(lat, lon, radius_px=14)
            self._cache[key] = hit
        return hit

    def at(
        self,
        x: float,
        z: float,
        *,
        slope_t: float,
        height_t: float,
        ao: float,
    ) -> tuple[float, float, float]:
        material = mix(CROP, STONE, clamp01(slope_t))
        base = mix(self.ground(x, z), material, 0.42)
        shaded = mix(
            mix(base, LOW_GROUND, 0.22),
            mix(base, HIGH_GROUND, 0.22),
            clamp01(height_t),
        )
        return tuple(channel * ao for channel in shaded)


def clamp01(value: float) -> float:
    return 0.0 if value < 0 else (1.0 if value > 1 else value)


# Materials, as linear RGB. Built surfaces are not the same stuff as the slope
# they sit on, so each is the local drape lifted toward what it is made of.
STONE = (0.42, 0.40, 0.37)
CROP = (0.30, 0.31, 0.16)
# Ends of the height ramp: damp and green at the foot of a site, sun-bleached
# ochre at the top. Subtle on purpose — it separates the bands without turning
# the hillside into a gradient.
LOW_GROUND = (0.12, 0.16, 0.08)
HIGH_GROUND = (0.46, 0.38, 0.24)

# Baked ambient occlusion, as a plain multiplier on the vertex colour.
# AO_TUCKED is an inside corner — the back of a tread, the foot of a wall;
# AO_OPEN is a face with the sky in front of it.
AO_TUCKED = 0.46
AO_SHADED = 0.62
AO_OPEN = 1.0
ROOF = (0.35, 0.16, 0.10)
BRINE = (0.13, 0.12, 0.10)
CRUST = (0.78, 0.77, 0.72)


def load_sites() -> dict:
    """The site anchors, read from the terrain builder that owns them.

    Imported rather than copied so the two can never drift apart about where a
    place is; by file path because the module's name has dashes in it.
    """
    import importlib.util

    path = ROOT / "scripts" / "build-sacred-valley-glb.py"
    spec = importlib.util.spec_from_file_location("sacred_valley_builder", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.SITES


def main() -> None:
    sites = load_sites()

    projection = Projection(
        SACRED_VALLEY_AREA,
        *SACRED_VALLEY_AREA.tile_range(DEM_ZOOM)[:2],
        DEM_ZOOM,
        SEA_LEVEL,
    )
    elevation = ElevationSampler(DEM_ZOOM)
    imagery = ImagerySampler()
    palette = Palette(imagery, projection)
    mesh = Structures()

    measured: dict[str, dict] = {}

    for name, site in sites.items():
        cx, cz = projection.world(site["lat"], site["lon"])
        before = mesh.triangles
        vertex_start = len(mesh.position)

        if name == "moray":
            concentric_terraces(
                mesh, elevation, projection, cx, cz,
                # The published survey: ~65 m rim radius on the main bowl and
                # about 30 m from rim to floor. An earlier pass had this at
                # 150 m, which inflated the site by 2.3x — caught by the
                # measured metrics below, which is what they are for.
                radius_m=65, rings=6, depth_m=30, palette=palette,
            )
        elif name == "maras":
            pan_field(
                mesh, elevation, projection, cx, cz,
                radius_m=190, cells=260, cell_m=26, seed=17, palette=palette,
            )
        else:
            grid, xs, zs = local_heights(elevation, projection, cx, cz, metres(650), 120)
            terrace_bands(
                mesh, grid, xs, zs,
                step_m=58, width_m=64, rise_m=8, bands=8,
                slope_min=0.18, slope_max=1.25,
                min_run_m=180, max_run_m=620, reach_m=520, centre=(cx, cz),
                palette=palette,
            )

        if name == "ollantaytambo":
            monoliths(mesh, elevation, projection, palette)

        if name in ("ollantaytambo", "pisac"):
            settlement(
                mesh, elevation, projection, cx, cz,
                radius_m=380 if name == "ollantaytambo" else 240,
                blocks=90 if name == "ollantaytambo" else 40,
                block_m=54, height_m=9,
                grid_angle=0.5 if name == "ollantaytambo" else 1.2,
                seed=11 if name == "ollantaytambo" else 29,
                palette=palette,
            )

        # Measure what was actually emitted, in real metres, so the numbers
        # can be asserted in CI rather than trusted. The scene is anisotropic —
        # 200 m per unit across, 100 m per unit up, because the terrain carries
        # a 2x vertical exaggeration — so the two axes convert differently.
        block = np.asarray(mesh.position[vertex_start:], dtype=np.float64)
        if len(block):
            block = block.reshape(-1, 3)
            measured[name] = {
                "triangles": mesh.triangles - before,
                "widthM": float(np.ptp(block[:, 0])) * METERS_PER_UNIT,
                "depthM": float(np.ptp(block[:, 2])) * METERS_PER_UNIT,
                "reliefM": float(np.ptp(block[:, 1])) / HEIGHT_UNITS_PER_METER,
                "reachM": float(
                    np.hypot(block[:, 0] - cx, block[:, 2] - cz).max()
                )
                * METERS_PER_UNIT,
            }
        print(f"  {name:14s} {mesh.triangles - before:6d} triangles")

    write(mesh, measured)


def write(mesh: Structures, measured: dict[str, dict]) -> None:
    positions = np.asarray(mesh.position, dtype=np.float32).reshape(-1, 3)
    normals = np.asarray(mesh.normal, dtype=np.float32).reshape(-1, 3)
    colours = np.asarray(mesh.colour, dtype=np.float32).reshape(-1, 3)
    indices = np.asarray(mesh.index, dtype=np.uint32)

    binary = bytearray()
    views: list[dict] = []

    def add_view(blob: bytes, target: int | None) -> int:
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(blob)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(blob)}
        if target is not None:
            view["target"] = target
        views.append(view)
        return len(views) - 1

    position_view = add_view(positions.tobytes(), 34962)
    normal_view = add_view(normals.tobytes(), 34962)
    colour_view = add_view(colours.tobytes(), 34962)
    index_view = add_view(indices.tobytes(), 34963)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "chofex-hackathon/build-site-structures-glb",
            "extras": {
                "title": "Sacred Valley site structures",
                "heroSubject": "structures",
                "attribution": ATTRIBUTION,
            },
        },
        "scene": 0,
        "scenes": [{"name": "site-structures", "nodes": [0]}],
        "nodes": [{"name": "site-structures", "mesh": 0}],
        "meshes": [
            {
                "name": "site-structures",
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "NORMAL": 1,
                            "COLOR_0": 2,
                        },
                        "indices": 3,
                        "material": 0,
                        "mode": 4,
                    }
                ],
            }
        ],
        "materials": [
            {
                "name": "site-structures-surface",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [1, 1, 1, 1],
                    "metallicFactor": 0.0,
                    "roughnessFactor": 0.95,
                },
            }
        ],
        "accessors": [
            {
                "bufferView": position_view,
                "componentType": 5126,
                "count": len(positions),
                "type": "VEC3",
                "min": positions.min(axis=0).tolist(),
                "max": positions.max(axis=0).tolist(),
            },
            {
                "bufferView": normal_view,
                "componentType": 5126,
                "count": len(normals),
                "type": "VEC3",
            },
            {
                "bufferView": colour_view,
                "componentType": 5126,
                "count": len(colours),
                "type": "VEC3",
            },
            {
                "bufferView": index_view,
                "componentType": 5125,
                "count": len(indices),
                "type": "SCALAR",
            },
        ],
        "bufferViews": views,
        "buffers": [{"byteLength": len(binary)}],
    }

    json_blob = align4(json.dumps(gltf, separators=(",", ":")).encode(), b" ")
    binary_blob = align4(bytes(binary))
    total = 12 + 8 + len(json_blob) + 8 + len(binary_blob)
    payload = struct.pack("<III", 0x46546C67, 2, total)
    payload += struct.pack("<II", len(json_blob), 0x4E4F534A) + json_blob
    payload += struct.pack("<II", len(binary_blob), 0x004E4942) + binary_blob

    GLB_OUT.parent.mkdir(parents=True, exist_ok=True)
    GLB_OUT.write_bytes(payload)
    print(
        f"wrote {GLB_OUT.relative_to(ROOT)} "
        f"({GLB_OUT.stat().st_size:,} bytes, {mesh.triangles:,} triangles)"
    )
    compress_with_draco(GLB_OUT, DRACO_QUANTIZE)

    metrics = ",\n".join(
        f"  {name}: {{\n"
        f"    triangles: {m['triangles']},\n"
        f"    widthM: {m['widthM']:.1f},\n"
        f"    depthM: {m['depthM']:.1f},\n"
        f"    reliefM: {m['reliefM']:.1f},\n"
        f"    reachM: {m['reachM']:.1f},\n"
        f"  }}"
        for name, m in measured.items()
    )
    PLACE_OUT.write_text(
        f'''/**
 * Generated by `scripts/build-site-structures-glb.py`. Do not edit by hand.
 *
 * Terraces, towns, salt pans and the Six Monoliths, in the scene units the
 * terrain meshes share. Loads at the identity transform like everything else.
 */

export const SITE_STRUCTURES_GLB = "{versioned_url(GLB_OUT, "/models/site-structures.glb")}";

/**
 * What the generator actually emitted, measured in real metres.
 *
 * The scene is anisotropic — 200 m per unit across, 100 m per unit up, since
 * the terrain carries a 2x vertical exaggeration — so a bounding box in scene
 * units says nothing on its own. These are converted per axis, which makes
 * them comparable against the published dimensions of the real sites and
 * therefore assertable in CI. A refactor that quietly halves a site shows up
 * as a failing test rather than as a screenshot someone notices months later.
 */
export const SITE_STRUCTURE_METRICS = {{
{metrics},
}} as const;
'''
    )
    print(f"wrote {PLACE_OUT.relative_to(ROOT)}")
    print(f"\n{ATTRIBUTION}")


if __name__ == "__main__":
    main()
