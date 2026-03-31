/**
 * FacturaA4 — Comprobante A4 compartido entre Sale/Create y Sale/Show
 *
 * Uso:
 *   import FacturaA4 from '@/Components/Sale/FacturaA4';
 *
 *   // En Show: sale ya tiene sale.company cargado
 *   <FacturaA4 sale={sale} />
 *
 *   // En Create: fusionar company en el objeto postSale
 *   <FacturaA4 sale={{ ...postSale, company, sale_items: postSale.items }} />
 */
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CompanyLogo, getCompanyDisplayName, getCompanyLogoUrl } from '@/lib/companyBranding';

// ─── Paleta ArtDent ───────────────────────────────────────────────────────────
export const AD = {
    blue:  '#397B9C',
    green: '#5AAD9C',
    teal:  '#49949C',
    mint:  '#ACD6CE',
    light: '#DAE6F0',
    soft:  '#7CA5C3',
    pale:  '#DAEEE3',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const fmt     = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

export function fmtCuit(cuit) {
    if (!cuit) return '—';
    const c = String(cuit).replace(/\D/g, '');
    if (c.length === 11) return `${c.slice(0, 2)}-${c.slice(2, 10)}-${c.slice(10)}`;
    return cuit;
}

export const IVA_LABELS = {
    responsable_inscripto: 'Responsable Inscripto',
    monotributista:        'Responsable Monotributo',
    exento:                'IVA Exento',
    consumidor_final:      'Consumidor Final',
};

export function parseReceiptType(rt) {
    const r = (rt || 'X').toUpperCase();
    const MAP = {
        X:   { letter: 'X', label: 'TICKET',       code: '00', isAfip: false },
        A:   { letter: 'A', label: 'FACTURA A',     code: '01', isAfip: true  },
        FA:  { letter: 'A', label: 'FACTURA A',     code: '01', isAfip: true  },
        B:   { letter: 'B', label: 'FACTURA B',     code: '06', isAfip: true  },
        FB:  { letter: 'B', label: 'FACTURA B',     code: '06', isAfip: true  },
        C:   { letter: 'C', label: 'FACTURA C',     code: '11', isAfip: true  },
        FC:  { letter: 'C', label: 'FACTURA C',     code: '11', isAfip: true  },
        NCA: { letter: 'A', label: 'N. CRÉDITO A',  code: '02', isAfip: true  },
        NCB: { letter: 'B', label: 'N. CRÉDITO B',  code: '07', isAfip: true  },
        NCC: { letter: 'C', label: 'N. CRÉDITO C',  code: '12', isAfip: true  },
        NDA: { letter: 'A', label: 'N. DÉBITO A',   code: '03', isAfip: true  },
        NDB: { letter: 'B', label: 'N. DÉBITO B',   code: '08', isAfip: true  },
        NDC: { letter: 'C', label: 'N. DÉBITO C',   code: '13', isAfip: true  },
    };
    return MAP[r] ?? { letter: r, label: r, code: '00', isAfip: false };
}

export function buildAfipQrUrl(invoice, company) {
    if (!invoice?.cae) return null;
    const cuitNum = parseInt(String(company?.cuit || '').replace(/\D/g, ''), 10);
    const data = {
        ver:        1,
        fecha:      (invoice.issued_at || new Date().toISOString()).substring(0, 10),
        cuit:       cuitNum,
        ptoVta:     invoice.point_sale || company?.afip_point_sale || 1,
        tipoCmp:    invoice.invoice_type?.afip_code || 11,
        nroCmp:     invoice.number || 1,
        importe:    Number(invoice.total),
        moneda:     'PES',
        ctz:        1,
        tipoCodAut: 'E',
        codAut:     Number(invoice.cae),
    };
    if (invoice.recipient_cuit) {
        const doc = String(invoice.recipient_cuit).replace(/\D/g, '');
        if (doc.length >= 7) {
            data.tipoDocRec = doc.length === 11 ? 80 : 96;
            data.nroDocRec  = parseInt(doc, 10);
        }
    }
    return 'https://www.arca.gob.ar/fe/qr/?p=' + btoa(JSON.stringify(data));
}

// ─── QR asíncrono ─────────────────────────────────────────────────────────────
function QrCodeImg({ text, size = 76 }) {
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

// ─── FACTURA A4 ───────────────────────────────────────────────────────────────
export default function FacturaA4({ sale }) {
    const items    = sale.sale_items || sale.items || [];
    const subtotal = Number(sale.subtotal || 0);
    const discount = Number(sale.discount_amount || 0);
    const totalIVA = items.reduce((s, i) => s + Number(i.tax_amount || 0), 0);
    const total    = Number(sale.total || 0);
    // IVA contenido para Transparencia Fiscal Ley 27.743
    const ivaContenido = totalIVA > 0 ? totalIVA : Math.round(total / 1.21 * 0.21 * 100) / 100;

    const company  = sale.company || {};
    const configuredLogo = getCompanyLogoUrl(company, 'general');
    const companyDisplayName = company.name || getCompanyDisplayName(company, { preferFantasy: false });
    const receipt  = parseReceiptType(sale.receipt_type);
    const ivaLabel = IVA_LABELS[company.iva_condition] || 'Responsable Inscripto';

    // Número de comprobante
    const afipInvoice = sale.invoice;
    const pointSale = afipInvoice?.point_sale
        ? String(afipInvoice.point_sale).padStart(4, '0')
        : receipt.isAfip
            ? String(company.afip_point_sale ?? 1).padStart(4, '0')
            : '0001';
    const nroComp = afipInvoice?.number
        ? `${pointSale}-${String(afipInvoice.number).padStart(8, '0')}`
        : sale.sale_number?.includes('-')
            ? sale.sale_number
            : `${pointSale}-${String(sale.id ?? 1).padStart(8, '0')}`;

    // Datos del receptor
    const inv = sale.invoice;
    const clientName = (inv?.recipient_name && inv.recipient_name !== 'Consumidor Final')
        ? inv.recipient_name
        : (sale.customer?.name
            || sale.customer_name
            || sale.notes?.match(/Cliente:\s*(.+)/)?.[1]?.trim()
            || 'Consumidor Final');
    const clientDoc      = inv?.recipient_cuit || sale.customer?.cuit || sale.customer?.dni || null;
    const clientDocLabel = clientDoc?.replace(/\D/g, '').length === 11 ? 'CUIT' : 'DNI';
    const recipientIvaLabel = IVA_LABELS[inv?.recipient_iva || sale.customer?.iva_condition] || 'Consumidor Final';
    const extraNotes = sale.notes?.replace(/^Cliente:[^\n]+\n?/, '') || '';

    // Medio de pago
    const primerPago = sale.sale_payments?.[0];
    const medioPago  = primerPago?.payment_method?.name || sale.payment_method || 'Contado';

    // Datos del emisor
    const inicioAct = company.start_date
        ? new Date(company.start_date).toLocaleDateString('es-AR')
        : null;

    return (
        <div id="print-zone" style={{
            width: '210mm', minHeight: '297mm',
            fontFamily: "'Montserrat', sans-serif", fontSize: '10pt',
            color: '#1A202C', background: '#fff',
            display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
        }}>
            {/* Franja superior */}
            <div style={{ background: `linear-gradient(135deg, ${AD.blue} 0%, ${AD.teal} 55%, ${AD.green} 100%)`, height: 8, flexShrink: 0 }} />

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', gap: 0, alignItems: 'start', padding: '6mm 15mm 5mm', borderBottom: '2px solid #222', flexShrink: 0 }}>
                {/* Izquierda: datos del emisor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <CompanyLogo
                        company={company}
                        scope="general"
                        height="22mm"
                        maxWidth="78mm"
                        style={{ marginBottom: 2 }}
                    />
                    {/* Siempre razón social, nunca nombre de fantasía */}
                    <div style={{ fontWeight: 800, fontSize: configuredLogo ? 9 : 16, color: '#111', lineHeight: 1.2, marginTop: configuredLogo ? 4 : 0 }}>
                        {companyDisplayName}
                    </div>
                    <div style={{ fontSize: 7.5, color: '#444', lineHeight: 1.75, marginTop: 2 }}>
                        {company.address && <div>{company.address}</div>}
                        {(company.city || company.province) && (
                            <div>{[company.city, company.province].filter(Boolean).join(' - ')}</div>
                        )}
                        {company.phone && <div>Teléfono: {company.phone}</div>}
                        {company.email && <div>{company.email}</div>}
                        <div style={{ marginTop: 3 }}>{ivaLabel}</div>
                    </div>
                </div>

                {/* Centro: letra del comprobante AFIP */}
                <div style={{ textAlign: 'center', border: '2.5px solid #222', padding: '4px 0', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: '#111' }}>{receipt.letter}</div>
                    <div style={{ borderTop: '1.5px solid #222', marginTop: 4, paddingTop: 4, fontSize: 7, fontWeight: 700, letterSpacing: 0.5 }}>
                        COD. {receipt.code}
                    </div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5 }}>ORIGINAL</div>
                </div>

                {/* Derecha: tipo + número + fecha + datos fiscales */}
                <div style={{ textAlign: 'right', paddingLeft: 12 }}>
                    <div style={{ fontSize: receipt.letter === 'X' ? 18 : 20, fontWeight: 900, color: AD.blue, letterSpacing: -0.5 }}>
                        {receipt.label}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#222', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                        Nº {nroComp}
                    </div>
                    <div style={{ fontSize: 8, color: '#444', marginTop: 5, lineHeight: 1.9 }}>
                        <div><strong>Fecha:</strong> {fmtDate(sale.sold_at || sale.created_at)}</div>
                        {company.cuit && <div><strong>C.U.I.T.:</strong> {fmtCuit(company.cuit)}</div>}
                        {company.iibb && <div><strong>Ing. Brutos:</strong> {company.iibb}</div>}
                        {inicioAct && <div><strong>Inicio de Actividades:</strong> {inicioAct}</div>}
                    </div>
                </div>
            </div>

            {/* ── RECEPTOR ────────────────────────────────────────────────────── */}
            <div style={{ padding: '3.5mm 15mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9 }}>
                        <div><span style={{ fontWeight: 700 }}>Nombre y Apellido o Razón Social:</span> {clientName}</div>
                        {clientDoc && <div><span style={{ fontWeight: 700 }}>{clientDocLabel}:</span> {clientDoc}</div>}
                        {extraNotes && <div><span style={{ fontWeight: 700 }}>Notas:</span> {extraNotes}</div>}
                    </div>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9, textAlign: 'right' }}>
                        <div><span style={{ fontWeight: 700 }}>Cond. IVA:</span> {recipientIvaLabel}</div>
                        <div><span style={{ fontWeight: 700 }}>Condición de Venta:</span> {medioPago}</div>
                    </div>
                </div>
            </div>

            {/* ── TABLA DE ÍTEMS ──────────────────────────────────────────────── */}
            <div style={{ padding: '5mm 15mm 0', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                    <thead>
                        <tr style={{ background: AD.blue, color: '#fff' }}>
                            {[
                                { label: 'Código',      align: 'left',   w: '14%' },
                                { label: 'Descripción', align: 'left',   w: '36%' },
                                { label: 'Cantidad',    align: 'center', w: '10%' },
                                { label: 'U. Medida',   align: 'center', w: '10%' },
                                { label: 'P. Unit.',    align: 'right',  w: '13%' },
                                { label: '% Bonif.',    align: 'right',  w: '8%'  },
                                { label: 'Importe',     align: 'right',  w: '9%'  },
                            ].map((h, i) => (
                                <th key={h.label} style={{
                                    padding: '5px 8px', textAlign: h.align, fontWeight: 700,
                                    fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.3,
                                    width: h.w,
                                    borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                }}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f9fc', borderBottom: `1px solid ${AD.light}` }}>
                                <td style={{ padding: '6px 8px', color: '#666', fontSize: 8 }}>{item.sku || '—'}</td>
                                <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 9 }}>{item.product_name || item.name}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9 }}>{Number(item.quantity)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 8.5, color: '#666' }}>Unid.</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>{fmt(item.unit_price)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9, color: Number(item.discount) > 0 ? '#c00' : '#999' }}>
                                    {Number(item.discount) > 0 ? fmt(Number(item.discount) / Number(item.unit_price) * 100) + '%' : '0,00'}
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: AD.blue }}>{fmt(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1, minHeight: '8mm' }} />

            {/* ── BLOQUE INFERIOR ──────────────────────────────────────────────── */}
            <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>

                {/* Totales */}
                <div style={{ padding: '0 15mm 5mm', borderTop: `1px solid ${AD.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5mm' }}>
                        <div style={{ width: '72mm' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', border: `1px solid ${AD.light}`, borderBottom: 'none' }}>
                                <thead>
                                    <tr style={{ background: '#f0f4f8' }}>
                                        <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Descripción</th>
                                        <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {totalIVA > 0 && (
                                        <tr style={{ borderTop: `1px solid ${AD.light}` }}>
                                            <td style={{ padding: '4px 8px', fontSize: 8.5 }}>Importe Neto Gravado:</td>
                                            <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 8.5 }}>{fmt(subtotal > 0 ? subtotal : total - totalIVA)}</td>
                                        </tr>
                                    )}
                                    {totalIVA > 0 && (
                                        <tr style={{ borderTop: `1px solid ${AD.light}` }}>
                                            <td style={{ padding: '4px 8px', fontSize: 8.5 }}>IVA 21,00 %:</td>
                                            <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 8.5 }}>{fmt(totalIVA)}</td>
                                        </tr>
                                    )}
                                    {discount > 0 && (
                                        <tr style={{ borderTop: `1px solid ${AD.light}` }}>
                                            <td style={{ padding: '4px 8px', fontSize: 8.5 }}>Descuento:</td>
                                            <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 8.5, color: '#c00' }}>-{fmt(discount)}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: AD.blue }}>
                                        <td style={{ padding: '5px 8px', color: '#fff', fontWeight: 900, fontSize: '10pt', letterSpacing: 0.5 }}>IMPORTE TOTAL: $</td>
                                        <td style={{ padding: '5px 8px', color: '#fff', fontWeight: 900, fontSize: '13pt', textAlign: 'right' }}>{fmt(total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Transparencia Fiscal Ley 27.743 — siempre en comprobantes AFIP */}
                    {receipt.isAfip && (
                        <div style={{ marginTop: 8, fontSize: 7.5, lineHeight: 1.7, color: '#444' }}>
                            <div style={{ fontWeight: 700 }}>Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)</div>
                            <div style={{ display: 'flex', gap: 24 }}>
                                <span>IVA Contenido: $ {fmt(ivaContenido)}</span>
                                <span>Otros Impuestos Nacionales Indirectos: $ 0,00</span>
                            </div>
                        </div>
                    )}

                    {/* Son / Recibido */}
                    <div style={{ marginTop: 6, fontSize: 8, color: '#555' }}>
                        <span style={{ fontWeight: 700 }}>Son: </span>
                        <span style={{ fontStyle: 'italic' }}>{fmt(total)} pesos argentinos</span>
                        {'   '}
                        <span style={{ marginLeft: 12, fontWeight: 700 }}>Recibido: </span>${fmt(sale.paid_amount)}
                        {Number(sale.change_amount) > 0 && <span style={{ marginLeft: 12 }}><strong>Vuelto: </strong>${fmt(sale.change_amount)}</span>}
                    </div>
                </div>

                {/* Footer AFIP — QR + Logo ARCA + CAE */}
                {sale.invoice?.cae && (
                    <div style={{ padding: '3mm 15mm', borderTop: '2px solid #222', display: 'flex', alignItems: 'center', gap: 14, background: '#fff' }}>
                        <QrCodeImg text={buildAfipQrUrl(sale.invoice, company)} size={76} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <img src="/images/logo-arca.jpg" alt="ARCA" style={{ height: 28, width: 'auto', objectFit: 'contain', objectPosition: 'left' }} />
                            <div style={{ fontWeight: 800, fontSize: 9, color: '#111' }}>Comprobante Autorizado</div>
                            <div style={{ fontSize: 6.5, color: '#555', lineHeight: 1.5, maxWidth: 240 }}>
                                Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación.
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 8.5, lineHeight: 1.9, whiteSpace: 'nowrap' }}>
                            <div><strong>CAE Nº:</strong> {sale.invoice.cae}</div>
                            <div><strong>Fecha de Vto. de CAE:</strong> {fmtDate(sale.invoice.cae_expiry)}</div>
                        </div>
                    </div>
                )}

                {/* Footer institucional */}
                <div style={{ padding: '3mm 15mm', borderTop: `1px solid ${AD.light}`, background: '#fafcfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CompanyLogo company={company} scope="general" height="10mm" maxWidth="20mm" />
                            <span style={{ fontSize: 7.5, color: AD.teal, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {companyDisplayName} — Tu sonrisa, es nuestra prioridad.
                            </span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 7, color: '#bbb', lineHeight: 1.7 }}>
                            {receipt.letter === 'X' && <div>Comprobante no válido como factura</div>}
                            <div>Generado por ArtDent CRM — {fmtDate(new Date())}</div>
                        </div>
                    </div>
                </div>

                {/* Franja inferior */}
                <div style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: 5 }} />
            </div>
        </div>
    );
}
