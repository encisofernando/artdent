import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    CalendarDays,
    CreditCard,
    ExternalLink,
    FileText,
    Printer,
    ReceiptText,
    UserRound,
    WalletCards,
} from 'lucide-react';
import {
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    MONTSERRAT_PRINT_HEAD,
    printElementWithElectron,
} from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';

const BRAND = {
    blue: '#397B9C',
    teal: '#49949C',
    green: '#5AAD9C',
    amber: '#F59E0B',
    red: '#E63946',
};

const MOVE_LABELS = {
    charge: 'Cargo',
    payment: 'Pago',
    adjustment: 'Ajuste',
    note_credit: 'Nota de crédito',
    note_debit: 'Nota de débito',
};

const fmt = (value) => Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
});

const formatDate = (value) => {
    if (!value) return '-';

    const normalized = String(value);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(normalized)
        ? new Date(`${normalized}T00:00:00`)
        : new Date(normalized);

    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const fullDentistName = (dentist) => (
    [dentist?.name, dentist?.last_name].filter(Boolean).join(' ').trim()
    || dentist?.contact_name
    || 'Odontólogo'
);

function KpiCard({ label, value, hint, icon: Icon, color, isDark }) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {label}
                    </p>
                    <p className="mt-2 text-xl font-extrabold" style={{ color }}>
                        {value}
                    </p>
                    {hint && (
                        <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {hint}
                        </p>
                    )}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${color}1f` }}>
                    <Icon size={20} style={{ color }} />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ isDark, title, description }) {
    return (
        <div className={`rounded-2xl border px-5 py-8 text-center ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
            <WalletCards className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} size={34} />
            <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</p>
        </div>
    );
}

