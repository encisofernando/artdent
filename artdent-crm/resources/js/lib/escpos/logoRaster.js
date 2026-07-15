// Igual que qrRaster.js: una imagen real (no texto) escalada con <canvas>
// normal, sin pasar por html2canvas ni su medición de fuentes.
const GS = 0x1d;

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
        img.src = url;
    });
}

export async function buildImageRasterBytes(url, { targetWidth = 200, threshold = 180 } = {}) {
    const img = await loadImage(url);
    const scale = targetWidth / img.naturalWidth;
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, height);
    ctx.drawImage(img, 0, 0, targetWidth, height);

    const { data } = ctx.getImageData(0, 0, targetWidth, height);
    const widthBytes = Math.ceil(targetWidth / 8);
    const raster = new Uint8Array(widthBytes * height);

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < targetWidth; x += 1) {
            const idx = (y * targetWidth + x) * 4;
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
