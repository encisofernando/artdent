import { useState } from 'react';
import { todayIso } from '@/lib/localDate';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Gift, Plus, TrendingUp, TrendingDown, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#E63946' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR');

const TYPE_LABELS = { accrual: 'Acreditación', redemption: 'Canje', manual_adjustment: 'Ajuste' };
const TYPE_COLORS = { accrual: B.green, redemption: B.red, manual_adjustment: B.teal };
const REFERENCE_LABELS = { sale: 'Venta POS', ecommerce_order: 'Pedido online' };

export default function CustomerLoyalty({ auth, customer, account, moves }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';

    const [balance, setBalance] = useState(account.balance);
    const [moveList, setMoveList] = useState(moves);

    const [adjOpen, setAdjOpen] = useState(false);
    const [adjSaving, setAdjSaving] = useState(false);
    const [adjError, setAdjError] = useState('');
    const [adjForm, setAdjForm] = useState({
        amount: '', description: '', move_date: todayIso(),
    });

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 10,
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    const handleAdjSubmit = async () => {
        if (!adjForm.amount || Number(adjForm.amount) === 0) {
            setAdjError('Ingresá un monto (positivo = suma, negativo = descuenta).');
            return;
        }
        if (!adjForm.description.trim()) {
            setAdjError('Ingresá una descripción.');
            return;
        }
        setAdjSaving(true);
        setAdjError('');
        try {
            const res = await axios.post(
                route('customers.loyalty.adjustments', customer.id),
                adjForm,
                { headers: { Accept: 'application/json' } }
            );
            setBalance(res.data.balance);
            setMoveList(prev => [res.data.move, ...prev]);
            setAdjForm({ amount: '', description: '', move_date: todayIso() });
            setAdjOpen(false);
        } catch (e) {
            setAdjError(e.response?.data?.message || 'Error al registrar el ajuste.');
        } finally {
            setAdjSaving(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Puntos — ${customer.name}`} />

            <div className="flex flex-col gap-4 sm:gap-6 max-w-3xl">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Link href={route('customers.index')}>
                            <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <ArrowLeft size={18} />
                            </button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
                                Puntos de Fidelización
                            </h1>
                            <p className={`text-sm mt-0.5 ${muted}`}>
                                {customer.name}
                                {customer.dni && ` · DNI ${customer.dni}`}
                                {customer.phone && ` · ${customer.phone}`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setAdjOpen(true); setAdjError(''); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                            ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={14} />
                        <span className="hidden sm:inline">Ajuste manual</span>
                    </button>
                </div>

                {/* Balance */}
                <div className={`rounded-2xl border p-6 flex items-center gap-4 ${card}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Gift size={22} className="text-white" />
                    </div>
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Saldo disponible</p>
                        <p className={`text-3xl font-extrabold ${text}`}>{fmt(balance)} pts</p>
                    </div>
                </div>

                {/* Historial */}
                <div className={`rounded-2xl border ${card}`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`text-sm font-bold ${text}`}>Historial de movimientos</h2>
                    </div>
                    <div className="divide-y divide-slate-200/10">
                        {moveList.length === 0 && (
                            <p className={`px-5 py-8 text-sm text-center ${muted}`}>Sin movimientos todavía.</p>
                        )}
                        {moveList.map(m => (
                            <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${TYPE_COLORS[m.type]}1a` }}>
                                        {m.amount >= 0
                                            ? <TrendingUp size={15} style={{ color: TYPE_COLORS[m.type] }} />
                                            : <TrendingDown size={15} style={{ color: TYPE_COLORS[m.type] }} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate ${text}`}>
                                            {m.description || TYPE_LABELS[m.type] || m.type}
                                        </p>
                                        <p className={`text-xs ${muted}`}>
                                            {TYPE_LABELS[m.type] || m.type}
                                            {m.reference_type && ` · ${REFERENCE_LABELS[m.reference_type] ?? m.reference_type}`}
                                            {m.user && ` · ${m.user}`} · {m.move_date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-extrabold" style={{ color: TYPE_COLORS[m.type] }}>
                                        {m.amount >= 0 ? '+' : ''}{fmt(m.amount)} pts
                                    </p>
                                    <p className={`text-[11px] ${muted}`}>Saldo: {fmt(m.balance_after)} pts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {adjOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAdjOpen(false)}>
                    <div
                        className={`w-full max-w-sm rounded-2xl border p-5 space-y-3 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className={`text-sm font-bold ${text}`}>Ajuste manual de puntos</h3>
                        <div>
                            <label className={`block text-xs font-semibold mb-1 ${muted}`}>Puntos (positivo suma, negativo descuenta)</label>
                            <input type="number" step="1" style={inputStyle} value={adjForm.amount}
                                onChange={e => setAdjForm(f => ({ ...f, amount: e.target.value }))} placeholder="Ej: 500 o -200" />
                        </div>
                        <div>
                            <label className={`block text-xs font-semibold mb-1 ${muted}`}>Descripción</label>
                            <input type="text" style={inputStyle} value={adjForm.description}
                                onChange={e => setAdjForm(f => ({ ...f, description: e.target.value }))} placeholder="Motivo del ajuste" />
                        </div>
                        <div>
                            <label className={`block text-xs font-semibold mb-1 ${muted}`}>Fecha</label>
                            <input type="date" style={inputStyle} value={adjForm.move_date}
                                onChange={e => setAdjForm(f => ({ ...f, move_date: e.target.value }))} />
                        </div>
                        {adjError && <p className="text-xs text-red-500">{adjError}</p>}
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setAdjOpen(false)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                                Cancelar
                            </button>
                            <button onClick={handleAdjSubmit} disabled={adjSaving}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                                {adjSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
