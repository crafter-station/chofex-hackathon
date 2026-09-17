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

**Lo que se vende es adopción obligatoria.** La herramienta del partner entra en
los requisitos de entrega: un proyecto que no la usa no compite. Eso convierte
la métrica de "esperamos que algunos equipos lo prueben" en **el 100% de las
soluciones, garantizado por las reglas**. Es la oferta más fuerte que tenemos y
es la única que no depende de que a la gente le dé la gana.

### El marco que se usa

- *"[X] es requisito de entrega: los 100 builders lo integran o no compiten."*
- *"Cada proyecto de Hack the Andes corre sobre [X]."*
- *"[X] es la capa de [categoría] del stack oficial, en exclusiva."*

### El marco que está prohibido

- "Logo en la web" como valor principal.
- "Exposición masiva", "alcance", "visibilidad de marca" como argumento central.
- Cualquier promesa de ingresos, conversión o pipeline.
- **"Los equipos podrán usar [X] si quieren."** Un tier de herramienta
  obligatoria que en la práctica es opcional es la forma más rápida de no
  vender una segunda edición.

> **Nota sobre nuestro inventario actual.** El brief lista siete contrapartidas
> —logo en landing, post de anuncio, plantilla de imagen, banners, badges,
> menciones en kickoff y premiación— y **las siete son visibilidad**. Sirven como
> relleno de tier, nunca como la tesis de un deck. Si un deck nuestro no puede
> nombrar **en qué capa del stack entra la herramienta del sponsor y con qué
> obligatoriedad**, todavía no está listo para mandarse.

---

## 2. Los dos tipos de deck

### Deck general (`main` en ES, `en` en EN)

Cuando la categoría del partner todavía no está definida, o cuando se contacta
devtools en lote. Flujo:

1. Portada
2. Qué es Hack the Andes
3. **Cómo se filtra** ← nuestro sustituto del track record (ver §4)
4. Datos del evento
5. Premios oficiales
6. **El stack obligatorio** ← el producto que se vende (ver §9)
7. **Qué capa sería tuya** ← la exclusividad, nombrada
8. **Tiers**
9. Por qué patrocinar aquí y no en otro evento
10. Qué se reporta después
11. Cierre

Es el orden de `content/decks/main/`. Los slides 6 y 7 van **antes** de los
tiers a propósito: sin entender que se venden capas del stack, y cuáles, los
precios del 8 no significan nada.

El 7 existe porque la primera pregunta de un devtool es *¿qué capa sería mía?*,
y un slide de tiers que muestra cupos (1, 2, 6) no la contesta. Nombra las cinco
capas candidatas, dice que se abren tres, y que quien firma primero elige. No
afirma cuáles se abren, porque eso todavía no está decidido — ver la pregunta
abierta #1 del brief.

### Deck a partner específico

Cuando hay una tesis de por qué *esa* empresa. Flujo:

1. Portada con la tesis específica
2. Por qué este partner y por qué ahora
3. Qué es Hack the Andes
4. Datos y audiencia
5. Cómo se filtra
6. **La capa del stack que el partner ocupa** — nombrada: "inferencia",
   "base de datos", "auth". Y qué queda cerrado para la competencia.
7. Qué significa obligatorio para un equipo: el starter kit, la integración
   mínima, en qué punto de las 30 horas la resuelven
8. Ejemplos concretos de lo que se construiría con su producto
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
| Preferido | **$2.500 Stack Partner** — herramienta obligatoria, capa en exclusiva |
| Alternativa | **$1.000 Core Partner** — herramienta obligatoria en otra capa |
| Devtools en lote | **$500 Toolkit** — créditos en el kit, uso opcional |
| Siempre, además | créditos, licencias, mentores, jurado, swag, sede, workshops, premio propio |

**El ask de créditos nunca va solo.** Créditos sin obligatoriedad es un cupón que
nadie canjea; obligatoriedad sin créditos es pedirle a 100 personas que paguen
por una herramienta en un fin de semana. Los dos juntos son el producto.

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

## 9. El stack obligatorio

**Los partners no son dueños de challenges.** Los 3 challenges son producto de
participante: sellados hasta el kickoff, elegidos por cada equipo, sin marca
encima. Lo que un partner compra es otra cosa: **que su herramienta sea
requisito de entrega.**

### Las cuatro reglas

**1. Tope de 3 herramientas obligatorias.** Es el número, no una aspiración.
Cada integración obligatoria le cuesta a un equipo entre una y tres horas de
las 30 que tiene. A la cuarta, el evento deja de ser un hackathon y pasa a ser
un tutorial de integraciones, y lo que se entrega es peor — que es exactamente
lo que un sponsor no quiere que su logo acompañe.

**2. Una por capa.** Las tres obligatorias van en capas distintas del stack
—inferencia, datos, auth, infra, observabilidad, voz— para que compongan en vez
de competir. Dos herramientas de la misma capa **no pueden ser ambas
obligatorias**: se pisan, y obligar a usar las dos es pedirle al equipo que
integre lo mismo dos veces.

**3. Exclusividad de categoría, y es estructural.** Se deriva de la regla 2, no
es un perk que se regala en el tier alto. Si un partner ocupa la capa de
inferencia, esa capa está cerrada para el resto del evento.

**4. Obligatorio significa verificable.** Entra en los requisitos de entrega,
se dice en el kickoff, y el jurado lo comprueba antes de evaluar. Sin eso,
"obligatorio" es una promesa que no podemos cumplir y el sponsor lo va a
descubrir leyendo las submissions.

### Lo que esto compra, dicho con números

| Oferta | Lo que se puede prometer |
| --- | --- |
| Herramienta obligatoria | **100% de las submissions** la integran |
| Créditos en el kit | cuentas activadas, créditos consumidos |
| Workshop | asistencia y feedback técnico en sala |

La primera fila es la única cifra que podemos **garantizar por reglamento** en
vez de estimar. Es el argumento central de cualquier deck nuestro.

### El riesgo que hay que decir en voz alta

Obligar herramientas estrecha lo que los equipos pueden construir. La mitigación
es elegir **infraestructura de capa** (un proveedor de inferencia, una base de
datos, un auth) y no producto opinado que decide la forma de la solución. Si una
obligatoria no encaja con un challenge, el que pierde es el evento — y con él la
segunda edición.

---

## 10. Reglas visuales

Identidad **Hack the Andes**, no Chofex. Chofex aparece como sponsor principal; no
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
