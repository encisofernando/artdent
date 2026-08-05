// Conversión de un bitmap (ImageData de <canvas>) a comandos ESC/POS
// GS v 0 (bit image raster). Compartido por logoRaster.js (una imagen
// chica) y por el renderer de tickets completos (renderJobTicket.js), que
// dibuja el ticket entero a mano en un canvas para que lo impreso sea
// literalmente el mismo bitmap que el preview en pantalla — no dos
// renders independientes (texto ESC/POS vs CSS) que puedan desalinearse.
const GS = 0x1d;

export function imageDataToRasterBytes(imageData, width, height, threshold = 180) {
    const widthBytes = Math.ceil(width / 8);
    const raster = new Uint8Array(widthBytes * height);
    const { data } = imageData;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];
            const gray = alpha < 128
                ? 255
                : (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);

            if (gray < threshold) {
                const byteIndex = y * widthBytes + Math.floor(x / 8);
                const bitIndex = 7 - (x % 8);
                raster[byteIndex] |= (1 << bitIndex);
            }
        }
    }

    const header = [GS, 0x76, 0x30, 0x00, widthBytes & 0xff, (widthBytes >> 8) & 0xff, height & 0xff, (height >> 8) & 0xff];
    const result = new Uint8Array(header.length + raster.length);
    result.set(header, 0);
    result.set(raster, header.length);

    return result;
}

// Algunos clones ESC/POS baratos (como el módulo que trae la 3nStar RPT006S)
// tienen buffer limitado y se cuelgan o cortan la imagen con un GS v 0 de
// muchas líneas de alto en un solo comando. Partirlo en bandas horizontales
// (cada una es su propio comando GS v 0 con el mismo ancho) es el patrón
// estándar para imprimir imágenes altas de forma confiable — el papel avanza
// solo entre bandas, no hace falta feed extra.
export function canvasToChunkedRasterBytes(canvas, { chunkHeight = 200, threshold = 180 } = {}) {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    const chunks = [];

    for (let y = 0; y < height; y += chunkHeight) {
        const bandHeight = Math.min(chunkHeight, height - y);
        const imageData = ctx.getImageData(0, y, width, bandHeight);
        chunks.push(imageDataToRasterBytes(imageData, width, bandHeight, threshold));
    }

    return chunks;
}
