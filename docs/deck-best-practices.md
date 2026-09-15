# Cómo se escribe un deck de patrocinio — Hack the Andes

La doctrina. Qué vende un deck, en qué orden, con cuánto texto y con qué
números. Portada de The Next Craft (42 decks en producción) y adaptada a lo que
somos: **primera edición, una sede, ~100 asistentes**.

- **El motor** (cómo se monta un deck en código): [`docs/deck-system.md`](./deck-system.md)
- **Los números** (tiers, presupuesto): [`docs/budget-sponsors.md`](./budget-sponsors.md)
- **El insumo de contenido**: [`docs/sponsorship-deck-brief.md`](./sponsorship-deck-brief.md)

---

## 1. El principio

> **Un deck no vende espacio para un logo. Vende adopción por parte de builders,
> con evidencia.**

Todo lo demás en este documento se deriva de eso. Un sponsor de devtools no
compra visibilidad: compra que 100 personas seleccionadas abran una cuenta,
lean sus docs y construyan algo con su producto en 30 horas, delante de un
jurado. La visibilidad es el envoltorio, no el producto.

### El marco que se usa

- *"Como Challenge Partner, [X] es dueño del challenge de [categoría] durante todo el
  hackathon."*
- *"[X] se convierte en el camino rápido para los equipos que construyan
  [categoría]."*

### El marco que está prohibido

- "Logo en la web" como valor principal.
- "Exposición masiva", "alcance", "visibilidad de marca" como argumento central.
- Cualquier promesa de ingresos, conversión o pipeline.

> **Nota sobre nuestro inventario actual.** El brief lista siete contrapartidas
> —logo en landing, post de anuncio, plantilla de imagen, banners, badges,
> menciones en kickoff y premiación— y **las siete son visibilidad**. Sirven como
> relleno de tier, nunca como la tesis de un deck. Si un deck nuestro no puede
> nombrar algo que el sponsor *posee* (un challenge, un workshop, un puesto en el
> jurado, un premio), todavía no está listo para mandarse.

---

## 2. Los dos tipos de deck

### Deck general (`main` en ES, `en` en EN)

Cuando la categoría del partner todavía no está definida, o cuando se contacta
devtools en lote. Flujo:

1. Portada
2. Qué es Hack the Andes
3. Por qué ahora
4. Datos del evento
5. **Cómo se filtra** ← nuestro sustituto del track record (ver §4)
6. Audiencia: quién llega y cómo se seleccionó
7. Premios oficiales
8. Los 3 challenges
9. Agenda de las 30 horas
10. **Tiers**
11. Qué cubre el aporte
12. Por qué patrocinar
13. Cierre

### Deck a partner específico

Cuando hay una tesis de por qué *esa* empresa. Flujo:

1. Portada con la tesis específica
2. Por qué este partner y por qué ahora
3. Qué es Hack the Andes
4. Datos y audiencia
5. Cómo se filtra
6. **El challenge que el partner posee**
7. Ejemplos concretos de lo que se construiría con su producto
8. Stack y starter kit
9. Plan de activación (workshop / mentor / jurado)
10. Métricas que se van a reportar
11. **Inversión**
12. Qué incluye
13. Cierre

**El test de intercambiabilidad:** si le cambias el nombre a la empresa en el
slide 2 y el argumento sigue teniendo sentido, el deck no sirve. Es un deck
general con un logo pegado.

---

## 3. El ask repetible

| Situación | Ask |
| --- | --- |
| Preferido | **$2.500 Title** |
| Alternativa | **$1.000 Challenge Partner** |
| Devtools en lote | **$500 Silver** + créditos |
| Siempre, además | créditos, licencias, mentores, jurado, swag, sede, workshops, premios de challenge |

Montos y slots vienen de [`budget-sponsors.md`](./budget-sponsors.md), que es la
única fuente. No los escribas de memoria en un slide.

**Un solo ask por mensaje.** El deck puede mostrar los cuatro tiers; el correo
que lo acompaña pide uno.

---

## 4. El problema de la primera edición

The Next Craft vende con track record: fotos de ediciones anteriores, ocho
sponsors confirmados, 300 builders. **Nosotros no tenemos nada de eso.** El slide
de "track record" y el de "backed by" no tienen contenido, y fingirlos es la
forma más rápida de que un lector senior descuente el deck entero.

Lo que sí tenemos, y que ellos no, es **el filtro**. Úsalo como prueba:

- Aplicación por CLI (`chofex register`) o por agent — el formulario ya es un
  filtro técnico.
- Se revisa **lo que la persona ya construyó**, no su CV: el criterio con que lo
  explica y la propuesta que trae al evento.
- Corte explícito en 100: no es un evento abierto.

El argumento se vuelve: *no podemos mostrarte ediciones pasadas, pero sí podemos
mostrarte exactamente cómo se filtra quién entra*. Eso es verificable hoy y es
más honesto que una foto de stock.

**Regla:** mientras no haya edición pasada, ningún deck afirma tracción que no
exista. Nada de "cientos de builders" ni "la comunidad más grande de".

---

## 5. Métricas

| ✅ Se pueden reportar | ❌ No se prometen |
| --- | --- |
| Cuentas activadas | Ingresos |
| Equipos usando el producto | Valor de pipeline |
| Submissions que lo usan | Tasa de conversión |
| API calls, minutos, runs, créditos consumidos | Retención |
| Demos funcionando, repos, clips | Cobertura de prensa |
| Asistencia al workshop, feedback técnico | Contrataciones |

Lo de la izquierda lo controlamos y lo podemos contar después del evento. Lo de
la derecha depende del sponsor, no de nosotros; prometerlo es lo que quema una
relación para la segunda edición.

