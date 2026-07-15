export function center(text, columns) {
    if (text.length >= columns) return text.slice(0, columns);
    const left = Math.floor((columns - text.length) / 2);
    const right = columns - text.length - left;
    return ' '.repeat(left) + text + ' '.repeat(right);
}

export function justify(left, right, columns) {
    const space = columns - left.length - right.length;

    // Si no entran en una sola línea, nunca truncar (perdería dígitos de un monto):
    // se pasa a una segunda línea con el valor alineado a la derecha.
    if (space <= 0) {
        return `${left}\n${right.length < columns ? right.padStart(columns) : right}`;
    }

    return left + ' '.repeat(space) + right;
}

export function wrapText(text, columns) {
    const words = String(text).split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;

        if (next.length > columns) {
            if (current) lines.push(current);
            current = word.slice(0, columns);
        } else {
            current = next;
        }
    }

    if (current) lines.push(current);

    return lines;
}
