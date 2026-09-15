# Presupuesto y tier sheet — Hack the Andes

Cuánto cuesta correr el evento y, en consecuencia, qué se le pide a un sponsor.
Los tiers de este documento **se derivan del presupuesto**; no son una escala
inventada. Si cambian los costos, cambian los tiers.

- **Owner:** Emmy Pardo · **Última revisión:** 14 sep 2026
- **Insumo de:** [`docs/sponsorship-deck-brief.md`](./sponsorship-deck-brief.md)
- **Regla:** este archivo es la **única** fuente de los números de tier. El deck
  y la landing leen de aquí. Ver §6.

> ⚠️ **Los costos unitarios son estimados, no cotizados.** Ninguna línea tiene
> todavía una cotización firmada. Están marcados y hay que reemplazarlos con
> cifras reales antes de comprometer un tier con un sponsor.

---

## 1. Supuestos (explícitos, para poder discutirlos)

| Supuesto | Valor | Estado |
| --- | --- | --- |
| Asistentes | 100 | **confirmado** — `seatCount` y publicado en la landing |
| Sede | Lima, una sola | decidido |
| Duración | 30 h continuas, con pernocte | decidido |
| Fechas | 17–18 oct 2026 | **resuelto** — consistente en toda `content.ts` |
| Tipo de cambio | S/ 3.35 / US$ | implícito en `prizeAmountsPen` |
| Premios | US$2.500 | `prizeAmountsUsd`, cerrado |

> El pool de viajes de US$300 **ya no existe**: `prizeAmountsUsd` quedó en
> `first` y `second`. Los premios bajaron de $2.800 a $2.500.

El pernocte es lo que separa este presupuesto de un hackathon de un día: obliga
a siete servicios de alimentación, seguridad nocturna y sede tomada 30 horas
seguidas. Es la razón de que el costo por hacker sea más alto que el de un
evento de 12 h.

---

## 2. Operación

| Concepto | Unitario | Cant. | USD | Nota |
| --- | ---: | ---: | ---: | --- |
| Alimentación (7 servicios) | $39 | 100 | **$3.900** | desglose en §3 |
| Swag (polo, stickers, lanyard) | $10 | 100 | **$1.000** | ⚠️ estimado |
| Sede 30 h + seguridad nocturna | — | — | **$1.200** | ⚠️ candidato a in-kind |
| Internet dedicado, energía, regletas | — | — | **$400** | no negociable técnicamente |
| Señalética, banners, impresión | — | — | **$350** | incluye piezas de sponsors |
| Mobiliario extra y limpieza nocturna | — | — | **$300** | |
| Producción audiovisual (foto/video) | — | — | **$500** | insumo del recap y del deck 2027 |
| Botiquín, seguro y contingencia | — | — | **$600** | ~8% del subtotal |
| **Subtotal operación** | | | **$8.250** | |

## 3. Desglose de alimentación

Siete servicios, porque el evento cruza una noche:

| Servicio | USD/pax |
| --- | ---: |
| Día 1 · almuerzo | $8 |
| Día 1 · snacks tarde | $3 |
| Día 1 · cena | $8 |
| Madrugada · café y snacks | $4 |
| Día 2 · desayuno | $5 |
| Día 2 · almuerzo | $8 |
| Día 2 · snacks de cierre | $3 |
| **Total por hacker** | **$39** |

## 4. Total a financiar

| | USD | PEN |
| --- | ---: | ---: |
| Operación | $8.250 | S/ 27,638 |
| Premios | $2.500 | S/ 8,375 |
| **Total** | **$10.750** | **S/ 36,013** |

**Costo de operación por hacker: $82,50.** Si el cupo se mueve, esta cifra es la
que hay que multiplicar — no el total.

---

## 5. El tier sheet

Cuatro niveles. El ask principal a devtools sigue siendo **créditos de producto**
(in-kind); el cash es lo que cierra el presupuesto.

| Tier | Aporte | PEN | Slots | Qué incluye |
| --- | ---: | ---: | :---: | --- |
| **Stack Partner** (title) | $2.500 | S/ 8,375 | 1 | **Herramienta obligatoria** para los 100 · exclusividad de capa · lockup junto a la marca · keynote de apertura · workshop · puesto en el jurado · mentor en sala |
| **Core Partner** | $1.000 | S/ 3,350 | 2 | **Herramienta obligatoria** para los 100, en otra capa · exclusividad de capa · workshop de 45 min · mentor en sala · demo en premiación |
| **Toolkit Partner** | $500 | S/ 1,675 | 6 | Créditos en el kit oficial, **uso opcional** · logo en la grilla · mención en kickoff y premiación · logo en el recap |
| **In-kind** | producto | — | ∞ | Sede, comida, swag, mentores, jurado, premios adicionales |

**Chofex ocupa el slot Stack Partner**: la landing ya lo llama "Sponsor
principal".

Toolkit está fijado en **$500 a propósito**: es el umbral que en la mayoría de
devtools entra en presupuesto discrecional de DevRel sin pasar por legal. Bajarlo
no acelera el sí; subirlo lo manda a un comité.

