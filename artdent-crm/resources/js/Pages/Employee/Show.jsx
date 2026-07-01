import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { ArrowLeft, User, BadgeDollarSign, Percent, Plus, Trash2, Pencil, FileText, X, Save } from 'lucide-react';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

const STATUS_BADGE = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LABEL = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };

function Modal({ open, onClose, title, isDark, children }) {
    if (!open) { return null; }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={15} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Show({ auth, employee, extras, discounts }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    /* ── Extra modal ── */
    const [extraModal, setExtraModal] = useState(false);
    const [extraForm, setExtraForm] = useState({ date: '', concept: '', amount: '' });
    const [extraProcessing, setExtraProcessing] = useState(false);

    const submitExtra = (e) => {
        e.preventDefault();
        setExtraProcessing(true);
        router.post(route('employee-extras.store'), { ...extraForm, employee_id: employee.id }, {
            onSuccess: () => { setExtraModal(false); setExtraForm({ date: '', concept: '', amount: '' }); setExtraProcessing(false); },
            onError: () => setExtraProcessing(false),
        });
    };

    /* ── Discount modal ── */
    const [discountModal, setDiscountModal] = useState(false);
    const [discountForm, setDiscountForm] = useState({ date: '', concept: '', amount: '' });
    const [discountProcessing, setDiscountProcessing] = useState(false);

    const submitDiscount = (e) => {
        e.preventDefault();
        setDiscountProcessing(true);
        router.post(route('employee-discounts.store'), { ...discountForm, employee_id: employee.id }, {
            onSuccess: () => { setDiscountModal(false); setDiscountForm({ date: '', concept: '', amount: '' }); setDiscountProcessing(false); },
            onError: () => setDiscountProcessing(false),
        });
    };

    /* ── Receipt modal ── */
    const [receiptModal, setReceiptModal] = useState(false);
    const [receiptForm, setReceiptForm] = useState({ period_from: '', period_to: '', notes: '' });
    const [receiptProcessing, setReceiptProcessing] = useState(false);

    const submitReceipt = (e) => {
        e.preventDefault();
        setReceiptProcessing(true);
        router.post(route('employee-receipts.store'), { ...receiptForm, employee_id: employee.id }, {
            onError: () => setReceiptProcessing(false),
        });
    };

    const deleteExtra = (id) => { confirmDialog('¿Eliminar este extra?', () => router.delete(route('employee-extras.destroy', id), { preserveScroll: true })); };
    const deleteDiscount = (id) => { confirmDialog('¿Eliminar este descuento?', () => router.delete(route('employee-discounts.destroy', id), { preserveScroll: true })); };

    const sectionTitle = (t) => <h2 className={`text-sm font-extrabold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t}</h2>;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Personal — ${employee.user?.name}`} />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('employees.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <User size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{employee.user?.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{employee.position ?? 'Sin cargo asignado'} · {employee.user?.email}</p>
                    </div>
                    <button onClick={() => setReceiptModal(true)} className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <FileText size={14} /> Generar Recibo
                    </button>
                </div>

                {/* Info card */}
                <div className={`${card} p-5 grid grid-cols-2 sm:grid-cols-4 gap-4`}>
                    {[
                        { label: 'Sueldo base', value: fmt(employee.salary), icon: BadgeDollarSign, color: 'teal' },
                        { label: 'Comisión', value: employee.commission_pct > 0 ? `${parseFloat(employee.commission_pct).toFixed(1)}%` : '—', icon: Percent, color: 'amber' },
                        { label: 'Ingreso', value: fmtDate(employee.hire_date), icon: null, color: null },
                        { label: 'DNI', value: employee.dni ?? '—', icon: null, color: null },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                            <p className={`font-bold text-base flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {Icon && <Icon size={14} className={color === 'teal' ? (isDark ? 'text-teal-400' : 'text-teal-600') : (isDark ? 'text-amber-400' : 'text-amber-600')} />}
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Extras */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Extras / Adicionales')}
                            <button onClick={() => setExtraModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {extras.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin extras registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {extras.map(e => (
                                    <div key={e.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{e.concept}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDate(e.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+{fmt(e.amount)}</span>
                                            <button onClick={() => deleteExtra(e.id)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`mt-3 pt-3 border-t text-sm font-bold flex justify-between ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-800'}`}>
                            <span>Total extras</span>
                            <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{fmt(extras.reduce((s, e) => s + parseFloat(e.amount), 0))}</span>
                        </div>
                    </div>

                    {/* Descuentos */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Descuentos')}
                            <button onClick={() => setDiscountModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, #9C3939, #9C6149)` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {discounts.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin descuentos registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {discounts.map(d => (
                                    <div key={d.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{d.concept}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDate(d.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>−{fmt(d.amount)}</span>
                                            <button onClick={() => deleteDiscount(d.id)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`mt-3 pt-3 border-t text-sm font-bold flex justify-between ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-800'}`}>
                            <span>Total descuentos</span>
                            <span className={isDark ? 'text-red-400' : 'text-red-600'}>{fmt(discounts.reduce((s, d) => s + parseFloat(d.amount), 0))}</span>
                        </div>
                    </div>
                </div>

                {/* Historial de recibos */}
                {employee.receipts?.length > 0 && (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Historial de Recibos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Período', 'Sueldo', 'Comisión', 'Extras', 'Desc.', 'Neto', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {employee.receipts.map(r => (
                                        <tr key={r.id} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(r.period_from)} – {fmtDate(r.period_to)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fmt(r.salary_gross)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{fmt(r.commission_gross)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{fmt(r.extras_total)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{fmt(r.discounts_total)}</td>
                                            <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(r.net)}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Link href={route('employee-receipts.show', r.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <FileText size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Extra */}
            <Modal open={extraModal} onClose={() => setExtraModal(false)} title="Agregar Extra" isDark={isDark}>
                <form onSubmit={submitExtra} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Fecha *</label><input type="date" value={extraForm.date} onChange={e => setExtraForm(f => ({ ...f, date: e.target.value }))} className={inputCls} required /></div>
                    <div><label className={labelCls}>Concepto *</label><input type="text" value={extraForm.concept} onChange={e => setExtraForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} placeholder="Premio, Bono, Horas extra..." required /></div>
                    <div><label className={labelCls}>Importe *</label><input type="number" step="0.01" min="0.01" value={extraForm.amount} onChange={e => setExtraForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" required /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setExtraModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={extraProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Descuento */}
            <Modal open={discountModal} onClose={() => setDiscountModal(false)} title="Agregar Descuento" isDark={isDark}>
                <form onSubmit={submitDiscount} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Fecha *</label><input type="date" value={discountForm.date} onChange={e => setDiscountForm(f => ({ ...f, date: e.target.value }))} className={inputCls} required /></div>
                    <div><label className={labelCls}>Concepto *</label><input type="text" value={discountForm.concept} onChange={e => setDiscountForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} placeholder="Adelanto, Falta, Descuento..." required /></div>
                    <div><label className={labelCls}>Importe *</label><input type="number" step="0.01" min="0.01" value={discountForm.amount} onChange={e => setDiscountForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" required /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDiscountModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={discountProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(90deg, #9C3939, #9C6149)' }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Recibo */}
            <Modal open={receiptModal} onClose={() => setReceiptModal(false)} title="Generar Recibo de Sueldo" isDark={isDark}>
                <form onSubmit={submitReceipt} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Período desde *</label><input type="date" value={receiptForm.period_from} onChange={e => setReceiptForm(f => ({ ...f, period_from: e.target.value }))} className={inputCls} required /></div>
                        <div><label className={labelCls}>Período hasta *</label><input type="date" value={receiptForm.period_to} onChange={e => setReceiptForm(f => ({ ...f, period_to: e.target.value }))} className={inputCls} required /></div>
                    </div>
                    <div><label className={labelCls}>Notas</label><input type="text" value={receiptForm.notes} onChange={e => setReceiptForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} placeholder="Observaciones..." /></div>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        El sistema calculará automáticamente: sueldo base + comisiones sobre ventas del período + extras − descuentos.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setReceiptModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={receiptProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <FileText size={14} /> Generar
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
