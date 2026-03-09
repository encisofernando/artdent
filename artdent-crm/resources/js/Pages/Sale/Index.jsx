import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Eye, Receipt, TrendingUp, TrendingDown, Store, ShoppingBag, ListFilter } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, items, filters }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const B = {
        blue: "#397B9C",
        green: "#5AAD9C",
        teal: "#49949C",
        mint: "#ACD6CE",
        red: "#E63946"
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || status !== (filters?.status || 'all')) {
            router.get(
                route('sales.index'),
                { search: debouncedSearch, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, status, filters?.search, filters?.status]);

    const StatusBadge = ({ status }) => {
        const config = {
            'cancelled':  { label: 'Anulada',     bg: 'bg-red-500/10 text-red-600 border-red-500/20' },
            'invoiced':   { label: 'Facturada',   bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            'confirmed':  { label: 'Confirmada',  bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            'draft':      { label: 'Borrador',    bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400' },
            'paid':       { label: 'Pagada',      bg: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
            'completed':  { label: 'Completada',  bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
        };
        const c = config[status?.toLowerCase()] || config['draft'];
        return (
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold tracking-wide ${c.bg}`}>
                {c.label}
            </div>
        );
    };

    const KpiCard = ({ title, value, subtitle, icon: Icon, color }) => (
        <div className={`relative overflow-hidden rounded-2xl border p-5 transition-transform hover:-translate-y-1
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100 shadow-sm'}
        `}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 flex items-center justify-center" style={{ backgroundColor: color }}>
                <Icon size={32} color={color} />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
            <div className="text-2xl font-extrabold mb-1" style={{ color }}>{value}</div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
        </div>
    );

    const pageTotal = data.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const pagePaid  = data.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0);
    const pageDue   = pageTotal - pagePaid;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Control de Ventas" />

            {/* ── Fixed viewport shell ─────────────────────────────────────── */}
            <div className={`fixed inset-0 top-16 z-[5] overflow-hidden transition-all duration-300
                ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
            `}>

                {/* ── Scrollable content area ── */}
                <div className={`h-full overflow-y-auto ${isDark ? 'bg-[#0b1520]' : 'bg-slate-50'}`}
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(73,148,156,0.2) transparent' }}>

                    {/* ── pb-20 deja espacio al FAB en mobile ── */}
                    <div className="flex flex-col gap-6 font-sans p-4 sm:p-6 pb-24 sm:pb-8">

                        {/* ══ Header Section — original intacto ══ */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                                    <Receipt size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-2xl font-extrabold tracking-tight leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        Control de Ventas
                                    </h1>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Historial de operaciones POS y E-commerce
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {/* Search */}
                                <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                                    ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                                `}>
                                    <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                    <input
                                        type="text"
                                        placeholder="Buscar comprobante..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                            ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                        `}
                                    />
                                </div>

                                {/* Status tabs — desktop */}
                                <div className={`hidden md:flex items-center p-1 rounded-xl border
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                                `}>
                                    {[
                                        { id: 'all',       label: 'Todas'    },
                                        { id: 'paid',      label: 'Pagadas'  },
                                        { id: 'draft',     label: 'Borrador' },
                                        { id: 'cancelled', label: 'Anuladas' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setStatus(tab.id)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
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

                                {/* Nueva Venta — desktop */}
                                <Link href={route('sales.create')} className="hidden sm:block w-full sm:w-auto">
                                    <Button
                                        className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                    >
                                        <Plus className="mr-2" size={18} />
                                        Nueva Venta
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* ══ KPI Strip — original intacto ══ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard title="Operaciones"     value={items?.total || 0}                          subtitle="en este período"        color={B.blue}                        icon={Store}      />
                            <KpiCard title="Facturado"       value={`$${pageTotal.toLocaleString('es-AR')}`}    subtitle="total en esta página"   color={B.green}                       icon={Receipt}    />
                            <KpiCard title="Cobrado"         value={`$${pagePaid.toLocaleString('es-AR')}`}     subtitle="pagado en esta página"  color={B.teal}                        icon={TrendingUp} />
                            <KpiCard title="Saldo Pendiente" value={`$${pageDue.toLocaleString('es-AR')}`}      subtitle={pageDue > 0 ? "por cobrar" : "todo cobrado"} color={pageDue > 0 ? B.red : B.mint} icon={pageDue > 0 ? TrendingDown : TrendingUp} />
                        </div>

                        {/* ══ Mobile cards — solo mobile ══ */}
                        <div className="sm:hidden flex flex-col gap-3">
                            {data.length === 0 ? (
                                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    No se encontraron ventas.
                                </div>
                            ) : data.map((item) => {
                                const saldo = Number(item.total || 0) - Number(item.paid_amount || 0);
                                return (
                                    <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        {/* Accent line */}
                                        <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                        <div className="p-4">
                                            {/* Row 1: número | total */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm truncate" style={{ color: B.teal }}>
                                                        {item.sale_number || `VNT-${item.id.toString().padStart(5, '0')}`}
                                                    </p>
                                                    <div className="mt-1.5">
                                                        <StatusBadge status={item.status} />
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                        $ {Number(item.total).toLocaleString('es-AR')}
                                                    </p>
                                                    <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                                                        Cobrado $ {Number(item.paid_amount || 0).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Date + items */}
                                            <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {item.sold_at ? new Date(item.sold_at).toLocaleDateString('es-AR') : new Date(item.created_at).toLocaleDateString('es-AR')}
                                                {item.sale_items?.length > 0 && ` · ${item.sale_items.length} ítem${item.sale_items.length > 1 ? 's' : ''}`}
                                            </p>
                                            {/* Row 2: saldo | ver */}
                                            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <span className={`text-sm font-semibold ${saldo > 0 ? 'text-red-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                                    {saldo > 0 ? `Saldo $${saldo.toLocaleString('es-AR')}` : 'Saldado ✓'}
                                                </span>
                                                <Link href={route('sales.show', item.id)}>
                                                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                                        ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                                    `}>
                                                        <Eye size={13} /> Ver
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ══ Main Table — solo desktop, original intacto ══ */}
                        <div className={`hidden sm:block rounded-2xl border shadow-sm overflow-hidden
                            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                        `}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className={`text-xs uppercase font-bold tracking-wider
                                        ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/50' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}
                                    `}>
                                        <tr>
                                            <th className="px-6 py-4"># Comprobante</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Cobrado</th>
                                            <th className="px-6 py-4">Saldo</th>
                                            <th className="px-6 py-4">Estado</th>
                                            <th className="px-6 py-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {data.length > 0 ? data.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className={`px-6 py-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.sale_number || `VNT-${item.id.toString().padStart(5, '0')}`}
                                                </td>
                                                <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {item.sold_at ? new Date(item.sold_at).toLocaleDateString('es-AR') : new Date(item.created_at).toLocaleDateString('es-AR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                            C
                                                        </div>
                                                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                                            Consumidor Final
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold" style={{ color: B.blue }}>
                                                    ${Number(item.total).toLocaleString('es-AR')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-emerald-500">
                                                    ${Number(item.paid_amount || 0).toLocaleString('es-AR')}
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${Number(item.total) - Number(item.paid_amount || 0) > 0 ? 'text-red-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                                    ${(Number(item.total) - Number(item.paid_amount || 0)).toLocaleString('es-AR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link href={route('sales.show', item.id)}>
                                                        <button className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors
                                                            ${isDark ? 'bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-slate-200'}
                                                        `}>
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    No se encontraron ventas para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ══ Pagination — original intacto ══ */}
                        {items?.links && items.links.length > 3 && (
                            <div className="flex justify-center mt-2">
                                <div className={`flex gap-1 p-1 rounded-xl border
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                                `}>
                                    {items.links.map((link, i) => {
                                        if (!link.url && !link.active) {
                                            return (
                                                <span key={i} className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                                            );
                                        }
                                        return (
                                            <Link key={i} href={link.url} preserveScroll
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

                    </div>{/* /content padding */}
                </div>{/* /scrollable */}

                {/* ══ FAB — mobile only ══════════════════════════════════════ */}
                <Link href={route('sales.create')} className="sm:hidden">
                    <button
                        style={{
                            position: 'fixed', bottom: 22, right: 20, zIndex: 40,
                            width: 56, height: 56, borderRadius: '50%', border: 'none',
                            background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 28px rgba(57,123,156,0.45)',
                            cursor: 'pointer', transition: 'transform .15s',
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                        onMouseUp={e => e.currentTarget.style.transform = ''}
                        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
                        onTouchEnd={e => e.currentTarget.style.transform = ''}
                    >
                        <Plus size={26} />
                    </button>
                </Link>

            </div>{/* /shell */}
        </AuthenticatedLayout>
    );
}