import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, items, totalDebt, totalCredit, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [search, setSearch] = useState(filters?.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        router.get(
            route('proveedores.ctacte.index'),
            { search: debouncedSearch },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [debouncedSearch]);

    const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuentas Corrientes de Proveedores" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Cuentas Corrientes
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Estado de deuda con cada proveedor
                    </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                            <TrendingUp size={22} className={isDark ? 'text-red-400' : 'text-red-500'} />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Total Deuda
                            </p>
                            <p className={`text-2xl font-extrabold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {fmt(totalDebt)}
                            </p>
                        </div>
                    </div>
                    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                            <TrendingDown size={22} className={isDark ? 'text-emerald-400' : 'text-emerald-500'} />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Saldo a Favor
                            </p>
                            <p className={`text-2xl font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {fmt(totalCredit)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className={`flex items-center px-4 py-2.5 rounded-xl border w-full max-w-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                    />
                </div>

                {/* Table */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <BookOpen size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Sin cuentas corrientes
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Las cuentas se crean automáticamente al registrar comprobantes o pagos
                        </p>
                    </div>
                ) : (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <th className="px-4 py-3 text-left">Proveedor</th>
                                        <th className="px-4 py-3 text-right">Saldo</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-center">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.map(account => {
                                        const isDebt = account.balance > 0;
                                        const isCredit = account.balance < 0;
                                        return (
                                            <tr key={account.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {account.vendor?.name ?? '—'}
                                                    {account.vendor?.cuit && (
                                                        <span className={`block text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            CUIT: {account.vendor.cuit}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-3 text-right text-lg font-extrabold ${
                                                    isDebt ? (isDark ? 'text-red-400' : 'text-red-600')
                                                    : isCredit ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                                    : (isDark ? 'text-slate-400' : 'text-slate-500')
                                                }`}>
                                                    {fmt(Math.abs(account.balance))}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {account.balance === 0 ? (
                                                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                            Al día
                                                        </span>
                                                    ) : isDebt ? (
                                                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                            Deuda
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                            A favor
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Link href={route('proveedores.ctacte.show', account.vendor_id)}>
                                                        <button className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                            Ver movimientos
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}
