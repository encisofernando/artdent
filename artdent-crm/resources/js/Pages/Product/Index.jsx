import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Power, Box as BoxIcon, FileText, Loader2 } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import ImportExportModal from './ImportExportModal';
import axios from 'axios';

// Helper: fetch a page as plain JSON (bypasses Inertia).
// El controller devuelve JSON cuando detecta Accept: application/json
// y NO viene el header X-Inertia:true.
async function fetchPage(search, status, page) {
    const { data } = await axios.get(route('products.index'), {
        params: { search, status, page },
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    // El controller devuelve { items: PaginatorObject }
    return data.items;
}

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Infinite scroll state — se inicializa con los datos SSR de Inertia
    const [products, setProducts] = useState(items?.data || []);
    const [currentPage, setCurrentPage] = useState(items?.current_page || 1);
    const [lastPage, setLastPage] = useState(items?.last_page || 1);
    const [totalItems, setTotalItems] = useState(items?.total || 0);
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);

    const sentinelRef = useRef(null);

    const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

    // ── Debounce search ──────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    // ── Resetear lista cuando cambian los filtros ────────────────────────────
    useEffect(() => {
        // No ejecutar en el montaje inicial si los filtros coinciden con la SSR
        const isInitial =
            debouncedSearch === (filters?.search || '') &&
            status === (filters?.status || 'all');
        if (isInitial) return;

        setResetting(true);
        setProducts([]);

        fetchPage(debouncedSearch, status, 1)
            .then(page => {
                setProducts(page.data || []);
                setCurrentPage(page.current_page);
                setLastPage(page.last_page);
                setTotalItems(page.total);
            })
            .catch(console.error)
            .finally(() => setResetting(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, status]);

    // ── Cargar página siguiente ──────────────────────────────────────────────
    const loadMore = useCallback(() => {
        if (loading || resetting || currentPage >= lastPage) return;

        setLoading(true);

        fetchPage(debouncedSearch, status, currentPage + 1)
            .then(page => {
                setProducts(prev => [...prev, ...(page.data || [])]);
                setCurrentPage(page.current_page);
                setLastPage(page.last_page);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [loading, resetting, currentPage, lastPage, debouncedSearch, status]);

    // ── IntersectionObserver sobre el sentinel ───────────────────────────────
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) loadMore(); },
            { rootMargin: '300px' }   // empieza a cargar 300px antes del final
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    // ── Toggle activo/inactivo (optimistic) ──────────────────────────────────
    const toggleStatus = (item) => {
        const newStatus = item.is_active ? 0 : 1;

        setProducts(prev =>
            prev.map(p => p.id === item.id ? { ...p, is_active: newStatus } : p)
        );

        router.put(
            route('products.update', item.id),
            { name: item.name, price: item.price, is_active: newStatus },
            {
                preserveScroll: true,
                onError: () =>
                    setProducts(prev =>
                        prev.map(p => p.id === item.id ? { ...p, is_active: item.is_active } : p)
                    ),
            }
        );
    };

    const hasMore = currentPage < lastPage;

    // ────────────────────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Productos" />

            <div className="flex flex-col gap-6 font-sans">

                {/* ── Header ─────────────────────────────────────────────── */}
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
                        {/* Search */}
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar nombre, SKU..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        {/* Status tabs */}
                        <div className={`flex items-center p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                        `}>
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'active', label: 'Activos' },
                                { id: 'inactive', label: 'Inactivos' },
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

                        {/* Buttons */}
                        <div className="flex w-full sm:w-auto gap-2">
                            <Button
                                onClick={() => setIsImportModalOpen(true)}
                                variant="outline"
                                className={`w-full sm:w-auto shadow-sm rounded-xl transition-all
                                    ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}
                                `}
                            >
                                <FileText className="mr-2" size={18} />
                                Importar/Exportar
                            </Button>

                            <Link href={route('products.create')} className="w-full sm:w-auto">
                                <Button
                                    className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                    style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                >
                                    <Plus className="mr-2" size={18} />
                                    Nuevo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <ImportExportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                />

                {/* Counter */}
                {(products.length > 0 || resetting) && (
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block
                            ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}
                        `}>
                            {products.length} de {totalItems} productos
                        </div>
                        {(loading || resetting) && (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                        )}
                    </div>
                )}

                {/* ── Grid ───────────────────────────────────────────────── */}
                {resetting ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} isDark={isDark} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState search={search} isDark={isDark} B={B} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map(item => (
                            <ProductCard
                                key={item.id}
                                item={item}
                                isDark={isDark}
                                B={B}
                                onToggle={toggleStatus}
                            />
                        ))}

                        {/* Skeletons al final mientras carga más */}
                        {loading && Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={`sk-${i}`} isDark={isDark} />
                        ))}
                    </div>
                )}

                {/* Sentinel invisible — el observer lo vigila */}
                <div ref={sentinelRef} className="h-1 w-full" />

                {/* Mensaje de fin */}
                {!hasMore && products.length > 0 && !loading && !resetting && (
                    <p className={`text-center text-xs pb-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        — {products.length} productos cargados —
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */

function ProductCard({ item, isDark, B, onToggle }) {
    return (
        <div className={`relative flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}
        `}>
            {!item.is_active && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 p-4">
                    <div className="px-2 py-0.5 rounded border border-red-500/40 bg-red-500/20 text-red-500 font-bold text-[10px] tracking-wider">
                        INACTIVO
                    </div>
                    <Button
                        size="sm"
                        onClick={() => onToggle(item)}
                        style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                        className="text-white border-none rounded-lg shadow-lg font-bold text-xs"
                    >
                        <Power className="mr-1.5" size={14} />
                        Activar
                    </Button>
                </div>
            )}

            <div className={`h-36 relative flex items-center justify-center overflow-hidden
                ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}
            `}>
                {item.product_images?.length > 0 ? (
                    <img
                        src={item.product_images.find(img => img.is_cover)?.url || item.product_images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FileText size={40} className={isDark ? 'text-slate-700' : 'text-slate-300'} />
                )}

                <div className="absolute top-2 right-2 z-20">
                    <Link href={route('products.edit', item.id)}>
                        <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors backdrop-blur-md
                            ${isDark ? 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700' : 'bg-white/90 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm'}
                        `}>
                            <Edit size={14} />
                        </button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col">
                <div className={`text-[10px] font-bold tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.sku || 'SIN SKU'}
                </div>

                <h3 className={`font-bold text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-2">
                        {item.has_variants ? (
                            <span className="text-sm font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded cursor-default">
                                Múltiples Opciones
                            </span>
                        ) : (
                            <span className="text-lg font-extrabold" style={{ color: B.blue }}>
                                ${Number(item.price || 0).toLocaleString('es-AR')}
                            </span>
                        )}
                    </div>
                    {item.is_active && (
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-wider">
                            ACTIVO
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard({ isDark }) {
    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden animate-pulse
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}
        `}>
            <div className={`h-36 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <div className="p-4 flex flex-col gap-3">
                <div className={`h-2 w-16 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </div>
        </div>
    );
}

function EmptyState({ search, isDark, B }) {
    return (
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
                {search ? 'Probá con otros términos de búsqueda' : 'Comenzá creando tu primer artículo'}
            </p>
            {!search && (
                <Link href={route('products.create')}>
                    <Button
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        className="text-white border-none rounded-xl"
                    >
                        <Plus className="mr-2" size={16} />
                        Crear Producto
                    </Button>
                </Link>
            )}
        </div>
    );
}