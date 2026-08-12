import { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Paperclip, Radio } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C', green: '#5AAD9C' };

const POLL_INTERVAL_MS = 15_000;

const PHASE_COLORS = {
    completed: { dot: B.green, ring: B.green, line: '#ACD6CE', text: null },
    in_progress: { dot: B.blue, ring: B.blue, line: '#e2e8f0', text: B.blue },
    prueba: { dot: B.blue, ring: B.blue, line: '#e2e8f0', text: B.blue },
    pending: { dot: '#fff', ring: '#cbd5e1', line: '#e2e8f0', text: '#94a3b8' },
};

const PHASE_STATUS_LABELS = {
    pending: 'Pendiente',
    in_progress: 'En proceso',
    prueba: 'En prueba',
    completed: 'Completada',
};

export default function JobShow({ job, phases, attachments }) {
    const { isDark } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['job', 'phases', 'attachments'] });
        }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, []);

    const card = `rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`;

    return (
        <DentistPortalLayout>
            <Head title={`Orden ${job.number}`} />

            <div className="flex flex-col gap-6">
                <Link
                    href={route('dentist-portal.show')}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold w-fit ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <ArrowLeft size={15} /> Mis trabajos
                </Link>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <p className="text-xs font-mono font-bold" style={{ color: B.blue }}>{job.number}</p>
                        <h1 className={`text-xl font-extrabold tracking-tight mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {job.job_type || 'Trabajo de laboratorio'}
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {job.patient ? `Paciente: ${job.patient}` : null}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: `${B.blue}1a` }}>
                        <Radio size={12} style={{ color: B.blue }} className="animate-pulse" />
                        <span className="text-[11px] font-bold" style={{ color: B.blue }}>En vivo · act. cada 15s</span>
                    </div>
                </div>

                {job.shade && (
                    <div className={`${card} p-4 grid grid-cols-2 gap-3`}>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tono</p>
                            <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{job.shade}</p>
                        </div>
                        {job.due_date && (
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Entrega estimada</p>
                                <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{job.due_date}</p>
                            </div>
                        )}
                    </div>
                )}

                {phases.length > 0 && (
                    <div className={`${card} p-5`}>
                        <p className={`text-xs font-bold uppercase tracking-wide mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Seguimiento</p>
                        <div className="flex flex-col">
                            {phases.map((phase, i) => {
                                const colors = PHASE_COLORS[phase.status] ?? PHASE_COLORS.pending;
                                const isLast = i === phases.length - 1;
                                return (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-3.5 h-3.5 rounded-full shrink-0"
                                                style={{ background: colors.dot, border: `2px solid ${colors.ring}` }}
                                            />
                                            {!isLast && <div className="w-0.5 flex-1 min-h-[26px]" style={{ background: colors.line }} />}
                                        </div>
                                        <div className="pb-5">
                                            <p className="text-sm font-bold" style={{ color: colors.text ?? (isDark ? '#f1f5f9' : '#1e293b') }}>
                                                {phase.label}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {phase.time ?? PHASE_STATUS_LABELS[phase.status]}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={`${card} p-5`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Escaneos y adjuntos</p>
                    {attachments.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no hay archivos adjuntos a este trabajo.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {attachments.map((a) => (
                                <a
                                    key={a.id}
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${B.blue}1a` }}>
                                        <Paperclip size={15} style={{ color: B.blue }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{a.filename}</p>
                                        <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{a.size_label}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DentistPortalLayout>
    );
}
