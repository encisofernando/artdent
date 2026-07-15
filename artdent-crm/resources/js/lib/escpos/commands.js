import { encodeCp437 } from './charset';

const ESC = 0x1b;
const GS = 0x1d;

export const ALIGN = { LEFT: 0, CENTER: 1, RIGHT: 2 };

export class EscPosBuilder {
    constructor() {
        this.bytes = [];
        this.init();
    }

    push(...values) {
        this.bytes.push(...values);
        return this;
    }

    init() {
        this.push(ESC, 0x40);
        // FS . cancela el modo de caracteres chino/Kanji que muchos clones ESC/POS
        // traen activado de fábrica; sin esto, los bytes >= 0x80 (tildes, ñ) se
        // interpretan como el primer byte de un carácter de 2 bytes y corrompen
        // todo lo que viene después (incluido el QR).
        return this.push(0x1c, 0x2e);
    }

    align(mode) {
        return this.push(ESC, 0x61, mode);
    }

    bold(on = true) {
        return this.push(ESC, 0x45, on ? 1 : 0);
    }

    underline(on = true) {
        return this.push(ESC, 0x2d, on ? 1 : 0);
    }

    doubleSize(on = true) {
        return this.push(GS, 0x21, on ? 0x11 : 0x00);
    }

    // Solo el doble de alto (sin duplicar el ancho): resalta una línea sin
    // reducir a la mitad las columnas disponibles, así entra en un solo renglón.
    doubleHeight(on = true) {
        return this.push(GS, 0x21, on ? 0x01 : 0x00);
    }

    text(str) {
        const encoded = encodeCp437(str);

        for (let i = 0; i < encoded.length; i += 1) {
            this.bytes.push(encoded[i]);
        }

        return this;
    }

    line(str = '') {
        this.text(str);
        return this.push(0x0a);
    }

    feed(lines = 1) {
        return this.push(ESC, 0x64, lines);
    }

    hr(char = '-', width = 32) {
        return this.line(char.repeat(width));
    }

    // Recuadro real con caracteres de dibujo de cajas de CP437 (┌─┐ / │ │ / └─┘),
    // igual al "border: 2px solid #000" del diseño HTML original. `lines` ya debe
    // venir formateado (centrado/justificado) al ancho `columns - 2`.
    box(lines, columns) {
        const inner = columns - 2;
        this.line(`┌${'─'.repeat(inner)}┐`);

        (Array.isArray(lines) ? lines : [lines]).forEach((text) => {
            const padded = text.length >= inner ? text.slice(0, inner) : text + ' '.repeat(inner - text.length);
            this.line(`│${padded}│`);
        });

        return this.line(`└${'─'.repeat(inner)}┘`);
    }

    // Nunca usar spread acá: los raster de imágenes completas pueden tener
    // decenas de miles de bytes y `push(...bytes)` revienta el límite de
    // argumentos del motor JS (stack overflow) con arrays así de grandes.
    raw(bytes) {
        for (let i = 0; i < bytes.length; i += 1) {
            this.bytes.push(bytes[i]);
        }

        return this;
    }

    cut(partial = true) {
        this.feed(3);
        return this.push(GS, 0x56, partial ? 1 : 0);
    }

    toBytes() {
        return Uint8Array.from(this.bytes);
    }

    toBase64() {
        let binary = '';
        const bytes = this.toBytes();

        for (let i = 0; i < bytes.length; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    }
}
