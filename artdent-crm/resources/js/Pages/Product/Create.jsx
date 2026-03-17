import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    ArrowLeft, Save, Package, DollarSign, Image, Tag, Loader2,
    Star, X, Video, GripVertical, AlertTriangle,
} from 'lucide-react';
import VariantGenerator from '@/Components/VariantGenerator';
import RichTextEditor from '@/Components/RichTextEditor';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

// ─── atoms ─────────────────────────────────────────────────────────────────

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

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>
    );
}

function Input({ isDark, className = '', ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all
                ${isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white'
                } ${className}`}
        />
    );
}

function Select({ isDark, children, ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all
                ${isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white'
                }`}
        >
            {children}
        </select>
    );
}

function Textarea({ isDark, ...props }) {
    return (
        <textarea
            {...props}
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

// ─── MediaDropZone ──────────────────────────────────────────────────────────

function MediaDropZone({ accept, multiple, onFiles, isDark, icon: Icon, label, hint }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files?.length) onFiles(files);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all cursor-pointer select-none
                ${dragging
                    ? 'border-teal-400 scale-[1.01] ' + (isDark ? 'bg-teal-900/20' : 'bg-teal-50')
                    : isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={e => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ''; }}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                >
                    <Icon size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                </div>
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {label}
                </span>
                {hint && (
                    <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{hint}</span>
                )}
            </div>
        </div>
    );
}

// ─── ImageDragGrid ──────────────────────────────────────────────────────────

