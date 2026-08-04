import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    getStoredTicketFormat,
    getThermalPrintZoom,
    getThermalZoneWidth,
    MONTSERRAT_PRINT_HEAD,
    printElementWithElectron,
} from '@/lib/print';
import { CompanyLogo, getCompanyLogoUrl } from '@/lib/companyBranding';
import { isNativePrintAvailable, printRawBytes } from '@/lib/nativePrinter';
import PrinterConfigModal from '@/Components/PrinterConfigModal';
import { buildPhaseTicket, buildJobOrderTicket, mapFinalTicketToJobOrder } from '@/lib/escpos/buildJobOrderTicket';

// El número ya viene precedido por la palabra "Orden" en el encabezado, así que
// el prefijo "ORD-" es redundante ahí (se ve como una palabra repetida/cortada).
const stripOrdPrefix = (value) => String(value ?? '').replace(/^ORD-/i, '');
import {
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock,
    Fingerprint,
    LogIn,
    LogOut,
    Search,
    Stethoscope,
    Loader2,
    Maximize2,
    Minimize2,
    Printer,
    RefreshCw,
    Users,
    X,
    XCircle,
} from 'lucide-react';

// ── Brand ──────────────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const PRIORITY_LABEL = { urgent: 'Urgente', rush: 'Inmediato', normal: '' };
const PRIORITY_COLOR = { urgent: '#d97706', rush: '#dc2626', normal: '' };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

function KioskClock() {
    const [time, setTime] = useState(new Date().toLocaleTimeString('es-AR', { hour12: false }));
    useEffect(() => {
        const id = setInterval(() => setTime(new Date().toLocaleTimeString('es-AR', { hour12: false })), 1000);
        return () => clearInterval(id);
    }, []);
    return <span className="font-mono text-slate-400 text-sm tabular-nums">{time}</span>;
}

// Botón de pantalla completa — útil en terminales de kiosco (evita que se
// vea la barra de direcciones/estado del navegador o de la app Android).
function FullscreenToggle() {
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggle = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            document.documentElement.requestFullscreen?.().catch(() => {});
        }
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors hover:bg-slate-700"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
            {isFullscreen
                ? <Minimize2 size={15} color="#94a3b8" />
                : <Maximize2 size={15} color="#94a3b8" />}
        </button>
    );
}

