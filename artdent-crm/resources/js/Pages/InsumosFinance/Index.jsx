import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    MinusCircle,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    WalletCards,
} from 'lucide-react';

const AD = { blue: '#397B9C', teal: '#49949C' };
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

export default function Index({ auth, items = [], summary, filters, paymentMethods = [], expenseCategories = [] }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
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

            router.get(route('insumos-finance.index'), {
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

    const handleDelete = (item) => {
        if (!item.can_delete) return;

        const routeName = item.source_type === 'income_record'
            ? 'insumos-finance.incomes.destroy'
            : 'insumos-finance.expenses.destroy';

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
            <Head title="Ingresos y Egresos - Insumos" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold ${text}`}>Ingresos y Egresos de Insumos</h1>
                        <p className={`text-sm mt-1 ${sub}`}>Movimientos manuales que no vienen de ventas ni de pagos a proveedores.</p>
                    </div>
                </div>

                <div className={`rounded-2xl border p-4 flex flex-col lg:flex-row gap-3 ${card}`}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por concepto..."
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            incomeForm.post(route('insumos-finance.incomes.store'), { preserveScroll: true, onSuccess: () => incomeForm.reset('description', 'amount', 'notes') });
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
                            expenseForm.post(route('insumos-finance.expenses.store'), { preserveScroll: true, onSuccess: () => expenseForm.reset('description', 'amount', 'reference', 'notes') });
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
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${item.flow === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {item.category}
                                            </span>
                                            {item.can_delete && (
                                                <button type="button" onClick={() => handleDelete(item)} className={isDark ? 'text-red-300' : 'text-red-600'}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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
                                            <td className="px-4 py-3">{item.payment_method || '—'}</td>
                                            <td className={`px-4 py-3 text-right font-extrabold ${item.flow === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.flow === 'income' ? '+' : '-'}{fmtMoney(item.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
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
            </div>
        </AuthenticatedLayout>
    );
}
