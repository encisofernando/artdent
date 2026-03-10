import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';

const B = { blue: "#397B9C", teal: "#49949C" };

function formatDatetimeLocal(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Edit({ auth, item, dentists, crmClients }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        dentist_id: item.dentist_id || '',
        crm_client_id: item.crm_client_id || '',
        type: item.type || '',
        direction: item.direction || '',
        subject: item.subject || '',
        interaction_at: formatDatetimeLocal(item.interaction_at),
        followup_date: item.followup_date ? item.followup_date.split('T')[0] : '',
        notes: item.notes || '',
        outcome: item.outcome || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('crm-interactions.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Editar Interacción CRM" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Interacción
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando interacción del {item.interaction_at ? new Date(item.interaction_at).toLocaleDateString('es-AR') : ''}
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
                                <select
                                    value={data.dentist_id}
                                    onChange={e => setData('dentist_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">-- Sin odontólogo --</option>
                                    {dentists?.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Cliente CRM (opcional)</label>
                                <select
                                    value={data.crm_client_id}
                                    onChange={e => setData('crm_client_id', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">-- Sin cliente --</option>
                                    {crmClients?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.crm_client_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.crm_client_id}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Tipo *</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="llamada">Llamada</option>
                                    <option value="email">Email</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="visita">Visita</option>
                                    <option value="reunion">Reunión</option>
                                    <option value="otro">Otro</option>
                                </select>
                                {errors.type && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.type}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Dirección *</label>
                                <select
                                    value={data.direction}
                                    onChange={e => setData('direction', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="inbound">Entrante</option>
                                    <option value="outbound">Saliente</option>
                                </select>
                                {errors.direction && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.direction}</div>}
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
                            Actualizar Interacción
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
