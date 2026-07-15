export { EscPosBuilder, ALIGN } from './commands';
export { buildQrBytes, QR_ERROR_CORRECTION } from './qrCommand';
export { buildQrRasterBytes } from './qrRaster';
export { buildBarcodeBytes, BARCODE_TYPE } from './barcodeCommand';

import { EscPosBuilder, ALIGN } from './commands';
import { buildQrRasterBytes } from './qrRaster';

export function buildTestTicket({ companyName = 'ArtDent CRM', url = 'https://pos.artdent.com.ar', columns = 32 } = {}) {
    const builder = new EscPosBuilder();
    // A doble tamaño cada caracter ocupa 2 columnas, así que el ancho útil se reduce a la mitad.
    const doubleWidthCols = Math.floor(columns / 2);
    const title = companyName.length > doubleWidthCols ? companyName.slice(0, doubleWidthCols) : companyName;

    builder
        .align(ALIGN.CENTER)
        .doubleSize(true)
        .bold(true)
        .line(title)
        .doubleSize(false)
        .bold(false)
        .hr('-', columns)
        .align(ALIGN.LEFT)
        .line('Ticket de prueba de impresión')
        .line(`Fecha: ${new Date().toLocaleString('es-AR')}`)
        .hr('-', columns)
        .align(ALIGN.CENTER)
        .line('¡Impresión correcta!')
        .line('ñ Ñ á é í ó ú ¿ ¡')
        .feed(1)
        .raw(buildQrRasterBytes(url))
        .feed(1)
        .align(ALIGN.LEFT)
        .cut(true);

    return builder.toBytes();
}
