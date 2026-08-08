// toISOString() siempre convierte a UTC. En Argentina (UTC-3), entre las
// 21:00 y las 23:59 hora local eso ya cae en el día siguiente en UTC — un
// input de fecha "de hoy" armado con toISOString().slice(0, 10) termina
// mandando la fecha de mañana. Estas dos funciones arman el string
// YYYY-MM-DD a partir de los componentes de fecha LOCALES del navegador.

export function todayIso() {
    return toLocalDateIso(new Date());
}

export function toLocalDateIso(date) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
