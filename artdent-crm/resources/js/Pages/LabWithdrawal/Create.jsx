import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Save, Package, Plus, Trash2, PackageMinus, User } from 'lucide-react';
import { DatePicker, useD } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function Create({ auth, warehouses, collaborators, products }) {
    const { isDark } = useTheme();
    const D = useD(isDark);
    const B = { blue: '#397B9C', teal: '#49949C' };
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        warehouse_id: warehouses[0]?.id ?? '',
        collaborator_id: '',
        external_person: '',
        withdrawn_at: today,
        notes: '',
    });

    const [items, setItems] = useState([]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const addItem = () => {
        setItems(prev => [...prev, {
            product_id: '',
            variant_id: '',
            product_name: '',
            quantity: 1,
            unit_cost: 0,
            total: 0,
            stock_available: null,
        }]);
    };

    const updateItem = (idx, key, val) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== idx) return item;
            const updated = { ...item, [key]: val };

            if (key === 'product_id') {
                const product = products.find(p => p.id === parseInt(val));
                updated.product_name = product?.name ?? '';
                updated.unit_cost = parseFloat(product?.cost_price ?? 0);
                updated.variant_id = '';
                updated.total = updated.quantity * updated.unit_cost;
            }

            if (key === 'quantity') {
                updated.total = parseFloat(val || 0) * parseFloat(updated.unit_cost || 0);
            }

            if (key === 'unit_cost') {
                updated.total = parseFloat(val || 0) * parseFloat(updated.quantity || 0);
            }

            return updated;
        }));
    };

    const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

    const totalCost = items.reduce((s, i) => s + parseFloat(i.total || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('lab-withdrawals.store'), {
            ...form,
            items: items.map(i => ({
                product_id: parseInt(i.product_id),
                variant_id: i.variant_id ? parseInt(i.variant_id) : null,
                quantity: parseFloat(i.quantity),
                unit_cost: parseFloat(i.unit_cost),
                total: parseFloat(i.total),
            })),
        }, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    const inputCls = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const card = `rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const divider = `flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`;
    const sectionTitle = `font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Retiro de Insumos" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Retiro de Insumos
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar salida interna de insumos a precio de costo
                        </p>
                    </div>
                    <Link href={route('lab-withdrawals.index')}>
                        <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border font-medium
                            ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <ArrowLeft size={16} /> Volver
                        </button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Datos del retiro */}
                    <div className={card}>
                        <div className={divider}>
                            <PackageMinus size={18} style={{ color: B.teal }} />
                            <h2 className={sectionTitle}>Datos del Retiro</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className={labelCls}>Depósito *</label>
                                <SearchableSelect
                                    options={warehouses.map(w => ({ value: String(w.id), label: w.name }))}
                                    value={String(form.warehouse_id)}
                                    onChange={v => set('warehouse_id', v)}
                                    placeholder="Seleccionar depósito..."
                                    required
                                    error={errors.warehouse_id}
                                />
                                {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Fecha de Retiro *</label>
                                <DatePicker value={form.withdrawn_at} onChange={v => set('withdrawn_at', v)} className={inputCls} D={D} />
                                {errors.withdrawn_at && <p className="text-red-500 text-xs mt-1">{errors.withdrawn_at}</p>}
                            </div>

                            <div />

                            <div className="md:col-span-2">
                                <label className={labelCls}>
                                    <User size={11} className="inline mr-1" />
                                    Colaborador que retira
                                </label>
                                <SearchableSelect
                                    options={[{ value: '', label: 'Sin colaborador asignado' }, ...collaborators.map(c => ({ value: String(c.id), label: c.name }))]}
                                    value={String(form.collaborator_id)}
                                    onChange={v => set('collaborator_id', v)}
                                    placeholder="Seleccionar colaborador..."
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Persona Externa (opcional)</label>
                                <input
                                    type="text"
                                    value={form.external_person}
                                    onChange={e => set('external_person', e.target.value)}
                                    className={inputCls}
                                    placeholder="Nombre de persona externa..."
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className={labelCls}>Notas / Motivo</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => set('notes', e.target.value)}
                                    className={inputCls}
                                    rows="2"
                                    placeholder="Motivo del retiro, observaciones..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ítems */}
                    <div className={card}>
                        <div className={`flex items-center justify-between mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <Package size={18} style={{ color: B.teal }} />
                                <h2 className={sectionTitle}>Artículos</h2>
                            </div>
                            <button type="button" onClick={addItem}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} /> Agregar Artículo
                            </button>
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-3">{errors.items}</p>}

                        {items.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed
                                ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                <Package size={32} className="mb-2 opacity-40" />
                                <p className="text-sm">Agregá insumos al retiro</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {items.map((item, idx) => {
                                    const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                                    const variants = selectedProduct?.product_variants ?? [];

                                    return (
                                        <div key={idx} className={`rounded-xl border p-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="grid grid-cols-12 gap-3">
                                                {/* Producto */}
                                                <div className="col-span-12 md:col-span-5">
                                                    <label className={labelCls}>Producto</label>
                                                    <SearchableSelect
                                                        options={products.map(p => ({ value: String(p.id), label: `${p.name}${p.sku ? ` (${p.sku})` : ''}` }))}
                                                        value={String(item.product_id)}
                                                        onChange={v => updateItem(idx, 'product_id', v)}
                                                        placeholder="Seleccionar..."
                                                        required
                                                    />
                                                </div>

                                                {/* Variante */}
                                                {variants.length > 0 && (
                                                    <div className="col-span-12 md:col-span-2">
                                                        <label className={labelCls}>Variante</label>
                                                        <SearchableSelect
                                                            options={[{ value: '', label: 'Sin variante' }, ...variants.map(v => ({ value: String(v.id), label: v.sku || v.barcode || `Var. #${v.id}` }))]}
                                                            value={String(item.variant_id)}
                                                            onChange={v => updateItem(idx, 'variant_id', v)}
                                                            placeholder="Sin variante"
                                                        />
                                                    </div>
                                                )}

                                                {/* Cantidad */}
                                                <div className={`col-span-4 ${variants.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                                                    <label className={labelCls}>Cantidad</label>
                                                    <input
                                                        type="number" min="0.001" step="0.001"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                        className={inputCls}
                                                        required
                                                    />
                                                </div>

                                                {/* Costo unitario */}
                                                <div className={`col-span-4 ${variants.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                                                    <label className={labelCls}>Costo Unit.</label>
                                                    <input
                                                        type="number" min="0" step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={e => updateItem(idx, 'unit_cost', e.target.value)}
                                                        className={inputCls}
                                                        required
                                                    />
                                                </div>

                                                {/* Total ítem */}
                                                <div className="col-span-3 md:col-span-1">
                                                    <label className={labelCls}>Total</label>
                                                    <div className={`px-3 py-2 text-sm font-bold rounded-xl ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                        {fmt(item.total)}
                                                    </div>
                                                </div>

                                                {/* Eliminar */}
                                                <div className="col-span-1 flex items-end pb-1">
                                                    <button type="button" onClick={() => removeItem(idx)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center
                                                            ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Total */}
                        {items.length > 0 && (
                            <div className={`mt-4 flex justify-end pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Total costo: {fmt(totalCost)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={`rounded-2xl border p-5 shadow-sm flex justify-end gap-3 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <Link href={route('lab-withdrawals.index')}>
                            <button type="button"
                                className={`px-4 py-2 rounded-xl text-sm border font-medium
                                    ${isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" disabled={processing || items.length === 0}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={16} />
                            Registrar Retiro
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
