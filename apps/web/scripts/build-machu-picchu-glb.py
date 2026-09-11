#!/usr/bin/env python3
"""Author a loader-safe Machu Picchu citadel GLB for the landing hero."""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "models" / "machu-picchu.glb"

STONE = [0.93, 0.95, 0.98, 1.0]
STONE_DEEP = [0.78, 0.82, 0.88, 1.0]
RIDGE = [0.74, 0.78, 0.85, 1.0]
GRASS = [0.48, 0.62, 0.38, 1.0]
PEAK = [0.86, 0.89, 0.94, 1.0]


class MeshBuilder:
    def __init__(self) -> None:
        self.positions: list[float] = []
        self.normals: list[float] = []
        self.indices: list[int] = []

    def add_triangle(
        self,
        a: tuple[float, float, float],
        b: tuple[float, float, float],
        c: tuple[float, float, float],
    ) -> None:
        ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
        nx = ab[1] * ac[2] - ab[2] * ac[1]
        ny = ab[2] * ac[0] - ab[0] * ac[2]
        nz = ab[0] * ac[1] - ab[1] * ac[0]
        length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
        normal = (nx / length, ny / length, nz / length)
        base = len(self.positions) // 3
        for point in (a, b, c):
            self.positions.extend(point)
            self.normals.extend(normal)
        self.indices.extend((base, base + 1, base + 2))

    def add_quad(
        self,
        a: tuple[float, float, float],
        b: tuple[float, float, float],
        c: tuple[float, float, float],
        d: tuple[float, float, float],
    ) -> None:
        self.add_triangle(a, b, c)
        self.add_triangle(a, c, d)

    def add_box(
        self,
        cx: float,
        cy: float,
        cz: float,
        sx: float,
        sy: float,
        sz: float,
        taper: float = 1.0,
    ) -> None:
        hx, hy, hz = sx / 2, sy / 2, sz / 2
        top = taper
        corners = [
            (cx - hx, cy - hy, cz - hz),
            (cx + hx, cy - hy, cz - hz),
            (cx + hx, cy - hy, cz + hz),
            (cx - hx, cy - hy, cz + hz),
            (cx - hx * top, cy + hy, cz - hz * top),
            (cx + hx * top, cy + hy, cz - hz * top),
            (cx + hx * top, cy + hy, cz + hz * top),
            (cx - hx * top, cy + hy, cz + hz * top),
        ]
        faces = (
            (0, 1, 2, 3),
            (7, 6, 5, 4),
            (4, 5, 1, 0),
            (6, 7, 3, 2),
            (5, 6, 2, 1),
            (7, 4, 0, 3),
        )
        for a, b, c, d in faces:
            self.add_quad(corners[a], corners[b], corners[c], corners[d])

    def add_cone(
        self,
        cx: float,
        cy: float,
        cz: float,
        radius: float,
        height: float,
        segments: int,
    ) -> None:
        tip = (cx, cy + height, cz)
        ring: list[tuple[float, float, float]] = []
        for index in range(segments):
            angle = (index / segments) * math.tau
            ring.append(
                (
                    cx + math.cos(angle) * radius,
                    cy,
                    cz + math.sin(angle) * radius,
                )
            )
        for index, point in enumerate(ring):
            self.add_triangle(point, ring[(index + 1) % segments], tip)
        center = (cx, cy, cz)
        for index, point in enumerate(ring):
            self.add_triangle(center, ring[(index + 1) % segments], point)


def ridge_height(x: float, z: float) -> float:
    huayna = max(0.0, 1.0 - math.hypot(x - 3.2, z + 24.0) / 16.0) ** 1.45 * 28.0
    saddle = math.exp(-(((x - 1.4) / 18.0) ** 2)) * math.exp(
        -(((z + 4.0) / 14.0) ** 2)
    )
    ridge = saddle * 11.5
    valley = max(0.0, z - 8.0) * 0.22 + max(0.0, x - 18.0) * 0.16
    plaza = math.hypot(x - 6.0, z - 8.5)
    height = 1.8 + ridge + huayna - valley
    if plaza < 13.0:
        height = height * 0.18
    return max(0.12, height)


