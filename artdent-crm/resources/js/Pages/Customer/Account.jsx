import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, CreditCard, TrendingDown, TrendingUp, Plus, Check } from 'lucide-react';
import axios from 'axios';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#E63946' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const TYPE_LABELS = {
    charge: 'Cargo',
    payment: 'Pago',
    adjustment: 'Ajuste',
};

const TYPE_COLORS = {
    charge: B.red,
    payment: B.green,
    adjustment: B.teal,
};

export default function Account({ auth, customer, account, moves, paymentMethods }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';

    const [balance, setBalance]     = useState(account.balance);
    const [moveList, setMoveList]   = useState(moves);
    const [formOpen, setFormOpen]   = useState(false);
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const [form, setForm]           = useState({
        amount: '',
        payment_method_id: '',
        description: '',
        move_date: new Date().toISOString().slice(0, 10),
    });

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 10,
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    const handleSubmit = async () => {
        if (!form.amount || Number(form.amount) <= 0) {
            setError('Ingresá un monto válido.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await axios.post(
                route('customers.account.payments', customer.id),
                form,
                { headers: { Accept: 'application/json' } }
            );
            setBalance(res.data.balance);
            setMoveList(prev => [res.data.move, ...prev]);
            setSuccess('Pago registrado correctamente.');
            setForm({ amount: '', payment_method_id: '', description: '', move_date: new Date().toISOString().slice(0, 10) });
            setFormOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || 'Error al registrar pago.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Cuenta Corriente — ${customer.name}`} />

            <div className="flex flex-col gap-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('customers.index')}>
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

                {/* Balance card */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}
                    style={{ borderColor: balance > 0 ? `${B.red}40` : `${B.green}40` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: balance > 0 ? `${B.red}18` : `${B.green}18` }}>
                                <CreditCard size={20} style={{ color: balance > 0 ? B.red : B.green }} />
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Saldo pendiente</p>
                                <p className={`text-3xl font-extrabold mt-0.5`}
                                    style={{ color: balance > 0 ? B.red : B.green }}>
                                    ${fmt(Math.abs(balance))}
                                </p>
                                <p className={`text-xs mt-0.5 ${muted}`}>
                                    {balance > 0 ? 'El cliente tiene deuda' : balance < 0 ? 'El cliente tiene saldo a favor' : 'Sin saldo pendiente'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setFormOpen(o => !o); setError(''); setSuccess(''); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})` }}
                        >
                            <Plus size={15} />
                            Registrar pago
                        </button>
                    </div>

                    {/* Inline payment form */}
                    {formOpen && (
                        <div className={`mt-5 pt-5 border-t space-y-3`}
                            style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MONTO *</label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${muted}`}>$</span>
                                        <input
                                            type="number"
                                            value={form.amount}
                                            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                            placeholder="0,00"
                                            className="outline-none"
                                            style={{ ...inputStyle, paddingLeft: 24 }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MÉTODO DE PAGO</label>
                                    <select
                                        value={form.payment_method_id}
                                        onChange={e => setForm(p => ({ ...p, payment_method_id: e.target.value }))}
                                        className="outline-none"
                                        style={inputStyle}
                                    >
                                        <option value="">— Seleccionar —</option>
                                        {paymentMethods.map(pm => (
                                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>FECHA</label>
                                    <input
                                        type="date"
                                        value={form.move_date}
                                        onChange={e => setForm(p => ({ ...p, move_date: e.target.value }))}
                                        className="outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>DESCRIPCIÓN</label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Opcional"
                                        className="outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-[12px] text-red-400">{error}</p>}

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setFormOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold ${muted}`}>
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="px-5 py-2 rounded-lg text-[12.5px] font-bold text-white transition-opacity"
                                    style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})`, opacity: saving ? 0.6 : 1 }}>
                                    {saving ? 'Guardando...' : 'Guardar pago'}
                                </button>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 mt-3 text-emerald-500 text-[12.5px] font-semibold">
                            <Check size={14} />
                            {success}
                        </div>
                    )}
                </div>

                {/* Movements table */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest ${muted}`}>
                            Movimientos
                        </h2>
                    </div>

                    {moveList.length === 0 ? (
                        <div className={`px-6 py-10 text-center text-sm ${muted}`}>
                            Sin movimientos registrados.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                    {moveList.map(m => (
                                        <tr key={m.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                                            <td className={`px-5 py-3 whitespace-nowrap text-xs ${muted}`}>{m.move_date}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="flex items-center gap-1.5">
                                                    {m.type === 'charge'
                                                        ? <TrendingUp size={13} style={{ color: TYPE_COLORS[m.type] }} />
                                                        : <TrendingDown size={13} style={{ color: TYPE_COLORS[m.type] }} />
                                                    }
                                                    <span className="text-[12px] font-semibold" style={{ color: TYPE_COLORS[m.type] }}>
                                                        {TYPE_LABELS[m.type] ?? m.type}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-[12.5px] ${text}`}>
                                                <div>{m.description || '—'}</div>
                                                {m.payment_method && (
                                                    <div className={`text-[11px] ${muted}`}>{m.payment_method}</div>
                                                )}
                                                {m.reference_type === 'sale' && m.reference_id && (
                                                    <Link href={route('sales.show', m.reference_id)}
                                                        className="text-[11px]" style={{ color: B.teal }}>
                                                        Ver venta →
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap">
                                                <span className="font-bold text-[13px]" style={{ color: TYPE_COLORS[m.type] }}>
                                                    {m.type === 'payment' ? '−' : '+'} ${fmt(m.amount)}
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
