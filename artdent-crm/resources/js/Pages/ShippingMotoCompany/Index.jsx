import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Bike, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const changed =
            debouncedSearch !== (filters?.search || '') ||
            status !== (filters?.status || 'all');
        if (changed) {
            router.get(route('shipping-moto-companies.index'), { search: debouncedSearch, status }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }
    }, [debouncedSearch, status]);

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar esta empresa de moto mandados? Esta acción no se puede deshacer.', () => {
            router.delete(route('shipping-moto-companies.destroy', id), { preserveScroll: true });
        });
    };

    const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
    const card = `rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inp = `rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20 placeholder-slate-500'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20 placeholder-slate-400'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Moto Mandados" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #397B9C, #49949C)' }}>
                            <Bike size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Moto Mandados
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Empresas de moto mandados disponibles en Formosa Capital
                            </p>
                        </div>
                    </div>
                    <Link href={route('shipping-moto-companies.create')}>
                        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                            <Plus size={16} /> Nueva empresa
                        </Button>
                    </Link>
                </div>

                <div className={`${card} p-4 flex flex-wrap gap-3`}>
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            className={`${inp} w-full pl-9`}
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <SearchableSelect
                        value={status}
                        onChange={v => setStatus(v)}
                        options={[
                            { value: 'all', label: 'Todos' },
                            { value: 'active', label: 'Activos' },
                            { value: 'inactive', label: 'Inactivos' },
                        ]}
                    />
                </div>

                {data.length === 0 ? (
                    <div className={`${card} p-12 text-center`}>
                        <Bike size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No hay empresas de moto mandados</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Creá la primera empresa.</p>
                    </div>
                ) : (<>
                    {/* Mobile cards */}
                    <div className="sm:hidden flex flex-col gap-3">
                        {data.map(item => (
                            <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <div style={{ height: 3, background: 'linear-gradient(90deg, #397B9C, #49949C)' }} />
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-bold text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.name}</p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.zone || 'Formosa Capital'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmt(item.price)}</p>
                                            {item.is_active ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle2 size={10} /> Activo</span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}><XCircle size={10} /> Inactivo</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.phone || '—'}</span>
                                        <div className="flex gap-1.5">
                                            <Link href={route('shipping-moto-companies.edit', item.id)}>
                                                <Button size="sm" variant="outline" className={`gap-1 text-xs ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}><Edit size={12} /> Editar</Button>
                                            </Link>
                                            <Button size="sm" variant="outline" className="gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleDelete(item.id)}><Trash2 size={12} /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className={`hidden sm:block ${card} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <th className="px-4 py-3 text-left">Empresa</th>
                                        <th className="px-4 py-3 text-left">Teléfono</th>
                                        <th className="px-4 py-3 text-left">Precio</th>
                                        <th className="px-4 py-3 text-left">Zona</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                <div className="flex items-center gap-2">
                                                    <Bike size={14} className="text-teal-500 shrink-0" />
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.phone || '—'}</td>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmt(item.price)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.zone || 'Formosa Capital'}</td>
                                            <td className="px-4 py-3 text-center">
                                                {item.is_active ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle2 size={10} /> Activo</span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}><XCircle size={10} /> Inactivo</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('shipping-moto-companies.edit', item.id)}>
                                                        <Button size="sm" variant="outline" className={`gap-1 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}>
                                                            <Edit size={13} /> Editar
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>)}

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}
