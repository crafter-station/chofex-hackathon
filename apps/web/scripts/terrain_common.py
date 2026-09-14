#!/usr/bin/env python3
"""Shared terrain machinery for the landing's real-elevation meshes.

Two builders sit on top of this module — `build-sacred-valley-glb.py` for the
Pisac->Ollantaytambo corridor and `build-machu-picchu-glb.py` for the citadel
30 km further downstream. They have to agree on one thing above all else: a
single scene space. Machu Picchu is authored as a separate GLB only because
the intervening gorge is 30 km of terrain the camera never sees, not because
it lives in its own coordinate system.

So the projection here is anchored on a fixed geographic ORIGIN rather than on
each mesh's own bounding box. A builder's vertices come out already offset to
where that region sits relative to the origin, which means both GLBs drop into
the scene at the identity transform and line up by construction. Nothing gets
positioned by hand, and nothing drifts when a bounding box is retuned.

Sources (both attribution-required, see public/models/README.md):
- Elevation: Mapzen Terrain Tiles (terrarium) via AWS Open Data. SRTM courtesy
  of the U.S. Geological Survey.
- Imagery: EOX Sentinel-2 cloudless 2016, CC BY 4.0.
"""

from __future__ import annotations

import io
import json
import math
import shutil
import struct
import subprocess
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

# --- Scene space ------------------------------------------------------------

# One world unit is 200 m on the ground. Height keeps a 2x exaggeration, which
# is the usual cinematic cheat: honest silhouette, readable relief from a
# camera flying the valley floor.
METERS_PER_UNIT = 200.0
HEIGHT_UNITS_PER_METER = 0.01

# The zoom every builder projects through. Baked into the origin below, since
# Mercator pixel coordinates are only meaningful alongside their zoom.
DEM_ZOOM = 13  # ~19 m per pixel at this latitude
IMAGERY_ZOOM = 14  # ~9 m per pixel

# Scene origin: the centre of the Sacred Valley corridor. Every terrain places
# its vertices relative to this point, so the valley stays centred on the world
# origin exactly as it was when it was the only mesh, and Machu Picchu lands
# ~265 units west of it without anyone typing that number anywhere.
ORIGIN_LON_WEST, ORIGIN_LON_EAST = -72.34, -71.77
ORIGIN_LAT_SOUTH, ORIGIN_LAT_NORTH = -13.50, -13.17

# Height datum, likewise shared rather than per-mesh: the floor of the Sacred
# Valley DEM mosaic. Machu Picchu has to measure its heights against this same
# number or the two meshes would each sit on their own floor and the citadel
# would float. The Urubamba gorge below Ollantaytambo drops well under it, so
# that terrain carries negative heights — which is correct, the river really
# does keep falling toward the Amazon.
#
# `build-sacred-valley-glb.py` re-measures this on every run and fails loudly
# if the tiles ever disagree with it.
SEA_LEVEL = 2654.0

DEM_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
IMAGERY_URL = (
    "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857"
    "/default/g/{z}/{y}/{x}.jpg"
)

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".terrain-cache"

ATTRIBUTION = (
    "Elevation: Mapzen Terrain Tiles via AWS Open Data, SRTM courtesy of the "
    "U.S. Geological Survey. Imagery: EOX Sentinel-2 cloudless 2016 "
    "(contains modified Copernicus Sentinel data 2016), CC BY 4.0."
)


@dataclass(frozen=True)
class Area:
    """A geographic window one GLB covers."""

    lon_west: float
    lon_east: float
    lat_south: float
    lat_north: float

    def tile_range(self, zoom: int) -> tuple[int, int, int, int]:
        west, north = mercator_xy(self.lat_north, self.lon_west, zoom)
        east, south = mercator_xy(self.lat_south, self.lon_east, zoom)
        return int(west), int(north), int(east), int(south)


SACRED_VALLEY_AREA = Area(
    lon_west=ORIGIN_LON_WEST,
    lon_east=ORIGIN_LON_EAST,
    lat_south=ORIGIN_LAT_SOUTH,
    lat_north=ORIGIN_LAT_NORTH,
)

# The corridor's own grid. Lives here rather than in its builder because the
# western terrain has to land on the same lattice — see `align_to_corridor`.
CORRIDOR_COLS = 1152
CORRIDOR_ROWS = 686


