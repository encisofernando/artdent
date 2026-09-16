import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    TrendingUp, TrendingDown, BarChart3,
    Download, ShoppingCart, Package, DollarSign, Users,
} from 'lucide-react';
import BarChart from '@/Components/Charts/BarChart';

const B = { blue: '#397B9C', teal: '#49949C', green: '#5AAD9C' };

const ARS = (v) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v ?? 0);

const N = (v, d = 0) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v ?? 0);

function pct(current, prev) {
    if (!prev || prev === 0) return null;
    return ((current - prev) / Math.abs(prev)) * 100;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, prev, color, icon: Icon, isDark }) {
    const delta = pct(value, prev);
    const positive = delta === null || delta >= 0;
    const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text  = isDark ? 'text-white' : 'text-slate-900';

    return (
        <div className={`rounded-2xl border p-5 shadow-sm relative overflow-hidden ${card}`}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${muted}`}>{title}</p>
                    <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                    {delta !== null && (
                        <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(delta).toFixed(1)}% vs período ant.
                        </div>
                    )}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, color }}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function VentasPorPeriodo({ series, compareSeries, totals, prevTotals, topProducts, filters }) {
    const { isDark } = useTheme();
    const card   = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
    const muted  = isDark ? 'text-slate-400' : 'text-slate-500';
    const text   = isDark ? 'text-white' : 'text-slate-900';
    const thead  = isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500';
    const rowCls = isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50';
    const inputCls = `rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`;

    const [from, setFrom]         = useState(filters.from);
    const [to, setTo]             = useState(filters.to);
    const [groupBy, setGroupBy]   = useState(filters.group_by || 'day');
    const [compare, setCompare]   = useState(filters.compare || false);

    const applyFilters = () =>
        router.get(route('reportes.ventas-por-periodo'), { from, to, group_by: groupBy, compare }, { preserveState: true, replace: true });

    // Chart data — current period bars
    const chartData = series.map(r => ({ name: r.label, value: r.revenue }));

    const GROUP_OPTIONS = [
        { key: 'day',   label: 'Por Día' },
        { key: 'month', label: 'Por Mes' },
        { key: 'year',  label: 'Por Año' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Ventas por Período" />

            <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <BarChart3 size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Ventas por Período</h1>
                            <p className={`text-sm ${muted}`}>Evolución de ventas, comparativas y productos más vendidos</p>
                        </div>
                    </div>
                    <a href={route('reportes.ventas-por-periodo.export', { from, to, group_by: groupBy })}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Download size={15} /> Exportar CSV
                    </a>
                </div>

                {/* Filters */}
                <div className={`${card} p-4 flex flex-wrap items-end gap-3`}>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Agrupación</label>
                        <div className="flex gap-1">
                            {GROUP_OPTIONS.map(opt => (
                                <button key={opt.key}
                                    onClick={() => setGroupBy(opt.key)}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                        groupBy === opt.key
                                            ? 'text-white border-transparent'
                                            : isDark
                                                ? 'border-slate-700 text-slate-400 hover:text-slate-200'
                                                : 'border-slate-200 text-slate-500 hover:text-slate-700'
                                    }`}
                                    style={groupBy === opt.key ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` } : {}}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${muted} cursor-pointer`}>
                        <input type="checkbox" checked={compare} onChange={e => setCompare(e.target.checked)}
                            className="w-4 h-4 rounded accent-teal-500" />
                        Comparar período anterior
                    </label>
                    <button onClick={applyFilters}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        Filtrar
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Total Ventas" value={ARS(totals.revenue)}
                        prev={prevTotals?.revenue} color={B.blue} icon={DollarSign} isDark={isDark} />
                    <KpiCard title="N° de Órdenes" value={N(totals.orders)}
                        prev={prevTotals?.orders} color={B.teal} icon={ShoppingCart} isDark={isDark} />
                    <KpiCard title="Ticket Promedio" value={ARS(totals.avg_ticket)}
                        prev={prevTotals?.avg_ticket} color={B.green} icon={TrendingUp} isDark={isDark} />
                    <KpiCard title="Unidades Vendidas" value={N(totals.units, 0)}
                        prev={prevTotals?.units} color="#7CA5C3" icon={Package} isDark={isDark} />
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                    <div className={`${card} p-5`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Evolución de Ventas (ARS)</h2>
                        <div style={{ height: 260 }}>
                            <BarChart data={chartData} isDark={isDark} />
                        </div>
                        {compareSeries.length > 0 && (
                            <p className={`text-xs mt-3 ${muted}`}>
                                ↑ Período actual &nbsp;|&nbsp; Período anterior: {ARS(prevTotals?.revenue)} en {prevTotals?.orders} ventas
                            </p>
                        )}
                    </div>
                )}

                {/* Detail Table */}
                <div className={`${card} overflow-hidden`}>
                    <div className="p-5 border-b" style={{ borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider ${muted}`}>Detalle por Período</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`text-xs font-bold uppercase tracking-wider ${thead}`}>
                                    <th className="px-4 py-3 text-left">Período</th>
                                    <th className="px-4 py-3 text-right">N° Ventas</th>
                                    <th className="px-4 py-3 text-right">Unidades</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-right">Ticket Prom.</th>
                                    {compareSeries.length > 0 && <th className="px-4 py-3 text-right">vs Anterior</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {series.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={`text-center py-10 ${muted}`}>
                                            No hay ventas en el período seleccionado.
                                        </td>
                                    </tr>
                                ) : series.map((row, i) => {
                                    const prevRow = compareSeries[i];
                                    const delta   = pct(row.revenue, prevRow?.revenue);
                                    const pos     = delta === null || delta >= 0;
                                    return (
                                        <tr key={row.period} className={`border-t ${rowCls}`}>
                                            <td className={`px-4 py-3 font-semibold ${text}`}>{row.label}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums ${muted}`}>{N(row.orders)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums ${muted}`}>{N(row.units, 1)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${text}`}>{ARS(row.revenue)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums ${muted}`}>
                                                {row.orders > 0 ? ARS(row.revenue / row.orders) : '—'}
                                            </td>
                                            {compareSeries.length > 0 && (
                                                <td className={`px-4 py-3 text-right text-xs font-bold ${pos ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {delta !== null ? (pos ? '▲' : '▼') + ' ' + Math.abs(delta).toFixed(1) + '%' : '—'}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                {topProducts.length > 0 && (
                    <div className={`${card} overflow-hidden`}>
                        <div className="p-5 border-b" style={{ borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                            <h2 className={`text-sm font-bold uppercase tracking-wider ${muted}`}>Top 10 Productos del Período</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`text-xs font-bold uppercase tracking-wider ${thead}`}>
                                        <th className="px-4 py-3 text-center w-10">#</th>
                                        <th className="px-4 py-3 text-left">Producto</th>
                                        <th className="px-4 py-3 text-left">SKU</th>
                                        <th className="px-4 py-3 text-right">Unidades</th>
                                        <th className="px-4 py-3 text-right">Ingresos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((p, i) => (
                                        <tr key={p.product_id ?? i} className={`border-t ${rowCls}`}>
                                            <td className={`px-4 py-3 text-center text-xs font-bold ${muted}`}>{i + 1}</td>
                                            <td className={`px-4 py-3 font-semibold ${text}`}>{p.product_name}</td>
                                            <td className={`px-4 py-3 text-xs ${muted}`}>{p.sku || '—'}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums ${muted}`}>{N(p.total_units, 1)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${text}`}>{ARS(p.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
