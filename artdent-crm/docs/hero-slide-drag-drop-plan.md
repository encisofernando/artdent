# Hero Slides: Drag & Drop de Contenido

## Estado actual

El modo `editorial` del carrusel hero ya permite definir:

- tipo de slide
- imagen
- textos
- CTA
- alineacion
- ancho del bloque
- altura
- tipografia
- tamaños
- overlay
- superficie
- colores

Hoy la posicion del contenido se resuelve de forma estructurada a partir de:

- `content_align`
- `content_width`
- `height_mode`

Esto mantiene el hero estable y responsive, pero no permite ubicar libremente el contenido desde la preview.

## Objetivo futuro

Permitir mover visualmente el bloque de contenido dentro del preview del CRM y que esa posicion se replique en el carrusel del shop.

## Recomendacion tecnica

La opcion mas profesional y segura es:

- arrastrar el bloque editorial completo, no cada texto por separado
- guardar la posicion como porcentajes sobre un canvas base de `1440x450`
- aplicar esa posicion solo en desktop
- mantener layout automatico en mobile para no romper legibilidad

## Por que conviene mover el bloque completo

Ventajas:

- UX mas simple
- menos riesgo de romper la composicion
- responsive mas predecible
- menos datos que persistir
- mantiene coherencia entre preview y shop

No recomendado como primera etapa:

- mover titulo, subtitulo, descripcion y boton por separado

Eso agrega mucha complejidad en:

- colisiones
- solapamientos
- responsive
- validaciones visuales
- persistencia individual de cada capa

## Modelo de datos sugerido

Agregar a `hero_slides`:

- `content_offset_x`
- `content_offset_y`

Sugerencia:

- tipo `decimal`
- rango esperado `0..100`
- expresados como porcentaje del canvas base

Ejemplo:

- `content_offset_x = 6.5`
- `content_offset_y = 14.0`

## Comportamiento esperado

### En CRM

- el preview muestra el bloque editorial draggable
- al arrastrar, se actualiza la posicion visual en tiempo real
- opcionalmente puede mostrarse una grilla suave o guias
- el formulario guarda esos offsets al presionar `Crear slide` o `Actualizar`

### En shop

- en desktop, el bloque editorial usa la posicion guardada
- en mobile, se ignoran offsets libres y se usa layout automatico
- si no hay offsets guardados, se usa el comportamiento actual

## Compatibilidad

Debe mantenerse compatibilidad total con:

- slides `image`
- slides `editorial` ya existentes
- fallback actual del hero

Los offsets deben ser opcionales.

## Fases recomendadas

### Fase 1

- drag & drop del bloque editorial completo
- guardado de `content_offset_x` y `content_offset_y`
- aplicacion solo en desktop

### Fase 2

- snap opcional a guias
- boton `centrar`
- boton `resetear posicion`
- limites visuales para no sacar el bloque del canvas

### Fase 3

- si alguna vez hiciera falta, evaluacion de mover elementos internos por separado

## Reglas de UX recomendadas

- no permitir arrastrar fuera del area visible segura
- limitar posiciones extremas
- mantener preview y shop con la misma proporcion base
- mostrar feedback visual sutil al arrastrar
- evitar controles invasivos sobre la imagen

## Decision tomada por ahora

Se deja para una etapa posterior.

Cuando se implemente, la base recomendada es:

1. offsets porcentuales
2. drag del bloque completo
3. desktop libre + mobile automatico
4. compatibilidad con el editor actual
