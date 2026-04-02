import React, { useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    Plus,
    Trash2,
    Save,
    Image,
    ToggleLeft,
    ToggleRight,
    GripVertical,
    Info,
    ChevronDown,
    ChevronUp,
    Type,
    Palette,
    LayoutTemplate,
} from 'lucide-react';

const SLIDE_TYPE_OPTIONS = [
    {
        value: 'image',
        title: 'Solo imagen',
        description: 'Mantiene el comportamiento actual: banner visual completo y clic sobre toda la imagen.',
    },
    {
        value: 'editorial',
        title: 'Editorial',
        description: 'Permite sumar títulos, subtítulo, descripción breve y botón sin perder la estética del hero.',
    },
];

const ALIGN_OPTIONS = [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
];

const WIDTH_OPTIONS = [
    { value: 'sm', label: 'Compacto' },
    { value: 'md', label: 'Medio' },
    { value: 'lg', label: 'Amplio' },
];

const HEIGHT_OPTIONS = [
    { value: 'compact', label: 'Compacto' },
    { value: 'regular', label: 'Regular' },
    { value: 'immersive', label: 'Impactante' },
];

const FONT_OPTIONS = [
    { value: 'brand', label: 'Marca' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'impact', label: 'Impacto' },
];

const TITLE_SIZE_OPTIONS = [
    { value: 'sm', label: 'Pequeño' },
    { value: 'md', label: 'Medio' },
    { value: 'lg', label: 'Grande' },
    { value: 'xl', label: 'XL' },
];

const BODY_SIZE_OPTIONS = [
    { value: 'sm', label: 'Pequeño' },
    { value: 'md', label: 'Medio' },
    { value: 'lg', label: 'Grande' },
];

const OVERLAY_OPTIONS = [
    { value: 'none', label: 'Sin overlay' },
    { value: 'soft', label: 'Suave' },
    { value: 'medium', label: 'Medio' },
    { value: 'strong', label: 'Fuerte' },
];

const SURFACE_OPTIONS = [
    { value: 'none', label: 'Sin panel' },
    { value: 'glass', label: 'Cristal' },
    { value: 'solid', label: 'Sólido' },
];

const DEFAULT_COLORS = {
    eyebrow_color: '#ACD6CE',
    title_color: '#FFFFFF',
    subtitle_color: '#E2E8F0',
    description_color: '#D8E2F0',
    button_bg_color: '#FFFFFF',
    button_text_color: '#0F172A',
    button_border_color: '#FFFFFF33',
};

const CONTENT_PADDING_CLASSES = {
    compact: 'p-3 sm:p-4 md:p-5',
    regular: 'p-4 sm:p-5 md:p-6',
    immersive: 'p-5 sm:p-6 md:p-7',
};

const WIDTH_CLASSES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
};

const ALIGN_WRAPPER_CLASSES = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
};

const SURFACE_CLASSES = {
    none: '',
    glass: 'backdrop-blur-md bg-slate-950/14 border border-white/8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.95)]',
    solid: 'bg-slate-950/30 border border-white/10 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.95)]',
};

const TITLE_CLASS_MAP = {
    brand: {
        sm: 'text-[clamp(1.8rem,4.4vw,2.8rem)] font-extrabold tracking-[-0.05em] leading-[0.92]',
        md: 'text-[clamp(2.1rem,5vw,3.5rem)] font-extrabold tracking-[-0.05em] leading-[0.92]',
        lg: 'text-[clamp(2.4rem,5.7vw,4.2rem)] font-black tracking-[-0.055em] leading-[0.9]',
        xl: 'text-[clamp(2.8rem,6.5vw,5rem)] font-black tracking-[-0.06em] leading-[0.88]',
    },
    editorial: {
        sm: 'text-[clamp(1.7rem,4vw,2.6rem)] font-semibold tracking-[-0.04em] leading-[0.98]',
        md: 'text-[clamp(2rem,4.7vw,3.2rem)] font-semibold tracking-[-0.045em] leading-[0.96]',
        lg: 'text-[clamp(2.3rem,5.5vw,3.9rem)] font-bold tracking-[-0.05em] leading-[0.94]',
        xl: 'text-[clamp(2.7rem,6.2vw,4.6rem)] font-bold tracking-[-0.055em] leading-[0.92]',
    },
    impact: {
        sm: 'text-[clamp(1.8rem,4.3vw,2.8rem)] font-black uppercase tracking-[-0.06em] leading-[0.88]',
        md: 'text-[clamp(2.2rem,5.2vw,3.6rem)] font-black uppercase tracking-[-0.07em] leading-[0.86]',
        lg: 'text-[clamp(2.6rem,6vw,4.4rem)] font-black uppercase tracking-[-0.075em] leading-[0.84]',
        xl: 'text-[clamp(3rem,6.8vw,5.2rem)] font-black uppercase tracking-[-0.08em] leading-[0.82]',
    },
};

