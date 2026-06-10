import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    ArrowLeft, Edit, Printer,
    User, Calendar, Layers, FileText,
    CheckCircle2, AlertCircle, BriefcaseMedical, SlidersHorizontal, Clock,
    GitBranch, Loader2
} from 'lucide-react';

const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE' };

const STATUS = {
    received: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', Icon: Clock },
    in_progress: { label: 'En Proceso', color: AD.blue, bg: 'rgba(57,123,156,0.12)', Icon: BriefcaseMedical },
    quality_check: { label: 'En Prueba', color: '#F97316', bg: 'rgba(249,115,22,0.1)', Icon: SlidersHorizontal },
    ready: { label: 'Listo', color: AD.green, bg: 'rgba(90,173,156,0.12)', Icon: CheckCircle2 },
    delivered: { label: 'Entregado', color: AD.teal, bg: 'rgba(73,148,156,0.12)', Icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', Icon: AlertCircle },
};
const PRIORITY = {
    urgent: { label: 'URGENTE', color: '#F97316' },
    rush: { label: '🔥 CRÍTICO', color: '#EF4444' },
};

const fmtARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

function Card({ title, icon: Icon, children, D }) {
    return (
        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `rgba(57,123,156,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={AD.blue} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: D.sub }}>{title}</span>
            </div>
            <div style={{ padding: '14px 16px' }}>{children}</div>
        </div>
    );
}

function KV({ label, value, D, accent, last }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: last ? 0 : 9, marginBottom: last ? 0 : 9, borderBottom: last ? 'none' : `1px solid ${D.border}` }}>
            <span style={{ fontSize: 12, color: D.sub, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: accent || D.text, textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>{value || '—'}</span>
        </div>
    );
}

export default function Show({ auth, item }) {
    const { isDark } = useTheme();

    const D = isDark
        ? { bg: '#0f1623', card: '#161f2e', border: 'rgba(255,255,255,0.07)', text: '#e2e8f0', sub: '#94a3b8' }
        : { bg: '#f4f7fb', card: '#ffffff', border: '#e8eef5', text: '#1e293b', sub: '#64748b' };

    const st = STATUS[item.status] || STATUS.received;
    const StIcon = st.Icon;
    const pri = PRIORITY[item.priority];
    const items = item.job_items || [];
    const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
    const discount = Number(item.discount_amount || 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Orden ${item.job_number}`} />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet" />

            <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex flex-col gap-4 pb-20 sm:pb-6 max-w-2xl mx-auto">

                {/* ── Hero card ── */}
                <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})` }} />
                    <div style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                                    <span style={{ fontWeight: 900, fontSize: 20, color: AD.teal, letterSpacing: -0.5 }}>{item.job_number}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.color, fontSize: 10, fontWeight: 700 }}>
                                        <StIcon size={11} />{st.label.toUpperCase()}
                                    </span>
                                    {pri && <span style={{ fontSize: 10, fontWeight: 700, color: pri.color, background: `${pri.color}18`, padding: '3px 8px', borderRadius: 6 }}>{pri.label}</span>}
                                </div>
                                <p style={{ fontSize: 12, color: D.sub }}>Ingresado: {fmtDate(item.received_at)}</p>
                            </div>
                            <p style={{ fontWeight: 900, fontSize: 20, color: D.text, flexShrink: 0 }}>{fmtARS(item.total)}</p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${D.border}`, flexWrap: 'wrap' }}>
                            <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <ArrowLeft size={13} />Volver
                            </button>
                            <Link href={route('jobs.ticket', item.id)}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${D.border}`, background: 'transparent', color: D.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <Printer size={13} />Imprimir
                                </button>
                            </Link>
                            <Link href={route('jobs.edit', item.id)} style={{ marginLeft: 'auto' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 14px rgba(57,123,156,0.28)` }}>
                                    <Edit size={13} />Editar
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Grid 2 cols ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cliente */}
                    <Card title="Odontólogo / Cliente" icon={User} D={D}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: D.text, marginBottom: 4 }}>
                            {item.dentist?.name} {item.dentist?.last_name || ''}
                        </p>
                        {item.dentist?.address && <p style={{ fontSize: 12, color: D.sub, marginBottom: 2 }}>{item.dentist.address}</p>}
                        {item.dentist?.cuit && <p style={{ fontSize: 12, color: D.sub, marginBottom: 2 }}>CUIT: {item.dentist.cuit}</p>}
                        {item.dentist?.phone && <p style={{ fontSize: 12, color: D.sub }}>Tel: {item.dentist.phone}</p>}
                        {item.patient && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
                                <p style={{ fontSize: 10, color: D.sub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Paciente</p>
                                <p style={{ fontWeight: 700, fontSize: 14, color: D.text }}>{item.patient.name} {item.patient.last_name || ''}</p>
                            </div>
                        )}
                    </Card>

                    {/* Tiempos */}
                    <Card title="Estado y Tiempos" icon={Calendar} D={D}>
                        <KV label="Ingreso" value={fmtDate(item.received_at)} D={D} />
                        <KV label="Entrega prevista" value={fmtDate(item.due_date)} D={D} accent="#F59E0B" />
                        {item.delivered_at && <KV label="Entregado" value={fmtDate(item.delivered_at)} D={D} accent={AD.green} />}
                        {item.job_type && <KV label="Tipo" value={item.job_type.name} D={D} />}
                        <KV label="Tono / Color" value={item.shade} D={D} last />
                    </Card>
                </div>

                {/* ── Notas ── */}
                {(item.clinical_notes || item.description || item.notes) && (
                    <Card title="Observaciones" icon={FileText} D={D}>
                        {item.clinical_notes && (
                            <div style={{ marginBottom: item.notes ? 14 : 0 }}>
                                <p style={{ fontSize: 10, color: D.sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Instrucciones Médicas</p>
                                <p style={{ fontSize: 13, color: D.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{item.clinical_notes}</p>
                            </div>
                        )}
                        {item.notes && (
                            <div style={{ paddingTop: item.clinical_notes ? 14 : 0, borderTop: item.clinical_notes ? `1px solid ${D.border}` : 'none' }}>
                                <p style={{ fontSize: 10, color: D.sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Notas Internas</p>
                                <p style={{ fontSize: 13, color: D.text, lineHeight: 1.65 }}>{item.notes}</p>
                            </div>
                        )}
                    </Card>
                )}

                {/* ── Items ── */}
                <Card title={`Trabajos Facturados (${items.length})`} icon={Layers} D={D}>
                    {items.length === 0 ? (
                        <p style={{ fontSize: 13, color: D.sub, textAlign: 'center', padding: '16px 0' }}>Sin ítems registrados.</p>
                    ) : (
                        <>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 72px 72px', gap: 8, paddingBottom: 8, marginBottom: 4, borderBottom: `1px solid ${D.border}` }}>
                                {['Descripción', 'Can.', 'P.Unit', 'Total'].map((h, i) => (
                                    <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: D.sub, textAlign: i > 1 ? 'right' : i === 1 ? 'center' : 'left' }}>{h}</span>
                                ))}
                            </div>
                            {items.map((it, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 72px 72px', gap: 8, padding: '8px 0', borderBottom: i < items.length - 1 ? `1px solid ${D.border}` : 'none' }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: D.text, lineHeight: 1.4 }}>{it.description}</span>
                                    <span style={{ fontSize: 12, color: D.sub, textAlign: 'center', alignSelf: 'center' }}>{Number(it.quantity)}</span>
                                    <span style={{ fontSize: 11, color: D.sub, textAlign: 'right', alignSelf: 'center' }}>${Number(it.unit_price).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: AD.blue, textAlign: 'right', alignSelf: 'center' }}>${Number(it.total || it.unit_price * it.quantity).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                </div>
                            ))}

                            {/* Totals */}
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${D.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                                    <span style={{ fontSize: 12, color: D.sub }}>Subtotal</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{fmtARS(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                                        <span style={{ fontSize: 12, color: D.sub }}>Descuento</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>-{fmtARS(discount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: `linear-gradient(135deg, ${AD.blue}18, ${AD.teal}18)`, borderRadius: 10, border: `1.5px solid ${AD.teal}28` }}>
                                    <span style={{ fontWeight: 800, fontSize: 13, color: D.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</span>
                                    <span style={{ fontWeight: 900, fontSize: 20, color: AD.teal }}>{fmtARS(item.total)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                {/* ── Progreso de Fases ── */}
                {item.phase_progress && item.phase_progress.length > 0 && (
                    <PhaseProgressPanel phases={item.phase_progress} D={D} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

const PHASE_STATUS_META = {
    pending:     { label: 'Pendiente',  color: '#64748b', Icon: Clock },
    in_progress: { label: 'En Proceso', color: '#397B9C', Icon: Loader2 },
    prueba:      { label: 'En Prueba',  color: '#F97316', Icon: SlidersHorizontal },
    completed:   { label: 'Completado', color: '#5AAD9C', Icon: CheckCircle2 },
};

function PhaseProgressPanel({ phases, D }) {
    const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : null;

    return (
        <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(57,123,156,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GitBranch size={14} color="#397B9C" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: D.sub }}>Progreso de Fases</span>
            </div>
            <div style={{ padding: '8px 0' }}>
                {phases.map((phase, idx) => {
                    const meta = PHASE_STATUS_META[phase.status] ?? PHASE_STATUS_META.pending;
                    const Icon = meta.Icon;
                    const isLast = idx === phases.length - 1;
                    return (
                        <div key={phase.id} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: isLast ? 'none' : `1px solid ${D.border}` }}>
                            {/* Icon */}
                            <div style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${meta.color}`, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                <Icon size={13} color={meta.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: D.text }}>{phase.tariff_phase?.name ?? `Fase ${idx + 1}`}</span>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, color: meta.color, background: `${meta.color}18` }}>{meta.label}</span>
                                    {phase.ticket && (
                                        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>#{phase.ticket.ticket_number}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    {phase.collaborator && (
                                        <span style={{ fontSize: 11, color: D.sub }}>Técnico: <strong style={{ color: D.text }}>{phase.collaborator.name}</strong></span>
                                    )}
                                    {phase.tariff_phase?.price > 0 && (
                                        <span style={{ fontSize: 11, color: D.sub }}>Importe: <strong style={{ color: '#397B9C' }}>${Number(phase.tariff_phase.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></span>
                                    )}
                                </div>
                                {phase.completed_at && (
                                    <p style={{ fontSize: 10, color: D.sub, marginTop: 3 }}>Completado: {fmtDateTime(phase.completed_at)}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}