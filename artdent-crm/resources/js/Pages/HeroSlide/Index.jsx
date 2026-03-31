import React, { useRef, useState } from 'react';
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
} from 'lucide-react';

function SlideForm({ slide = null, onClose }) {
    const { isDark } = useTheme();
    const fileRef = useRef(null);
    const isEdit = !!slide;

    const { data, setData, post, processing, errors, reset } = useForm({
        click_url: slide?.click_url ?? '',
        sort_order: slide?.sort_order ?? 0,
        is_active: slide?.is_active ?? true,
        image: null,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const [preview, setPreview] = useState(slide?.image_url ?? null);

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

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${
            isDark
                ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1 font-medium';

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
                <label className={lbl}>Imagen del slide</label>
                <div
                    onClick={() => fileRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors
                        ${isDark ? 'border-slate-700 hover:border-teal-500 bg-slate-800/40' : 'border-slate-200 hover:border-teal-400 bg-slate-50'}
                        ${preview ? 'aspect-[16/5]' : 'h-32'}`}
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

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <label className={lbl}>URL al hacer clic</label>
                    <input
                        className={inp}
                        value={data.click_url}
                        onChange={e => setData('click_url', e.target.value)}
                        placeholder="/productos"
                    />
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

            <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            data.is_active ? 'translate-x-4' : ''
                        }`}
                    />
                </div>
                <span className="font-medium text-sm">Slide activo</span>
            </label>

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

            <div className="flex flex-col gap-6 font-sans max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Carrusel Hero
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Imagenes del carrusel principal del e-commerce
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
                        <strong>Imagen recomendada:</strong>{' '}
                        <span className="font-mono">1440 x 450 px</span> (ratio 16:5) · JPG, PNG, GIF o WEBP · max 100 MB.
                        La imagen ocupa el 100% del ancho en desktop y mobile.
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
                                Sin slides activos, el carrusel muestra el contenido estatico de marca.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {slides.map(slide => (
                                <div key={slide.id}>
                                    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                        <GripVertical size={16} className={`shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />

                                        <div className="shrink-0 w-24 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                            {slide.image_url ? (
                                                <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image size={14} className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-mono truncate ${
                                                slide.click_url
                                                    ? (isDark ? 'text-teal-400' : 'text-teal-600')
                                                    : (isDark ? 'text-slate-600' : 'text-slate-400')
                                            }`}>
                                                {slide.click_url || 'Sin URL'}
                                            </p>
                                            <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                Orden #{slide.sort_order}
                                            </p>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