const BODY_CLASS_MAP = {
    sm: 'text-[clamp(0.92rem,1.8vw,1rem)] leading-relaxed',
    md: 'text-[clamp(1rem,2vw,1.12rem)] leading-relaxed',
    lg: 'text-[clamp(1.05rem,2.2vw,1.22rem)] leading-relaxed',
};

const inputBase = (isDark) => `w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400 ${
    isDark
        ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
}`;

function selectLabel(options, value) {
    return options.find((option) => option.value === value)?.label
        ?? options.find((option) => option.value === value)?.title
        ?? value;
}

function buildOverlayBackground(strength, align) {
    if (strength === 'none') {
        return 'transparent';
    }

    const gradients = {
        left: {
            soft: 'linear-gradient(90deg, rgba(15,23,42,0.48) 0%, rgba(15,23,42,0.22) 34%, rgba(15,23,42,0.08) 62%, rgba(15,23,42,0) 100%)',
            medium: 'linear-gradient(90deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.34) 38%, rgba(15,23,42,0.14) 68%, rgba(15,23,42,0.02) 100%)',
            strong: 'linear-gradient(90deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.48) 40%, rgba(15,23,42,0.22) 72%, rgba(15,23,42,0.06) 100%)',
        },
        center: {
            soft: 'radial-gradient(circle at center, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.32) 54%, rgba(15,23,42,0.56) 100%)',
            medium: 'radial-gradient(circle at center, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.42) 54%, rgba(15,23,42,0.68) 100%)',
            strong: 'radial-gradient(circle at center, rgba(15,23,42,0.24) 0%, rgba(15,23,42,0.52) 54%, rgba(15,23,42,0.78) 100%)',
        },
        right: {
            soft: 'linear-gradient(270deg, rgba(15,23,42,0.48) 0%, rgba(15,23,42,0.22) 34%, rgba(15,23,42,0.08) 62%, rgba(15,23,42,0) 100%)',
            medium: 'linear-gradient(270deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.34) 38%, rgba(15,23,42,0.14) 68%, rgba(15,23,42,0.02) 100%)',
            strong: 'linear-gradient(270deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.48) 40%, rgba(15,23,42,0.22) 72%, rgba(15,23,42,0.06) 100%)',
        },
    };

    return gradients[align]?.[strength] ?? gradients.left.medium;
}

