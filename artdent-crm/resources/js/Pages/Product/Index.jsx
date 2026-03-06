import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Power, Box as BoxIcon, FileText } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Trigger Inertia visit when search/status changes
    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || status !== (filters?.status || 'all')) {
            router.get(
                route('products.index'),
                { search: debouncedSearch, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, status, filters?.search, filters?.status]);

    const toggleStatus = (item) => {
        // Toggle the active status via an update (simulated or actual)
        router.put(route('products.update', item.id), {
            ...item,
            is_active: item.is_active ? 0 : 1,
        }, { preserveScroll: true });
    };

    const B = {
        blue: "#397B9C",
        green: "#5AAD9C",
        teal: "#49949C"
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Productos" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Productos
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Gestión del catálogo de artículos
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar nombre, SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        {/* Status Filters */}
                        <div className={`flex items-center p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                        `}>
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'active', label: 'Activos' },
                                { id: 'inactive', label: 'Inactivos' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatus(tab.id)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all
                                        ${status === tab.id
                                            ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                            : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                                        }
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <Link href={route('products.create')} className="w-full sm:w-auto">
                            <Button
                                className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2" size={18} />
                                Nuevo Producto
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Counter Tag */}
                {items?.total > 0 && (
                    <div className="flex">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block
                            ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}
                        `}>
                            {items.to} de {items.total} productos
                        </div>
                    </div>
                )}

                {/* Grid Container */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <BoxIcon size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {search ? 'Sin resultados' : 'No hay productos'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search ? 'Probá con otros términos de búsqueda' : 'Comenzá creando tu primer artículo para el sistema'}
                        </p>
                        {!search && (
                            <Link href={route('products.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Crear Producto
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.map((item) => (
                            <div
                                key={item.id}
                                className={`relative flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}
                                `}
                            >
                                {/* Inactive Overlay */}
                                {!item.is_active && (
                                    <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 p-4">
                                        <div className="px-2 py-0.5 rounded border border-red-500/40 bg-red-500/20 text-red-500 font-bold text-[10px] tracking-wider">
                                            INACTIVO
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => toggleStatus(item)}
                                            style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                                            className="text-white border-none rounded-lg shadow-lg font-bold text-xs"
                                        >
                                            <Power className="mr-1.5" size={14} />
                                            Activar
                                        </Button>
                                    </div>
                                )}

                                {/* Image Section */}
                                <div className={`h-36 relative flex items-center justify-center overflow-hidden
                                    ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}
                                `}>
                                    {item.product_images && item.product_images.length > 0 ? (
                                        <img
                                            src={item.product_images.find(img => img.is_cover)?.url || item.product_images[0].url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FileText size={40} className={isDark ? 'text-slate-700' : 'text-slate-300'} />
                                    )}

                                    {/* Action buttons (top right) */}
                                    <div className="absolute top-2 right-2 flex gap-1 z-20">
                                        <Link href={route('products.edit', item.id)}>
                                            <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors backdrop-blur-md
                                                ${isDark ? 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700' : 'bg-white/90 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm'}
                                            `}>
                                                <Edit size={14} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-4 flex flex-col">
                                    <div className={`text-[10px] font-bold tracking-wider mb-1
                                        ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                    `}>
                                        {item.sku || 'SIN SKU'}
                                    </div>

                                    <h3 className={`font-bold text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem]
                                        ${isDark ? 'text-slate-200' : 'text-slate-800'}
                                    `}>
                                        {item.name}
                                    </h3>

                                    <div className="mt-auto">
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-lg font-extrabold" style={{ color: B.blue }}>
                                                ${Number(item.price || 0).toLocaleString('es-AR')}
                                            </span>
                                        </div>

                                        {item.is_active ? (
                                            <div className="inline-flex items-center px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-wider">
                                                ACTIVO
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center mt-4">
                        <div className={`flex gap-1 p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                        `}>
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
                                        preserveScroll
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
        </AuthenticatedLayout>
    );
}