import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Info } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth, categories }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        sort_order: 0,
        is_active: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categorys.store'));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Categoría" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nueva Categoría
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Crear una nueva categoría para tus productos
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('categorys.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Info size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Información General
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre de Categoría *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Resinas, Herramientas..."
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Categoría Padre</label>
                                <SearchableSelect
                                    value={String(data.parent_id || '')}
                                    onChange={v => setData('parent_id', v)}
                                    placeholder="Ninguna (Categoría Raíz)"
                                    options={(categories ?? []).map(cat => ({ value: String(cat.id), label: cat.name }))}
                                />
                                {errors.parent_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.parent_id}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Slug (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Dejar en blanco para auto-generar"
                                />
                                {errors.slug && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.slug}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Descripción</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Breve descripción..."
                                    rows="3"
                                />
                                {errors.description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Orden (Opcional)</label>
                                <input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={e => setData('sort_order', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.sort_order && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.sort_order}</div>}
                            </div>
                            
                            <div className="md:col-span-1 flex items-center mt-2 md:mt-6">
                                <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.is_active === 1 || data.is_active === true}
                                            onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true)
                                            ? 'bg-emerald-500'
                                            : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                        }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'transform translate-x-4' : ''
                                        }`}></div>
                                    </div>
                                    <div className="ml-3 font-medium text-sm">
                                        Categoría Activa
                                    </div>
                                </label>
                            </div>

                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('categorys.index')}>
                            <Button
                                type="button"
                                variant="outline"
                                className={isDark ? "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800" : ""}
                            >
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
                            Crear Categoría
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
