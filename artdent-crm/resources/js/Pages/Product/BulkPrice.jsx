import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import axios from 'axios';
import { TrendingUp, ArrowLeft, Search, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function BulkPrice({ categories, vendors, usdExchangeRate, usdProductsCount }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const confirmDialog = useConfirm();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const [rate, setRate] = useState(usdExchangeRate ?? '');
    const [savingRate, setSavingRate] = useState(false);

    const saveRate = () => {
        if (!rate || parseFloat(rate) <= 0) return;
        confirmDialog(`¿Actualizar la cotización a $${rate} y recalcular el costo de ${usdProductsCount} artículo(s) en USD?`, () => {
            setSavingRate(true);
            router.post(route('usd-exchange-rate.update'), { rate }, { onFinish: () => setSavingRate(false) });
        });
    };

    const [filters, setFilters] = useState({
        category_id: '',
        vendor_id: '',
        active_only: true,
        target: 'price',
        adjustment_type: 'percentage',
        direction: 'increase',
        value: '',
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState(null);

    const set = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPreview(null); };

    const requestPayload = () => ({
        ...filters,
        category_id: filters.category_id || null,
        vendor_id: filters.vendor_id || null,
        value: parseFloat(filters.value || 0),
    });

    const runPreview = async () => {
        setError(null);
        setLoading(true);
        try {
            const { data } = await axios.post(route('products.bulk-price.preview'), requestPayload());
            setPreview(data);
        } catch (e) {
            setError(e.response?.data?.message ?? 'No se pudo calcular la vista previa. Revisá los datos ingresados.');
        } finally {
            setLoading(false);
        }
    };

    const applyChanges = () => {
        if (!preview || preview.count === 0) return;
        confirmDialog(`¿Confirmás actualizar el precio de ${preview.count} artículo(s)? Esta acción no se puede deshacer.`, () => {
            setApplying(true);
            router.post(route('products.bulk-price.apply'), requestPayload(), {
                onFinish: () => setApplying(false),
            });
        });
    };

    const directionLabel = filters.direction === 'increase' ? '+' : '-';
    const valueLabel = filters.adjustment_type === 'percentage' ? `${filters.value || 0}%` : fmt(filters.value || 0);

    return (
        <AuthenticatedLayout>
            <Head title="Aumento Masivo de Precios" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link href={route('products.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Aumento Masivo de Precios</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aplicá un ajuste de precio a varios artículos a la vez</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className={`${card} p-4 flex items-center gap-2 border-emerald-500/40`}>
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{flash.success}</p>
                    </div>
                )}

                <div className={`${card} p-5 flex flex-col gap-3`}>
                    <h2 className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <DollarSign size={16} /> Cotización del dólar (costos importados)
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {usdProductsCount} artículo(s) tienen su costo cargado en USD. Al actualizar la cotización se recalcula automáticamente el costo en pesos de todos ellos.
                    </p>
                    <div className="flex items-end gap-3">
                        <div className="w-40">
                            <label className={labelCls}>$ 1 USD =</label>
                            <input type="number" step="0.01" min="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} placeholder="Ej: 1200" />
                        </div>
                        <button onClick={saveRate} disabled={savingRate || !rate}
                            className="px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            {savingRate ? 'Actualizando...' : 'Actualizar cotización'}
                        </button>
                    </div>
                </div>

                <div className={`${card} p-5 flex flex-col gap-4`}>
                    <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>1. Elegí qué artículos afectar</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className={labelCls}>Categoría</label>
                            <select value={filters.category_id} onChange={(e) => set({ category_id: e.target.value })} className={inputCls}>
                                <option value="">Todas las categorías</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Proveedor</label>
                            <select value={filters.vendor_id} onChange={(e) => set({ vendor_id: e.target.value })} className={inputCls}>
                                <option value="">Todos los proveedores</option>
                                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end pb-2.5">
                            <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <input type="checkbox" checked={filters.active_only} onChange={(e) => set({ active_only: e.target.checked })}
                                    className="rounded accent-teal-500" />
                                Solo artículos activos
                            </label>
                        </div>
                    </div>
                </div>

                <div className={`${card} p-5 flex flex-col gap-4`}>
                    <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>2. Definí el ajuste</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Aplicar sobre</label>
                            <select value={filters.target} onChange={(e) => set({ target: e.target.value })} className={inputCls}>
                                <option value="price">Precio de venta</option>
                                <option value="cost_price">Precio de costo</option>
                                <option value="both">Ambos</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Tipo de ajuste</label>
                            <div className="flex gap-2">
                                <select value={filters.adjustment_type} onChange={(e) => set({ adjustment_type: e.target.value })} className={inputCls}>
                                    <option value="percentage">Porcentaje (%)</option>
                                    <option value="fixed">Monto fijo ($)</option>
                                </select>
                                <select value={filters.direction} onChange={(e) => set({ direction: e.target.value })} className={inputCls}>
                                    <option value="increase">Aumentar</option>
                                    <option value="decrease">Disminuir</option>
                                </select>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Valor *</label>
                            <input type="number" step="0.01" min="0.01" value={filters.value}
                                onChange={(e) => set({ value: e.target.value })}
                                className={inputCls} placeholder={filters.adjustment_type === 'percentage' ? 'Ej: 10' : 'Ej: 500'} />
                        </div>
                    </div>
                    <button onClick={runPreview} disabled={loading || !filters.value}
                        className="inline-flex items-center gap-2 self-start px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Search size={14} /> {loading ? 'Calculando...' : 'Vista previa'}
                    </button>
                    {error && (
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}
                </div>

                {preview && (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                3. Confirmar — {preview.count} artículo(s) afectado(s) ({directionLabel}{valueLabel})
                            </h2>
                            <button onClick={applyChanges} disabled={applying || preview.count === 0}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                style={{ background: `linear-gradient(90deg, #5AAD9C, #397B9C)` }}>
                                {applying ? 'Aplicando...' : `Aplicar a ${preview.count} artículo(s)`}
                            </button>
                        </div>
                        {preview.count === 0 ? (
                            <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ningún artículo coincide con estos filtros.</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Artículo</th>
                                                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Precio actual</th>
                                                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Precio nuevo</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                            {preview.sample.map((p) => (
                                                <tr key={p.id}>
                                                    <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</td>
                                                    <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {filters.target !== 'cost_price' ? fmt(p.current_price) : fmt(p.current_cost_price)}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-emerald-500">
                                                        {filters.target !== 'cost_price' ? fmt(p.new_price) : fmt(p.new_cost_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {preview.count > preview.sample.length && (
                                    <p className={`px-5 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Mostrando {preview.sample.length} de {preview.count}. El resto se actualiza igual al aplicar.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
