import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Printer, Building2, WalletCards, ReceiptText, CalendarDays } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { buildPrintHtml, MONTSERRAT_PRINT_HEAD, openBrowserPrint } from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';

const AD = {
    blue: '#397B9C',
    green: '#5AAD9C',
    teal: '#49949C',
    mint: '#ACD6CE',
    light: '#DAE6F0',
};

const MOVE_TYPE_META = {
    payment: {
        label: 'Pago a Cuenta',
        amountLabel: 'Importe abonado',
        description: 'Este monto ha sido deducido del saldo deudor.',
        tone: 'credit',
    },
    credit: {
        label: 'Pago a Cuenta',
        amountLabel: 'Importe abonado',
        description: 'Este monto ha sido deducido del saldo deudor.',
        tone: 'credit',
    },
    charge: {
        label: 'Cargo por Trabajo',
        amountLabel: 'Importe cargado',
        description: 'Este monto ha sido sumado al saldo deudor.',
        tone: 'debit',
    },
    debit: {
        label: 'Cargo por Trabajo',
        amountLabel: 'Importe cargado',
        description: 'Este monto ha sido sumado al saldo deudor.',
        tone: 'debit',
    },
    adjustment: {
        label: 'Ajuste',
        amountLabel: 'Importe ajustado',
        description: 'Este movimiento modifica el saldo de la cuenta.',
        tone: 'neutral',
    },
    note_credit: {
        label: 'Nota de Crédito',
        amountLabel: 'Importe acreditado',
        description: 'Este monto reduce el saldo deudor.',
        tone: 'credit',
    },
    note_debit: {
        label: 'Nota de Débito',
        amountLabel: 'Importe debitado',
        description: 'Este monto incrementa el saldo deudor.',
        tone: 'debit',
    },
};

const fmt = (value) => Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
});

const fmtDate = (value, includeTime = false) => {
    if (!value) {
        return '—';
    }

    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Date(value).toLocaleDateString('es-AR', options);
};

function slugify(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getMoveMeta(move) {
    return MOVE_TYPE_META[move?.type] || {
        label: 'Movimiento de Cuenta',
        amountLabel: 'Importe',
        description: 'Movimiento registrado en la cuenta corriente.',
        tone: 'neutral',
    };
}

function CompanyBlock({ company }) {
    const displayName = getCompanyDisplayName(company);
    const fiscalName = company?.name || displayName;
    const showFiscalName = fiscalName && fiscalName !== displayName;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <CompanyLogo
                company={company}
                scope="lab"
                height="18mm"
                maxWidth="70mm"
                style={{ marginBottom: 2 }}
            />
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', lineHeight: 1.15 }}>
                {displayName}
            </div>
            {showFiscalName && (
                <div style={{ fontSize: 8.2, color: '#475569', lineHeight: 1.4 }}>
                    {fiscalName}
                </div>
            )}
            <div style={{ fontSize: 8.2, color: '#475569', lineHeight: 1.6 }}>
                {company?.address && <div>{company.address}</div>}
                {(company?.city || company?.province) && (
                    <div>{[company.city, company.province].filter(Boolean).join(' - ')}</div>
                )}
                {company?.phone && <div>Tel: {company.phone}</div>}
                {company?.email && <div>{company.email}</div>}
                {company?.cuit && <div>CUIT: {company.cuit}</div>}
            </div>
        </div>
    );
}

