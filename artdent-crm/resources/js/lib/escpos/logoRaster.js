// Igual que qrRaster.js: una imagen real (no texto) escalada con <canvas>
// normal, sin pasar por html2canvas ni su medición de fuentes.
import { imageDataToRasterBytes } from './canvasRaster';

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

    const imageData = ctx.getImageData(0, 0, targetWidth, height);

    return imageDataToRasterBytes(imageData, targetWidth, height, threshold);
}
