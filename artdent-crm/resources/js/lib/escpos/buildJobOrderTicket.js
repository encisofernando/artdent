import { EscPosBuilder, ALIGN } from './commands';
import { buildImageRasterBytes } from './logoRaster';
import { justify, wrapText, center } from './textLayout';
import { fmt, fmtDate } from '@/Components/Sale/FacturaA4';
import { getCompanyLogoSrc } from '@/lib/companyBranding';

// Esta página usa 54mm (no 57mm) como formato compacto, pero a los fines de
// columnas de texto/ancho de logo se trata igual que 57mm — la diferencia de
// papel es marginal y es la convención estándar en impresoras térmicas.
const COLUMNS_BY_WIDTH = { 54: 32, 57: 32, 80: 48 };
const LOGO_WIDTH_BY_MM = { 54: 200, 57: 200, 80: 280 };

// El número ya viene precedido por la palabra "Orden"/"Ticket" en el encabezado,
// así que el prefijo "ORD-" es redundante ahí (se ve como una palabra repetida/cortada).
function stripOrdPrefix(value) {
    return String(value ?? '').replace(/^ORD-/i, '');
}

// Recuadro para la línea de total (negrita + doble alto), igual al "border: 2px
// solid #000" del diseño HTML. El doble alto solo aplica al contenido: las
// barras │ del recuadro quedan a altura normal, como en la referencia.
function totalBox(builder, label, value, columns) {
    const inner = columns - 2;
    builder.line(`┌${'─'.repeat(inner)}┐`);
    builder.text('│').bold(true).doubleHeight(true)
        .text(justify(label, value, inner))
        .doubleHeight(false).bold(false).line('│');
    return builder.line(`└${'─'.repeat(inner)}┘`);
}

export async function buildJobOrderTicket(job, { widthMM = 80 } = {}) {
    const columns = COLUMNS_BY_WIDTH[widthMM] || 32;
    const items = job.job_items || [];
    const total = Number(job.total || 0);
    const company = job.company || {};
    const dentist = job.dentist || {};
    const patient = job.patient || {};
    const ticketNum = job.job_number || (job.id ? `OT-${job.id}` : '—');
    const patientName = [patient?.name, patient?.last_name].filter(Boolean).join(' ') || patient?.name || '—';
    const dentistName = dentist?.name || dentist?.contact_name || dentist?.email || '—';
    const serviceLabel = job.jobType?.name || job.job_type?.name || 'Trabajo de laboratorio';
    const notes = job.description || job.notes || job.observations || '';

    const builder = new EscPosBuilder();

    const logoUrl = getCompanyLogoSrc(company, { scope: 'lab', thermal: true });

    if (logoUrl) {
        try {
            const logoBytes = await buildImageRasterBytes(logoUrl, { targetWidth: LOGO_WIDTH_BY_MM[widthMM] || 200 });
            builder.align(ALIGN.CENTER).raw(logoBytes).feed(1);
        } catch {
            // Si el logo no carga, seguimos con el ticket en texto.
        }
    }

    builder.align(ALIGN.CENTER);
    wrapText('Documento interno. No válido como factura.', columns).forEach((line) => builder.line(line));
    builder.hr('─', columns);

    builder.bold(true).box([center(`ORDEN N° ${stripOrdPrefix(ticketNum)}`, columns - 2)], columns).bold(false);
    builder.hr('─', columns);

    builder.align(ALIGN.LEFT);
    builder.line(justify('FECHA', fmtDate(job.received_at), columns));
    builder.line(justify('PACIENTE', patientName, columns));
    builder.line(justify('PROFESIONAL', dentistName, columns));

    if (job.shade) {
        builder.line(justify('TONO', job.shade, columns));
    }

    builder.hr('─', columns);

    if (notes) {
        builder.bold(true).line('INDICACIONES').bold(false);
        wrapText(notes, columns).forEach((line) => builder.line(line));
        builder.hr('─', columns);
    }

    builder.bold(true).line('DETALLE DEL TRABAJO').bold(false);

    if (items.length > 0) {
        items.forEach((item) => {
            wrapText(item.description || '', columns).forEach((line) => builder.line(line));

            const qty = Number(item.quantity || 1);
            const lineTotal = item.total ?? (Number(item.unit_price || 0) * qty);
            builder.line(justify(`${qty} x $${fmt(item.unit_price)}`, `$${fmt(lineTotal)}`, columns));
        });
    } else {
        builder.line(serviceLabel);
        builder.line(justify(`1 x $${fmt(total)}`, `$${fmt(total)}`, columns));
    }

    builder.hr('─', columns);

    totalBox(builder, 'TOTAL ORDEN', `$${fmt(total)}`, columns);

    builder.align(ALIGN.CENTER).line('Tu sonrisa, es nuestra prioridad.').align(ALIGN.LEFT);
    builder.feed(1).cut(true);

    return builder.toBytes();
}