# --- Web Mercator -----------------------------------------------------------


def mercator_xy(lat: float, lon: float, zoom: int) -> tuple[float, float]:
    """Fractional tile coordinates, so callers can keep sub-pixel precision."""
    scale = 2**zoom
    x = (lon + 180.0) / 360.0 * scale
    radians = math.radians(lat)
    y = (
        (1.0 - math.log(math.tan(radians) + 1.0 / math.cos(radians)) / math.pi)
        / 2.0
        * scale
    )
    return x, y


def inverse_mercator(x: float, y: float, zoom: int) -> tuple[float, float]:
    """Fractional tile coordinates back to lat/lon."""
    scale = 2**zoom
    lon = x / scale * 360.0 - 180.0
    n = math.pi * (1.0 - 2.0 * y / scale)
    lat = math.degrees(math.atan(math.sinh(n)))
    return lat, lon


def meters_per_pixel(lat: float, zoom: int) -> float:
    """Ground resolution of one mosaic pixel, tiles being 256px square."""
    return 156543.03392 * math.cos(math.radians(lat)) / (2**zoom)


# One scalar for the whole scene, taken at the origin's latitude.
#
# Mercator scale grows with latitude, so a strictly correct build would use a
# different value per mesh. It would also make the two meshes disagree about
# how long a metre is and pull their shared coordinate frame apart. Machu
# Picchu sits 0.17 degrees north of the origin, where the true scale differs by
# 0.07% — about 9 m across that mesh, a third of one DEM pixel. Consistency is
# worth more than that.
SCENE_METERS_PER_PIXEL = meters_per_pixel(
    (ORIGIN_LAT_NORTH + ORIGIN_LAT_SOUTH) / 2.0, DEM_ZOOM
)


def corridor_lattice() -> tuple[float, float, float, float]:
    """The corridor's bounding box in absolute z13 mercator pixels."""
    west, north = mercator_xy(ORIGIN_LAT_NORTH, ORIGIN_LON_WEST, DEM_ZOOM)
    east, south = mercator_xy(ORIGIN_LAT_SOUTH, ORIGIN_LON_EAST, DEM_ZOOM)
    return west * 256.0, north * 256.0, east * 256.0, south * 256.0


def align_to_corridor(
    lon_west: float, lat_north: float, lat_south: float
) -> tuple[Area, int, int]:
    """Snap a western area onto the corridor's sampling lattice.

    Two meshes that merely share a bounding edge do not share a surface. Each
    resamples the elevation model on its own grid, so the heights either side
    of the seam come from different interpolations of the same data and the
    join opens into a hairline crack that runs the full height of the valley
    wall — worse than the gap it was meant to close, because a crack reads as a
    rendering fault rather than as distance.

    So this area is not described by the box someone wanted; it is described by
    the corridor's own lattice. Its eastern column is *the* corridor's western
    column, and its rows step at exactly the corridor's row spacing, offset by
    a whole number of rows. Every vertex they share is then the same bilinear
    sample of the same DEM at the same coordinate, and the seam is watertight
    by construction rather than by tolerance.

    Returns the snapped area together with the column and row counts that walk
    it, so the caller cannot accidentally re-derive them and break the lock.
    """
    px_west_c, py_north_c, px_east_c, py_south_c = corridor_lattice()
    step_x = (px_east_c - px_west_c) / (CORRIDOR_COLS - 1)
    step_y = (py_south_c - py_north_c) / (CORRIDOR_ROWS - 1)

    # East edge: exactly the corridor's west column.
    px_east = px_west_c
    px_west_wanted = mercator_xy(lat_north, lon_west, DEM_ZOOM)[0] * 256.0
    cols = int(round((px_east - px_west_wanted) / step_x)) + 1
    px_west = px_east - (cols - 1) * step_x

    # Rows: start on a corridor row, even where that row is north of the
    # corridor itself and only the lattice, not the mesh, extends there.
    py_north_wanted = mercator_xy(lat_north, lon_west, DEM_ZOOM)[1] * 256.0
    py_south_wanted = mercator_xy(lat_south, lon_west, DEM_ZOOM)[1] * 256.0
    py_north = py_north_c + math.floor((py_north_wanted - py_north_c) / step_y) * step_y
    rows = int(round((py_south_wanted - py_north) / step_y)) + 1
    py_south = py_north + (rows - 1) * step_y

    lat_north_snapped, lon_west_snapped = inverse_mercator(
        px_west / 256.0, py_north / 256.0, DEM_ZOOM
    )
    lat_south_snapped, lon_east_snapped = inverse_mercator(
        px_east / 256.0, py_south / 256.0, DEM_ZOOM
    )
    return (
        Area(
            lon_west=lon_west_snapped,
            lon_east=lon_east_snapped,
            lat_south=lat_south_snapped,
            lat_north=lat_north_snapped,
        ),
        cols,
        rows,
    )