def build_terrain() -> MeshBuilder:
    mesh = MeshBuilder()
    size = 86.0
    segments = 56
    step = size / segments
    origin = -size / 2
    grid: list[list[tuple[float, float, float]]] = []
    for row in range(segments + 1):
        line: list[tuple[float, float, float]] = []
        z = origin + row * step
        for col in range(segments + 1):
            x = origin + col * step
            line.append((x, ridge_height(x, z), z))
        grid.append(line)
    for row in range(segments):
        for col in range(segments):
            a = grid[row][col]
            b = grid[row][col + 1]
            c = grid[row + 1][col + 1]
            d = grid[row + 1][col]
            mesh.add_quad(a, b, c, d)
    return mesh


def build_citadel() -> tuple[MeshBuilder, MeshBuilder, MeshBuilder, MeshBuilder]:
    stone = MeshBuilder()
    deep = MeshBuilder()
    grass = MeshBuilder()

    for row in range(7):
        for col in range(9):
            if (row + col) % 6 == 0:
                continue
            height = 1.35 + ((row * 3 + col) % 5) * 0.42
            x = -7.2 + col * 2.05
            z = -10.4 + row * 1.72
            y = ridge_height(x, z) + height / 2
            stone.add_box(x, y, z, 1.55, height, 1.28, taper=0.86)
            deep.add_box(x, y - height * 0.08, z + 0.52, 0.42, height * 0.42, 0.16)

    temples = (
        (-1.6, 4.6, -12.2, 4.2, 5.1, 3.1),
        (3.8, 3.8, -8.6, 3.2, 3.8, 2.6),
        (7.4, 3.1, -11.0, 2.4, 2.8, 2.2),
        (-4.8, 3.4, -7.4, 2.8, 3.2, 2.2),
    )
    for cx, cy, cz, sx, sy, sz in temples:
        ground = ridge_height(cx, cz)
        stone.add_box(cx, ground + sy / 2, cz, sx, sy, sz, taper=0.9)
        deep.add_box(cx, ground + sy * 0.38, cz + sz * 0.42, 0.7, sy * 0.5, 0.22)

    for index in range(8):
        width = 20.0 - index * 1.35
        x = 11.5 + index * 1.55
        z = -3.2 - index * 1.05
        y = 0.28 + index * 0.55
        stone.add_box(x, y, z, width, 0.42, 2.15)
        grass.add_box(x, y + 0.24, z, width * 0.92, 0.12, 1.55)

    stone.add_box(6.0, 0.08, 8.6, 28.0, 0.16, 22.0)
    grass.add_box(-8.0, 0.18, 14.0, 16.0, 0.1, 10.0)

    peak = MeshBuilder()
    peak.add_cone(3.2, 8.0, -24.0, 11.5, 26.0, 8)
    peak.add_box(1.4, 18.5, -21.5, 4.8, 6.2, 3.6, taper=0.7)
    return stone, deep, grass, peak


def accessor_bounds(values: list[float], stride: int) -> tuple[list[float], list[float]]:
    mins = [min(values[index::stride]) for index in range(stride)]
    maxs = [max(values[index::stride]) for index in range(stride)]
    return mins, maxs


def align4(blob: bytes, pad_byte: bytes = b"\x00") -> bytes:
    pad = (4 - (len(blob) % 4)) % 4
    return blob + (pad_byte * pad)


