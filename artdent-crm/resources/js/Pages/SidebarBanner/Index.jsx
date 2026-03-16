import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    Plus, Trash2, Save, Image, ToggleLeft, ToggleRight,
    GripVertical, ExternalLink, Info,
} from 'lucide-react';

/* ── Dimensiones de referencia para diseñadores ────────────────────────
   Panel sidebar en e-commerce:
     Desktop: 224 px (w-56) → 256 px (xl:w-64), altura ~380-480 px
     Imagen recomendada : 512 × 760 px  (ratio 2:3, portrait)
     Zona segura        : 460 × 700 px  (margen 26 px por lado)
   Mobile: el panel está oculto (hidden lg:flex), sólo aplica desktop.
──────────────────────────────────────────────────────────────────────── */

function BannerForm({ auth, banner = null, onClose }) {
    const { isDark } = useTheme();
    const fileRef = useRef(null);
    const isEdit = !!banner;

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        cta_label: banner?.cta_label ?? '',
        cta_url: banner?.cta_url ?? '',
        sort_order: banner?.sort_order ?? 0,
        is_active: banner?.is_active ?? true,
        image: null,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const [preview, setPreview] = useState(banner?.image_url ?? null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) { return; }
        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        const url = isEdit
            ? route('sidebar-banners.update', banner.id)
            : route('sidebar-banners.store');
        post(url, { forceFormData: true, onSuccess: () => { reset(); onClose?.(); } });
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1 font-medium';

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Imagen */}
            <div>
                <label className={lbl}>Imagen del banner</label>
                <div
                    onClick={() => fileRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors
                        ${isDark ? 'border-slate-700 hover:border-teal-500 bg-slate-800/40' : 'border-slate-200 hover:border-teal-400 bg-slate-50'}
                        ${preview ? 'h-48' : 'h-36'}`}
                >
                    {preview ? (
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center px-4">
                            <Image size={28} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Clic para subir imagen
                            </span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                PNG / JPG · 512 × 760 px recomendado
                            </span>
                        </div>
                    )}
                    {preview && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold">Cambiar imagen</span>
                        </div>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {errors.image && <p className={err}>{errors.image}</p>}
            </div>

            {/* Campos */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className={lbl}>Título</label>
                    <input className={inp} value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Catálogo Profesional" />
                    {errors.title && <p className={err}>{errors.title}</p>}
                </div>
                <div>
                    <label className={lbl}>Subtítulo</label>
                    <input className={inp} value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} placeholder="Insumos para laboratorio" />
                    {errors.subtitle && <p className={err}>{errors.subtitle}</p>}
                </div>
                <div>
                    <label className={lbl}>Texto del botón CTA</label>
                    <input className={inp} value={data.cta_label} onChange={e => setData('cta_label', e.target.value)} placeholder="Ver catálogo" />
                    {errors.cta_label && <p className={err}>{errors.cta_label}</p>}
                </div>
                <div>
                    <label className={lbl}>URL del botón CTA</label>
                    <input className={inp} value={data.cta_url} onChange={e => setData('cta_url', e.target.value)} placeholder="/productos" />
                    {errors.cta_url && <p className={err}>{errors.cta_url}</p>}
                </div>
                <div>
                    <label className={lbl}>Orden</label>
                    <input className={inp} type="number" min="0" max="255" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
                    {errors.sort_order && <p className={err}>{errors.sort_order}</p>}
                </div>
                <div className="flex items-end pb-1">
                    <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_active ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="font-medium text-sm">Activo en el sitio</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                {onClose && (
                    <Button type="button" variant="outline" onClick={onClose}
                        className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-28">
                    <Save size={14} /> {processing ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear banner')}
                </Button>
            </div>
        </form>
    );
}

export default function Index({ auth, banners }) {
    const { isDark } = useTheme();
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleDelete = (id) => {
        if (!confirm('¿Eliminar este banner? La imagen también se borrará.')) { return; }
        router.delete(route('sidebar-banners.destroy', id), { preserveScroll: true });
    };

    const card = `rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Banners del Sidebar" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Banners del Sidebar
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Imágenes del panel lateral del e-commerce (sección Productos)
                        </p>
                    </div>
                    <Button
                        onClick={() => { setShowCreate(v => !v); setEditingId(null); }}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    >
                        <Plus size={15} /> Nuevo banner
                    </Button>
                </div>

                {/* Guía de dimensiones */}
                <div className={`rounded-xl border px-4 py-3 flex gap-3 text-sm ${isDark ? 'bg-slate-800/40 border-slate-700 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                    <Info size={16} className="shrink-0 mt-0.5 opacity-70" />
                    <div>
                        <span className="font-bold">Dimensiones recomendadas:</span>{' '}
                        <span className="font-mono">512 × 760 px</span> (ratio 2:3, portrait) ·
                        Zona segura: <span className="font-mono">460 × 700 px</span> ·
                        Formatos: PNG o JPG · Máx. 4 MB.
                        El panel mide <span className="font-mono">224–256 px</span> de ancho en desktop.
                    </div>
                </div>

                {/* Formulario nuevo */}
                {showCreate && (
                    <div className={`${card} p-6`}>
                        <h2 className={`text-base font-bold mb-5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Nuevo banner</h2>
                        <BannerForm auth={auth} onClose={() => setShowCreate(false)} />
                    </div>
                )}

                {/* Lista de banners */}
                <div className={`${card} overflow-hidden`}>
                    {banners.length === 0 ? (
                        <div className="p-12 text-center">
                            <Image size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No hay banners</p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Creá el primer banner para el sidebar del e-commerce.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {banners.map(banner => (
                                <div key={banner.id}>
                                    <div className={`flex items-center gap-4 px-4 py-3 transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                        {/* Drag handle visual */}
                                        <GripVertical size={16} className={`shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />

                                        {/* Thumbnail */}
                                        <div className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                            {banner.image_url ? (
                                                <img src={banner.image_url} alt={banner.title ?? 'Banner'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image size={18} className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {banner.title || <span className="text-slate-400 font-normal italic">Sin título</span>}
                                            </p>
                                            {banner.subtitle && (
                                                <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{banner.subtitle}</p>
                                            )}
                                            {banner.cta_url && (
                                                <p className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                                                    <ExternalLink size={10} /> {banner.cta_url}
                                                </p>
                                            )}
                                        </div>

                                        {/* Orden */}
                                        <span className={`text-xs font-mono hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            #{banner.sort_order}
                                        </span>

                                        {/* Estado */}
                                        {banner.is_active ? (
                                            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <ToggleRight size={11} /> Activo
                                            </span>
                                        ) : (
                                            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                                <ToggleLeft size={11} /> Inactivo
                                            </span>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm" variant="outline"
                                                onClick={() => setEditingId(editingId === banner.id ? null : banner.id)}
                                                className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm" variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(banner.id)}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Formulario de edición inline */}
                                    {editingId === banner.id && (
                                        <div className={`px-4 pb-5 pt-2 border-t ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-50 bg-slate-50/60'}`}>
                                            <BannerForm
                                                auth={auth}
                                                banner={banner}
                                                onClose={() => setEditingId(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
