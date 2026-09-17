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

### La correspondencia no es uno a uno

El mapeo de arriba es de dónde sale cada plantilla, no qué slide la usa. El
layout lo decide **la forma del contenido**, y ocho de las diez slides llevan una
grilla donde la base lleva un párrafo. Partir el lienzo al medio las aplastaba.

Por eso `split` no es media página sino una **columna al 64% corrida a un lado**:
conserva la asimetría, que es para lo que sirve la plantilla, y le sigue dejando
un tercio del lienzo a la lámina. Lo que quedó:

| Layout | Slides | Por qué |
| --- | --- | --- |
| `cover` | `01-cover`, `10-close` | Las dos que no llevan grilla |
| `split-left` | `05-prizes`, `06-stack` | Podio de 2 y grilla de 3, entran al 64% |
| `split-right` | `08-why` | `ContrastGrid` son 2 columnas |
| `wide` | las otras cinco | `StatRow` y `FlowMap` de 4, `MiniMatrix`, los 3 tiers |

Y bajo un split la lámina se corre al lado contrario del texto (`82%` / `18%`),
porque si no la masa más brillante del dibujo —el pico, que es la razón por la
que se eligió esa lámina— cae bajo la columna tan seguido como al lado.

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
| Cuerpo | **DM Mono** | Resuelta. OFL-1.1, en Google Fonts, pesos 300/400/500 con `latin-ext` |

La display ya está en el repo. `components/landing/fonts.ts` la carga como
`landingBrand`, variable con `latin-ext`, y su comentario dice que es la cara de
marca "and only the event's name". La base de diseño no inventó una tipografía:
se hizo mirando el landing.

`app/deck/layout.tsx` no la pedía, así que el wordmark caía a la condensada.
Ahora la importa, y en `terrain` el rol `--deck-display` resuelve a ella: la base
compone los títulos de sección con la cara de marca, no solo el nombre del
evento. Es más ancho que la regla que `fonts.ts` enuncia para el landing, y es
deliberado — un deck son nueve slides vistas una vez, donde la cara que grita es
el punto; un landing es una página que se habita.

Verificada por superposición, no por parecido: se renderizó "HACK THE ANDES" en
Stack Sans Notch 700 y se comparó contra el wordmark extraído del SVG. Mismos
trazos, mismos notches en la K y la A.

**El tracking del lockup está igualado por medición, no estimado.** `.deck-title`
venía en `-0.02em`, que es un valor cortado para Barlow Condensed: cierra los
huecos que abre una condensada. Stack Sans Notch no lo es y no lo quiere. Medido
a la misma altura de caja, nuestro título salía 1.9% angosto —ratio ancho/caja
de 11.10 contra 11.31 de la base—, así que en `terrain` va en `-0.01em`. Con eso
la diferencia queda en 0.15%, que es ruido de antialiasing del bbox.

### Glock Grotesk: por qué no entra

La base fija el cuerpo en Glock Grotesk, de Ivan Tsanko. No entra, por dos
razones, y hay una tercera que decide.

1. **Licencia.** Lo que circula gratis es una demo de uso personal; el archivo
   que tenemos trae un `Befonts-License.txt` que dice `License: Personal Use
   Only`. La licencia de fuentes de Canva tampoco sirve: cubre el uso dentro de
   Canva y lo que se exporta desde Canva, y prohíbe usar el software de fuente
   fuera de ahí. El deck es una URL que sirve la fuente al navegador.
2. **Glifos.** Más grave, y es técnico: el archivo tiene **187 glifos y un solo
   peso (600)**, y le faltan `á é í ó ú ü ñ Á É Í Ó Ú Ü Ñ` completos, más `$` y
   `%`. El deck es en español y lleva montos. Cada acento cae a una fuente de
   reemplazo a mitad de palabra.
3. **No es el corte del comp.** Medido: al mismo alto de caja, el cuerpo de la
   base mide 932px de ancho y este archivo 818 — es **14% más angosto y más
   pesado**. La base se compuso con un peso más liviano de la familia completa.
   Forzar este archivo no daría el comp, daría otra cosa.

