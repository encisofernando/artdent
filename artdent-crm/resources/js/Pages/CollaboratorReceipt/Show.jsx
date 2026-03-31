import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Printer, Eye } from 'lucide-react';

const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
    if (!d) { return '—'; }
    const parts = String(d).split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function ReciboTicket({ receipt, extras, discounts, company, mode = '80mm' }) {
    const collab = receipt.collaborator || {};
    const is57mm = mode === '57mm';
    const ticketWidth = is57mm ? '54mm' : '74mm';
    const baseFontSize = is57mm ? '8pt' : '9pt';
    const logoHeight = is57mm ? 26 : 32;

    return (
        <div id="print-zone" style={{ width: ticketWidth, fontFamily: "'Courier New', Courier, monospace", fontSize: baseFontSize, color: '#000', background: '#fff', lineHeight: 1.5, boxSizing: 'border-box' }}>
            {/* Top stripe */}
            <div style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: 4, marginBottom: 7 }} />

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <img src="/assets/logo-artdent-negro.png" alt="ArtDent" style={{ height: logoHeight, objectFit: 'contain', display: 'inline-block' }} />
            </div>

            {company?.name && (
                <div style={{ textAlign: 'center', fontSize: 8, fontWeight: 700, color: '#000', marginBottom: 2 }}>{company.name}</div>
            )}
            {company?.cuit && (
                <div style={{ textAlign: 'center', fontSize: 7.5, color: '#444', marginBottom: 2 }}>CUIT: {company.cuit}</div>
            )}
            {company?.address && (
                <div style={{ textAlign: 'center', fontSize: 7.5, color: '#444', marginBottom: 4 }}>{company.address}{company.city ? `, ${company.city}` : ''}</div>
            )}

            <div style={{ textAlign: 'center', fontSize: 7.5, fontWeight: 700, color: '#000', letterSpacing: 0.5, marginBottom: 6 }}>
                RECIBO DE HABERES — NO VÁLIDO COMO FACTURA
            </div>

            <div style={{ borderTop: '2px solid #000', marginBottom: 6 }} />

            {/* Colaborador */}
            <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 8, fontWeight: 700, marginBottom: 2 }}>COLABORADOR:</div>
                <div style={{ fontSize: 10, fontWeight: 900 }}>{collab.name || '—'}</div>
                {collab.document && <div style={{ fontSize: 7.5, color: '#444' }}>Doc: {collab.document}</div>}
            </div>

            <div style={{ borderTop: '1px solid #000', marginBottom: 6 }} />

            {/* Período */}
            <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700 }}>PERÍODO:</span>
                    <span>{fmtDate(receipt.period_from)} al {fmtDate(receipt.period_to)}</span>
                </div>
                {receipt.days_worked != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                        <span style={{ fontWeight: 700 }}>Días trabajados:</span>
                        <span>{receipt.days_worked}</span>
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid #000', marginBottom: 4 }} />

            {/* Resumen */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, marginBottom: 4 }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                        <th style={{ padding: '2px 2px', textAlign: 'left', fontWeight: 900 }}>Concepto</th>
                        <th style={{ padding: '2px 2px', textAlign: 'right', fontWeight: 900 }}>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '2px 2px', fontSize: 8 }}>Horas trabajadas ({receipt.hours}h)</td>
                        <td style={{ padding: '2px 2px', textAlign: 'right', fontWeight: 700 }}>${fmt(receipt.gross)}</td>
                    </tr>
                    {receipt.extras_total > 0 && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '2px 2px', fontSize: 8 }}>Extras / Adicionales</td>
                            <td style={{ padding: '2px 2px', textAlign: 'right', color: '#006600', fontWeight: 700 }}>+${fmt(receipt.extras_total)}</td>
                        </tr>
                    )}
                    {receipt.discounts_total > 0 && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '2px 2px', fontSize: 8 }}>Descuentos</td>
                            <td style={{ padding: '2px 2px', textAlign: 'right', color: '#cc0000', fontWeight: 700 }}>-${fmt(receipt.discounts_total)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* NETO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 6px', background: AD.blue, color: '#fff', borderRadius: 4, marginBottom: 8, gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: is57mm ? '8.5pt' : '9.5pt' }}>NETO A COBRAR: $</span>
                <span style={{ fontWeight: 900, fontSize: is57mm ? '11pt' : '14pt' }}>{fmt(receipt.net)}</span>
            </div>

            {/* Extras detail */}
            {extras.length > 0 && (
                <>
                    <div style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 2 }}>DETALLE EXTRAS:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7.5, marginBottom: 6 }}>
                        {extras.map((e, i) => (
                            <tr key={i} style={{ borderBottom: '1px dotted #aaa' }}>
                                <td style={{ padding: '1px 2px' }}>{fmtDate(e.date)} {e.concept}</td>
                                <td style={{ padding: '1px 2px', textAlign: 'right', color: '#006600', fontWeight: 700 }}>${fmt(e.amount)}</td>
                            </tr>
                        ))}
                    </table>
                </>
            )}

            {/* Discounts detail */}
            {discounts.length > 0 && (
                <>
                    <div style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 2 }}>DETALLE DESCUENTOS:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7.5, marginBottom: 6 }}>
                        {discounts.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px dotted #aaa' }}>
                                <td style={{ padding: '1px 2px' }}>{fmtDate(d.date)} {d.concept}</td>
                                <td style={{ padding: '1px 2px', textAlign: 'right', color: '#cc0000', fontWeight: 700 }}>-${fmt(d.amount)}</td>
                            </tr>
                        ))}
                    </table>
                </>
            )}

            {/* Firma */}
            <div style={{ marginTop: 10, borderTop: '1px solid #000', paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.5, gap: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Empleador</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Colaborador</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 8, borderTop: '1px solid #ccc', paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src="/assets/logo-artdent-icon.png" alt="AD" style={{ height: 18, objectFit: 'contain' }} />
                    <span style={{ fontSize: 6.5, color: AD.teal, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Tu sonrisa, es nuestra prioridad.</span>
                </div>
                <div style={{ fontSize: 6, color: '#bbb' }}>ArtDent CRM</div>
            </div>

            <div style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: 4, marginTop: 6 }} />
        </div>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Show({ auth, receipt, extras, discounts, company }) {
    const { isDark } = useTheme();
    const [mode, setMode] = useState('80mm');

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b' };

    const handlePrint = async () => {
        const printElement = document.getElementById('print-zone');
        if (!printElement) { return; }

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(s => s.outerHTML)
            .join('');

        const fullHTML = `
            <html>
                <head>
                    <base href="${window.location.origin}">
                    ${styles}
                    <style>
                        @page { margin: 0; size: auto; }
                        body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
                        #print-zone { width: ${printElement.style.width || '74mm'} !important; box-shadow: none !important; margin: 0 !important; }
                    </style>
                </head>
                <body>${printElement.outerHTML}</body>
            </html>
        `;

        try {
            const response = await fetch('http://localhost:1234/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: fullHTML, mode }),
            });
            if (!response.ok) {
                const result = await response.json();
                alert('Error de hardware: ' + result.error);
            }
        } catch {
            // Fallback: browser print
            const win = window.open('', '_blank');
            win.document.write(fullHTML);
            win.document.close();
            setTimeout(() => { win.print(); win.close(); }, 400);
        }
    };

    const collab = receipt.collaborator || {};

    return (
        <AuthenticatedLayout user={auth?.user || {}}>
            <Head title={`Recibo — ${collab.name}`} />

            <div style={{ fontFamily: 'sans-serif' }} className="flex flex-col gap-4 pb-20 sm:pb-6 max-w-4xl mx-auto">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link href={route('collaborator-receipts.index')}>
                            <button style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={15} />
                            </button>
                        </Link>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: 18, color: D.text, margin: 0, letterSpacing: -0.5 }}>Recibo de Haberes</h1>
                            <p style={{ fontSize: 12, color: D.sub, margin: 0, marginTop: 2 }}>{collab.name}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 4, borderRadius: 12, border: `1px solid ${D.border}`, background: D.card }}>
                            {['57mm', '80mm'].map((ticketMode) => (
                                <button
                                    key={ticketMode}
                                    type="button"
                                    onClick={() => setMode(ticketMode)}
                                    style={{
                                        padding: '7px 12px',
                                        borderRadius: 9,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: 12,
                                        background: mode === ticketMode ? AD.blue : 'transparent',
                                        color: mode === ticketMode ? '#fff' : D.sub,
                                    }}
                                >
                                    {ticketMode}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px rgba(57,123,156,0.3)` }}>
                            <Printer size={15} />
                            Imprimir
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-4">
                    {/* Sidebar */}
                    <div style={{ width: '100%', maxWidth: 220 }} className="xl:flex-shrink-0">
                        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: 14 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: D.sub, marginBottom: 10 }}>Resumen</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px solid ${D.border}` }}>
                                <span style={{ fontSize: 11, color: D.sub }}>Formato ticket</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: D.text }}>{mode}</span>
                            </div>
                            {[
                                ['Colaborador', collab.name],
                                ['Período', `${fmtDate(receipt.period_from)} al ${fmtDate(receipt.period_to)}`],
                                ['Días', receipt.days_worked ?? '—'],
                                ['Horas', receipt.hours != null ? `${receipt.hours}h` : '—'],
                                ['Bruto', `$${fmt(receipt.gross)}`],
                                ['Extras', receipt.extras_total > 0 ? `+$${fmt(receipt.extras_total)}` : '—'],
                                ['Descuentos', receipt.discounts_total > 0 ? `-$${fmt(receipt.discounts_total)}` : '—'],
                                ['NETO', `$${fmt(receipt.net)}`],
                                ['Estado', receipt.status === 'paid' ? 'Pagado' : receipt.status === 'cancelled' ? 'Cancelado' : 'Borrador'],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px solid ${D.border}` }}>
                                    <span style={{ fontSize: 11, color: D.sub }}>{label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: label === 'NETO' ? AD.blue : D.text, textAlign: 'right', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${D.border}`, background: isDark ? '#0f1623' : '#f8fafc' }}>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
                                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 6 }}>
                                    <Eye size={12} color={D.sub} />
                                    <span style={{ fontSize: 11, color: D.sub }}>{`Vista previa — Ticket ${mode}`}</span>
                                </div>
                            </div>
                            <div style={{ overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', minHeight: 480, maxHeight: '72vh', background: isDark ? '#09111c' : '#dde2e8' }}>
                                <div style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'inline-block' }}>
                                    <ReciboTicket receipt={receipt} extras={extras} discounts={discounts} company={company} mode={mode} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
