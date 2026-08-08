import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ArrowLeft, Printer, Eye } from 'lucide-react';
import {
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    printElementWithElectron,
    setStoredTicketFormat,
} from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';
import { isNativePrintAvailable, printRawBytes } from '@/lib/nativePrinter';
import { buildCollaboratorReceiptTicket } from '@/lib/escpos/buildReceiptTicket';

const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
    if (!d) { return '—'; }
    const parts = String(d).split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function ReciboTicket({ receipt, extras, discounts, company, mode = '80mm' }) {
    const collab = receipt.collaborator || {};
    const companyDisplayName = getCompanyDisplayName(company);
    const is57mm = mode === '57mm';
    const ticketWidth = getThermalZoneWidth(mode);
    const baseFontSize = is57mm ? '8.2pt' : '9.2pt';
    const logoHeight = is57mm ? 26 : 32;

    return (
        <div id="print-zone" style={{ width: ticketWidth, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: baseFontSize, color: '#000', background: '#fff', lineHeight: 1.4, boxSizing: 'border-box', padding: is57mm ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm' }}>
            <div style={{ borderTop: '3px solid #000', marginBottom: 7 }} />

            <div style={{ textAlign: 'center', marginBottom: 7 }}>
                <CompanyLogo
                    company={company}
                    scope="lab"
                    thermal
                    height={logoHeight}
                    maxWidth={is57mm ? 112 : 156}
                    style={{ margin: '0 auto' }}
                />
                <div style={{ marginTop: 6, fontSize: is57mm ? 7 : 8, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Recibo de haberes</div>
                <div style={{ fontSize: is57mm ? 6.5 : 7.2, letterSpacing: 0.6 }}>Documento interno. No válido como factura.</div>
            </div>

            {company?.name && (
                <div style={{ textAlign: 'center', fontSize: 8, fontWeight: 800, color: '#000', marginBottom: 2 }}>{companyDisplayName}</div>
            )}
            {company?.cuit && (
                <div style={{ textAlign: 'center', fontSize: 7.2, color: '#000', marginBottom: 2 }}>CUIT: {company.cuit}</div>
            )}
            {company?.address && (
                <div style={{ textAlign: 'center', fontSize: 7.2, color: '#000', marginBottom: 6 }}>{company.address}{company.city ? `, ${company.city}` : ''}</div>
            )}

            <div style={{ border: '2px solid #000', padding: is57mm ? '5px 6px' : '6px 8px', marginBottom: 8 }}>
                <div style={{ fontSize: is57mm ? 7 : 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Colaborador</div>
                <div style={{ fontSize: is57mm ? 10.5 : 12, fontWeight: 900 }}>{collab.name || '—'}</div>
                {collab.document && <div style={{ fontSize: 7.2, marginTop: 2 }}>Documento: {collab.document}</div>}
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0 3px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginBottom: 3, gap: 10 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Período</span>
                    <span>{fmtDate(receipt.period_from)} al {fmtDate(receipt.period_to)}</span>
                </div>
                {receipt.days_worked != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginBottom: 3, gap: 10 }}>
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Días</span>
                        <span>{receipt.days_worked}</span>
                    </div>
                )}
                {receipt.hours != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, gap: 10 }}>
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Horas</span>
                        <span>{receipt.hours}h</span>
                    </div>
                )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.2, marginBottom: 6 }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                        <th style={{ padding: '3px 2px', textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Concepto</th>
                        <th style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 2px', fontSize: 8 }}>Horas trabajadas ({receipt.hours}h)</td>
                        <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>${fmt(receipt.gross)}</td>
                    </tr>
                    {receipt.extras_total > 0 && (
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 2px', fontSize: 8 }}>Extras / adicionales</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>+${fmt(receipt.extras_total)}</td>
                        </tr>
                    )}
                    {receipt.discounts_total > 0 && (
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 2px', fontSize: 8 }}>Descuentos</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>-${fmt(receipt.discounts_total)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ border: '2px solid #000', padding: is57mm ? '5px 6px' : '6px 8px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: is57mm ? '8.3pt' : '9.4pt', textTransform: 'uppercase', letterSpacing: 0.6 }}>Neto a cobrar</span>
                    <span style={{ fontWeight: 900, fontSize: is57mm ? '11pt' : '14pt' }}>${fmt(receipt.net)}</span>
                </div>
            </div>

            {extras.length > 0 && (
                <>
                    <div style={{ fontSize: 7.2, fontWeight: 800, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Detalle extras</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7.5, marginBottom: 6 }}>
                        <tbody>
                            {extras.map((e, i) => (
                                <tr key={i} style={{ borderBottom: '1px dotted #000' }}>
                                    <td style={{ padding: '1px 2px' }}>{fmtDate(e.date)} {e.concept}</td>
                                    <td style={{ padding: '1px 2px', textAlign: 'right', fontWeight: 700 }}>+${fmt(e.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {discounts.length > 0 && (
                <>
                    <div style={{ fontSize: 7.2, fontWeight: 800, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Detalle descuentos</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7.5, marginBottom: 6 }}>
                        <tbody>
                            {discounts.map((d, i) => (
                                <tr key={i} style={{ borderBottom: '1px dotted #000' }}>
                                    <td style={{ padding: '1px 2px' }}>{fmtDate(d.date)} {d.concept}</td>
                                    <td style={{ padding: '1px 2px', textAlign: 'right', fontWeight: 700 }}>-${fmt(d.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <div style={{ marginTop: 10, borderTop: '1px solid #000', paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.2, gap: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Empleador</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Colaborador</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 8, borderTop: '1px solid #000', paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CompanyLogo company={company} scope="lab" height={18} maxWidth={48} />
                    <span style={{ fontSize: 6.4, color: '#000', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{companyDisplayName}</span>
                </div>
                <div style={{ fontSize: 6, color: '#000' }}>ArtCode CRM</div>
            </div>

            <div style={{ borderTop: '3px solid #000', marginTop: 6 }} />
        </div>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Show({ auth, receipt, extras, discounts, company }) {
    const { isDark } = useTheme();
    const toast = useToast();
    const [mode, setMode] = useState(() => {
        const saved = getStoredTicketFormat('80mm');
        return ['57mm', '80mm'].includes(saved) ? saved : '80mm';
    });

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b' };

    const handlePrint = async () => {
        if (isNativePrintAvailable()) {
            const widthMM = mode === '57mm' ? 57 : 80;
            const bytes = await buildCollaboratorReceiptTicket({ receipt, extras, discounts, company }, { widthMM });
            const result = await printRawBytes(bytes);

            if (!result.ok) {
                toast.error('Error de impresión: ' + result.error);
            }

            return;
        }

        const printElement = document.getElementById('print-zone');
        if (!printElement) { return; }

        const result = await printElementWithElectron({
            element: printElement,
            mode,
            zoneWidth: printElement.style.width || getThermalZoneWidth(mode),
            zoom: getThermalPrintZoom(mode),
            fallbackToBrowser: true,
            browserDelay: 400,
        });

        if (!result.ok && !result.fallbackUsed) {
            toast.error('Error de hardware: ' + result.error);
        }
    };

    const handleModeChange = (nextMode) => {
        setMode(nextMode);
        setStoredTicketFormat(nextMode);
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
                                    onClick={() => handleModeChange(ticketMode)}
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

                <div className="flex flex-col lg:flex-row gap-4">
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
