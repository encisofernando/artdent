import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { ArrowLeft, Printer, Eye, CheckCircle, XCircle, FileDown } from 'lucide-react';
import {
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    printElementWithElectron,
    setStoredTicketFormat,
} from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';
import { isNativePrintAvailable, printRawBytes } from '@/lib/nativePrinter';
import { buildEmployeeReceiptTicket } from '@/lib/escpos/buildReceiptTicket';

const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
    if (!d) { return '—'; }
    const parts = String(d).split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const STATUS_LABELS = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };
const STATUS_COLORS = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paid: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const LINE_SIGN = { remunerative: '+', non_remunerative: '+', deduction: '-', contribution: '-', employer_contribution: '' };

// ─── Ticket Térmico ──────────────────────────────────────────────────────────
function ReciboTicket({ receipt, extras, discounts, company, mode = '80mm' }) {
    const conceptLines = (receipt.lines ?? []).filter(l => l.type !== 'employer_contribution');
    const employee = receipt.employee || {};
    const user = employee.user || {};
    const companyDisplayName = getCompanyDisplayName(company);
    const is57mm = mode === '57mm';
    const ticketWidth = getThermalZoneWidth(mode);
    const baseFontSize = is57mm ? '8.2pt' : '9.2pt';
    const logoHeight = is57mm ? 26 : 32;

    const commissionPct = parseFloat(employee.commission_pct ?? 0);
    const commissionGross = parseFloat(receipt.commission_gross ?? 0);
    const salesTotal = parseFloat(receipt.sales_total ?? 0);

    return (
        <div id="print-zone" style={{ width: ticketWidth, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: baseFontSize, color: '#000', background: '#fff', lineHeight: 1.4, boxSizing: 'border-box', padding: is57mm ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm' }}>
            <div style={{ borderTop: '3px solid #000', marginBottom: 7 }} />

            <div style={{ textAlign: 'center', marginBottom: 7 }}>
                <CompanyLogo
                    company={company}
                    scope="store"
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
                <div style={{ fontSize: is57mm ? 7 : 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Empleado</div>
                <div style={{ fontSize: is57mm ? 10.5 : 12, fontWeight: 900 }}>{user.name || '—'}</div>
                {employee.position && <div style={{ fontSize: 7.5, marginTop: 1 }}>{employee.position}</div>}
                {employee.dni && <div style={{ fontSize: 7.2, marginTop: 2 }}>DNI: {employee.dni}</div>}
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0 3px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginBottom: 3, gap: 10 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Período</span>
                    <span>{fmtDate(receipt.period_from)} al {fmtDate(receipt.period_to)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, gap: 10 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Recibo N°</span>
                    <span>#{String(receipt.id).padStart(4, '0')}</span>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.2, marginBottom: 6 }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                        <th style={{ padding: '3px 2px', textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Concepto</th>
                        <th style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Importe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '3px 2px', fontSize: 8 }}>Sueldo base mensual</td>
                        <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>${fmt(receipt.salary_gross)}</td>
                    </tr>
                    {commissionGross > 0 && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '3px 2px', fontSize: 8 }}>
                                Comisión {commissionPct > 0 ? `${commissionPct}%` : ''}
                                {salesTotal > 0 ? ` (ventas: $${fmt(salesTotal)})` : ''}
                            </td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>+${fmt(commissionGross)}</td>
                        </tr>
                    )}
                    {conceptLines.map((line) => (
                        <tr key={line.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '3px 2px', fontSize: 8 }}>{line.label}</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>{LINE_SIGN[line.type]}${fmt(Math.abs(line.amount))}</td>
                        </tr>
                    ))}
                    {parseFloat(receipt.extras_total) > 0 && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '3px 2px', fontSize: 8 }}>Extras / adicionales</td>
                            <td style={{ padding: '3px 2px', textAlign: 'right', fontWeight: 700 }}>+${fmt(receipt.extras_total)}</td>
                        </tr>
                    )}
                    {parseFloat(receipt.discounts_total) > 0 && (
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
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

            {receipt.notes && (
                <div style={{ fontSize: 7.5, marginBottom: 6, padding: '4px 6px', border: '1px dashed #aaa' }}>
                    <span style={{ fontWeight: 800 }}>Notas: </span>{receipt.notes}
                </div>
            )}

            <div style={{ marginTop: 10, borderTop: '1px solid #000', paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.2, gap: 12 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Empleador</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', marginTop: 20, paddingTop: 2 }}>Firma Empleado</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 8, borderTop: '1px solid #000', paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CompanyLogo company={company} scope="store" height={18} maxWidth={48} />
                    <span style={{ fontSize: 6.4, color: '#000', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{companyDisplayName}</span>
                </div>
                <div style={{ fontSize: 6, color: '#000' }}>ArtCode CRM</div>
            </div>

            <div style={{ borderTop: '3px solid #000', marginTop: 6 }} />
        </div>
    );
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function Show({ auth, receipt, extras, discounts, company }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
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
            const bytes = await buildEmployeeReceiptTicket({ receipt, extras, discounts, company }, { widthMM });
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

    const markPaid = () => {
        confirmDialog('¿Marcar este recibo como pagado?', () =>
            router.put(route('employee-receipts.update', receipt.id), { status: 'paid' }, { preserveScroll: true })
        );
    };

    const markCancelled = () => {
        confirmDialog('¿Cancelar este recibo?', () =>
            router.put(route('employee-receipts.update', receipt.id), { status: 'cancelled' }, { preserveScroll: true })
        );
    };

    const employee = receipt.employee || {};
    const user = employee.user || {};

    return (
        <AuthenticatedLayout user={auth?.user || {}}>
            <Head title={`Recibo — ${user.name ?? 'Personal'}`} />

            <div style={{ fontFamily: 'sans-serif' }} className="flex flex-col gap-4 pb-20 sm:pb-6 max-w-4xl mx-auto">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link href={route('employee-receipts.index')}>
                            <button style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={15} />
                            </button>
                        </Link>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: 18, color: D.text, margin: 0, letterSpacing: -0.5 }}>Recibo de Haberes</h1>
                            <p style={{ fontSize: 12, color: D.sub, margin: 0, marginTop: 2 }}>{user.name ?? '—'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {receipt.status === 'draft' && (
                            <>
                                <button onClick={markCancelled} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Cancelar
                                </button>
                                <button onClick={markPaid} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <CheckCircle size={14} /> Pagado
                                </button>
                            </>
                        )}
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
                        <a href={route('employee-receipts.pdf', receipt.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.text, fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: 'inherit' }}>
                            <FileDown size={15} />
                            PDF
                        </a>
                        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px rgba(57,123,156,0.3)` }}>
                            <Printer size={15} />
                            Imprimir
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Sidebar resumen */}
                    <div style={{ width: '100%', maxWidth: 220 }} className="xl:flex-shrink-0">
                        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: 14 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: D.sub, marginBottom: 10 }}>Resumen</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px solid ${D.border}` }}>
                                <span style={{ fontSize: 11, color: D.sub }}>Formato ticket</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: D.text }}>{mode}</span>
                            </div>
                            {[
                                ['Estado', STATUS_LABELS[receipt.status] ?? receipt.status],
                                ['Empleado', user.name],
                                ['Período', `${fmtDate(receipt.period_from)} al ${fmtDate(receipt.period_to)}`],
                                ['Sueldo base', `$${fmt(receipt.salary_gross)}`],
                                ...(parseFloat(receipt.commission_gross) > 0 ? [['Comisión', `$${fmt(receipt.commission_gross)}`]] : []),
                                ...(parseFloat(receipt.concepts_total) !== 0 ? [['Conceptos', `${receipt.concepts_total >= 0 ? '+' : '-'}$${fmt(Math.abs(receipt.concepts_total))}`]] : []),
                                ...(parseFloat(receipt.extras_total) > 0 ? [['Extras', `+$${fmt(receipt.extras_total)}`]] : []),
                                ...(parseFloat(receipt.discounts_total) > 0 ? [['Descuentos', `-$${fmt(receipt.discounts_total)}`]] : []),
                                ['NETO', `$${fmt(receipt.net)}`],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: `1px solid ${D.border}` }}>
                                    <span style={{ fontSize: 11, color: D.sub }}>{label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: label === 'NETO' ? AD.blue : D.text, textAlign: 'right', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vista previa */}
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
                                <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 6, background: STATUS_COLORS[receipt.status]?.split(' ')[0] ?? 'bg-slate-500/10', color: receipt.status === 'paid' ? '#22c55e' : receipt.status === 'cancelled' ? '#f87171' : '#f59e0b', fontWeight: 700 }}>
                                    {STATUS_LABELS[receipt.status] ?? receipt.status}
                                </span>
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
