import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Package, Download, AlertTriangle, XCircle, BarChart3, Layers } from 'lucide-react';
import Pagination from '@/Components/Pagination';

const B = { blue: '#397B9C', teal: '#49949C', green: '#5AAD9C' };

const ARS = (v) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v ?? 0);

const N = (v, d = 2) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v ?? 0);

const STATUS_CONFIG = {
    ok:  { label: 'OK',           color: 'text-emerald-600 bg-emerald-50',  darkColor: 'text-emerald-400 bg-emerald-900/30' },
    low: { label: 'Bajo mínimo',  color: 'text-amber-600  bg-amber-50',     darkColor: 'text-amber-400  bg-amber-900/30'   },
    out: { label: 'Sin stock',    color: 'text-red-600    bg-red-50',       darkColor: 'text-red-400    bg-red-900/30'     },
};

function SummaryCard({ title, value, sub, color, icon: Icon, isDark }) {
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
                    {sub && <p className={`text-xs mt-1 ${muted}`}>{sub}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, color }}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function Valuation({ summary, items, warehouses, categories, filters }) {
    const { isDark } = useTheme();
    const card   = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
    const muted  = isDark ? 'text-slate-400' : 'text-slate-500';
    const text   = isDark ? 'text-white' : 'text-slate-900';
    const thead  = isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500';
    const rowCls = isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50';
    const inputCls = `rounded-xl border px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`;

    const [warehouseId,  setWarehouseId]  = useState(filters.warehouse_id  || '');
    const [categoryId,   setCategoryId]   = useState(filters.category_id   || '');
    const [lowStockOnly, setLowStockOnly] = useState(filters.low_stock_only || false);

    const applyFilters = () =>
        router.get(route('stocks.valuation'), {
            warehouse_id:  warehouseId  || undefined,
            category_id:   categoryId   || undefined,
            low_stock_only: lowStockOnly || undefined,
        }, { preserveState: true, replace: true });

    const exportUrl = new URL(route('stocks.export'), window.location.origin);
    if (warehouseId)  exportUrl.searchParams.set('warehouse_id', warehouseId);
    if (categoryId)   exportUrl.searchParams.set('category_id', categoryId);
    if (lowStockOnly) exportUrl.searchParams.set('low_stock', '1');

    return (
        <AuthenticatedLayout>
            <Head title="Valorización de Inventario" />

            <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Layers size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Valorización de Inventario</h1>
                            <p className={`text-sm ${muted}`}>Valor total del stock a costo, por producto y depósito</p>
                        </div>
                    </div>
                    <a href={exportUrl.toString()}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Download size={15} /> Exportar CSV
                    </a>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <SummaryCard title="Valor Total" value={ARS(summary.total_value)} color={B.blue} icon={BarChart3} isDark={isDark} />
                    <SummaryCard title="Total SKUs" value={N(summary.total_skus, 0)} color={B.teal} icon={Package} isDark={isDark} />
                    <SummaryCard title="Unidades" value={N(summary.total_units, 0)} color={B.green} icon={Package} isDark={isDark} />
                    <SummaryCard title="Bajo mínimo" value={summary.low_stock_count} color="#F59E0B" icon={AlertTriangle} isDark={isDark} sub="productos" />
                    <SummaryCard title="Sin stock" value={summary.out_of_stock_count} color="#EF4444" icon={XCircle} isDark={isDark} sub="productos" />
                </div>

                {/* Filters */}
                <div className={`${card} p-4 flex flex-wrap items-end gap-3`}>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Depósito</label>
                        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className={inputCls}>
                            <option value="">Todos</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    {categories.length > 0 && (
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Categoría</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                                <option value="">Todas</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                    <label className={`flex items-center gap-2 text-sm font-medium ${muted} cursor-pointer`}>
                        <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)}
                            className="w-4 h-4 rounded accent-amber-500" />
                        Solo bajo mínimo
                    </label>
                    <button onClick={applyFilters}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        Filtrar
                    </button>
                </div>

                {/* Table */}
                <div className={`${card} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`text-xs font-bold uppercase tracking-wider ${thead}`}>
                                    <th className="px-4 py-3 text-left">Producto</th>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Categoría</th>
                                    <th className="px-4 py-3 text-left hidden lg:table-cell">Depósito</th>
                                    <th className="px-4 py-3 text-right">Stock</th>
                                    <th className="px-4 py-3 text-right hidden sm:table-cell">Mínimo</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right hidden md:table-cell">Costo Unit.</th>
                                    <th className="px-4 py-3 text-right hidden md:table-cell">Precio</th>
                                    <th className="px-4 py-3 text-right font-bold">Valor Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className={`text-center py-12 ${muted}`}>
                                            No se encontraron productos con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : items.data.map((item, i) => {
                                    const st  = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ok;
                                    const cls = isDark ? st.darkColor : st.color;
                                    return (
                                        <tr key={i} className={`border-t ${rowCls}`}>
                                            <td className={`px-4 py-3 font-semibold ${text} max-w-[200px] truncate`}>{item.product_name}</td>
                                            <td className={`px-4 py-3 text-xs font-mono ${muted}`}>{item.sku || '—'}</td>
                                            <td className={`px-4 py-3 text-xs hidden md:table-cell ${muted}`}>{item.category_name || '—'}</td>
                                            <td className={`px-4 py-3 text-xs hidden lg:table-cell ${muted}`}>{item.warehouse_name}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${text}`}>{N(item.quantity, 2)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums text-xs hidden sm:table-cell ${muted}`}>{item.min_quantity > 0 ? N(item.min_quantity, 0) : '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold ${cls}`}>{st.label}</span>
                                            </td>
                                            <td className={`px-4 py-3 text-right tabular-nums text-xs hidden md:table-cell ${muted}`}>{item.cost_price > 0 ? ARS(item.cost_price) : '—'}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums text-xs hidden md:table-cell ${muted}`}>{ARS(item.price)}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${item.stock_value > 0 ? text : muted}`}>
                                                {item.cost_price > 0 ? ARS(item.stock_value) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                        <Pagination data={items} />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
