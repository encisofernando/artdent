import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Tag, Settings2, Search, Package } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', teal: '#49949C' };

// "2x1" no está en la lista: todavía no tiene lógica de precio implementada
// en el checkout (ver CatalogController::applyBestOffer) — se sacó para no
// poder publicar una oferta que muestre el badge sin aplicar el descuento.
const TYPE_OPTIONS = [
    { value: 'discount_percent', label: '% Descuento' },
    { value: 'discount_fixed', label: '$ Descuento fijo' },
    { value: 'combo', label: 'Combo' },
    { value: 'installments', label: 'Cuotas (badge informativo, no cambia el precio)' },
];

const COLOR_OPTIONS = [
    { value: 'red', label: 'Rojo', bg: 'bg-red-500' },
    { value: 'orange', label: 'Naranja', bg: 'bg-orange-500' },
    { value: 'green', label: 'Verde', bg: 'bg-emerald-500' },
    { value: 'blue', label: 'Azul', bg: 'bg-blue-500' },
    { value: 'purple', label: 'Violeta', bg: 'bg-purple-500' },
];

const VALUE_TYPES = ['discount_percent', 'discount_fixed', 'installments'];

function toDateInput(val) {
    if (!val) {
        return '';
    }
    return val.slice(0, 10);
}

export default function Edit({ auth, item, products }) {
    const { isDark } = useTheme();
    const [productSearch, setProductSearch] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        type: item.type || 'discount_percent',
        value: item.value ?? '',
        badge_text: item.badge_text || '',
        badge_color: item.badge_color || 'red',
        description: item.description || '',
        starts_at: toDateInput(item.starts_at),
        ends_at: toDateInput(item.ends_at),
        is_active: item.is_active ? 1 : 0,
        product_ids: item.product_ids || [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('offers.update', item.id));
    };

    const toggleProduct = (productId) => {
        const current = data.product_ids;
        if (current.includes(productId)) {
            setData('product_ids', current.filter((id) => id !== productId));
        } else {
            setData('product_ids', [...current, productId]);
        }
    };

    const filteredProducts = (products || []).filter((p) => {
        if (!productSearch) {
            return true;
        }
        const q = productSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    });

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1.5 font-medium';
    const section = `rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const sectionHeader = `flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`;

    const Toggle = ({ label }) => (
        <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={data.is_active === 1 || data.is_active === true}
                    onChange={(e) => setData('is_active', e.target.checked ? 1 : 0)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true) ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'translate-x-4' : ''}`} />
            </div>
            <div className="ml-3 font-medium text-sm">{label}</div>
        </label>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Oferta: ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Editando oferta</p>
                    </div>
                    <Link href={route('offers.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft className="mr-2" size={16} /> Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Nombre y Tipo */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Tag size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Datos de la Oferta</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={lbl}>Nombre de la Oferta *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={inp}
                                    required
                                />
                                {errors.name && <div className={err}>{errors.name}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Tipo de Oferta *</label>
                                <SearchableSelect
                                    value={data.type}
                                    onChange={v => setData('type', v)}
                                    options={TYPE_OPTIONS}
                                />
                                {errors.type && <div className={err}>{errors.type}</div>}
                            </div>

                            {VALUE_TYPES.includes(data.type) && (
                                <div>
                                    <label className={lbl}>
                                        {data.type === 'discount_percent' ? 'Porcentaje de Descuento' : data.type === 'installments' ? 'Cantidad de Cuotas' : 'Monto de Descuento'}
                                    </label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {data.type === 'discount_percent' ? '%' : data.type === 'installments' ? '#' : '$'}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step={data.type === 'installments' ? '1' : '0.01'}
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            className={inp + ' pl-8'}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.value && <div className={err}>{errors.value}</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badge */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Settings2 size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Badge y Descripción</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={lbl}>Texto del Badge</label>
                                <input
                                    type="text"
                                    value={data.badge_text}
                                    onChange={(e) => setData('badge_text', e.target.value)}
                                    className={inp}
                                    placeholder="ej: 20% OFF, 2x1, 6 cuotas"
                                />
                                {errors.badge_text && <div className={err}>{errors.badge_text}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Color del Badge</label>
                                <div className="flex gap-2 mt-1">
                                    {COLOR_OPTIONS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            title={c.label}
                                            onClick={() => setData('badge_color', c.value)}
                                            className={`w-8 h-8 rounded-full transition-all ${c.bg} ${data.badge_color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                        />
                                    ))}
                                </div>
                                {errors.badge_color && <div className={err}>{errors.badge_color}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={lbl}>Descripción (opcional)</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={inp}
                                    rows={3}
                                    placeholder="Descripción interna de la oferta..."
                                />
                                {errors.description && <div className={err}>{errors.description}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Vigencia */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Settings2 size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Vigencia</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={lbl}>Válido Desde</label>
                                <input
                                    type="date"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    className={inp}
                                />
                                {errors.starts_at && <div className={err}>{errors.starts_at}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Válido Hasta</label>
                                <input
                                    type="date"
                                    value={data.ends_at}
                                    onChange={(e) => setData('ends_at', e.target.value)}
                                    className={inp}
                                />
                                {errors.ends_at && <div className={err}>{errors.ends_at}</div>}
                            </div>

                            <div className="flex items-center mt-2">
                                <Toggle label="Oferta Activa" />
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Package size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Productos Asociados
                                {data.product_ids.length > 0 && (
                                    <span className={`ml-2 font-normal normal-case text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}>
                                        {data.product_ids.length} seleccionado{data.product_ids.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </h2>
                        </div>

                        {/* Buscador de productos */}
                        <div className={`flex items-center px-3 py-2 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                            <Search size={15} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o SKU..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full"
                            />
                        </div>

                        <div className={`max-h-72 overflow-y-auto rounded-xl border divide-y ${isDark ? 'border-slate-700 divide-slate-700/60' : 'border-slate-200 divide-slate-100'}`}>
                            {filteredProducts.length === 0 ? (
                                <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {productSearch ? 'Sin resultados' : 'No hay productos'}
                                </div>
                            ) : filteredProducts.map((p) => {
                                const selected = data.product_ids.includes(p.id);
                                return (
                                    <label
                                        key={p.id}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected
                                            ? (isDark ? 'bg-teal-900/20' : 'bg-teal-50')
                                            : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleProduct(p.id)}
                                            className="rounded accent-teal-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</div>
                                            {p.sku && <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.sku}</div>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        {errors.product_ids && <div className={err}>{errors.product_ids}</div>}
                    </div>

                    {/* Acciones */}
                    <div className={`rounded-2xl border p-6 shadow-sm flex justify-end gap-3 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <Link href={route('offers.index')}>
                            <Button type="button" variant="outline" className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
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
