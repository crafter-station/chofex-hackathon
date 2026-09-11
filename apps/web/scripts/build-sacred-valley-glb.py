#!/usr/bin/env python3
"""Build a web ready Sacred Valley terrain GLB from public elevation data."""

from __future__ import annotations

import io
import json
import math
import struct
import urllib.request
from pathlib import Path

from PIL import Image

ZOOM = 11
TILE_X = 613
TILE_Y = 1100
SOURCE_URL = (
    "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"
    f"{ZOOM}/{TILE_X}/{TILE_Y}.png"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "models" / "sacred-valley.glb"
GRID_SIZE = 112
WORLD_SIZE = 104.0
HEIGHT_SCALE = 0.014


def align4(blob: bytes, pad_byte: bytes = b"\x00") -> bytes:
    pad = (4 - len(blob) % 4) % 4
    return blob + pad_byte * pad


def fetch_heights() -> list[list[float]]:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "Hack-the-Andes-terrain-builder/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        image = Image.open(io.BytesIO(response.read())).convert("RGB")
    image = image.resize((GRID_SIZE, GRID_SIZE), Image.Resampling.LANCZOS)

    heights: list[list[float]] = []
    for row in range(GRID_SIZE):
        line: list[float] = []
        for col in range(GRID_SIZE):
            red, green, blue = image.getpixel((col, row))
            line.append(red * 256 + green + blue / 256 - 32768)
        heights.append(line)
    return heights


def terrain_color(elevation: float, low: float, high: float) -> tuple[float, ...]:
    span = max(1.0, high - low)
    height = (elevation - low) / span
    stops = (
        (0.00, (0.18, 0.32, 0.23, 1.0)),
        (0.28, (0.33, 0.47, 0.25, 1.0)),
        (0.52, (0.47, 0.46, 0.29, 1.0)),
        (0.75, (0.48, 0.43, 0.37, 1.0)),
        (1.00, (0.72, 0.72, 0.68, 1.0)),
    )
    for index in range(len(stops) - 1):
        start_at, start = stops[index]
        end_at, end = stops[index + 1]
        if height > end_at:
            continue
        amount = (height - start_at) / (end_at - start_at)
        return tuple(start[channel] + (end[channel] - start[channel]) * amount for channel in range(4))
    return stops[-1][1]


def normal(a: tuple[float, ...], b: tuple[float, ...], c: tuple[float, ...]) -> tuple[float, ...]:
    ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
    value = (
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
    )
    length = math.sqrt(sum(component * component for component in value)) or 1.0
    return tuple(component / length for component in value)


def build_mesh(heights: list[list[float]]) -> tuple[list[float], list[float], list[float]]:
    flat_heights = [height for row in heights for height in row]
    low = min(flat_heights)
    high = max(flat_heights)
    base = low + (high - low) * 0.04
    positions: list[float] = []
    normals: list[float] = []
    colors: list[float] = []

    def point(row: int, col: int) -> tuple[float, float, float]:
        x = (col / (GRID_SIZE - 1) - 0.5) * WORLD_SIZE
        z = (row / (GRID_SIZE - 1) - 0.5) * WORLD_SIZE
        y = max(0.0, heights[row][col] - base) * HEIGHT_SCALE - 5.5
        return (x, y, z)

    def add_triangle(vertices: tuple[tuple[float, ...], ...], samples: tuple[float, ...]) -> None:
        face_normal = normal(vertices[0], vertices[1], vertices[2])
        for vertex, elevation in zip(vertices, samples):
            positions.extend(vertex)
            normals.extend(face_normal)
            colors.extend(terrain_color(elevation, low, high))

    for row in range(GRID_SIZE - 1):
        for col in range(GRID_SIZE - 1):
            a = point(row, col)
            b = point(row, col + 1)
            c = point(row + 1, col + 1)
            d = point(row + 1, col)
            add_triangle((a, d, c), (heights[row][col], heights[row + 1][col], heights[row + 1][col + 1]))
            add_triangle((a, c, b), (heights[row][col], heights[row + 1][col + 1], heights[row][col + 1]))

    return positions, normals, colors


def write_glb() -> None:
    positions, normals, colors = build_mesh(fetch_heights())
    count = len(positions) // 3
    blobs = (
        struct.pack(f"<{len(positions)}f", *positions),
        struct.pack(f"<{len(normals)}f", *normals),
        struct.pack(f"<{len(colors)}f", *colors),
    )
    binary = bytearray()
    views = []
    for blob in blobs:
        offset = len(binary)
        binary.extend(align4(blob))
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(blob), "target": 34962})

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "chofex-hackathon/build-sacred-valley-glb",
            "extras": {
                "title": "Sacred Valley of Cusco Terrain",
                "heroSubject": "terrain",
                "source": SOURCE_URL,
                "attribution": "Terrain Tiles via AWS Open Data; SRTM data courtesy of the U.S. Geological Survey",
            },
        },
        "scene": 0,
        "scenes": [{"name": "SacredValley", "nodes": [0], "extras": {"heroSubject": "terrain"}}],
        "nodes": [{"name": "sacred-valley-terrain", "mesh": 0, "extras": {"heroSubject": "terrain"}}],
        "meshes": [{"name": "sacred-valley-terrain", "primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1, "COLOR_0": 2}, "material": 0, "mode": 4}]}],
        "materials": [{"name": "sacred-valley-earth", "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0.0, "roughnessFactor": 0.76}}],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": count, "type": "VEC3", "min": [min(positions[0::3]), min(positions[1::3]), min(positions[2::3])], "max": [max(positions[0::3]), max(positions[1::3]), max(positions[2::3])]},
            {"bufferView": 1, "componentType": 5126, "count": count, "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": count, "type": "VEC4"},
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
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(payload)
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes, {count:,} vertices)")


if __name__ == "__main__":
    write_glb()
