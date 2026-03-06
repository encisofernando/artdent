import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
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

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar cliente, DNI, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <Link href={route('customers.create')}>
                            <Button
                                className="text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2" size={18} />
                                Nuevo Cliente
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Table Container */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors
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

                    {/* Pagination */}
                    {items?.links && items.links.length > 3 && (
                        <div className={`px-6 py-4 border-t w-full flex items-center justify-center
                            ${isDark ? 'border-slate-700/60 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}
                        `}>
                            <div className="flex gap-1">
                                {items.links.map((link, i) => {
                                    if (!link.url && !link.active) {
                                        return (
                                            <span key={i} className={`px-3 py-1.5 rounded-lg text-sm
                                                ${isDark ? 'text-slate-600' : 'text-slate-400'}
                                            `} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                                ${link.active
                                                    ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                                    : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                                }
                                            `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
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