function AccountTicket({ account, dentist, company, summary, owedJobs, payments }) {
    const dentistName = fullDentistName(dentist);
    const companyName = getCompanyDisplayName(company);
    const generatedAt = new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            id="lab-account-statement-ticket"
            style={{
                width: '100%',
                background: '#fff',
                color: '#111827',
                fontFamily: "'Montserrat', sans-serif",
                padding: '10px 10px 12px',
                lineHeight: 1.35,
            }}
        >
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #111827', paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <CompanyLogo company={company} scope="lab" height="13mm" maxWidth="48mm" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Estado de cuenta</div>
                <div style={{ fontSize: 9, color: '#4b5563' }}>{companyName}</div>
                <div style={{ fontSize: 8, color: '#4b5563' }}>{generatedAt}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', fontWeight: 800 }}>Odontólogo</div>
                <div style={{ fontSize: 12, fontWeight: 900 }}>{dentistName}</div>
                {dentist?.phone && <div style={{ fontSize: 8.5 }}>Tel: {dentist.phone}</div>}
                {dentist?.email && <div style={{ fontSize: 8.5 }}>{dentist.email}</div>}
            </div>

            <div style={{ border: '1px solid #111827', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 9 }}>
                    <span>Cargos</span>
                    <strong>{fmt(summary.total_charges)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 9 }}>
                    <span>Pagos</span>
                    <strong>{fmt(summary.total_payments)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, marginTop: 5, paddingTop: 5, borderTop: '1px dashed #111827' }}>
                    <span style={{ fontWeight: 900 }}>Saldo</span>
                    <strong>{fmt(account.balance)}</strong>
                </div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px dashed #111827', paddingBottom: 4, marginBottom: 5 }}>
                    Trabajos adeudados
                </div>
                {owedJobs.length === 0 ? (
                    <div style={{ fontSize: 8.5, color: '#4b5563' }}>No hay trabajos pendientes de cobro.</div>
                ) : owedJobs.map((item) => (
                    <div key={item.move_id} style={{ padding: '5px 0', borderBottom: '1px dotted #d1d5db' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 8.5 }}>
                            <strong>{item.job?.job_number || item.description || `Mov. #${item.move_id}`}</strong>
                            <strong>{fmt(item.outstanding_amount)}</strong>
                        </div>
                        <div style={{ fontSize: 7.8, color: '#4b5563' }}>
                            {formatDate(item.move_date)}
                            {item.job?.patient ? ` - Paciente: ${item.job.patient}` : ''}
                            {item.paid_amount > 0 ? ` - Abonado: ${fmt(item.paid_amount)}` : ''}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px dashed #111827', paddingBottom: 4, marginBottom: 5 }}>
                    Pagos registrados
                </div>
                {payments.length === 0 ? (
                    <div style={{ fontSize: 8.5, color: '#4b5563' }}>Sin pagos registrados.</div>
                ) : payments.map((payment) => (
                    <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px dotted #d1d5db', fontSize: 8.5 }}>
                        <span>{formatDate(payment.move_date)} {payment.payment_method ? `- ${payment.payment_method}` : ''}</span>
                        <strong>{fmt(Math.abs(payment.amount))}</strong>
                    </div>
                ))}
            </div>

            <div style={{ borderTop: '1px dashed #111827', paddingTop: 7, fontSize: 7.5, color: '#4b5563', textAlign: 'center' }}>
                Cuenta CC-{String(account.id).padStart(4, '0')} - Documento interno de {companyName}
            </div>
        </div>
    );
}

export default function Show({ auth, account, dentist, company, moves = [], payments = [], owedJobs = [], summary }) {
    const { isDark } = useTheme();
    const [printing, setPrinting] = useState(false);
    const dentistName = fullDentistName(dentist);

    const colors = useMemo(() => ({
        card: isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70',
        soft: isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200',
        text: isDark ? 'text-slate-100' : 'text-slate-900',
        muted: isDark ? 'text-slate-400' : 'text-slate-500',
        subtle: isDark ? 'text-slate-500' : 'text-slate-400',
    }), [isDark]);

    const balanceColor = account.balance > 0
        ? BRAND.amber
        : account.balance < 0
            ? BRAND.green
            : BRAND.teal;

    const handlePrintTicket = async () => {
        const element = document.getElementById('lab-account-statement-ticket');
        if (!element) return;

        setPrinting(true);

        const mode = getStoredTicketFormat('80mm');
        const result = await printElementWithElectron({
            element,
            title: `estado-cuenta-${dentistName}`,
            mode,
            zoneWidth: getThermalZoneWidth(mode),
            zoom: getThermalPrintZoom(mode),
            extraHead: MONTSERRAT_PRINT_HEAD,
            zoneSelector: '#lab-account-statement-ticket',
            fallbackToBrowser: true,
            browserDelay: 700,
        });

        setPrinting(false);

        if (!result.ok && !result.fallbackUsed) {
            alert('El gestor de impresión ArtDent no está activo. Iniciá la aplicación o usá la impresión del navegador.');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Cuenta corriente - ${dentistName}`} />

            <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-12 font-sans">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('lab-account-moves.index')}>
                            <Button variant="outline" size="icon" className={`rounded-xl ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : ''}`}>
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${colors.text}`}>
                                Cuenta corriente
                            </h1>
                            <p className={`mt-1 text-sm ${colors.muted}`}>
                                {dentistName} - trabajos, pagos y saldo del laboratorio.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={route('lab-account-moves.create', { dentist_id: dentist.id })}>
                            <Button variant="outline" className={`gap-2 rounded-xl ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : ''}`}>
                                <CreditCard size={16} />
                                Registrar pago
                            </Button>
                        </Link>
                        <Button
                            onClick={handlePrintTicket}
                            disabled={printing}
                            className="gap-2 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                        >
                            <Printer size={17} />
                            {printing ? 'Preparando...' : 'Imprimir ticket'}
                        </Button>
                    </div>
                </div>

                <div className={`rounded-3xl border p-5 shadow-sm ${colors.card}`}>
                    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.teal})` }}>
                                {dentistName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className={`text-xl font-extrabold ${colors.text}`}>
                                        {dentistName}
                                    </h2>
                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        CC-{String(account.id).padStart(4, '0')}
                                    </span>
                                </div>
                                <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm ${colors.muted}`}>
                                    {dentist.phone && <span>Tel: {dentist.phone}</span>}
                                    {dentist.email && <span>{dentist.email}</span>}
                                    {dentist.cuit && <span>CUIT: {dentist.cuit}</span>}
                                    {dentist.license_number && <span>Matrícula: {dentist.license_number}</span>}
                                </div>
                                {(dentist.address || dentist.city || dentist.province) && (
                                    <p className={`mt-1 text-sm ${colors.muted}`}>
                                        {[dentist.address, dentist.city, dentist.province].filter(Boolean).join(' - ')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-2xl border p-4 text-right ${colors.soft}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${colors.muted}`}>
                                Saldo actual
                            </p>
                            <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: balanceColor }}>
                                {fmt(account.balance)}
                            </p>
                            <p className={`mt-1 text-xs ${colors.muted}`}>
                                {account.balance > 0 ? 'Saldo pendiente de cobro' : account.balance < 0 ? 'Saldo a favor del odontólogo' : 'Cuenta al día'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard isDark={isDark} label="Cargos" value={fmt(summary.total_charges)} hint={`${summary.moves_count} movimientos`} icon={ArrowUpRight} color={BRAND.amber} />
                    <KpiCard isDark={isDark} label="Pagos" value={fmt(summary.total_payments)} hint={`${payments.length} pago${payments.length === 1 ? '' : 's'}`} icon={CreditCard} color={BRAND.green} />
                    <KpiCard isDark={isDark} label="Trabajos adeudados" value={summary.owed_jobs_count} hint={fmt(summary.owed_jobs_total)} icon={ReceiptText} color={BRAND.red} />
                    <KpiCard isDark={isDark} label="Saldo" value={fmt(account.balance)} hint="Cuenta corriente actual" icon={WalletCards} color={balanceColor} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className={`rounded-3xl border overflow-hidden ${colors.card}`}>
                        <div className={`border-b px-5 py-4 ${isDark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'}`}>
                            <h3 className={`font-extrabold ${colors.text}`}>Trabajos adeudados</h3>
                            <p className={`mt-1 text-sm ${colors.muted}`}>
                                Cargos pendientes asociados a trabajos del laboratorio.
                            </p>
                        </div>

                        {owedJobs.length === 0 ? (
                            <div className="p-5">
                                <EmptyState isDark={isDark} title="Sin trabajos adeudados" description="No hay cargos pendientes para este odontólogo." />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {owedJobs.map((item) => (
                                    <div key={item.move_id} className="p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`font-extrabold ${colors.text}`}>
                                                        {item.job?.job_number || item.description || `Movimiento #${item.move_id}`}
                                                    </span>
                                                    {item.job?.status && (
                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                            {item.job.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs ${colors.muted}`}>
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDays size={13} />
                                                        {formatDate(item.job?.due_date || item.move_date)}
                                                    </span>
                                                    {item.job?.patient && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <UserRound size={13} />
                                                            {item.job.patient}
                                                        </span>
                                                    )}
                                                    {item.job?.job_type && <span>{item.job.job_type}</span>}
                                                </div>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <p className="text-lg font-black text-amber-500">{fmt(item.outstanding_amount)}</p>
                                                {item.paid_amount > 0 && (
                                                    <p className={`text-xs ${colors.muted}`}>
                                                        Abonado: {fmt(item.paid_amount)}
                                                    </p>
                                                )}
                                                {item.job?.url && (
                                                    <Link href={item.job.url} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300">
                                                        Ver orden <ExternalLink size={12} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={`rounded-3xl border overflow-hidden ${colors.card}`}>
                        <div className={`border-b px-5 py-4 ${isDark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'}`}>
                            <h3 className={`font-extrabold ${colors.text}`}>Pagos registrados</h3>
                            <p className={`mt-1 text-sm ${colors.muted}`}>
                                Acreditaciones aplicadas a la cuenta corriente.
                            </p>
                        </div>

                        {payments.length === 0 ? (
                            <div className="p-5">
                                <EmptyState isDark={isDark} title="Sin pagos" description="Todavía no hay pagos registrados para esta cuenta." />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between gap-4 p-4">
                                        <div className="min-w-0">
                                            <p className={`font-bold ${colors.text}`}>
                                                {payment.description || 'Pago a cuenta'}
                                            </p>
                                            <p className={`text-xs ${colors.muted}`}>
                                                {formatDate(payment.move_date)}
                                                {payment.payment_method ? ` - ${payment.payment_method}` : ''}
                                                {payment.user ? ` - ${payment.user}` : ''}
                                            </p>
                                        </div>
                                        <Link href={payment.receipt_url} className="shrink-0 text-right">
                                            <p className="font-black text-emerald-500">{fmt(Math.abs(payment.amount))}</p>
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                                                Comprobante <FileText size={12} />
                                            </span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className={`rounded-3xl border overflow-hidden ${colors.card}`}>
                    <div className={`border-b px-5 py-4 ${isDark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'}`}>
                        <h3 className={`font-extrabold ${colors.text}`}>Historial completo</h3>
                        <p className={`mt-1 text-sm ${colors.muted}`}>
                            Línea de tiempo de cargos, pagos, notas y ajustes.
                        </p>
                    </div>

                    {moves.length === 0 ? (
                        <div className="p-5">
                            <EmptyState isDark={isDark} title="Sin movimientos" description="La cuenta todavía no tiene movimientos registrados." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className={`text-[11px] uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="px-5 py-3 text-left">Fecha</th>
                                        <th className="px-5 py-3 text-left">Detalle</th>
                                        <th className="px-5 py-3 text-left">Tipo</th>
                                        <th className="px-5 py-3 text-right">Monto</th>
                                        <th className="px-5 py-3 text-right">Saldo</th>
                                        <th className="px-5 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {moves.map((move) => {
                                        const isCredit = move.signed_amount < 0;

                                        return (
                                            <tr key={move.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                                <td className={`px-5 py-4 ${colors.muted}`}>{formatDate(move.move_date)}</td>
                                                <td className="px-5 py-4">
                                                    <p className={`font-semibold ${colors.text}`}>{move.description || '-'}</p>
                                                    {move.payment_method && <p className={`text-xs ${colors.muted}`}>{move.payment_method}</p>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {MOVE_LABELS[move.type] || move.type}
                                                    </span>
                                                </td>
                                                <td className={`px-5 py-4 text-right font-black ${isCredit ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {isCredit ? '-' : '+'}{fmt(Math.abs(move.amount))}
                                                </td>
                                                <td className={`px-5 py-4 text-right font-extrabold ${colors.text}`}>
                                                    {fmt(move.balance_after)}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Link href={move.receipt_url} className={`inline-flex items-center gap-1 text-xs font-bold ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                                                        Ver <ExternalLink size={12} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                <AccountTicket
                    account={account}
                    dentist={dentist}
                    company={company}
                    summary={summary}
                    owedJobs={owedJobs}
                    payments={payments}
                />
            </div>
        </AuthenticatedLayout>
    );
}
