import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';

// ─── Paleta ArtDent (Manual de Identidad) ───────────────────────────────────
const AD = {
    blue: '#397B9C',
    green: '#5AAD9C',
    mint: '#ACD6CE',
    teal: '#49949C',
    soft: '#7CA5C3',
    light: '#DAE6F0',
    pale: '#DAEEE3',
};

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-AR') : '—';

// ─── Logos reales de public/assets ───────────────────────────────────────────
// logo-artdent-color.png  → sobre fondos claros (A4 header)
// logo-artdent-blanco.png → sobre fondos oscuros
// logo-artdent-icon.png   → solo el símbolo (footer, tickets)

function LogoColor({ height = 50 }) {
    return (
        <img
            src="/assets/logo-artdent-color.png"
            alt="ArtDent Laboratorio Odontológico"
            style={{ height, objectFit: 'contain', display: 'block' }}
        />
    );
}

function LogoBlanco({ height = 40 }) {
    return (
        <img
            src="/assets/logo-artdent-blanco.png"
            alt="ArtDent"
            style={{ height, objectFit: 'contain', display: 'block' }}
        />
    );
}

function LogoIcon({ height = 32 }) {
    return (
        <img
            src="/assets/logo-artdent-icon.png"
            alt="ArtDent"
            style={{ height, objectFit: 'contain', display: 'block' }}
        />
    );
}

// ─── TICKET 80mm ─────────────────────────────────────────────────────────────
function Ticket80({ sale }) {
    const items = sale.sale_items || [];
    const totalIVA = items.reduce((s, i) => s + Number(i.tax_amount || 0), 0);
    return (
        <div id="print-zone" style={{ width: '80mm', fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#111', padding: '4mm', background: '#fff', lineHeight: 1.4 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height: 36, objectFit: 'contain' }} />
                </div>
                <div style={{ borderTop: `2px solid ${AD.blue}`, borderBottom: `2px solid ${AD.blue}`, margin: '6px 0', padding: '3px 0', fontSize: 11, fontWeight: 'bold' }}>
                    TICKET — {sale.sale_number}
                </div>
                <div style={{ fontSize: 10 }}>{fmtDateTime(sale.sold_at || sale.created_at)}</div>
            </div>
            {sale.notes && (
                <div style={{ fontSize: 10, marginBottom: 6, borderBottom: '1px dashed #ccc', paddingBottom: 4 }}>
                    {sale.notes.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                </div>
            )}
            <div style={{ marginBottom: 6 }}>
                <div style={{ borderBottom: '1px solid #ccc', paddingBottom: 2, marginBottom: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>DESCRIPCIÓN</span><span>IMPORTE</span>
                </div>
                {items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                        <div style={{ fontWeight: 'bold', fontSize: 11 }}>{item.product_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#444' }}>
                            <span>{Number(item.quantity)} × ${fmt(item.unit_price)}</span>
                            <span style={{ fontWeight: 'bold', color: '#111' }}>${fmt(item.total)}</span>
                        </div>
                        {Number(item.discount) > 0 && <div style={{ fontSize: 9, color: '#e00', textAlign: 'right' }}>Dcto: -${fmt(item.discount)}</div>}
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '2px solid #111', paddingTop: 4 }}>
                {Number(sale.discount_amount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                        <span>Descuento</span><span>-${fmt(sale.discount_amount)}</span>
                    </div>
                )}
                {totalIVA > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                        <span>IVA Contenido</span><span>${fmt(totalIVA)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, marginTop: 4, borderTop: '1px dashed #ccc', paddingTop: 4 }}>
                    <span>TOTAL</span><span style={{ color: AD.blue }}>${fmt(sale.total)}</span>
                </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 10, borderTop: '1px dashed #ccc', paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Recibido</span><span>${fmt(sale.paid_amount)}</span>
                </div>
                {Number(sale.change_amount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Vuelto</span><span>${fmt(sale.change_amount)}</span>
                    </div>
                )}
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, color: '#888', borderTop: '1px dashed #ccc', paddingTop: 6 }}>
                <div style={{ fontWeight: 'bold', color: AD.teal }}>¡Gracias por su visita!</div>
                <div style={{ marginTop: 2, fontFamily: "'Montserrat', sans-serif" }}>Tu sonrisa, es nuestra prioridad.</div>
                <div style={{ marginTop: 4, fontSize: 8 }}>Comprobante no válido como factura</div>
            </div>
        </div>
    );
}

// ─── TICKET 57mm ─────────────────────────────────────────────────────────────
function Ticket57({ sale }) {
    const items = sale.sale_items || [];
    return (
        <div id="print-zone" style={{ width: '57mm', fontFamily: "'Courier New', monospace", fontSize: '9px', color: '#111', padding: '3mm', background: '#fff', lineHeight: 1.35 }}>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
                    <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height: 26, objectFit: 'contain' }} />
                </div>
                <div style={{ borderTop: `1.5px solid ${AD.blue}`, borderBottom: `1.5px solid ${AD.blue}`, margin: '4px 0', padding: '2px 0', fontSize: 9, fontWeight: 'bold' }}>
                    {sale.sale_number}
                </div>
                <div style={{ fontSize: 8 }}>{fmtDate(sale.sold_at || sale.created_at)}</div>
            </div>
            <div style={{ marginBottom: 5, borderBottom: '1px dashed #ccc', paddingBottom: 4 }}>
                {items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 3 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                            <span>{Number(item.quantity)}×${fmt(item.unit_price)}</span>
                            <span style={{ fontWeight: 'bold' }}>${fmt(item.total)}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, marginTop: 4 }}>
                <span>TOTAL</span><span style={{ color: AD.blue }}>${fmt(sale.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginTop: 2 }}>
                <span>Recibido</span><span>${fmt(sale.paid_amount)}</span>
            </div>
            {Number(sale.change_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 'bold' }}>
                    <span>Vuelto</span><span>${fmt(sale.change_amount)}</span>
                </div>
            )}
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 7, color: '#999', borderTop: '1px dashed #ccc', paddingTop: 5 }}>
                <div style={{ color: AD.teal, fontWeight: 'bold', fontFamily: "'Montserrat', sans-serif" }}>¡Gracias!</div>
                <div style={{ fontSize: 6, marginTop: 2 }}>No válido como factura</div>
            </div>
        </div>
    );
}

