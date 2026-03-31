import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, ShoppingCart, TrendingUp, TrendingDown, Receipt, Tag } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', red: '#E63946' };

const ORDER_STATUSES = [
    { id: 'all',        label: 'Todos'       },
    { id: 'pending',    label: 'Pendiente'   },
    { id: 'confirmed',  label: 'Confirmado'  },
    { id: 'processing', label: 'En proceso'  },
    { id: 'shipped',    label: 'Enviado'     },
    { id: 'delivered',  label: 'Entregado'   },
    { id: 'cancelled',  label: 'Cancelado'   },
];

const PAYMENT_STATUSES = [
    { id: 'all',      label: 'Pago: Todos'     },
    { id: 'pending',  label: 'Pago: Pendiente' },
    { id: 'paid',     label: 'Pagado'          },
    { id: 'failed',   label: 'Fallido'         },
];

const STATUS_CONFIG = {
    pending:    { label: 'Pendiente',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20'   },
    confirmed:  { label: 'Confirmado', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20'       },
    processing: { label: 'En proceso', cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    shipped:    { label: 'Enviado',    cls: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    delivered:  { label: 'Entregado',  cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    cancelled:  { label: 'Cancelado',  cls: 'bg-red-500/10 text-red-600 border-red-500/20'          },
    refunded:   { label: 'Reembolsado',cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

const PAYMENT_CONFIG = {
    pending:  { label: 'Pendiente',   cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20'  },
    paid:     { label: 'Pagado',      cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    failed:   { label: 'Fallido',     cls: 'bg-red-500/10 text-red-600 border-red-500/20'         },
    refunded: { label: 'Reembolsado', cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

function StatusBadge({ value, config }) {
    const c = config[value] || { label: value, cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold tracking-wide ${c.cls}`}>{c.label}</span>;
}

function KpiCard({ title, value, subtitle, icon: Icon, color }) {
    const { isDark } = useTheme();
    return (
        <div className={`relative overflow-hidden rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: color }} />
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
            <div className="text-2xl font-extrabold mb-1" style={{ color }}>{value}</div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
        </div>
    );
}

export default function Index({ auth, items, filters, kpis }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const data = items?.data || [];

    const [search, setSearch]   = useState(filters?.search || '');
    const [status, setStatus]   = useState(filters?.status || 'all');
    const [payment, setPayment] = useState(filters?.payment || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const changed =
            debouncedSearch !== (filters?.search || '') ||
            status  !== (filters?.status  || 'all') ||
            payment !== (filters?.payment || 'all');
        if (changed) {
            router.get(route('ecommerce-orders.index'), { search: debouncedSearch, status, payment }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }
    }, [debouncedSearch, status, payment]);

    const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pedidos E-commerce" />

            <div className={`fixed top-16 right-0 left-0 bottom-14 lg:bottom-0 z-[5] overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>
                <div className={`h-full overflow-y-auto ${isDark ? 'bg-[#0b1520]' : 'bg-slate-50'}`}
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(73,148,156,0.2) transparent' }}>
                    <div className="flex flex-col gap-6 font-sans p-4 sm:p-6 pb-24 sm:pb-8">

                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                                    <ShoppingCart size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-2xl font-extrabold tracking-tight leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        Pedidos E-commerce
                                    </h1>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Gestión de órdenes de la tienda online
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Buscador */}
                                <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-64
                                    ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}`}>
                                    <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                    <input type="text" placeholder="Buscar pedido, cliente..."
                                        value={search} onChange={(e) => setSearch(e.target.value)}
                                        className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full
                                            ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} />
                                </div>

                                {/* Filtro estado pedido */}
                                <div className={`hidden md:flex items-center p-1 rounded-xl border
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                                    {ORDER_STATUSES.map(tab => (
                                        <button key={tab.id} onClick={() => setStatus(tab.id)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                                                ${status === tab.id
                                                    ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                                    : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Filtro pago */}
                                <div className={`hidden md:flex items-center p-1 rounded-xl border
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                                    {PAYMENT_STATUSES.map(tab => (
                                        <button key={tab.id} onClick={() => setPayment(tab.id)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                                                ${payment === tab.id
                                                    ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                                    : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard title="Total Pedidos"  value={kpis?.total_orders || 0}              subtitle="registrados"              color={B.blue}  icon={ShoppingCart} />
                            <KpiCard title="Facturado"      value={fmt(kpis?.total_billed)}              subtitle="activos (sin cancelados)"  color={B.green} icon={Receipt}      />
                            <KpiCard title="Cobrado"        value={fmt(kpis?.total_paid)}                subtitle="pago confirmado"           color={B.teal}  icon={TrendingUp}   />
                            <KpiCard title="Por Cobrar"     value={fmt(kpis?.total_pending)}             subtitle={kpis?.total_pending > 0 ? 'pago pendiente' : 'todo cobrado'} color={kpis?.total_pending > 0 ? B.red : B.mint} icon={kpis?.total_pending > 0 ? TrendingDown : TrendingUp} />
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden flex flex-col gap-3">
                            {data.length === 0 ? (
                                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    No se encontraron pedidos.
                                </div>
                            ) : data.map((item) => (
                                <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm truncate font-mono" style={{ color: B.teal }}>
                                                    #{item.order_number || item.id.toString().padStart(6, '0')}
                                                </p>
                                                <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.customer?.name || item.shipping_name || 'Cliente'}
                                                </p>
                                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                                    <StatusBadge value={item.status} config={STATUS_CONFIG} />
                                                    <StatusBadge value={item.payment_status} config={PAYMENT_CONFIG} />
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {fmt(item.total)}
                                                </p>
                                                {item.discount_amount > 0 && (
                                                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                                        <Tag size={8} /> -{fmt(item.discount_amount)}
                                                    </span>
                                                )}
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {fmtDate(item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {item.ecommerce_order_items_count || 0} ítem(s)
                                            </span>
                                            <Link href={route('ecommerce-orders.show', item.id)}>
                                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                                    ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <Eye size={13} /> Ver
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className={`hidden sm:block rounded-2xl border shadow-sm overflow-hidden
                            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className={`text-xs uppercase font-bold tracking-wider
                                        ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/50' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}`}>
                                        <tr>
                                            <th className="px-5 py-4"># Pedido</th>
                                            <th className="px-5 py-4">Fecha</th>
                                            <th className="px-5 py-4">Cliente</th>
                                            <th className="px-5 py-4">Ítems</th>
                                            <th className="px-5 py-4">Total</th>
                                            <th className="px-5 py-4">Estado</th>
                                            <th className="px-5 py-4">Pago</th>
                                            <th className="px-5 py-4 text-center">Ver</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {data.length > 0 ? data.map((item) => (
                                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-5 py-3.5 font-bold font-mono ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                                                    #{item.order_number || item.id.toString().padStart(6, '0')}
                                                </td>
                                                <td className={`px-5 py-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {fmtDate(item.created_at)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className={`font-semibold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                            {item.customer?.name || item.shipping_name || '—'}
                                                        </p>
                                                        {item.customer?.email && (
                                                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.customer.email}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-5 py-3.5 text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.ecommerce_order_items_count || 0}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-bold" style={{ color: B.blue }}>{fmt(item.total)}</div>
                                                    {item.discount_amount > 0 && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className={`text-[10px] line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmt(item.subtotal)}</span>
                                                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                                                <Tag size={8} /> {item.coupon?.code || 'Cupón'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge value={item.status} config={STATUS_CONFIG} />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge value={item.payment_status} config={PAYMENT_CONFIG} />
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <Link href={route('ecommerce-orders.show', item.id)}>
                                                        <button className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors
                                                            ${isDark ? 'bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-slate-200'}`}>
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    No se encontraron pedidos para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Paginación */}
                        {items?.links && items.links.length > 3 && (
                            <div className="flex justify-center mt-2">
                                <div className={`flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                                    {items.links.map((link, i) => {
                                        if (!link.url && !link.active) {
                                            return <span key={i} className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />;
                                        }
                                        return (
                                            <Link key={i} href={link.url} preserveScroll
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                                    ${link.active
                                                        ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                                        : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
