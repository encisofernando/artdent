import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { DollarSign, Download, TrendingUp, TrendingDown } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function CostosGanancias({ rows, totals, filters }) {
    const { isDark } = useTheme();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputCls = `rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyFilters = () => router.get(route('reportes.costos-ganancias'), { from, to }, { preserveState: true, replace: true });

    const marginPct = totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Costos y Ganancias" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Costos y Ganancias</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Margen por artículo vendido, neto de devoluciones</p>
                        </div>
                    </div>
                    <a href={route('reportes.costos-ganancias.export', { from, to })}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Download size={15} /> Exportar CSV
                    </a>
                </div>

                <div className={`${card} p-4 flex flex-wrap items-end gap-3`}>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Desde</label>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hasta</label>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
                    </div>
                    <button onClick={applyFilters} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        Filtrar
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ingresos</p>
                        <p className={`mt-1 text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(totals.revenue)}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Costo</p>
                        <p className={`mt-1 text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(totals.cost)}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Margen</p>
                        <div className="flex items-center gap-2 mt-1">
                            {totals.margin >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
                            <p className={`text-xl font-extrabold ${totals.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(totals.margin)}</p>
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({marginPct.toFixed(1)}%)</span>
                        </div>
                    </div>
                </div>

                <div className={`${card} overflow-hidden`}>
                    {rows.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay ventas de artículos con costo en este período.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Artículo</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cant.</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ingresos</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Costo</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Margen</th>
                                        <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>%</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {rows.map((row) => (
                                        <tr key={row.product_id ?? row.name} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {row.name}
                                                {row.sku && <span className={`block text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{row.sku}</span>}
                                            </td>
                                            <td className={`px-4 py-3 text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.qty}</td>
                                            <td className={`px-4 py-3 text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmt(row.revenue)}</td>
                                            <td className={`px-4 py-3 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmt(row.cost)}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${row.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(row.margin)}</td>
                                            <td className={`px-4 py-3 text-right text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.margin_pct}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
