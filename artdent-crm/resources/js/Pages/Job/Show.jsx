import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import dayjs from "dayjs";

export default function Show({ auth, item }) {
    const { isDark } = useTheme();

    const B = { blue: "#397B9C", teal: "#49949C" };

    const StatusBadge = ({ status }) => {
        const colors = {
            'pending': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'in_progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'delivered': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
            'cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
        };

        const labels = {
            'pending': 'Pendiente',
            'in_progress': 'En Proceso',
            'completed': 'Terminado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado',
        };

        const css = colors[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        const label = labels[status] || status;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${css}`}>
                {label.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Trabajo ${item.job_number}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Orden {item.job_number}
                            <StatusBadge status={item.status} />
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Ingresada el {item.received_at ? dayjs(item.received_at).format('DD/MM/YYYY') : '-'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('jobs.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : ""}>
                                <ArrowLeft className="mr-2" size={16} /> Volver
                            </Button>
                        </Link>
                        <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : ""}>
                            <Printer className="mr-2" size={16} /> Imprimir
                        </Button>
                        <Link href={route('jobs.edit', item.id)}>
                            <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none shadow-md">
                                <Edit className="mr-2" size={16} /> Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden shadow-sm
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-8">
                        <div>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Referencias
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Odontólogo</div>
                                    <div className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {item.dentist?.name} {item.dentist?.last_name}
                                    </div>
                                </div>
                                {item.patient && (
                                    <div>
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Paciente</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {item.patient.name} {item.patient.last_name}
                                        </div>
                                    </div>
                                )}
                                {item.user && (
                                    <div>
                                        <div className={`text-sm border-t pt-2 mt-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                            Técnico Asignado
                                        </div>
                                        <div className={`font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                            {item.user.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Especificaciones del Trabajo
                            </h3>
                            <div className={`rounded-xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tipo</div>
                                        <div className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {item.job_type?.name || '-'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tono / Color</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {item.shade || '-'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fecha Estimada Ent.</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {item.due_date ? dayjs(item.due_date).format('DD/MM/YYYY') : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(item.description || item.clinical_notes || item.notes) && (
                        <div className={`p-8 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            {item.description && (
                                <div className="mb-6">
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Descripción / Indicaciones
                                    </h3>
                                    <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.clinical_notes && (
                                <div className="mb-6">
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Notas Clínicas
                                    </h3>
                                    <div className={`p-4 rounded-lg text-sm border-l-2
                                        ${isDark ? 'bg-slate-800/80 border-blue-500/50 text-slate-300' : 'bg-blue-50/50 border-blue-400 text-slate-700'}
                                    `}>
                                        {item.clinical_notes}
                                    </div>
                                </div>
                            )}
                            
                            {item.notes && (
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Notas de Laboratorio
                                    </h3>
                                    <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {item.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
