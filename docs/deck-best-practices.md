# Cómo se escribe un deck de patrocinio — Hack the Andes

La doctrina. Qué vende un deck, en qué orden, con cuánto texto y con qué
números. Portada de The Next Craft (42 decks en producción) y adaptada a lo que
somos: **primera edición, una sede, ~100 asistentes**.

- **El motor** (cómo se monta un deck en código): [`docs/deck-system.md`](./deck-system.md)
- **Los números** (tiers, presupuesto): [`docs/budget-sponsors.md`](./budget-sponsors.md)
- **El insumo de contenido**: [`docs/sponsorship-deck-brief.md`](./sponsorship-deck-brief.md)

---

## 1. El principio

> **Un deck no vende espacio para un logo. Vende adopción medida, con evidencia.**

Un sponsor de devtools no compra visibilidad: compra que 100 personas
seleccionadas tengan sus créditos en la mano, un motivo para abrirlos, y un
reporte de lo que pasó. La visibilidad es el envoltorio, no el producto.

**Nada es obligatorio.** Ninguna herramienta entra en los requisitos de entrega.
Lo que se ofrece son dos palancas honestas:

1. **Créditos para los 100**, en el kit oficial. Quien los necesite, los usa.
2. **Un galardón propio en créditos** — "Mejor uso de X" — con su ganador y su
   mención en la premiación. No obliga: tira.

Y encima de las dos, lo que de verdad nos diferencia: **el reporte**. Un logo en
una web no se puede medir; kits reclamados, cuentas creadas y proyectos que lo
nombran, sí.

### El marco que se usa

- *"Los 100 builders reciben tus créditos en el kickoff."*
- *"Tu galardón tiene ganador propio y se nombra en la premiación."*
- *"Al cierre te mandamos un reporte de qué se reclamó y qué se usó."*

### El marco que está prohibido

- "Logo en la web" como valor principal.
- "Exposición masiva", "alcance", "visibilidad de marca" como argumento central.
- Cualquier promesa de ingresos, conversión o pipeline.
- **Prometer adopción.** No la controlamos. Se mide después y se reporta; no se
  promete antes.
- Cualquier lenguaje de obligatoriedad: "requisito de entrega", "el 100% lo
  integra", "exclusividad de capa". Describe un modelo que ya no existe.

> **Nota sobre el inventario.** El brief lista siete contrapartidas —logo,
> post de anuncio, plantilla de imagen, banners, badges, menciones— y **las
> siete son visibilidad**. Sirven como relleno de tier, nunca como tesis. Si un
> deck nuestro no puede nombrar **qué créditos entran al kit, qué galardón posee
> el partner y qué se le va a reportar**, todavía no está listo para mandarse.

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
6. **Por qué lo van a usar** ← el kit y el galardón (ver §9)
7. **Una por categoría** ← la exclusividad, y de dónde sale ahora
8. **Tiers**
9. Por qué patrocinar aquí y no en otro evento
10. Qué se reporta después
11. Cierre

Es el orden de `content/decks/main/`. Los slides 6 y 7 van **antes** de los
tiers a propósito: sin entender que se venden capas del stack, y cuáles, los
precios del 8 no significan nada.

El 7 existe porque la primera pregunta de un devtool es *¿con quién comparto el
kit?*, y un slide de tiers que muestra cupos no la contesta. Nombra las cinco
categorías y dice que se cierra una por partner.

### Deck a partner específico

Cuando hay una tesis de por qué *esa* empresa. Flujo:

1. Portada con la tesis específica
2. Por qué este partner y por qué ahora
3. Qué es Hack the Andes
4. Datos y audiencia
5. Cómo se filtra
6. **La categoría que el partner cierra** — nombrada: "inferencia",
   "base de datos", "auth". Y qué queda cerrado para la competencia.
7. Cómo llega su producto a un equipo: el kit, la cuenta, y en qué punto de las
   30 horas lo abrirían
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
| Preferido | **Title Partner $1.000** — galardón propio, keynote, jurado |
| Alternativa | **Award Partner $500** — galardón propio, espacio mayor, reporte de uso |
| Devtools en lote | **Kit Partner $200** — galardón propio, créditos en el kit |
| Siempre, además | créditos para el kit, licencias, mentores, jurado, swag, sede, workshops |

**No se pide efectivo.** Todo el aporte es en créditos: para un devtool el costo
marginal es casi cero, que es exactamente por qué este modelo funciona sin caja.

**Los montos son el galardón, no el kit.** Los créditos del kit se negocian
aparte y no llevan cifra en el deck, porque el volumen razonable depende de qué
cuesta una hora de ese producto.

