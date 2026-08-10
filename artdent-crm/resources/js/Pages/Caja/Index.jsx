import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Wallet, Plus, X, Save, Lock, Unlock, Settings, CheckCircle2, AlertCircle } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
const fmtDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function Modal({ open, onClose, title, children, isDark }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <X size={15} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Index({ drawers, sessions, can_view }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const [openModal, setOpenModal] = useState(null); // drawer being opened
    const [form, setForm] = useState({ opening_amount: '', notes: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const startOpen = (drawer) => {
        setOpenModal(drawer);
        setForm({ opening_amount: '', notes: '' });
        setErrors({});
    };

    const submitOpen = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('cash-sessions.store'), { cash_drawer_id: openModal.id, ...form }, {
            onSuccess: () => { setOpenModal(null); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Caja" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Wallet size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Caja</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Apertura, cierre y arqueo de caja</p>
                        </div>
                    </div>
                    {can_view && (
                        <Link href={route('cash-drawers.index')} className={`inline-flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Settings size={15} /> Administrar cajas
                        </Link>
                    )}
                </div>

                {flash?.success && (
                    <div className={`${card} p-4 flex items-center gap-2 border-emerald-500/40`}>
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className={`${card} p-4 flex items-center gap-2 border-red-500/40`}>
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{flash.error}</p>
                    </div>
                )}

                {drawers.length === 0 ? (
                    <div className={`${card} p-8 text-center`}>
                        <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Todavía no hay ninguna caja registrada.</p>
                        {can_view && <Link href={route('cash-drawers.index')} className="text-sm font-bold" style={{ color: B.teal }}>+ Crear la primera caja</Link>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {drawers.map((drawer) => {
                            const session = drawer.open_session;
                            const canOpenThis = session ? (can_view || session.is_mine) : true;
                            return (
                                <div key={drawer.id} className={`${card} p-5`}>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{drawer.name}</p>
                                        {session
                                            ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><Unlock size={10} /> Abierta</span>
                                            : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><Lock size={10} /> Cerrada</span>
                                        }
                                    </div>
                                    {session ? (
                                        <div className="space-y-1 mb-4">
                                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Abierta por {session.is_mine ? 'vos' : session.user?.name} el {fmtDateTime(session.opened_at)}
                                            </p>
                                            {can_view && (
                                                <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Monto inicial: {fmt(session.opening_amount)}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin sesión activa</p>
                                    )}
                                    {session ? (
                                        canOpenThis && (
                                            <Link href={route('cash-sessions.show', session.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                                {session.is_mine ? 'Cerrar mi caja' : 'Ver caja abierta'}
                                            </Link>
                                        )
                                    ) : (
                                        <button onClick={() => startOpen(drawer)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                            <Plus size={14} /> Abrir caja
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {can_view && (
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Historial de sesiones</h2>
                    </div>
                    {sessions.data.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no hay sesiones de caja registradas.</p>
                    ) : (
                        <>
                        {/* Cards — solo mobile */}
                        <div className={`sm:hidden divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {sessions.data.map((s) => (
                                <div key={s.id} className="p-4 cursor-pointer" onClick={() => router.get(route('cash-sessions.show', s.id))}>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <p className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{s.cash_drawer?.name}</p>
                                        {s.status === 'open'
                                            ? <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>Abierta</span>
                                            : <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Cerrada</span>
                                        }
                                    </div>
                                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.user?.name}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div>
                                            <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Apertura</p>
                                            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{fmtDateTime(s.opened_at)}</p>
                                        </div>
                                        <div>
                                            <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Cierre</p>
                                            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{fmtDateTime(s.closed_at)}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-between pt-3 border-t text-sm ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{fmt(s.opening_amount)}</span>
                                        <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                            {s.status === 'closed' ? fmt(s.closing_amount) : '—'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tabla — solo desktop */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Caja</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Usuario</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Apertura</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cierre</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monto Inicial</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monto Cierre</th>
                                        <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {sessions.data.map((s) => (
                                        <tr key={s.id} className={`transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                                            onClick={() => router.get(route('cash-sessions.show', s.id))}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{s.cash_drawer?.name}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.user?.name}</td>
                                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDateTime(s.opened_at)}</td>
                                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDateTime(s.closed_at)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmt(s.opening_amount)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.status === 'closed' ? fmt(s.closing_amount) : '—'}</td>
                                            <td className="px-4 py-3">
                                                {s.status === 'open'
                                                    ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>Abierta</span>
                                                    : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Cerrada</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                    <Pagination data={sessions} />
                </div>
                )}
            </div>

            <Modal open={!!openModal} onClose={() => setOpenModal(null)} title={`Abrir ${openModal?.name ?? ''}`} isDark={isDark}>
                <form onSubmit={submitOpen} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Monto inicial *</label>
                        <input type="number" step="0.01" min="0" value={form.opening_amount}
                            onChange={(e) => setForm((f) => ({ ...f, opening_amount: e.target.value }))}
                            className={inputCls} placeholder="0.00" required />
                        {errors.opening_amount && <p className="text-red-500 text-xs mt-1">{errors.opening_amount}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Notas</label>
                        <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            className={inputCls} rows={2} placeholder="Opcional" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setOpenModal(null)}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Abrir Caja
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
