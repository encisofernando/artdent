import { fmt, fmtDate } from '@/Components/Sale/FacturaA4';
import { getCompanyLogoSrc, getCompanyDisplayName } from '@/lib/companyBranding';

// Dibuja el ticket de orden/fase de laboratorio entero a mano sobre un
// <canvas> (NO es una foto de la página vía html2canvas) para que el bitmap
// que se manda a la impresora térmica sea exactamente el mismo que el que
// se muestra en pantalla como preview — antes eran dos renders
// independientes (texto+cajas ESC/POS vs CSS) que nunca podían coincidir
// pixel a pixel, que era justo lo que el cliente notaba como "distinto".
const RASTER_WIDTH_BY_MM = { 54: 384, 57: 384, 80: 576 };

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
        img.src = url;
    });
}

function wrapLines(ctx, text, maxWidth) {
    const words = String(text ?? '').split(/\s+/).filter(Boolean);
    if (words.length === 0) return [''];

    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i += 1) {
        const test = `${current} ${words[i]}`;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
        } else {
            lines.push(current);
            current = words[i];
        }
    }
    lines.push(current);

    return lines;
}

function stripOrdPrefix(value) {
    return String(value ?? '').replace(/^ORD-/i, '');
}

function drawDotted(ctx, x1, y, x2, scale) {
    ctx.save();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(1, Math.round(scale));
    ctx.setLineDash([Math.round(3 * scale), Math.round(3 * scale)]);
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.restore();
}