# --- Tile fetching ----------------------------------------------------------


def fetch_tile(url: str) -> Image.Image:
    """Fetch one tile, caching it so reruns cost the tile servers nothing."""
    cached = CACHE / url.split("/wmts/1.0.0/")[-1].replace("/", "_").replace(
        "https:__", ""
    ).replace("s3.amazonaws.com_elevation-tiles-prod_", "")
    if cached.exists():
        return Image.open(io.BytesIO(cached.read_bytes()))

    request = urllib.request.Request(
        url, headers={"User-Agent": "Hack-the-Andes-terrain-builder/1.0"}
    )
    last: Exception | None = None
    for _ in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = response.read()
            cached.parent.mkdir(parents=True, exist_ok=True)
            cached.write_bytes(payload)
            return Image.open(io.BytesIO(payload))
        except Exception as error:  # noqa: BLE001 - retried, then re-raised
            last = error
    raise RuntimeError(f"could not fetch {url}: {last}")


def fetch_mosaic(
    url_template: str, area: Area, zoom: int, label: str
) -> tuple[Image.Image, int, int]:
    x0, y0, x1, y1 = area.tile_range(zoom)
    cols, rows = x1 - x0 + 1, y1 - y0 + 1
    print(f"{label}: z{zoom} {cols}x{rows} tiles ({cols * 256}x{rows * 256}px)")

    mosaic = Image.new("RGB", (cols * 256, rows * 256))

    def job(coords: tuple[int, int]) -> tuple[int, int, Image.Image]:
        x, y = coords
        tile = fetch_tile(url_template.format(z=zoom, x=x, y=y)).convert("RGB")
        return x, y, tile

    coords = [(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1)]
    blank = 0
    # Tile servers here are free community infrastructure, so stay gentle.
    with ThreadPoolExecutor(max_workers=4) as pool:
        for x, y, tile in pool.map(job, coords):
            if tile.getextrema() == ((255, 255), (255, 255), (255, 255)):
                blank += 1
            mosaic.paste(tile, ((x - x0) * 256, (y - y0) * 256))

    if blank:
        raise RuntimeError(
            f"{label}: {blank}/{len(coords)} tiles came back blank. "
            "The layer is probably not served at this zoom."
        )

    return mosaic, x0, y0


def decode_terrarium(mosaic: Image.Image) -> np.ndarray:
    pixels = np.asarray(mosaic, dtype=np.float64)
    return pixels[:, :, 0] * 256.0 + pixels[:, :, 1] + pixels[:, :, 2] / 256.0 - 32768.0