function ImageDragGrid({ images, onReorder, onRemove, isDark }) {
    const dragIdx = useRef(null);

    if (!images.length) return null;

    const handlers = (i) => ({
        draggable: true,
        onDragStart: () => { dragIdx.current = i; },
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
            e.preventDefault();
            const from = dragIdx.current;
            if (from === null || from === i) return;
            const arr = [...images];
            const [moved] = arr.splice(from, 1);
            arr.splice(i, 0, moved);
            dragIdx.current = null;
            onReorder(arr);
        },
    });

    return (
        <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, i) => (
                <div
                    key={img.uid}
                    {...handlers(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-transform active:scale-95
                        ${i === 0
                            ? (isDark ? 'border-teal-500' : 'border-teal-400')
                            : (isDark ? 'border-slate-700' : 'border-slate-200')
                        }`}
                >
                    <img src={img.preview} alt="" className="w-full h-full object-cover pointer-events-none" />

                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-80 transition-opacity">
                        <GripVertical size={12} className="text-white drop-shadow" />
                    </div>

                    {i === 0 && (
                        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-0.5 py-0.5"
                            style={{ background: `${B.teal}cc` }}
                        >
                            <Star size={7} className="text-white" fill="white" />
                            <span className="text-[8px] font-black text-white tracking-wider">PORTADA</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <X size={10} />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ─── PriceBlock ─────────────────────────────────────────────────────────────

function PriceBlock({ isDark, cost, onCostChange, price, onPriceChange, marginPct, onMarginChange, errors }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <Field label="Precio Costo" error={errors?.cost_price}>
                <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none
                        ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                    <Input
                        isDark={isDark} type="number" step="0.01"
                        value={cost} onChange={e => onCostChange(e.target.value)}
                        placeholder="0,00" className="pl-7 font-mono"
                    />
                </div>
            </Field>

            <Field label="Margen %">
                <div className="relative">
                    <Input
                        isDark={isDark} type="number" step="0.01"
                        value={marginPct} onChange={e => onMarginChange(e.target.value)}
                        placeholder="0,00" className="pr-8 font-mono"
                    />
                    <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none
                        ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>%</span>
                </div>
            </Field>

            <Field label="Precio Venta *" error={errors?.price}>
                <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none
                        ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                    <Input
                        isDark={isDark} type="number" step="0.01"
                        value={price} onChange={e => onPriceChange(e.target.value)}
                        placeholder="0,00" required className="pl-7 font-mono"
                    />
                </div>
            </Field>
        </div>
    );
}

// ─── main ──────────────────────────────────────────────────────────────────

export default function Create({ auth, categories = [], vendors = [] }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        brand: '',
        vendor_id: '',
        sku: '',
        barcode: '',
        description: '',
        category_id: '',
        cost_price: '',
        price: '',
        is_active: 1,
        has_variants: 0,
        same_price_for_variants: true,
        variants: [],
        track_stock: 1,
        stock_quantity: '',
        min_stock: '',
        images: [],
        video: null,
    });

    const [rootCatId, setRootCatId] = useState('');
    const selectedRoot = categories.find(c => String(c.id) === String(rootCatId));

    const handleRootChange = (val) => {
        setRootCatId(val);
        const cat = categories.find(c => String(c.id) === String(val));
        setData('category_id', (!cat || !cat.categories?.length) ? val : '');
    };

    // ── media state ──────────────────────────────────────────────────────────
    const [pendingImages, setPendingImages] = useState([]);
    const [pendingVideo, setPendingVideo] = useState(null);

    // ── margin state ─────────────────────────────────────────────────────────
    const [marginPct, setMarginPct] = useState('');

    // ── helpers ──────────────────────────────────────────────────────────────
    const addImages = (files) => {
        const newItems = Array.from(files).map(f => ({
            uid: Math.random().toString(36).slice(2),
            file: f,
            preview: URL.createObjectURL(f),
        }));
        const updated = [...pendingImages, ...newItems];
        setPendingImages(updated);
        setData('images', updated.map(p => p.file));
    };

    const removeImage = (idx) => {
        const updated = pendingImages.filter((_, i) => i !== idx);
        setPendingImages(updated);
        setData('images', updated.map(p => p.file));
    };

    const reorderImages = (newArr) => {
        setPendingImages(newArr);
        setData('images', newArr.map(p => p.file));
    };

    const addVideo = (files) => {
        const f = files[0];
        if (!f) return;
        setPendingVideo({ file: f, name: f.name });
        setData('video', f);
    };

    const removeVideo = () => {
        setPendingVideo(null);
        setData('video', null);
    };

    // ── price / margin logic ─────────────────────────────────────────────────
    const handleCostChange = (val) => {
        setData('cost_price', val);
        const cost = parseFloat(val);
        const pct  = parseFloat(marginPct);
        if (!isNaN(cost) && cost > 0 && !isNaN(pct)) {
            setData('price', (cost * (1 + pct / 100)).toFixed(2));
        }
    };

    const handlePriceChange = (val) => {
        setData('price', val);
        const cost  = parseFloat(data.cost_price);
        const price = parseFloat(val);
        if (!isNaN(cost) && cost > 0 && !isNaN(price) && price > 0) {
            setMarginPct(((price / cost - 1) * 100).toFixed(2));
        }
    };

    const handleMarginChange = (val) => {
        setMarginPct(val);
        const cost = parseFloat(data.cost_price);
        const pct  = parseFloat(val);
        if (!isNaN(cost) && cost > 0 && !isNaN(pct)) {
            setData('price', (cost * (1 + pct / 100)).toFixed(2));
        }
    };

    // ── low stock indicator ───────────────────────────────────────────────────
    const minStock = parseInt(data.min_stock) || 0;
    const currentStock = parseInt(data.stock_quantity) || 0;
    const isLowStock = data.track_stock && minStock > 0 && currentStock <= minStock;

    // ── submit ───────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();
        transform((f) => ({
            ...f,
            variants: f.has_variants
                ? JSON.stringify(f.variants.map(v => ({
                    ...v,
                    price: f.same_price_for_variants ? f.price : v.price,
                    cost_price: f.same_price_for_variants ? f.cost_price : v.cost_price,
                    stock_quantity: f.track_stock ? v.stock_quantity : undefined,
                })))
                : null,
        }));
        post(route('products.store'), { forceFormData: true });
    };

    const hasVariants = data.has_variants === 1 || data.has_variants === true;
    const trackStock  = data.track_stock === 1  || data.track_stock === true;
    const isActive    = data.is_active === 1    || data.is_active === true;

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Producto" />

            {/* sticky top bar */}
            <div className={`sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3
                ${isDark
                    ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60'
                    : 'bg-white/95 backdrop-blur-xl border-b border-slate-100'
                }`}
            >
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Link href={route('products.index')}>
                            <button className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors
                                ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </Link>
                        <div>
                            <h1 className={`text-base font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Nuevo Producto
                            </h1>
                            <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Agregar al catálogo
                            </p>
                        </div>
                    </div>

                    {/* desktop save */}
                    <button type="submit" form="product-form" disabled={processing}
                        className="hidden sm:flex items-center gap-2 h-9 px-5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                    >
                        {processing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Guardar
                    </button>
                </div>
            </div>

            <form id="product-form" onSubmit={submit}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4 pb-28 sm:pb-8 max-w-6xl mx-auto"
            >
                {/* ── columna principal (izquierda 2/3) ── */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* ── información general ── */}
                    <SectionCard icon={Tag} title="Información General" isDark={isDark}>
                        <div className="flex flex-col gap-4">
                            <Field label="Nombre del Producto *" error={errors.name}>
                                <Input isDark={isDark} type="text" value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej. Resina Compuesta A2" required
                                />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Marca" error={errors.brand}>
                                    <Input isDark={isDark} type="text" value={data.brand}
                                        onChange={e => setData('brand', e.target.value)}
                                        placeholder="Ej. 3M, Ivoclar"
                                    />
                                </Field>
                                <Field label="Proveedor" error={errors.vendor_id}>
                                    <Select isDark={isDark} value={data.vendor_id}
                                        onChange={e => setData('vendor_id', e.target.value)}
                                    >
                                        <option value="">Sin proveedor</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Categoría" error={errors.category_id}>
                                    <Select isDark={isDark} value={rootCatId} onChange={e => handleRootChange(e.target.value)}>
                                        <option value="">Sin categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </Field>

                                {selectedRoot?.categories?.length > 0 && (
                                    <Field label="Subcategoría" error={errors.category_id}>
                                        <Select isDark={isDark} value={data.category_id} onChange={e => setData('category_id', e.target.value || rootCatId)}>
                                            <option value={rootCatId}>— Sin subcategoría —</option>
                                            {selectedRoot.categories.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </Select>
                                    </Field>
                                )}
                            </div>

                            <Field label="Descripción" error={errors.description}>
                                <RichTextEditor
                                    isDark={isDark}
                                    value={data.description}
                                    onChange={val => setData('description', val)}
                                    placeholder="Descripción detallada del producto (se muestra en la página del producto del e-commerce)..."
                                />
                            </Field>
                        </div>
                    </SectionCard>

                    {/* ── multimedia: imágenes + video unificados ── */}
                    <SectionCard icon={Image} title="Multimedia" isDark={isDark}>
                        <div className="flex flex-col gap-5">

                            {/* ── Imágenes ── */}
                            <div className="flex flex-col gap-3">
                                <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Imágenes
                                </p>
                                <ImageDragGrid
                                    images={pendingImages}
                                    onReorder={reorderImages}
                                    onRemove={removeImage}
                                    isDark={isDark}
                                />
                                <MediaDropZone
                                    accept="image/*"
                                    multiple
                                    onFiles={addImages}
                                    isDark={isDark}
                                    icon={Image}
                                    label={pendingImages.length
                                        ? `${pendingImages.length} imagen${pendingImages.length > 1 ? 'es' : ''} · arrastrá para reordenar`
                                        : 'Arrastrá imágenes aquí o tocá para seleccionar'
                                    }
                                    hint="JPG, PNG, WEBP · Máx. 2 MB · La primera en el orden será la portada"
                                />
                                {errors['images.0'] && <p className="text-red-500 text-xs font-medium">{errors['images.0']}</p>}
                            </div>

                            {/* ── divisor ── */}
                            <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />

                            {/* ── Video ── */}
                            <div className="flex flex-col gap-3">
                                <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Video (opcional)
                                </p>
                                {pendingVideo ? (
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Video size={18} style={{ color: B.teal }} className="shrink-0" />
                                        <span className={`text-sm font-medium truncate flex-1
                                            ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                                        >
                                            {pendingVideo.name}
                                        </span>
                                        <button type="button" onClick={removeVideo}
                                            className="w-6 h-6 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <MediaDropZone
                                        accept="video/*"
                                        multiple={false}
                                        onFiles={addVideo}
                                        isDark={isDark}
                                        icon={Video}
                                        label="Arrastrá un video o tocá para seleccionar"
                                        hint="MP4, MOV, WEBM · Máx. 50 MB"
                                    />
                                )}
                                {errors.video && <p className="text-red-500 text-xs font-medium">{errors.video}</p>}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* ── columna lateral (derecha 1/3) ── */}
                <div className="flex flex-col gap-4">

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
                                <Toggle isDark={isDark} label="Producto activo en catálogo"
                                    color="emerald" checked={isActive}
                                    onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                />
                            </div>

                            {trackStock && !hasVariants && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Stock Inicial" error={errors.stock_quantity}>
                                        <Input isDark={isDark} type="number" value={data.stock_quantity}
                                            onChange={e => setData('stock_quantity', e.target.value)}
                                            placeholder="0" className="font-mono"
                                        />
                                    </Field>
                                    <Field label="Stock Mínimo" error={errors.min_stock}>
                                        <Input isDark={isDark} type="number" value={data.min_stock}
                                            onChange={e => setData('min_stock', e.target.value)}
                                            placeholder="0" className="font-mono"
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* alerta stock bajo */}
                            {isLowStock && (
                                <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border
                                    ${isDark ? 'bg-amber-900/20 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                                >
                                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium leading-snug">
                                        El stock ingresado ({currentStock}) está en o por debajo del mínimo ({minStock}).
                                    </p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* ── precios y variantes ── */}
                    <SectionCard icon={DollarSign} title="Precios y Variantes" isDark={isDark}>
                        <div className="flex flex-col gap-4">
                            <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                                <Toggle isDark={isDark} label="Producto con múltiples variantes"
                                    color="purple" checked={hasVariants}
                                    onChange={e => setData('has_variants', e.target.checked ? 1 : 0)}
                                />
                            </div>

                            {hasVariants && (
                                <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                                    <Toggle isDark={isDark} label="Precio único para todas las variantes"
                                        color="blue" checked={data.same_price_for_variants}
                                        onChange={e => setData('same_price_for_variants', e.target.checked)}
                                    />
                                </div>
                            )}

                            {(!hasVariants || data.same_price_for_variants) && (
                                <PriceBlock
                                    isDark={isDark}
                                    cost={data.cost_price}        onCostChange={handleCostChange}
                                    price={data.price}            onPriceChange={handlePriceChange}
                                    marginPct={marginPct}         onMarginChange={handleMarginChange}
                                    errors={errors}
                                />
                            )}
                        </div>
                    </SectionCard>
                </div>

                {/* ── tabla de variantes: ancho completo ── */}
                {hasVariants && (
                    <div className="lg:col-span-3">
                        <SectionCard icon={DollarSign} title="Tabla de Variantes" isDark={isDark}>
                            <VariantGenerator
                                variantsData={data.variants}
                                onVariantsChange={(v) => setData('variants', v)}
                                hidePrices={data.same_price_for_variants}
                                trackStock={trackStock}
                            />
                        </SectionCard>
                    </div>
                )}
            </form>

            {/* mobile save FAB */}
            <div className="fixed bottom-6 inset-x-4 sm:hidden z-50">
                <button type="submit" form="product-form" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold shadow-2xl shadow-blue-900/30 transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {processing ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </div>
        </AuthenticatedLayout>
    );
}