Si un deck menciona una métrica, el plan de cómo se mide va en el mismo slide o
en el siguiente. Una métrica sin método de medición es una promesa.

---

## 6. Reglas de densidad

> **Presupuesto: 40 palabras de prosa por slide, máximo.**
> **Los números cargan el slide. La prosa etiqueta los números.**

- Si un slide necesita más de un `Lead`, un grid y una frase de cierre, se parte
  en dos.
- Prohibidos dos bloques de prosa en un mismo slide.
- Una frase con "porque" o "así que" son dos frases. Pártelas o borra una.
- El razonamiento detrás de una oferta va en el correo, no en el slide.
- Todo slide que pueda abrir con un número, abre con un número.
- **Cut test:** borra cada frase y mira cuál se extraña de verdad. Las que no,
  no vuelven.

---

## 7. El slide de cierre

Forma fija: centrado, sin grid ni tarjetas. Headline + **un solo** próximo paso +
`Wordmark` + fecha y sede + `Ready`.

El headline **enuncia el cambio, nunca un resultado prometido**:

- ✅ "De consumir herramientas a construir con ellas."
- ❌ "Tu producto será el favorito de los devs peruanos."

El segundo promete algo que el emisor no controla, y un lector senior descuenta
el deck completo por esa línea.

---

## 8. Hechos canónicos

No inventar cifras fuera de esta lista. La fuente es
`apps/web/components/landing/content.ts`.

| Dato | Valor |
| --- | --- |
| Marca | Hack the Andes |
| Sponsor principal | Chofex · organiza Crafter Station |
| Fechas | 17–18 oct 2026 |
| Sede | Lima, Perú · presencial |
| Duración | 30 horas |
| Equipos | 1–4 personas, se puede aplicar solo |
| Cupo | **100** (`seatCount`, publicado) |
| Premios | US$2.000 (1º) · US$500 (2º) — **US$2.500 en total** |
| Aplicación | CLI (`chofex register`) o agent |
| Selección | lo que ya construiste, cómo lo explicas, qué propuesta traes |
| Consejo | 5 jurados + 5 mentores, roster sin anunciar |
| Challenges | **3, sellados** hasta el kickoff del 17 oct ⚠️ ver §9 |

**Ningún deck sale con una cifra que no esté en esta tabla.** Es lo primero que
un sponsor verifica contra la landing.

> El pool de viajes de US$300 y los tracks `T-01`/`T-02` **ya no existen**; los
> premios son $2.500 y los tracks son 3 challenges sellados. Si ves esas cifras
> en un borrador, está desactualizado.

---

## 9. Los challenges: la decisión pendiente

La landing ahora dice **"3 challenges sellados"**: los equipos aceptados conocen
los briefs al iniciar la hackathon, el 17 de octubre, y cada equipo elige uno. El
sellado es parte de la convocatoria, no un accidente.

Pero el slide central de un deck a partner es *lo que el partner posee*, y el
tier sheet asume que eso es un challenge. **Los números calzan sospechosamente
bien: 3 challenges = 1 Title + 2 Challenge Partner.**

Lo que falta decidir no es si se revelan al público —eso ya está resuelto, no se
revelan— sino **qué relación tiene un partner con su challenge**:

- **Patrocina a ciegas.** El partner pone dinero sobre un brief que no conoce.
  Honesto con el sellado, pero casi imposible de vender: nadie compra lo que no
  puede leer.
- **Lo conoce bajo NDA.** Ve el brief antes, no lo escribe. El sellado se
  mantiene frente a los participantes, que es donde importa.
- **Lo co-escribe.** El partner da el problema y su producto es el camino
  natural. Es lo más vendible y lo más riesgoso: si se nota, el evento pierde
  credibilidad técnica.

La segunda es la que hace funcionar el tier sheet sin romper la convocatoria.
Pero es una decisión de Emmy, no del deck, y **vale $2.000** del sheet — sin ella
el tier medio no tiene producto y lo único vendible es visibilidad, justo el
marco prohibido de §1.

---

## 10. Reglas visuales

Identidad **Hack the Andes**, no Chofex. Chofex aparece como sponsor Title; no
pinta la paleta. (Regla ya cerrada en el brief, no reabrir.)

- Papel de fondo, tipografía en tinta. El deck es claro, no oscuro.
- `--deck-action` para etiquetas y acciones; `--deck-status` para numerales y
  reglas; `--deck-accent` solo como tinte — no sostiene texto.
- **Los roles se nombran por token, nunca por color.** Los nombres propios de la
  paleta cambian con cada rediseño; los roles no.
- Retícula compartida de 1px, sin gaps y sin radius (`.deck-table` / `.deck-cell`).
- Sombras duras (`0 2px 0`), nunca blur.
- Barlow Condensed para títulos, IBM Plex Mono para chrome y etiquetas.
- Sin gradientes, sin glassmorphism, sin emoji decorativo, sin ilustración
  genérica de SaaS.

---

## 11. Checklist antes de mandar un deck

- [ ] La tesis del slide 2 **falla** el test de intercambiabilidad.
- [ ] El partner **posee** algo nombrable: un challenge, un workshop, un premio, un
      puesto en el jurado.
- [ ] El plan de activación es ejecutable con la gente y el tiempo que hay.
- [ ] Hay un ask limpio y un fallback.
- [ ] Los beneficios son concretos, no adjetivos.
- [ ] Toda métrica prometida está en la columna ✅ de §5.
- [ ] Los hechos canónicos coinciden con `content.ts`.
- [ ] La fecha es la correcta.
- [ ] Ningún slide pasa de 40 palabras de prosa.
- [ ] El cierre enuncia un cambio, no promete un resultado.
- [ ] **El deck se entiende sin nadie narrándolo en vivo.**
