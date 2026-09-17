# El sistema de decks — la piel

Los valores visuales del deck de patrocinio, medidos contra la base de diseño, y
qué se decidió hacer con cada uno.

- **El motor** (cómo se compila y se sirve): [`deck-system.md`](./deck-system.md)
- **La doctrina** (qué se escribe y en qué orden): [`deck-best-practices.md`](./deck-best-practices.md)
- **Los números** (tiers, presupuesto): [`budget-sponsors.md`](./budget-sponsors.md)

> **Origen.** Cuatro slides hechas en Canva, exportadas a SVG con el texto
> convertido a trazos. No hay `<text>` ni `font-family` en el archivo, así que
> todo lo de abajo está **medido sobre la geometría de los glifos**, no leído de
> metadatos. Donde una cifra es derivada y no medida, se dice.

---

## 1. Qué trae la base de diseño

Cuatro archivos, `viewBox 1440×810` (16:9, exportado a 1920×1080). No son cuatro
slides de un deck: son tres plantillas y una portada.

| Plantilla | Qué es | Slides que cubre |
| --- | --- | --- |
| **T1** portada | Wordmark centrado abajo, fila de logos de sponsor | `01-cover`, `10-close` |
| **T2** split | Media a la izquierda, columna de texto a la derecha | `02-what`, `08-why` |
| **T3** split espejo | Texto a la izquierda, dos placeholders apilados a la derecha | `03-filter`, `06-stack` |
| **T4** cards | Título arriba, cuatro tarjetas, wordmark al pie | `04-facts`, `05-prizes`, `07-tiers`, `09-metrics` |

**Las plantillas son una piel, no un set de componentes nuevo.** Las diez slides
ya existen en MDX y ya usan `Stat`, `SponsorTier`, `PrizePodium`, `DataGrid`. La
piel entra como un `style` en `deck.json` y el contenido no se toca. Inventar un
`<CardRow variant="tier|stat|text">` sería duplicar lo que hay, y va contra la
regla del propio sistema: ampliar el vocabulario de `mdx-components.ts` es
deliberado, y primero se compone con lo que existe.

---

## 2. Color

**Monocromo puro.** En los cuatro archivos solo aparecen `#000000` y `#ffffff`.
Cero croma. La jerarquía se construye con opacidad sobre negro, no con color.

Esto elimina del deck los dos colores que hoy usa: `--deck-action` (cobalto
Chofex, que viste los labels) y `--deck-status` (rojo quemado, que viste las
reglas y las viñetas). En la piel nueva no tienen dónde ir.

### Scrims

Las tarjetas de T4 son la foto de fondo con un velo negro encima. Las opacidades
medidas, en orden de aparición:

```
0.08 · 0.28 · 0.29 · 0.37 · 0.52 · 0.54
```

Seis valores para lo que visualmente son tres niveles. `0.28` y `0.29` son el
mismo gris, y `0.52` y `0.54` también. Es deriva de capas en Canva, no una
escala. **Pendiente de confirmar con el diseñador**; mientras tanto se
implementan tres pasos (`0.10 · 0.30 · 0.55`) y se documenta la reducción.

---

## 3. Tipografía

### Las familias

| Rol | Familia | Estado |
| --- | --- | --- |
| Display | **Stack Sans Notch** | Resuelta. Koto para Stack Overflow, OFL-1.1, en Google Fonts, variable 200–700 |
| Cuerpo | Glock Grotesk | **Bloqueada** — ver abajo |

La display ya está en el repo. `components/landing/fonts.ts` la carga como
`landingBrand`, variable con `latin-ext`, y su comentario dice que es la cara de
marca "and only the event's name". La base de diseño no inventó una tipografía:
se hizo mirando el landing.

Lo único que falta es cablearla: `app/deck/layout.tsx` importa `landingDisplay`,
`landingSans` y `landingMono`, pero **no** `landingBrand`.

Verificada por superposición, no por parecido: se renderizó "HACK THE ANDES" en
Stack Sans Notch 700 y se comparó contra el wordmark extraído del SVG. Mismos
trazos, mismos notches en la K y la A.

El wordmark de la base es ~4% más ancho que la fuente pura a igual altura de
caja, lo que da un tracking de **≈ +0.025em**. Pendiente de confirmar si es
intencional o el default de Canva.

### Glock Grotesk: por qué no entra

Dos problemas, una sola solución.

1. **Licencia.** Lo que circula gratis es una demo de uso personal; el archivo
   que tenemos trae un `Befonts-License.txt` que dice `License: Personal Use
   Only`. La licencia de fuentes de Canva tampoco sirve: cubre el uso dentro de
   Canva y lo que se exporta desde Canva, y prohíbe usar el software de fuente
   fuera de ahí. El deck es una URL que sirve la fuente al navegador.
2. **Glifos.** Más grave, y es técnico: el archivo tiene **187 glifos y un solo
   peso (600)**, y le faltan `á é í ó ú ü ñ Á É Í Ó Ú Ü Ñ` completos, más `$` y
   `%`. El deck es en español y lleva montos. Cada acento cae a una fuente de
   reemplazo a mitad de palabra.