// ── Cartel de bienvenida al fichar (evento HikVision en tiempo real) ────────
function AttendanceWelcomeOverlay({ event, onClose }) {
    if (!event) { return null; }

    const isIn = event.action === 'in';
    const accent = isIn ? AD.green : '#f59e0b';

    return (
        <div key={event.key} className="fixed top-6 right-6 z-[300]">
            <div
                className="flex items-center gap-4 rounded-2xl shadow-2xl px-6 py-5"
                style={{ background: '#1e293b', border: `2px solid ${accent}`, minWidth: 340 }}
            >
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${accent}22` }}
                >
                    {isIn
                        ? <LogIn size={26} style={{ color: accent }} />
                        : <LogOut size={26} style={{ color: accent }} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                        {isIn ? 'Ingreso registrado' : 'Salida registrada'}
                    </p>
                    <p className="text-lg font-bold text-white truncate">¡Bienvenido/a, {event.name}!</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <Fingerprint size={13} />
                        <span>{event.time} hs</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

// ── Screens ────────────────────────────────────────────────────────────────
const SCREEN = {
    DASHBOARD:       'dashboard',
    CONFIRM_TAKE:    'confirm_take',
    SELECT_COLLAB:   'select_collab',
    CONFIRM_PROOF:   'confirm_proof',
    CONFIRM_RETURN:  'confirm_return',
    TICKET_PRINT:    'ticket_print',
    FINAL_TICKET:    'final_ticket',
};

export default function JobKioskIndex({ collaborators = [], company = null, tenant_id = null }) {
    const [screen, setScreen]           = useState(SCREEN.DASHBOARD);
    const [available, setAvailable]     = useState([]);
    const [inProgress, setInProgress]   = useState([]);
    const [onProof, setOnProof]         = useState([]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);

    // The phase being acted on
    const [activePhase, setActivePhase] = useState(null);
    // Collaborators selected for completion
    const [selectedCollabs, setSelectedCollabs] = useState([]);
    // Resulting ticket after completion
    const [lastTicket, setLastTicket]   = useState(null);
    // Consolidated ticket for the whole job, when the last phase just finished it
    const [finalTicket, setFinalTicket] = useState(null);
    const [lastSync, setLastSync]       = useState(null);
    const [search, setSearch]           = useState('');
    const [attendanceEvent, setAttendanceEvent] = useState(null);
    const [printerModalOpen, setPrinterModalOpen] = useState(false);

    const POLL_INTERVAL = 20_000; // ms

    useEffect(() => {
        if (!attendanceEvent) { return; }
        const timer = setTimeout(() => setAttendanceEvent(null), 6000);
        return () => clearTimeout(timer);
    }, [attendanceEvent]);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) { setLoading(true); }
        setError(null);
        try {
            const [avail, inProg] = await Promise.all([
                axios.get(route('job-kiosk.available-jobs')),
                axios.get(route('job-kiosk.in-progress')),
            ]);
            setAvailable(avail.data);
            setInProgress(inProg.data.filter((p) => p.status === 'in_progress'));
            setOnProof(inProg.data.filter((p) => p.status === 'prueba'));
            setLastSync(new Date());
        } catch {
            if (!silent) {
                setError('No se pudo cargar los trabajos. Tocá Actualizar para reintentar.');
            }
        } finally {
            if (!silent) { setLoading(false); }
        }
    }, []);

    // Initial load
    useEffect(() => { loadData(); }, [loadData]);

    // ── Tiempo real (fichaje + tablero de jobs) ──────────────────────────
    // Canal público (este kiosk no tiene sesión de usuario — se autentica por
    // IP/token, no hay forma de pedir un PrivateChannel). Requiere que
    // window.Echo esté inicializado (VITE_REVERB_HOST apuntando al servidor
    // real, no "localhost") y el proceso `php artisan reverb:start` corriendo.
    // Si Echo no está disponible, el kiosk sigue funcionando normalmente
    // (queda el poll de 20s como red de seguridad).
    useEffect(() => {
        if (!company?.id || !tenant_id || !window.Echo) { return; }

        const channelName = `tenant.${tenant_id}.company.${company.id}.jobkiosk`;
        const attendanceChannelName = `tenant.${tenant_id}.company.${company.id}.attendance`;

        const jobChannel = window.Echo.channel(channelName);
        jobChannel.listen('.job-status-changed', () => {
            loadData(true);
        });

        const attendanceChannel = window.Echo.channel(attendanceChannelName);
        attendanceChannel.listen('.attendance-recorded', (data) => {
            setAttendanceEvent({ ...data, key: Date.now() });
        });

        return () => {
            window.Echo.leaveChannel(channelName);
            window.Echo.leaveChannel(attendanceChannelName);
        };
    }, [company?.id, tenant_id, loadData]);

    // Auto-poll — only while on the dashboard (pause when a dialog is open)
    const screenRef = useRef(screen);
    useEffect(() => { screenRef.current = screen; }, [screen]);

    useEffect(() => {
        const id = setInterval(() => {
            if (screenRef.current === SCREEN.DASHBOARD) {
                loadData(true);
            }
        }, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [loadData]);

    // ── Search filter ────────────────────────────────────────────────────
    const needle = search.toLowerCase().trim();

    const matchJob = (job) => {
        if (!needle) { return true; }
        return (
            (job?.job_number ?? '').toLowerCase().includes(needle) ||
            (job?.patient?.name ?? '').toLowerCase().includes(needle) ||
            (job?.dentist?.name ?? '').toLowerCase().includes(needle)
        );
    };

    const filteredAvailable  = useMemo(() => available.filter((job) => matchJob(job)), [available, needle]);
    const filteredInProgress = useMemo(() => inProgress.filter((p) => matchJob(p.job)), [inProgress, needle]);
    const filteredOnProof    = useMemo(() => onProof.filter((p) => matchJob(p.job)), [onProof, needle]);

    // ── Actions ─────────────────────────────────────────────────────────
    // activePhase stores { phase?, job } — phase is null for jobs without phases yet
    const handleTakePhase = async () => {
        if (!activePhase) { return; }
        setLoading(true);
        setError(null);
        try {
            const payload = activePhase.phase
                ? { job_phase_progress_id: activePhase.phase.id }
                : { job_id: activePhase.job.id };
            await axios.post(route('job-kiosk.take-phase'), payload);
            await loadData();
            setActivePhase(null);
            setScreen(SCREEN.DASHBOARD);
        } catch (e) {
            setError(e?.response?.data?.error ?? 'Error al tomar la fase.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompletePhase = async () => {
        if (!activePhase?.phase || selectedCollabs.length === 0) { return; }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(route('job-kiosk.complete-phase'), {
                job_phase_progress_id: activePhase.phase.id,
                collaborator_ids: selectedCollabs.map((c) => c.id),
            });
            setLastTicket(res.data);
            setFinalTicket(res.data.job_complete ? { ...res.data.final_ticket, ...res.data } : null);
            await loadData();
            setActivePhase(null);
            setSelectedCollabs([]);
            setScreen(SCREEN.TICKET_PRINT);
        } catch (e) {
            setError(e?.response?.data?.error ?? 'Error al completar la fase.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendToProof = async () => {
        if (!activePhase?.phase) { return; }
        setLoading(true);
        setError(null);
        try {
            await axios.post(route('job-kiosk.send-to-proof'), {
                job_phase_progress_id: activePhase.phase.id,
            });
            await loadData();
            setActivePhase(null);
            setScreen(SCREEN.DASHBOARD);
        } catch (e) {
            setError(e?.response?.data?.error ?? 'Error al enviar a prueba.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnFromProof = async () => {
        if (!activePhase?.job) { return; }
        setLoading(true);
        setError(null);
        try {
            await axios.post(route('job-kiosk.return-from-proof', { job: activePhase.job.id }));
            await loadData();
            setActivePhase(null);
            setScreen(SCREEN.DASHBOARD);
        } catch (e) {
            setError(e?.response?.data?.error ?? 'Error al registrar el retorno.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCollab = (c) => {
        setSelectedCollabs((prev) =>
            prev.find((x) => x.id === c.id)
                ? prev.filter((x) => x.id !== c.id)
                : [...prev, c]
        );
    };

    // ── Helpers ─────────────────────────────────────────────────────────
    const nextPendingPhase = (job) =>
        (job.phase_progress ?? []).find((p) => p.status === 'pending');

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Órdenes" />
            <AttendanceWelcomeOverlay event={attendanceEvent} onClose={() => setAttendanceEvent(null)} />
            <PrinterConfigModal
                open={printerModalOpen}
                onClose={() => setPrinterModalOpen(false)}
                companyName={company?.fantasy_name || company?.name || 'ArtDent'}
            />
            <div className="min-h-screen flex flex-col" style={{ background: '#0f172a', color: '#e2e8f0' }}>

                {/* Header */}
                <header style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                    className="flex items-center gap-4 px-5 py-3 shrink-0">
                    {/* Left — lab logo */}
                    <div className="flex items-center shrink-0" style={{ minWidth: 0 }}>
                        {company && getCompanyLogoUrl(company, 'lab')
                            ? <CompanyLogo company={company} scope="lab" height={36} maxWidth={160} />
                            : <span className="font-bold text-white text-base">
                                {company?.fantasy_name ?? company?.name ?? 'Kiosk de Producción'}
                              </span>
                        }
                    </div>

                    {/* Center — search */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#0f172a', borderRadius: 10, padding: '7px 14px', border: `1px solid ${search ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`, transition: 'border-color 0.15s' }}>
                        <Search size={14} color="#475569" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por paciente, odontólogo o N° de orden…"
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13 }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ color: '#475569', lineHeight: 0, touchAction: 'manipulation' }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Right — clock + sync + refresh */}
                    <div className="flex items-center gap-3 shrink-0">
                        {lastSync && (
                            <span className="font-mono text-xs tabular-nums" style={{ color: '#475569' }}>
                                ↻ {lastSync.toLocaleTimeString('es-AR', { hour12: false })}
                            </span>
                        )}
                        <KioskClock />
                        <button
                            onClick={() => loadData(false)}
                            disabled={loading}
                            className="p-2 rounded-lg transition-colors hover:bg-slate-700 disabled:opacity-40"
                            title="Actualizar"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} color="#94a3b8" />
                        </button>
                        <button
                            onClick={() => setPrinterModalOpen(true)}
                            className="p-2 rounded-lg transition-colors hover:bg-slate-700"
                            title="Configurar impresora"
                        >
                            <Printer size={15} color="#94a3b8" />
                        </button>
                        <FullscreenToggle />
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <div className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                        style={{ background: '#7f1d1d22', border: '1px solid #dc2626', color: '#fca5a5' }}>
                        <XCircle size={15} />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                {/* Content */}
                <main style={{ flex: 1, overflow: 'hidden', display: screen === SCREEN.DASHBOARD ? 'grid' : 'flex', flexDirection: 'column', gridTemplateColumns: '1fr 1fr', gridTemplateRows: onProof.length > 0 ? '1fr 190px' : '1fr', gridTemplateAreas: onProof.length > 0 ? '"left right" "proof proof"' : '"left right"', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

                    {/* ── Dashboard: 3-zone layout ── */}
                    {screen === SCREEN.DASHBOARD && (<>

                        {/* Top-left — Disponibles */}
                        <div style={{ gridArea: 'left', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                            <ColHeader label="Disponibles" count={filteredAvailable.length} total={needle ? available.length : null} color="#f59e0b" />
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                {loading && available.length === 0
                                    ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" style={{ color: AD.blue }} /></div>
                                    : filteredAvailable.length === 0
                                        ? <EmptyCol icon={<ClipboardList size={32} />} text={needle ? 'Sin resultados.' : 'No hay órdenes disponibles.'} />
                                        : <div className="space-y-2">
                                            {filteredAvailable.map((job) => {
                                                const phase = nextPendingPhase(job);
                                                return (
                                                    <AvailableJobCard
                                                        key={job.id}
                                                        job={job}
                                                        phase={phase ?? null}
                                                        onTake={() => { setActivePhase({ phase: phase ?? null, job }); setScreen(SCREEN.CONFIRM_TAKE); }}
                                                    />
                                                );
                                            })}
                                        </div>
                                }
                            </div>
                        </div>

                        {/* Top-right — En proceso */}
                        <div style={{ gridArea: 'right', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <ColHeader label="En Proceso" count={filteredInProgress.length} total={needle ? inProgress.length : null} color={AD.teal} glow />
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                {loading && inProgress.length === 0
                                    ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" style={{ color: AD.teal }} /></div>
                                    : filteredInProgress.length === 0
                                        ? <EmptyCol icon={<CheckCircle2 size={32} />} text={needle ? 'Sin resultados.' : 'No hay fases en proceso.'} />
                                        : <div className="space-y-2">
                                            {filteredInProgress.map((phase) => (
                                                <InProgressCard
                                                    key={phase.id}
                                                    phase={phase}
                                                    onComplete={() => { setActivePhase({ phase, job: phase.job }); setSelectedCollabs([]); setScreen(SCREEN.SELECT_COLLAB); }}
                                                    onProof={() => { setActivePhase({ phase, job: phase.job }); setScreen(SCREEN.CONFIRM_PROOF); }}
                                                />
                                            ))}
                                        </div>
                                }
                            </div>
                        </div>

                        {/* Bottom — En Prueba (solo si hay en total) */}
                        {onProof.length > 0 && (
                            <div style={{ gridArea: 'proof', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <ColHeader label="En Prueba" count={filteredOnProof.length} total={needle ? onProof.length : null} color="#a78bfa" glow />
                                <div style={{ overflowY: 'auto', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                                    {filteredOnProof.map((phase) => (
                                        <ProofCard
                                            key={phase.id}
                                            phase={phase}
                                            onReturn={() => { setActivePhase({ phase, job: phase.job }); setScreen(SCREEN.CONFIRM_RETURN); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                    </>)}

                    {/* ── Secondary screens (centered, scrollable) ── */}
                    {screen !== SCREEN.DASHBOARD && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                    <div style={{ maxWidth: 460, margin: '0 auto' }}>

                    {/* ── Confirm Take ── */}
                    {screen === SCREEN.CONFIRM_TAKE && activePhase && (
                        <ConfirmCard
                            title={activePhase.phase ? '¿Tomás esta fase?' : '¿Tomás este trabajo?'}
                            body={<JobSummary job={activePhase.job} phase={activePhase.phase} />}
                            confirmLabel={loading ? null : 'Sí, tomar'}
                            confirmStyle={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})` }}
                            onConfirm={handleTakePhase}
                            onCancel={() => { setActivePhase(null); setScreen(SCREEN.DASHBOARD); }}
                            loading={loading}
                        />
                    )}

                    {/* ── Select Collaborators (at completion) ── */}
                    {screen === SCREEN.SELECT_COLLAB && activePhase && (
                        <div className="space-y-4">
                            <div style={{ background: '#1e293b', border: `1.5px solid ${AD.teal}40`, borderRadius: 16, padding: '16px' }}>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Completando fase</p>
                                <p className="font-bold text-white text-base">
                                    {activePhase.phase?.tariff_phase?.name ?? 'Fase'}
                                </p>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    Orden {activePhase.job?.job_number ?? '—'}
                                    {activePhase.job?.patient && ` · ${activePhase.job.patient.name}`}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users size={11} /> ¿Quién realizó esta fase?
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {collaborators.map((c) => {
                                        const active = selectedCollabs.find((x) => x.id === c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => toggleCollab(c)}
                                                className="flex items-center gap-3 rounded-xl transition-all active:scale-95"
                                                style={{
                                                    background: active ? `${AD.teal}22` : '#1e293b',
                                                    border: `1.5px solid ${active ? AD.teal : 'rgba(255,255,255,0.08)'}`,
                                                    padding: '12px 14px',
                                                    minHeight: 56,
                                                    touchAction: 'manipulation',
                                                }}
                                            >
                                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                                                    style={{ background: active ? AD.teal : '#334155' }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-white text-left leading-tight">{c.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                disabled={selectedCollabs.length === 0 || loading}
                                onClick={handleCompletePhase}
                                className="w-full py-4 rounded-2xl text-base font-bold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: `linear-gradient(135deg,${AD.green},${AD.teal})` }}
                            >
                                {loading
                                    ? <Loader2 size={20} className="animate-spin" />
                                    : <><CheckCircle2 size={18} /> Confirmar y completar</>
                                }
                            </button>
                            <button
                                onClick={() => { setActivePhase(null); setSelectedCollabs([]); setScreen(SCREEN.DASHBOARD); }}
                                className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {/* ── Confirm Proof ── */}
                    {screen === SCREEN.CONFIRM_PROOF && activePhase && (
                        <ConfirmCard
                            title="Enviar a prueba"
                            body={
                                <div>
                                    <JobSummary job={activePhase.job} phase={activePhase.phase} />
                                    <p className="text-sm text-slate-500 mt-3">El trabajo quedará en estado "En Prueba" hasta que regrese del consultorio.</p>
                                </div>
                            }
                            confirmLabel="Sí, enviar a prueba"
                            confirmStyle={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
                            onConfirm={handleSendToProof}
                            onCancel={() => { setActivePhase(null); setScreen(SCREEN.DASHBOARD); }}
                            loading={loading}
                            icon={<Stethoscope size={28} color="#a78bfa" />}
                        />
                    )}

                    {/* ── Confirm Return from Proof ── */}
                    {screen === SCREEN.CONFIRM_RETURN && activePhase && (
                        <ConfirmCard
                            title="¿El trabajo volvió del consultorio?"
                            body={
                                <div>
                                    <JobSummary job={activePhase.job} phase={activePhase.phase} />
                                    <p className="text-sm text-slate-500 mt-3">
                                        Al confirmar, la fase de prueba se retoma en el laboratorio para continuar el trabajo.
                                    </p>
                                </div>
                            }
                            confirmLabel="Sí, volvió"
                            confirmStyle={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
                            onConfirm={handleReturnFromProof}
                            onCancel={() => { setActivePhase(null); setScreen(SCREEN.DASHBOARD); }}
                            loading={loading}
                            icon={<Stethoscope size={28} color="#a78bfa" />}
                        />
                    )}

                    {/* ── Ticket Print ── */}
                    {screen === SCREEN.TICKET_PRINT && lastTicket && (
                        <TicketPrintScreen
                            ticket={lastTicket}
                            onDone={() => {
                                setLastTicket(null);
                                setScreen(finalTicket ? SCREEN.FINAL_TICKET : SCREEN.DASHBOARD);
                            }}
                        />
                    )}

                    {/* ── Ticket Final (orden completa) ── */}
                    {screen === SCREEN.FINAL_TICKET && finalTicket && (
                        <FinalTicketPrintScreen
                            ticket={finalTicket}
                            onDone={() => { setFinalTicket(null); setScreen(SCREEN.DASHBOARD); }}
                        />
                    )}

                    </div>
                    </div>
                    )}
                </main>
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColHeader({ label, count, total = null, color, glow = false }) {
    return (
        <div style={{ padding: '14px 18px 12px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0, boxShadow: glow ? `0 0 8px ${color}` : 'none' }} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, flex: 1 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, padding: '2px 9px', borderRadius: 6, background: `${color}22`, color }}>
                {total !== null ? `${count}/${total}` : count}
            </span>
        </div>
    );
}

function ProofCard({ phase, onReturn }) {
    const job = phase.job ?? {};
    return (
        <button
            onClick={onReturn}
            style={{ background: '#1e293b', border: '1.5px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '12px 16px', width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s', touchAction: 'manipulation' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <Stethoscope size={14} color="#a78bfa" />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa' }}>{job.job_number ?? '—'}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{phase.tariff_phase?.name ?? 'Fase'}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{job.patient?.name ?? '—'}</p>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>{job.dentist?.name ?? '—'}</p>
            <p style={{ fontSize: 11, color: '#a78bfa', margin: '7px 0 0', fontWeight: 600 }}>Tocar para registrar retorno ↩</p>
        </button>
    );
}

function EmptyCol({ icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 opacity-30">
            {icon}
            <p className="text-sm font-semibold text-center">{text}</p>
        </div>
    );
}

function JobSummary({ job = {}, phase = null }) {
    const patientName = job.patient
        ? job.patient.name ?? '—'
        : null;
    return (
        <div style={{ background: '#0f172a', borderRadius: 12, padding: '12px 14px', marginTop: 4 }}>
            <p className="text-xs text-slate-500 mb-1">
                Orden <strong className="text-slate-300">{job.job_number ?? '—'}</strong>
                {phase && <>{' · '}{phase.tariff_phase?.name ?? 'Fase'}</>}
            </p>
            {patientName && <p className="text-sm font-semibold text-white">{patientName}</p>}
            {job.dentist && <p className="text-xs text-slate-400">{job.dentist.name}</p>}
        </div>
    );
}

function InProgressCard({ phase, onComplete, onProof }) {
    const job = phase.job ?? {};
    const patientName = job.patient
        ? job.patient.name ?? '—'
        : '—';

    return (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3"
            style={{ background: '#1e293b', border: `1.5px solid ${AD.teal}30` }}>
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: AD.teal }}>
                        {job.job_number ?? '—'}
                    </span>
                    <span className="text-xs text-slate-400">{phase.tariff_phase?.name ?? 'Fase'}</span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{patientName}</p>
                <p className="text-xs text-slate-500">{job.dentist?.name ?? ''}</p>
            </div>
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={onProof}
                    className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: '#3b0764', border: '1px solid #7c3aed', color: '#a78bfa', touchAction: 'manipulation', minHeight: 44 }}
                >
                    <Stethoscope size={14} /> Prueba
                </button>
                <button
                    onClick={onComplete}
                    className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ background: `linear-gradient(135deg,${AD.green},${AD.teal})`, touchAction: 'manipulation', minHeight: 44 }}
                >
                    <CheckCircle2 size={14} /> Listo
                </button>
            </div>
        </div>
    );
}

function AvailableJobCard({ job, phase, onTake }) {
    const patientName = job.patient
        ? job.patient.name ?? '—'
        : '—';
    const priority = job.priority ?? 'normal';

    return (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3"
            style={{ background: '#1e293b', border: '1.5px solid rgba(255,255,255,0.07)' }}>
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: AD.blue }}>
                        {job.job_number}
                    </span>
                    {PRIORITY_LABEL[priority] && (
                        <span className="text-xs font-bold" style={{ color: PRIORITY_COLOR[priority] }}>
                            {PRIORITY_LABEL[priority]}
                        </span>
                    )}
                    {job.due_date && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {fmtDate(job.due_date)}
                        </span>
                    )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{patientName}</p>
                <p className="text-xs text-slate-500">
                    {job.dentist?.name ?? ''}
                    {phase && <span className="ml-2 text-slate-600">· {phase.tariff_phase?.name ?? 'Fase'}</span>}
                </p>
            </div>
            <button
                onClick={onTake}
                className="shrink-0 flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})`, touchAction: 'manipulation', minHeight: 44 }}
            >
                Tomar <ChevronRight size={15} />
            </button>
        </div>
    );
}

function ConfirmCard({ title, body, confirmLabel, confirmStyle, onConfirm, onCancel, loading, icon }) {
    return (
        <div className="max-w-sm mx-auto space-y-4">
            {icon && <div className="flex justify-center mb-2">{icon}</div>}
            <p className="text-xl font-bold text-white text-center">{title}</p>
            <div>{body}</div>
            <button
                disabled={loading}
                onClick={onConfirm}
                className="w-full py-4 rounded-2xl text-base font-bold text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={confirmStyle}
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : confirmLabel}
            </button>
            <button
                onClick={onCancel}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}
            >
                Cancelar
            </button>
        </div>
    );
}

