# Draco decoder

Self-hosted copy of the glTF-flavoured Draco decoder from
`three/examples/jsm/libs/draco/gltf/`, kept here so the hero terrain never
reaches for a third-party CDN at runtime.

`sacred-valley.glb` is Draco-compressed by
`scripts/build-sacred-valley-glb.py`; `sacred-valley-model.tsx` points
`useGLTF` at this directory. Refresh these files whenever `three` is upgraded.

Only `draco_wasm_wrapper.js` and `draco_decoder.wasm` load on browsers with
WebAssembly. `draco_decoder.js` is the asm.js fallback.
