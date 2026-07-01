import React, { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Eye,
    MinusCircle,
    Plus,
    Printer,
    Search,
    Trash2,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import {
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    printElementWithElectron,
    setStoredTicketFormat,
} from '@/lib/print';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';

const AD = {
    blue: '#397B9C',
    teal: '#49949C',
    green: '#5AAD9C',
    red: '#E35D6A',
    amber: '#D97706',
};

const B = { blue: '#397B9C', teal: '#49949C' };

const fmtMoney = (value) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
}).format(value || 0);

const parseLocalDate = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(value);
};

const fmtDate = (value) => {
    const date = parseLocalDate(value);
    if (!date || Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

function ThermalReport({ items, summary, filters, company, mode = '80mm' }) {
    const width = getThermalZoneWidth(mode);
    const companyDisplayName = getCompanyDisplayName(company);

    return (
        <div
            id="print-zone"
            style={{
                width,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '9pt',
                color: '#000',
                background: '#fff',
                lineHeight: 1.4,
                boxSizing: 'border-box',
                padding: mode === '57mm' ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm',
            }}
        >
            <div style={{ borderTop: '3px solid #000', marginBottom: 8 }} />
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <CompanyLogo
                    company={company}
                    scope="lab"
                    thermal
                    height={28}
                    maxWidth={150}
                    style={{ margin: '0 auto' }}
                />
            </div>
            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 11, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Reporte laboratorio</div>
            <div style={{ textAlign: 'center', fontSize: 7.4, color: '#000', marginBottom: 2 }}>{companyDisplayName}</div>
            <div style={{ textAlign: 'center', fontSize: 8, color: '#000', marginBottom: 6 }}>
                {fmtDate(filters.from)} al {fmtDate(filters.to)}
            </div>
            <div style={{ border: '2px solid #000', padding: '5px 6px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Ingresos</span>
                    <span style={{ fontWeight: 900 }}>{fmtMoney(summary.income_total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>Egresos</span>
                    <span style={{ fontWeight: 900 }}>{fmtMoney(summary.expense_total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 3 }}>
                    <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance</span>
                    <span style={{ fontWeight: 900 }}>{fmtMoney(summary.net_total)}</span>
                </div>
            </div>

            <div style={{ fontSize: 8.1, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>Detalle</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 7.6 }}>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px dotted #999' }}>
                            <td style={{ padding: '2px 0', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 900 }}>{fmtDate(item.date)} · {item.category}</div>
                                <div>{item.description}</div>
                                {item.party && <div style={{ color: '#000' }}>{item.party}</div>}
                                {item.payment_method && <div style={{ color: '#000' }}>{item.payment_method}</div>}
                            </td>
                            <td style={{ padding: '2px 0', textAlign: 'right', verticalAlign: 'top', fontWeight: 900, color: '#000' }}>
                                {item.flow === 'income' ? '+' : '-'}{fmtMoney(item.amount)}
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={2} style={{ padding: '6px 0', textAlign: 'center', fontWeight: 700 }}>
                                Sin movimientos en el período seleccionado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: 8, borderTop: '1px solid #000', paddingTop: 4, textAlign: 'center', fontSize: 6.5, color: '#000' }}>
                {companyDisplayName} · Balance de ingresos y egresos
            </div>
            <div style={{ borderTop: '3px solid #000', marginTop: 6 }} />
        </div>
    );
}

export default function Index({ auth, items = [], summary, filters, paymentMethods = [], expenseCategories = [], company = null }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const toast = useToast();
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [printMode, setPrintMode] = useState(() => getStoredTicketFormat('80mm'));
    const firstRun = useRef(true);

    const incomeForm = useForm({
        description: '',
        amount: '',
        income_date: filters.to || '',
        payment_method_id: '',
        notes: '',
        search: filters.search || '',
        from: filters.from || '',
        to: filters.to || '',
    });

    const expenseForm = useForm({
        description: '',
        amount: '',
        expense_date: filters.to || '',
        payment_method_id: '',
        expense_category_id: '',
        reference: '',
        notes: '',
        search: filters.search || '',
        from: filters.from || '',
        to: filters.to || '',
    });

    useEffect(() => {
        setStoredTicketFormat(printMode);
    }, [printMode]);

    useEffect(() => {
        incomeForm.setData((prev) => ({ ...prev, search, from, to }));
        expenseForm.setData((prev) => ({ ...prev, search, from, to }));
    }, [search, from, to]);

    useEffect(() => {
        setSearch(filters.search || '');
        setFrom(filters.from || '');
        setTo(filters.to || '');
    }, [filters.search, filters.from, filters.to]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (firstRun.current) {
                firstRun.current = false;
                return;
            }

            router.get(route('lab-finance.index'), {
                search: search || undefined,
                from: from || undefined,
                to: to || undefined,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, from, to]);

    const grouped = useMemo(() => ({
        incomes: items.filter((item) => item.flow === 'income'),
        expenses: items.filter((item) => item.flow === 'expense'),
    }), [items]);

    const handlePrint = async () => {
        const printElement = document.getElementById('print-zone');
        if (!printElement) return;

        const result = await printElementWithElectron({
            element: printElement,
            mode: printMode,
            zoneWidth: printElement.style.width || getThermalZoneWidth(printMode),
            zoom: getThermalPrintZoom(printMode),
            fallbackToBrowser: true,
            browserDelay: 500,
        });

        if (!result.ok && !result.fallbackUsed) {
            toast.error('No se pudo conectar con ArtDent Print.');
        }
    };

    const handleDelete = (item) => {
        if (!item.can_delete) return;

        const routeName = item.source_type === 'income_record'
            ? 'lab-finance.incomes.destroy'
            : 'lab-finance.expenses.destroy';

        const label = item.flow === 'income' ? 'ingreso' : 'egreso';

        confirmDialog(`¿Eliminar este ${label}?`, () =>
            router.delete(route(routeName, item.source_id), {
                data: { search, from, to },
                preserveState: true,
            })
        );
    };

    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';
    const sub = isDark ? 'text-slate-400' : 'text-slate-500';
    const input = isDark
        ? 'border-slate-700 bg-slate-950 text-slate-100'
        : 'border-slate-200 bg-white text-slate-900';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ingresos y Egresos - Laboratorio" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold ${text}`}>Ingresos y Egresos del Laboratorio</h1>
                            <p className={`text-sm mt-1 ${sub}`}>Control manual y reporte consolidado con cobros y pagos del laboratorio.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['80mm', '57mm'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setPrintMode(mode)}
                                className={`px-3 py-2.5 min-h-[40px] rounded-xl text-sm font-bold border ${
                                    printMode === mode
                                        ? 'bg-sky-600 border-sky-600 text-white'
                                        : isDark
                                            ? 'border-slate-700 text-slate-300'
                                            : 'border-slate-200 text-slate-700'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
                        >
                            <Printer size={16} />
                            Imprimir Reporte
                        </button>
                    </div>
                </div>

                <div className={`rounded-2xl border p-4 flex flex-col lg:flex-row gap-3 ${card}`}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por concepto, odontólogo o colaborador..."
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${input}`}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border ${input}`} />
                        <span className={sub}>a</span>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border ${input}`} />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className={`rounded-2xl border p-5 ${card}`}>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <ArrowUpCircle size={18} />
                            Cobrado a odontologos
                        </div>
                        <p className={`text-2xl font-extrabold mt-2 ${text}`}>{fmtMoney(summary.dentist_income_total)}</p>
                        <p className={`text-xs mt-1 ${sub}`}>{summary.dentist_income_count} pago{summary.dentist_income_count === 1 ? '' : 's'} recibido{summary.dentist_income_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className={`rounded-2xl border p-5 ${card}`}>
                        <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                            <ArrowDownCircle size={18} />
                            Pagado a colaboradores
                        </div>
                        <p className={`text-2xl font-extrabold mt-2 ${text}`}>{fmtMoney(summary.collaborator_expense_total)}</p>
                        <p className={`text-xs mt-1 ${sub}`}>{summary.collaborator_expense_count} pago{summary.collaborator_expense_count === 1 ? '' : 's'} realizado{summary.collaborator_expense_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className={`rounded-2xl border p-5 ${card}`}>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                            <ArrowUpCircle size={18} />
                            Ingresos
                        </div>
                        <p className={`text-2xl font-extrabold mt-2 ${text}`}>{fmtMoney(summary.income_total)}</p>
                        <p className={`text-xs mt-1 ${sub}`}>{summary.income_count} movimiento{summary.income_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className={`rounded-2xl border p-5 ${card}`}>
                        <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                            <ArrowDownCircle size={18} />
                            Egresos
                        </div>
                        <p className={`text-2xl font-extrabold mt-2 ${text}`}>{fmtMoney(summary.expense_total)}</p>
                        <p className={`text-xs mt-1 ${sub}`}>{summary.expense_count} movimiento{summary.expense_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className={`rounded-2xl border p-5 ${card}`}>
                        <div className="flex items-center gap-2 text-sky-500 font-bold text-sm">
                            <WalletCards size={18} />
                            Balance
                        </div>
                        <p className={`text-2xl font-extrabold mt-2 ${summary.net_total >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmtMoney(summary.net_total)}</p>
                        <p className={`text-xs mt-1 ${sub}`}>Ingresos menos egresos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            incomeForm.post(route('lab-finance.incomes.store'), { preserveScroll: true, onSuccess: () => incomeForm.reset('description', 'amount', 'notes') });
                        }}
                        className={`rounded-2xl border p-5 ${card}`}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Plus size={18} className="text-emerald-500" />
                            <h2 className={`font-extrabold ${text}`}>Registrar Ingreso</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={incomeForm.data.description} onChange={(e) => incomeForm.setData('description', e.target.value)} placeholder="Concepto" className={`px-3 py-2 rounded-xl border ${input}`} />
                            <input type="number" step="0.01" min="0" value={incomeForm.data.amount} onChange={(e) => incomeForm.setData('amount', e.target.value)} placeholder="Monto" className={`px-3 py-2 rounded-xl border ${input}`} />
                            <input type="date" value={incomeForm.data.income_date} onChange={(e) => incomeForm.setData('income_date', e.target.value)} className={`px-3 py-2 rounded-xl border ${input}`} />
                            <select value={incomeForm.data.payment_method_id} onChange={(e) => incomeForm.setData('payment_method_id', e.target.value)} className={`px-3 py-2 rounded-xl border ${input}`}>
                                <option value="">Metodo de pago</option>
                                {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                            </select>
                            <textarea value={incomeForm.data.notes} onChange={(e) => incomeForm.setData('notes', e.target.value)} placeholder="Notas" className={`px-3 py-2 rounded-xl border md:col-span-2 ${input}`} rows={3} />
                        </div>
                        <button type="submit" className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700">Guardar ingreso</button>
                    </form>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            expenseForm.post(route('lab-finance.expenses.store'), { preserveScroll: true, onSuccess: () => expenseForm.reset('description', 'amount', 'reference', 'notes') });
                        }}
                        className={`rounded-2xl border p-5 ${card}`}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <MinusCircle size={18} className="text-red-500" />
                            <h2 className={`font-extrabold ${text}`}>Registrar Egreso</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={expenseForm.data.description} onChange={(e) => expenseForm.setData('description', e.target.value)} placeholder="Concepto" className={`px-3 py-2 rounded-xl border ${input}`} />
                            <input type="number" step="0.01" min="0" value={expenseForm.data.amount} onChange={(e) => expenseForm.setData('amount', e.target.value)} placeholder="Monto" className={`px-3 py-2 rounded-xl border ${input}`} />
                            <input type="date" value={expenseForm.data.expense_date} onChange={(e) => expenseForm.setData('expense_date', e.target.value)} className={`px-3 py-2 rounded-xl border ${input}`} />
                            <select value={expenseForm.data.payment_method_id} onChange={(e) => expenseForm.setData('payment_method_id', e.target.value)} className={`px-3 py-2 rounded-xl border ${input}`}>
                                <option value="">Metodo de pago</option>
                                {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                            </select>
                            <select value={expenseForm.data.expense_category_id} onChange={(e) => expenseForm.setData('expense_category_id', e.target.value)} className={`px-3 py-2 rounded-xl border ${input}`}>
                                <option value="">Categoria</option>
                                {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                            <input value={expenseForm.data.reference} onChange={(e) => expenseForm.setData('reference', e.target.value)} placeholder="Referencia" className={`px-3 py-2 rounded-xl border ${input}`} />
                            <textarea value={expenseForm.data.notes} onChange={(e) => expenseForm.setData('notes', e.target.value)} placeholder="Notas" className={`px-3 py-2 rounded-xl border md:col-span-2 ${input}`} rows={3} />
                        </div>
                        <button type="submit" className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700">Guardar egreso</button>
                    </form>
                </div>

                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="px-6 py-4 border-b border-slate-200/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h2 className={`font-extrabold ${text}`}>Movimientos del rango</h2>
                            <p className={`text-sm ${sub}`}>{fmtDate(from)} al {fmtDate(to)}</p>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {items.length} registro{items.length === 1 ? '' : 's'}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <WalletCards size={36} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`font-bold ${text}`}>Sin movimientos en el rango seleccionado</p>
                        </div>
                    ) : (
                        <>
                        {/* Mobile cards */}
                        <div className="sm:hidden flex flex-col gap-3 p-4">
                            {items.map((item) => (
                                <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <div style={{ height: 3, background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal})` }} />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0">
                                                <p className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.description}</p>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(item.date)}</p>
                                                {item.notes && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.notes}</p>}
                                            </div>
                                            <span className={`font-extrabold text-base shrink-0 ${item.flow === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.flow === 'income' ? '+' : '-'}{fmtMoney(item.amount)}
                                            </span>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${item.flow === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {item.category}
                                                </span>
                                                {item.party && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.party}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.route && (
                                                    <Link href={item.route} className={isDark ? 'text-sky-300' : 'text-sky-600'}>
                                                        <Eye size={16} />
                                                    </Link>
                                                )}
                                                {item.can_delete && (
                                                    <button type="button" onClick={() => handleDelete(item)} className={isDark ? 'text-red-300' : 'text-red-600'}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}>
                                    <tr>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">Fecha</th>
                                        <th className="px-4 py-3 text-left">Origen</th>
                                        <th className="px-4 py-3 text-left">Detalle</th>
                                        <th className="px-4 py-3 text-left">Tercero</th>
                                        <th className="px-4 py-3 text-left">Pago</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-200/10">
                                            <td className="px-4 py-3 whitespace-nowrap">{fmtDate(item.date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    item.flow === 'income'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={text}>{item.description}</div>
                                                {item.notes && <div className={`text-xs ${sub}`}>{item.notes}</div>}
                                            </td>
                                            <td className="px-4 py-3">{item.party || '—'}</td>
                                            <td className="px-4 py-3">{item.payment_method || '—'}</td>
                                            <td className={`px-4 py-3 text-right font-extrabold ${item.flow === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.flow === 'income' ? '+' : '-'}{fmtMoney(item.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {item.route && (
                                                        <Link href={item.route} className={isDark ? 'text-sky-300' : 'text-sky-600'}>
                                                            <Eye size={16} />
                                                        </Link>
                                                    )}
                                                    {item.can_delete && (
                                                        <button type="button" onClick={() => handleDelete(item)} className={isDark ? 'text-red-300' : 'text-red-600'}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </div>

                <div className="hidden">
                    <ThermalReport items={items} summary={summary} filters={{ from, to }} company={company} mode={printMode} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
