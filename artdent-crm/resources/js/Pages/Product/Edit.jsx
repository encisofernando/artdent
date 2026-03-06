import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Save, Package, DollarSign, Image, Tag, Loader2, Star } from 'lucide-react';
import VariantGenerator from '@/Components/VariantGenerator';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

// ─── shared atoms (same as Create) ───────────────────────────────
function SectionCard({ icon: Icon, title, children, isDark }) {
    return (
        <div className={`rounded-2xl border overflow-hidden transition-colors
            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-100'}`}
        >
            <div className={`flex items-center gap-2.5 px-5 py-4 border-b
                ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-50 bg-slate-50/80'}`}
            >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${B.blue}22, ${B.teal}22)` }}
                >
                    <Icon size={14} style={{ color: B.teal }} />
                </div>
                <span className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {title}
                </span>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function Field({ label, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
            {children}
            {hint && <p className={`text-[11px] ${hint.type === 'error' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{hint.text}</p>}
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>
    );
}

function Input({ isDark, className = '', ...props }) {
    return (
        <input {...props}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all
                ${isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white'
                } ${className}`}
        />
    );
}

function Textarea({ isDark, ...props }) {
    return (
        <textarea {...props}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all resize-none
                ${isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white'
                }`}
        />
    );
}

function Toggle({ checked, onChange, label, color = 'blue', isDark }) {
    const colors = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', purple: 'bg-purple-500' };
    return (
        <label className={`flex items-center justify-between gap-3 cursor-pointer py-1
            ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
        >
            <span className="text-sm font-medium">{label}</span>
            <div className="relative shrink-0">
                <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200
                    ${checked ? colors[color] : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
                    ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </label>
    );
}

function PriceInput({ label, value, onChange, error, isDark, required }) {
    return (
        <Field label={label} error={error}>
            <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none
                    ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                <Input isDark={isDark} type="number" step="0.01" value={value}
                    onChange={onChange} placeholder="0,00" required={required} className="pl-7 font-mono"
                />
            </div>
        </Field>
    );
}

// ─── main ──────────────────────────────────────────────────────
export default function Edit({ auth, item }) {
    const { isDark } = useTheme();

    const { data, setData, post, processing, errors, transform } = useForm({
        name: item.name || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        short_description: item.short_description || '',
        cost_price: item.cost_price || '',
        price: item.price || '',
        is_active: item.is_active !== undefined ? item.is_active : 1,
        has_variants: item.has_variants || 0,
        same_price_for_variants: item.product_variants?.length > 0
            ? item.product_variants.every(v => Number(v.price) === Number(item.price))
            : true,
        variants: item.product_variants?.map(v => ({
            id: v.id,
            sku: v.sku,
            price: v.price || '',
            cost_price: v.cost_price || '',
            is_active: v.is_active,
            attributes: v.variant_attribute_values?.reduce((acc, curr) => {
                acc[curr.product_attribute_value.product_attribute.name] = curr.product_attribute_value.value;
                return acc;
            }, {}) ?? {},
        })) ?? [],
        track_stock: item.track_stock !== undefined ? item.track_stock : 1,
        stock_quantity: item.stocks?.length > 0 ? item.stocks[0].quantity : '',
        images: null,
    });

    const submit = (e) => {
        e.preventDefault();
        transform((f) => ({
            ...f,
            variants: f.has_variants
                ? JSON.stringify(f.variants.map(v => ({
                    ...v,
                    price: f.same_price_for_variants ? f.price : v.price,
                    cost_price: f.same_price_for_variants ? f.cost_price : v.cost_price,
                })))
                : null,
            _method: 'put',
        }));
        post(route('products.update', item.id), { forceFormData: true });
    };

    const hasVariants = data.has_variants === 1 || data.has_variants === true;
    const trackStock = data.track_stock === 1 || data.track_stock === true;
    const isActive = data.is_active === 1 || data.is_active === true;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar · ${item.name}`} />

            {/* sticky top bar */}
            <div className={`sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3
                ${isDark
                    ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60'
                    : 'bg-white/95 backdrop-blur-xl border-b border-slate-100'
                }`}
            >
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href={route('products.index')}>
                            <button className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shrink-0
                                ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            ><ArrowLeft size={16} /></button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className={`text-base font-black tracking-tight leading-none truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item.name}
                            </h1>
                            <p className={`text-[11px] font-medium mt-0.5 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {item.sku || 'Editando producto'}
                            </p>
                        </div>
                    </div>

                    <button type="submit" form="edit-form" disabled={processing}
                        className="hidden sm:flex items-center gap-2 h-9 px-5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                    >
                        {processing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Actualizar
                    </button>
                </div>
            </div>

            <form id="edit-form" onSubmit={submit}
                className="flex flex-col gap-4 py-4 pb-28 sm:pb-8 max-w-2xl mx-auto"
            >
                {/* ── información ── */}
                <SectionCard icon={Tag} title="Información General" isDark={isDark}>
                    <div className="flex flex-col gap-4">
                        <Field label="Nombre del Producto *" error={errors.name}>
                            <Input isDark={isDark} type="text" value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Nombre del producto" required
                            />
                        </Field>
                        <Field label="Descripción Corta" error={errors.short_description}>
                            <Textarea isDark={isDark} rows={2} value={data.short_description}
                                onChange={e => setData('short_description', e.target.value)}
                                placeholder="Descripción breve para el listado..."
                            />
                        </Field>
                    </div>
                </SectionCard>

                {/* ── imágenes ── */}
                <SectionCard icon={Image} title="Imágenes" isDark={isDark}>
                    {/* current images */}
                    {item.product_images?.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Actuales</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {item.product_images.map(img => (
                                    <div key={img.id} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border
                                        ${isDark ? 'border-slate-700' : 'border-slate-100'}"
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        {img.is_cover && (
                                            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-0.5 bg-blue-600/80 py-0.5">
                                                <Star size={8} className="text-white" fill="white" />
                                                <span className="text-[8px] font-black text-white tracking-wider">PORTADA</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* upload new */}
                    <Field label="Agregar Imágenes" error={errors['images.0']}>
                        <div className={`rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors
                            ${isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <input type="file" multiple accept="image/*"
                                onChange={e => setData('images', Array.from(e.target.files))}
                                className="hidden" id="img-upload-edit"
                            />
                            <label htmlFor="img-upload-edit" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                    ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                                >
                                    <Image size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {data.images?.length
                                        ? `${data.images.length} imagen${data.images.length > 1 ? 'es' : ''} nueva${data.images.length > 1 ? 's' : ''}`
                                        : 'Tocá para agregar más'}
                                </span>
                                <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Se añaden a las existentes · JPG, PNG, WEBP
                                </span>
                            </label>
                        </div>
                    </Field>
                </SectionCard>

                {/* ── inventario ── */}
                <SectionCard icon={Package} title="Inventario" isDark={isDark}>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="SKU" error={errors.sku}>
                                <Input isDark={isDark} type="text" value={data.sku}
                                    onChange={e => setData('sku', e.target.value)}
                                    placeholder="ART-001" className="font-mono"
                                />
                            </Field>
                            <Field label="Código de Barras" error={errors.barcode}>
                                <Input isDark={isDark} type="text" value={data.barcode}
                                    onChange={e => setData('barcode', e.target.value)}
                                    placeholder="779123456789" className="font-mono"
                                />
                            </Field>
                        </div>

                        <div className={`flex flex-col gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                            <Toggle isDark={isDark} label="Llevar control de stock"
                                color="blue" checked={trackStock}
                                onChange={e => setData('track_stock', e.target.checked ? 1 : 0)}
                            />
                            <Toggle isDark={isDark} label="Activo en catálogo"
                                color="emerald" checked={isActive}
                                onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                            />
                        </div>

                        {trackStock && (
                            <Field label="Stock Actual" error={errors.stock_quantity}>
                                <Input isDark={isDark} type="number" value={data.stock_quantity}
                                    onChange={e => setData('stock_quantity', e.target.value)}
                                    placeholder="0" className="font-mono"
                                />
                            </Field>
                        )}
                    </div>
                </SectionCard>

                {/* ── precios / variantes ── */}
                <SectionCard icon={DollarSign} title="Precios y Variantes" isDark={isDark}>
                    <div className="flex flex-col gap-4">
                        <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                            <Toggle isDark={isDark} label="Producto con múltiples variantes"
                                color="purple" checked={hasVariants}
                                onChange={e => setData('has_variants', e.target.checked ? 1 : 0)}
                            />
                        </div>

                        {hasVariants ? (
                            <div className="flex flex-col gap-4">
                                <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                                    <Toggle isDark={isDark} label="Precio único para todas las variantes"
                                        color="blue" checked={data.same_price_for_variants}
                                        onChange={e => setData('same_price_for_variants', e.target.checked)}
                                    />
                                </div>
                                {data.same_price_for_variants && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <PriceInput label="Precio Público *" isDark={isDark} value={data.price}
                                            onChange={e => setData('price', e.target.value)} error={errors.price} required
                                        />
                                        <PriceInput label="Precio de Costo" isDark={isDark} value={data.cost_price}
                                            onChange={e => setData('cost_price', e.target.value)} error={errors.cost_price}
                                        />
                                    </div>
                                )}
                                <VariantGenerator
                                    variantsData={data.variants}
                                    onVariantsChange={(v) => setData('variants', v)}
                                    hidePrices={data.same_price_for_variants}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <PriceInput label="Precio Público *" isDark={isDark} value={data.price}
                                    onChange={e => setData('price', e.target.value)} error={errors.price} required
                                />
                                <PriceInput label="Precio de Costo" isDark={isDark} value={data.cost_price}
                                    onChange={e => setData('cost_price', e.target.value)} error={errors.cost_price}
                                />
                            </div>
                        )}
                    </div>
                </SectionCard>
            </form>

            {/* mobile save FAB */}
            <div className="fixed bottom-6 inset-x-4 sm:hidden z-50">
                <button type="submit" form="edit-form" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold shadow-2xl shadow-blue-900/30 transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {processing ? 'Actualizando...' : 'Actualizar Producto'}
                </button>
            </div>
        </AuthenticatedLayout>
    );
}