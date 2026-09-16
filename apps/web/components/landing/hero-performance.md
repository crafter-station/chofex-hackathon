# Hero WebGL budget

The landing opens on a parked-in-range drawing of the Sacred Valley
(`/models/sacred-valley.glb`). The citadel GLB from PR #33 is no longer
shipped — `https://andes.crafter.run/models/machu-picchu.glb` is 404 —
so this budget is for the contour-ink hero that replaced it.

Numbers below are **file sizes and responses measured in this cloud
environment**, not Lighthouse lab scores. Do not treat them as field
RUM.

## Transfer budget

| Asset | Role | Measured | Budget |
| --- | --- | --- | --- |
| `/hero/sacred-valley-poster.webp` | Opening paint / fallback | 86 KB | ≤ 120 KB |
| `/models/sacred-valley.glb` | Draco terrain, after capability | 2,612,064 B (2.49 MB) | ≤ 2.6 MB |
| `/models/site-structures.glb` | Terraces / towns | 27,728 B | ≤ 40 KB |
| `/draco/draco_decoder.wasm` | Decoder, after capability | 188 KB | ≤ 220 KB |
| `/draco/draco_decoder.js` | Decoder glue | 501 KB | keep local, no CDN |
| `/draco/draco_wasm_wrapper.js` | Decoder glue | 58 KB | keep local, no CDN |

The poster is the only hero image on the document critical path. The
GLB, Draco decoder, Three, R3F and Drei start only after
`resolveWorldPresentation` chooses `webgl`, then on idle (800 ms
timeout).

## Runtime budget

| Signal | Target |
| --- | --- |
| LCP | Lockup type or the poster still. Not the GLB. Aim for LCP ≤ 2.5 s on a mid-range 4G profile; **not measured here** (no Lighthouse run in this environment). |
| INP | Hero canvas is `pointer-events: none`. Do not add handlers that fight scroll. |
| Frame loop | `frameloop="never"` when the hero is off-screen, the tab is hidden, or `prefers-reduced-motion` is on. |
| Fallback | No WebGL, `deviceMemory ≤ 2`, `saveData` / 2G, or reduced motion → poster only, no mesh fetch. |

## How to re-measure

```bash
# bytes on disk / as served
ls -l apps/web/public/hero/sacred-valley-poster.webp \
      apps/web/public/models/sacred-valley.glb \
      apps/web/public/models/site-structures.glb \
      apps/web/public/draco/draco_decoder.wasm

curl -sI https://andes.crafter.run/models/sacred-valley.glb | grep -i content-length
```

A production Lighthouse pass on desktop and a throttled mid-range
mobile profile still belongs on issue #50. Record LCP / INP there;
do not invent them.
