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

**No se pide efectivo, y no se pone una cifra.** Los devtools ya tienen montos
fijos que dan —uno siempre da $20 por persona, otro $50— y no los van a cambiar
por nosotros. Poner un número solo sirve para que uno de los dos se sienta
fuera.

Lo que el deck le pide al sponsor no es *cuánto*, es **hasta dónde**:

| Tier | Lo que da |
| --- | --- |
| **Kit** | Créditos para los 100 participantes |
| **Kit + podio** | Y créditos para el podio |
| **Kit + podio + sala** | Y una persona que dé el workshop |

Cada escalón agrega sobre el anterior, y la escalera tiene una sola variable:
**el alcance de los créditos**, hasta que el tercero agrega gente.

El tercero es el que conviene entender bien: **no cuesta más plata, cuesta más
gente.** Pide un vuelo, dos días y un DevRel. Eso cambia a quién se le vende —
un devtool con equipo en la región puede decir que sí sin presupuesto, y uno sin
gente en Perú no puede aunque quiera.

Slots y contrapartidas vienen de [`budget-sponsors.md`](./budget-sponsors.md),
que es la única fuente.

**Un solo ask por mensaje.** El deck puede mostrar los tres tiers; el correo que
lo acompaña pide uno.

> **Este deck es para devtools.** Una empresa que quiere poner dinero, un lugar
> de comida, alguien que pone merch o la sede no compran nada de esto: no tienen
> créditos, no les sirve un reporte de uso, y "tu herramienta en manos de 100
> builders" no les dice nada.
>
> Ésos van por **`content/decks/aliados`**, que vende otra cosa —estar en la
> sala— con la escalera en efectivo de `budget-sponsors.md` §5.

---

## 4. Qué es nuevo y qué no

Esta sección decía que no teníamos track record y que el filtro era su
sustituto. **Estaba mal, y se estaba regalando el mejor argumento del deck.**

The Next Craft lo corre **el mismo equipo** que Crafter Station. Bogotá y Lima ya
pasaron, con marcas grandes en la pared de sponsors. Lo nuevo es el formato de
Hack the Andes, no la gente que lo monta.

La distinción tiene que ser exacta en los dos sentidos, porque las dos mitades
se pueden verificar:

- ✅ *"Primera edición de este formato."*
- ✅ *"No es nuestra primera hackathon: Bogotá y Lima."*
- ❌ *"Primera edición, sin track record."* — falso, y encima renuncia a la
  respuesta de la objeción que todo sponsor tiene con un evento nuevo: *¿ustedes
  saben hacer esto?*
- ❌ Cualquier número de ediciones, asistentes o marcas que no venga de alguien
  que los contó.

**Las fotos son la prueba.** Van en escala de grises, como plancha de un slide
donde la foto es el tema —no de fondo bajo un párrafo, que es donde no se leen
ni ellas ni el texto— y los logos que aparecen en la pared del fondo son parte
de la evidencia, no un accidente que haya que recortar.

Y el **filtro sigue siendo argumento**, solo que ya no como sustituto de nada:

- Aplicación por CLI (`chofex register`) o por agent — el formulario ya es un
  filtro técnico.
- Se revisa **lo que la persona ya construyó**, no su CV.
- Corte explícito en 100: no es un evento abierto.

**Regla:** el equipo tiene historial y el evento no. Ningún deck confunde los
dos, en ninguna de las dos direcciones.

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

**La slide de la oferta es la excepción, y es la única.** Lleva dos ejes —lo que
el sponsor da y lo que recibe— y eso no entra en 40 palabras sin romper la
oferta. Hoy está en 51. El presupuesto existe para que nadie escriba párrafos en
un slide, y ahí no hay uno solo: son etiquetas de tres columnas. Si alguna vez
pasa de ~55, lo que sobra es contrapartida, no palabras.

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

## 9. El kit y el podio

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

### 2. Créditos para el podio

A partir del segundo tier el partner suma créditos para los equipos que ganan.
Es lo que reemplaza a la obligatoriedad como motor de uso: no obliga, tira. Y no
le quita horas a nadie — el equipo ya estaba compitiendo.

⚠️ **Pendiente.** El evento premia **dos** puestos (`content.ts`: `first` y
`second`), y la conversación que definió este modelo describía **tres**. O el
evento suma un tercer puesto, o los créditos se reparten en dos. No pueden
convivir: el sponsor lee "créditos para el podio" dos slides después de ver un
podio de dos.

### Lo que esto compra, dicho con números

| Oferta | Lo que se puede prometer |
| --- | --- |
| Créditos en el kit | **100 kits entregados**; claims y cuentas creadas |
| Créditos para el podio | ganador nombrado, mención en la premiación |
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
- [ ] El partner **posee** algo nombrable: los créditos del podio, el workshop.
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
