import { EscPosBuilder, ALIGN } from './commands';
import { buildImageRasterBytes } from './logoRaster';
import { justify, wrapText, center } from './textLayout';
import { fmt } from '@/Components/Sale/FacturaA4';
import { getCompanyDisplayName, getCompanyLogoSrc } from '@/lib/companyBranding';

const COLUMNS_BY_WIDTH = { 57: 32, 80: 48 };
const LOGO_WIDTH_BY_MM = { 57: 200, 80: 280 };

const LINE_SIGN = { remunerative: '+', non_remunerative: '+', deduction: '-', contribution: '-', employer_contribution: '' };

// Igual que en los componentes HTML de origen: parsea "YYYY-MM-DD" a mano en
// vez de `new Date(...)`, para no correr riesgo de que el shift de timezone
// corra la fecha un día (típico con campos que son solo fecha, sin hora).
function fmtDate(d) {
    if (!d) return '—';
    const parts = String(d).split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

function printLogoHeaderAndCompany(builder, { company, scope, columns, widthMM }) {
    const logoUrl = getCompanyLogoSrc(company, { scope, thermal: true });

    return (async () => {
        if (logoUrl) {
            try {
                const logoBytes = await buildImageRasterBytes(logoUrl, { targetWidth: LOGO_WIDTH_BY_MM[widthMM] || 200 });
                builder.align(ALIGN.CENTER).raw(logoBytes).feed(1);
            } catch {
                // Si el logo no carga, seguimos con el ticket en texto.
            }
        }

        builder.align(ALIGN.CENTER).bold(true).line('RECIBO DE HABERES').bold(false);
        wrapText('Documento interno. No válido como factura.', columns).forEach((line) => builder.line(line));

        if (company?.name) {
            builder.bold(true).line(getCompanyDisplayName(company)).bold(false);
        }

        if (company?.cuit) {
            builder.line(`CUIT: ${company.cuit}`);
        }

        if (company?.address) {
            builder.line(`${company.address}${company.city ? `, ${company.city}` : ''}`);
        }

        builder.align(ALIGN.LEFT).hr('─', columns);
    })();
}

function printExtrasAndDiscounts(builder, { extras, discounts, columns }) {
    if (extras.length > 0) {
        builder.bold(true).line('DETALLE EXTRAS').bold(false);
        extras.forEach((e) => {
            builder.line(justify(`${fmtDate(e.date)} ${e.concept}`, `+$${fmt(e.amount)}`, columns));
        });
        builder.hr('─', columns);
    }

    if (discounts.length > 0) {
        builder.bold(true).line('DETALLE DESCUENTOS').bold(false);
        discounts.forEach((d) => {
            builder.line(justify(`${fmtDate(d.date)} ${d.concept}`, `-$${fmt(d.amount)}`, columns));
        });
        builder.hr('─', columns);
    }
}

function printSignaturesAndFooter(builder, { firmaLabel, columns }) {
    builder.feed(2).line(justify('Firma Empleador', '', columns));
    builder.feed(2).line(justify(firmaLabel, '', columns));
    builder.hr('─', columns);
    builder.align(ALIGN.CENTER).line('Tu sonrisa, es nuestra prioridad.').line('ArtDent CRM').align(ALIGN.LEFT);
    builder.feed(1).cut(true);
}

export async function buildCollaboratorReceiptTicket({ receipt, extras = [], discounts = [], company = {} }, { widthMM = 80 } = {}) {
    const columns = COLUMNS_BY_WIDTH[widthMM] || 32;
    const collab = receipt.collaborator || {};

    const builder = new EscPosBuilder();

    await printLogoHeaderAndCompany(builder, { company, scope: 'lab', columns, widthMM });

    const collabInner = columns - 2;
    const collabLines = [center('COLABORADOR', collabInner), center(collab.name || '—', collabInner)];
    if (collab.document) {
        collabLines.push(center(`Documento: ${collab.document}`, collabInner));
    }
    builder.box(collabLines, columns);

    builder.line(justify('Período', `${fmtDate(receipt.period_from)} al ${fmtDate(receipt.period_to)}`, columns));

    if (receipt.days_worked != null) {
        builder.line(justify('Días', String(receipt.days_worked), columns));
    }

    if (receipt.hours != null) {
        builder.line(justify('Horas', `${receipt.hours}h`, columns));
    }

    builder.hr('─', columns);

    builder.line(justify(`Horas trabajadas (${receipt.hours}h)`, `$${fmt(receipt.gross)}`, columns));

    if (receipt.extras_total > 0) {
        builder.line(justify('Extras / adicionales', `+$${fmt(receipt.extras_total)}`, columns));
    }

    if (receipt.discounts_total > 0) {
        builder.line(justify('Descuentos', `-$${fmt(receipt.discounts_total)}`, columns));
    }

    builder.hr('─', columns);

    totalBox(builder, 'Neto a cobrar', `$${fmt(receipt.net)}`, columns);

    printExtrasAndDiscounts(builder, { extras, discounts, columns });
    printSignaturesAndFooter(builder, { firmaLabel: 'Firma Colaborador', columns });

    return builder.toBytes();
}

export async function buildEmployeeReceiptTicket({ receipt, extras = [], discounts = [], company = {} }, { widthMM = 80 } = {}) {
    const columns = COLUMNS_BY_WIDTH[widthMM] || 32;
    const employee = receipt.employee || {};
    const user = employee.user || {};
    const conceptLines = (receipt.lines || []).filter((l) => l.type !== 'employer_contribution');
    const commissionPct = parseFloat(employee.commission_pct ?? 0);
    const commissionGross = parseFloat(receipt.commission_gross ?? 0);
    const salesTotal = parseFloat(receipt.sales_total ?? 0);

    const builder = new EscPosBuilder();

    await printLogoHeaderAndCompany(builder, { company, scope: 'store', columns, widthMM });

    const employeeInner = columns - 2;
    const employeeLines = [center('EMPLEADO', employeeInner), center(user.name || '—', employeeInner)];
    if (employee.position) {
        employeeLines.push(center(employee.position, employeeInner));
    }
    if (employee.dni) {
        employeeLines.push(center(`DNI: ${employee.dni}`, employeeInner));
    }
    builder.box(employeeLines, columns);

    builder.line(justify('Período', `${fmtDate(receipt.period_from)} al ${fmtDate(receipt.period_to)}`, columns));
    builder.line(justify('Recibo N°', `#${String(receipt.id).padStart(4, '0')}`, columns));
    builder.hr('─', columns);

    builder.line(justify('Sueldo base mensual', `$${fmt(receipt.salary_gross)}`, columns));

    if (commissionGross > 0) {
        const label = `Comisión ${commissionPct > 0 ? `${commissionPct}%` : ''}${salesTotal > 0 ? ` (ventas: $${fmt(salesTotal)})` : ''}`;
        builder.line(justify(label, `+$${fmt(commissionGross)}`, columns));
    }

    conceptLines.forEach((line) => {
        builder.line(justify(line.label, `${LINE_SIGN[line.type]}$${fmt(Math.abs(line.amount))}`, columns));
    });

    if (parseFloat(receipt.extras_total) > 0) {
        builder.line(justify('Extras / adicionales', `+$${fmt(receipt.extras_total)}`, columns));
    }

    if (parseFloat(receipt.discounts_total) > 0) {
        builder.line(justify('Descuentos', `-$${fmt(receipt.discounts_total)}`, columns));
    }

    builder.hr('─', columns);

    totalBox(builder, 'Neto a cobrar', `$${fmt(receipt.net)}`, columns);

    printExtrasAndDiscounts(builder, { extras, discounts, columns });

    if (receipt.notes) {
        const notePrefix = 'Notas: ';
        const noteLines = wrapText(receipt.notes, columns - notePrefix.length);
        builder.bold(true).text(notePrefix).bold(false).line(noteLines[0] || '');
        noteLines.slice(1).forEach((line) => builder.line(line));
        builder.hr('─', columns);
    }

    printSignaturesAndFooter(builder, { firmaLabel: 'Firma Empleado', columns });

    return builder.toBytes();
}
