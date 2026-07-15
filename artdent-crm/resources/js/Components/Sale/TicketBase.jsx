/**
 * TicketBase — Ticket térmico compartido (80mm / 57mm) entre Sale/Create y Sale/Show
 *
 * Uso:
 *   import { Ticket80, Ticket57 } from '@/Components/Sale/TicketBase';
 *
 *   // En Show: sale ya tiene sale.company y sale.customer cargados
 *   <Ticket80 sale={sale} />
 *
 *   // En Create: fusionar company en el objeto postSale
 *   <Ticket80 sale={{ ...postSale, company, sale_items: postSale.items }} />
 */
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';
import {
    fmt, fmtDate,
    IVA_LABELS, parseReceiptType, buildAfipQrUrl,
} from '@/Components/Sale/FacturaA4';

// ─── QR asíncrono ─────────────────────────────────────────────────────────────
function QrCodeImg({ text, size = 90 }) {
    const [src, setSrc] = useState('');
    useEffect(() => {
        if (!text) { setSrc(''); return; }
        QRCode.toDataURL(text, { width: size * 2, margin: 1, errorCorrectionLevel: 'M' })
            .then(setSrc)
            .catch(() => {});
    }, [text, size]);
    if (!src) return <div style={{ width: size, height: size, background: '#f0f0f0' }} />;
    return <img src={src} alt="QR ARCA" style={{ width: size, height: size, display: 'block' }} />;
}

