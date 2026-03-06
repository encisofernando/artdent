import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Eye, Receipt, TrendingUp, TrendingDown, Store, ShoppingBag, ListFilter } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
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

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Trigger Inertia visit when filters change
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
            'cancelled': { label: 'Anulada', color: B.red, bg: 'bg-red-500/10 text-red-600 border-red-500/20' },
            'invoiced': { label: 'Facturada', color: B.green, bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            'confirmed': { label: 'Confirmada', color: B.blue, bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            'draft': { label: 'Borrador', color: '#64748b', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400' },
            'paid': { label: 'Pagada', color: B.teal, bg: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
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

    // Calculate quick stats from current page for demo purposes
    // Ideally this would come from the backend total aggregations
    const pageTotal = data.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const pagePaid = data.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0);
    const pageDue = pageTotal - pagePaid;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Control de Ventas" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header Section */}
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

                        {/* Status Filters */}
                        <div className={`hidden md:flex items-center p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                        `}>
                            {[
                                { id: 'all', label: 'Todas' },
                                { id: 'paid', label: 'Pagadas' },
                                { id: 'draft', label: 'Borrador' },
                                { id: 'cancelled', label: 'Anuladas' }
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

                        <Link href={route('sales.create')} className="w-full sm:w-auto">
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

                {/* KPI Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Operaciones" value={items?.total || 0} subtitle="en este período" color={B.blue} icon={Store} />
                    <KpiCard title="Facturado" value={`$${pageTotal.toLocaleString('es-AR')}`} subtitle="total en esta página" color={B.green} icon={Receipt} />
                    <KpiCard title="Cobrado" value={`$${pagePaid.toLocaleString('es-AR')}`} subtitle="pagado en esta página" color={B.teal} icon={TrendingUp} />
                    <KpiCard title="Saldo Pendiente" value={`$${pageDue.toLocaleString('es-AR')}`} subtitle={pageDue > 0 ? "por cobrar" : "todo cobrado"} color={pageDue > 0 ? B.red : B.mint} icon={pageDue > 0 ? TrendingDown : TrendingUp} />
                </div>

                {/* Main Table */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden
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
                                    <tr key={item.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
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

                {/* Pagination */}
                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center mt-2">
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
