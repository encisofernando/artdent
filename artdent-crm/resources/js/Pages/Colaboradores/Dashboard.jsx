import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { LogOut, Clock, AlertTriangle, CheckCircle2, Wrench, ChevronRight, Layers, DollarSign } from 'lucide-react';

const AD = { blue: '#397B9C', teal: '#5AAD9C', mint: '#ACD6CE', red: '#E63946', orange: '#F4A261' };

const PRIORITY_META = {
    normal:  { label: 'Normal',        color: '#64748b' },
    urgent:  { label: 'Urgente',       color: AD.orange },
    rush:    { label: 'Extra Urgente', color: AD.red },
};

const PHASE_STATUS_META = {
    in_progress: { label: 'En Proceso', color: AD.blue },
    prueba:      { label: 'En Prueba',  color: AD.orange },
};

function formatCurrency(value) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value ?? 0);
}

// Card para una FASE activa (mis fases en curso)
function MyPhaseCard({ phase }) {
    const priority = PRIORITY_META[phase.priority] || PRIORITY_META.normal;
    const statusMeta = PHASE_STATUS_META[phase.status] || PHASE_STATUS_META.in_progress;
    const isOverdue = phase.due_date && new Date(phase.due_date) < new Date();

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden hover:border-slate-600 transition-all">
            <div className="h-1" style={{ background: priority.color }} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm font-mono">{phase.job_number}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{phase.dentist?.name ?? '—'}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ color: statusMeta.color, background: `${statusMeta.color}20` }}>
                        {statusMeta.label}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ color: AD.teal, background: `${AD.teal}20` }}>
                        {phase.phase_name}
                    </span>
                    {phase.due_date && (
                        <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                            Entrega: {new Date(phase.due_date).toLocaleDateString('es-AR')}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <DollarSign size={11} />
                        {formatCurrency(phase.price)}
                    </span>
                    <button
                        onClick={() => router.get(route('colaboradores.jobs.show', phase.job_id))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                        Ver <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Card para una FASE disponible (sin colaborador asignado)
function AvailablePhaseCard({ phase, onClaim, claiming }) {
    const priority = PRIORITY_META[phase.priority] || PRIORITY_META.normal;
    const isOverdue = phase.due_date && new Date(phase.due_date) < new Date();
    const isLoading = claiming === phase.id;

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden hover:border-slate-600 transition-all">
            <div className="h-1" style={{ background: priority.color }} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm font-mono">{phase.job_number}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{phase.dentist?.name ?? '—'}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ color: priority.color, background: `${priority.color}20` }}>
                        {priority.label}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ color: AD.mint, background: `${AD.teal}20` }}>
                        {phase.phase_name}
                    </span>
                    {phase.due_date && (
                        <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                            Entrega: {new Date(phase.due_date).toLocaleDateString('es-AR')}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <DollarSign size={11} />
                        {formatCurrency(phase.price)}
                    </span>
                    <button
                        onClick={() => !isLoading && onClaim(phase.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                        {isLoading ? 'Tomando…' : 'Tomar fase'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Card para trabajo SIN fases (flujo original de reclamar trabajo completo)
function PendingJobCard({ job, onClaim, claiming }) {
    const priority = PRIORITY_META[job.priority] || PRIORITY_META.normal;
    const isOverdue = job.due_date && new Date(job.due_date) < new Date();
    const isLoading = claiming === job.id;

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden hover:border-slate-600 transition-all">
            <div className="h-1" style={{ background: priority.color }} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm font-mono">{job.job_number}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{job.dentist?.name ?? '—'}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: priority.color, background: `${priority.color}20` }}>
                        {priority.label}
                    </span>
                </div>

                <p className="text-slate-300 text-sm leading-snug mb-3 line-clamp-2">{job.description || job.tariff}</p>

                <div className="flex items-center justify-between">
                    {job.due_date && (
                        <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                            Entrega: {new Date(job.due_date).toLocaleDateString('es-AR')}
                        </span>
                    )}
                    <button
                        onClick={() => !isLoading && onClaim(job.id)}
                        disabled={isLoading}
                        className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                        {isLoading ? 'Reclamando…' : 'Reclamar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ColaboradoresDashboard({ colaborador, availablePhases, pendingJobs, myPhases }) {
    const [claimingPhase, setClaimingPhase] = useState(null);
    const [claimingJob, setClaimingJob] = useState(null);

    const handleClaimPhase = (phaseId) => {
        setClaimingPhase(phaseId);
        router.post(route('colaboradores.phases.claim', phaseId), {}, {
            onFinish: () => setClaimingPhase(null),
        });
    };

    const handleClaimJob = (jobId) => {
        setClaimingJob(jobId);
        router.post(route('colaboradores.jobs.claim', jobId), {}, {
            onFinish: () => setClaimingJob(null),
        });
    };

    const handleLogout = () => {
        router.post(route('colaboradores.logout'));
    };

    const totalAvailable = (availablePhases?.length ?? 0) + (pendingJobs?.length ?? 0);

    return (
        <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <Head title="Portal Colaboradores" />

            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-slate-800"
                style={{ background: '#0f172a' }}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                            {colaborador.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{colaborador.name}</p>
                            {colaborador.specialty && <p className="text-slate-500 text-xs">{colaborador.specialty}</p>}
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 border border-slate-700 hover:border-slate-600 transition-all">
                        <LogOut size={13} />
                        Salir
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-6 space-y-8">

                {/* Mis fases activas */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Wrench size={15} style={{ color: AD.teal }} />
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider">Mis Fases</h2>
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {myPhases?.length ?? 0}
                        </span>
                    </div>

                    {!myPhases?.length ? (
                        <p className="text-slate-600 text-sm text-center py-6 rounded-2xl border border-slate-800 bg-slate-900/40">
                            No tenés fases activas. Tomá una de las disponibles.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {myPhases.map(phase => (
                                <MyPhaseCard key={phase.id} phase={phase} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Fases disponibles para tomar */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Layers size={15} style={{ color: AD.orange }} />
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider">Fases Disponibles</h2>
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {totalAvailable}
                        </span>
                    </div>

                    {!availablePhases?.length && !pendingJobs?.length ? (
                        <p className="text-slate-600 text-sm text-center py-6 rounded-2xl border border-slate-800 bg-slate-900/40">
                            No hay trabajos pendientes por ahora.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {availablePhases?.map(phase => (
                                <AvailablePhaseCard
                                    key={phase.id}
                                    phase={phase}
                                    onClaim={handleClaimPhase}
                                    claiming={claimingPhase}
                                />
                            ))}
                            {pendingJobs?.map(job => (
                                <PendingJobCard
                                    key={job.id}
                                    job={job}
                                    onClaim={handleClaimJob}
                                    claiming={claimingJob}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
