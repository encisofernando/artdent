import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Printer, Download, Eye } from 'lucide-react';

// ─── Brand ───────────────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

// ─── Ticket térmico (80mm / 54mm) ────────────────────────────────────────────
function TicketBase({ job, widthMM = 80 }) {
    const is54 = widthMM === 54;
    const items = job.job_items || [];
    const total = Number(job.total || 0);
    const dentist = job.dentist || {};
    const patient = job.patient || {};
    const ticketNum = (job.job_number || '').replace(/[^0-9]/g, '') || job.job_number || '—';

    const F = {
        logo: is54 ? 28 : 36,
        label: is54 ? 8 : 10,   // Textos base
        value: is54 ? 8 : 10,
        th: is54 ? 7.5 : 9,     // Tabla head
        td: is54 ? 7.5 : 9,     // Tabla base
        total: is54 ? 12 : 16,  // Total
        small: is54 ? 7 : 8,
        ticketN: is54 ? 11 : 14 // "TICKET X"
    };
    const PAD = '0'; // Thermal printers have unprintable margins physically

    const pxWidth = is54 ? 50 : 74; // Native true-printable widths in mm

    const Row = ({ label, value, bold = false }) => (
        <div style={{ fontSize: `${F.label}pt`, marginBottom: 3, wordWrap: 'break-word', lineHeight: 1.25 }}>
            <span style={{ fontWeight: 700, color: '#000', marginRight: 4 }}>{label}:</span>
            <span style={{ fontWeight: bold ? 900 : 500, color: '#000' }}>{value}</span>
        </div>
    );

    return (
        <div id="print-zone" style={{ width: `${pxWidth}mm`, fontFamily: "'Courier New', Courier, monospace", fontSize: `${F.label}pt`, color: '#000', padding: PAD, background: '#fff', lineHeight: 1.45, boxSizing: 'border-box' }}>
            {/* Top stripe */}
            <div style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: is54 ? 3 : 4, margin: `0 -${is54 ? 3 : 4}mm ${is54 ? 5 : 7}px` }} />

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: is54 ? 5 : 7, marginTop: 5 }}>
                <img src="/assets/logo-artdent-negro.png" alt="ArtDent" style={{ height: F.logo, objectFit: 'contain', display: 'inline-block' }} />
            </div>

            <div style={{ textAlign: 'center', fontSize: F.small + 1, fontWeight: 700, color: '#000', letterSpacing: 0.3, marginBottom: is54 ? 5 : 7 }}>
                DOCUMENTO NO VÁLIDO COMO FACTURA
            </div>

            <div style={{ borderTop: '2px solid #000', marginBottom: is54 ? 5 : 6 }} />

            {/* Ticket # */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: is54 ? 6 : 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: F.label, fontWeight: 900, color: '#000' }}>Ticket:</span>
                    <div style={{ border: '2px solid #000', padding: '2px 10px', fontWeight: 900, color: '#000', fontSize: F.ticketN, minWidth: is54 ? 44 : 56, textAlign: 'center' }}>{ticketNum}</div>
                </div>
            </div>

            {/* Cliente */}
            <div style={{ marginBottom: is54 ? 6 : 8 }}>
                <Row label="FECHA" value={fmtDate(job.created_at)} />
                <Row label="PACIENTE" value={patient?.name || '—'} />
                {dentist && (
                    <Row label="DR(A)" value={dentist.name || dentist.email || '—'} />
                )}
            </div>

            <div style={{ borderTop: '2px solid #000', marginBottom: is54 ? 4 : 5 }} />

            {/* Tabla */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: F.th, marginBottom: is54 ? 4 : 6 }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid #000`, borderTop: `2px solid #000` }}>
                        <th style={{ padding: '3px 2px', textAlign: 'left', fontWeight: 900, color: '#000', width: '50%' }}>Descripción</th>
                        <th style={{ padding: '3px 2px', textAlign: 'center', fontWeight: 900, color: '#000', width: '16%' }}>Can</th>
                        <th style={{ padding: '3px 2px', textAlign: 'center', fontWeight: 900, color: '#000', width: '16%' }}>Uni</th>
                        <th style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 900, color: '#000', width: '18%' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? items.map((it, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 2px', fontSize: F.td, fontWeight: 600, color: '#000' }}>{it.description}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: F.td, fontWeight: 700, color: '#000' }}>{Number(it.quantity)}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: F.td, fontWeight: 600, color: '#000' }}>{fmt(it.unit_price)}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 900, fontSize: F.td, color: '#000' }}>{fmt(it.total || it.unit_price * it.quantity)}</td>
                        </tr>
                    )) : (
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 2px', fontSize: F.td, fontWeight: 600, color: '#000' }}>{job.job_type?.name || job.description || 'Trabajo de laboratorio'}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: F.td, fontWeight: 700, color: '#000' }}>1</td>
                            <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: F.td, fontWeight: 600, color: '#000' }}>{fmt(total)}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 900, fontSize: F.td, color: '#000' }}>{fmt(total)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ borderTop: '2px solid #000', marginBottom: is54 ? 4 : 5 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: F.total, fontWeight: 900, color: '#000', marginBottom: is54 ? 4 : 6 }}>
                <span>Total del Ticket:</span>
                <span style={{ color: '#000' }}>{fmt(total)}</span>
            </div>

            {job.shade && <div style={{ fontSize: F.small, color: '#000', marginBottom: 3 }}><span style={{ fontWeight: 900 }}>Tono/Color: </span><span style={{ fontWeight: 600 }}>{job.shade}</span></div>}
            {job.due_date && <div style={{ fontSize: F.small, color: '#000', marginBottom: is54 ? 4 : 5 }}><span style={{ fontWeight: 900 }}>Entrega: </span><span style={{ fontWeight: 600 }}>{fmtDate(job.due_date)}</span></div>}

            <div style={{ borderTop: '2px dashed #000', margin: `${is54 ? 5 : 7}px 0 ${is54 ? 4 : 5}px` }} />

            <div style={{ textAlign: 'center', fontSize: F.small }}>
                <div style={{ fontWeight: 900, color: '#000', fontFamily: "'Courier New', Courier, monospace", marginBottom: 2, fontSize: F.small + 1 }}>Tu sonrisa, es nuestra prioridad.</div>
                <div style={{ color: '#000', marginTop: 2, fontWeight: 600 }}>ArtDent Laboratorio Odontológico</div>
            </div>

        </div>
    );
}

