const GS = 0x1d;

export const BARCODE_TYPE = {
    UPC_A: 65,
    EAN13: 67,
    CODE128: 73,
};

export function buildBarcodeBytes(data, { type = BARCODE_TYPE.CODE128, height = 80, width = 2 } = {}) {
    const dataBytes = Array.from(new TextEncoder().encode(data));
    const payload = type === BARCODE_TYPE.CODE128
        ? [0x7b, 0x42, ...dataBytes] // {B fuerza modo B (ASCII completo) en CODE128
        : dataBytes;

    return [
        GS, 0x68, height, // altura del código
        GS, 0x77, width, // ancho del módulo
        GS, 0x48, 2, // imprimir el texto (HRI) debajo del código
        GS, 0x6b, type, payload.length, ...payload,
    ];
}
