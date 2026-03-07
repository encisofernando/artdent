import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Plus,
    Search,
    Receipt,
    WalletCards,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    CalendarDays
} from 'lucide-react';

export default function Index({ auth, moves, filters }) {
    const { isDark } = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(
                    route('lab-account-moves.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuentas Corrientes - Laboratorio" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Cuentas Corrientes y Pagos
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Historial de cargos por trabajos y pagos recibidos de odontólogos.
                        </p>
                    </div>

                    <Link href={route('lab-account-moves.create')}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold text-sm shadow-md">
                            <Plus size={18} />
                            <span>Registrar Pago</span>
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por odontólogo o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-xl leading-5 bg-transparent placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors
                                ${isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-900'}
                            `}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className={`text-xs uppercase font-extrabold tracking-wider
                                ${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-50 text-slate-500'}
                            `}>
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Odontólogo / Clínica</th>
                                    <th className="px-6 py-4">Detalle</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                    <th className="px-6 py-4 text-right">Saldo Actual</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moves.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                <WalletCards size={48} className="mb-4 opacity-20" />
                                                <p className="text-base font-medium text-slate-500 dark:text-slate-400">No se encontraron movimientos.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    moves.data.map((move) => {
                                        const isCredit = move.type === 'credit'; // Pago a favor (reduce deuda)
                                        const isDebit = move.type === 'debit';   // Cargo (aumenta deuda)

                                        return (
                                            <tr key={move.id} className={`border-b last:border-0 transition-colors
                                                ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}
                                            `}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                                        <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                            {formatDate(move.move_date || move.created_at)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                        <Building2 size={16} className="text-blue-500/70" />
                                                        {move.lab_account?.dentist ? `${move.lab_account.dentist.name} ${move.lab_account.dentist.last_name || ''}`.trim() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                                        {move.description}
                                                    </div>
                                                    {move.payment_method && (
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            Modo: {move.payment_method.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isCredit ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <ArrowDownRight size={12} /> Pago Recibido
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                                                            <ArrowUpRight size={12} /> Cargo (Trabajo)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold
                                                    ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}
                                                `}>
                                                    {isCredit ? '-' : '+'}{formatCurrency(move.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-extrabold">
                                                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                                                        {formatCurrency(move.balance_after)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('lab-account-moves.show', move.id)}>
                                                            <button
                                                                title="Ver Recibo / Comprobante"
                                                                className={`p-2 rounded-lg transition-colors
                                                                ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}
                                                            `}>
                                                                <Receipt size={16} />
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {moves.data.length > 0 && (
                        <div className={`p-4 border-t flex items-center justify-between
                            ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}
                        `}>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Mostrando <span className="font-bold">{moves.from}</span> a <span className="font-bold">{moves.to}</span> de <span className="font-bold">{moves.total}</span> resultados
                            </div>

                            <div className="flex gap-1">
                                {moves.links.map((link, index) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');
                                    const isActive = link.active;
                                    const isDisabled = !link.url;

                                    if (isDisabled && !isPrevious && !isNext) return null;

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`
                                                flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors
                                                ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                                ${isActive
                                                    ? 'bg-emerald-600 text-white'
                                                    : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-200')}
                                            `}
                                            dangerouslySetInnerHTML={{
                                                __html: isPrevious ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
                                                    : isNext ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
                                                        : link.label
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
