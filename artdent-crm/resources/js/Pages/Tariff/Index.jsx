import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Banknote, List } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Index({ auth, items, categories, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || category !== (filters?.category || 'all')) {
            router.get(
                route('tariffs.index'),
                { search: debouncedSearch, category: category },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, category, filters]);

    const handleDelete = (id) => {
        confirmDialog('¿Estás seguro de que deseas eliminar este arancel?', () => {
            router.delete(route('tariffs.destroy', id), { preserveScroll: true });
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Aranceles (Lista de Precios)" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Aranceles Base
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Catálogo de trabajos de laboratorio y sus precios predeterminados
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <SearchableSelect
                            value={category}
                            onChange={v => setCategory(v)}
                            options={[
                                { value: 'all', label: 'Todas las Categorías' },
                                ...(categories || []).map(cat => ({ value: cat, label: cat })),
                            ]}
                        />

                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar arancel..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-64
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <Link href={route('tariffs.create')} className="w-full sm:w-auto">
                            <Button
                                className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2" size={18} />
                                Nuevo Arancel
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <Banknote size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {search || category !== 'all' ? 'Sin resultados' : 'Lista vacía'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search || category !== 'all' ? 'Probá con otros filtros de búsqueda' : 'Registrá los trabajos de laboratorio para usarlos en las órdenes de trabajo.'}
                        </p>
                        {(!search && category === 'all') && (
                            <Link href={route('tariffs.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Crear Arancel
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className={`rounded-2xl border overflow-hidden shadow-sm
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                    `}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className={`text-xs uppercase font-bold
                                    ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/60' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}
                                `}>
                                    <tr>
                                        <th className="px-5 py-4">Descripción / Trabajo</th>
                                        <th className="px-5 py-4">Categoría</th>
                                        <th className="px-5 py-4 text-right">Precio Base</th>
                                        <th className="px-5 py-4 text-center">Estado</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id} className={`border-b transition-colors
                                            ${isDark ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}
                                        `}>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.code && (
                                                        <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            Cod: {item.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.category ? (
                                                    <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg w-fit
                                                        ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}
                                                    `}>
                                                        <List size={14} />
                                                        {item.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className={`px-5 py-4 text-right font-bold
                                                ${isDark ? 'text-emerald-400' : 'text-emerald-700'}
                                            `}>
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg
                                                    ${item.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                                                `}>
                                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={route('tariffs.edit', item.id)}>
                                                        <button className={`p-2 rounded-lg transition-colors
                                                            ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                                                        `}>
                                                            <Edit size={16} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className={`p-2 rounded-lg transition-colors
                                                        ${isDark ? 'text-red-400 hover:bg-red-900/40' : 'text-red-500 hover:bg-red-50'}
                                                    `}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