// ─── Orden A4 ─────────────────────────────────────────────────────────────────
function OrdenA4({ job }) {
    const items = job.job_items || [];
    const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
    const discount = Number(job.discount_amount || 0);
    const total = Number(job.total || 0);
    const dentist = job.dentist || {};
    const patientName = job.patient?.name ? `${job.patient.name} ${job.patient.last_name || ''}`.trim() : '—';
    const clientName = dentist.type === 'clinic' ? (dentist.name || dentist.contact_name) : `${dentist.last_name || ''} ${dentist.name || ''}`.trim().toUpperCase();

    return (
        <div id="print-zone" style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Montserrat', sans-serif", fontSize: '10pt', color: '#1A202C', background: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${AD.blue} 0%, ${AD.teal} 55%, ${AD.green} 100%)`, height: 8, flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8mm 15mm 6mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height: 52, objectFit: 'contain' }} />
                <div style={{ textAlign: 'center', border: '2.5px solid #222', padding: '6px 18px', minWidth: 108, alignSelf: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>O</div>
                    <div style={{ borderTop: '1px solid #222', marginTop: 3, paddingTop: 3, fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>TRABAJO</div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>INTERNO</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: AD.blue, letterSpacing: -0.5 }}>ORDEN</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#222', marginTop: 2 }}>{job.job_number}</div>
                    <div style={{ fontSize: 8.5, color: '#555', marginTop: 5, lineHeight: 1.8 }}>
                        <div><strong>Fecha Ingreso:</strong> {fmtDate(job.received_at)}</div>
                        <div><strong>Entrega Est.:</strong> {fmtDate(job.due_date)}</div>
                    </div>
                </div>
            </div>

            {/* Emisor */}
            <div style={{ padding: '5mm 15mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <div style={{ fontSize: 8.5, lineHeight: 1.8 }}>
                    <div style={{ fontWeight: 800, fontSize: 10.5, color: '#111', marginBottom: 2 }}>ArtDent Laboratorio Odontológico</div>
                    <div style={{ color: '#666' }}><strong>Documento No Válido Como Factura</strong></div>
                </div>
            </div>

            {/* Cliente */}
            <div style={{ padding: '4mm 15mm', borderBottom: `1px solid ${AD.light}`, background: '#fafcfe', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9 }}>
                        <div><span style={{ fontWeight: 700 }}>Odontólogo: </span>{clientName || '—'}</div>
                        <div><span style={{ fontWeight: 700 }}>CUIT: </span>{dentist.cuit || '—'}</div>
                        <div><span style={{ fontWeight: 700 }}>Domicilio: </span>{dentist.address || '—'}</div>
                    </div>
                    <div style={{ fontSize: 8.5, lineHeight: 1.9 }}>
                        <div><span style={{ fontWeight: 700 }}>Paciente: </span>{patientName}</div>
                        <div><span style={{ fontWeight: 700 }}>Tono/Color: </span>{job.shade || '—'}</div>
                        <div><span style={{ fontWeight: 700 }}>Tipo Trabajo: </span>{job.jobType?.name || job.job_type?.name || '—'}</div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div style={{ padding: '5mm 15mm 0', flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                    <thead>
                        <tr style={{ background: AD.blue, color: '#fff' }}>
                            {[{ l: 'Descripción', a: 'left', w: '50%' }, { l: 'Cantidad', a: 'center', w: '12%' }, { l: 'P. Unit.', a: 'right', w: '18%' }, { l: 'Importe', a: 'right', w: '20%' }].map((h, i) => (
                                <th key={h.l} style={{ padding: '5px 8px', textAlign: h.a, fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.3, width: h.w, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>{h.l}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((it, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f9fc', borderBottom: `1px solid ${AD.light}` }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 9 }}>{it.description}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9 }}>{Number(it.quantity)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>{fmt(it.unit_price)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: AD.blue }}>{fmt(it.total || it.unit_price * it.quantity)}</td>
                            </tr>
                        )) : (
                            <tr style={{ background: '#fff', borderBottom: `1px solid ${AD.light}` }}>
                                <td style={{ padding: '6px 8px', fontSize: 9 }}>{job.description || 'Trabajo de Laboratorio'}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9 }}>1</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>{fmt(total)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: AD.blue }}>{fmt(total)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ flex: 1, minHeight: '8mm' }} />

            {/* Footer */}
            <div style={{ flexShrink: 0 }}>
                <div style={{ padding: '0 15mm 5mm', borderTop: `1px solid ${AD.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5mm' }}>
                        <div style={{ width: '72mm' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', border: `1px solid ${AD.light}` }}>
                                <thead><tr style={{ background: '#f0f4f8' }}>
                                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase' }}>Descripción</th>
                                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase' }}>Importe</th>
                                </tr></thead>
                                <tbody>
                                    <tr style={{ borderTop: `1px solid ${AD.light}` }}>
                                        <td style={{ padding: '4px 8px', fontSize: 8.5 }}>Subtotal:</td>
                                        <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 8.5 }}>{fmt(subtotal)}</td>
                                    </tr>
                                    {discount > 0 && (
                                        <tr style={{ borderTop: `1px solid ${AD.light}` }}>
                                            <td style={{ padding: '4px 8px', fontSize: 8.5 }}>Descuento:</td>
                                            <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: 8.5, color: '#c00' }}>-{fmt(discount)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 8px', background: AD.blue, color: '#fff', borderRadius: '0 0 4px 4px' }}>
                                <span style={{ fontWeight: 900, fontSize: '10pt' }}>TOTAL: $</span>
                                <span style={{ fontWeight: 900, fontSize: '13pt' }}>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '4mm 15mm', borderTop: `1px solid ${AD.light}`, background: '#fafcfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src="/assets/logo-artdent-icon.png" alt="ArtDent" style={{ height: 24, objectFit: 'contain' }} />
                        <span style={{ fontSize: 7.5, color: AD.teal, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tu sonrisa, es nuestra prioridad.</span>
                    </div>
                    <div style={{ fontSize: 7, color: '#bbb' }}>Generado por ArtDent CRM — {fmtDate(new Date())}</div>
                </div>
                <div style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: 5 }} />
            </div>
        </div>
    );
}

// ─── Modos ────────────────────────────────────────────────────────────────────
const MODES = [
    { id: '80mm', label: 'Ticket 80mm', desc: 'Impresora térmica estándar', icon: '🖨️' },
    { id: '54mm', label: 'Ticket 54mm', desc: 'Impresora térmica compacta', icon: '🧾' },
    { id: 'a4', label: 'PDF A4', desc: 'Comprobante institucional', icon: '📄' },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Ticket({ item }) {
    const { isDark } = useTheme();
    const [mode, setMode] = useState('80mm');
    const job = item;

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b' };

    const handlePrint = async () => {
        // Si es A4 (Orden de Trabajo), usamos el flujo del navegador
        if (mode === 'a4') {
            const el = document.getElementById('print-zone');
            if (!el) return;
            const win = window.open('', '_blank');
            win.document.write(`<html><head><title>ArtDent — ${job.job_number}</title></head><body>${el.innerHTML}</body></html>`);
            win.document.close();
            setTimeout(() => { win.print(); win.close(); }, 500);
            return;
        }

        // Capturamos el Ticket (80mm / 54mm)
        const printElement = document.getElementById('print-zone');
        if (!printElement) return;

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(style => style.outerHTML)
            .join('');

        const scale = mode === '54mm' ? '0.90' : '1';

        const fullHTML = `
        <html>
            <head>
                <base href="${window.location.origin}">
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
                ${styles}
                <style>
                    @page { margin: 0; size: auto; }
                    body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
                    #print-zone { 
                        width: ${printElement.style.width} !important; 
                        max-width: ${printElement.style.width} !important; 
                        box-shadow: none !important; margin: 0 !important; 
                        box-sizing: border-box; 
                        transform: scale(${scale}); 
                        transform-origin: top left;
                    }
                </style>
            </head>
            <body>${printElement.outerHTML}</body>
        </html>
    `;

        try {
            const response = await fetch('http://localhost:1234/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: fullHTML,
                    mode: mode === '54mm' ? '57mm' : mode // Mapeamos 54mm a 57mm para el servidor
                })
            });

            if (!response.ok) {
                const result = await response.json();
                alert("Error de hardware: " + result.error);
            }
        } catch (err) {
            alert("⚠️ No se detectó el servidor ArtDent Print. Verifique que el icono aparezca junto al reloj de Windows.");
        }
    };

    return (
        <AuthenticatedLayout user={{}}>
            <Head title={`Imprimir — ${job.job_number}`} />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet" />

            <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex flex-col gap-4 pb-20 sm:pb-6 max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link href={route('jobs.show', job.id)}>
                            <button style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={15} />
                            </button>
                        </Link>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: 18, color: D.text, margin: 0, letterSpacing: -0.5 }}>Imprimir Orden</h1>
                            <p style={{ fontSize: 12, color: D.sub, margin: 0, marginTop: 2 }}>{job.job_number}</p>
                        </div>
                    </div>
                    <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px rgba(57,123,156,0.3)` }}>
                        {mode === 'a4' ? <><Download size={15} />Exportar PDF</> : <><Printer size={15} />Imprimir</>}
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-4">

                    {/* ── Sidebar ── */}
                    <div style={{ width: '100%', maxWidth: 220 }} className="xl:flex-shrink-0">

                        {/* Selector de modo */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                            {MODES.map(m => (
                                <button key={m.id} onClick={() => setMode(m.id)} style={{
                                    textAlign: 'left', padding: '10px 12px', borderRadius: 12,
                                    border: `1.5px solid ${mode === m.id ? AD.teal : D.border}`,
                                    background: mode === m.id ? `rgba(73,148,156,0.1)` : D.card,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: mode === m.id ? AD.teal : D.text }}>{m.label}</div>
                                            <div style={{ fontSize: 10, color: D.sub, marginTop: 1 }}>{m.desc}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Resumen */}
                        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: '14px' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: D.sub, marginBottom: 10 }}>Resumen</p>
                            {[
                                ['Nº', job.job_number],
                                ['Total', `$${fmt(job.total)}`],
                                ['Odontólogo', job.dentist?.name],
                                ['Ítems', `${(job.job_items?.length || 0)} trabajo(s)`],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px solid ${D.border}` }}>
                                    <span style={{ fontSize: 11, color: D.sub }}>{label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: D.text, textAlign: 'right', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Preview panel ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
                            {/* Browser chrome bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${D.border}`, background: isDark ? '#0f1623' : '#f8fafc' }}>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 6 }}>
                                    <Eye size={12} color={D.sub} />
                                    <span style={{ fontSize: 11, color: D.sub }}>Vista previa — {MODES.find(m => m.id === mode)?.label}</span>
                                </div>
                            </div>
                            <div style={{ overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', minHeight: 480, maxHeight: '72vh', background: isDark ? '#09111c' : '#dde2e8' }}>
                                <div style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'inline-block', transform: mode === 'a4' ? 'scale(0.70)' : 'scale(1)', transformOrigin: 'top center' }}>
                                    {mode === 'a4' && <OrdenA4 job={job} />}
                                    {mode === '80mm' && <TicketBase job={job} widthMM={80} />}
                                    {mode === '54mm' && <TicketBase job={job} widthMM={54} />}
                                </div>
                            </div>
                        </div>
                        {mode === 'a4' && (
                            <p style={{ fontSize: 11, color: D.sub, textAlign: 'center', marginTop: 8 }}>Vista al 70% · El PDF se genera a tamaño real (A4)</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}