// ─── FACTURA A4 ───────────────────────────────────────────────────────────────
function FacturaA4({ sale }) {
    const items = sale.sale_items || [];
    const subtotal = Number(sale.subtotal || 0);
    const discount = Number(sale.discount_amount || 0);
    const totalIVA = items.reduce((s, i) => s + Number(i.tax_amount || 0), 0);
    const total = Number(sale.total || 0);
    const clientName = sale.notes?.match(/Cliente:\s*(.+)/)?.[1]?.trim() || 'Consumidor Final';
    const extraNotes = sale.notes?.replace(/^Cliente:[^\n]+\n?/, '') || '';

    // Layout: flex column con minHeight A4. El spacer empuja el footer al fondo
    // sin position:absolute (que causaba el espacio en blanco gigante).
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8mm 15mm 6mm', borderBottom: `1px solid ${AD.light}`, position: 'relative', zIndex: 1, flexShrink: 0 }}>
                {/* Logo izquierda */}
                <LogoColor height={52} />

                {/* Tipo de comprobante centrado (estilo AFIP) */}
                <div style={{ textAlign: 'center', border: '2.5px solid #222', padding: '6px 18px', minWidth: 108, alignSelf: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>X</div>
                    <div style={{ borderTop: '1px solid #222', marginTop: 3, paddingTop: 3, fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>CÓD. 00</div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>ORIGINAL</div>
                </div>

                {/* Datos del comprobante derecha */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: AD.blue, letterSpacing: -0.5 }}>TICKET</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#222', marginTop: 2 }}>{sale.sale_number}</div>
                    <div style={{ fontSize: 8.5, color: '#555', marginTop: 5, lineHeight: 1.8 }}>
                        <div><strong>Fecha de Emisión:</strong> {fmtDate(sale.sold_at || sale.created_at)}</div>
                        <div><strong>Hora:</strong> {sale.sold_at ? new Date(sale.sold_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </div>
                </div>
            </div>

            {/* ── EMISOR ──────────────────────────────────────────────────────── */}
            <div style={{ padding: '5mm 15mm', borderBottom: `1px solid ${AD.light}`, position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', alignItems: 'start' }}>
                    <div style={{ fontSize: 8.5, lineHeight: 1.8, color: '#333' }}>
                        <div style={{ fontWeight: 800, fontSize: 10.5, color: '#111', marginBottom: 2 }}>ArtDent Laboratorio Odontológico</div>
                        <div>Laboratorio Odontológico</div>
                        <div>Argentina</div>
                    </div>
                    <div style={{ fontSize: 8.5, lineHeight: 1.8, color: '#333', textAlign: 'right' }}>
                        <div><strong>Condición IVA:</strong> Monotributista</div>
                    </div>
                </div>
            </div>

            {/* ── CLIENTE ─────────────────────────────────────────────────────── */}
            <div style={{ padding: '4mm 15mm', borderBottom: `1px solid ${AD.light}`, position: 'relative', zIndex: 1, flexShrink: 0, background: '#fafcfe' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9 }}>
                        <div><span style={{ fontWeight: 700 }}>Nombre: </span>{clientName}</div>
                        {extraNotes && <div><span style={{ fontWeight: 700 }}>Notas: </span>{extraNotes}</div>}
                        <div><span style={{ fontWeight: 700 }}>Cond. IVA: </span>Consumidor Final</div>
                        <div><span style={{ fontWeight: 700 }}>Cond. Venta: </span>Contado</div>
                    </div>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9 }}>
                        {/* espacio para datos adicionales del cliente cuando existan */}
                    </div>
                </div>
            </div>

            {/* ── TABLA DE ÍTEMS ──────────────────────────────────────────────── */}
            <div style={{ padding: '5mm 15mm 0', position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                    <thead>
                        <tr style={{ background: AD.blue, color: '#fff' }}>
                            {[
                                { label: 'Código', align: 'left', w: '14%' },
                                { label: 'Descripción', align: 'left', w: '36%' },
                                { label: 'Cantidad', align: 'center', w: '10%' },
                                { label: 'U. Medida', align: 'center', w: '10%' },
                                { label: 'P. Unit.', align: 'right', w: '13%' },
                                { label: '% Bonif.', align: 'right', w: '8%' },
                                { label: 'Importe', align: 'right', w: '9%' },
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
                                <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 9 }}>{item.product_name}</td>
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

            {/* Spacer: empuja el bloque inferior al fondo del A4 */}
            <div style={{ flex: 1, minHeight: '8mm' }} />

            {/* ── BLOQUE INFERIOR (totales + footer) ──────────────────────────── */}
            <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>

                {/* Totales + Transparencia Fiscal */}
                <div style={{ padding: '0 15mm 5mm', borderTop: `1px solid ${AD.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5mm' }}>
                        <div style={{ width: '72mm' }}>
                            {/* Descripción / Importe — estilo AFIP */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', border: `1px solid ${AD.light}` }}>
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
                            </table>

                            {/* Total destacado */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 8px', background: AD.blue, color: '#fff', marginTop: 0, borderRadius: '0 0 4px 4px' }}>
                                <span style={{ fontWeight: 900, fontSize: '10pt', letterSpacing: 0.5 }}>IMPORTE TOTAL: $</span>
                                <span style={{ fontWeight: 900, fontSize: '13pt' }}>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transparencia Fiscal Ley 27.743 */}
                    {totalIVA > 0 && (
                        <div style={{ marginTop: 8, fontSize: 7.5, lineHeight: 1.7, color: '#444' }}>
                            <div style={{ fontWeight: 700 }}>Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)</div>
                            <div style={{ display: 'flex', gap: 24 }}>
                                <span>IVA Contenido: $ {fmt(totalIVA)}</span>
                                <span>Otros Impuestos Nacionales Indirectos: $ 0,00</span>
                            </div>
                        </div>
                    )}

                    {/* Pago */}
                    <div style={{ marginTop: 6, fontSize: 8, color: '#555' }}>
                        <span style={{ fontWeight: 700 }}>Son: </span>
                        <span style={{ fontStyle: 'italic' }}>{fmt(total)} pesos argentinos</span>
                        {'  '}
                        <span style={{ marginLeft: 12, fontWeight: 700 }}>Recibido: </span>${fmt(sale.paid_amount)}
                        {Number(sale.change_amount) > 0 && <span style={{ marginLeft: 12 }}><strong>Vuelto: </strong>${fmt(sale.change_amount)}</span>}
                    </div>
                </div>

                {/* Footer institucional */}
                <div style={{ padding: '4mm 15mm', borderTop: `1px solid ${AD.light}`, background: '#fafcfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <LogoIcon height={26} />
                            <span style={{ fontSize: 7.5, color: AD.teal, fontWeight: 600, fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Tu sonrisa, es nuestra prioridad.
                            </span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 7, color: '#bbb', lineHeight: 1.7 }}>
                            <div>Comprobante no válido como factura</div>
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

// ─── MODOS DE SALIDA ──────────────────────────────────────────────────────────
const MODES = [
    { id: '80mm', label: 'Ticket 80mm', icon: '🖨️', desc: 'Impresora térmica estándar' },
    { id: '57mm', label: 'Ticket 57mm', icon: '🧾', desc: 'Impresora térmica compacta' },
    { id: 'a4', label: 'PDF A4', icon: '📄', desc: 'Comprobante con marca institucional' },
];

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Show({ auth, sale }) {
    const { isDark } = useTheme();
    const [mode, setMode] = useState('a4');

    const handlePrint = () => {
        const el = document.getElementById('print-zone');
        if (!el) return;

        const pageSize = mode === 'a4' ? 'A4' : mode === '80mm' ? '80mm 297mm' : '57mm 297mm';
        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(`
            <!DOCTYPE html><html><head>
            <title>ArtDent — ${sale.sale_number}</title>
            <base href="${window.location.origin}">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: ${pageSize}; margin: 0; }
                * { box-sizing: border-box; }
                body { margin: 0; background: #fff; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
            </head><body>${el.outerHTML}</body></html>
        `);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 700);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Venta ${sale.sale_number}`} />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet" />

            <div className="max-w-6xl mx-auto space-y-6 font-sans">

                {/* Barra superior */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('sales.index')}>
                            <Button variant="outline" size="icon" className={`rounded-xl ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}>
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Comprobante de Venta
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {sale.sale_number} · {fmtDate(sale.sold_at || sale.created_at)}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handlePrint}
                        className="text-white border-none shadow-md rounded-xl"
                        style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal})` }}
                    >
                        {mode === 'a4'
                            ? <><Download size={16} className="mr-2" />Exportar PDF</>
                            : <><Printer size={16} className="mr-2" />Imprimir Ticket</>}
                    </Button>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">

                    {/* Panel izquierdo: selector */}
                    <div className="xl:w-64 flex-shrink-0 space-y-2">
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Formato de salida
                        </h3>
                        {MODES.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${mode === m.id
                                        ? isDark ? 'border-blue-500/50 bg-blue-900/20' : 'border-blue-300 bg-blue-50 shadow-sm'
                                        : isDark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{m.icon}</span>
                                    <div>
                                        <div className={`text-sm font-bold ${mode === m.id ? 'text-blue-500' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>{m.label}</div>
                                        <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {/* Resumen */}
                        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resumen</h4>
                            {[
                                ['Nº', sale.sale_number],
                                ['Estado', sale.status],
                                ['Total', `$${fmt(sale.total)}`],
                                ['Cobrado', `$${fmt(sale.paid_amount)}`],
                                ['Ítems', (sale.sale_items?.length || 0) + ' producto(s)'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between text-xs py-0.5">
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{label}</span>
                                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel de preview */}
                    <div className="flex-1 min-w-0">
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                            {/* Barra titular */}
                            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Vista previa — {MODES.find(m => m.id === mode)?.label}
                                </span>
                            </div>

                            {/* Área de preview */}
                            <div
                                className="overflow-auto p-6 flex justify-center"
                                style={{ minHeight: 500, maxHeight: '75vh', background: isDark ? '#0d1520' : '#dde2e8' }}
                            >
                                <div style={{
                                    boxShadow: '0 6px 30px rgba(0,0,0,0.22), 0 1px 5px rgba(0,0,0,0.12)',
                                    display: 'inline-block',
                                    transform: mode === 'a4' ? 'scale(0.72)' : 'scale(1)',
                                    transformOrigin: 'top center',
                                }}>
                                    {mode === '80mm' && <Ticket80 sale={sale} />}
                                    {mode === '57mm' && <Ticket57 sale={sale} />}
                                    {mode === 'a4' && <FacturaA4 sale={sale} />}
                                </div>
                            </div>
                        </div>
                        {mode === 'a4' && (
                            <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Vista al 72% · El PDF se genera a tamaño real (A4)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}