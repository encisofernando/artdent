import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import SearchableSelect from '@/Components/SearchableSelect';
import {
    ArrowLeft, CreditCard, TrendingDown, TrendingUp, Plus, Check,
    Mail, Banknote, Wallet, SlidersHorizontal,
} from 'lucide-react';
import { DatePicker } from '@/Components/_appkit';
import axios from 'axios';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#E63946', amber: '#F59E0B' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const TYPE_LABELS = { charge: 'Cargo', payment: 'Pago', adjustment: 'Ajuste' };
const TYPE_COLORS = { charge: B.red, payment: B.green, adjustment: B.teal };

const FILTER_TABS = [
    { key: 'all', label: 'Todos' },
    { key: 'charge', label: 'Cargos' },
    { key: 'payment', label: 'Pagos' },
    { key: 'adjustment', label: 'Ajustes' },
];

export default function Account({ auth, customer, account, moves, paymentMethods }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 10,
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    const [balance, setBalance]   = useState(account.balance);
    const [moveList, setMoveList] = useState(moves);
    const [typeFilter, setTypeFilter] = useState('all');

    // Payment form
    const [payOpen, setPayOpen]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [payError, setPayError] = useState('');
    const [paySuccess, setPaySuccess] = useState('');
    const [payForm, setPayForm]   = useState({
        amount: '', payment_method_id: '', description: '',
        move_date: new Date().toISOString().slice(0, 10), send_email: false,
    });

    // Adjustment form
    const [adjOpen, setAdjOpen]   = useState(false);
    const [adjSaving, setAdjSaving] = useState(false);
    const [adjError, setAdjError] = useState('');
    const [adjForm, setAdjForm]   = useState({
        amount: '', description: '', move_date: new Date().toISOString().slice(0, 10),
    });

    // Send statement
    const [stmtOpen, setStmtOpen]     = useState(false);
    const [stmtEmail, setStmtEmail]   = useState(customer.email || '');
    const [stmtSending, setStmtSending] = useState(false);
    const [stmtMsg, setStmtMsg]       = useState('');

    // KPIs derived from moves
    const kpis = useMemo(() => {
        const totalCharged = moveList
            .filter(m => m.type === 'charge')
            .reduce((s, m) => s + Math.abs(m.amount), 0);
        const totalPaid = moveList
            .filter(m => m.type === 'payment')
            .reduce((s, m) => s + Math.abs(m.amount), 0);
        return { totalCharged, totalPaid };
    }, [moveList]);

    const filteredMoves = useMemo(() =>
        typeFilter === 'all' ? moveList : moveList.filter(m => m.type === typeFilter),
        [moveList, typeFilter]
    );

    const handlePaySubmit = async () => {
        if (!payForm.amount || Number(payForm.amount) <= 0) {
            setPayError('Ingresá un monto válido.');
            return;
        }
        setSaving(true);
        setPayError('');
        setPaySuccess('');
        try {
            const res = await axios.post(
                route('customers.account.payments', customer.id),
                payForm,
                { headers: { Accept: 'application/json' } }
            );
            setBalance(res.data.balance);
            setMoveList(prev => [res.data.move, ...prev]);
            setPaySuccess('Pago registrado.' + (payForm.send_email && customer.email ? ' Email enviado.' : ''));
            setPayForm({ amount: '', payment_method_id: '', description: '', move_date: new Date().toISOString().slice(0, 10), send_email: false });
            setPayOpen(false);
        } catch (e) {
            setPayError(e.response?.data?.message || 'Error al registrar pago.');
        } finally {
            setSaving(false);
        }
    };

    const handleAdjSubmit = async () => {
        if (!adjForm.amount || Number(adjForm.amount) === 0) {
            setAdjError('Ingresá un monto (positivo = cargo, negativo = acreditar).');
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
                route('customers.account.adjustments', customer.id),
                adjForm,
                { headers: { Accept: 'application/json' } }
            );
            setBalance(res.data.balance);
            setMoveList(prev => [res.data.move, ...prev]);
            setAdjForm({ amount: '', description: '', move_date: new Date().toISOString().slice(0, 10) });
            setAdjOpen(false);
        } catch (e) {
            setAdjError(e.response?.data?.message || 'Error al registrar ajuste.');
        } finally {
            setAdjSaving(false);
        }
    };

    const handleSendStatement = async () => {
        if (!stmtEmail) { return; }
        setStmtSending(true);
        setStmtMsg('');
        try {
            await axios.post(route('customers.account.send-statement', customer.id), { email: stmtEmail });
            setStmtMsg('✓ Estado de cuenta enviado.');
            setTimeout(() => { setStmtOpen(false); setStmtMsg(''); }, 2000);
        } catch (e) {
            setStmtMsg('✗ ' + (e.response?.data?.message || 'Error al enviar.'));
        } finally {
            setStmtSending(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Cuenta Corriente — ${customer.name}`} />

            <div className="flex flex-col gap-4 sm:gap-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Link href={route('customers.accounts')}>
                            <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <ArrowLeft size={18} />
                            </button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
                                Cuenta Corriente
                            </h1>
                            <p className={`text-sm mt-0.5 ${muted}`}>
                                {customer.name}
                                {customer.dni && ` · DNI ${customer.dni}`}
                                {customer.phone && ` · ${customer.phone}`}
                            </p>
                        </div>
                    </div>

                    {/* Estado de cuenta */}
                    <div className="relative">
                        <button
                            onClick={() => { setStmtOpen(o => !o); setStmtMsg(''); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                                ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Mail size={14} />
                            <span className="hidden sm:inline">Estado de cuenta</span>
                        </button>
                        {stmtOpen && (
                            <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-xl z-50 p-4 space-y-3
                                ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Enviar estado de cuenta por email
                                </p>
                                <input
                                    type="email"
                                    value={stmtEmail}
                                    onChange={e => setStmtEmail(e.target.value)}
                                    placeholder="correo@cliente.com"
                                    className={`w-full text-sm px-3 py-2 rounded-xl border outline-none
                                        ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                />
                                {stmtMsg && (
                                    <p className={`text-xs ${stmtMsg.startsWith('✓') ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {stmtMsg}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSendStatement}
                                        disabled={stmtSending || !stmtEmail}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                    >
                                        <Mail size={13} />
                                        {stmtSending ? 'Enviando...' : 'Enviar'}
                                    </button>
                                    <button
                                        onClick={() => setStmtOpen(false)}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors
                                            ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                        { label: 'Cargado', value: kpis.totalCharged, color: B.red, icon: TrendingUp },
                        { label: 'Pagado', value: kpis.totalPaid, color: B.green, icon: TrendingDown },
                        { label: 'Saldo', value: Math.abs(balance), color: balance > 0 ? B.red : B.green, icon: CreditCard,
                          sub: balance > 0 ? 'Deuda' : balance < 0 ? 'A favor' : 'Al día' },
                    ].map(({ label, value, color, icon: Icon, sub }) => (
                        <div key={label} className={`rounded-2xl border p-3 sm:p-4 shadow-sm ${card}`}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}20` }}>
                                    <Icon size={12} style={{ color }} />
                                </div>
                                <span className={`text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider leading-tight ${muted}`}>{label}</span>
                            </div>
                            <p className="text-sm sm:text-xl font-extrabold leading-tight" style={{ color }}>${fmt(value)}</p>
                            {sub && <p className={`text-[10px] mt-0.5 ${muted}`}>{sub}</p>}
                        </div>
                    ))}
                </div>

                {/* Actions row */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => { setPayOpen(o => !o); setAdjOpen(false); setPayError(''); setPaySuccess(''); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})` }}
                    >
                        <Plus size={15} />
                        Registrar pago
                    </button>
                    <button
                        onClick={() => { setAdjOpen(o => !o); setPayOpen(false); setAdjError(''); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                            ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={15} />
                        Ajuste manual
                    </button>
                </div>

                {/* Payment form */}
                {payOpen && (
                    <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${card}`}>
                        <h3 className={`text-sm font-bold ${text}`}>Registrar pago</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MONTO *</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${muted}`}>$</span>
                                    <input type="number" value={payForm.amount}
                                        onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="0,00" className="outline-none"
                                        style={{ ...inputStyle, paddingLeft: 24 }} />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MÉTODO DE PAGO</label>
                                <SearchableSelect
                                    value={String(payForm.payment_method_id || '')}
                                    onChange={v => setPayForm(p => ({ ...p, payment_method_id: v }))}
                                    placeholder="— Seleccionar —"
                                    options={paymentMethods.map(pm => ({ value: String(pm.id), label: pm.name }))}
                                />
                            </div>
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>FECHA</label>
                                <DatePicker value={payForm.move_date}
                                    onChange={v => setPayForm(p => ({ ...p, move_date: v }))}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>DESCRIPCIÓN</label>
                                <input type="text" value={payForm.description}
                                    onChange={e => setPayForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Opcional" className="outline-none" style={inputStyle} />
                            </div>
                        </div>
                        {customer.email && (
                            <label className={`flex items-center gap-2 text-xs cursor-pointer select-none ${muted}`}>
                                <input type="checkbox" checked={payForm.send_email}
                                    onChange={e => setPayForm(p => ({ ...p, send_email: e.target.checked }))}
                                    className="rounded" />
                                Enviar confirmación por email a <strong className={text}>{customer.email}</strong>
                            </label>
                        )}
                        {payError && <p className="text-[12px] text-red-400">{payError}</p>}
                        {paySuccess && (
                            <div className="flex items-center gap-2 text-emerald-500 text-[12.5px] font-semibold">
                                <Check size={14} /> {paySuccess}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setPayOpen(false)}
                                className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold ${muted}`}>
                                Cancelar
                            </button>
                            <button onClick={handlePaySubmit} disabled={saving}
                                className="px-5 py-2 rounded-lg text-[12.5px] font-bold text-white transition-opacity"
                                style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})`, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Guardando...' : 'Guardar pago'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Adjustment form */}
                {adjOpen && (
                    <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${card}`}>
                        <div>
                            <h3 className={`text-sm font-bold ${text}`}>Ajuste manual de saldo</h3>
                            <p className={`text-[11.5px] mt-0.5 ${muted}`}>
                                Monto positivo = cargo (suma deuda). Monto negativo = acreditación (reduce deuda).
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MONTO *</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${muted}`}>$</span>
                                    <input type="number" value={adjForm.amount}
                                        onChange={e => setAdjForm(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="-500 o 1000" className="outline-none"
                                        style={{ ...inputStyle, paddingLeft: 24 }} />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>FECHA</label>
                                <DatePicker value={adjForm.move_date}
                                    onChange={v => setAdjForm(p => ({ ...p, move_date: v }))}
                                    style={inputStyle} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>DESCRIPCIÓN *</label>
                                <input type="text" value={adjForm.description}
                                    onChange={e => setAdjForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Motivo del ajuste" className="outline-none" style={inputStyle} />
                            </div>
                        </div>
                        {adjError && <p className="text-[12px] text-red-400">{adjError}</p>}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setAdjOpen(false)}
                                className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold ${muted}`}>
                                Cancelar
                            </button>
                            <button onClick={handleAdjSubmit} disabled={adjSaving}
                                className="px-5 py-2 rounded-lg text-[12.5px] font-bold text-white transition-opacity"
                                style={{ background: `linear-gradient(135deg, ${B.amber}, ${B.teal})`, opacity: adjSaving ? 0.6 : 1 }}>
                                {adjSaving ? 'Guardando...' : 'Guardar ajuste'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Movements */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    {/* Header + filter */}
                    <div className={`px-4 py-3 border-b flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest ${muted}`}>Movimientos</h2>
                        <div className={`flex gap-1 rounded-xl p-1 overflow-x-auto ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            {FILTER_TABS.map(tab => (
                                <button key={tab.key}
                                    onClick={() => setTypeFilter(tab.key)}
                                    className={`px-3 py-1 rounded-lg text-[11.5px] font-semibold transition-colors whitespace-nowrap
                                        ${typeFilter === tab.key
                                            ? 'bg-white text-slate-800 shadow-sm'
                                            : `${muted} hover:text-slate-700`
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredMoves.length === 0 ? (
                        <div className={`px-6 py-10 text-center text-sm ${muted}`}>
                            Sin movimientos registrados.
                        </div>
                    ) : (<>
                        {/* Mobile cards */}
                        <div className={`sm:hidden divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                            {filteredMoves.map(m => {
                                const color = TYPE_COLORS[m.type] ?? B.teal;
                                const signedAmt = m.signed_amount ?? m.amount;
                                return (
                                    <div key={m.id} className={`px-4 py-3 ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {m.type === 'charge'
                                                    ? <TrendingUp size={14} style={{ color }} className="shrink-0" />
                                                    : <TrendingDown size={14} style={{ color }} className="shrink-0" />
                                                }
                                                <div className="min-w-0">
                                                    <span className="text-[12px] font-bold" style={{ color }}>
                                                        {TYPE_LABELS[m.type] ?? m.type}
                                                    </span>
                                                    <span className={`ml-2 text-[11px] ${muted}`}>{m.move_date}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-[13px]" style={{ color }}>
                                                    {signedAmt < 0 ? '−' : '+'} ${fmt(Math.abs(signedAmt))}
                                                </p>
                                                <p className={`text-[11px] ${muted}`}>Saldo ${fmt(m.balance_after)}</p>
                                            </div>
                                        </div>
                                        <p className={`text-[12px] ${text} ml-6`}>{m.description || '—'}</p>
                                        {m.payment_method && (
                                            <p className={`text-[11px] ml-6 ${muted}`}>{m.payment_method}</p>
                                        )}
                                        {m.reference_type === 'sale' && m.reference_id && (
                                            <Link href={route('sales.show', m.reference_id)}
                                                className="text-[11px] ml-6" style={{ color: B.teal }}>
                                                Ver venta →
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className={`text-[11px] uppercase font-bold tracking-wider ${isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="px-5 py-3 text-left">Fecha</th>
                                        <th className="px-5 py-3 text-left">Tipo</th>
                                        <th className="px-5 py-3 text-left">Descripción</th>
                                        <th className="px-5 py-3 text-right">Monto</th>
                                        <th className="px-5 py-3 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                    {filteredMoves.map(m => (
                                        <tr key={m.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                                            <td className={`px-5 py-3 whitespace-nowrap text-xs ${muted}`}>{m.move_date}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="flex items-center gap-1.5">
                                                    {m.type === 'charge'
                                                        ? <TrendingUp size={13} style={{ color: TYPE_COLORS[m.type] }} />
                                                        : <TrendingDown size={13} style={{ color: TYPE_COLORS[m.type] ?? B.teal }} />
                                                    }
                                                    <span className="text-[12px] font-semibold" style={{ color: TYPE_COLORS[m.type] ?? B.teal }}>
                                                        {TYPE_LABELS[m.type] ?? m.type}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-[12.5px] ${text}`}>
                                                <div>{m.description || '—'}</div>
                                                {m.payment_method && <div className={`text-[11px] ${muted}`}>{m.payment_method}</div>}
                                                {m.reference_type === 'sale' && m.reference_id && (
                                                    <Link href={route('sales.show', m.reference_id)}
                                                        className="text-[11px]" style={{ color: B.teal }}>
                                                        Ver venta →
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap">
                                                <span className="font-bold text-[13px]" style={{ color: TYPE_COLORS[m.type] ?? B.teal }}>
                                                    {(m.signed_amount ?? m.amount) < 0 ? '−' : '+'} ${fmt(Math.abs(m.signed_amount ?? m.amount))}
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-right whitespace-nowrap text-[13px] font-semibold ${text}`}>
                                                ${fmt(m.balance_after)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
