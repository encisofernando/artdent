import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, FileText, CreditCard, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';

const TYPE_CONFIG = {
    purchase: { label: 'Comprobante', icon: FileText, debit: true, color: 'red' },
    payment: { label: 'Pago', icon: CreditCard, debit: false, color: 'green' },
    credit_note: { label: 'Nota de Crédito', icon: TrendingDown, debit: false, color: 'blue' },
    adjustment: { label: 'Ajuste', icon: BookOpen, debit: null, color: 'slate' },
};

function MoveBadge({ type, isDark }) {
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.adjustment;
    const Icon = cfg.icon;
    const colorMap = {
        red: isDark ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-600 border-red-200',
        green: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blue: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200',
        slate: isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${colorMap[cfg.color]}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

export default function Show({ auth, vendor, account, moves }) {
    const { isDark } = useTheme();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
    const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

    const isDebt = account.balance > 0;
    const isCredit = account.balance < 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Cta. Cte. — ${vendor.name}`} />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {vendor.name}
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Cuenta corriente y movimientos
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('proveedores.comprobantes.create')} >
                            <Button size="sm"
                                className="text-white border-none text-xs rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                + Comprobante
                            </Button>
                        </Link>
                        <Link href={route('proveedores.pagos.create')}>
                            <Button size="sm" variant="outline"
                                className={`text-xs rounded-xl ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}>
                                + Pago
                            </Button>
                        </Link>
                        <Link href={route('proveedores.ctacte.index')}>
                            <Button variant="outline"
                                className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                <ArrowLeft className="mr-2" size={16} /> Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Balance card */}
                <div className={`rounded-2xl border p-6 flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Saldo Actual
                        </p>
                        <p className={`text-4xl font-extrabold ${
                            isDebt ? (isDark ? 'text-red-400' : 'text-red-600')
                            : isCredit ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            : (isDark ? 'text-slate-300' : 'text-slate-600')
                        }`}>
                            {fmt(Math.abs(account.balance))}
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {account.balance === 0 ? 'Sin deuda — al día'
                                : isDebt ? 'Deuda con el proveedor'
                                : 'Saldo a favor nuestro'}
                        </p>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        isDebt ? (isDark ? 'bg-red-900/30' : 'bg-red-50')
                        : isCredit ? (isDark ? 'bg-emerald-900/30' : 'bg-emerald-50')
                        : (isDark ? 'bg-slate-800' : 'bg-slate-50')
                    }`}>
                        {isDebt ? <TrendingUp size={28} className={isDark ? 'text-red-400' : 'text-red-500'} />
                            : isCredit ? <TrendingDown size={28} className={isDark ? 'text-emerald-400' : 'text-emerald-500'} />
                            : <BookOpen size={28} className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
                    </div>
                </div>

                {/* Movements */}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                    <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <BookOpen size={18} style={{ color: B.teal }} />
                        <h2 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Movimientos ({moves?.total ?? 0})
                        </h2>
                    </div>

                    {moves?.data?.length === 0 ? (
                        <div className={`p-10 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Sin movimientos registrados
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Tipo</th>
                                        <th className="px-4 py-3 text-left">Descripción</th>
                                        <th className="px-4 py-3 text-right">Débito</th>
                                        <th className="px-4 py-3 text-right">Crédito</th>
                                        <th className="px-4 py-3 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {moves.data.map(move => {
                                        const cfg = TYPE_CONFIG[move.type] ?? TYPE_CONFIG.adjustment;
                                        const isDebitMove = cfg.debit === true;
                                        return (
                                            <tr key={move.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {fmtDate(move.move_date)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <MoveBadge type={move.type} isDark={isDark} />
                                                </td>
                                                <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {move.description || '—'}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${isDebitMove ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-600' : 'text-slate-200')}`}>
                                                    {isDebitMove ? fmt(move.amount) : ''}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${!isDebitMove && cfg.debit !== null ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-slate-600' : 'text-slate-200')}`}>
                                                    {!isDebitMove && cfg.debit !== null ? fmt(move.amount) : ''}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${
                                                    move.balance_after > 0 ? (isDark ? 'text-red-400' : 'text-red-600')
                                                    : move.balance_after < 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                                    : (isDark ? 'text-slate-400' : 'text-slate-500')
                                                }`}>
                                                    {fmt(Math.abs(move.balance_after))}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Pagination data={moves} />
            </div>
        </AuthenticatedLayout>
    );
}
