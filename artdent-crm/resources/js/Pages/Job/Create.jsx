import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Briefcase, FileText, User } from 'lucide-react';

export default function Create({ auth, dentists, patients, jobTypes, users }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        dentist_id: '',
        patient_id: '',
        job_type_id: '',
        assigned_user_id: '',
        status: 'pending',
        priority: 'normal',
        description: '',
        clinical_notes: '',
        shade: '',
        received_at: new Date().toISOString().split('T')[0],
        due_date: '',
        delivered_at: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('jobs.store'));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ingresar Trabajo" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Ingresar Trabajo
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar nueva orden de laboratorio
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('jobs.index')}>
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
                            <User size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Referencias
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Odontólogo *</label>
                                <select
                                    value={data.dentist_id}
                                    onChange={e => setData('dentist_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccione Odontólogo...</option>
                                    {dentists.map(dentist => (
                                        <option key={dentist.id} value={dentist.id}>
                                            {dentist.name} {dentist.last_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Paciente</label>
                                <select
                                    value={data.patient_id}
                                    onChange={e => setData('patient_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccione Paciente...</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} {patient.last_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.patient_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.patient_id}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Briefcase size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Especificaciones del Trabajo
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Tipo de Trabajo</label>
                                <select
                                    value={data.job_type_id}
                                    onChange={e => setData('job_type_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccione...</option>
                                    {jobTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.job_type_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.job_type_id}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Color / Tono (Shade)</label>
                                <input
                                    type="text"
                                    value={data.shade}
                                    onChange={e => setData('shade', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej: A2, B1..."
                                />
                                {errors.shade && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.shade}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Estado inicial *</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="in_progress">En Proceso</option>
                                    <option value="completed">Terminado</option>
                                </select>
                                {errors.status && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.status}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Fecha de Recepción</label>
                                <input
                                    type="date"
                                    value={data.received_at}
                                    onChange={e => setData('received_at', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.received_at && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.received_at}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Fecha de Entrega (Estimada)</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.due_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.due_date}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Técnico Asignado</label>
                                <select
                                    value={data.assigned_user_id}
                                    onChange={e => setData('assigned_user_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccione Técnico...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                                {errors.assigned_user_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.assigned_user_id}</div>}
                            </div>

                            <div className="md:col-span-3">
                                <label className={labelClasses}>Descripción detallada / Indicaciones</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={inputClasses}
                                    rows="3"
                                    placeholder="Instrucciones del trabajo a realizar..."
                                />
                                {errors.description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</div>}
                            </div>

                            <div className="md:col-span-3">
                                <label className={labelClasses}>Notas Clínicas adicionales</label>
                                <textarea
                                    value={data.clinical_notes}
                                    onChange={e => setData('clinical_notes', e.target.value)}
                                    className={inputClasses}
                                    rows="2"
                                />
                                {errors.clinical_notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.clinical_notes}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('jobs.index')}>
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
                            Guardar Trabajo
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
