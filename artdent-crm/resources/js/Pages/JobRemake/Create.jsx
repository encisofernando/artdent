import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, RefreshCcw } from 'lucide-react';

const B = { blue: "#397B9C", teal: "#49949C" };

export default function Create({ auth, jobs, prefillJobId }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        job_id: prefillJobId ? String(prefillJobId) : '',
        original_job_id: '',
        responsibility: '',
        reason_category: '',
        description: '',
        material_cost: '',
        labor_cost: '',
        charged_to: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('job-remakes.store'));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Rehacimiento" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Rehacimiento
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar un trabajo que necesitó rehacerse
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('job-remakes.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <RefreshCcw size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos del Rehacimiento
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Trabajo (nuevo) *</label>
                                <select
                                    value={data.job_id}
                                    onChange={e => setData('job_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">-- Seleccionar trabajo --</option>
                                    {jobs?.map(j => (
                                        <option key={j.id} value={j.id}>
                                            {j.job_number}{j.dentist?.name ? ` — ${j.dentist.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.job_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.job_id}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Trabajo Original *</label>
                                <select
                                    value={data.original_job_id}
                                    onChange={e => setData('original_job_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">-- Seleccionar trabajo original --</option>
                                    {jobs?.filter(j => String(j.id) !== String(data.job_id)).map(j => (
                                        <option key={j.id} value={j.id}>
                                            {j.job_number}{j.dentist?.name ? ` — ${j.dentist.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.original_job_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.original_job_id}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Responsabilidad *</label>
                                <select
                                    value={data.responsibility}
                                    onChange={e => setData('responsibility', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="lab">Laboratorio</option>
                                    <option value="dentist">Odontólogo</option>
                                    <option value="patient">Paciente</option>
                                    <option value="material">Material</option>
                                    <option value="unknown">Desconocido</option>
                                </select>
                                {errors.responsibility && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.responsibility}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Cargado a *</label>
                                <select
                                    value={data.charged_to}
                                    onChange={e => setData('charged_to', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="lab">Laboratorio</option>
                                    <option value="dentist">Odontólogo</option>
                                    <option value="insurance">Seguro</option>
                                </select>
                                {errors.charged_to && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.charged_to}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Categoría / Motivo</label>
                                <input
                                    type="text"
                                    value={data.reason_category}
                                    onChange={e => setData('reason_category', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Error de ajuste, fractura..."
                                />
                                {errors.reason_category && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.reason_category}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:col-span-1">
                                <div>
                                    <label className={labelClasses}>Costo Material</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.material_cost}
                                        onChange={e => setData('material_cost', e.target.value)}
                                        className={inputClasses}
                                        placeholder="0.00"
                                    />
                                    {errors.material_cost && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.material_cost}</div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Costo Laboral</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.labor_cost}
                                        onChange={e => setData('labor_cost', e.target.value)}
                                        className={inputClasses}
                                        placeholder="0.00"
                                    />
                                    {errors.labor_cost && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.labor_cost}</div>}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Descripción</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Detalles sobre el rehacimiento..."
                                    rows="4"
                                />
                                {errors.description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</div>}
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('job-remakes.index')}>
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
                            Guardar Rehacimiento
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