// El ticket de "Orden Completa" del kiosco de producción (JobPhaseKioskController)
// llega con esta forma (job_number, phases[], total, company, patient_name,
// dentist_name, shade, received_at) en vez de un objeto Job completo. Se mapea
// a la misma forma que espera buildJobOrderTicket para que ambos módulos
// impriman con el formato idéntico, byte a byte.
export function mapFinalTicketToJobOrder(ticket) {
    return {
        job_number: ticket.job_number,
        received_at: ticket.received_at,
        shade: ticket.shade,
        total: ticket.total,
        company: ticket.company || {},
        patient: ticket.patient_name ? { name: ticket.patient_name } : {},
        dentist: ticket.dentist_name ? { name: ticket.dentist_name } : {},
        job_items: (ticket.phases || []).map((phase) => ({
            description: phase.phase_name,
            quantity: 1,
            unit_price: phase.amount,
            total: phase.amount,
        })),
    };
}

// Ticket de fase individual (parcial, se imprime al completar UNA fase del
// trabajo, antes de que la orden esté terminada) — contenido distinto del
// ticket de orden completa, pero con la misma línea visual (mismas cajas,
// mismos rótulos en mayúscula, mismo pie).
export async function buildPhaseTicket(ticket, collabNames, { widthMM = 80 } = {}) {
    const columns = COLUMNS_BY_WIDTH[widthMM] || 32;
    const company = ticket.company || {};

    const builder = new EscPosBuilder();

    const logoUrl = getCompanyLogoSrc(company, { scope: 'lab', thermal: true });

    if (logoUrl) {
        try {
            const logoBytes = await buildImageRasterBytes(logoUrl, { targetWidth: LOGO_WIDTH_BY_MM[widthMM] || 200 });
            builder.align(ALIGN.CENTER).raw(logoBytes).feed(1);
        } catch {
            // Si el logo no carga, seguimos con el ticket en texto.
        }
    }

    builder.align(ALIGN.CENTER);
    wrapText('Documento interno. No válido como factura.', columns).forEach((line) => builder.line(line));
    builder.hr('─', columns);

    builder.bold(true).box([center(`ORDEN N° ${stripOrdPrefix(ticket.ticket_number)}`, columns - 2)], columns).bold(false);
    builder.hr('─', columns);

    builder.align(ALIGN.LEFT);
    builder.line(justify('ORDEN', stripOrdPrefix(ticket.job_number) || '—', columns));
    builder.line(justify('FECHA', fmtDate(ticket.received_at), columns));

    if (ticket.patient_name) {
        builder.line(justify('PACIENTE', ticket.patient_name, columns));
    }

    if (ticket.dentist_name) {
        builder.line(justify('PROFESIONAL', ticket.dentist_name, columns));
    }

    if (ticket.shade) {
        builder.line(justify('TONO', ticket.shade, columns));
    }

    builder.hr('─', columns);

    builder.bold(true).line('FASE DE TRABAJO').bold(false);
    wrapText(ticket.phase_name || '', columns).forEach((line) => builder.line(line));
    wrapText(`Técnico(s): ${collabNames || '—'}`, columns).forEach((line) => builder.line(line));
    builder.hr('─', columns);

    totalBox(builder, 'IMPORTE FASE', `$${fmt(ticket.amount)}`, columns);

    builder.align(ALIGN.CENTER).line('Tu sonrisa, es nuestra prioridad.').align(ALIGN.LEFT);
    builder.feed(1).cut(true);

    return builder.toBytes();
}