// ─── Ticket térmico de fase — mismo diseño byte a byte que FinalTicketThermal,
// solo cambia que el detalle trae un único ítem (la fase recién completada)
// en vez de todas las fases de la orden.
function PhaseTicketThermal({ ticket, widthMM = 80 }) {
    const is54 = widthMM === 54 || widthMM === 57;
    const company = ticket.company ?? {};
    const ticketWidth = getThermalZoneWidth(is54 ? '57mm' : '80mm');
    const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

    const F = {
        caption: is54 ? 7.2 : 8.1,
        label: is54 ? 7.6 : 8.4,
        body: is54 ? 8.2 : 9.2,
        total: is54 ? 11.2 : 13.8,
        number: is54 ? 13 : 16,
        small: is54 ? 6.8 : 7.6,
        logo: is54 ? 54 : 62,
    };

    const InfoRow = ({ label, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt`, lineHeight: 1.3, marginBottom: 3 }}>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', flex: 1 }}>{value || '—'}</span>
        </div>
    );

    return (
        <div id="phase-ticket-zone" style={{ width: ticketWidth, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${F.body}pt`, color: '#000', padding: is54 ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm', background: '#fff', lineHeight: 1.35, boxSizing: 'border-box' }}>
            <div style={{ borderTop: '3px solid #000', marginBottom: is54 ? 5 : 7 }} />

            <div style={{ textAlign: 'center', marginBottom: is54 ? 6 : 8 }}>
                <CompanyLogo company={company} scope="lab" thermal height={F.logo} maxWidth={is54 ? 140 : 180} style={{ margin: '0 auto' }} />
                <div style={{ fontSize: `${F.small}pt`, marginTop: 4 }}>Documento interno. No válido como factura.</div>
            </div>

            <div style={{ border: '2px solid #000', padding: is54 ? '5px 6px' : '6px 8px', marginBottom: is54 ? 6 : 8, textAlign: 'center' }}>
                <div style={{ fontSize: `${F.body}pt`, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Orden N° {stripOrdPrefix(ticket.job_number)}
                </div>
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0 3px', marginBottom: is54 ? 6 : 8 }}>
                <InfoRow label="Fecha" value={fmtD(ticket.received_at)} />
                {ticket.patient_name && <InfoRow label="Paciente" value={ticket.patient_name} />}
                {ticket.dentist_name && <InfoRow label="Profesional" value={ticket.dentist_name} />}
                {ticket.shade && <InfoRow label="Tono" value={ticket.shade} />}
            </div>

            <div style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: 4 }}>
                Detalle del trabajo
            </div>

            <div style={{ marginBottom: is54 ? 6 : 8 }}>
                <div style={{ borderBottom: '1px dotted #000', padding: '4px 0' }}>
                    <div style={{ fontSize: `${F.body}pt`, fontWeight: 700, marginBottom: 2 }}>{ticket.phase_name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt` }}>
                        <span>1 x ${fmt(ticket.amount)}</span>
                        <span style={{ fontWeight: 800 }}>${fmt(ticket.amount)}</span>
                    </div>
                </div>
            </div>

            <div style={{ border: '2px solid #000', padding: is54 ? '5px 6px' : '6px 8px', marginBottom: is54 ? 6 : 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Total orden</span>
                    <span style={{ fontSize: `${F.total}pt`, fontWeight: 900 }}>${fmt(ticket.amount)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: `${F.small}pt`, borderTop: '1px solid #000', paddingTop: 5 }}>
                <div style={{ marginTop: 2 }}>Tu sonrisa, es nuestra prioridad.</div>
            </div>

            <div style={{ borderTop: '3px solid #000', marginTop: is54 ? 5 : 7 }} />
        </div>
    );
}

function TicketPrintScreen({ ticket, onDone }) {
    const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const ticketRef = useRef(null);
    const [printStatus, setPrintStatus] = useState(null); // 'printing' | 'ok' | 'error'
    const savedFormat = getStoredTicketFormat('80mm') === '57mm' ? '57mm' : '80mm';
    const widthMM = savedFormat === '57mm' ? 57 : 80;

    const handlePrint = async () => {
        setPrintStatus('printing');

        if (isNativePrintAvailable()) {
            const bytes = await buildPhaseTicket(ticket, { widthMM });
            const result = await printRawBytes(bytes);
            setPrintStatus(result.ok ? 'ok' : 'error');
            return;
        }

        const el = ticketRef.current?.querySelector('#phase-ticket-zone');
        if (!el) { setPrintStatus(null); return; }

        const result = await printElementWithElectron({
            element: el,
            title: `ArtCode — ${ticket.ticket_number}`,
            mode: savedFormat,
            zoneWidth: el.style.width || getThermalZoneWidth(savedFormat),
            zoom: getThermalPrintZoom(savedFormat),
            extraHead: MONTSERRAT_PRINT_HEAD,
            fallbackToBrowser: true,
            browserDelay: 400,
        });

        setPrintStatus(result.ok || result.fallbackUsed ? 'ok' : 'error');
    };

    return (
        <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: `${AD.green}22` }}>
                <CheckCircle2 size={36} style={{ color: AD.green }} />
            </div>
            <p className="text-xl font-bold text-white">¡Fase completada!</p>

            {/* Ticket preview */}
            <div ref={ticketRef} className="overflow-auto rounded-xl" style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'center' }}>
                <PhaseTicketThermal ticket={ticket} widthMM={widthMM} />
            </div>

            {/* Summary row */}
            <div className="flex justify-between items-baseline rounded-xl px-5 py-3"
                style={{ background: '#1e293b', border: `1.5px solid ${AD.green}30` }}>
                <span className="text-slate-400 text-sm">Importe fase</span>
                <span className="font-bold text-xl" style={{ color: AD.green }}>${fmt(ticket.amount)}</span>
            </div>

            <button
                onClick={handlePrint}
                disabled={printStatus === 'printing'}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-60"
                style={{ background: '#1e293b', border: `1.5px solid ${AD.blue}`, color: AD.blue }}
            >
                {printStatus === 'printing'
                    ? <><Loader2 size={15} className="animate-spin" /> Imprimiendo…</>
                    : <><Printer size={15} /> Imprimir ticket</>}
            </button>
            {printStatus === 'error' && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>
                    No se detectó el servicio de impresión ArtCode Print. Verificá que esté encendido e intentá de nuevo.
                </p>
            )}
            <button
                onClick={onDone}
                className="w-full py-4 rounded-2xl text-base font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})` }}
            >
                Continuar
            </button>
        </div>
    );
}

