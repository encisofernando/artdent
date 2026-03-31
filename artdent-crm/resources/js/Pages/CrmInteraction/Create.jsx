import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: "#397B9C", teal: "#49949C" };

export default function Create({ auth, dentists, crmClients }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        dentist_id: '',
        crm_client_id: '',
        type: '',
        direction: '',
        subject: '',
        interaction_at: '',
        followup_date: '',
        notes: '',
        outcome: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('crm-interactions.store'));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Interacción CRM" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nueva Interacción
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar una nueva interacción CRM
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('crm-interactions.index')}>
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
                            <MessageSquare size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos de la Interacción
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Odontólogo (opcional)</label>
                                <SearchableSelect
                                    value={data.dentist_id}
                                    onChange={v => setData('dentist_id', v)}
                                    options={(dentists || []).map(d => ({ value: String(d.id), label: d.name }))}
                                    placeholder="-- Sin odontólogo --"
                                    error={errors.dentist_id}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Cliente CRM (opcional)</label>
                                <SearchableSelect
                                    value={data.crm_client_id}
                                    onChange={v => setData('crm_client_id', v)}
                                    options={(crmClients || []).map(c => ({ value: String(c.id), label: c.name }))}
                                    placeholder="-- Sin cliente --"
                                    error={errors.crm_client_id}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Tipo *</label>
                                <SearchableSelect
                                    value={data.type}
                                    onChange={v => setData('type', v)}
                                    options={[
                                        { value: 'llamada', label: 'Llamada' },
                                        { value: 'email', label: 'Email' },
                                        { value: 'whatsapp', label: 'WhatsApp' },
                                        { value: 'visita', label: 'Visita' },
                                        { value: 'reunion', label: 'Reunión' },
                                        { value: 'otro', label: 'Otro' },
                                    ]}
                                    placeholder="Seleccionar..."
                                    required
                                    error={errors.type}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Dirección *</label>
                                <SearchableSelect
                                    value={data.direction}
                                    onChange={v => setData('direction', v)}
                                    options={[
                                        { value: 'inbound', label: 'Entrante' },
                                        { value: 'outbound', label: 'Saliente' },
                                    ]}
                                    placeholder="Seleccionar..."
                                    required
                                    error={errors.direction}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Fecha y Hora *</label>
                                <input
                                    type="datetime-local"
                                    value={data.interaction_at}
                                    onChange={e => setData('interaction_at', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                                {errors.interaction_at && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.interaction_at}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Fecha de Seguimiento</label>
                                <input
                                    type="date"
                                    value={data.followup_date}
                                    onChange={e => setData('followup_date', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.followup_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.followup_date}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Asunto</label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={e => setData('subject', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Consulta sobre presupuesto..."
                                />
                                {errors.subject && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.subject}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Resultado / Conclusión</label>
                                <input
                                    type="text"
                                    value={data.outcome}
                                    onChange={e => setData('outcome', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Interesado, requiere seguimiento..."
                                />
                                {errors.outcome && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.outcome}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Notas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Detalles adicionales..."
                                    rows="4"
                                />
                                {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('crm-interactions.index')}>
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
                            Guardar Interacción
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
