// Recuadro final del ticket fiscal: QR a la izquierda, logo ARCA arriba a la
// derecha, CAE debajo del logo y Vto debajo del CAE — igual a la referencia
// HTML (TicketBase.jsx). Se compone todo en un único <canvas> y se rasteriza
// como una sola imagen, ya que ESC/POS en modo texto no permite ubicar texto
// al lado de una imagen dentro del mismo renglón.
import QRCode from 'qrcode';

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

function canvasToRasterBytes(canvas, { threshold = 180 } = {}) {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, width, height);
    const widthBytes = Math.ceil(width / 8);
    const raster = new Uint8Array(widthBytes * height);

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

function drawQr(ctx, text, x, y, size) {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const modules = qr.modules.size;
    const data = qr.modules.data;
    const margin = 2;
    const cell = size / (modules + margin * 2);

    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#000';

    for (let my = 0; my < modules; my += 1) {
        for (let mx = 0; mx < modules; mx += 1) {
            if ((data[my * modules + mx] & 1) === 1) {
                ctx.fillRect(
                    x + Math.round((mx + margin) * cell),
                    y + Math.round((my + margin) * cell),
                    Math.ceil(cell),
                    Math.ceil(cell),
                );
            }
        }
    }
}

// Ancho real imprimible (en puntos/dots), no el ancho reducido usado para el
// logo de cabecera — coincide con el ancho de las 32/48 columnas de texto
// (~12 dots por carácter en Font A) para que el QR sea legible y el CAE no
// se corte.
const FULL_WIDTH_BY_MM = { 57: 380, 80: 570 };

export async function buildAfipFooterRasterBytes({ qrText, logoUrl, cae, vto, widthMM = 80 }) {
    const totalWidth = FULL_WIDTH_BY_MM[widthMM] || FULL_WIDTH_BY_MM[80];
    const gap = 10;
    const rightWidth = Math.max(150, Math.round(totalWidth * (widthMM === 57 ? 0.42 : 0.36)));
    const qrSize = totalWidth - gap - rightWidth;
    const rightX = totalWidth - rightWidth;

    let logoImg = null;
    try {
        logoImg = await loadImage(logoUrl);
    } catch {
        // Sin logo ARCA disponible, seguimos solo con QR + texto.
    }

    const logoH = logoImg ? Math.round(rightWidth / (logoImg.naturalWidth / logoImg.naturalHeight)) : 0;

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    const ctx = canvas.getContext('2d');

    // El tamaño de fuente se reduce hasta que "CAE: ..." (el texto más largo)
    // entre en el ancho disponible — evita que se corte con CAEs de 14 dígitos.
    const caeText = `CAE: ${cae}`;
    let fontSize = widthMM === 57 ? 16 : 18;
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    while (fontSize > 9 && ctx.measureText(caeText).width > rightWidth - 4) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    }

    const lineHeight = fontSize + 5;
    const textBlockH = lineHeight * 2 + 6;
    const height = Math.max(qrSize, logoH + textBlockH);
    canvas.height = height;

    // Cambiar canvas.height reinicia el contexto (fillStyle/font); se redibuja todo.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, totalWidth, height);

    drawQr(ctx, qrText, 0, 0, qrSize);

    if (logoImg) {
        ctx.drawImage(logoImg, rightX, 0, rightWidth, logoH);
    }

    ctx.fillStyle = '#000';
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(caeText, rightX, logoH + 6);
    ctx.fillText(`Vto: ${vto}`, rightX, logoH + 6 + lineHeight);

    return canvasToRasterBytes(canvas);
}
