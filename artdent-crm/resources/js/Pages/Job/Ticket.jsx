import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ArrowLeft, Printer, Download, Eye } from 'lucide-react';
import {
    buildPrintHtml,
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    MONTSERRAT_PRINT_HEAD,
    openBrowserPrint,
    printElementWithElectron,
    setStoredTicketFormat,
} from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';
import { isNativePrintAvailable, printRawBytes } from '@/lib/nativePrinter';
import { buildJobOrderTicket } from '@/lib/escpos/buildJobOrderTicket';

// ─── Brand ───────────────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
const fmtToday = () => new Date().toLocaleDateString('es-AR');
// El número ya viene precedido por la palabra "Orden" en el encabezado, así que
// el prefijo "ORD-" es redundante ahí (se ve como una palabra repetida/cortada).
const stripOrdPrefix = (value) => String(value ?? '').replace(/^ORD-/i, '');

// ─── Ticket térmico (80mm / 57mm) ────────────────────────────────────────────
function TicketBase({ job, widthMM = 80 }) {
    const is57 = widthMM === 57;
    const items = job.job_items || [];
    const total = Number(job.total || 0);
    const company = job.company || {};
    const companyDisplayName = getCompanyDisplayName(company);
    const dentist = job.dentist || {};
    const patient = job.patient || {};
    const ticketNum = job.job_number || (job.id ? `OT-${job.id}` : '—');
    const patientName = [patient?.name, patient?.last_name].filter(Boolean).join(' ') || patient?.name || '—';
    const dentistName = dentist?.name || dentist?.contact_name || dentist?.email || '—';
    const serviceLabel = job.jobType?.name || job.job_type?.name || 'Trabajo de laboratorio';
    const notes = job.description || job.notes || job.observations || '';

    const F = {
        logo: is57 ? 54 : 62,
        caption: is57 ? 7.2 : 8.1,
        label: is57 ? 7.6 : 8.4,
        body: is57 ? 8.2 : 9.2,
        total: is57 ? 11.2 : 13.8,
        number: is57 ? 13 : 16,
        small: is57 ? 6.8 : 7.6,
    };

    const ticketWidth = getThermalZoneWidth(is57 ? '57mm' : '80mm');

    const InfoRow = ({ label, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt`, lineHeight: 1.3, marginBottom: 3 }}>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', flex: 1 }}>{value || '—'}</span>
        </div>
    );

    return (
        <div id="print-zone" style={{ width: ticketWidth, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${F.body}pt`, color: '#000', padding: is57 ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm', background: '#fff', lineHeight: 1.35, boxSizing: 'border-box' }}>
            <div style={{ borderTop: '3px solid #000', marginBottom: is57 ? 5 : 7 }} />

            <div style={{ textAlign: 'center', marginBottom: is57 ? 6 : 8 }}>
                <CompanyLogo
                    company={company}
                    scope="lab"
                    thermal
                    height={F.logo}
                    maxWidth={is57 ? 140 : 180}
                    style={{ margin: '0 auto' }}
                />
                <div style={{ fontSize: `${F.small}pt`, marginTop: 4 }}>Documento interno. No válido como factura.</div>
            </div>

            <div style={{ border: '2px solid #000', padding: is57 ? '5px 6px' : '6px 8px', marginBottom: is57 ? 6 : 8, textAlign: 'center' }}>
                <div style={{ fontSize: `${F.body}pt`, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' }}>Orden N° {stripOrdPrefix(ticketNum)}</div>
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0 3px', marginBottom: is57 ? 6 : 8 }}>
                <InfoRow label="Fecha" value={fmtDate(job.received_at)} />
                <InfoRow label="Paciente" value={patientName} />
                <InfoRow label="Profesional" value={dentistName} />
                {job.shade && <InfoRow label="Tono" value={job.shade} />}
            </div>

            {notes && (
                <div style={{ border: '1px solid #000', padding: is57 ? '4px 5px' : '5px 6px', marginBottom: is57 ? 6 : 8 }}>
                    <div style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Indicaciones</div>
                    <div style={{ fontSize: `${F.label}pt`, lineHeight: 1.35 }}>{notes}</div>
                </div>
            )}

            <div style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: 4 }}>
                Detalle del trabajo
            </div>

            <div style={{ marginBottom: is57 ? 6 : 8 }}>
                {items.length > 0 ? items.map((it, index) => (
                    <div key={index} style={{ borderBottom: '1px dotted #000', padding: '4px 0' }}>
                        <div style={{ fontSize: `${F.body}pt`, fontWeight: 700, marginBottom: 2 }}>{it.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt` }}>
                            <span>{Number(it.quantity || 1)} x ${fmt(it.unit_price)}</span>
                            <span style={{ fontWeight: 800 }}>${fmt(it.total || Number(it.unit_price || 0) * Number(it.quantity || 1))}</span>
                        </div>
                    </div>
                )) : (
                    <div style={{ borderBottom: '1px dotted #000', padding: '4px 0' }}>
                        <div style={{ fontSize: `${F.body}pt`, fontWeight: 700, marginBottom: 2 }}>{serviceLabel}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt` }}>
                            <span>1 x ${fmt(total)}</span>
                            <span style={{ fontWeight: 800 }}>${fmt(total)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ border: '2px solid #000', padding: is57 ? '5px 6px' : '6px 8px', marginBottom: is57 ? 6 : 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Total orden</span>
                    <span style={{ fontSize: `${F.total}pt`, fontWeight: 900 }}>${fmt(total)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: `${F.small}pt`, borderTop: '1px solid #000', paddingTop: 5 }}>
                <div style={{ marginTop: 2 }}>Tu sonrisa, es nuestra prioridad.</div>
            </div>

            <div style={{ borderTop: '3px solid #000', marginTop: is57 ? 5 : 7 }} />
        </div>
    );
}

// ─── Orden A4 ─────────────────────────────────────────────────────────────────
function OrdenA4({ job }) {
    const items = job.job_items || [];
    const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
    const discount = Number(job.discount_amount || 0);
    const total = Number(job.total || 0);
    const company = job.company || {};
    const companyDisplayName = getCompanyDisplayName(company);
    const dentist = job.dentist || {};
    const patientName = job.patient?.name ? `${job.patient.name} ${job.patient.last_name || ''}`.trim() : '—';
    const clientName = dentist.type === 'clinic' ? (dentist.name || dentist.contact_name) : `${dentist.last_name || ''} ${dentist.name || ''}`.trim().toUpperCase();

    return (
        <div id="print-zone" style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Montserrat', sans-serif", fontSize: '10pt', color: '#1A202C', background: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${AD.blue} 0%, ${AD.teal} 55%, ${AD.green} 100%)`, height: 8, flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8mm 15mm 6mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <CompanyLogo company={company} scope="lab" height="22mm" maxWidth="78mm" />
                <div style={{ textAlign: 'center', border: '2.5px solid #222', padding: '6px 18px', minWidth: 108, alignSelf: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>O</div>
                    <div style={{ borderTop: '1px solid #222', marginTop: 3, paddingTop: 3, fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>TRABAJO</div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>INTERNO</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: AD.blue, letterSpacing: -0.5 }}>ORDEN</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#222', marginTop: 2 }}>{job.job_number}</div>
                    <div style={{ fontSize: 8.5, color: '#555', marginTop: 5, lineHeight: 1.8 }}>
                        <div><strong>Fecha:</strong> {fmtDate(job.received_at)}</div>
                    </div>
                </div>
            </div>

            {/* Emisor */}
            <div style={{ padding: '5mm 15mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <div style={{ fontSize: 8.5, lineHeight: 1.8 }}>
                    <div style={{ fontWeight: 800, fontSize: 10.5, color: '#111', marginBottom: 2 }}>{company.name || companyDisplayName}</div>
                    {company.address && <div style={{ color: '#666' }}>{company.address}</div>}
                    {(company.city || company.province) && (
                        <div style={{ color: '#666' }}>{[company.city, company.province].filter(Boolean).join(' - ')}</div>
                    )}
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
                        <CompanyLogo company={company} scope="lab" height="10mm" maxWidth="20mm" />
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
    { id: '57mm', label: 'Ticket 57mm', desc: 'Impresora térmica compacta', icon: '🧾' },
    { id: 'a4', label: 'PDF A4', desc: 'Comprobante institucional', icon: '📄' },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Ticket({ item }) {
    const { isDark } = useTheme();
    const toast = useToast();
    const [mode, setMode] = useState(() => {
        const saved = getStoredTicketFormat('80mm');
        return ['57mm', '80mm'].includes(saved) ? saved : '80mm';
    });
    const job = item;
    const [printingNative, setPrintingNative] = useState(false);

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b' };

    const handlePrint = async () => {
        // Si es A4 (Orden de Trabajo), usamos el flujo del navegador
        if (mode === 'a4') {
            const el = document.getElementById('print-zone');
            if (!el) return;
            const html = buildPrintHtml({
                title: `ArtDent — ${job.job_number}`,
                bodyHtml: el.outerHTML,
                pageSize: 'A4',
                zoneWidth: '210mm',
                extraHead: MONTSERRAT_PRINT_HEAD,
            });
            openBrowserPrint(html, { delay: 500 });
            return;
        }

        if (isNativePrintAvailable()) {
            setPrintingNative(true);

            try {
                const ticket = await buildJobOrderTicket(job, { widthMM: mode === '57mm' ? 57 : 80 });
                const result = await printRawBytes(ticket);

                if (!result.ok) {
                    toast.warning(result.error || 'No se pudo imprimir en la impresora configurada.');
                }
            } finally {
                setPrintingNative(false);
            }

            return;
        }

        const printElement = document.getElementById('print-zone');
        if (!printElement) return;

        const result = await printElementWithElectron({
            element: printElement,
            title: `ArtDent — ${job.job_number}`,
            mode,
            zoneWidth: printElement.style.width || getThermalZoneWidth(mode),
            zoom: getThermalPrintZoom(mode),
            extraHead: MONTSERRAT_PRINT_HEAD,
            fallbackToBrowser: true,
            browserDelay: 500,
        });

        if (!result.ok && !result.fallbackUsed) {
            toast.warning('No se detectó el servidor ArtDent Print. Verifique que el icono aparezca junto al reloj de Windows.');
        }
    };

    const handleModeChange = (nextMode) => {
        setMode(nextMode);
        if (nextMode === '80mm') setStoredTicketFormat('80mm');
        if (nextMode === '57mm') setStoredTicketFormat('57mm');
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

                <div className="flex flex-col lg:flex-row gap-4">

                    {/* ── Sidebar ── */}
                    <div style={{ width: '100%', maxWidth: 220 }} className="xl:flex-shrink-0">

                        {/* Selector de modo */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                            {MODES.map(m => (
                                <button key={m.id} onClick={() => handleModeChange(m.id)} style={{
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
                                    {mode === '57mm' && <TicketBase job={job} widthMM={57} />}
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
