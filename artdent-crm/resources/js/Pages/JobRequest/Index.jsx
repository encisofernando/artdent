import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import { Inbox, Paperclip, ArrowRight, X } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function Index({ auth, requests }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();

    const reject = (r) => {
        confirmDialog(`¿Rechazar la solicitud de ${r.dentist}${r.patient_name ? ` (${r.patient_name})` : ''}?`, () => {
            router.post(route('job-requests.reject', r.id), {}, { preserveScroll: true });
        });
    };

    const card = `rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Solicitudes de trabajo" />

            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Solicitudes de trabajo
                    </h1>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Enviadas por odontólogos desde su portal — convertilas en una orden real con tarifas y fases, o rechazalas.
                    </p>
                </div>

                {requests.length === 0 ? (
                    <div className={`${card} p-10 text-center`}>
                        <Inbox size={28} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay solicitudes pendientes.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {requests.map((r) => (
                            <div key={r.id} className={`${card} p-5`}>
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{r.dentist}</p>
                                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {[r.patient_name, r.job_type_label].filter(Boolean).join(' · ') || 'Sin detalles adicionales'}
                                        </p>
                                        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Enviada {r.created_at}{r.due_date_requested ? ` · Entrega deseada ${r.due_date_requested}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            onClick={() => reject(r)}
                                            className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}
                                        >
                                            <X size={14} className="mr-1.5" /> Rechazar
                                        </Button>
                                        <Link href={route('jobs.create', { job_request_id: r.id })}>
                                            <Button
                                                className="text-white border-none"
                                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                            >
                                                Convertir <ArrowRight size={14} className="ml-1.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {r.notes && (
                                    <p className={`text-xs mt-3 rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                                        {r.notes}
                                    </p>
                                )}

                                {r.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {r.attachments.map((a) => (
                                            <a
                                                key={a.id}
                                                href={a.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                                            >
                                                <Paperclip size={11} /> {a.filename}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
