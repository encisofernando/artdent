import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    ArrowLeft, Save, Package, DollarSign, Image, Tag, Loader2,
    Star, X, Video, GripVertical, Trash2, AlertTriangle, RefreshCcw,
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
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                {hint && <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{hint}</span>}
            </div>
        </div>
    );
}

// ─── ImageDragGrid ──────────────────────────────────────────────────────────

function ImageDragGrid({ images, onReorder, onRemove, isDark, label }) {
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
        <div className="flex flex-col gap-2">
            {label && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            )}
            <div className="flex flex-wrap gap-2">
                {images.map((img, i) => {
                    const src = img.url || img.preview;
                    const key = img.id ?? img.uid;
                    const isCover = i === 0;

                    return (
                        <div
                            key={key}
                            {...handlers(i)}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-transform active:scale-95
                                ${isCover
                                    ? (isDark ? 'border-teal-500' : 'border-teal-400')
                                    : (isDark ? 'border-slate-700' : 'border-slate-200')
                                }`}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover pointer-events-none" />

                            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-80 transition-opacity">
                                <GripVertical size={12} className="text-white drop-shadow" />
                            </div>

                            {isCover && (
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
                    );
                })}
            </div>
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

const genSku = (productName = '', attributes = {}) => {
    const STOP = new Set(['de','del','la','las','el','los','en','con','por','para','un','una','y','o','e','x','i']);
    const norm = s => String(s)
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();

    const nameWords = norm(productName).split(/\s+/).filter(w => w.length > 2 && !STOP.has(w.toLowerCase()));
    const mainWord  = [...nameWords].sort((a, b) => b.length - a.length)[0] || '';
    const prefix    = (mainWord.slice(0, 3) || 'SKU');

    const attrVals = Object.values(attributes).filter(Boolean);
    if (attrVals.length === 0) {
        return prefix + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    const parts = attrVals.map(val => {
        const v = norm(val);
        if (!v) return '';
        if (v.length <= 5 && !/\s/.test(v)) return v;
        const words = v.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
            if (words.every(w => w.length <= 3)) return words.join('');
            return words.map(w => w.length <= 3 ? w : w[0]).join('');
        }
        return v.slice(0, 3);
    }).filter(Boolean);

    return [prefix, ...parts].join('-');
};

export default function Edit({ auth, item, categories = [], vendors = [] }) {
    const { isDark } = useTheme();

    // ── categoría: inicializar raíz correctamente según category_id del item ──
    const initRootCatId = () => {
        if (!item.category_id) return '';
        const asRoot = categories.find(c => c.id === item.category_id);
        if (asRoot) return String(asRoot.id);
        const asParent = categories.find(c => c.categories?.some(s => s.id === item.category_id));
        return asParent ? String(asParent.id) : '';
    };
    const [rootCatId, setRootCatId] = useState(initRootCatId);
    const selectedRoot = categories.find(c => String(c.id) === String(rootCatId));

    const handleRootChange = (val) => {
        setRootCatId(val);
        const cat = categories.find(c => String(c.id) === String(val));
        setData('category_id', (!cat || !cat.categories?.length) ? val : '');
    };

    // ── imágenes existentes ───────────────────────────────────────────────────
    const [existingImages, setExistingImages] = useState(
        [...(item.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    );
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [pendingImages, setPendingImages] = useState([]);
    const [pendingVideo, setPendingVideo] = useState(null);

    // ── form ──────────────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, transform } = useForm({
        name: item.name || '',
        brand: item.brand || '',
        vendor_id: item.vendor_id ? String(item.vendor_id) : '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        description: item.description || '',
        category_id: item.category_id ? String(item.category_id) : '',
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
            barcode: v.barcode || '',
            price: v.price || '',
            cost_price: v.cost_price || '',
            stock_quantity: v.stocks?.length > 0 ? v.stocks[0].quantity : '',
            is_active: v.is_active,
            attributes: v.variant_attribute_values?.reduce((acc, curr) => {
                acc[curr.product_attribute_value.product_attribute.name] = curr.product_attribute_value.value;
                return acc;
            }, {}) ?? {},
        })) ?? [],
        track_stock: item.track_stock !== undefined ? item.track_stock : 1,
        stock_quantity: item.stocks?.length > 0 ? item.stocks[0].quantity : '',
        min_stock: item.min_stock ?? '',
        images: [],
        video: null,
    });

    // ── margin % (local, no se envía al backend) ──────────────────────────────
    const [marginPct, setMarginPct] = useState(() => {
        const cost  = parseFloat(item.cost_price);
        const price = parseFloat(item.price);
        if (!isNaN(cost) && cost > 0 && !isNaN(price) && price > 0) {
            return ((price / cost - 1) * 100).toFixed(2);
        }
        return '';
    });

    // ── handlers imágenes ─────────────────────────────────────────────────────
    const removeExisting = (idx) => {
        const img = existingImages[idx];
        setDeletedImageIds(prev => [...prev, img.id]);
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

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

    const removePending = (idx) => {
        const updated = pendingImages.filter((_, i) => i !== idx);
        setPendingImages(updated);
        setData('images', updated.map(p => p.file));
    };

    const reorderPending = (newArr) => {
        setPendingImages(newArr);
        setData('images', newArr.map(p => p.file));
    };

    // ── handlers video ────────────────────────────────────────────────────────
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

    // ── price / margin ────────────────────────────────────────────────────────
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

    const normalizeVariantOptionalField = (value) => {
        if (value === undefined) return undefined;
        if (value === null) return null;

        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        }

        return value;
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();
        transform((f) => ({
            ...f,
            variants: f.has_variants
                ? JSON.stringify(f.variants.map(v => ({
                    ...v,
                    sku: normalizeVariantOptionalField(v.sku),
                    price: normalizeVariantOptionalField(f.same_price_for_variants ? f.price : v.price),
                    cost_price: normalizeVariantOptionalField(f.same_price_for_variants ? f.cost_price : v.cost_price),
                    stock_quantity: f.track_stock ? normalizeVariantOptionalField(v.stock_quantity) : undefined,
                })))
                : null,
            image_sort: existingImages.map(img => img.id),
            deleted_image_ids: deletedImageIds,
            cover_image_id: existingImages[0]?.id ?? null,
            _method: 'put',
        }));
        post(route('products.update', item.id), { forceFormData: true });
    };

    const handleDelete = () => {
        if (!window.confirm(`¿Eliminar "${item.name}"?\n\nEsta acción eliminará el producto y todos sus datos. No se puede deshacer.`)) return;
        router.delete(route('products.destroy', item.id));
    };

    const hasVariants = data.has_variants === 1 || data.has_variants === true;
    const trackStock  = data.track_stock === 1  || data.track_stock === true;
    const isActive    = data.is_active === 1    || data.is_active === true;

    // ── render ────────────────────────────────────────────────────────────────
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
                <div className="flex items-center justify-between max-w-6xl mx-auto">
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

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold border transition-all active:scale-95
                                ${isDark
                                    ? 'bg-red-900/20 border-red-800/40 text-red-400 hover:bg-red-900/40'
                                    : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                }`}
                        >
                            <Trash2 size={14} />
                            Eliminar
                        </button>

                        <button type="submit" form="edit-form" disabled={processing}
                            className="hidden sm:flex items-center gap-2 h-9 px-5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                        >
                            {processing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <form id="edit-form" onSubmit={submit}
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
                                    placeholder="Nombre del producto" required
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

                                {existingImages.length > 0 && (
                                    <ImageDragGrid
                                        images={existingImages}
                                        onReorder={setExistingImages}
                                        onRemove={removeExisting}
                                        isDark={isDark}
                                        label="Actuales · arrastrá para reordenar"
                                    />
                                )}

                                {pendingImages.length > 0 && (
                                    <ImageDragGrid
                                        images={pendingImages}
                                        onReorder={reorderPending}
                                        onRemove={removePending}
                                        isDark={isDark}
                                        label="Nuevas"
                                    />
                                )}

                                <MediaDropZone
                                    accept="image/*"
                                    multiple
                                    onFiles={addImages}
                                    isDark={isDark}
                                    icon={Image}
                                    label="Arrastrá imágenes aquí o tocá para seleccionar"
                                    hint="Se anaden a las existentes · JPG, PNG, WEBP · Max. 100 MB"
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

                                {item.video_url && !pendingVideo && (
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Video size={18} style={{ color: B.teal }} className="shrink-0" />
                                        <span className={`text-sm font-medium truncate flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Video actual
                                        </span>
                                        <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-bold underline mr-2"
                                            style={{ color: B.teal }}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            Ver
                                        </a>
                                    </div>
                                )}

                                {pendingVideo ? (
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <Video size={18} style={{ color: B.teal }} className="shrink-0" />
                                        <span className={`text-sm font-medium truncate flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                                        label={item.video_url ? 'Reemplazar video' : 'Arrastrá un video o tocá para seleccionar'}
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
                                    <div className="flex gap-1.5">
                                        <Input isDark={isDark} type="text" value={data.sku}
                                            onChange={e => setData('sku', e.target.value)}
                                            placeholder="ART-001" className="font-mono flex-1"
                                        />
                                        <button type="button" title="Generar SKU desde el nombre"
                                            onClick={() => setData('sku', genSku(data.name))}
                                            className={`shrink-0 px-2 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
                                            <RefreshCcw size={13} />
                                        </button>
                                    </div>
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

                            {trackStock && !hasVariants && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Stock Actual" error={errors.stock_quantity}>
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
                                        El stock ({currentStock}) está en o por debajo del mínimo ({minStock}).
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
                                    cost={data.cost_price}    onCostChange={handleCostChange}
                                    price={data.price}        onPriceChange={handlePriceChange}
                                    marginPct={marginPct}     onMarginChange={handleMarginChange}
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
                                productName={data.name}
                            />
                        </SectionCard>
                    </div>
                )}
            </form>

            {/* mobile bottom bar: guardar + eliminar */}
            <div className="fixed bottom-6 inset-x-4 sm:hidden z-50 flex gap-3">
                <button
                    type="button"
                    onClick={handleDelete}
                    className={`flex items-center justify-center gap-2 h-14 px-5 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] border
                        ${isDark
                            ? 'bg-red-900/30 border-red-800/50 text-red-400'
                            : 'bg-red-50 border-red-200 text-red-500'
                        }`}
                >
                    <Trash2 size={18} />
                </button>

                <button type="submit" form="edit-form" disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold shadow-2xl shadow-blue-900/30 transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {processing ? 'Actualizando...' : 'Actualizar Producto'}
                </button>
            </div>
        </AuthenticatedLayout>
    );
}