function FinalTicketThermal({ ticket, widthMM = 80 }) {
    const is54 = widthMM === 54 || widthMM === 57;
    const company = ticket.company ?? {};
    const phases = ticket.phases ?? [];
    const ticketWidth = getThermalZoneWidth(is54 ? '57mm' : '80mm');
    const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

    const F = {
        caption: is54 ? 7.2 : 8.1,
        label: is54 ? 7.6 : 8.4,
        body: is54 ? 8.2 : 9.2,
        total: is54 ? 11.2 : 13.8,
        small: is54 ? 6.8 : 7.6,
        logo: is54 ? 54 : 62,
    };

    const InfoRow = ({ label, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt`, lineHeight: 1.3, marginBottom: 3 }}>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', flex: 1 }}>{value || '—'}</span>
        </div>
    );

    return (
        <div id="final-ticket-zone" style={{ width: ticketWidth, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${F.body}pt`, color: '#000', padding: is54 ? '3mm 2.2mm 2.5mm' : '4mm 3mm 3.5mm', background: '#fff', lineHeight: 1.35, boxSizing: 'border-box' }}>
            <div style={{ borderTop: '3px solid #000', marginBottom: is54 ? 5 : 7 }} />

            <div style={{ textAlign: 'center', marginBottom: is54 ? 6 : 8 }}>
                <CompanyLogo company={company} scope="lab" thermal height={F.logo} maxWidth={is54 ? 140 : 180} style={{ margin: '0 auto' }} />
                <div style={{ fontSize: `${F.small}pt`, marginTop: 4 }}>Documento interno. No válido como factura.</div>
            </div>

            <div style={{ border: '2px solid #000', padding: is54 ? '5px 6px' : '6px 8px', marginBottom: is54 ? 6 : 8, textAlign: 'center' }}>
                <div style={{ fontSize: `${F.body}pt`, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Orden N° {stripOrdPrefix(ticket.job_number)}
                </div>
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0 3px', marginBottom: is54 ? 6 : 8 }}>
                <InfoRow label="Fecha" value={fmtD(ticket.received_at)} />
                {ticket.patient_name && <InfoRow label="Paciente" value={ticket.patient_name} />}
                {ticket.dentist_name && <InfoRow label="Profesional" value={ticket.dentist_name} />}
                {ticket.shade && <InfoRow label="Tono" value={ticket.shade} />}
            </div>

            <div style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0', marginBottom: 4 }}>
                Detalle del trabajo
            </div>

            <div style={{ marginBottom: is54 ? 6 : 8 }}>
                {phases.map((p, i) => (
                    <div key={i} style={{ borderBottom: '1px dotted #000', padding: '4px 0' }}>
                        <div style={{ fontSize: `${F.body}pt`, fontWeight: 700, marginBottom: 2 }}>{p.phase_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: `${F.label}pt` }}>
                            <span>1 x ${fmt(p.amount)}</span>
                            <span style={{ fontWeight: 800 }}>${fmt(p.amount)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ border: '2px solid #000', padding: is54 ? '5px 6px' : '6px 8px', marginBottom: is54 ? 6 : 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: `${F.caption}pt`, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Total orden</span>
                    <span style={{ fontSize: `${F.total}pt`, fontWeight: 900 }}>${fmt(ticket.total)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: `${F.small}pt`, borderTop: '1px solid #000', paddingTop: 5 }}>
                <div style={{ marginTop: 2 }}>Tu sonrisa, es nuestra prioridad.</div>
            </div>

            <div style={{ borderTop: '3px solid #000', marginTop: is54 ? 5 : 7 }} />
        </div>
    );
}

function FinalTicketPrintScreen({ ticket, onDone }) {
    const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const ticketRef = useRef(null);
    const [printStatus, setPrintStatus] = useState(null); // 'printing' | 'ok' | 'error'
    const savedFormat = getStoredTicketFormat('80mm') === '57mm' ? '57mm' : '80mm';
    const widthMM = savedFormat === '57mm' ? 57 : 80;

    const handlePrint = async () => {
        setPrintStatus('printing');

        if (isNativePrintAvailable()) {
            const bytes = await buildJobOrderTicket(mapFinalTicketToJobOrder(ticket), { widthMM });
            const result = await printRawBytes(bytes);
            setPrintStatus(result.ok ? 'ok' : 'error');
            return;
        }

        const el = ticketRef.current?.querySelector('#final-ticket-zone');
        if (!el) { setPrintStatus(null); return; }

        const result = await printElementWithElectron({
            element: el,
            title: `ArtCode — ${ticket.job_number} (completa)`,
            mode: savedFormat,
            zoneWidth: el.style.width || getThermalZoneWidth(savedFormat),
            zoom: getThermalPrintZoom(savedFormat),
            extraHead: MONTSERRAT_PRINT_HEAD,
            fallbackToBrowser: true,
            browserDelay: 400,
        });

        setPrintStatus(result.ok || result.fallbackUsed ? 'ok' : 'error');
    };

    return (
        <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: `${AD.green}22` }}>
                <CheckCircle2 size={36} style={{ color: AD.green }} />
            </div>
            <p className="text-xl font-bold text-white">¡Orden completa!</p>
            <p className="text-sm text-slate-400">Todas las fases de {ticket.job_number} están terminadas.</p>

            <div ref={ticketRef} className="overflow-auto rounded-xl" style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'center' }}>
                <FinalTicketThermal ticket={ticket} widthMM={widthMM} />
            </div>

            <div className="flex justify-between items-baseline rounded-xl px-5 py-3"
                style={{ background: '#1e293b', border: `1.5px solid ${AD.green}30` }}>
                <span className="text-slate-400 text-sm">Total orden</span>
                <span className="font-bold text-xl" style={{ color: AD.green }}>${fmt(ticket.total)}</span>
            </div>

            <button
                onClick={handlePrint}
                disabled={printStatus === 'printing'}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-60"
                style={{ background: '#1e293b', border: `1.5px solid ${AD.blue}`, color: AD.blue }}
            >
                {printStatus === 'printing'
                    ? <><Loader2 size={15} className="animate-spin" /> Imprimiendo…</>
                    : <><Printer size={15} /> Imprimir ticket final</>}
            </button>
            {printStatus === 'error' && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>
                    No se detectó el servicio de impresión ArtCode Print. Verificá que esté encendido e intentá de nuevo.
                </p>
            )}
            <button
                onClick={onDone}
                className="w-full py-4 rounded-2xl text-base font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})` }}
            >
                Continuar
            </button>
        </div>
    );
}
