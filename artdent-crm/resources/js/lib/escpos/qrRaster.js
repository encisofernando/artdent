import QRCode from 'qrcode';

const GS = 0x1d;

export function buildQrRasterBytes(text, { moduleSize = 4, margin = 2, errorCorrectionLevel = 'M' } = {}) {
    const qr = QRCode.create(text, { errorCorrectionLevel });
    const size = qr.modules.size;
    const data = qr.modules.data;

    const isDarkModule = (mx, my) => {
        if (mx < 0 || my < 0 || mx >= size || my >= size) return false;
        return (data[my * size + mx] & 1) === 1;
    };

    const pixelSize = (size + margin * 2) * moduleSize;
    const widthBytes = Math.ceil(pixelSize / 8);
    const raster = new Uint8Array(widthBytes * pixelSize);

    for (let y = 0; y < pixelSize; y += 1) {
        const my = Math.floor(y / moduleSize) - margin;

        for (let x = 0; x < pixelSize; x += 1) {
            const mx = Math.floor(x / moduleSize) - margin;

            if (isDarkModule(mx, my)) {
                const byteIndex = y * widthBytes + Math.floor(x / 8);
                const bitIndex = 7 - (x % 8);
                raster[byteIndex] |= (1 << bitIndex);
            }
        }
    }

    const xL = widthBytes & 0xff;
    const xH = (widthBytes >> 8) & 0xff;
    const yL = pixelSize & 0xff;
    const yH = (pixelSize >> 8) & 0xff;

    // Uint8Array#set en vez de spread: evita el límite de argumentos del motor
    // JS al concatenar el encabezado con un raster potencialmente grande.
    const header = [GS, 0x76, 0x30, 0x00, xL, xH, yL, yH];
    const result = new Uint8Array(header.length + raster.length);
    result.set(header, 0);
    result.set(raster, header.length);

    return result;
}
