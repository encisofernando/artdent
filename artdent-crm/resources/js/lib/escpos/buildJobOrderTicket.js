import { EscPosBuilder, ALIGN } from './commands';
import { canvasToChunkedRasterBytes } from './canvasRaster';
import { renderJobTicketCanvas, mapFinalTicketToJobOrder, mapPhaseTicketToJobOrder } from './renderJobTicket';

export { mapFinalTicketToJobOrder, mapPhaseTicketToJobOrder };

// Dibuja el ticket en un <canvas> (ver renderJobTicket.js) y lo manda a la
// impresora como imagen rasterizada, en vez de componerlo con comandos de
// texto/cajas ESC/POS — así el papel impreso es literalmente el mismo
// bitmap que el preview en pantalla, nunca dos renders que puedan
// desalinearse.
async function buildRasterTicketBytes(job, { widthMM = 80 } = {}) {
    const canvas = await renderJobTicketCanvas(job, { widthMM });
    const chunks = canvasToChunkedRasterBytes(canvas);

    const builder = new EscPosBuilder();
    builder.align(ALIGN.CENTER);
    chunks.forEach((chunk) => builder.raw(chunk));
    builder.cut(true);

    return builder.toBytes();
}

export async function buildJobOrderTicket(job, { widthMM = 80 } = {}) {
    return buildRasterTicketBytes(job, { widthMM });
}

export async function buildPhaseTicket(ticket, { widthMM = 80 } = {}) {
    return buildRasterTicketBytes(mapPhaseTicketToJobOrder(ticket), { widthMM });
}