> **Los tiers ya no se venden por challenge.** Los 3 challenges son producto de
> participante y van sin marca. Lo que se vende es **obligatoriedad de uso**: la
> herramienta del partner entra en los requisitos de entrega.
>
> Por eso el sheet abre **exactamente 3 slots obligatorios** (1 Stack + 2 Core),
> uno por capa del stack. El tope no es comercial, es de producto: cada
> integración obligatoria cuesta entre 1 y 3 de las 30 horas del equipo. Las
> cuatro reglas están en `deck-best-practices.md` §9.

### Cuántos slots abre la landing

**9 slots nombrados** (1 Stack + 2 Core + 6 Toolkit), más in-kind sin límite.

⚠️ **La grilla de sponsors ya no existe.** El rediseño de la landing eliminó
`sponsorSlots`; hoy hay una sola marca ("Sponsor principal · Chofex",
`sponsorsCopy`). Prometer "logo en la grilla" en el tier Toolkit exige
**reconstruir esa sección**, no actualizar un array. Es trabajo pendiente y hay
que hacerlo antes de cobrar un Toolkit.

---

## 6. ¿Cierra?

Cash con el sheet **lleno**: $2.500 + $2.000 + $3.000 = **$7.500**.
Total a financiar: **$10.750**. Cash solo no alcanza — y eso es por diseño, no
un error: la brecha se cierra con in-kind.

**In-kind objetivo — $3.700:**

| Pieza | USD absorbidos | Candidato |
| --- | ---: | --- |
| Sede | $1.200 | universidad o corporativo con auditorio |
| Alimentación parcial | $1.500 | marca de comida o bebida |
| Swag | $1.000 | imprenta o sponsor de marca |

| | USD |
| --- | ---: |
| Total a financiar | $10.750 |
| − In-kind objetivo | −$3.700 |
| **Necesidad en cash** | **$7.050** |
| Cash si el sheet se llena | $7.500 |
| **Margen** | **+$450** |

Cierra con un margen pequeño. Eso significa que **el sheet tiene poca holgura**:
si falla una pieza de in-kind o no se venden los 6 Toolkit, hay déficit.

### Escenario realista (no el lleno)

Si se venden 3 Toolkit de 6 y falta el in-kind de comida:

| | USD |
| --- | ---: |
| Cash (Stack + 2 Core + 3 Toolkit) | $6.000 |
| In-kind logrado (sede + swag) | $2.200 |
| Cubierto | $8.200 |
| **Déficit** | **−$2.550** |

**Palancas, en orden de preferencia:**

1. **Sede in-kind es la de mayor retorno individual** ($1.200 y además da
   legitimidad institucional). Priorizar universidades antes que cash.
2. **Reducir el cupo.** Cada 10 hackers menos son $825 de operación. Es la
   palanca más rápida y la menos popular.
3. **Subir Toolkit de 6 a 10 slots.** +$2.000. Costo: la grilla de la landing
   empieza a verse como un directorio, no como un cartel.
4. **Premio adicional pagado por un partner** en vez de por el evento. No baja
   el costo, lo traslada.

> **Lo que no es palanca: recortar los premios.** Los US$2.500 están publicados
> en la landing y son argumento de convocatoria.

---

## 7. Pendientes que mueven estos números

1. **Reconstruir la grilla de sponsors.** El rediseño la eliminó. Sin ella, el
   tier Toolkit promete algo que no existe.
2. **Cotizar de verdad** las cinco líneas marcadas ⚠️.
3. **Definir las 3 capas obligatorias antes de vender la primera.** Al cerrar un
   Stack o un Core se cierra su capa para todo el evento (regla 3 de
   `deck-best-practices.md` §9). Vender por orden de llegada, sin decidir qué
   capas se abren, es cómo se termina con dos proveedores de inferencia y una
   promesa de exclusividad imposible de cumplir.
4. **Escribir la obligatoriedad en los requisitos de entrega.** Es lo que
   convierte el tier en producto: sin reglamento, sin verificación del jurado y
   sin mención en el kickoff, "obligatorio" no existe. **Esto vale $4.500 del
   sheet** — los tres slots obligatorios completos.

> El cupo de 100 y las fechas ya no son pendientes: `seatCount` está publicado y
> el 17–18 oct es consistente en toda `content.ts`.

---

## 8. Regla de fuente única

Este archivo es la única fuente de los montos y slots de tier. Cuando cambien:

1. Se edita **aquí** primero.
2. Se actualiza la sección de sponsors de la landing (hoy `sponsorsCopy`; una
   grilla multi-slot todavía está por construirse).
3. Se actualiza `apps/web/content/decks/main/06-tiers.mdx`.

> El sistema del que se portó este documento tiene el mismo tier sheet escrito
> con tres números distintos en tres archivos (Silver ×3, ×5 y ×8). No es un
> descuido evitable con cuidado: es lo que pasa sin una regla de fuente única.
