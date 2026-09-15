"""Strip the baked satellite drape out of a terrain GLB.

The hero draws the valley in contour lines: it samples no texture at all, and
has not since the drawing replaced the lit flythrough. The imagery stayed
inside the mesh regardless — 1.67 MB of JPEG in a 4.28 MB file that every
visitor downloads, on the one asset the page preloads.

This removes the image, the texture and the sampler that fed it, drops the
material's reference to it, and rebuilds the binary chunk without the hole. It
leaves the geometry, including its UVs: they cost little, they are inside the
Draco payload where editing them means re-encoding, and nothing reads them.

    python3 scripts/strip-glb-drape.py public/models/sacred-valley.glb
"""

import json
import struct
import sys

GLB_MAGIC = 0x46546C67
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def pad4(n: int) -> int:
    return (4 - (n % 4)) % 4


def read_glb(path: str) -> tuple[dict, bytes]:
    data = open(path, "rb").read()
    magic, version, _ = struct.unpack_from("<III", data, 0)
    if magic != GLB_MAGIC or version != 2:
        raise SystemExit(f"{path}: not a glTF 2.0 binary")

    offset, gltf, binary = 12, None, b""
    while offset < len(data):
        length, kind = struct.unpack_from("<II", data, offset)
        body = data[offset + 8 : offset + 8 + length]
        if kind == JSON_CHUNK:
            gltf = json.loads(body)
        elif kind == BIN_CHUNK:
            binary = body
        offset += 8 + length + pad4(length)
    if gltf is None:
        raise SystemExit(f"{path}: no JSON chunk")
    return gltf, binary


def write_glb(path: str, gltf: dict, binary: bytes) -> None:
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * pad4(len(js))
    binary += b"\0" * pad4(len(binary))
    total = 12 + 8 + len(js) + 8 + len(binary)
    with open(path, "wb") as f:
        f.write(struct.pack("<III", GLB_MAGIC, 2, total))
        f.write(struct.pack("<II", len(js), JSON_CHUNK))
        f.write(js)
        f.write(struct.pack("<II", len(binary), BIN_CHUNK))
        f.write(binary)


def strip(path: str) -> None:
    gltf, binary = read_glb(path)
    before = 12 + 8 + len(json.dumps(gltf, separators=(",", ":"))) + 8 + len(binary)

    images = gltf.get("images", [])
    if not images:
        print(f"{path}: no embedded image, nothing to do")
        return

    dropped = {im["bufferView"] for im in images if "bufferView" in im}

    # Rebuild the binary without the dropped views, and map old index -> new.
    remap: dict[int, int] = {}
    chunks: list[bytes] = []
    views: list[dict] = []
    cursor = 0
    for index, view in enumerate(gltf["bufferViews"]):
        if index in dropped:
            continue
        start = view.get("byteOffset", 0)
        body = binary[start : start + view["byteLength"]]
        remap[index] = len(views)
        fresh = dict(view)
        fresh["byteOffset"] = cursor
        views.append(fresh)
        chunks.append(body)
        cursor += len(body)
        padding = pad4(len(body))
        chunks.append(b"\0" * padding)
        cursor += padding

    rebuilt = b"".join(chunks)

    # Every reference to a bufferView has to follow the remap. Accessors and
    # the Draco extension are the two that carry them in these meshes; the
    # walk is generic so a future exporter adding another cannot be missed.
    def repoint(node: object) -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                if key == "bufferView" and isinstance(value, int):
                    node[key] = remap[value]
                else:
                    repoint(value)
        elif isinstance(node, list):
            for item in node:
                repoint(item)

    gltf.pop("images", None)
    gltf.pop("textures", None)
    gltf.pop("samplers", None)
    for material in gltf.get("materials", []):
        pbr = material.get("pbrMetallicRoughness", {})
        pbr.pop("baseColorTexture", None)
        material.pop("normalTexture", None)
        material.pop("emissiveTexture", None)
        material.pop("occlusionTexture", None)

    repoint(gltf)
    gltf["bufferViews"] = views
    gltf["buffers"] = [{"byteLength": len(rebuilt)}]

    write_glb(path, gltf, rebuilt)
    after = len(open(path, "rb").read())
    print(
        f"{path}: {before / 1e6:.2f} MB -> {after / 1e6:.2f} MB "
        f"({(1 - after / before) * 100:.0f}% smaller)"
    )


if __name__ == "__main__":
    for target in sys.argv[1:]:
        strip(target)