def pack_mesh(
    mesh: MeshBuilder,
    name: str,
    material: int,
    bin_blob: bytearray,
    buffer_views: list[dict],
    accessors: list[dict],
    meshes: list[dict],
) -> None:
    pos_bytes = struct.pack(f"<{len(mesh.positions)}f", *mesh.positions)
    nrm_bytes = struct.pack(f"<{len(mesh.normals)}f", *mesh.normals)
    idx_bytes = struct.pack(f"<{len(mesh.indices)}I", *mesh.indices)

    def push(data: bytes, target: int) -> int:
        offset = len(bin_blob)
        bin_blob.extend(align4(data))
        buffer_views.append(
            {
                "buffer": 0,
                "byteOffset": offset,
                "byteLength": len(data),
                "target": target,
            }
        )
        return len(buffer_views) - 1

    pos_view = push(pos_bytes, 34962)
    nrm_view = push(nrm_bytes, 34962)
    idx_view = push(idx_bytes, 34963)

    pos_min, pos_max = accessor_bounds(mesh.positions, 3)
    accessors.extend(
        (
            {
                "bufferView": pos_view,
                "componentType": 5126,
                "count": len(mesh.positions) // 3,
                "type": "VEC3",
                "min": pos_min,
                "max": pos_max,
            },
            {
                "bufferView": nrm_view,
                "componentType": 5126,
                "count": len(mesh.normals) // 3,
                "type": "VEC3",
            },
            {
                "bufferView": idx_view,
                "componentType": 5125,
                "count": len(mesh.indices),
                "type": "SCALAR",
            },
        )
    )
    base = len(accessors) - 3
    meshes.append(
        {
            "name": name,
            "primitives": [
                {
                    "attributes": {"POSITION": base, "NORMAL": base + 1},
                    "indices": base + 2,
                    "material": material,
                    "mode": 4,
                }
            ],
        }
    )


def write_glb() -> None:
    terrain = build_terrain()
    stone, deep, grass, peak = build_citadel()

    materials = [
        {
            "name": "citadel-stone",
            "pbrMetallicRoughness": {
                "baseColorFactor": STONE,
                "metallicFactor": 0.02,
                "roughnessFactor": 0.46,
            },
        },
        {
            "name": "citadel-stone-deep",
            "pbrMetallicRoughness": {
                "baseColorFactor": STONE_DEEP,
                "metallicFactor": 0.02,
                "roughnessFactor": 0.5,
            },
        },
        {
            "name": "citadel-ridge",
            "pbrMetallicRoughness": {
                "baseColorFactor": RIDGE,
                "metallicFactor": 0.02,
                "roughnessFactor": 0.64,
            },
        },
        {
            "name": "citadel-terrace",
            "pbrMetallicRoughness": {
                "baseColorFactor": GRASS,
                "metallicFactor": 0.0,
                "roughnessFactor": 0.72,
            },
        },
        {
            "name": "huayna-picchu",
            "pbrMetallicRoughness": {
                "baseColorFactor": PEAK,
                "metallicFactor": 0.03,
                "roughnessFactor": 0.58,
            },
        },
    ]

    bin_blob = bytearray()
    buffer_views: list[dict] = []
    accessors: list[dict] = []
    meshes: list[dict] = []

    pack_mesh(terrain, "ridge", 2, bin_blob, buffer_views, accessors, meshes)
    pack_mesh(stone, "citadel-blocks", 0, bin_blob, buffer_views, accessors, meshes)
    pack_mesh(deep, "citadel-openings", 1, bin_blob, buffer_views, accessors, meshes)
    pack_mesh(grass, "terraces", 3, bin_blob, buffer_views, accessors, meshes)
    pack_mesh(peak, "huayna-picchu", 4, bin_blob, buffer_views, accessors, meshes)

    nodes = [
        {
            "name": "machu-picchu-citadel",
            "children": [1, 2, 3, 4, 5],
            "extras": {"heroSubject": "citadel"},
        }
    ]
    for index, mesh in enumerate(meshes):
        nodes.append({"name": mesh["name"], "mesh": index})

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "chofex-hackathon/build-machu-picchu-glb",
            "extras": {
                "title": "Machu Picchu Citadel",
                "heroSubject": "citadel",
            },
        },
        "scene": 0,
        "scenes": [
            {
                "name": "MachuPicchuCitadel",
                "nodes": [0],
                "extras": {"heroSubject": "citadel"},
            }
        ],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_blob)}],
    }

    json_blob = align4(
        json.dumps(gltf, separators=(",", ":")).encode("utf-8"),
        pad_byte=b" ",
    )
    bin_aligned = align4(bytes(bin_blob))
    total = 12 + 8 + len(json_blob) + 8 + len(bin_aligned)
    header = struct.pack("<III", 0x46546C67, 2, total)
    json_chunk = struct.pack("<II", len(json_blob), 0x4E4F534A) + json_blob
    bin_chunk = struct.pack("<II", len(bin_aligned), 0x004E4942) + bin_aligned
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(header + json_chunk + bin_chunk)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    write_glb()
