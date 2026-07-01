import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Search, Package, ArrowLeftRight, SlidersHorizontal, AlertTriangle, X, Save, ChevronRight } from 'lucide-react';
import { DatePicker, useD } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR').format(n);
const fmtCost = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

/* ─── Modal genérico ─────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, isDark }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <X size={15} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ─── Badge stock ────────────────────────────────────────────────────── */
function StockBadge({ quantity, minStock, isDark }) {
    const qty = parseFloat(quantity ?? 0);
    const min = parseFloat(minStock ?? 0);
    const isLow = min > 0 && qty <= min;
    const isEmpty = qty <= 0;

    if (isEmpty) return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-600 border-red-200'}`}>
            Sin stock
        </span>
    );
    if (isLow) return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <AlertTriangle size={10} /> Bajo
        </span>
    );
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            OK
        </span>
    );
}

export default function Index({ auth, items, warehouses, products, filters }) {
    const { isDark } = useTheme();
    const D = useD(isDark);
    const B = { blue: '#397B9C', teal: '#49949C' };

    /* ── Filtros ── */
    const [search, setSearch] = useState(filters.search ?? '');
    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? '');
    const [lowStock, setLowStock] = useState(filters.low_stock ?? false);

    const applyFilters = () => router.get(route('stocks.index'), {
        search: search || undefined,
        warehouse_id: warehouseId || undefined,
        low_stock: lowStock || undefined,
    }, { preserveState: true, replace: true });

    const clearFilters = () => {
        setSearch(''); setWarehouseId(''); setLowStock(false);
        router.get(route('stocks.index'));
    };

    /* ── Modal Ajuste ── */
    const [adjustModal, setAdjustModal] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ product_id: '', warehouse_id: '', variant_id: '', qty: '', note: '' });
    const [adjusting, setAdjusting] = useState(false);
    const [adjustErrors, setAdjustErrors] = useState({});

    const openAdjust = (item = null) => {
        setAdjustForm({
            product_id: item ? String(item.product_id) : '',
            warehouse_id: item ? String(item.warehouse_id) : (warehouses[0]?.id ? String(warehouses[0].id) : ''),
            variant_id: item?.variant_id ? String(item.variant_id) : '',
            qty: '',
            note: '',
        });
        setAdjustErrors({});
        setAdjustModal(true);
    };

    const submitAdjust = (e) => {
        e.preventDefault();
        setAdjusting(true);
        router.post(route('stocks.adjust'), adjustForm, {
            onSuccess: () => { setAdjustModal(false); setAdjusting(false); },
            onError: (errs) => { setAdjustErrors(errs); setAdjusting(false); },
        });
    };

    /* ── Modal Transferencia ── */
    const [transferModal, setTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({ product_id: '', variant_id: '', from_warehouse_id: '', to_warehouse_id: '', qty: '', note: '' });
    const [transferring, setTransferring] = useState(false);
    const [transferErrors, setTransferErrors] = useState({});

    const openTransfer = (item = null) => {
        setTransferForm({
            product_id: item ? String(item.product_id) : '',
            variant_id: item?.variant_id ? String(item.variant_id) : '',
            from_warehouse_id: item ? String(item.warehouse_id) : '',
            to_warehouse_id: '',
            qty: '',
            note: '',
        });
        setTransferErrors({});
        setTransferModal(true);
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        setTransferring(true);
        router.post(route('stocks.transfer'), transferForm, {
            onSuccess: () => { setTransferModal(false); setTransferring(false); },
            onError: (errs) => { setTransferErrors(errs); setTransferring(false); },
        });
    };

    /* ── Estilos comunes ── */
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const errCls = 'text-red-500 text-xs mt-1';

    const selectedProduct = (pid) => products.find(p => p.id === parseInt(pid));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Stock" />

            <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Package size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Stock</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inventario por producto y depósito</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => openTransfer()}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold whitespace-nowrap border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <ArrowLeftRight size={15} /> Transferir
                        </button>
                        <button onClick={() => openAdjust()}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold whitespace-nowrap text-white shadow-md"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <SlidersHorizontal size={15} /> Ajustar Stock
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className={`${card} p-4`}>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-48">
                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input type="text" placeholder="Buscar producto o SKU..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className={`${inputCls} pl-9`} />
                        </div>
                        <div className="w-52">
                            <SearchableSelect
                                options={[{ value: '', label: 'Todos los depósitos' }, ...warehouses.map(w => ({ value: String(w.id), label: w.name }))]}
                                value={String(warehouseId)}
                                onChange={setWarehouseId}
                                placeholder="Depósito..."
                            />
                        </div>
                        <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)}
                                className="rounded accent-teal-500" />
                            Solo stock bajo / sin stock
                        </label>
                        <button onClick={applyFilters}
                            className="px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            Filtrar
                        </button>
                        <button onClick={clearFilters}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-medium border ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className={`${card} overflow-hidden`}>
                    {items.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Package size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay registros de stock</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="sm:hidden flex flex-col gap-3 p-3">
                                {items.data.map(item => (
                                    <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0">
                                                    <p className={`font-bold text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                        {item.product?.name ?? '—'}
                                                    </p>
                                                    <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {item.product?.sku ?? '—'}
                                                        {item.product_variant ? ` · ${item.product_variant.sku || item.product_variant.barcode || `#${item.product_variant.id}`}` : ''}
                                                    </p>
                                                </div>
                                                <span className={`text-2xl font-extrabold shrink-0 ${parseFloat(item.quantity) <= 0 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
                                                    {fmt(item.quantity)}
                                                </span>
                                            </div>
                                            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.warehouse?.name ?? '—'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <StockBadge quantity={item.quantity} minStock={item.product?.min_stock} isDark={isDark} />
                                                    <button onClick={() => openAdjust(item)} title="Ajustar stock"
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                        <SlidersHorizontal size={12} />
                                                    </button>
                                                    <button onClick={() => openTransfer(item)} title="Transferir"
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                        <ArrowLeftRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Producto</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SKU</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Variante</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Depósito</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cantidad</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mínimo</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estado</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}></th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {items.data.map(item => (
                                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.product?.name ?? '—'}
                                                </td>
                                                <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.product?.sku ?? '—'}
                                                </td>
                                                <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.product_variant ? (item.product_variant.sku || item.product_variant.barcode || `#${item.product_variant.id}`) : '—'}
                                                </td>
                                                <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {item.warehouse?.name ?? '—'}
                                                </td>
                                                <td className={`px-4 py-3 font-bold text-base ${parseFloat(item.quantity) <= 0 ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
                                                    {fmt(item.quantity)}
                                                </td>
                                                <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {item.product?.min_stock ? fmt(item.product.min_stock) : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StockBadge quantity={item.quantity} minStock={item.product?.min_stock} isDark={isDark} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => openAdjust(item)} title="Ajustar stock"
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                            <SlidersHorizontal size={12} />
                                                        </button>
                                                        <button onClick={() => openTransfer(item)} title="Transferir"
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                            <ArrowLeftRight size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    <Pagination data={items} />
                </div>
            </div>

            {/* ─── Modal Ajuste ─── */}
            <Modal open={adjustModal} onClose={() => setAdjustModal(false)} title="Ajustar Stock" isDark={isDark}>
                <form onSubmit={submitAdjust} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Producto *</label>
                        <SearchableSelect
                            options={products.map(p => ({ value: String(p.id), label: `${p.name}${p.sku ? ` (${p.sku})` : ''}` }))}
                            value={adjustForm.product_id}
                            onChange={v => setAdjustForm(f => ({ ...f, product_id: v, variant_id: '' }))}
                            placeholder="Seleccionar producto..."
                            required
                        />
                        {adjustErrors.product_id && <p className={errCls}>{adjustErrors.product_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Depósito *</label>
                        <SearchableSelect
                            options={warehouses.map(w => ({ value: String(w.id), label: w.name }))}
                            value={adjustForm.warehouse_id}
                            onChange={v => setAdjustForm(f => ({ ...f, warehouse_id: v }))}
                            placeholder="Seleccionar depósito..."
                            required
                        />
                        {adjustErrors.warehouse_id && <p className={errCls}>{adjustErrors.warehouse_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>
                            Cantidad a ajustar *
                            <span className={`ml-2 font-normal normal-case ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(negativo = descuenta)</span>
                        </label>
                        <input type="number" step="0.001"
                            value={adjustForm.qty}
                            onChange={e => setAdjustForm(f => ({ ...f, qty: e.target.value }))}
                            className={inputCls} placeholder="Ej: 5 o -3" required />
                        {adjustErrors.qty && <p className={errCls}>{adjustErrors.qty}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Motivo / Nota</label>
                        <input type="text"
                            value={adjustForm.note}
                            onChange={e => setAdjustForm(f => ({ ...f, note: e.target.value }))}
                            className={inputCls} placeholder="Inventario físico, rotura, etc." />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setAdjustModal(false)}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={adjusting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar Ajuste
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ─── Modal Transferencia ─── */}
            <Modal open={transferModal} onClose={() => setTransferModal(false)} title="Transferir entre Depósitos" isDark={isDark}>
                <form onSubmit={submitTransfer} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Producto *</label>
                        <SearchableSelect
                            options={products.map(p => ({ value: String(p.id), label: `${p.name}${p.sku ? ` (${p.sku})` : ''}` }))}
                            value={transferForm.product_id}
                            onChange={v => setTransferForm(f => ({ ...f, product_id: v, variant_id: '' }))}
                            placeholder="Seleccionar producto..."
                            required
                        />
                        {transferErrors.product_id && <p className={errCls}>{transferErrors.product_id}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Desde *</label>
                            <SearchableSelect
                                options={warehouses.map(w => ({ value: String(w.id), label: w.name }))}
                                value={transferForm.from_warehouse_id}
                                onChange={v => setTransferForm(f => ({ ...f, from_warehouse_id: v }))}
                                placeholder="Origen..."
                                required
                            />
                            {transferErrors.from_warehouse_id && <p className={errCls}>{transferErrors.from_warehouse_id}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Hacia *</label>
                            <SearchableSelect
                                options={warehouses.map(w => ({ value: String(w.id), label: w.name }))}
                                value={transferForm.to_warehouse_id}
                                onChange={v => setTransferForm(f => ({ ...f, to_warehouse_id: v }))}
                                placeholder="Destino..."
                                required
                            />
                            {transferErrors.to_warehouse_id && <p className={errCls}>{transferErrors.to_warehouse_id}</p>}
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Cantidad *</label>
                        <input type="number" step="0.001" min="0.001"
                            value={transferForm.qty}
                            onChange={e => setTransferForm(f => ({ ...f, qty: e.target.value }))}
                            className={inputCls} placeholder="0" required />
                        {transferErrors.qty && <p className={errCls}>{transferErrors.qty}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Nota</label>
                        <input type="text"
                            value={transferForm.note}
                            onChange={e => setTransferForm(f => ({ ...f, note: e.target.value }))}
                            className={inputCls} placeholder="Motivo de la transferencia..." />
                    </div>
                    {transferErrors.message && (
                        <p className={`text-sm font-medium px-3 py-2 rounded-lg ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                            {transferErrors.message}
                        </p>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setTransferModal(false)}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={transferring}
                            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <ArrowLeftRight size={14} /> Transferir
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
