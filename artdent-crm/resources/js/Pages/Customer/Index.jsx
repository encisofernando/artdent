import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, CreditCard, Download } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Trigger Inertia visit when search changes
    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '')) {
            router.get(
                route('customers.index'),
                { search: debouncedSearch },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, filters?.search]);

    const B = {
        blue: "#397B9C",
        green: "#5AAD9C",
        teal: "#49949C"
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clientes" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Clientes
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Gestión del padrón de clientes y clínicas
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors flex-1 sm:flex-none
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-48
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <a href={route('export.customers')} className="hidden sm:block">
                            <Button variant="outline" className="rounded-xl gap-2">
                                <Download size={15} />
                                CSV
                            </Button>
                        </a>

                        <Link href={route('customers.create')}>
                            <Button
                                className="text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl whitespace-nowrap"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-1 sm:mr-2" size={18} />
                                <span className="hidden sm:inline">Nuevo Cliente</span>
                                <span className="sm:hidden">Nuevo</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile cards — sm:hidden */}
                <div className="sm:hidden flex flex-col gap-3">
                    {data.length === 0 ? (
                        <div className={`rounded-2xl border p-10 text-center text-sm ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                            No se encontraron clientes.
                        </div>
                    ) : data.map((item) => (
                        <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                            <div className="p-4">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.green})` }}>
                                            {item.name?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</p>
                                            {item.dni && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DNI {item.dni}</p>}
                                        </div>
                                    </div>
                                    {item.is_active !== 0 ? (
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Activo</span>
                                    ) : (
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>Inactivo</span>
                                    )}
                                </div>
                                {(item.email || item.phone) && (
                                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {[item.email, item.phone].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                                <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <Link href={route('customers.account', item.id)}>
                                        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}>
                                            <CreditCard size={13} /> Cta. Cte.
                                        </button>
                                    </Link>
                                    <Link href={route('customers.edit', item.id)}>
                                        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                            <Edit size={13} /> Editar
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Container — hidden on mobile */}
                <div className={`hidden sm:block rounded-2xl border shadow-sm overflow-hidden transition-colors
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left align-middle">
                            <thead className={`text-xs uppercase font-bold tracking-wider
                                ${isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-500'}
                            `}>
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Documento</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors
                                ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}
                            `}>
                                {data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`group transition-colors
                                            ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}
                                        `}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.green})` }}
                                                >
                                                    {item.name?.charAt(0).toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                        {item.name}
                                                    </div>
                                                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {item.city ? `${item.city}, ${item.province}` : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.email || '-'}</div>
                                            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {item.dni || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.is_active !== 0 ? (
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md
                                                    ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}
                                                `}>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md
                                                    ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}
                                                `}>
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('customers.account', item.id)}
                                                    title="Cuenta Corriente">
                                                    <button className={`p-1.5 rounded-lg transition-colors
                                                        ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-teal-400' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-600'}
                                                    `}>
                                                        <CreditCard size={18} />
                                                    </button>
                                                </Link>
                                                <Link href={route('customers.edit', item.id)}>
                                                    <button className={`p-1.5 rounded-lg transition-colors
                                                        ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                                                    `}>
                                                        <Edit size={18} />
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={`px-6 py-12 text-center text-sm
                                            ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                        `}>
                                            No se encontraron clientes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination data={items} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}