// ─── TICKET BASE ──────────────────────────────────────────────────────────────
function TicketBase({ sale, widthMM = 80 }) {
    const is57   = widthMM === 57;
    const items  = sale.sale_items || sale.items || [];
    const total  = Number(sale.total || 0);
    const receipt  = parseReceiptType(sale.receipt_type);
    const company  = sale.company || {};
    const companyDisplayName = getCompanyDisplayName(company, { preferFantasy: false });
    const ivaLabel = IVA_LABELS[company.iva_condition] || 'Responsable Inscripto';

    // ── Número de comprobante ─────────────────────────────────────────────────
    // sale.sale_number ya viene formateado "PPPP-NNNNNNNN" y es la fuente de verdad
    // (la misma que se muestra en el encabezado de la página) — el fallback a
    // afipInvoice/company solo aplica si por algún motivo no llegara a estar seteado.
    const afipInvoice = sale.invoice;
    const [saleNumberPv, saleNumberNro] = sale.sale_number ? sale.sale_number.split('-') : [];
    const pvStr  = saleNumberPv || String(afipInvoice?.point_sale ?? company.afip_point_sale ?? 1).padStart(4, '0');
    const nroStr = saleNumberNro || String(afipInvoice?.number ?? sale.id ?? 1).padStart(8, '0');

    // ── IVA desglosado ───────────────────────────────────────────────────────
    const afipReq  = afipInvoice?.afip_request;
    const ivaItems = afipReq?.iva_items?.length
        ? afipReq.iva_items
        : items.reduce((acc, item) => {
            const rate = Number(item.tax_rate ?? 0);
            if (rate > 0) {
                const ex = acc.find(x => x.rate === rate);
                if (ex) { ex.importe += Number(item.tax_amount ?? 0); }
                else    { acc.push({ rate, importe: Number(item.tax_amount ?? 0) }); }
            }
            return acc;
          }, []);
    const totalIVA = ivaItems.reduce((s, x) => s + Number(x.Importe ?? x.importe ?? 0), 0);
    const subTotal = total - totalIVA;

    // ── Pagos / cliente / fechas ──────────────────────────────────────────────
    const paymentBreakdown = Array.isArray(sale.payment_breakdown) && sale.payment_breakdown.length
        ? sale.payment_breakdown
        : (sale.sale_payments || []).map((payment) => ({
            method_name: payment.payment_method?.name || sale.payment_method || 'Efectivo',
            amount: Number(payment.amount || 0),
            is_account: false,
        }));
    const medioPago  = paymentBreakdown.length
        ? paymentBreakdown.map((payment) => payment.method_name).join(' + ')
        : (sale.payment_method || 'Efectivo');
    const paymentDetail = paymentBreakdown.length
        ? paymentBreakdown.map((payment) => `${payment.method_name}: $${fmt(payment.amount)}`).join(' | ')
        : medioPago;
    const accountPayment = paymentBreakdown.find((payment) => payment.is_account);
    const cajero     = sale.user?.name || sale.user?.email || 'Sistema';
    const pagado     = Number(sale.paid_amount || sale.amount_paid || 0);
    const vuelto     = Number(sale.change_amount || 0);
    const clientName = sale.customer?.name
        || sale.customer_name
        || sale.notes?.match(/Cliente:\s*(.+)/)?.[1]?.trim()
        || 'Consumidor Final';
    const clientDoc  = sale.customer?.cuit || sale.customer?.dni || '';
    const dt         = new Date(sale.sold_at || sale.created_at);
    const fechaStr   = dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr    = dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const cantArt    = items.reduce((a, i) => a + Number(i.quantity || 1), 0);

    // ── Tokens de diseño ─────────────────────────────────────────────────────
    const qrSz = is57 ? 64 : 82;
    const logoH = is57 ? 28 : 36;

    const F = {
        xs:     is57 ?  7.5 :  8.5,
        sm:     is57 ?  8.5 :  9.5,
        md:     is57 ? 10   : 11.5,
        lg:     is57 ? 12   : 14,
        xl:     is57 ? 14   : 17,
        letter: is57 ? 28   : 36,
    };

    // Paleta B/N puro — impresoras térmicas no reproducen grises (generan tramas difusas)
    const C = {
        accent:      '#000',
        accentLight: '#fff',
        line:        '#000',
        lineDark:    '#000',
        muted:       '#000',
        bg:          '#fff',
    };

    const Sep = ({ style = {} }) => (
        <div style={{ borderTop: `1px solid ${C.line}`, margin: '5px 0', ...style }} />
    );

    const Row = ({ label, value, bold, xs }) => (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            fontSize: xs ? F.xs : F.sm,
            fontWeight: 800,
            color: '#000',
            lineHeight: 1.3,
        }}>
            <span>{label}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: bold ? 700 : 500 }}>{value}</span>
        </div>
    );

    return (
        <div id="print-zone" style={{
            width: is57 ? '180px' : '260px',
            paddingRight: is57 ? '2px' : 0,
            fontFamily: '"Courier New", Courier, monospace',
            fontWeight: 700,
            fontSize: F.sm,
            color: '#000',
            background: '#fff',
            lineHeight: 1.3,
            boxSizing: 'border-box',
            WebkitFontSmoothing: 'none',
            fontSmooth: 'never',
            textRendering: 'optimizeSpeed',
        }}>

            {/* ── Barra de color superior ───────────────────────────────────── */}
            <div style={{ height: 4, background: C.accent, marginBottom: 0 }} />

            {/* ── Encabezado empresa ────────────────────────────────────────── */}
            <div style={{ textAlign: 'center', padding: '6px 6px 4px' }}>
                <CompanyLogo
                    company={company}
                    scope="general"
                    thermal
                    height={logoH}
                    maxWidth={is57 ? 112 : 156}
                    style={{ margin: '0 auto 4px' }}
                />
                <div style={{ fontSize: F.lg, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.15 }}>
                    {companyDisplayName}
                </div>
                {company.address && (
                    <div style={{ fontSize: F.xs, color: C.muted, marginTop: 1 }}>
                        {company.address}{company.city ? `, ${company.city}` : ''}
                    </div>
                )}
                {company.phone && (
                    <div style={{ fontSize: F.xs, color: C.muted }}>{company.phone}</div>
                )}
                <div style={{ fontSize: F.xs, color: C.muted, marginTop: 1 }}>
                    {ivaLabel}
                </div>
            </div>

            <Sep />

            {/* ── Tipo de comprobante + letra ───────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '3px 6px',
            }}>
                <div>
                    <div style={{ fontSize: F.xl, fontWeight: 900, letterSpacing: '-0.5px', color: C.accent, lineHeight: 1 }}>
                        {receipt.label}
                    </div>
                    <div style={{ fontSize: F.xs, color: C.muted, marginTop: 1, fontWeight: 600, letterSpacing: '0.3px' }}>
                        N° {pvStr}-{nroStr}
                    </div>
                </div>

                <div style={{
                    width: is57 ? 36 : 46,
                    height: is57 ? 36 : 46,
                    borderRadius: '50%',
                    background: C.accent,
                    color: '#fff',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <div style={{ fontSize: F.letter * 0.8, fontWeight: 900, lineHeight: 1 }}>
                        {receipt.letter}
                    </div>
                    <div style={{ fontSize: F.xs - 1, fontWeight: 700, letterSpacing: '0.5px' }}>
                        COD {receipt.code}
                    </div>
                </div>
            </div>

            {/* ── Fecha / hora / CUIT ───────────────────────────────────────── */}
            <div style={{ padding: '0 6px 4px', fontSize: F.xs, color: C.muted }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <span>{fechaStr}</span>
                    <span>{horaStr}</span>
                </div>
                {company.cuit && <div>CUIT: {company.cuit}</div>}
                {company.iibb && <div>Ing. Brutos: {company.iibb}</div>}
                {company.start_date && (
                    <div>Inicio Act.: {new Date(company.start_date).toLocaleDateString('es-AR')}</div>
                )}
            </div>

            <Sep />

            {/* ── Datos del cliente ─────────────────────────────────────────── */}
            <div style={{
                background: C.accentLight,
                borderRadius: 3,
                padding: '4px 6px',
                margin: '0 0 5px',
                fontSize: F.sm,
            }}>
                <div style={{ fontWeight: 700, fontSize: F.xs, color: C.accent, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
                    Cliente
                </div>
                <div style={{ fontWeight: 600 }}>{clientName}</div>
                {clientDoc && (
                    <div style={{ fontSize: F.xs, color: C.muted }}>
                        {clientDoc.length === 11 ? 'CUIT' : 'DNI'}: {clientDoc}
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: F.xs, color: C.muted, marginTop: 1 }}>
                    <span>{medioPago}</span>
                    <span>{accountPayment ? 'Pago mixto' : 'Venta contado'}</span>
                </div>
            </div>

            {/* ── Tabla de ítems ────────────────────────────────────────────── */}
            <div style={{ width: '100%', fontSize: F.sm, marginBottom: 4 }}>
                <div style={{
                    fontSize: F.xs, fontWeight: 700, color: C.muted,
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                    borderBottom: `1.5px solid ${C.accent}`, paddingBottom: 2, marginBottom: 1,
                }}>
                    <span style={{ display: 'inline-block', width: is57 ? '35%' : '41%', verticalAlign: 'top' }}>Descripción</span>
                    <span style={{ display: 'inline-block', width: is57 ? '11%' : '9%', textAlign: 'center', verticalAlign: 'top' }}>Cant</span>
                    <span style={{ display: 'inline-block', width: is57 ? '27%' : '25%', textAlign: 'right', verticalAlign: 'top' }}>Precio</span>
                    <span style={{ display: 'inline-block', width: is57 ? '27%' : '25%', textAlign: 'right', verticalAlign: 'top' }}>Total</span>
                </div>

                {items.map((item, i) => (
                    <div key={i} style={{ background: i % 2 === 1 ? C.bg : 'transparent', padding: '2.5px 0' }}>
                        <span style={{ display: 'inline-block', width: is57 ? '35%' : '41%', wordBreak: 'break-word', verticalAlign: 'top' }}>
                            {item.product_name || item.name}
                        </span>
                        <span style={{ display: 'inline-block', width: is57 ? '11%' : '9%', textAlign: 'center', verticalAlign: 'top' }}>
                            {Number(item.quantity)}
                        </span>
                        <span style={{ display: 'inline-block', width: is57 ? '27%' : '25%', textAlign: 'right', fontVariantNumeric: 'tabular-nums', verticalAlign: 'top', color: C.muted }}>
                            {fmt(item.unit_price)}
                        </span>
                        <span style={{ display: 'inline-block', width: is57 ? '27%' : '25%', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', verticalAlign: 'top' }}>
                            {fmt(item.total)}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Subtotales + IVA ─────────────────────────────────────────── */}
            <div style={{ padding: '0 6px', marginBottom: 4 }}>
                {receipt.isAfip && totalIVA > 0 && (
                    <>
                        <Row label={`${cantArt} artículo${cantArt !== 1 ? 's' : ''}`} value={`$ ${fmt(subTotal)}`} bold xs />
                        {ivaItems.map((iv, idx) => (
                            <Row key={idx}
                                label={`I.V.A. ${iv.rate ?? '21'}%`}
                                value={`$ ${fmt(iv.Importe ?? iv.importe ?? 0)}`}
                                xs />
                        ))}
                    </>
                )}
            </div>

            {/* ── TOTAL (bloque destacado) ─────────────────────────────────── */}
            <div style={{
                background: C.accent,
                color: '#fff',
                borderRadius: 4,
                margin: '0 0 5px',
                padding: is57 ? '5px 8px' : '6px 10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontSize: F.md, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Total
                </span>
                <span style={{ fontSize: F.xl, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                    $ {fmt(total)}
                </span>
            </div>

            {/* ── Detalle de pago ──────────────────────────────────────────── */}
            <div style={{ padding: '0 6px 4px', fontSize: F.xs, color: C.muted }}>
                {!receipt.isAfip && <div>{cantArt} artículo{cantArt !== 1 ? 's' : ''}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Medio de pago:</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{medioPago}</span>
                </div>
                {paymentBreakdown.length > 0 && (
                    <div style={{ marginTop: 2, lineHeight: 1.45 }}>
                        {paymentDetail}
                    </div>
                )}
                {pagado > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Cobrado:</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#111' }}>$ {fmt(pagado)}</span>
                    </div>
                )}
                {accountPayment && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Saldo Cta. Cte.:</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#111' }}>$ {fmt(accountPayment.amount)}</span>
                    </div>
                )}
                {vuelto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Su vuelto:</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#111' }}>$ {fmt(vuelto)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <span>Atendido por:</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{cajero}</span>
                </div>
            </div>

            {/* ── Régimen de Transparencia Fiscal (Ley 27.743) ────────────── */}
            {receipt.isAfip && (() => {
                const ivaContenido = totalIVA > 0 ? totalIVA : Math.round(total / 1.21 * 0.21 * 100) / 100;
                const otrosImp = 0;
                const TFRow = ({ label, value }) => (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: F.xs, lineHeight: 1.6,
                    }}>
                        <span>{label}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>$ {fmt(value)}</span>
                    </div>
                );
                return (
                    <div style={{
                        border: `1px solid ${C.lineDark}`,
                        borderRadius: 3,
                        padding: '4px 6px',
                        marginBottom: 5,
                        background: C.bg,
                    }}>
                        <div style={{
                            fontSize: F.xs, fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.3px',
                            marginBottom: 2, lineHeight: 1.3,
                        }}>
                            Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)
                        </div>
                        <TFRow label="IVA Contenido" value={ivaContenido} />
                        <TFRow label="Otros Imp. Nac. Indirectos" value={otrosImp} />
                    </div>
                );
            })()}

            {/* ── Footer AFIP ───────────────────────────────────────────────── */}
            {afipInvoice?.cae ? (
                <>
                    <Sep style={{ marginBottom: 5 }} />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '0 2px' }}>
                        <div style={{
                            flexShrink: 0,
                            border: `1px solid ${C.line}`,
                            borderRadius: 3,
                            padding: 2,
                        }}>
                            <QrCodeImg text={buildAfipQrUrl(afipInvoice, company)} size={qrSz} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <img src="/images/logo-arca.jpg" alt="ARCA"
                                style={{ height: is57 ? 16 : 20, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: 3 }} />
                            <div style={{
                                display: 'inline-block',
                                background: '#222', color: '#fff',
                                fontSize: F.xs - 0.5, fontWeight: 700,
                                padding: '1px 4px', borderRadius: 10, marginBottom: 3,
                                letterSpacing: '0.3px',
                            }}>
                                ✓ Autorizado
                            </div>
                            <div style={{ fontSize: F.xs, color: C.muted, lineHeight: 1.5 }}>
                                <div><strong style={{ color: '#111' }}>CAE:</strong> {afipInvoice.cae}</div>
                                <div><strong style={{ color: '#111' }}>Vto:</strong> {fmtDate(afipInvoice.cae_expiry)}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: F.xs - 0.5, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 1.3, padding: '0 4px' }}>
                        Esta Administración Federal no se responsabiliza<br />
                        por los datos ingresados en el detalle.
                    </div>
                </>
            ) : (
                <div style={{
                    fontSize: F.xs, color: C.muted, textAlign: 'center',
                    borderTop: `1px dashed ${C.lineDark}`, paddingTop: 4,
                }}>
                    {receipt.letter === 'X'
                        ? 'Comprobante no válido como factura'
                        : 'Pendiente de autorización AFIP'}
                </div>
            )}

            {/* ── Cierre ───────────────────────────────────────────────────── */}
            <div style={{
                marginTop: 6,
                borderTop: `2px solid ${C.accent}`,
                paddingTop: 4,
                textAlign: 'center',
                fontSize: F.xs,
                color: C.muted,
                letterSpacing: '0.3px',
            }}>
                Gracias por elegirnos
            </div>
        </div>
    );
}

export function Ticket80({ sale }) {
    return <TicketBase sale={sale} widthMM={80} />;
}

export function Ticket57({ sale }) {
    return <TicketBase sale={sale} widthMM={57} />;
}

export default TicketBase;