La versión completa de Ivan Tsanko trae el latino extendido y varios pesos, y es
la misma compra que resuelve la licencia. Hasta entonces el cuerpo va en una OFL
sustituta y **`--deck-body` es el único punto de cambio**.

Candidatas medidas contra la textura de la base: **DM Mono** (clava el peso y la
geometría: `o` circular, aperturas abiertas, trazo ligero), **Martian Mono**
(clava el ancho y el ritmo, pero come demasiada línea con copy real) e **IBM Plex
Mono** (la que el sistema ya carga, y la única que no suma una familia).

### La escala

Alturas de caja medidas sobre los trazos. El tamaño de fuente es derivado: para
Stack Sans Notch la relación caja/em medida es **0.75**.

| Rol | Altura de caja | Tamaño derivado | Como %alto |
| --- | --- | --- | --- |
| Wordmark del lockup | 48.5 | ~64.7 | 8.0vh |
| Título de sección | 34.1 | ~45.5 | 5.6vh |
| H1 de slide | 30.7 | ~40.9 | 5.1vh |
| Cifra | 18.6 | ~24.8 | 3.1vh |
| Fila meta | 14.3 | ~19.1 | 2.4vh |
| Eyebrow | 13.5 | ~18.0 | 2.2vh |
| Cuerpo | 13.6 | ~20.2 | 2.5vh |

Dos cosas que importan:

- **El cuerpo y la fila meta son del mismo tamaño.** La jerarquía entre ellos es
  familia y caja, no escala.
- **El interlineado del cuerpo es 19.5 sobre ~20.2 de cuerpo, o sea 0.97.**
  Leading negativo: el párrafo funciona como textura, no como lectura.

### El interlineado no se porta

En la base, con ese 0.97, **las descendentes de la `j` chocan contra la línea de
abajo**. Está en el archivo original, no es un artefacto del render. Con lorem
pasa desapercibido; con copy real en español pasa a ser peor, porque los acentos
suben y el choque empieza también por arriba.

Se implementa en **1.15**. Se pierde algo de la textura de bloque; es la
diferencia entre un deck y un deck que se puede leer.

---

## 4. Retícula

No hay una. Los márgenes izquierdos medidos, por slide:

| Qué | x |
| --- | --- |
| Marco de media (T2) | 81 |
| Columna de texto (T2/T3) | 117.6 |
| Fila de cards (T4) | 177.9 |

Y **T2 y T3 son espejos que no espejan**: T3 abre el texto en `x=117.4`, T2 lo
cierra en `x=1265.3`, o sea margen 174.7.

Pendiente del diseñador. Hasta que responda se toma **177.9** como margen
canónico (el de T4, el único que deja el bloque centrado en el lienzo) y se
documenta la decisión acá cuando se confirme.

### Las cards de T4

| Medida | Valor | Como %ancho |
| --- | --- | --- |
| Ancho de tarjeta | 249.62 | 17.3% |
| Gutter | 29.25 | 2.0% |
| Paso | 278.875 | 19.4% |
| Alto | 308.25 | — |

Cuatro columnas, ratio de tarjeta 0.81. La fila va de 177.9 a 1264.14.

### Trazos

Blanco, `1px` en la portada y `2px` en el resto, a escala de 1440.

---

## 5. Assets

### Fondos

Cuatro PNG, todos monocromos sobre negro: tres cordilleras wireframe y un
cañón. Cubren T1, T3 y T4.

**T2 no tiene fondo utilizable.** El de la base es un contorno topográfico de
736×1308 con la firma **`ALAN·G`** grabada dentro de la imagen, abajo a la
izquierda. No es una marca de agua de preview: está en el arte. Un deck de
patrocinio no sale con la firma de otro autor encima.

Se resuelve sin licencia de por medio: ese fondo es un patrón de curvas de
nivel, que es exactamente lo que `components/landing/terrain-shader.ts` ya
produce. Sale de nuestro propio shader, con la misma identidad que el landing.

### Grano

Un PNG de ruido en gris, presente en las cuatro slides como máscara. Es el asset
más reutilizable del paquete: es la textura de toda la identidad.

### Marcas

La base lleva CHOFEX, CRAFTER STATION y PERÚ TECH WEEK como raster. En el repo
ya están mejores, y son las que se usan:

```
apps/web/public/sponsors/chofex-white.png
apps/web/public/sponsors/crafter-station-white.png
apps/web/public/sponsors/peru-tech-week-white.png
```

---

## 6. Cómo entra al sistema

La piel es un `style` nuevo, junto a `editorial` y `plain`:

```json
{ "style": "terrain" }
```

`palette.css` no se toca. Ese archivo está compartido a propósito entre el
landing y los decks, y su propio comentario recuerda que ya se desincronizó una
vez. El landing es papel claro y se queda así; la piel oscura declara sus
propios roles dentro de `.deck-pager[data-deck-style="terrain"]`.

---

## 7. Lo que falta cerrar

| Pendiente | De quién | Bloquea |
| --- | --- | --- |
| Los cuatro márgenes de §4 | Diseñador | La retícula final |
| Si los seis scrims son tres | Diseñador | §2 |
| El tracking del wordmark | Diseñador | El lockup |
| Si Open Sans está en uso | Diseñador | Nada, es higiene |
| Glock Grotesk completa | Compra a Ivan Tsanko | `--deck-body` |
