# Sponsorship deck — brief

Material consolidado para construir el deck de patrocinio dirigido a empresas de
herramientas de desarrollo (devtools). Este documento no es el deck: es el
insumo, las fuentes de verdad y las decisiones que faltan.

> **Estado (14 sep 2026):** el motor de decks ya está portado y funcionando, y
> el presupuesto ya existe. Lo que queda son decisiones de contenido.
>
> | Documento | Qué resuelve |
> | --- | --- |
> | [`deck-system.md`](./deck-system.md) | El motor: cómo se monta un deck en código. |
> | [`deck-best-practices.md`](./deck-best-practices.md) | La doctrina: qué se escribe y en qué orden. |
> | [`budget-sponsors.md`](./budget-sponsors.md) | Los números: costos, tiers, slots. |
>
> Deck general en borrador: `apps/web/content/decks/main/` → `/deck/main`.

- **Tarea Notion:** [09. Presentación de patrocinio para herramientas de desarrollo](https://app.notion.com/p/09-Presentaci-n-de-patrocinio-para-herramientas-de-desarrollo-3d8da2435b46806aa2add38b9b788996) · P1 · Comunicaciones
- **Owner:** Emmy Pardo · **Deadline:** 15 sep 2026
- **Done when:** deck con beneficios y slots listo para outreach
- **Subtareas:** [outline](https://app.notion.com/p/Esquema-de-presentaci-n-de-patrocinio-diapositivas-3d8da2435b468195ac2edae1cfd57c53) → [slides de beneficios](https://app.notion.com/p/Dise-ar-diapositivas-de-beneficios-para-patrocinadores-3d8da2435b46811f93aece6c98e8734d) → [export PDF](https://app.notion.com/p/Exportar-PDF-de-presentaci-n-de-patrocinio-3d8da2435b46816b81e1ca0de31ad2c4)

## Fuente de verdad del contenido

`apps/web/components/landing/content.ts` es el copy canónico del evento. El deck
debe leer de ahí, no inventar cifras paralelas. Capturas de la landing en
`docs/landing-preview/`.

| Dato | Valor | Dónde vive |
| --- | --- | --- |
| Marca del evento | **Hack the Andes** | `brandName` |
| Fechas | 17–18 oct 2026 (⚠️ ver preguntas abiertas) | `facts`, `heroCopy.meta`, `footerCopy.meta` |
| Sede | Lima, Perú · presencial | `facts` |
| Duración | ~30 horas | `facts` |
| Equipos | 1–4 personas, solos OK | `facts` |
| Premios | US$2.000 (1º) · US$500 (2º) · US$300 pool viajes/minijuegos | `prizeAmountsUsd` |
| Premios en soles | convertidos a PEN con `usdToPenRate` (3.35) | `prizeAmountsPen` |
| Aplicación | vía CLI (`chofex register`) o vía agent | `applyCopy`, `cliCommands` |
| Preselección | challenge técnico + golden tickets + juegos entre participantes | `filterSignals` |
| Jurado | "mentores y jueces de alto calibre", roster **sin anunciar** | `whyCopy.rosterNote` |
| Tracks | **ocultos a propósito** — solo hints `T-01`/`T-02` | `trackHints` |

## Regla de marca (ya decidida, no reabrir)

> "Con el apoyo de Chofex. Identidad propia del evento. Chofex patrocina — no
> pinta la paleta." — `sponsorsCopy.lede`

El deck va con identidad **Hack the Andes**. Chofex aparece como sponsor, no como
dueño de la estética. Esto cierra la tarea Notion "Definir tratamiento *Sponsored
by Chofex* (sin colores Chofex)".

Paleta y tipografía del evento — **actualizadas por el merge `feat/palette`
(#39); la versión anterior de este brief citaba el campo azul `#0057ff` y el
amarillo de estado, que ya no existen**. La fuente real es
`apps/web/components/landing/landing.css`:

| Rol | Token | Valor |
| --- | --- | --- |
| Papel (fondo) | `--hud-paper` | Sandy Linen `#efe8de` |
| Tarjeta | `--hud-card` | Mist Linen `#fff5ee` |
| Tipografía | `--hud-ink` | `#101c26` |
| Acción / etiquetas | `--hud-action` | Aegean Sky `#1664b0` |
| Estado / numerales / reglas | `--hud-status` | Scarlet Bikini `#d21624` |
| Tinte (nunca texto) | `--hud-accent` | Blossom Silk `#ffcad4` |

La página es **clara**, no oscura. Tipografía: Barlow Condensed (display),
Barlow (cuerpo), IBM Plex Mono (chrome HUD) — ver `components/landing/fonts.ts`.
El deck replica estos roles en `app/deck/deck.css`.

## Estado actual de los slots

```ts
// apps/web/components/landing/content.ts
export const sponsorSlots = [
  { id: "chofex", name: "Chofex", confirmed: true },
  { id: "open-1", name: "Más sponsors pronto", confirmed: false },
];
```

Hoy la grilla de la landing tiene **2 slots: Chofex + 1 abierto**. Definir tiers y
cantidad de slots es parte de este deck; una vez definido, `sponsorSlots` y
`LandingSponsors` (`apps/web/components/landing/sponsors.tsx`) se actualizan para
reflejarlo.

## Qué se le pide a un sponsor devtool

Del roadmap (#10 "Contactar patrocinadores, pedir créditos y beneficios"): el ask
principal son **créditos de producto para los participantes**, más beneficios de
marca. La plataforma ya contempla que el participante reclame créditos en el
evento — ver las tareas de Plataforma "claim credits" y `#24`.

## Contrapartidas disponibles (inventario, falta tierizar)

Lo que el evento ya puede ofrecer, según lo construido y lo planificado:

- Logo en la landing (`sponsorSlots` → grilla en la sección Sponsors)
- Post de anuncio por sponsor confirmado (roadmap: "Plantilla de publicaciones por
  cada patrocinador" + "Publicar publicación por patrocinador confirmado")
- Plantilla de imagen de anuncio de sponsor (roadmap #15)
- Presencia en banners físicos de sede (roadmap #15, #16)
- Badges digitales de participantes — piezas que circulan en redes post-evento
  (`expeditionSignals` V-04; generación ya implementada, ver README)
- Acceso al talento: ~100 asistentes seleccionados, presenciales
- Menciones en kickoff y premiación (roadmap #32, #34)

## Preguntas abiertas

Tres se resolvieron al armar el presupuesto y la doctrina. Quedan tres, y la
primera sigue bloqueando todo.

### Siguen abiertas

1. **Fechas — conflicto activo.** La landing dice **17–18 oct** (en 5 lugares de
   `content.ts`: líneas 37, 83, 96, 98, 254). El roadmap de Notion, la página del
   evento y el plan de entrega dicen **10–11 oct**. Un deck de outreach no puede
   salir con la fecha equivocada, y si la real es el 17–18, todos los deadlines
   del roadmap están corridos una semana. **Resolver primero.**
2. **Qué se puede revelar — ahora es una decisión de producto, no de estilo.**
   Los tracks están ocultos a propósito en la landing. Pero el slide central de
   un deck a partner es *el track que el partner posee*, y el tier Track Partner
   ($1.000 × 2 slots) **no existe como producto si los tracks no se revelan**.
   El deck es material privado (`robots: noindex`, se manda por link), así que
   puede revelarlos sin tocar la landing. Ver `deck-best-practices.md` §9.
3. **Cupo confirmado.** El plan dice 100 asistentes y **todo el presupuesto es
   lineal sobre esa cifra** ($82,50 de operación por hacker). Confirmarlo antes
   de ponerlo frente a un sponsor.

### Resueltas

4. ~~**Tiers y precio.**~~ → `budget-sponsors.md` §5. Title $2.500 ×1 ·
   Track Partner $1.000 ×2 · Silver $500 ×6 · In-kind ∞. Derivados de un total a
   financiar de **$11.050**. El ask principal a devtools sigue siendo créditos;
   el cash es lo que cierra el presupuesto.
5. ~~**Cuántos slots abre la landing.**~~ → **9 slots nombrados** (1+2+6) más
   in-kind sin límite. Hoy `sponsorSlots` tiene 2: **falta actualizarlo.**
6. ~~**Idioma del deck.**~~ → **ambos**. `main` en ES y `en` en EN, como el
   sistema del que se portó. Hoy solo existe `main`.

## Aguas abajo

Si el deck no sale, se traba toda la cadena de sponsors:

```
#09 deck (15 sep) → #10 outreach (18 sep) → seguimiento hasta confirmación escrita
   → #22 logos en landing (1 oct) → posts por sponsor confirmado
```

## Verificación

Después de tocar `content.ts` o `sponsors.tsx`:

```sh
bun test            # incluye apps/web/components/landing/content.test.ts
bun run lint
bun run check-types
```

Después de tocar un deck (`apps/web/content/decks/**`):

```sh
cd apps/web && bun run build   # los decks se prerenderizan en build
```

Un error en un slide **rompe el build**, no se degrada en runtime. Eso es
deliberado: un deck roto no debe poder mandarse.
