import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Wallet, ArrowLeft, ArrowDownCircle, ArrowUpCircle, Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
const fmtDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Show({ session, totals, can_view }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const confirmDialog = useConfirm();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const isOpen = session.status === 'open';

    const [movementForm, setMovementForm] = useState({ type: 'in', amount: '', concept: '' });
    const [closeForm, setCloseForm] = useState({ closing_amount: '', notes: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const submitMovement = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('cash-movements.store'), { cash_session_id: session.id, ...movementForm }, {
            preserveScroll: true,
            onSuccess: () => { setMovementForm({ type: 'in', amount: '', concept: '' }); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    const deleteMovement = (movement) => {
        confirmDialog(`¿Eliminar el movimiento "${movement.concept}"?`, () => {
            router.delete(route('cash-movements.destroy', movement.id), { preserveScroll: true });
        });
    };

    const submitClose = (e) => {
        e.preventDefault();
        confirmDialog('¿Confirmás el cierre de caja con este monto contado? No se puede deshacer.', () => {
            setProcessing(true);
            router.put(route('cash-sessions.close', session.id), closeForm, {
                onError: (errs) => { setErrors(errs); setProcessing(false); },
            });
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Caja — ${session.cash_drawer?.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link href={route('cash-sessions.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Wallet size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{session.cash_drawer?.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Abierta por {session.user?.name} el {fmtDateTime(session.opened_at)}
                            {!isOpen && ` · Cerrada el ${fmtDateTime(session.closed_at)}`}
                        </p>
                    </div>
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

                {can_view && (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Caja Inicial</p>
                        <p className={`mt-1 text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(totals.opening_amount)}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ingresos Manuales</p>
                        <p className="mt-1 text-lg font-extrabold text-emerald-500">{fmt(totals.manual_income)}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Egresos</p>
                        <p className="mt-1 text-lg font-extrabold text-red-500">{fmt(totals.expenses)}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Esperado en Efectivo</p>
                        <p className={`mt-1 text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(totals.expected_cash)}</p>
                    </div>
                </div>

                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Ventas por medio de pago</h2>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Total digital: {fmt(totals.sales_digital_total)}
                        </span>
                    </div>
                    {totals.sales_by_method.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no hay ventas en esta sesión.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/20">
                            {totals.sales_by_method.map((line) => (
                                <div key={line.key} className="px-5 py-3 flex items-center justify-between gap-3">
                                    <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{line.label}</p>
                                    <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(line.amount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </>
                )}

                {can_view && isOpen && (
                    <div className={`${card} p-5`}>
                        <h2 className={`font-extrabold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Registrar movimiento manual</h2>
                        <form onSubmit={submitMovement} className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="w-full sm:w-32">
                                <label className={labelCls}>Tipo</label>
                                <select value={movementForm.type} onChange={(e) => setMovementForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                                    <option value="in">Ingreso</option>
                                    <option value="out">Egreso</option>
                                </select>
                            </div>
                            <div className="w-full sm:w-40">
                                <label className={labelCls}>Monto *</label>
                                <input type="number" step="0.01" min="0.01" value={movementForm.amount}
                                    onChange={(e) => setMovementForm((f) => ({ ...f, amount: e.target.value }))}
                                    className={inputCls} placeholder="0.00" required />
                            </div>
                            <div className="w-full flex-1">
                                <label className={labelCls}>Concepto *</label>
                                <input type="text" value={movementForm.concept}
                                    onChange={(e) => setMovementForm((f) => ({ ...f, concept: e.target.value }))}
                                    className={inputCls} placeholder="Ej: Retiro para depósito bancario" required />
                            </div>
                            <button type="submit" disabled={processing}
                                className="px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                Agregar
                            </button>
                        </form>
                        {errors.amount && <p className="text-red-500 text-xs mt-2">{errors.amount}</p>}
                        {errors.concept && <p className="text-red-500 text-xs mt-2">{errors.concept}</p>}
                    </div>
                )}

                {can_view && (
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Movimientos</h2>
                    </div>
                    {session.cash_movements.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no hay movimientos en esta sesión.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/20">
                            {session.cash_movements.map((m) => (
                                <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {m.type === 'in'
                                            ? <ArrowDownCircle size={18} className="text-emerald-500 shrink-0" />
                                            : <ArrowUpCircle size={18} className="text-red-500 shrink-0" />}
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{m.concept}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDateTime(m.created_at)}{m.reference_type === 'sale' && ' · venta'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-sm font-bold ${m.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {m.type === 'in' ? '+' : '-'}{fmt(m.amount)}
                                        </span>
                                        {isOpen && m.reference_type === 'manual' && (
                                            <button onClick={() => deleteMovement(m)}
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}

                {isOpen ? (
                    <div className={`${card} p-5`}>
                        <h2 className={`font-extrabold mb-3 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Lock size={16} /> Cerrar caja
                        </h2>
                        <form onSubmit={submitClose} className="flex flex-col gap-4">
                            <div>
                                <label className={labelCls}>Monto contado *</label>
                                <input type="number" step="0.01" min="0" value={closeForm.closing_amount}
                                    onChange={(e) => setCloseForm((f) => ({ ...f, closing_amount: e.target.value }))}
                                    className={inputCls} placeholder="0.00" required />
                                {errors.closing_amount && <p className="text-red-500 text-xs mt-1">{errors.closing_amount}</p>}
                                {can_view && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Esperado según el sistema: {fmt(totals.expected_cash)}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>Notas de cierre</label>
                                <textarea value={closeForm.notes} onChange={(e) => setCloseForm((f) => ({ ...f, notes: e.target.value }))}
                                    className={inputCls} rows={2} placeholder="Opcional" />
                            </div>
                            <div>
                                <button type="submit" disabled={processing}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                    style={{ background: `linear-gradient(90deg, #B23A3A, #7C5CBF)` }}>
                                    <Lock size={14} /> Cerrar Caja
                                </button>
                            </div>
                        </form>
                    </div>
                ) : can_view ? (
                    <div className={`${card} p-5`}>
                        <h2 className={`font-extrabold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Cierre</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Monto contado: <span className="font-bold">{fmt(session.closing_amount)}</span></p>
                        {session.notes && <pre className={`text-xs mt-2 whitespace-pre-wrap font-sans ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{session.notes}</pre>}
                    </div>
                ) : (
                    <div className={`${card} p-5`}>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Esta caja ya está cerrada.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