Montos y slots vienen de [`budget-sponsors.md`](./budget-sponsors.md), que es la
única fuente. No los escribas de memoria en un slide.

**Un solo ask por mensaje.** El deck puede mostrar los tres tiers; el correo que
lo acompaña pide uno.

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

Tres columnas, no dos, y la del medio es la que se olvidaba.

| ✅ Contamos nosotros | 🤝 Nos lo comparte el partner | ❌ No se promete |
| --- | --- | --- |
| Kits entregados y reclamados | Cuentas activadas | Ingresos |
| Cuentas creadas con nuestro código | Créditos consumidos | Valor de pipeline |
| Proyectos que lo nombran en la entrega | API calls, minutos, runs | Tasa de conversión |
| Demos que lo muestran, repos | Retención posterior | Contrataciones |
| Asistencia al workshop, feedback en sala | | Cobertura de prensa |

La primera columna la instrumentamos nosotros y se puede prometer. **La segunda
no.** Sale de los sistemas del partner, y un deck que la promete está
comprometiendo un dato que no controla — se pide en el trato, con la fórmula
*"si nos compartís el consumo, va en el mismo reporte"*.

La tercera depende del negocio del sponsor y no se toca nunca. Prometerla es lo
que quema una relación para la segunda edición.

Si un deck menciona una métrica, de qué columna sale va en el mismo slide.

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

## 9. El kit y el galardón

**Los partners no son dueños de challenges.** Los 3 challenges son producto de
participante: sellados hasta el kickoff, elegidos por cada equipo, sin marca
encima. Y **tampoco son dueños de una obligación**: ninguna herramienta es
requisito de entrega.

Lo que un partner compra son dos cosas concretas.

### 1. Créditos en el kit

Los 100 aceptados reciben el kit oficial en el kickoff. Los créditos del partner
van ahí. Uso opcional, y eso se dice en el deck sin adornos: *quien lo necesite,
lo usará.*

**Una por categoría.** El kit lleva una sola herramienta por categoría
—inferencia, datos, auth, infra, observabilidad— para que los créditos de un
partner no se diluyan entre cuatro de lo mismo. La exclusividad sigue siendo
real y sigue cerrando ventas; lo que cambió es la razón: antes era *nadie más
puede ser obligatorio en tu capa*, ahora es *tus créditos no compiten con otros
tres iguales*.

### 2. Un galardón propio

El partner pone un premio en créditos con **su nombre y su ganador**: "Mejor uso
de X". Es lo que reemplaza a la obligatoriedad como motor de uso, y es mejor por
dos razones: no le quita horas al equipo, y no compite con el premio en efectivo
—tiene su propia categoría, así que $500 en créditos no se lee al lado de
$2.000 en plata.

También es lo que hace que el partner **posea algo nombrable**, que es un punto
del checklist de §11.

### Lo que esto compra, dicho con números

| Oferta | Lo que se puede prometer |
| --- | --- |
| Créditos en el kit | **100 kits entregados**; claims y cuentas creadas |
| Galardón propio | ganador nombrado, mención en la premiación |
| Workshop | asistencia y feedback técnico en sala |

Ninguna fila promete adopción. La primera es lo único garantizado por
construcción: el kit se entrega a los 100 porque nosotros lo entregamos.

### El riesgo que hay que decir en voz alta

**El reporte es lo mejor que vendemos y el dato de consumo no es nuestro.**
Kits reclamados, cuentas creadas y proyectos que lo mencionan los contamos
nosotros. Créditos consumidos y API calls salen de los sistemas del partner. El
deck promete solo lo primero, y lo segundo se pide como parte del trato: *si nos
compartís el consumo, va en el mismo reporte.* Prometer un número que depende de
un tercero es cómo se quema una relación para la segunda edición.

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
- [ ] El partner **posee** algo nombrable: su galardón, un workshop, un puesto
      en el jurado.
- [ ] Ninguna métrica de la columna 🤝 de §5 aparece como promesa.
- [ ] Ningún slide habla de obligatoriedad, requisito de entrega ni exclusividad
      de capa: describen un modelo que ya no existe.
- [ ] El plan de activación es ejecutable con la gente y el tiempo que hay.
- [ ] Hay un ask limpio y un fallback.
- [ ] Los beneficios son concretos, no adjetivos.
- [ ] Toda métrica prometida está en la columna ✅ de §5.
- [ ] Los hechos canónicos coinciden con `content.ts`.
- [ ] La fecha es la correcta.
- [ ] Ningún slide pasa de 40 palabras de prosa.
- [ ] El cierre enuncia un cambio, no promete un resultado.
- [ ] **El deck se entiende sin nadie narrándolo en vivo.**
