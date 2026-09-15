#!/usr/bin/env python3
"""Build the Sacred Valley hero terrain from open elevation and satellite data.

Covers the Urubamba corridor from Ollantaytambo to Pisac, so landing chapters
can anchor to real places. Emits two artifacts that share one projection:

- `public/models/sacred-valley.glb` — indexed terrain mesh with a baked
  Sentinel-2 drape.
- `components/landing/sacred-valley-place.ts` — the same projection's world
  coordinates for the river flight path, the town anchors, and the five
  archaeological sites the scroll stops at.

The shared projection, tile fetching and GLB assembly live in
`terrain_common.py`, which `build-machu-picchu-glb.py` also builds on.

Run: `python3 scripts/build-sacred-valley-glb.py`
     `python3 scripts/build-sacred-valley-glb.py --places-only`

The second form regenerates only the TypeScript anchors. Retuning a camera
stop or adding a site does not need a 4 MB mesh re-baked, and it runs entirely
off the tile cache.

Needs Pillow, numpy, scikit-image, and `bunx` for Draco compression.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from terrain_common import (  # noqa: E402
    ATTRIBUTION,
    DEM_URL,
    DEM_ZOOM,
    HEIGHT_UNITS_PER_METER,
    IMAGERY_URL,
    IMAGERY_ZOOM,
    METERS_PER_UNIT,
    ROOT,
    SACRED_VALLEY_AREA,
    SEA_LEVEL,
    ElevationSampler,
    Projection,
    bake_texture,
    build_mesh,
    compress_with_draco,
    decode_terrarium,
    fetch_mosaic,
    sample_elevation,
    sample_grid,
    split_primitives,
    versioned_url,
    write_glb,
)

GRID_COLS = 1152
GRID_ROWS = 686
TEXTURE_WIDTH = 4096
TEXTURE_QUALITY = 82

# Draco keeps a mesh this dense affordable: ~35 MB of raw float attributes
# compress to under 4 MB, which is what lets the grid sample every ~54 m
# instead of every ~160 m. 14-bit positions put the quantisation error at
# under 4 m, well below the source data's own resolution.
DRACO_QUANTIZE = {"position": 14, "normal": 10, "texcoord": 12}

# Towns the landing can anchor chapters to.
PLACES = {
    "ollantaytambo": (-13.2585, -72.2633),
    "urubamba": (-13.3040, -72.1170),
    "calca": (-13.3310, -71.9550),
    "pisac": (-13.4205, -71.8460),
}

# The five sites the scroll actually stops at, in flight order — downstream,
# the way the river runs and the way the narrative reads.
#
# `lat`/`lon` point at what the camera should frame, which is not always the
# town that shares the name: at Pisac the subject is the terraced ridge above
# the town, not the plaza. `elevation` is the published figure used in the
# landing copy; the anchor's own height is measured from the DEM and can differ
# by a few tens of metres, since a 19 m DEM pixel averages whatever it covers.
SITES = {
    "pisac": {
        "lat": -13.4169,
        "lon": -71.8461,
        "label": "Písac",
        "elevation": 2972,
    },
    "moray": {
        "lat": -13.3296,
        "lon": -72.1947,
        "label": "Moray",
        "elevation": 3500,
    },
    "maras": {
        "lat": -13.2953,
        "lon": -72.1553,
        "label": "Salineras de Maras",
        # Not 3,380 m. That figure is the town of Maras, 5 km up the hill; the
        # pans are down in the Qoripujio ravine and the DEM reads ~3,007 m
        # there, which is consistent with them draining into a river at 2,850.
        "elevation": 3000,
    },
    "ollantaytambo": {
        "lat": -13.2581,
        "lon": -72.2633,
        "label": "Ollantaytambo",
        "elevation": 2792,
    },
    "machupicchu": {
        "lat": -13.1631,
        "lon": -72.5450,
        "label": "Machu Picchu",
        "elevation": 2430,
    },
}

# How each site is framed, and where the tour opens.
#
# `bearing` is the compass direction from the site out to the camera, so 135
# puts the camera south-east of its subject looking back north-west. `distance`
# and `rise` are scene units — 1 unit is 200 m of ground.
#
# These are aerial stand-offs, 4 to 8 km out and 1 to 2 km up, and that is a
# deliberate retreat from an earlier pass that flew the camera to within a
# kilometre of each site. Up close the source data runs out: the mesh samples
# every 54 m and the drape resolves 15 m, so a near stop magnifies a blurred
# photograph and asks procedural geometry to carry detail the terrain cannot.
# From up here the landscape is the subject and the sites are pointed out by
# the HUD instead of inspected, which is what this data can honestly support.
# Bearings are not free choices, and they are not independent of each other.
#
# Two constraints decide them, both measured against the elevation model rather
# than picked by eye. A bearing has to give the camera a clear line to its
# subject *and* leave it standing clear of everything around it. An earlier
# pass only checked the first, which is why Ollantaytambo ended up 364 m under
# a ridge 1.6 km off its shoulder, with that ridge cutting across half the
# frame.
#
# Then, among the bearings that pass both, the chain is chosen to turn as
# little as possible. View heading is what a reader's inner ear tracks, so a
# tour that swings the compass makes people queasy however smoothly it does it.
# Solved as a shortest path over the clean bearings, the tour now turns 35
# degrees in total rather than 232: one steady west-north-west heading, and a
# single swing into Ollantaytambo.
#
# That heading is the lit one too. The sun sits east-north-east, so facing west
# puts it behind the camera, raking across the slopes in frame.
STATION_FRAMING = {
    "pisac": {"bearing": 160, "distance": 30.0, "rise": 15.0},
    "moray": {"bearing": 160, "distance": 28.0, "rise": 13.0},
    "maras": {"bearing": 160, "distance": 26.0, "rise": 12.0},
    # The fussiest of the five: only 12 of 72 bearings clear both tests, and
    # they fall into an eastward clump and a westward one. This is the west.
    "ollantaytambo": {"bearing": 125, "distance": 32.0, "rise": 14.0},
    "machupicchu": {"bearing": 125, "distance": 34.0, "rise": 20.0},
}

# The establishing shot, widest of all: the corridor running away below.
OVERLOOK = {"bearing": 160, "distance": 42.0, "rise": 24.0}

# Roughly one camera sample per this many units of travel between stations.
# Dense enough that a ridge cannot hide between two samples, sparse enough that
# the emitted path stays readable.
LEG_SAMPLE_UNITS = 7.0
LEG_MIN_SAMPLES = 5

# How far a station's sight line stays off the ground, in scene units. 0.7 is
# 140 m, which covers the gap between a 54 m mesh and the 19 m DEM this is
# solved against.
SIGHT_CLEARANCE = 0.7

# How far a station stands above the ridges around it, in scene units.
#
# Separate from SIGHT_CLEARANCE, which only keeps the line to the subject off
# the ground. A ridge sitting just off that line passes the sight test and
# still fills half the frame, which is precisely what happened at
# Ollantaytambo.
STATION_CLEARANCE = 4.0

# How far out a station looks for those ridges, in scene units.
STATION_HORIZON = 9.0

# How far a transfer flies above the ridges around it, in scene units.
#
# Much larger than SIGHT_CLEARANCE, and for a different reason. That value only
# has to keep a sight line off the ground it passes over; this has to keep the
# camera above the terrain it passes *between*. Clearing the ground directly
# below is not the same thing at all — on the run down to Machu Picchu the
# floor of the gorge sits 8 units under the camera while the walls either side
# rise a unit above it, so the flight was threading a canyon with rock filling
# the frame. 5 units is 500 m of air over the local skyline.
LEG_CLEARANCE = 5.0

# Radius over which a transfer looks for that skyline, in scene units.
# 8 units is 1.6 km, about as far as a ridge can be and still dominate the
# frame at these stand-offs.
LEG_HORIZON = 8.0

# How far a transfer's aim rises off its subject, as a share of the camera's
# height above it.
#
# Without this the flight looks straight down. The aim between two stations
# interpolates between the sites themselves, which are on the ground, while the
# camera rides a unit or two over the ridge line — a 52-degree downward pitch
# at the midpoint, which fills the frame with hillside and crops the sky out
# entirely. Lifting the aim most of the way back toward the camera's own
# altitude puts the horizon back in shot.
LEG_AIM_LIFT = 0.62

# How far ahead a transfer looks, as a share of the leg. A camera aimed at
# where it already is reads as drifting; aimed a little further on, it reads as
# going somewhere.
LEG_AIM_LEAD = 0.12

# Coarse guide for the river. Each sample is snapped to the true valley floor
# using the DEM, so these only need to be roughly right.
RIVER_GUIDE = (
    PLACES["pisac"],
    PLACES["calca"],
    PLACES["urubamba"],
    PLACES["ollantaytambo"],
)

GLB_OUT = ROOT / "public" / "models" / "sacred-valley.glb"
PLACE_OUT = ROOT / "components" / "landing" / "sacred-valley-place.ts"


# --- River tracing ----------------------------------------------------------


def trace_river(
    dem: np.ndarray, projection: Projection, samples: int = 96
) -> list[tuple[float, float, float]]:
    """Find the Urubamba by walking the cheapest low ground between towns.

    A perpendicular search off a straight guide line climbs out of the valley
    wherever the river bends away from it, so instead each leg is a minimum
    cost path over the elevation model. Cost rises steeply with height, which
    keeps the route pinned to the valley floor, and routing leg by leg forces
    it through every town rather than around them.
    """
    from skimage.graph import route_through_array

    low, high = float(dem.min()), float(dem.max())
    normalised = (dem - low) / max(1.0, high - low)
    cost = 1.0 + 4000.0 * normalised**3

    route: list[tuple[int, int]] = []
    for index in range(len(RIVER_GUIDE) - 1):
        start = projection.pixel(*RIVER_GUIDE[index])
        end = projection.pixel(*RIVER_GUIDE[index + 1])
        leg, _ = route_through_array(
            cost,
            (int(round(start[1])), int(round(start[0]))),
            (int(round(end[1])), int(round(end[0]))),
            fully_connected=True,
            geometric=True,
        )
        route.extend(leg if not route else leg[1:])

    # Resample the dense pixel route to an even number of flight-path points.
    picked = [route[round(i * (len(route) - 1) / (samples - 1))] for i in range(samples)]
    traced = [
        (*projection.world_from_pixel(px, py), float(dem[py, px]))
        for py, px in picked
    ]
    return smooth_path([(x, projection.height(elev), z) for x, z, elev in traced])


def smooth_path(
    path: list[tuple[float, float, float]], passes: int = 6
) -> list[tuple[float, float, float]]:
    """Cell-by-cell routing is jittery; a flight path has to be smooth."""
    points = [list(point) for point in path]
    for _ in range(passes):
        for index in range(1, len(points) - 1):
            for axis in range(3):
                points[index][axis] = (
                    points[index - 1][axis]
                    + points[index][axis] * 2.0
                    + points[index + 1][axis]
                ) / 4.0
    return [(p[0], p[1], p[2]) for p in points]


# --- Camera solving ---------------------------------------------------------

Point = tuple[float, float, float]


def solve_vantage(
    sampler: ElevationSampler,
    projection: Projection,
    site: Point,
    framing: dict,
) -> Point:
    """Put the camera where it can actually see the site.

    Placing a camera by bearing and distance alone is what buries it inside a
    hillside — the Sacred Valley has 3,000 m of relief and half these sites sit
    against a slope. So the sight line is marched over the elevation model and
    the camera lifted until nothing pokes through it. Raising the camera pivots
    the ray around the subject, which lowers the far end less than the near
    end, so this converges rather than chasing itself.
    """
    bearing = math.radians(framing["bearing"])
    site_x, site_y, site_z = site
    x = site_x + math.sin(bearing) * framing["distance"]
    z = site_z - math.cos(bearing) * framing["distance"]
    y = site_y + framing["rise"]

    for _ in range(48):
        worst = 0.0
        for step in range(1, 33):
            t = step / 33.0
            ground = sampler.height_at(
                projection, x + (site_x - x) * t, z + (site_z - z) * t
            )
            # The margin tapers to nothing at the subject. It has to: the site
            # anchor sits *on* the terrain, so demanding a fixed gap at the far
            # end of the ray is unsatisfiable — the solver just climbs until
            # the shrinking (1 - t) factor pays for it, which put every one of
            # these cameras some 3,000 m too high. Tapered, the condition says
            # the useful thing instead: clear the ground in between, and stand
            # at least SIGHT_CLEARANCE above the subject itself.
            margin = SIGHT_CLEARANCE * (1.0 - t)
            worst = max(worst, ground + margin - (y + (site_y - y) * t))
        if worst <= 0.0:
            break
        y += worst + 0.05

    # And the camera has to stand clear of everything around it, not merely of
    # the ground directly beneath it.
    around = skyline(sampler, projection, x, z, STATION_HORIZON)
    return x, max(y, around + STATION_CLEARANCE), z


def skyline(
    sampler: ElevationSampler,
    projection: Projection,
    x: float,
    z: float,
    horizon: float = LEG_HORIZON,
) -> float:
    """Highest ground within `horizon` of a point.

    A transfer has to clear what is beside it, not merely what is beneath it.
    Sampling a ring rather than the single point below is the whole difference
    between flying over a valley and flying through it.
    """
    highest = sampler.height_at(projection, x, z)
    for step in range(12):
        angle = step * math.pi / 6.0
        for radius in (horizon * 0.34, horizon * 0.67, horizon):
            highest = max(
                highest,
                sampler.height_at(
                    projection,
                    x + math.cos(angle) * radius,
                    z + math.sin(angle) * radius,
                ),
            )
    return highest


def clear_leg(
    sampler: ElevationSampler,
    projection: Projection,
    start: Point,
    end: Point,
) -> list[Point]:
    """Camera samples across one transfer, every one of them above the ridges.

    Two cleared vantages say nothing about the ground between them, and between
    Ollantaytambo and Machu Picchu that ground includes a 4,000 m cordillera.
    Each sample is lifted over the local skyline, then the whole run is smoothed
    so the climb reads as a flight rather than a staircase.
    """
    span = math.dist((start[0], start[2]), (end[0], end[2]))
    count = max(LEG_MIN_SAMPLES, int(span / LEG_SAMPLE_UNITS))

    points: list[Point] = []
    for step in range(1, count + 1):
        t = step / (count + 1)
        x = start[0] + (end[0] - start[0]) * t
        z = start[2] + (end[2] - start[2]) * t
        y = start[1] + (end[1] - start[1]) * t
        points.append((x, max(y, skyline(sampler, projection, x, z) + LEG_CLEARANCE), z))

    # Smooth the lifted heights only. Moving x or z would walk the path off the
    # line the two stations agreed on.
    for _ in range(4):
        for index in range(len(points)):
            before = points[index - 1][1] if index > 0 else start[1]
            after = points[index + 1][1] if index < len(points) - 1 else end[1]
            here = points[index]
            lifted = (before + here[1] * 2.0 + after) / 4.0
            ridge = skyline(sampler, projection, here[0], here[2])
            points[index] = (here[0], max(lifted, ridge + LEG_CLEARANCE), here[2])

    return points


def solve_flight(
    sampler: ElevationSampler, projection: Projection, sites: dict[str, dict]
) -> tuple[list[Point], list[Point], list[dict]]:
    """The whole tour: camera positions, aim points, and where each site lands.

    Returns parallel arrays. The camera rides `path` and looks at `aim`; while
    it crosses between two sites its gaze slides from one to the other, so the
    subject changes by turning the head rather than by cutting.
    """
    order = list(STATION_FRAMING)
    anchors = {name: sites[name]["position"] for name in order}

    first = anchors[order[0]]
    stops: list[tuple[str, Point, Point]] = [
        ("overlook", solve_vantage(sampler, projection, first, OVERLOOK), first)
    ]
    for name in order:
        site = anchors[name]
        stops.append(
            (name, solve_vantage(sampler, projection, site, STATION_FRAMING[name]), site)
        )

    path: list[Point] = []
    aim: list[Point] = []
    stations: list[dict] = []

    for index, (name, vantage, target) in enumerate(stops):
        stations.append({"id": name, "index": len(path)})
        path.append(vantage)
        aim.append(target)

        if index == len(stops) - 1:
            break

        _, next_vantage, next_target = stops[index + 1]
        leg = clear_leg(sampler, projection, vantage, next_vantage)
        for step, point in enumerate(leg, start=1):
            t = step / (len(leg) + 1)
            path.append(point)

            # Both the lead and the lift are weighted by a bump that vanishes
            # at either end, so a station's own aim stays exactly on its site.
            bump = math.sin(math.pi * t)
            ahead = min(1.0, t + LEG_AIM_LEAD * bump)
            level = target[1] + (next_target[1] - target[1]) * t
            aim.append(
                (
                    target[0] + (next_target[0] - target[0]) * ahead,
                    level + (point[1] - level) * LEG_AIM_LIFT * bump,
                    target[2] + (next_target[2] - target[2]) * ahead,
                )
            )

    for station in stations:
        station["progress"] = station["index"] / (len(path) - 1)

    return path, aim, stations


# --- Generated scene constants ---------------------------------------------


def triple(point: tuple[float, float, float]) -> str:
    return f"[{point[0]:.3f}, {point[1]:.3f}, {point[2]:.3f}]"


def write_place_module(
    projection: Projection,
    river: list[tuple[float, float, float]],
    places: dict[str, tuple[float, float, float]],
    sites: dict[str, dict],
    flight: tuple[list[Point], list[Point], list[dict]],
) -> None:
    path, aim, stations = flight
    path_lines = ",\n".join(f"  {triple(point)}" for point in path)
    aim_lines = ",\n".join(f"  {triple(point)}" for point in aim)
    # Only the index. A rounded progress float would not land exactly on its
    # spline node, which pulls the aim off its subject by a visible fraction;
    # index / (length - 1) is exact, so the runtime derives it instead.
    station_lines = ",\n".join(
        f"  {{ id: {json.dumps(station['id'])}, index: {station['index']} }}"
        for station in stations
    )
    glb_url = versioned_url(GLB_OUT, "/models/sacred-valley.glb")
    river_lines = ",\n".join(f"  {triple(point)}" for point in river)
    place_lines = ",\n".join(
        f"  {name}: {{\n"
        f"    label: {json.dumps(name.capitalize())},\n"
        f"    position: {triple(point)},\n"
        f"  }}"
        for name, point in places.items()
    )
    site_lines = ",\n".join(
        f"  {name}: {{\n"
        f"    label: {json.dumps(site['label'])},\n"
        f"    position: {triple(site['position'])},\n"
        f"    elevation: {site['elevation']},\n"
        f"    latitude: {site['lat']},\n"
        f"    longitude: {site['lon']},\n"
        f"    onTerrain: {json.dumps(site['on_terrain'])},\n"
        f"  }}"
        for name, site in sites.items()
    )

    PLACE_OUT.write_text(
        f'''// biome-ignore-all lint/suspicious/noApproximativeNumericConstant: these are
// terrain coordinates; one occasionally lands near a maths constant by chance.
/**
 * Generated by `scripts/build-sacred-valley-glb.py`. Do not edit by hand.
 *
 * Scene units shared with `public/models/sacred-valley.glb` and
 * `public/models/machu-picchu.glb`: one unit is {METERS_PER_UNIT:.0f} m on the ground,
 * heights carry a {METERS_PER_UNIT * HEIGHT_UNITS_PER_METER:.0f}x exaggeration measured from a {SEA_LEVEL:.0f} m datum, and
 * the origin sits at the centre of the Sacred Valley bounding box.
 */

export type ScenePoint = readonly [number, number, number];

/** Terrain extent in scene units. */
export const TERRAIN_SIZE = {{
  width: {projection.width_units:.3f},
  depth: {projection.depth_units:.3f},
}} as const;

/** Geographic bounding box of the terrain, as [west, south, east, north]. */
export const TERRAIN_BBOX = [
  {SACRED_VALLEY_AREA.lon_west}, {SACRED_VALLEY_AREA.lat_south}, {SACRED_VALLEY_AREA.lon_east}, {SACRED_VALLEY_AREA.lat_north},
] as const;

/** Cache-busting public URL: changes only when the mesh bytes change. */
export const SACRED_VALLEY_GLB_URL = "{glb_url}";

/** Metres of real ground per scene unit, for readouts that quote distances. */
export const METERS_PER_UNIT = {METERS_PER_UNIT:.0f};

/**
 * The Urubamba's course from Pisac down to Ollantaytambo, traced from the
 * elevation model by following the valley floor. Ordered downstream.
 */
export const URUBAMBA_PATH: readonly ScenePoint[] = [
{river_lines},
] as const;

/** Towns along the corridor, in the same scene units. */
export const VALLEY_PLACES = {{
{place_lines},
}} as const;

export type ValleyPlaceId = keyof typeof VALLEY_PLACES;

/**
 * The five sites the scroll stops at, in flight order.
 *
 * `elevation` is the published figure the landing copy quotes; the anchor's
 * own y is what the elevation model measured there, which differs by a few
 * tens of metres because one DEM pixel averages ~19 m of ground.
 *
 * `onTerrain` is false for Machu Picchu alone: it sits ~30 km beyond the
 * corridor mesh and ships as its own GLB, authored in these same units.
 */
export const SACRED_SITES = {{
{site_lines},
}} as const;

export type SacredSiteId = keyof typeof SACRED_SITES;

/**
 * The camera's tour of the five sites, solved against the elevation model.
 *
 * Every position here is guaranteed to stand in open air, and every station's
 * sight line to its subject is guaranteed to clear the ground by {SIGHT_CLEARANCE} units
 * ({SIGHT_CLEARANCE * METERS_PER_UNIT:.0f} m). That is not a detail: half these sites sit against a
 * slope, Moray is 5 km off the river and 600 m above it, and the run out to
 * Machu Picchu crosses a 4,000 m cordillera. Solving it here, where the DEM is
 * in hand, is what keeps the runtime from having to raycast the terrain.
 *
 * `FLIGHT_PATH` and `FLIGHT_AIM` are parallel: the camera rides one and looks
 * at the other, so crossing between two sites turns the head rather than cuts.
 */
export const FLIGHT_PATH: readonly ScenePoint[] = [
{path_lines},
] as const;

export const FLIGHT_AIM: readonly ScenePoint[] = [
{aim_lines},
] as const;

/** Where each site falls along the flight, as an index into FLIGHT_PATH. */
export const FLIGHT_STATIONS = [
{station_lines},
] as const;

/** Clearance the solver held, in scene units. */
export const SIGHT_CLEARANCE = {SIGHT_CLEARANCE};
'''
    )
    print(f"wrote {PLACE_OUT.relative_to(ROOT)} ({len(river)} path points)")


# --- Entry point ------------------------------------------------------------


def resolve_sites(projection: Projection, dem: np.ndarray) -> dict[str, dict]:
    """Place every site in scene space, measuring its height from the DEM."""
    resolved: dict[str, dict] = {}
    for name, site in SITES.items():
        x, z = projection.world(site["lat"], site["lon"])
        px, py = projection.pixel(site["lat"], site["lon"])
        on_terrain = (
            projection.px_west <= px < projection.px_east
            and projection.px_north <= py < projection.px_south
        )
        if on_terrain:
            elevation = float(dem[int(py), int(px)])
        else:
            # Outside the corridor mosaic — fetch the one tile it falls in.
            elevation = sample_elevation(site["lat"], site["lon"])
        resolved[name] = {
            **site,
            "position": (x, projection.height(elevation), z),
            "on_terrain": on_terrain,
            "measured": elevation,
        }
        edge = "" if on_terrain else "   (off-mesh, own GLB)"
        print(
            f"  {name:14s} ({x:8.2f}, {projection.height(elevation):6.2f}, {z:8.2f})"
            f"  DEM {elevation:5.0f} m / copy {site['elevation']} m{edge}"
        )
    return resolved


def main() -> None:
    places_only = "--places-only" in sys.argv

    dem_mosaic, dem_x0, dem_y0 = fetch_mosaic(
        DEM_URL, SACRED_VALLEY_AREA, DEM_ZOOM, "elevation"
    )
    dem = decode_terrarium(dem_mosaic)

    sea_level = float(dem.min())
    if abs(sea_level - SEA_LEVEL) > 0.5:
        raise RuntimeError(
            f"the elevation tiles now floor at {sea_level:.1f} m but "
            f"terrain_common.SEA_LEVEL says {SEA_LEVEL:.1f} m. Every mesh and "
            "every anchor measures height from that datum, so update the "
            "constant and rebuild all of them together."
        )

    projection = Projection(SACRED_VALLEY_AREA, dem_x0, dem_y0, DEM_ZOOM, sea_level)
    print(
        f"terrain {projection.width_units:.1f} x {projection.depth_units:.1f} units "
        f"({projection.width_units * METERS_PER_UNIT / 1000:.1f} x "
        f"{projection.depth_units * METERS_PER_UNIT / 1000:.1f} km), "
        f"elevation {dem.min():.0f}-{dem.max():.0f} m"
    )

    if not places_only:
        imagery, _, _ = fetch_mosaic(
            IMAGERY_URL, SACRED_VALLEY_AREA, IMAGERY_ZOOM, "imagery"
        )
        elevations = sample_grid(dem, projection, GRID_COLS, GRID_ROWS)
        positions, normals, uvs = build_mesh(
            elevations, projection, GRID_COLS, GRID_ROWS
        )
        chunks = split_primitives(positions, normals, uvs, GRID_COLS, GRID_ROWS)
        texture = bake_texture(
            imagery, SACRED_VALLEY_AREA, TEXTURE_WIDTH, TEXTURE_QUALITY
        )
        write_glb(
            GLB_OUT,
            chunks,
            texture,
            SACRED_VALLEY_AREA,
            name="sacred-valley-terrain",
            title="Sacred Valley of Cusco Terrain",
            hero_subject="terrain",
            # Stable across rebuilds: `sacred-valley-glb.test.ts` asserts the
            # shipped asset identifies itself by this name, and the extract
            # into terrain_common briefly renamed it.
            material_name="sacred-valley-surface",
        )
        compress_with_draco(GLB_OUT, DRACO_QUANTIZE)
    else:
        print("--places-only: skipping mesh, texture and Draco")

    river = trace_river(dem, projection)
    places = {}
    for name, (lat, lon) in PLACES.items():
        x, z = projection.world(lat, lon)
        px, py = projection.pixel(lat, lon)
        elevation = float(dem[int(py), int(px)])
        places[name] = (x, projection.height(elevation), z)
        print(
            f"  {name:15s} ({x:8.2f}, {projection.height(elevation):6.2f}, "
            f"{z:8.2f})  {elevation:.0f} m"
        )
    sites = resolve_sites(projection, dem)

    sampler = ElevationSampler(DEM_ZOOM)
    flight = solve_flight(sampler, projection, sites)
    path, _, stations = flight
    print(f"\nflight: {len(path)} camera samples over {len(stations)} stations")
    for station in stations:
        point = path[station["index"]]
        print(
            f"  {station['id']:14s} progress {station['progress']:.3f}  "
            f"camera ({point[0]:8.2f}, {point[1]:6.2f}, {point[2]:8.2f})"
        )

    write_place_module(projection, river, places, sites, flight)
    print(f"\n{ATTRIBUTION}")


if __name__ == "__main__":
    main()
