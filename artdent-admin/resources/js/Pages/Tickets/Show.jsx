import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

const STATUS_LABELS = { abierto: 'Abierto', en_progreso: 'En progreso', resuelto: 'Resuelto', cerrado: 'Cerrado' };
const PRIORITY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta' };

export default function Show({ ticket, staff }) {
    const { isDark } = useTheme();
    const cls = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const bottomRef = useRef(null);

    // Poll de red de seguridad — la vía principal es el Echo listener de abajo,
    // que refresca al instante cuando el tenant responde desde el CRM.
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['ticket'], preserveScroll: true });
        }, 45000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!window.Echo) { return; }
        const channelName = `ticket.${ticket.id}`;
        const ch = window.Echo.private(channelName);
        ch.listen('.ticket-message-created', () => {
            router.reload({ only: ['ticket'], preserveScroll: true });
        });
        return () => { window.Echo.leave(channelName); };
    }, [ticket.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket.messages.length]);

    const submitReply = (e) => {
        e.preventDefault();
        post(`/tickets/${ticket.id}/messages`, { preserveScroll: true, onSuccess: () => reset('body') });
    };

    const updateField = (field, value) => {
        router.patch(`/tickets/${ticket.id}`, { [field]: value }, { preserveScroll: true, preserveState: true });
    };

    return (
        <AdminLayout title={`Ticket #${ticket.id}`}>
            <Head title={`Ticket #${ticket.id} · ${ticket.subject}`} />

            <Link href="/tickets" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a soporte
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card title={`#${ticket.id} · ${ticket.subject}`} description={`${ticket.tenant_name || ticket.tenant_id} · ${ticket.created_by_name || ticket.created_by_email}`}>
                        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                            {ticket.messages.map((m) => (
                                <div key={m.id} className={`flex ${m.author_type === 'staff' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                            m.author_type === 'staff'
                                                ? 'bg-brand-cyan text-white'
                                                : isDark ? 'bg-brand-navy border border-white/10' : 'bg-brand-mint'
                                        }`}
                                    >
                                        <p className={`text-xs font-bold mb-1 ${m.author_type === 'staff' ? 'text-white/80' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {m.author_name || m.author_email}
                                        </p>
                                        <p className="whitespace-pre-wrap">{m.body}</p>
                                        <p className={`text-[11px] mt-1 ${m.author_type === 'staff' ? 'text-white/70' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {new Date(m.created_at).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </Card>

                    <Card>
                        <form onSubmit={submitReply} className="space-y-3">
                            <textarea
                                rows={3}
                                className={`${cls} w-full`}
                                placeholder="Escribí tu respuesta…"
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                            />
                            <Button type="submit" disabled={processing || !data.body.trim()}>
                                {processing ? 'Enviando…' : 'Responder'}
                            </Button>
                        </form>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card title="Detalles">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">Estado</label>
                                <select className={`${cls} w-full`} value={ticket.status} onChange={(e) => updateField('status', e.target.value)}>
                                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">Prioridad</label>
                                <select className={`${cls} w-full`} value={ticket.priority} onChange={(e) => updateField('priority', e.target.value)}>
                                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">Asignado a</label>
                                <select
                                    className={`${cls} w-full`}
                                    value={ticket.assigned_to?.id ?? ''}
                                    onChange={(e) => updateField('assigned_to', e.target.value || null)}
                                >
                                    <option value="">Sin asignar</option>
                                    {staff.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">Categoría</label>
                                <Badge color="gray">{ticket.category}</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
