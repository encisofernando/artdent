import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, FileText, Package, Plus, Trash2, ShoppingCart, TrendingUp } from 'lucide-react';
import { DatePicker, useD } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';

const INVOICE_TYPES = ['FA', 'FB', 'FC', 'FE', 'FM', 'RA', 'RB', 'RC', 'X'];

function calcMargin(cost, price) {
    const c = parseFloat(cost);
    const p = parseFloat(price);
    if (!c || !p || c <= 0) return null;
    return (p / c - 1) * 100;
}

function calcNewPrice(cost, marginPct) {
    const c = parseFloat(cost);
    const m = parseFloat(marginPct);
    if (Number.isNaN(c) || Number.isNaN(m) || c <= 0) return null;
    return c * (1 + m / 100);
}

function toDateInput(value) {
    if (!value) return '';

    return String(value).slice(0, 10);
}

export default function Edit({ auth, purchase, vendors, warehouses, products }) {
    const { isDark } = useTheme();
    const D = useD(isDark);
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [form, setForm] = useState({
        vendor_id: String(purchase.vendor_id ?? ''),
        warehouse_id: String(purchase.warehouse_id ?? warehouses[0]?.id ?? ''),
        invoice_type: purchase.invoice_type ?? '',
        invoice_number: purchase.invoice_number ?? '',
        cae: purchase.cae ?? '',
        cae_due_date: toDateInput(purchase.cae_due_date),
        reference_no: purchase.reference_no ?? '',
        status: purchase.status ?? 'received',
        purchased_at: toDateInput(purchase.purchased_at),
        due_date: toDateInput(purchase.due_date),
        tax_amount: purchase.tax_amount ?? 0,
        notes: purchase.notes ?? '',
    });

    const [items, setItems] = useState(() => (
        purchase.purchase_items?.map((item) => {
            const product = products.find((entry) => entry.id === item.product_id) ?? item.product;
            const origCost = parseFloat(product?.cost_price ?? item.unit_cost ?? 0);
            const origPrice = parseFloat(product?.price ?? 0);
            const quantity = parseFloat(item.quantity ?? 1);
            const unitCost = parseFloat(item.unit_cost ?? 0);

            return {
                product_id: String(item.product_id ?? ''),
                variant_id: item.variant_id ? String(item.variant_id) : '',
                product_name: product?.name ?? item.product?.name ?? '',
                quantity,
                unit_cost: unitCost,
                total: parseFloat(item.total ?? quantity * unitCost),
                orig_cost: origCost,
                orig_price: origPrice,
                margin_pct: calcMargin(origCost, origPrice),
                new_price: origPrice || 0,
            };
        }) ?? []
    ));
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (key, val) => setForm((current) => ({ ...current, [key]: val }));

    const addItem = () => {
        setItems((current) => [
            ...current,
            {
                product_id: '',
                variant_id: '',
                product_name: '',
                quantity: 1,
                unit_cost: 0,
                total: 0,
                orig_cost: 0,
                orig_price: 0,
                margin_pct: null,
                new_price: 0,
            },
        ]);
    };

    const updateItem = (idx, key, val) => {
        setItems((current) => current.map((item, i) => {
            if (i !== idx) return item;

            const updated = { ...item, [key]: val };

            if (key === 'product_id') {
                const product = products.find((entry) => entry.id === parseInt(val, 10));
                const origCost = parseFloat(product?.cost_price ?? 0);
                const origPrice = parseFloat(product?.price ?? 0);
                const margin = calcMargin(origCost, origPrice);

                updated.product_name = product?.name ?? '';
                updated.unit_cost = origCost;
                updated.variant_id = '';
                updated.orig_cost = origCost;
                updated.orig_price = origPrice;
                updated.margin_pct = margin;
                updated.new_price = origPrice;
                updated.total = updated.quantity * origCost;
            }

            if (key === 'unit_cost') {
                const newCost = parseFloat(val) || 0;
                updated.total = newCost * parseFloat(updated.quantity || 0);

                if (updated.margin_pct !== null && newCost > 0) {
                    updated.new_price = parseFloat(calcNewPrice(newCost, updated.margin_pct).toFixed(2));
                }
            }

            if (key === 'quantity') {
                updated.total = parseFloat(val || 0) * parseFloat(updated.unit_cost || 0);
            }

            if (key === 'margin_pct') {
                const newPrice = calcNewPrice(updated.unit_cost, val);
                if (newPrice !== null) {
                    updated.new_price = parseFloat(newPrice.toFixed(2));
                }
            }

            if (key === 'new_price') {
                const margin = calcMargin(updated.unit_cost, val);
                updated.margin_pct = margin !== null ? parseFloat(margin.toFixed(2)) : null;
            }

            return updated;
        }));
    };

    const removeItem = (idx) => setItems((current) => current.filter((_, i) => i !== idx));

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const total = subtotal + parseFloat(form.tax_amount || 0);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('proveedores.comprobantes.update', purchase.id), {
            ...form,
            vendor_id: parseInt(form.vendor_id, 10),
            warehouse_id: parseInt(form.warehouse_id, 10),
            subtotal,
            total,
            items: items.map((item) => ({
                product_id: parseInt(item.product_id, 10),
                variant_id: item.variant_id ? parseInt(item.variant_id, 10) : null,
                quantity: parseFloat(item.quantity),
                unit_cost: parseFloat(item.unit_cost),
                total: parseFloat(item.total),
            })),
        }, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    const inputCls = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

    const priceChanged = (item) => (
        item.product_id &&
        item.new_price > 0 &&
        Math.abs(parseFloat(item.new_price) - parseFloat(item.orig_price)) > 0.001
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Editar Comprobante" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Comprobante
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Corregí datos fiscales y artículos del comprobante del proveedor
                        </p>
                    </div>
                    <Link href={route('proveedores.comprobantes.show', purchase.id)}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft className="mr-2" size={16} /> Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <FileText size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos del Comprobante
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Proveedor *</label>
                                <SearchableSelect
                                    options={vendors.map((vendor) => ({ value: String(vendor.id), label: vendor.name }))}
                                    value={String(form.vendor_id)}
                                    onChange={(value) => set('vendor_id', value)}
                                    placeholder="Seleccionar proveedor..."
                                    required
                                    error={errors.vendor_id}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Depósito *</label>
                                <SearchableSelect
                                    options={warehouses.map((warehouse) => ({ value: String(warehouse.id), label: warehouse.name }))}
                                    value={String(form.warehouse_id)}
                                    onChange={(value) => set('warehouse_id', value)}
                                    placeholder="Seleccionar depósito..."
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Tipo de Comprobante</label>
                                <SearchableSelect
                                    options={[{ value: '', label: 'Sin tipo' }, ...INVOICE_TYPES.map((type) => ({ value: type, label: type }))]}
                                    value={form.invoice_type}
                                    onChange={(value) => set('invoice_type', value)}
                                    placeholder="Seleccionar..."
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Número</label>
                                <input
                                    type="text"
                                    value={form.invoice_number}
                                    onChange={(e) => set('invoice_number', e.target.value)}
                                    className={inputCls}
                                    placeholder="0001-00000001"
                                />
                                {errors.invoice_number && <p className="text-red-500 text-xs mt-1">{errors.invoice_number}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>CAE</label>
                                <input
                                    type="text"
                                    value={form.cae}
                                    onChange={(e) => set('cae', e.target.value)}
                                    className={inputCls}
                                    placeholder="Ej: 70456789123456"
                                />
                                {errors.cae && <p className="text-red-500 text-xs mt-1">{errors.cae}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Vto. CAE</label>
                                <DatePicker
                                    value={form.cae_due_date}
                                    onChange={(value) => set('cae_due_date', value)}
                                    className={inputCls}
                                    D={D}
                                />
                                {errors.cae_due_date && <p className="text-red-500 text-xs mt-1">{errors.cae_due_date}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Nro. Referencia Interno</label>
                                <input
                                    type="text"
                                    value={form.reference_no}
                                    onChange={(e) => set('reference_no', e.target.value)}
                                    className={inputCls}
                                    placeholder="OC-001"
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Estado *</label>
                                <SearchableSelect
                                    options={[
                                        { value: 'pending', label: 'Pendiente' },
                                        { value: 'received', label: 'Recibido (actualiza stock)' },
                                        { value: 'partial', label: 'Parcial' },
                                        { value: 'cancelled', label: 'Cancelado' },
                                    ]}
                                    value={form.status}
                                    onChange={(value) => set('status', value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Fecha del Comprobante *</label>
                                <DatePicker
                                    value={form.purchased_at}
                                    onChange={(value) => set('purchased_at', value)}
                                    className={inputCls}
                                    D={D}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Fecha de Vencimiento</label>
                                <DatePicker
                                    value={form.due_date}
                                    onChange={(value) => set('due_date', value)}
                                    className={inputCls}
                                    D={D}
                                />
                                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                            </div>

                            <div className="md:col-span-3">
                                <label className={labelCls}>Notas Internas</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => set('notes', e.target.value)}
                                    className={inputCls}
                                    rows="2"
                                    placeholder="Observaciones..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <div className={`flex items-center justify-between mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <Package size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Artículos
                                </h2>
                            </div>
                            <Button
                                type="button"
                                onClick={addItem}
                                size="sm"
                                className="text-white border-none rounded-xl text-xs"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus size={14} className="mr-1" /> Agregar Artículo
                            </Button>
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-3">{errors.items}</p>}

                        {items.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                <ShoppingCart size={32} className="mb-2 opacity-40" />
                                <p className="text-sm">Agregá artículos al comprobante</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {items.map((item, idx) => {
                                    const selectedProduct = products.find((product) => product.id === parseInt(item.product_id, 10));
                                    const variants = selectedProduct?.product_variants ?? [];
                                    const hasPriceChange = priceChanged(item);

                                    return (
                                        <div key={idx} className={`rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="grid grid-cols-12 gap-3 p-3">
                                                <div className="col-span-12 md:col-span-4">
                                                    <label className={labelCls}>Producto</label>
                                                    <SearchableSelect
                                                        options={products.map((product) => ({
                                                            value: String(product.id),
                                                            label: `${product.name}${product.sku ? ` (${product.sku})` : ''}`,
                                                        }))}
                                                        value={String(item.product_id)}
                                                        onChange={(value) => updateItem(idx, 'product_id', value)}
                                                        placeholder="Seleccionar..."
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-12 md:col-span-2">
                                                    <label className={labelCls}>Variante</label>
                                                    <SearchableSelect
                                                        options={[{ value: '', label: 'Sin variante' }, ...variants.map((variant) => ({
                                                            value: String(variant.id),
                                                            label: variant.sku || variant.barcode || `Var. #${variant.id}`,
                                                        }))]}
                                                        value={String(item.variant_id)}
                                                        onChange={(value) => updateItem(idx, 'variant_id', value)}
                                                        placeholder="Sin variante"
                                                        disabled={!variants.length}
                                                    />
                                                </div>

                                                <div className="col-span-4 md:col-span-2">
                                                    <label className={labelCls}>Cantidad</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                        className={inputCls}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-4 md:col-span-2">
                                                    <label className={labelCls}>Costo Unit.</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={(e) => updateItem(idx, 'unit_cost', e.target.value)}
                                                        className={inputCls}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-3 md:col-span-1">
                                                    <label className={labelCls}>Total</label>
                                                    <div className={`px-3 py-2 text-sm font-bold rounded-xl ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                        {fmt(item.total)}
                                                    </div>
                                                </div>

                                                <div className="col-span-1 flex items-end pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(idx)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {item.product_id && (
                                                <div className={`grid grid-cols-12 gap-3 px-3 pb-3 pt-1 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200/80'}`}>
                                                    <div className="col-span-6 md:col-span-2">
                                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-emerald-500/80' : 'text-emerald-600'}`}>
                                                            Margen %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            value={item.margin_pct ?? ''}
                                                            onChange={(e) => updateItem(idx, 'margin_pct', e.target.value)}
                                                            className={`w-full rounded-xl border px-3 py-1.5 text-sm font-mono focus:ring-2 focus:outline-none
                                                                ${isDark ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-400 focus:ring-emerald-400/20'}`}
                                                            placeholder="0.0"
                                                        />
                                                    </div>

                                                    <div className="col-span-6 md:col-span-3">
                                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-emerald-500/80' : 'text-emerald-600'}`}>
                                                            Precio Venta
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.new_price || ''}
                                                            onChange={(e) => updateItem(idx, 'new_price', e.target.value)}
                                                            className={`w-full rounded-xl border px-3 py-1.5 text-sm font-mono font-bold focus:ring-2 focus:outline-none
                                                                ${isDark ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-400 focus:ring-emerald-400/20'}`}
                                                            placeholder="0.00"
                                                        />
                                                    </div>

                                                    <div className="col-span-12 md:col-span-7 flex items-end pb-0.5">
                                                        {hasPriceChange ? (
                                                            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border
                                                                ${isDark ? 'bg-amber-900/20 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                                <TrendingUp size={13} />
                                                                <span>
                                                                    Precio actual: <strong>{fmt(item.orig_price)}</strong>
                                                                    &nbsp;→&nbsp;
                                                                    <strong>{fmt(item.new_price)}</strong>
                                                                    &nbsp;
                                                                    <span className="opacity-70">(solo informativo)</span>
                                                                </span>
                                                            </div>
                                                        ) : item.orig_price > 0 ? (
                                                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                Precio actual: {fmt(item.orig_price)} · Sin cambios
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className={`mt-4 flex flex-col items-end gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className={`flex gap-8 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <span>Subtotal: <strong>{fmt(subtotal)}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>IVA / Impuestos:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.tax_amount}
                                        onChange={(e) => set('tax_amount', e.target.value)}
                                        className={`w-32 rounded-xl border px-3 py-1.5 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                </div>
                                <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Total: {fmt(total)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`rounded-2xl border p-5 shadow-sm flex justify-end gap-3 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <Link href={route('proveedores.comprobantes.show', purchase.id)}>
                            <Button type="button" variant="outline" className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || items.length === 0}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save className="mr-2" size={16} />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
