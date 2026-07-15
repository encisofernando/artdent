// Navegación entre períodos (anterior/siguiente) para los selectores "Hoy/Semana/Mes/Año"
// de los dashboards. Recibe siempre fechas en formato local 'YYYY-MM-DD' para evitar
// corrimientos de huso horario al construir/parsear objetos Date.

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toLocalDateInput(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Etiqueta legible en español del rango de fechas resuelto para un período
 * ("julio 2026", "2026", "01 – 07 jul 2026", "06 jul 2026").
 */
export function formatPeriodRangeLabel(period, start, end) {
    if (!start || !end) { return ""; }
    const [ys, ms, ds] = start.split("-").map(Number);
    const [ye, me, de] = end.split("-").map(Number);
    if (period === "year") { return `${ys}`; }
    if (period === "month") { return `${MONTHS_ES[ms - 1]} ${ys}`; }
    if (period === "today") { return `${ds} ${MONTHS_ES[ms - 1]} ${ys}`; }
    return ys === ye && ms === me
        ? `${ds} – ${de} ${MONTHS_ES[me - 1]} ${ye}`
        : `${ds} ${MONTHS_ES[ms - 1]} – ${de} ${MONTHS_ES[me - 1]} ${ye}`;
}

/**
 * Devuelve la nueva fecha de referencia (string 'YYYY-MM-DD') al mover el período
 * un paso hacia atrás (direction = -1) o hacia adelante (direction = 1).
 */
export function shiftReferenceDate(period, dateStr, direction) {
    const d = parseLocalDate(dateStr);

    switch (period) {
        case 'today':
            d.setDate(d.getDate() + direction);
            break;
        case 'week':
            d.setDate(d.getDate() + direction * 7);
            break;
        case 'year':
            d.setFullYear(d.getFullYear() + direction);
            break;
        case 'month':
        default:
            d.setMonth(d.getMonth() + direction);
            break;
    }

    return toLocalDateInput(d);
}

/**
 * True si la fecha de referencia dada cae dentro del período actual (hoy/esta
 * semana/este mes/este año) — se usa para deshabilitar la flecha "siguiente".
 */
export function isCurrentPeriod(period, dateStr) {
    const d = parseLocalDate(dateStr);
    const now = new Date();

    switch (period) {
        case 'today':
            return d.toDateString() === now.toDateString();
        case 'year':
            return d.getFullYear() === now.getFullYear();
        case 'week': {
            const startOfWeek = (date) => {
                const day = (date.getDay() + 6) % 7; // lunes = 0
                const s = new Date(date);
                s.setDate(date.getDate() - day);
                s.setHours(0, 0, 0, 0);
                return s;
            };
            return startOfWeek(d).getTime() === startOfWeek(now).getTime();
        }
        case 'month':
        default:
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
}