La familia completa se compra en [tsankotype.com](https://www.tsankotype.com/shop-4)
— $25 por peso, $100 la familia, con OTF+TTF+WOFF y licencia comercial que
nombra "digital interfaces". Antes de pagar hay que pedir el mapa de caracteres:
la tienda dice "Latin and Cyrillic", que es exactamente lo que decía la demo que
no tiene un solo acento.

**Se eligió DM Mono.** Un monoespaciado donde la base usaba una proporcional, y
elegido por eso: la base contrapone una display limpia contra una cara ancha y
rara, y ese contraste de dos voces es lo que sostiene la página. Stack Sans Notch
lleva los títulos, y una segunda grotesca debajo lee como la misma voz en chico.
El costo es densidad — el mono corre unas cinco líneas donde una proporcional
corre tres — y es asumible porque una slide de patrocinio lleva frases y cifras,
no párrafos.

Descartadas: **Familjen Grotesk** (excelente cara de texto y ~40% más densa, pero
demasiado cerca del titular), **Martian Mono** (clava el ancho de la base, pero
come demasiada línea) e **IBM Plex Mono** (ya cargada para los labels, y por eso
mismo sin contraste contra ellos).

`--deck-body` sigue siendo el único punto de cambio.

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

No se porta. `.deck-lead` queda en **1.5**, que es el valor que el sistema ya
traía y el que un monoespaciado necesita: DM Mono tiene ascendentes y
descendentes largas, y apretarlas reproduce el choque en vez de evitarlo. Se
pierde la textura de bloque de la base; es la diferencia entre un deck y un deck
que se puede leer.

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

**Resuelto: 177.9**, o `12.35%`. Es el de T4, y el único de los tres que deja el
bloque centrado en el lienzo, así que conserva la tarjeta de 249.6 tal como está
dibujada. Las columnas de texto se alinean a él.

En CSS va como `clamp(1.25rem, 12.35vw, 4rem)`: el 12.35% de un teléfono no es
un margen, es un canal, y el piso sostiene la slide legible mucho antes que la
proporción.

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

**El de T2 no se podía usar.** El de la base es un contorno topográfico de
736×1308 con la firma **`ALAN·G`** grabada dentro de la imagen, abajo a la
izquierda. No es una marca de agua de preview: está en el arte. Un deck de
patrocinio no sale con la firma de otro autor encima.

Se reemplazó por una quinta lámina que el repo **dibuja**, no compra:
`contour.webp`, el relieve real del Valle Sagrado cortado en curvas de nivel.
No imita al shader del landing — corre su misma medida (`band = elevación /
espaciado`, línea donde `fract(band)` cruza, normalizada por el gradiente)
sobre el mismo DEM, visto desde arriba en vez de desde una cámara en el valle.
El script es `scripts/build-deck-contour-plate.py` y usa la misma caché que los
builders de GLB.

Dos parámetros que no salen del landing y son decisiones de esta lámina: el
intervalo va en 110 m, porque a los 45 m de un plano cartográfico los Andes a
19 m por píxel ponen una línea en casi cada píxel y la lámina lee como grano; y
el terreno se suaviza 4 px antes de cortar, porque cada aspereza de cresta se
convierte en su propia curva cerrada. Eso es lo que separa un plano de
agrimensura del campo fluido que dibuja la base.

El dato de elevación exige atribución, y ahora tiene un consumidor más: está en
`content/legal/credits.md` y en `public/models/README.md`.

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

| Pendiente | Bloquea |
| --- | --- |
| Las tarjetas claras con texto negro, si se quiere el efecto exacto de la base | Una variante de componente, no un token |
| `bun deck:pdf` sin verificar — Playwright es un paso manual, no una dependencia | El entregable en PDF |

Cerrados: el margen canónico (§4), la cara de cuerpo (§3), la display (§3), el
tracking del lockup (§3), los layouts (§1), la capa de fondo y la lámina de
curvas (§5), Open Sans —que no aparece en ninguno de los
trazos de la base y se da por residuo de la plantilla de Canva— y los scrims,
que resultaron ser dos cosas distintas mezcladas: tres velos de página completa
(0.37 · 0.52 · 0.54) y los de las tarjetas. Los velos son ahora `light` · `mid`
· `heavy` por slide.