// `job` espera la misma forma que ya arma mapFinalTicketToJobOrder /
// mapPhaseTicketToJobOrder más abajo: job_number, received_at, shade,
// total, company, patient, dentist, job_items[].
export async function renderJobTicketCanvas(job, { widthMM = 80 } = {}) {
    const W = RASTER_WIDTH_BY_MM[widthMM] || 576;
    const scale = W / 576;
    const PAD = Math.round(24 * scale);
    const innerW = W - PAD * 2;

    const F = {
        small: Math.round(20 * scale),
        label: Math.round(23 * scale),
        body: Math.round(25 * scale),
        caption: Math.round(21 * scale),
        total: Math.round(34 * scale),
        logo: Math.round(150 * scale),
    };
    const RULE = Math.max(2, Math.round(3 * scale));
    const BOX_BORDER = Math.max(2, Math.round(3 * scale));
    const GAP = Math.round(14 * scale);

    const company = job.company || {};
    const items = job.job_items || [];
    const total = Number(job.total || 0);
    // Sólo en el ticket final de una orden con fases: si ya se pagó algo
    // (ej. el Rodete), mostrar el desglose de pagado/saldo debajo del total
    // en vez de dejar el ticket pidiendo el bruto de nuevo.
    const hasPaidInfo = Number(job.paid || 0) > 0;
    const outstanding = Number(job.outstanding ?? total);
    const patient = job.patient || {};
    const dentist = job.dentist || {};
    const patientName = [patient?.name, patient?.last_name].filter(Boolean).join(' ') || patient?.name || '—';
    const dentistName = dentist?.name || dentist?.contact_name || dentist?.email || '—';
    const ticketNum = job.job_number || (job.id ? `OT-${job.id}` : '—');
    const serviceLabel = job.jobType?.name || job.job_type?.name || 'Trabajo de laboratorio';

    const logoUrl = getCompanyLogoSrc(company, { scope: 'lab', thermal: true });
    let logoImg = null;
    if (logoUrl) {
        try {
            logoImg = await loadImage(logoUrl);
        } catch {
            logoImg = null;
        }
    }
    const logoDrawHeight = logoImg ? F.logo : 0;
    const logoDrawWidth = logoImg ? Math.round(logoDrawHeight * (logoImg.naturalWidth / logoImg.naturalHeight)) : 0;

    const measure = document.createElement('canvas').getContext('2d');

    const infoRows = [
        ['FECHA', fmtDate(job.received_at)],
        ['PACIENTE', patientName],
        ['PROFESIONAL', dentistName],
    ];
    if (job.shade) {
        infoRows.push(['TONO', job.shade]);
    }

    measure.font = `${F.body}px Arial, Helvetica, sans-serif`;
    const list = items.length > 0 ? items : [{ description: serviceLabel, quantity: 1, unit_price: total, total }];
    const itemLines = list.map((item) => {
        const qty = Number(item.quantity || 1);
        const lineTotal = item.total ?? (Number(item.unit_price || 0) * qty);
        const descLines = wrapLines(measure, item.description || '', innerW);
        return { descLines, qty, unitPrice: item.unit_price ?? lineTotal, lineTotal };
    });

    // --- Pass 1: medir el alto total antes de crear el canvas final ---
    let y = 0;
    y += RULE + GAP;
    if (logoImg) {
        y += logoDrawHeight + GAP;
    }
    y += F.small + 6 + GAP + RULE + GAP;
    y += BOX_BORDER * 2 + F.body + 20 + GAP + RULE;
    y += 10;
    infoRows.forEach(() => { y += F.label + 10; });
    y += 6 + RULE + GAP;
    y += F.caption + 10 + RULE + 12;
    itemLines.forEach(({ descLines }) => {
        y += descLines.length * (F.body + 6) + F.label + 12 + 8;
    });
    y += GAP - 8;
    y += BOX_BORDER * 2 + Math.max(F.caption, F.total) + 20 + GAP;
    if (hasPaidInfo) {
        y += (F.label + 6) * 2 + GAP;
    }
    y += RULE + GAP;
    y += F.small + 6 + GAP;
    y += RULE;

    const H = Math.ceil(y);

    // --- Pass 2: dibujar sobre el canvas ya dimensionado ---
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'alphabetic';

    let cy = 0;
    ctx.fillRect(0, cy, W, RULE);
    cy += RULE + GAP;

    if (logoImg) {
        ctx.drawImage(logoImg, (W - logoDrawWidth) / 2, cy, logoDrawWidth, logoDrawHeight);
        cy += logoDrawHeight + GAP;
    }

    ctx.font = `${F.small}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Documento interno. No válido como factura.', W / 2, cy + F.small);
    cy += F.small + 6 + GAP;
    ctx.fillRect(PAD, cy, innerW, RULE);
    cy += RULE + GAP;

    const boxY = cy;
    const boxH = BOX_BORDER * 2 + F.body + 20;
    ctx.lineWidth = BOX_BORDER;
    ctx.strokeRect(PAD, boxY, innerW - BOX_BORDER, boxH);
    ctx.font = `bold ${F.body}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`ORDEN N° ${stripOrdPrefix(ticketNum)}`, W / 2, boxY + boxH / 2 + F.body * 0.35);
    cy += boxH + GAP;
    ctx.fillRect(PAD, cy, innerW, RULE);
    cy += RULE + 10;

    ctx.textAlign = 'left';
    infoRows.forEach(([label, value]) => {
        ctx.font = `bold ${F.label}px Arial, Helvetica, sans-serif`;
        ctx.fillText(label, PAD, cy + F.label);
        ctx.font = `${F.label}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(String(value ?? '—'), PAD + innerW, cy + F.label);
        ctx.textAlign = 'left';
        cy += F.label + 10;
    });
    cy += 6;
    ctx.fillRect(PAD, cy, innerW, RULE);
    cy += RULE + GAP;

    ctx.font = `bold ${F.caption}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('DETALLE DEL TRABAJO', PAD, cy + F.caption);
    cy += F.caption + 10;
    ctx.fillRect(PAD, cy, innerW, RULE);
    cy += RULE + 12;

    itemLines.forEach(({ descLines, qty, unitPrice, lineTotal }) => {
        ctx.font = `bold ${F.body}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = 'left';
        descLines.forEach((line) => {
            ctx.fillText(line, PAD, cy + F.body);
            cy += F.body + 6;
        });
        ctx.font = `${F.label}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${qty} x $${fmt(unitPrice)}`, PAD, cy + F.label);
        ctx.textAlign = 'right';
        ctx.font = `bold ${F.label}px Arial, Helvetica, sans-serif`;
        ctx.fillText(`$${fmt(lineTotal)}`, PAD + innerW, cy + F.label);
        ctx.textAlign = 'left';
        cy += F.label + 12;
        drawDotted(ctx, PAD, cy, PAD + innerW, scale);
        cy += 8;
    });

    cy += GAP - 8;

    const totalBoxY = cy;
    const totalBoxH = BOX_BORDER * 2 + Math.max(F.caption, F.total) + 20;
    ctx.lineWidth = BOX_BORDER;
    ctx.strokeRect(PAD, totalBoxY, innerW - BOX_BORDER, totalBoxH);
    ctx.font = `bold ${F.caption}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL ORDEN', PAD + 14, totalBoxY + totalBoxH / 2 + F.caption * 0.35);
    ctx.font = `bold ${F.total}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`$${fmt(total)}`, PAD + innerW - 14, totalBoxY + totalBoxH / 2 + F.total * 0.35);
    cy += totalBoxH + GAP;

    if (hasPaidInfo) {
        ctx.font = `${F.label}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Pagado', PAD, cy + F.label);
        ctx.textAlign = 'right';
        ctx.fillText(`$${fmt(job.paid)}`, PAD + innerW, cy + F.label);
        cy += F.label + 6;

        ctx.textAlign = 'left';
        ctx.font = `bold ${F.label}px Arial, Helvetica, sans-serif`;
        ctx.fillText('Saldo pendiente', PAD, cy + F.label);
        ctx.textAlign = 'right';
        ctx.fillText(`$${fmt(outstanding)}`, PAD + innerW, cy + F.label);
        cy += F.label + 6 + GAP;
    }

    ctx.fillRect(PAD, cy, innerW, RULE);
    cy += RULE + GAP;

    ctx.font = `${F.small}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(getCompanyDisplayName(company), W / 2, cy + F.small);
    cy += F.small + 6 + GAP;

    ctx.fillRect(0, cy, W, RULE);

    return canvas;
}

// El ticket de "Orden Completa" del kiosco de producción
// (JobPhaseKioskController) llega con esta forma (job_number, phases[],
// total, company, patient_name, dentist_name, shade, received_at) en vez
// de un objeto Job completo. "phases" es un nombre heredado (viene de
// JobPhaseService::buildJobTicketSummary()) pero son los job_items
// facturados reales (description/quantity/unit_price/total), no las fases
// de producción — ver comentario en ese método.
export function mapFinalTicketToJobOrder(ticket) {
    return {
        job_number: ticket.job_number,
        received_at: ticket.received_at,
        shade: ticket.shade,
        total: ticket.total,
        paid: ticket.paid,
        outstanding: ticket.outstanding,
        company: ticket.company || {},
        patient: ticket.patient_name ? { name: ticket.patient_name } : {},
        dentist: ticket.dentist_name ? { name: ticket.dentist_name } : {},
        job_items: (ticket.phases || []).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
        })),
    };
}

// Ticket de fase individual (parcial, se imprime al completar UNA fase del
// trabajo) — se mapea a la misma forma que espera renderJobTicketCanvas
// para que salga con el diseño idéntico al de la orden completa: la fase
// se muestra como un ítem más de "detalle del trabajo", nada la distingue
// visualmente de un ítem de la orden final.
export function mapPhaseTicketToJobOrder(ticket) {
    return {
        job_number: ticket.job_number,
        received_at: ticket.received_at,
        shade: ticket.shade,
        total: ticket.amount,
        company: ticket.company || {},
        patient: ticket.patient_name ? { name: ticket.patient_name } : {},
        dentist: ticket.dentist_name ? { name: ticket.dentist_name } : {},
        job_items: [{
            description: ticket.phase_name,
            quantity: 1,
            unit_price: ticket.amount,
            total: ticket.amount,
        }],
    };
}
