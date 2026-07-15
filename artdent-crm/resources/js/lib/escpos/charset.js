// Tabla de la página de códigos por defecto (CP437) que trae de fábrica
// prácticamente cualquier impresora ESC/POS, incluida la 3nStar RPT006.
// Cubre los caracteres acentuados y signos usados en español.
const CP437_MAP = {
    ü: 0x81, é: 0x82, â: 0x83, ä: 0x84, à: 0x85, å: 0x86, ç: 0x87,
    ê: 0x88, ë: 0x89, è: 0x8a, ï: 0x8b, î: 0x8c, ì: 0x8d, Ä: 0x8e,
    Å: 0x8f, É: 0x90, æ: 0x91, Æ: 0x92, ô: 0x93, ö: 0x94, ò: 0x95,
    û: 0x96, ù: 0x97, ÿ: 0x98, Ö: 0x99, Ü: 0x9a, á: 0xa0, í: 0xa1,
    ó: 0xa2, ú: 0xa3, ñ: 0xa4, Ñ: 0xa5, ª: 0xa6, º: 0xa7, '¿': 0xa8,
    '¡': 0xad, '«': 0xae, '»': 0xaf, '°': 0xf8,
    // Caracteres de dibujo de cajas (IBM PC / CP437) — están en la página de
    // códigos estándar de fábrica, permiten recuadros y líneas sólidas reales
    // en vez de aproximarlos con guiones ASCII.
    '─': 0xc4, '│': 0xb3, '┌': 0xda, '┐': 0xbf, '└': 0xc0, '┘': 0xd9,
    '├': 0xc3, '┤': 0xb4, '┬': 0xc2, '┴': 0xc1, '┼': 0xc5,
};

// Puntuación "inteligente" típica de texto pegado desde Word/Office que CP437 no
// tiene: se aproxima al caracter ASCII más parecido en vez de imprimir "?".
const ASCII_FALLBACK_MAP = {
    '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"',
    '…': '.', '•': '*', ' ': ' ',
};

export function encodeCp437(str) {
    const bytes = [];

    for (const rawChar of String(str)) {
        const char = ASCII_FALLBACK_MAP[rawChar] ?? rawChar;
        const code = char.codePointAt(0);

        if (code < 0x80) {
            bytes.push(code);
            continue;
        }

        bytes.push(CP437_MAP[char] ?? 0x3f);
    }

    return bytes;
}
