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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Cuentas Corrientes y Pagos
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Historial de cargos y pagos.
                        </p>
                    </div>

                    <Link href={route('lab-account-moves.create')}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-md">
                            <Plus size={18} />
                            Registrar Pago
                        </button>
                    </Link>
                </div>

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
                            className={`block w-full pl-10 pr-3 py-2 border rounded-xl
                                ${isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-900'}
                            `}
                        />
                    </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <table className="w-full text-sm">

                        <thead className={`${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
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

                                        <td className="px-6 py-4">
                                            {formatDate(move.move_date)}
                                        </td>

                                        <td className="px-6 py-4 font-bold flex gap-2 items-center">
                                            <Building2 size={14}/>
                                            {dentist
                                                ? `${dentist.name} ${dentist.last_name || ''}`
                                                : 'N/A'}
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
                                                    <ArrowDownRight size={12}/> Pago
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-600 font-bold">
                                                    <ArrowUpRight size={12}/> Cargo
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

                                        <td className="px-6 py-4 text-center">
                                            <Link href={route('lab-account-moves.show', move.id)}>
                                                <Receipt size={16}/>
                                            </Link>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}