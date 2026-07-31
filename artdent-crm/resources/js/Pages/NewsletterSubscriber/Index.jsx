import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, Download, Trash2, Mail } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, items, filters, total, activeCount }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '')) {
            router.get(
                route('newsletter-subscribers.index'),
                { search: debouncedSearch },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, filters?.search]);

    const handleDelete = (subscriber) => {
        confirmDialog(`¿Eliminar a ${subscriber.email} de la lista de suscriptores? Esta acción no se puede deshacer.`, () => {
            router.delete(route('newsletter-subscribers.destroy', subscriber.id), { preserveScroll: true });
        });
    };

    const exportUrl = route('newsletter-subscribers.export', filters?.search ? { search: filters.search } : {});

    const B = { blue: "#397B9C", green: "#5AAD9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Newsletter" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Mail size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Newsletter
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {activeCount} activo{activeCount === 1 ? '' : 's'} de {total} suscriptor{total === 1 ? '' : 'es'} en total
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors flex-1 sm:flex-none
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar por email o nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <a href={exportUrl}>
                            <Button variant="outline" className="rounded-xl gap-2">
                                <Download size={15} />
                                <span className="hidden sm:inline">CSV</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden flex flex-col gap-3">
                    {data.length === 0 ? (
                        <div className={`rounded-2xl border p-10 text-center text-sm ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                            No hay suscriptores.
                        </div>
                    ) : data.map((item) => (
                        <div key={item.id} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.email}</p>
                                    {item.name && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</p>}
                                </div>
                                {item.is_active ? (
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Activo</span>
                                ) : (
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>Baja</span>
                                )}
                            </div>
                            <div className={`flex items-center justify-between pt-3 mt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.created_at}</span>
                                <button onClick={() => handleDelete(item)}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-100 hover:text-red-600'}`}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className={`hidden sm:block rounded-2xl border shadow-sm overflow-hidden transition-colors
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left align-middle">
                            <thead className={`text-xs uppercase font-bold tracking-wider
                                ${isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-500'}
                            `}>
                                <tr>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Alta</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                {data.map((item) => (
                                    <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {item.email}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {item.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.is_active ? (
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                                                    Dado de baja
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {item.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleDelete(item)} title="Eliminar"
                                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-slate-100 hover:text-red-600'}`}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={`px-6 py-12 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            No hay suscriptores.
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
