import { EscPosBuilder, ALIGN } from './commands';
import { buildImageRasterBytes } from './logoRaster';
import { buildAfipFooterRasterBytes } from './afipFooterRaster';
import { justify, wrapText, center } from './textLayout';
import { fmt, fmtDate, IVA_LABELS, parseReceiptType, buildAfipQrUrl } from '@/Components/Sale/FacturaA4';
import { getCompanyDisplayName, getCompanyLogoSrc } from '@/lib/companyBranding';

const COLUMNS_BY_WIDTH = { 57: 32, 80: 48 };
const LOGO_WIDTH_BY_MM = { 57: 200, 80: 280 };

// Recuadro para la línea de total (negrita + doble alto), igual al resto de los
// tickets: las barras │ del recuadro quedan a altura normal, el monto en doble alto.
function totalBox(builder, label, value, columns) {
    const inner = columns - 2;
    builder.line(`┌${'─'.repeat(inner)}┐`);
    builder.text('│').bold(true).doubleHeight(true)
        .text(justify(label, value, inner))
        .doubleHeight(false).bold(false).line('│');
    return builder.line(`└${'─'.repeat(inner)}┘`);
}

export async function buildSaleTicket(sale, { widthMM = 80 } = {}) {
    const columns = COLUMNS_BY_WIDTH[widthMM] || 32;
    const items = sale.sale_items || sale.items || [];
    const total = Number(sale.total || 0);
    const receipt = parseReceiptType(sale.receipt_type);
    const company = sale.company || {};
    const companyDisplayName = getCompanyDisplayName(company, { preferFantasy: false });
    const ivaLabel = IVA_LABELS[company.iva_condition] || 'Responsable Inscripto';

    const afipInvoice = sale.invoice;
    // sale.sale_number ya viene formateado "PPPP-NNNNNNNN" y es la fuente de verdad
    // (la misma que se muestra en el encabezado de la página) — el fallback a
    // afipInvoice/company solo aplica si por algún motivo no llegara a estar seteado.
    const [saleNumberPv, saleNumberNro] = sale.sale_number ? sale.sale_number.split('-') : [];
    const pvStr = saleNumberPv || String(afipInvoice?.point_sale ?? company.afip_point_sale ?? 1).padStart(4, '0');
    const nroStr = saleNumberNro || String(afipInvoice?.number ?? sale.id ?? 1).padStart(8, '0');

    const afipReq = afipInvoice?.afip_request;
    const ivaItems = afipReq?.iva_items?.length
        ? afipReq.iva_items
        : items.reduce((acc, item) => {
            const rate = Number(item.tax_rate ?? 0);
            if (rate > 0) {
                const existing = acc.find((x) => x.rate === rate);
                if (existing) {
                    existing.importe += Number(item.tax_amount ?? 0);
                } else {
                    acc.push({ rate, importe: Number(item.tax_amount ?? 0) });
                }
            }
            return acc;
        }, []);
    const totalIVA = ivaItems.reduce((s, x) => s + Number(x.Importe ?? x.importe ?? 0), 0);
    const subTotal = total - totalIVA;

    const paymentBreakdown = Array.isArray(sale.payment_breakdown) && sale.payment_breakdown.length
        ? sale.payment_breakdown
        : (sale.sale_payments || []).map((payment) => ({
            method_name: payment.payment_method?.name || sale.payment_method || 'Efectivo',
            amount: Number(payment.amount || 0),
            is_account: false,
        }));
    const medioPago = paymentBreakdown.length
        ? paymentBreakdown.map((payment) => payment.method_name).join(' + ')
        : (sale.payment_method || 'Efectivo');
    const accountPayment = paymentBreakdown.find((payment) => payment.is_account);
    const cajero = sale.user?.name || sale.user?.email || 'Sistema';
    const pagado = Number(sale.paid_amount || sale.amount_paid || 0);
    const vuelto = Number(sale.change_amount || 0);
    const clientName = sale.customer?.name
        || sale.customer_name
        || sale.notes?.match(/Cliente:\s*(.+)/)?.[1]?.trim()
        || 'Consumidor Final';
    const clientDoc = sale.customer?.cuit || sale.customer?.dni || '';
    const clientIvaLabel = IVA_LABELS[afipInvoice?.recipient_iva || sale.customer?.iva_condition] || 'Consumidor Final';
    const dt = new Date(sale.sold_at || sale.created_at);
    const fechaStr = dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const cantArt = items.reduce((a, i) => a + Number(i.quantity || 1), 0);

    const builder = new EscPosBuilder();

    const logoUrl = getCompanyLogoSrc(company, { scope: 'general', thermal: true });

    if (logoUrl) {
        try {
            const logoBytes = await buildImageRasterBytes(logoUrl, { targetWidth: LOGO_WIDTH_BY_MM[widthMM] || 200 });
            builder.align(ALIGN.CENTER).raw(logoBytes).feed(1);
        } catch {
            // Si el logo no carga (sin red, URL rota, etc.), seguimos con el ticket en texto.
        }
    }

    builder.align(ALIGN.CENTER).bold(true);
    wrapText(companyDisplayName, columns).forEach((line) => builder.line(line));
    builder.bold(false);

    if (company.address) {
        builder.line(`${company.address}${company.city ? `, ${company.city}` : ''}`);
    }

    if (company.phone) {
        builder.line(company.phone);
    }

    builder.line(ivaLabel);
    builder.hr('─', columns);

    builder.align(ALIGN.CENTER).doubleSize(true).bold(true)
        .line(receipt.label)
        .doubleSize(false).bold(false)
        .line(`N° ${pvStr}-${nroStr}`);

    builder.align(ALIGN.LEFT).line(`${fechaStr}  ${horaStr}`);

    if (company.cuit) {
        builder.line(`CUIT: ${company.cuit}`);
    }

    if (company.iibb) {
        builder.line(`Ing. Brutos: ${company.iibb}`);
    }

    const clientInner = columns - 2;
    const clientLines = [center('CLIENTE', clientInner), center(clientName, clientInner)];
    if (clientDoc) {
        clientLines.push(center(`${clientDoc.length === 11 ? 'CUIT' : 'DNI'}: ${clientDoc}`, clientInner));
    }
    clientLines.push(center(`Cond. IVA: ${clientIvaLabel}`, clientInner));
    builder.box(clientLines, columns);

    items.forEach((item) => {
        const name = item.product_name || item.name || '';
        wrapText(name, columns).forEach((line) => builder.line(line));

        const qty = Number(item.quantity || 1);
        builder.line(justify(`  ${qty} x $${fmt(item.unit_price)}`, `$ ${fmt(item.total)}`, columns));
    });

    builder.hr('─', columns);

    if (receipt.isAfip && totalIVA > 0) {
        builder.line(justify(`${cantArt} artículo${cantArt !== 1 ? 's' : ''}`, `$ ${fmt(subTotal)}`, columns));
        ivaItems.forEach((iv) => {
            builder.line(justify(`I.V.A. ${iv.rate ?? '21'}%`, `$ ${fmt(iv.Importe ?? iv.importe ?? 0)}`, columns));
        });
    }

    totalBox(builder, 'TOTAL', `$ ${fmt(total)}`, columns);

    if (!receipt.isAfip) {
        builder.line(`${cantArt} artículo${cantArt !== 1 ? 's' : ''}`);
    }

    builder.line(justify('Medio de pago:', medioPago, columns));

    if (pagado > 0) {
        builder.line(justify('Cobrado:', `$ ${fmt(pagado)}`, columns));
    }

    if (accountPayment) {
        builder.line(justify('Saldo Cta. Cte.:', `$ ${fmt(accountPayment.amount)}`, columns));
    }

    if (vuelto > 0) {
        builder.line(justify('Su vuelto:', `$ ${fmt(vuelto)}`, columns));
    }

    builder.line(justify('Cajero:', cajero, columns));

    if (receipt.isAfip) {
        // Régimen de Transparencia Fiscal al Consumidor (Ley 27.743) — obligatorio
        // en todo comprobante fiscal, no solo en los ya autorizados con CAE. El
        // recuadro ya aporta su propio borde superior como separador.
        const ivaContenido = totalIVA > 0 ? totalIVA : Math.round((total / 1.21 * 0.21) * 100) / 100;
        const otrosImp = 0;
        const regimenInner = columns - 2;
        // justify() puede devolver 2 líneas (separadas por \n) si no entran en una
        // sola — box() espera un array con una línea por elemento, así que se
        // desdobla acá antes de pasarlo.
        const regimenLines = [
            ...wrapText('Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)', regimenInner),
            ...justify('IVA Contenido', `$ ${fmt(ivaContenido)}`, regimenInner).split('\n'),
            ...justify('Otros Imp. Nac. Indirectos', `$ ${fmt(otrosImp)}`, regimenInner).split('\n'),
        ];
        builder.box(regimenLines, columns);
    } else {
        // Sin recuadro de régimen fiscal (comprobante no fiscal): hace falta el
        // separador acá, ya que no hay un borde de caja que cumpla esa función.
        builder.hr('─', columns);
    }

    if (afipInvoice?.cae) {
        const logoArcaUrl = `${window.location.origin}/images/logo-arca.jpg`;
        const footerBytes = await buildAfipFooterRasterBytes({
            qrText: buildAfipQrUrl(afipInvoice, company),
            logoUrl: logoArcaUrl,
            cae: afipInvoice.cae,
            vto: fmtDate(afipInvoice.cae_expiry),
            widthMM,
        });
        builder.align(ALIGN.CENTER).raw(footerBytes).feed(1);
        wrapText(
            'Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle.',
            columns,
        ).forEach((line) => builder.line(line));
        builder.align(ALIGN.LEFT);
    } else {
        builder.align(ALIGN.CENTER);
        wrapText(
            receipt.letter === 'X' ? 'Comprobante no válido como factura' : 'Pendiente de autorización AFIP',
            columns,
        ).forEach((line) => builder.line(line));
        builder.align(ALIGN.LEFT);
    }

    builder.feed(1).align(ALIGN.CENTER).line('Gracias por elegirnos').align(ALIGN.LEFT);
    builder.feed(1).cut(true);

    return builder.toBytes();
}
