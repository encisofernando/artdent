import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    Plus, Search, Edit, Trash2, BriefcaseMedical,
    ChevronLeft, ChevronRight, SlidersHorizontal,
    Clock, CheckCircle2, AlertCircle, Printer, Eye, X,
    CalendarClock, Banknote
} from 'lucide-react';

// ─── Brand ───────────────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0', pale: '#DAEEE3' };

const STATUS = {
    received: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', Icon: Clock },
    in_progress: { label: 'En Proceso', color: AD.blue, bg: 'rgba(57,123,156,0.12)', Icon: BriefcaseMedical },
    quality_check: { label: 'En Prueba', color: '#F97316', bg: 'rgba(249,115,22,0.1)', Icon: SlidersHorizontal },
    ready: { label: 'Listo', color: AD.green, bg: 'rgba(90,173,156,0.12)', Icon: CheckCircle2 },
    delivered: { label: 'Entregado', color: AD.teal, bg: 'rgba(73,148,156,0.12)', Icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', Icon: AlertCircle },
};
const PRIORITY = {
    normal: null,
    urgent: { label: 'URG', color: '#F97316' },
    rush: { label: '🔥 CRÍTICO', color: '#EF4444' },
};

const fmtARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
const isOverdue = (d) => d && new Date(d) < new Date() && true;

function StatusPill({ status, size = 'sm' }) {
    const cfg = STATUS[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', Icon: Clock };
    const Icon = cfg.Icon;
    const pad = size === 'xs' ? '2px 8px' : '4px 10px';
    const fs = size === 'xs' ? 10 : 11;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: pad, borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: fs, fontWeight: 700 }}>
            <Icon size={fs} />
            {cfg.label.toUpperCase()}
        </span>
    );
}

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [showFilters, setShowFilters] = useState(false);

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8', hover: 'rgba(255,255,255,0.04)' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b', hover: '#f8fafc' };

    useEffect(() => {
        const t = setTimeout(() => {
            if (search !== filters.search || status !== filters.status) {
                router.get(route('jobs.index'), { search, status }, { preserveState: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(t);
    }, [search, status]);

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar este trabajo? Esta acción no se puede deshacer.', () =>
            router.delete(route('jobs.destroy', id))
        );
    };

    const statusTabs = [
        { value: 'all', label: 'Todos' },
        { value: 'received', label: 'Pendientes' },
        { value: 'in_progress', label: 'En Proceso' },
        { value: 'ready', label: 'Listos' },
        { value: 'delivered', label: 'Entregados' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Órdenes de Trabajo" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet" />

            <style>{`
                .job-card { transition: box-shadow 0.15s, transform 0.15s; }
                .job-card:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(57,123,156,0.13); }
                .tab-btn { transition: all 0.15s; }
                .action-btn { transition: all 0.15s; opacity: 0.7; }
                .action-btn:hover { opacity: 1; transform: scale(1.1); }
                @media (max-width: 640px) { .desktop-only { display: none !important; } }
                @media (min-width: 641px) { .mobile-only { display: none !important; } }
            `}</style>

            <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex flex-col gap-4 pb-20 sm:pb-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 style={{ color: D.text, fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>
                            Órdenes de Trabajo
                        </h1>
                        <p style={{ color: D.sub, fontSize: 13, marginTop: 2 }}>
                            {items.total} trabajos · Lab ArtDent
                        </p>
                    </div>
                    <Link href={route('jobs.create')}>
                        <button style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, color: '#fff', border: 'none', borderRadius: 14, padding: '10px 18px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', boxShadow: `0 4px 14px rgba(57,123,156,0.3)` }}>
                            <Plus size={16} />
                            <span className="desktop-only">Nuevo Trabajo</span>
                            <span className="mobile-only">Nuevo</span>
                        </button>
                    </Link>
                </div>

                {/* ── Search bar + filter toggle ── */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: D.sub, pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nro, odontólogo, paciente..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 38, paddingRight: search ? 36 : 14, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: `1.5px solid ${D.border}`, background: D.card, color: D.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: D.sub, cursor: 'pointer', padding: 2 }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className="mobile-only"
                        style={{ padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${showFilters ? AD.teal : D.border}`, background: showFilters ? `rgba(73,148,156,0.12)` : D.card, color: showFilters ? AD.teal : D.sub, cursor: 'pointer' }}
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                {/* ── Status tabs — desktop ── */}
                <div className="desktop-only" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {statusTabs.map(t => (
                        <button key={t.value} onClick={() => setStatus(t.value)} className="tab-btn" style={{
                            padding: '7px 16px', borderRadius: 10, border: `1.5px solid ${status === t.value ? AD.teal : D.border}`,
                            background: status === t.value ? `rgba(73,148,156,0.12)` : D.card,
                            color: status === t.value ? AD.teal : D.sub,
                            fontWeight: status === t.value ? 700 : 500, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Status filter — mobile dropdown ── */}
                {showFilters && (
                    <div className="mobile-only" style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 14, padding: 16 }}>
                        <p style={{ color: D.sub, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Estado</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {statusTabs.map(t => (
                                <button key={t.value} onClick={() => { setStatus(t.value); setShowFilters(false); }} style={{
                                    padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${status === t.value ? AD.teal : D.border}`,
                                    background: status === t.value ? `rgba(73,148,156,0.12)` : 'transparent',
                                    color: status === t.value ? AD.teal : D.sub,
                                    fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                                }}>{t.label}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Lista ── */}
                {items.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: D.sub }}>
                        <BriefcaseMedical size={48} style={{ opacity: 0.15, margin: '0 auto 16px', display: 'block' }} />
                        <p style={{ fontWeight: 700, fontSize: 15, color: D.text }}>Sin resultados</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>Probá con otro filtro o crea una nueva orden.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.data.map(job => {
                            const pri = PRIORITY[job.priority];
                            const overdue = isOverdue(job.due_date) && !['delivered', 'cancelled'].includes(job.status);
                            return (
                                <div key={job.id} className="job-card" style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
                                    {/* Accent line top — color by status */}
                                    <div style={{ height: 3, background: STATUS[job.status]?.color || '#94a3b8' }} />

                                    <div style={{ padding: '14px 16px' }}>
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Left */}
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                                    <Link href={route('jobs.show', job.id)}>
                                                        <span style={{ fontWeight: 900, fontSize: 14, color: AD.teal, letterSpacing: -0.2, cursor: 'pointer' }}>
                                                            {job.job_number}
                                                        </span>
                                                    </Link>
                                                    <StatusPill status={job.status} size="xs" />
                                                    {pri && (
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: pri.color, background: `${pri.color}18`, padding: '2px 7px', borderRadius: 6 }}>
                                                            {pri.label}
                                                        </span>
                                                    )}
                                                </div>

                                                <p style={{ fontWeight: 700, fontSize: 14, color: D.text, marginBottom: 2 }}>
                                                    {job.dentist ? `${job.dentist.name} ${job.dentist.last_name || ''}`.trim() : 'Sin odontólogo'}
                                                </p>
                                                {job.patient && (
                                                    <p style={{ fontSize: 12, color: D.sub, marginBottom: 2 }}>
                                                        Pac: {job.patient.name} {job.patient.last_name || ''}
                                                    </p>
                                                )}
                                                {job.job_type && (
                                                    <span style={{ fontSize: 11, color: AD.blue, background: `rgba(57,123,156,0.08)`, padding: '2px 8px', borderRadius: 6, fontWeight: 600, display: 'inline-block', marginTop: 2 }}>
                                                        {job.job_type.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Right */}
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ fontWeight: 900, fontSize: 15, color: D.text }}>{fmtARS(job.total)}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                                                    <CalendarClock size={11} style={{ color: overdue ? '#EF4444' : D.sub }} />
                                                    <span style={{ fontSize: 11, color: overdue ? '#EF4444' : D.sub, fontWeight: overdue ? 700 : 400 }}>
                                                        {fmtDate(job.due_date)}
                                                    </span>
                                                </div>
                                                {overdue && (
                                                    <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>VENCIDA</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${D.border}` }}>
                                            <span style={{ fontSize: 11, color: D.sub }}>
                                                Rec: {fmtDate(job.received_at)}
                                            </span>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link href={route('jobs.show', job.id)}>
                                                    <button className="action-btn" title="Ver detalle" style={{ padding: '6px 10px', borderRadius: 9, border: `1px solid ${D.border}`, background: 'transparent', color: AD.blue, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                                                        <Eye size={14} />
                                                        <span className="desktop-only">Ver</span>
                                                    </button>
                                                </Link>
                                                <Link href={route('jobs.ticket', job.id)}>
                                                    <button className="action-btn" title="Imprimir ticket" style={{ padding: '6px 10px', borderRadius: 9, border: `1px solid ${D.border}`, background: 'transparent', color: D.sub, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <Printer size={14} />
                                                    </button>
                                                </Link>
                                                <Link href={route('jobs.edit', job.id)}>
                                                    <button className="action-btn" title="Editar" style={{ padding: '6px 10px', borderRadius: 9, border: `1px solid ${D.border}`, background: 'transparent', color: D.sub, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>
                                                <button className="action-btn" onClick={() => handleDelete(job.id)} title="Eliminar" style={{ padding: '6px 10px', borderRadius: 9, border: `1px solid rgba(239,68,68,0.2)`, background: 'transparent', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Paginación ── */}
                {items.data.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px' }}>
                        <p style={{ fontSize: 12, color: D.sub }}>
                            {items.from}–{items.to} de <strong>{items.total}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {items.links.map((link, i) => {
                                const isPrev = link.label.includes('Previous');
                                const isNext = link.label.includes('Next');
                                if (!link.url && !isPrev && !isNext) return null;
                                return (
                                    <Link key={i} href={link.url || '#'}>
                                        <button disabled={!link.url} style={{
                                            width: 34, height: 34, borderRadius: 10,
                                            border: `1.5px solid ${link.active ? AD.teal : D.border}`,
                                            background: link.active ? `rgba(73,148,156,0.12)` : D.card,
                                            color: link.active ? AD.teal : D.sub,
                                            fontWeight: link.active ? 700 : 400, fontSize: 13,
                                            cursor: link.url ? 'pointer' : 'not-allowed', opacity: link.url ? 1 : 0.4,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
                                        }}>
                                            {isPrev ? <ChevronLeft size={14} /> : isNext ? <ChevronRight size={14} /> : link.label}
                                        </button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}