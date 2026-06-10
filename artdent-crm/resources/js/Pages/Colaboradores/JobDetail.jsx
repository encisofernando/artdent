import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Loader2, Printer, Send, UserCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';

const AD = { blue: '#397B9C', teal: '#5AAD9C', mint: '#ACD6CE', orange: '#F4A261', red: '#E63946' };

const PHASE_STATUS = {
    pending:     { label: 'Pendiente',  icon: Clock,          color: '#64748b' },
    in_progress: { label: 'En Proceso', icon: Loader2,        color: AD.blue },
    prueba:      { label: 'En Prueba',  icon: AlertTriangle,  color: AD.orange },
    completed:   { label: 'Completado', icon: CheckCircle2,   color: AD.teal },
};

const PRIORITY_LABELS = { normal: 'Normal', urgent: 'Urgente', rush: 'Extra Urgente' };
const PRIORITY_COLORS = { normal: '#64748b', urgent: AD.orange, rush: AD.red };

const STATUS_LABELS = {
    received: 'Pendiente', in_progress: 'En Proceso',
    quality_check: 'En Prueba', ready: 'Terminado',
    delivered: 'Entregado', cancelled: 'Cancelado',
};

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function JobDetail({ colaborador, job }) {
    const [confirming, setConfirming] = useState(null); // 'prueba' | 'complete'
    const [loading, setLoading] = useState(false);
    const [claimingPhase, setClaimingPhase] = useState(false);

    // Fase activa que pertenece a ESTE colaborador
    const myActivePhase = job.phases?.find(p =>
        p.is_mine && (p.status === 'in_progress' || p.status === 'prueba')
    );

    const handleClaim = (phase) => {
        setClaimingPhase(true);
        router.post(route('colaboradores.phases.claim', phase.id), {}, {
            onFinish: () => setClaimingPhase(false),
        });
    };

    const handlePrueba = () => {
        if (!myActivePhase) return;
        setLoading(true);
        router.post(route('colaboradores.jobs.phases.prueba', { job: job.id, phase: myActivePhase.id }), {}, {
            onFinish: () => { setLoading(false); setConfirming(null); },
        });
    };

    const handleComplete = () => {
        if (!myActivePhase) return;
        setLoading(true);
        router.post(route('colaboradores.jobs.phases.complete', { job: job.id, phase: myActivePhase.id }), {}, {
            onFinish: () => { setLoading(false); setConfirming(null); },
        });
    };

    // Fase disponible para tomar (si existe y este colaborador no tiene ya una activa)
    const claimablePhase = !myActivePhase
        ? job.phases?.find(p => p.is_claimable)
        : null;

    return (
        <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <Head title={`Trabajo ${job.job_number}`} />

            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-slate-800" style={{ background: '#0f172a' }}>
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button onClick={() => router.get(route('colaboradores.dashboard'))}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold font-mono text-sm">{job.job_number}</p>
                        <p className="text-slate-500 text-xs truncate">{job.dentist?.name ?? '—'}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ color: PRIORITY_COLORS[job.priority] ?? '#64748b', background: `${PRIORITY_COLORS[job.priority] ?? '#64748b'}20` }}>
                        {PRIORITY_LABELS[job.priority] ?? job.priority}
                    </span>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 mt-5 space-y-4">

                {/* Info del trabajo */}
                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Estado</p>
                            <p className="text-white font-semibold">{STATUS_LABELS[job.status] ?? job.status}</p>
                        </div>
                        {job.patient && (
                            <div>
                                <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Paciente</p>
                                <p className="text-white font-semibold truncate">{job.patient.name}</p>
                            </div>
                        )}
                        {job.shade && (
                            <div>
                                <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Tono</p>
                                <p className="text-white font-semibold">{job.shade}</p>
                            </div>
                        )}
                        {job.due_date && (
                            <div>
                                <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Entrega</p>
                                <p className="text-white font-semibold">{new Date(job.due_date).toLocaleDateString('es-AR')}</p>
                            </div>
                        )}
                    </div>
                    {job.description && (
                        <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-700 leading-relaxed">{job.description}</p>
                    )}
                </div>

                {/* Fases del trabajo */}
                {job.has_phases && (
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-700">
                            <p className="text-white font-bold text-sm">Fases de Trabajo</p>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {job.phases.map((phase) => {
                                const meta = PHASE_STATUS[phase.status] ?? PHASE_STATUS.pending;
                                const Icon = meta.icon;
                                const isActive = phase.status === 'in_progress' || phase.status === 'prueba';

                                return (
                                    <div key={phase.id}
                                        className={`px-4 py-3 transition-colors ${isActive && phase.is_mine ? 'bg-slate-700/40' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Indicador de estado */}
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                                                style={{
                                                    background: phase.status === 'completed' ? `${AD.teal}20` : isActive ? `${meta.color}20` : '#1e293b',
                                                    color: phase.status === 'completed' ? AD.teal : meta.color,
                                                    border: `1.5px solid ${phase.status === 'completed' ? AD.teal : isActive ? meta.color : '#334155'}`,
                                                }}>
                                                {phase.status === 'completed'
                                                    ? <CheckCircle2 size={14} />
                                                    : <Icon size={14} className={phase.status === 'in_progress' ? 'animate-spin' : ''} />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-white font-semibold text-sm">{phase.phase_name}</p>
                                                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                                                        style={{ color: meta.color, background: `${meta.color}20` }}>
                                                        {meta.label}
                                                    </span>
                                                    {phase.is_mine && (
                                                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                                                            style={{ color: AD.teal, background: `${AD.teal}15` }}>
                                                            Tuya
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Técnico asignado */}
                                                {phase.collaborator_name && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <UserCheck size={11} className="text-slate-500" />
                                                        <p className="text-slate-400 text-xs">{phase.collaborator_name}</p>
                                                    </div>
                                                )}
                                                {!phase.collaborator_name && phase.status !== 'pending' && (
                                                    <p className="text-slate-500 text-xs mt-0.5">Sin asignar</p>
                                                )}

                                                <p className="text-slate-400 text-xs mt-0.5">$ {fmt(phase.price)}</p>

                                                {phase.completed_at && (
                                                    <p className="text-slate-500 text-[11px] mt-0.5">
                                                        Completado: {new Date(phase.completed_at).toLocaleString('es-AR')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Ticket si está completada */}
                                            {phase.ticket && (
                                                <button
                                                    onClick={() => router.get(route('colaboradores.jobs.phases.ticket', { job: job.id, phase: phase.id }))}
                                                    className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                                    title="Ver ticket">
                                                    <Printer size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Sin fases configuradas */}
                {!job.has_phases && (
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 text-center">
                        <p className="text-slate-500 text-sm">Este trabajo no tiene fases configuradas en el arancel.</p>
                    </div>
                )}

                {/* Botón "Tomar esta fase" si hay una disponible y yo no tengo ninguna activa */}
                {claimablePhase && (
                    <div className="rounded-2xl border border-slate-600 bg-slate-800/80 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <UserPlus size={16} style={{ color: AD.teal }} />
                            <p className="text-white font-bold text-sm">Fase disponible: <span style={{ color: AD.teal }}>{claimablePhase.phase_name}</span></p>
                        </div>
                        <p className="text-slate-400 text-xs">Tomá esta fase para empezar a trabajar en ella.</p>
                        <button
                            onClick={() => handleClaim(claimablePhase)}
                            disabled={claimingPhase}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                            {claimingPhase ? 'Tomando…' : 'Tomar esta fase'}
                        </button>
                    </div>
                )}

                {/* Acciones de la fase activa de este colaborador */}
                {myActivePhase && (
                    <div className="rounded-2xl border border-slate-600 bg-slate-800/80 p-4 space-y-3">
                        <p className="text-white font-bold text-sm">
                            Tu fase: <span style={{ color: AD.teal }}>{myActivePhase.phase_name}</span>
                        </p>

                        {myActivePhase.status === 'in_progress' && (
                            <>
                                {!confirming && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirming('prueba')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-500/50 text-orange-400 font-semibold text-sm hover:bg-orange-500/10 transition-all">
                                            <Send size={14} />
                                            Enviar a Prueba
                                        </button>
                                        <button onClick={() => setConfirming('complete')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                                            style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                            <CheckCircle2 size={14} />
                                            Completar Fase
                                        </button>
                                    </div>
                                )}
                                {confirming === 'prueba' && (
                                    <div className="space-y-2">
                                        <p className="text-slate-300 text-xs text-center">¿Enviás "{myActivePhase.phase_name}" a prueba con el odontólogo?</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirming(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-medium">Cancelar</button>
                                            <button onClick={handlePrueba} disabled={loading}
                                                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                                                style={{ background: AD.orange }}>
                                                {loading ? 'Enviando...' : 'Confirmar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {confirming === 'complete' && (
                                    <div className="space-y-2">
                                        <p className="text-slate-300 text-xs text-center">Se generará un ticket por <strong className="text-white">$ {fmt(myActivePhase.price)}</strong></p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirming(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-medium">Cancelar</button>
                                            <button onClick={handleComplete} disabled={loading}
                                                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                                                style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                                {loading ? 'Procesando...' : 'Confirmar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {myActivePhase.status === 'prueba' && (
                            <div className="space-y-2">
                                <p className="text-orange-400 text-xs text-center font-medium">
                                    Esperando aprobación del odontólogo (PRUEBA)
                                </p>
                                {!confirming ? (
                                    <button onClick={() => setConfirming('complete')}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                        <CheckCircle2 size={14} />
                                        Marcar como Completado
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-slate-300 text-xs text-center">Se generará un ticket por <strong className="text-white">$ {fmt(myActivePhase.price)}</strong></p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirming(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-medium">Cancelar</button>
                                            <button onClick={handleComplete} disabled={loading}
                                                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                                                style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                                {loading ? 'Procesando...' : 'Confirmar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Trabajo terminado */}
                {job.status === 'ready' && (
                    <div className="rounded-2xl border p-4 text-center"
                        style={{ borderColor: `${AD.teal}50`, background: `${AD.teal}10` }}>
                        <CheckCircle2 className="mx-auto mb-2" size={24} style={{ color: AD.teal }} />
                        <p className="font-bold text-white text-sm">¡Trabajo completado!</p>
                        <p className="text-slate-400 text-xs mt-0.5">Todas las fases finalizadas.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
