import React, { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    Plus,
    Search,
    Receipt,
    WalletCards,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    CalendarDays,
    Calendar,
    X,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from 'lucide-react';
import { shiftReferenceDate, isCurrentPeriod, formatPeriodRangeLabel } from '@/lib/periodNav';
import { toLocalDateIso as toLocalDateInput } from '@/lib/localDate';

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'year', label: 'Año' },
    { value: 'range', label: 'Rango' },
];

const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    const normalized = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        const [year, month, day] = normalized.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(normalized);
};

const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() + diffToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
        from: toLocalDateInput(start),
        to: toLocalDateInput(end),
    };
};

const B = { blue: '#397B9C', teal: '#49949C' };

export default function Index({ auth, moves, debtors = [], filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const today = toLocalDateInput(new Date());
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [period, setPeriod] = useState(filters.period || 'week');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [referenceDate, setReferenceDate] = useState(filters.reference_date || today);
    const firstRender = useRef(true);

    useEffect(() => {
        setSearchTerm(filters.search || '');
        setPeriod(filters.period || 'week');
        setFrom(filters.from || '');
        setTo(filters.to || '');
        setReferenceDate(filters.reference_date || today);
    }, [filters.search, filters.period, filters.from, filters.to, filters.reference_date]);

    const activeFilterCount = useMemo(() => {
        let count = searchTerm ? 1 : 0;
        if (period && period !== 'week') count += 1;
        if (period === 'range' && (from || to)) count += 1;
        return count;
    }, [searchTerm, period, from, to]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const nextFilters = {
                search: searchTerm || undefined,
                period: period || 'week',
                from: from || undefined,
                to: to || undefined,
                reference_date: period !== 'range' ? referenceDate : undefined,
            };

            const currentFilters = {
                search: filters.search || undefined,
                period: filters.period || 'week',
                from: filters.from || undefined,
                to: filters.to || undefined,
                reference_date: filters.period !== 'range' ? (filters.reference_date || undefined) : undefined,
            };

            if (firstRender.current) {
                firstRender.current = false;
                return;
            }

            if (JSON.stringify(nextFilters) !== JSON.stringify(currentFilters)) {
                router.get(route('lab-account-moves.index'), nextFilters, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, period, from, to, referenceDate, filters.search, filters.period, filters.from, filters.to, filters.reference_date]);

    const navigatePeriod = (direction) => {
        setReferenceDate((current) => shiftReferenceDate(period, current, direction));
    };

    const atCurrentPeriod = isCurrentPeriod(period, referenceDate);

    const resetFilters = () => {
        const week = getCurrentWeekRange();
        setSearchTerm('');
        setPeriod('week');
        setFrom(week.from);
        setTo(week.to);
        setReferenceDate(today);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const handleDeletePayment = (move) => {
        confirmDialog(
            `¿Eliminar este pago de ${formatCurrency(move.amount)}? El saldo de la cuenta corriente se va a actualizar.`,
            () => router.delete(route('lab-account-moves.destroy', move.id))
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const parsedDate = parseDateValue(dateString);
        if (!parsedDate || Number.isNaN(parsedDate.getTime())) return '-';

        return parsedDate.toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuentas Corrientes - Laboratorio" />

            <div className="flex flex-col gap-6 font-sans">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Cuentas Corrientes y Pagos
                            </h1>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Historial de cargos y pagos.
                            </p>
                        </div>
                    </div>

                    <Link href={route('lab-account-moves.create')}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-md">
                            <Plus size={18} />
                            Registrar Pago
                        </button>
                    </Link>
                </div>

                {debtors.length > 0 && (
                    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <div>
                                <h2 className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    Odontólogos con deuda
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Saldos pendientes actuales, independientemente del período filtrado.
                                </p>
                            </div>
                            <div className={`px-3 py-2.5 min-h-[40px] rounded-xl text-sm font-bold ${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                                Total adeudado: {formatCurrency(debtors.reduce((sum, item) => sum + (item.balance || 0), 0))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {debtors.map((item) => (
                                <div
                                    key={item.id}
                                    className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
                                >
                                    <div className="min-w-0">
                                        <p className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                            {item.dentist
                                                ? `${item.dentist.name} ${item.dentist.last_name || ''}`.trim()
                                                : 'Sin odontólogo'}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Cuenta corriente pendiente
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className={`text-sm font-extrabold whitespace-nowrap ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                            {formatCurrency(item.balance)}
                                        </span>
                                        <Link
                                            href={route('lab-accounts.show', item.id)}
                                            className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-sky-300 hover:text-sky-200' : 'text-sky-700 hover:text-sky-800'}`}
                                        >
                                            Ver detalle
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar odontólogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-xl outline-none transition-colors
                                ${isDark
                                    ? 'bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15'}
                            `}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {PERIOD_OPTIONS.map((option) => {
                            const active = period === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setPeriod(option.value);
                                        setReferenceDate(today);
                                    }}
                                    className={`px-3 py-2.5 min-h-[40px] rounded-xl text-sm font-bold border transition-colors ${
                                        active
                                            ? 'bg-sky-600 border-sky-600 text-white'
                                            : isDark
                                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                        {period !== 'range' && (
                            <div className={`inline-flex items-center gap-1 rounded-xl border px-1 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => navigatePeriod(-1)}
                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className={`text-xs font-bold px-1 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {formatPeriodRangeLabel(period, filters.from, filters.to)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => navigatePeriod(1)}
                                    disabled={atCurrentPeriod}
                                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => {
                                    setPeriod('range');
                                    setFrom(e.target.value);
                                }}
                                className={`pl-10 pr-3 py-2 border rounded-xl text-sm ${
                                    isDark ? 'border-slate-700 text-slate-200 bg-slate-900' : 'border-slate-200 text-slate-900 bg-white'
                                }`}
                                title="Desde"
                            />
                        </div>

                        <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>a</span>

                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => {
                                    setPeriod('range');
                                    setTo(e.target.value);
                                }}
                                className={`pl-10 pr-3 py-2 border rounded-xl text-sm ${
                                    isDark ? 'border-slate-700 text-slate-200 bg-slate-900' : 'border-slate-200 text-slate-900 bg-white'
                                }`}
                                title="Hasta"
                            />
                        </div>

                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className={`inline-flex items-center gap-1 text-sm font-semibold ${isDark ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-700'}`}
                            >
                                <X size={14} />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50/80'}`}>
                        <div>
                            <h3 className={`font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Movimientos del período
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {formatDate(filters.from)} al {formatDate(filters.to)}
                            </p>
                        </div>
                        {moves?.total > 0 && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDark ? 'bg-sky-500/10 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>
                                {moves.total} movimiento{moves.total === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>

                    {moves.data.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <WalletCards className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} size={36} />
                            <h3 className={`text-base font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Sin movimientos en este período
                            </h3>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Ajustá el período o la búsqueda para ver más resultados.
                            </p>
                        </div>
                    ) : (
                        <>
                        {/* Mobile cards */}
                        <div className="sm:hidden flex flex-col gap-3 p-4">
                            {moves.data.map((move) => {
                                const isPayment = move.type === 'payment';
                                const dentist = move.account?.dentist;
                                return (
                                    <div key={move.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0">
                                                    <p className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                        {dentist ? `${dentist.name} ${dentist.last_name || ''}`.trim() : 'N/A'}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {formatDate(move.move_date)}
                                                    </p>
                                                    {move.description && (
                                                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{move.description}</p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className={`font-extrabold text-base ${isPayment ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {isPayment ? '-' : '+'}{formatCurrency(move.amount)}
                                                    </p>
                                                    {isPayment ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                            <ArrowDownRight size={11} /> Pago
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                            <ArrowUpRight size={11} /> Cargo
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Saldo: <span className="font-bold">{formatCurrency(move.balance_after)}</span>
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <Link href={route('lab-account-moves.show', move.id)} className={isDark ? 'text-sky-300' : 'text-sky-600'}>
                                                        <Receipt size={16} />
                                                    </Link>
                                                    {isPayment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePayment(move)}
                                                            className={isDark ? 'text-red-400' : 'text-red-600'}
                                                            title="Eliminar pago"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className={`${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                                    <th className="px-6 py-4">Odontólogo</th>
                                    <th className="px-6 py-4">Detalle</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                    <th className="px-6 py-4 text-right">Saldo</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {moves.data.map((move) => {
                                    const isPayment = move.type === 'payment';
                                    const dentist = move.account?.dentist;

                                    return (
                                        <tr key={move.id} className="border-b">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatDate(move.move_date)}
                                            </td>

                                            <td className="px-6 py-4 font-bold">
                                                <Link
                                                    href={move.account?.id ? route('lab-accounts.show', move.account.id) : '#'}
                                                    className="flex items-center gap-2 hover:underline"
                                                >
                                                <Building2 size={14} />
                                                {dentist
                                                    ? `${dentist.name} ${dentist.last_name || ''}`
                                                    : 'N/A'}
                                                </Link>
                                            </td>

                                            <td className="px-6 py-4">
                                                {move.description}
                                                {move.paymentMethod && (
                                                    <div className="text-xs text-slate-500">
                                                        {move.paymentMethod.name}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {isPayment ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                                        <ArrowDownRight size={12} /> Pago
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                                                        <ArrowUpRight size={12} /> Cargo
                                                    </span>
                                                )}
                                            </td>

                                            <td className={`px-6 py-4 text-right font-bold ${isPayment ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {isPayment ? '-' : '+'}
                                                {formatCurrency(move.amount)}
                                            </td>

                                            <td className="px-6 py-4 text-right font-extrabold">
                                                {formatCurrency(move.balance_after)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Link href={route('lab-account-moves.show', move.id)} title="Ver comprobante">
                                                        <Receipt size={16} />
                                                    </Link>
                                                    {isPayment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePayment(move)}
                                                            className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}
                                                            title="Eliminar pago"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