function HeroSlidePreview({ slide, compact = false }) {
    const isEditorial = slide.slide_type === 'editorial';
    const imageUrl = slide.image_url || null;
    const alignmentClass = ALIGN_WRAPPER_CLASSES[slide.content_align] ?? ALIGN_WRAPPER_CLASSES.left;
    const widthClass = WIDTH_CLASSES[slide.content_width] ?? WIDTH_CLASSES.md;
    const titleClass = TITLE_CLASS_MAP[slide.font_style]?.[slide.title_size] ?? TITLE_CLASS_MAP.brand.lg;
    const bodyClass = BODY_CLASS_MAP[slide.body_size] ?? BODY_CLASS_MAP.md;
    const overlayBackground = buildOverlayBackground(slide.overlay_strength, slide.content_align);
    const surfaceClass = SURFACE_CLASSES[slide.surface_style] ?? SURFACE_CLASSES.none;
    const contentPaddingClass = CONTENT_PADDING_CLASSES[slide.height_mode] ?? CONTENT_PADDING_CLASSES.regular;

    if (!isEditorial) {
        return (
            <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 ${compact ? 'aspect-[16/5]' : 'aspect-[16/5]'}`}>
                {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(90,173,156,0.35),rgba(15,23,42,0.96))] text-white/70">
                        <div className="text-center px-6">
                            <Image size={compact ? 18 : 26} className="mx-auto mb-2 opacity-70" />
                            <p className={`font-semibold ${compact ? 'text-[11px]' : 'text-sm'}`}>Preview de slide clásico</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 aspect-[16/5]">
            {imageUrl ? (
                <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,201,151,0.45),rgba(15,23,42,0.94))]" />
            )}
            <div className="absolute inset-0" style={{ background: overlayBackground }} />
            <div className={`relative z-10 flex h-full w-full px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 ${alignmentClass}`}>
                <div className={`w-full ${widthClass}`}>
                    <div className={`${surfaceClass} ${surfaceClass ? 'rounded-[24px]' : ''} ${contentPaddingClass}`}>
                        {slide.eyebrow && (
                            <p
                                className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em]"
                                style={{ color: slide.eyebrow_color || DEFAULT_COLORS.eyebrow_color }}
                            >
                                {slide.eyebrow}
                            </p>
                        )}
                        {slide.title && (
                            <h3
                                className={`${titleClass} mb-2`}
                                style={{ color: slide.title_color || DEFAULT_COLORS.title_color }}
                            >
                                {slide.title}
                            </h3>
                        )}
                        {slide.subtitle && (
                            <p
                                className={`mb-2 ${compact ? 'text-sm' : 'text-base sm:text-lg'} font-semibold`}
                                style={{ color: slide.subtitle_color || DEFAULT_COLORS.subtitle_color }}
                            >
                                {slide.subtitle}
                            </p>
                        )}
                        {slide.description && (
                            <p
                                className={`${bodyClass} ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}
                                style={{ color: slide.description_color || DEFAULT_COLORS.description_color }}
                            >
                                {slide.description}
                            </p>
                        )}
                        {(slide.button_label || slide.button_url || slide.click_url) && (
                            <div className="mt-4">
                                <span
                                    className="inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
                                    style={{
                                        backgroundColor: slide.button_bg_color || DEFAULT_COLORS.button_bg_color,
                                        color: slide.button_text_color || DEFAULT_COLORS.button_text_color,
                                        borderColor: slide.button_border_color || DEFAULT_COLORS.button_border_color,
                                    }}
                                >
                                    {slide.button_label || 'Explorar'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorInput({ label, field, value, setData, isDark }) {
    const inputClasses = inputBase(isDark);

    return (
        <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    className="h-11 w-12 rounded-xl border border-slate-200 bg-transparent p-1"
                    value={value || '#ffffff'}
                    onChange={(e) => setData(field, e.target.value.toUpperCase())}
                />
                <input
                    className={inputClasses}
                    value={value}
                    onChange={(e) => setData(field, e.target.value.toUpperCase())}
                    placeholder="#FFFFFF"
                />
            </div>
        </div>
    );
}

function SlideForm({ slide = null, onClose }) {
    const { isDark } = useTheme();
    const fileRef = useRef(null);
    const isEdit = !!slide;

    const { data, setData, post, processing, errors, reset } = useForm({
        click_url: slide?.click_url ?? '',
        slide_type: slide?.slide_type ?? 'image',
        eyebrow: slide?.eyebrow ?? '',
        title: slide?.title ?? '',
        subtitle: slide?.subtitle ?? '',
        description: slide?.description ?? '',
        button_label: slide?.button_label ?? '',
        button_url: slide?.button_url ?? '',
        content_align: slide?.content_align ?? 'left',
        content_width: slide?.content_width ?? 'md',
        height_mode: slide?.height_mode ?? 'regular',
        font_style: slide?.font_style ?? 'brand',
        title_size: slide?.title_size ?? 'lg',
        body_size: slide?.body_size ?? 'md',
        overlay_strength: slide?.overlay_strength ?? 'medium',
        surface_style: slide?.surface_style ?? 'none',
        eyebrow_color: slide?.eyebrow_color ?? DEFAULT_COLORS.eyebrow_color,
        title_color: slide?.title_color ?? DEFAULT_COLORS.title_color,
        subtitle_color: slide?.subtitle_color ?? DEFAULT_COLORS.subtitle_color,
        description_color: slide?.description_color ?? DEFAULT_COLORS.description_color,
        button_bg_color: slide?.button_bg_color ?? DEFAULT_COLORS.button_bg_color,
        button_text_color: slide?.button_text_color ?? DEFAULT_COLORS.button_text_color,
        button_border_color: slide?.button_border_color ?? DEFAULT_COLORS.button_border_color,
        sort_order: slide?.sort_order ?? 0,
        is_active: slide?.is_active ?? true,
        image: null,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const [preview, setPreview] = useState(slide?.image_url ?? null);

    const previewSlide = useMemo(() => ({
        ...data,
        image_url: preview,
    }), [data, preview]);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        const url = isEdit ? route('hero-slides.update', slide.id) : route('hero-slides.store');
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose?.();
            },
        });
    };

    const inp = inputBase(isDark);
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1 font-medium';
    const isEditorial = data.slide_type === 'editorial';

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/70'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <LayoutTemplate size={16} className="text-teal-500" />
                            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Tipo de slide</h3>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {SLIDE_TYPE_OPTIONS.map((option) => {
                                const active = data.slide_type === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData('slide_type', option.value)}
                                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                                            active
                                                ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_0_1px_rgba(20,184,166,0.2)]'
                                                : (isDark ? 'border-slate-700 bg-slate-800/60 hover:border-slate-500' : 'border-slate-200 bg-white hover:border-slate-300')
                                        }`}
                                    >
                                        <p className={`font-bold mb-1 ${active ? 'text-teal-400' : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                                            {option.title}
                                        </p>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {option.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/70'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Image size={16} className="text-teal-500" />
                            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Imagen y navegación</h3>
                        </div>

                        <div>
                            <label className={lbl}>Imagen del slide</label>
                            <div
                                onClick={() => fileRef.current?.click()}
                                className={`relative cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                                    isDark ? 'border-slate-700 hover:border-teal-500 bg-slate-800/40' : 'border-slate-200 hover:border-teal-400 bg-slate-50'
                                } ${preview ? 'aspect-[16/5]' : 'h-36'}`}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-center px-4">
                                        <Image size={24} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Clic para subir imagen
                                        </span>
                                        <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            1440 x 450 px · ratio 16:5 · JPG, PNG, GIF o WEBP · max 100 MB
                                        </span>
                                    </div>
                                )}
                                {preview && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-bold">Cambiar imagen</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleFile}
                            />
                            {errors.image && <p className={err}>{errors.image}</p>}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 mt-4">
                            <div className="sm:col-span-2">
                                <label className={lbl}>
                                    {isEditorial ? 'URL secundaria del slide' : 'URL al hacer clic'}
                                </label>
                                <input
                                    className={inp}
                                    value={data.click_url}
                                    onChange={e => setData('click_url', e.target.value)}
                                    placeholder="/productos"
                                />
                                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {isEditorial
                                        ? 'La podés usar como destino general o dejarla vacía y trabajar solo con el botón.'
                                        : 'En modo simple, toda la imagen funciona como enlace.'}
                                </p>
                                {errors.click_url && <p className={err}>{errors.click_url}</p>}
                            </div>
                            <div>
                                <label className={lbl}>Orden</label>
                                <input
                                    className={inp}
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={data.sort_order}
                                    onChange={e => setData('sort_order', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <label className={`flex items-center gap-3 cursor-pointer mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                />
                                <div
                                    className={`block w-10 h-6 rounded-full transition-colors ${
                                        data.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                    }`}
                                />
                                <div
                                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                        data.is_active ? 'translate-x-4' : ''
                                    }`}
                                />
                            </div>
                            <span className="font-medium text-sm">Slide activo</span>
                        </label>
                    </section>

                    {isEditorial && (
                        <>
                            <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/70'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Type size={16} className="text-teal-500" />
                                    <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Contenido</h3>
                                </div>

                                <div className="grid gap-3">
                                    <div>
                                        <label className={lbl}>Eyebrow / etiqueta breve</label>
                                        <input
                                            className={inp}
                                            value={data.eyebrow}
                                            onChange={e => setData('eyebrow', e.target.value)}
                                            placeholder="Nuevo lanzamiento"
                                        />
                                        {errors.eyebrow && <p className={err}>{errors.eyebrow}</p>}
                                    </div>

                                    <div>
                                        <label className={lbl}>Título principal</label>
                                        <input
                                            className={inp}
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Todo tu laboratorio, más simple"
                                        />
                                        {errors.title && <p className={err}>{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className={lbl}>Subtítulo</label>
                                        <input
                                            className={inp}
                                            value={data.subtitle}
                                            onChange={e => setData('subtitle', e.target.value)}
                                            placeholder="Insumos, ofertas y entregas desde un solo lugar"
                                        />
                                        {errors.subtitle && <p className={err}>{errors.subtitle}</p>}
                                    </div>

                                    <div>
                                        <label className={lbl}>Descripción breve</label>
                                        <textarea
                                            className={`${inp} min-h-[96px] resize-y`}
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value.slice(0, 210))}
                                            maxLength={210}
                                            placeholder="Texto corto, claro y orientado a conversión. En mobile se adapta sin romper la composición."
                                        />
                                        <div className={`mt-1 flex items-center justify-between text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <span>Máximo 210 caracteres.</span>
                                            <span>{data.description.length}/210</span>
                                        </div>
                                        {errors.description && <p className={err}>{errors.description}</p>}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className={lbl}>Texto del botón</label>
                                            <input
                                                className={inp}
                                                value={data.button_label}
                                                onChange={e => setData('button_label', e.target.value)}
                                                placeholder="Explorar catálogo"
                                            />
                                            {errors.button_label && <p className={err}>{errors.button_label}</p>}
                                        </div>
                                        <div>
                                            <label className={lbl}>URL del botón</label>
                                            <input
                                                className={inp}
                                                value={data.button_url}
                                                onChange={e => setData('button_url', e.target.value)}
                                                placeholder="/productos?destacados=1"
                                            />
                                            {errors.button_url && <p className={err}>{errors.button_url}</p>}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/70'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Palette size={16} className="text-teal-500" />
                                    <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Composición y estilo</h3>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    <div>
                                        <label className={lbl}>Alineación</label>
                                        <select className={inp} value={data.content_align} onChange={e => setData('content_align', e.target.value)}>
                                            {ALIGN_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Ancho del contenido</label>
                                        <select className={inp} value={data.content_width} onChange={e => setData('content_width', e.target.value)}>
                                            {WIDTH_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Altura</label>
                                        <select className={inp} value={data.height_mode} onChange={e => setData('height_mode', e.target.value)}>
                                            {HEIGHT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Tipografía</label>
                                        <select className={inp} value={data.font_style} onChange={e => setData('font_style', e.target.value)}>
                                            {FONT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Tamaño del título</label>
                                        <select className={inp} value={data.title_size} onChange={e => setData('title_size', e.target.value)}>
                                            {TITLE_SIZE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Tamaño del texto</label>
                                        <select className={inp} value={data.body_size} onChange={e => setData('body_size', e.target.value)}>
                                            {BODY_SIZE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Overlay</label>
                                        <select className={inp} value={data.overlay_strength} onChange={e => setData('overlay_strength', e.target.value)}>
                                            {OVERLAY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Superficie del texto</label>
                                        <select className={inp} value={data.surface_style} onChange={e => setData('surface_style', e.target.value)}>
                                            {SURFACE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mt-4">
                                    <ColorInput label="Color eyebrow" field="eyebrow_color" value={data.eyebrow_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Color título" field="title_color" value={data.title_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Color subtítulo" field="subtitle_color" value={data.subtitle_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Color descripción" field="description_color" value={data.description_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Fondo botón" field="button_bg_color" value={data.button_bg_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Texto botón" field="button_text_color" value={data.button_text_color} setData={setData} isDark={isDark} />
                                    <ColorInput label="Borde botón" field="button_border_color" value={data.button_border_color} setData={setData} isDark={isDark} />
                                </div>
                            </section>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <section className={`rounded-2xl border p-4 sticky top-6 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Preview</p>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {isEditorial
                                        ? 'Vista editorial adaptable del hero.'
                                        : 'Vista clásica full-banner.'}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {isEditorial ? 'Editorial' : 'Imagen'}
                            </span>
                        </div>

                        <HeroSlidePreview slide={previewSlide} />

                        <div className={`mt-4 rounded-2xl px-3 py-3 text-xs leading-relaxed ${isDark ? 'bg-slate-800/70 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                            <p className="font-semibold mb-1">Tip profesional:</p>
                            <p>
                                Para slides editoriales, usá fondos con áreas de respiro y textos de no más de 2 líneas de título + 2 líneas de apoyo.
                                Así se mantiene elegante en desktop y también legible en mobile.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                {onClose && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}
                    >
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-28">
                    <Save size={14} /> {processing ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear slide')}
                </Button>
            </div>
        </form>
    );
}

export default function Index({ auth, slides }) {
    const { isDark } = useTheme();
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleDelete = (id) => {
        if (!confirm('Eliminar este slide? La imagen tambien se borrara.')) {
            return;
        }

        router.delete(route('hero-slides.destroy', id), { preserveScroll: true });
    };

    const card = `rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Carrusel Hero" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Carrusel Hero
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Mezclá slides visuales y editoriales en el orden exacto que quieras mostrar en el e-commerce.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setShowCreate(v => !v);
                            setEditingId(null);
                        }}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    >
                        <Plus size={15} /> Nuevo slide
                    </Button>
                </div>

                <div className={`rounded-xl border px-4 py-3 flex gap-3 text-sm ${isDark ? 'bg-slate-800/40 border-slate-700 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                    <Info size={16} className="shrink-0 mt-0.5 opacity-70" />
                    <span>
                        <strong>Compatibilidad total:</strong> los slides actuales de solo imagen siguen funcionando. El nuevo modo editorial suma
                        texto, CTA y estilo responsive sin romper el carrusel ni el orden existente.
                    </span>
                </div>

                {showCreate && (
                    <div className={`${card} p-6`}>
                        <h2 className={`text-base font-bold mb-5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Nuevo slide</h2>
                        <SlideForm onClose={() => setShowCreate(false)} />
                    </div>
                )}

                <div className={`${card} overflow-hidden`}>
                    {slides.length === 0 ? (
                        <div className="p-12 text-center">
                            <Image size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No hay slides</p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Cuando no hay slides activos, el storefront mantiene su fallback visual actual.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {slides.map(slide => {
                                const isEditorial = slide.slide_type === 'editorial';
                                return (
                                    <div key={slide.id}>
                                        <div className={`flex items-start gap-3 px-4 py-4 transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <GripVertical size={16} className={`shrink-0 mt-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />

                                            <div className="shrink-0 w-40 max-w-[40%]">
                                                <HeroSlidePreview slide={slide} compact />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                        isEditorial
                                                            ? (isDark ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-50 text-teal-700')
                                                            : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')
                                                    }`}>
                                                        {isEditorial ? 'Editorial' : 'Imagen'}
                                                    </span>
                                                    <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Orden #{slide.sort_order}
                                                    </span>
                                                    <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {selectLabel(ALIGN_OPTIONS, slide.content_align)} · {selectLabel(HEIGHT_OPTIONS, slide.height_mode)}
                                                    </span>
                                                </div>

                                                <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {slide.title || slide.subtitle || slide.click_url || 'Slide sin título'}
                                                </p>

                                                <p className={`text-xs truncate mt-1 ${
                                                    slide.click_url
                                                        ? (isDark ? 'text-teal-400' : 'text-teal-600')
                                                        : (isDark ? 'text-slate-500' : 'text-slate-400')
                                                }`}>
                                                    {slide.button_url || slide.click_url || 'Sin enlace'}
                                                </p>

                                                {slide.description && (
                                                    <p className={`text-xs mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {slide.description}
                                                    </p>
                                                )}
                                            </div>

                                            {slide.is_active ? (
                                                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                                    isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    <ToggleRight size={11} /> Activo
                                                </span>
                                            ) : (
                                                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                                    isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    <ToggleLeft size={11} /> Inactivo
                                                </span>
                                            )}

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                                                    className={`gap-1 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}
                                                >
                                                    {editingId === slide.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDelete(slide.id)}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </div>

                                        {editingId === slide.id && (
                                            <div className={`px-4 pb-6 pt-3 border-t ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-50 bg-slate-50/60'}`}>
                                                <SlideForm slide={slide} onClose={() => setEditingId(null)} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