function ReceiptDocument({ move, company }) {
    const account = move.account ?? move.lab_account ?? null;
    const dentist = account?.dentist ?? null;
    const paymentMethod = move.payment_method ?? move.paymentMethod ?? null;
    const meta = getMoveMeta(move);
    const companyDisplayName = getCompanyDisplayName(company);
    const dentistName = dentist
        ? [dentist.name, dentist.last_name].filter(Boolean).join(' ').trim() || dentist.contact_name || '—'
        : 'Odontólogo no disponible';
    const amountColor = meta.tone === 'credit'
        ? AD.green
        : meta.tone === 'debit'
            ? '#D97706'
            : AD.blue;

    return (
        <div
            id="print-zone"
            style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '260mm',
                margin: '0 auto',
                background: '#fff',
                color: '#0f172a',
                fontFamily: "'Montserrat', sans-serif",
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 24,
            }}
        >
            <div style={{ background: `linear-gradient(135deg, ${AD.blue} 0%, ${AD.teal} 55%, ${AD.green} 100%)`, height: 8, flexShrink: 0 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: '10mm', padding: '8mm 12mm 6mm', borderBottom: `1px solid ${AD.light}` }}>
                <CompanyBlock company={company} />

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: AD.blue, letterSpacing: -0.7, lineHeight: 1.05 }}>
                        COMPROBANTE
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                        N°. {String(move.id).padStart(6, '0')}
                    </div>
                    <div style={{ fontSize: 8.3, color: '#64748b', marginTop: 8, lineHeight: 1.8 }}>
                        <div><strong>Fecha:</strong> {fmtDate(move.move_date || move.created_at)}</div>
                        <div><strong>Emisor:</strong> {move.user?.name || 'Sistema'}</div>
                        <div><strong>Tipo:</strong> {meta.label}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', padding: '6mm 12mm', borderBottom: `1px solid ${AD.light}`, background: '#f8fbfd' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 8, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                        <Building2 size={14} />
                        Odontólogo / Cliente
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                        {dentistName}
                    </div>
                    <div style={{ fontSize: 8.5, color: '#475569', lineHeight: 1.8, marginTop: 6 }}>
                        {dentist?.contact_name && <div>Contacto: {dentist.contact_name}</div>}
                        {dentist?.phone && <div>Tel: {dentist.phone}</div>}
                        {dentist?.email && <div>Email: {dentist.email}</div>}
                        {dentist?.address && <div>Domicilio: {dentist.address}</div>}
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 8, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                        <ReceiptText size={14} />
                        Información del Movimiento
                    </div>
                    <div style={{ fontSize: 8.5, color: '#0f172a', lineHeight: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 5 }}>
                            <span style={{ color: '#64748b' }}>Tipo:</span>
                            <span style={{ fontWeight: 700, textAlign: 'right' }}>{meta.label}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #e2e8f0', padding: '5px 0' }}>
                            <span style={{ color: '#64748b' }}>Concepto:</span>
                            <span style={{ fontWeight: 700, textAlign: 'right' }}>{move.description || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #e2e8f0', padding: '5px 0' }}>
                            <span style={{ color: '#64748b' }}>Forma de pago:</span>
                            <span style={{ fontWeight: 700, textAlign: 'right' }}>{paymentMethod?.name || 'No informado'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 5 }}>
                            <span style={{ color: '#64748b' }}>Cuenta:</span>
                            <span style={{ fontWeight: 700, textAlign: 'right' }}>
                                {account?.id ? `CC-${String(account.id).padStart(4, '0')}` : 'No disponible'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '8mm 12mm 6mm' }}>
                <div style={{ border: '1px solid #dbe5ee', background: '#f8fbfd', borderRadius: 20, padding: '7mm 8mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                            {meta.amountLabel}
                        </div>
                        <div style={{ fontSize: 10, color: '#475569', maxWidth: 380 }}>
                            {meta.description}
                        </div>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: amountColor, letterSpacing: -1, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {fmt(move.amount)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12mm 8mm' }}>
                <div style={{ minWidth: '76mm', border: '1px solid #dbe5ee', borderRadius: 18, padding: '6mm 7mm', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 8, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                        <WalletCards size={14} />
                        Saldo actual en cuenta
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', textAlign: 'right' }}>
                        {fmt(move.balance_after)}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: `1px solid ${AD.light}`, padding: '5mm 12mm 6mm', background: '#fbfdff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CompanyLogo company={company} scope="lab" height="8mm" maxWidth="22mm" />
                        <div style={{ fontSize: 7.2, color: AD.teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            {companyDisplayName} · Tu sonrisa, es nuestra prioridad.
                        </div>
                    </div>
                    <div style={{ fontSize: 7, color: '#94a3b8', textAlign: 'right' }}>
                        Documento interno · Generado el {fmtDate(new Date(), true)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Show({ auth, move }) {
    const { isDark } = useTheme();
    const account = move.account ?? move.lab_account ?? null;
    const dentist = account?.dentist ?? null;
    const company = dentist?.company ?? null;
    const meta = getMoveMeta(move);

    const previewSurface = isDark ? '#09111c' : '#dde2e8';
    const chromeSurface = isDark ? '#0f1623' : '#f8fafc';
    const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5';
    const subtleText = isDark ? '#94a3b8' : '#64748b';
    const mainText = isDark ? '#e2e8f0' : '#1e293b';
    const documentNumber = String(move.id).padStart(6, '0');
    const dentistName = dentist
        ? [dentist.name, dentist.last_name].filter(Boolean).join(' ').trim() || dentist.contact_name || ''
        : '';
    const printTitle = [
        'comprobante-cuenta-corriente',
        documentNumber,
        slugify(dentistName),
    ].filter(Boolean).join('-');

    const handlePrint = () => {
        const printElement = document.getElementById('print-zone');
        if (!printElement) {
            return;
        }

        const html = buildPrintHtml({
            title: printTitle,
            bodyHtml: printElement.outerHTML,
            pageSize: 'A4',
            zoneWidth: '210mm',
            extraHead: MONTSERRAT_PRINT_HEAD,
            bodyStyle: 'display:flex;justify-content:center;background:#fff;padding:0;',
        });

        openBrowserPrint(html, { delay: 600 });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Comprobante cuenta corriente #${documentNumber}`} />

            <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12 print:max-w-none print:pb-0">
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : ''} onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2" size={16} />
                        Volver
                    </Button>

                    <Button
                        onClick={handlePrint}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <Printer className="mr-2" size={18} />
                        Imprimir / PDF
                    </Button>
                </div>

                <div
                    style={{
                        background: chromeSurface,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 22,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '12px 16px',
                            borderBottom: `1px solid ${borderColor}`,
                            background: chromeSurface,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
                                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
                                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                                <CalendarDays size={12} color={subtleText} />
                                <span style={{ fontSize: 11, color: subtleText }}>
                                    Vista previa — PDF A4 · {meta.label}
                                </span>
                            </div>
                        </div>
                        <span style={{ fontSize: 11, color: subtleText, fontWeight: 700 }}>
                            {dentist ? 'Cuenta corriente de laboratorio' : 'Comprobante interno'}
                        </span>
                    </div>

                    <div
                        style={{
                            background: previewSurface,
                            padding: 24,
                            overflow: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ width: '100%', maxWidth: '210mm', boxShadow: '0 20px 48px rgba(15,23,42,0.28)' }}>
                            <ReceiptDocument move={move} company={company} />
                        </div>
                    </div>
                </div>

                <div
                    className="print:hidden"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12,
                    }}
                >
                    {[
                        ['Comprobante', `#${documentNumber}`],
                        ['Odontólogo', dentistName || 'No disponible'],
                        ['Importe', fmt(move.amount)],
                        ['Saldo actual', fmt(move.balance_after)],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            style={{
                                background: isDark ? '#161f2e' : '#ffffff',
                                border: `1.5px solid ${borderColor}`,
                                borderRadius: 16,
                                padding: '14px 16px',
                            }}
                        >
                            <div style={{ fontSize: 10, color: subtleText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                {label}
                            </div>
                            <div style={{ fontSize: 18, color: mainText, fontWeight: 800, lineHeight: 1.2 }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