class ElevationSampler:
    """Bilinear ground height anywhere on Earth, one tile at a time.

    The mosaics each builder loads cover only their own bounding box, but the
    camera solver has to sample terrain wherever it likes — including the
    30 km of gorge between the corridor and Machu Picchu, which no mesh covers.
    This keeps decoded tiles in memory and pulls new ones through the on-disk
    cache as they are asked for.
    """

    def __init__(self, zoom: int = DEM_ZOOM):
        self.zoom = zoom
        self._tiles: dict[tuple[int, int], np.ndarray] = {}

    def _tile(self, tx: int, ty: int) -> np.ndarray:
        cached = self._tiles.get((tx, ty))
        if cached is None:
            image = fetch_tile(DEM_URL.format(z=self.zoom, x=tx, y=ty))
            cached = decode_terrarium(image.convert("RGB"))
            self._tiles[(tx, ty)] = cached
        return cached

    def _pixel(self, px: float, py: float) -> float:
        tx, ty = int(px // 256), int(py // 256)
        tile = self._tile(tx, ty)
        return float(tile[int(py) - ty * 256, int(px) - tx * 256])

    def at(self, lat: float, lon: float) -> float:
        x, y = mercator_xy(lat, lon, self.zoom)
        px, py = x * 256.0, y * 256.0
        x0, y0 = math.floor(px), math.floor(py)
        fx, fy = px - x0, py - y0
        top = self._pixel(x0, y0) * (1 - fx) + self._pixel(x0 + 1, y0) * fx
        bottom = self._pixel(x0, y0 + 1) * (1 - fx) + self._pixel(x0 + 1, y0 + 1) * fx
        return top * (1 - fy) + bottom * fy

    def height_at(self, projection: "Projection", x: float, z: float) -> float:
        """Scene-space height of the ground under a scene-space point."""
        return projection.height(self.at(*projection.geo_from_world(x, z)))


class ImagerySampler:
    """Average satellite colour around a point, one tile at a time.

    Structure added to the landscape has to be coloured from the drape it sits
    in, not from a guess. Get that wrong and the geometry reads as a sticker —
    the same failure, from the other side, as a photogrammetric asset carrying
    its own baked sun into a lit scene.
    """

    def __init__(self, zoom: int = IMAGERY_ZOOM):
        self.zoom = zoom
        self._tiles: dict[tuple[int, int], np.ndarray] = {}

    def _tile(self, tx: int, ty: int) -> np.ndarray:
        cached = self._tiles.get((tx, ty))
        if cached is None:
            image = fetch_tile(IMAGERY_URL.format(z=self.zoom, y=ty, x=tx))
            cached = np.asarray(image.convert("RGB"), dtype=np.float64)
            self._tiles[(tx, ty)] = cached
        return cached

    def at(
        self, lat: float, lon: float, radius_px: int = 40, percentile: float = 75
    ) -> tuple[float, float, float]:
        """Unshadowed local albedo, as linear RGB ready for a vertex colour.

        A percentile of a wide neighbourhood, not the mean of a small one. Half
        of any Andean hillside is in shadow in the satellite image, so a mean
        picks up light the sun has already been subtracted from — and geometry
        given that as its albedo gets shadowed twice, once in the source and
        again by the scene's own sun. The bright end of the neighbourhood is a
        far better estimate of what the ground actually reflects.
        """
        x, y = mercator_xy(lat, lon, self.zoom)
        tx, ty = int(x), int(y)
        tile = self._tile(tx, ty)
        px = int((x - tx) * 256.0)
        py = int((y - ty) * 256.0)
        lo_x, hi_x = max(0, px - radius_px), min(256, px + radius_px + 1)
        lo_y, hi_y = max(0, py - radius_px), min(256, py + radius_px + 1)
        patch = tile[lo_y:hi_y, lo_x:hi_x].reshape(-1, 3) / 255.0
        bright = np.percentile(patch, percentile, axis=0)
        # sRGB to linear: three.js works in linear and a texture-free vertex
        # colour is handed straight to the shader.
        linear = bright**2.2
        return float(linear[0]), float(linear[1]), float(linear[2])


def sample_elevation(lat: float, lon: float, zoom: int = DEM_ZOOM) -> float:
    """Ground height at one point, from the single tile that contains it.

    Site anchors need a measured height, and one of them — Machu Picchu — sits
    outside the Sacred Valley mosaic. Fetching its one tile is far cheaper than
    widening a mosaic just to read a pixel out of it.
    """
    return ElevationSampler(zoom).at(lat, lon)


# --- Projection into scene space -------------------------------------------


class Projection:
    """Maps lat/lon to the shared scene space, via one mesh's tile mosaic.

    `tile_x0`/`tile_y0` locate the mosaic this instance reads pixels from; the
    scene coordinates it returns are anchored on the module-level ORIGIN, not
    on that mosaic. Two projections over different areas therefore agree on
    where any given lat/lon lands.
    """

    def __init__(
        self,
        area: Area,
        tile_x0: int,
        tile_y0: int,
        zoom: int,
        sea_level: float = SEA_LEVEL,
    ):
        self.area = area
        self.tile_x0 = tile_x0
        self.tile_y0 = tile_y0
        self.zoom = zoom
        self.sea_level = sea_level
        # Pixels at this mosaic's zoom, scaled from the canonical DEM zoom.
        self.meters_per_pixel = SCENE_METERS_PER_PIXEL * (2 ** (DEM_ZOOM - zoom))

        west, north = mercator_xy(area.lat_north, area.lon_west, zoom)
        east, south = mercator_xy(area.lat_south, area.lon_east, zoom)
        self.px_west = (west - tile_x0) * 256.0
        self.px_north = (north - tile_y0) * 256.0
        self.px_east = (east - tile_x0) * 256.0
        self.px_south = (south - tile_y0) * 256.0

        # The origin, in this mosaic's pixel frame. Mercator x is linear in
        # longitude but y is not, so the vertical anchor is the midpoint of the
        # projected edges rather than the midpoint of the latitudes.
        origin_west, origin_north = mercator_xy(
            ORIGIN_LAT_NORTH, ORIGIN_LON_WEST, zoom
        )
        origin_east, origin_south = mercator_xy(
            ORIGIN_LAT_SOUTH, ORIGIN_LON_EAST, zoom
        )
        self.px_origin_x = ((origin_west + origin_east) / 2.0 - tile_x0) * 256.0
        self.px_origin_y = ((origin_north + origin_south) / 2.0 - tile_y0) * 256.0

        self.width_units = (
            (self.px_east - self.px_west) * self.meters_per_pixel / METERS_PER_UNIT
        )
        self.depth_units = (
            (self.px_south - self.px_north) * self.meters_per_pixel / METERS_PER_UNIT
        )

    def pixel(self, lat: float, lon: float) -> tuple[float, float]:
        x, y = mercator_xy(lat, lon, self.zoom)
        return (x - self.tile_x0) * 256.0, (y - self.tile_y0) * 256.0

    def world_from_pixel(self, px: float, py: float) -> tuple[float, float]:
        return (
            (px - self.px_origin_x) * self.meters_per_pixel / METERS_PER_UNIT,
            (py - self.px_origin_y) * self.meters_per_pixel / METERS_PER_UNIT,
        )

    def world(self, lat: float, lon: float) -> tuple[float, float]:
        return self.world_from_pixel(*self.pixel(lat, lon))

    def geo_from_world(self, x: float, z: float) -> tuple[float, float]:
        """Scene coordinates back to lat/lon, for sampling terrain under a ray."""
        px = x * METERS_PER_UNIT / self.meters_per_pixel + self.px_origin_x
        py = z * METERS_PER_UNIT / self.meters_per_pixel + self.px_origin_y
        return inverse_mercator(
            px / 256.0 + self.tile_x0, py / 256.0 + self.tile_y0, self.zoom
        )

    def height(self, elevation: float) -> float:
        return (elevation - self.sea_level) * HEIGHT_UNITS_PER_METER

    def bounds(self) -> tuple[float, float, float, float]:
        """Scene-space extent as (x_min, z_min, x_max, z_max)."""
        x_min, z_min = self.world_from_pixel(self.px_west, self.px_north)
        x_max, z_max = self.world_from_pixel(self.px_east, self.px_south)
        return x_min, z_min, x_max, z_max


# --- Mesh -------------------------------------------------------------------


def sample_grid(
    dem: np.ndarray, projection: Projection, cols: int, rows: int
) -> np.ndarray:
    """Bilinear resample of the DEM onto the mesh grid."""
    xs = np.linspace(projection.px_west, projection.px_east, cols)
    ys = np.linspace(projection.px_north, projection.px_south, rows)
    grid_x, grid_y = np.meshgrid(xs, ys)

    x0 = np.clip(np.floor(grid_x).astype(int), 0, dem.shape[1] - 2)
    y0 = np.clip(np.floor(grid_y).astype(int), 0, dem.shape[0] - 2)
    fx = grid_x - x0
    fy = grid_y - y0

    top = dem[y0, x0] * (1 - fx) + dem[y0, x0 + 1] * fx
    bottom = dem[y0 + 1, x0] * (1 - fx) + dem[y0 + 1, x0 + 1] * fx
    return top * (1 - fy) + bottom * fy


def build_mesh(
    elevations: np.ndarray, projection: Projection, cols: int, rows: int
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Positions, normals and UVs for one terrain grid, in scene space."""
    u = np.linspace(0.0, 1.0, cols)
    v = np.linspace(0.0, 1.0, rows)
    grid_u, grid_v = np.meshgrid(u, v)

    x_min, z_min, x_max, z_max = projection.bounds()
    x = x_min + grid_u * (x_max - x_min)
    z = z_min + grid_v * (z_max - z_min)
    y = (elevations - projection.sea_level) * HEIGHT_UNITS_PER_METER

    positions = np.stack([x, y, z], axis=-1).reshape(-1, 3).astype(np.float32)
    uvs = np.stack([grid_u, grid_v], axis=-1).reshape(-1, 2).astype(np.float32)

    # Smooth normals from central differences on the height field.
    step_x = (x_max - x_min) / (cols - 1)
    step_z = (z_max - z_min) / (rows - 1)
    dy_dz, dy_dx = np.gradient(y, step_z, step_x)
    normals = np.stack([-dy_dx, np.ones_like(y), -dy_dz], axis=-1)
    normals /= np.linalg.norm(normals, axis=-1, keepdims=True)
    normals = normals.reshape(-1, 3).astype(np.float32)

    return positions, normals, uvs


def split_primitives(
    positions: np.ndarray,
    normals: np.ndarray,
    uvs: np.ndarray,
    cols: int,
    rows: int,
) -> list[dict]:
    """Chunk into u16-indexable pieces.

    Indices dominate the byte budget on a grid this size, and uint16 halves
    them. That needs every primitive to stay under 65536 vertices, so the grid
    is cut into row bands that each re-index locally.
    """
    max_rows = max(2, 65535 // cols)
    chunks: list[dict] = []
    start = 0
    while start < rows - 1:
        end = min(start + max_rows - 1, rows - 1)
        lo = start * cols
        hi = (end + 1) * cols
        local_rows = end - start + 1

        row_index, col_index = np.meshgrid(
            np.arange(local_rows - 1), np.arange(cols - 1), indexing="ij"
        )
        top_left = (row_index * cols + col_index).ravel()
        top_right = top_left + 1
        bottom_left = top_left + cols
        bottom_right = bottom_left + 1
        local_indices = np.stack(
            [top_left, bottom_left, bottom_right, top_left, bottom_right, top_right],
            axis=-1,
        ).ravel()

        chunks.append(
            {
                "positions": positions[lo:hi],
                "normals": normals[lo:hi],
                "uvs": uvs[lo:hi],
                "indices": local_indices.astype(np.uint16),
            }
        )
        start = end
    return chunks


# --- GLB assembly -----------------------------------------------------------


def align4(blob: bytes, pad: bytes = b"\x00") -> bytes:
    return blob + pad * ((4 - len(blob) % 4) % 4)


def write_glb(
    out: Path,
    chunks: list[dict],
    texture: bytes,
    area: Area,
    name: str,
    title: str,
    hero_subject: str,
    material_name: str,
) -> None:
    binary = bytearray()
    views: list[dict] = []
    accessors: list[dict] = []

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

    primitives = []
    for chunk in chunks:
        position_view = add_view(chunk["positions"].tobytes(), 34962)
        normal_view = add_view(chunk["normals"].tobytes(), 34962)
        uv_view = add_view(chunk["uvs"].tobytes(), 34962)
        index_view = add_view(chunk["indices"].tobytes(), 34963)
        count = len(chunk["positions"])

        base = len(accessors)
        accessors.append(
            {
                "bufferView": position_view,
                "componentType": 5126,
                "count": count,
                "type": "VEC3",
                "min": chunk["positions"].min(axis=0).tolist(),
                "max": chunk["positions"].max(axis=0).tolist(),
            }
        )
        accessors.append(
            {
                "bufferView": normal_view,
                "componentType": 5126,
                "count": count,
                "type": "VEC3",
            }
        )
        accessors.append(
            {
                "bufferView": uv_view,
                "componentType": 5126,
                "count": count,
                "type": "VEC2",
            }
        )
        accessors.append(
            {
                "bufferView": index_view,
                "componentType": 5123,
                "count": len(chunk["indices"]),
                "type": "SCALAR",
            }
        )
        primitives.append(
            {
                "attributes": {
                    "POSITION": base,
                    "NORMAL": base + 1,
                    "TEXCOORD_0": base + 2,
                },
                "indices": base + 3,
                "material": 0,
                "mode": 4,
            }
        )

    image_view = add_view(texture, None)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "chofex-hackathon/terrain_common",
            "extras": {
                "title": title,
                "heroSubject": hero_subject,
                "bbox": [area.lon_west, area.lat_south, area.lon_east, area.lat_north],
                "metersPerUnit": METERS_PER_UNIT,
                "heightUnitsPerMeter": HEIGHT_UNITS_PER_METER,
                "attribution": ATTRIBUTION,
            },
        },
        "scene": 0,
        "scenes": [{"name": name, "nodes": [0], "extras": {"heroSubject": hero_subject}}],
        "nodes": [{"name": name, "mesh": 0, "extras": {"heroSubject": hero_subject}}],
        "meshes": [{"name": name, "primitives": primitives}],
        "materials": [
            {
                "name": material_name,
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": 0},
                    "baseColorFactor": [1, 1, 1, 1],
                    "metallicFactor": 0.0,
                    "roughnessFactor": 0.92,
                },
            }
        ],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": image_view, "mimeType": "image/jpeg"}],
        "samplers": [
            {"magFilter": 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071}
        ],
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": len(binary)}],
    }

    json_blob = align4(json.dumps(gltf, separators=(",", ":")).encode(), b" ")
    binary_blob = align4(bytes(binary))
    total = 12 + 8 + len(json_blob) + 8 + len(binary_blob)
    payload = struct.pack("<III", 0x46546C67, 2, total)
    payload += struct.pack("<II", len(json_blob), 0x4E4F534A) + json_blob
    payload += struct.pack("<II", len(binary_blob), 0x004E4942) + binary_blob

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(payload)
    vertices = sum(len(chunk["positions"]) for chunk in chunks)
    print(
        f"wrote {out.relative_to(ROOT)} "
        f"({out.stat().st_size:,} bytes, {vertices:,} vertices, "
        f"{len(chunks)} primitives)"
    )


def bake_texture(
    imagery: Image.Image, area: Area, width: int, quality: int
) -> bytes:
    """Crop the imagery mosaic to the area and encode it as the drape."""
    projection = Projection(area, *area.tile_range(IMAGERY_ZOOM)[:2], IMAGERY_ZOOM)
    crop = imagery.crop(
        (
            int(projection.px_west),
            int(projection.px_north),
            int(projection.px_east),
            int(projection.px_south),
        )
    )
    height = max(1, round(width * crop.height / crop.width))
    crop = crop.resize((width, height), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    crop.save(buffer, format="JPEG", quality=quality, optimize=True)
    texture = buffer.getvalue()
    print(f"texture {width}x{height} jpeg ({len(texture):,} bytes)")
    return texture


def versioned_url(path: Path, public: str) -> str:
    """Public URL for a model, stamped with a hash of its bytes.

    The models keep stable filenames across rebuilds, which is what a browser
    needs in order to serve a stale one forever — and that is not a dev-only
    annoyance now that three meshes have to agree with each other. A cached
    corridor beside a freshly built western terrain is a visible seam, and a
    cached structures file beside re-measured sites is geometry in the wrong
    place. Stamping the content hash makes the URL change exactly when the
    bytes do, so a rebuild invalidates itself and nothing else.
    """
    import hashlib

    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    return f"{public}?v={digest}"


def compress_with_draco(out: Path, quantize: dict[str, int]) -> None:
    """Run the written GLB back through gltf-transform's Draco encoder.

    Quantising over the whole scene rather than per mesh matters here: the
    terrain ships as several primitives that share vertices along their seams,
    and per-mesh bounds would round those seams differently and crack the
    surface open.
    """
    runner = shutil.which("bunx") or shutil.which("npx")
    if runner is None:
        raise RuntimeError(
            "need bunx or npx on PATH to Draco-compress the terrain; "
            "the uncompressed mesh is far too large to ship"
        )

    before = out.stat().st_size
    command = [
        runner,
        "@gltf-transform/cli@4",
        "draco",
        str(out),
        str(out),
        "--quantize-position",
        str(quantize["position"]),
        "--quantize-normal",
        str(quantize["normal"]),
        "--quantize-texcoord",
        str(quantize["texcoord"]),
        "--quantization-volume",
        "scene",
    ]
    subprocess.run(command, check=True, capture_output=True)
    after = out.stat().st_size
    print(
        f"draco {before / 1048576:.2f} MB -> {after / 1048576:.2f} MB "
        f"({before / after:.1f}x)"
    )
