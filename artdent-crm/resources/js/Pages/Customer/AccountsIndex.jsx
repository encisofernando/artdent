import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { DatePicker } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';
import {
    CreditCard, Search, TrendingUp, TrendingDown, Users,
    ChevronRight, Plus, Check, X, AlertCircle, BadgeCheck, Wallet,
} from 'lucide-react';
import axios from 'axios';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#E63946' };
const G = { primary: `linear-gradient(135deg, ${B.blue}, ${B.teal})`, success: `linear-gradient(135deg, ${B.green}, ${B.teal})` };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

function KpiCard({ label, value, sub, color, icon: Icon, isDark }) {
    return (
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={22} style={{ color }} />
            </div>
            <div className="min-w-0">
                <p className={`text-[10.5px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                <p className="text-xl font-extrabold mt-0.5" style={{ color }}>{value}</p>
                {sub && <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
            </div>
        </div>
    );
}

export default function AccountsIndex({ auth, customers, filters, kpis, paymentMethods }) {
    const { isDark } = useTheme();
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const inputCls = `w-full text-sm px-3 py-2 rounded-xl border outline-none font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`;

    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.filter || 'all');

    // Quick-pay modal
    const [payModal, setPayModal] = useState(null); // { customer }
    const [payForm, setPayForm] = useState({ amount: '', payment_method_id: '', description: '', move_date: new Date().toISOString().slice(0, 10) });
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState('');

    const applyFilters = (s = search, f = activeFilter) => {
        router.get(route('customers.accounts'), { search: s, filter: f }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        clearTimeout(window._acSearchTimer);
        window._acSearchTimer = setTimeout(() => applyFilters(e.target.value, activeFilter), 350);
    };

    const handleFilter = (f) => {
        setActiveFilter(f);
        applyFilters(search, f);
    };

    const openPay = (customer) => {
        setPayModal(customer);
        setPayForm({ amount: '', payment_method_id: '', description: '', move_date: new Date().toISOString().slice(0, 10) });
        setPayError('');
    };

    const handlePay = async () => {
        if (!payForm.amount || Number(payForm.amount) <= 0) { setPayError('Ingresá un monto válido.'); return; }
        setPaying(true);
        setPayError('');
        try {
            await axios.post(
                route('customers.account.payments', payModal.id),
                { ...payForm, description: payForm.description || `Pago registrado desde cuentas corrientes` },
                { headers: { Accept: 'application/json' } }
            );
            setPayModal(null);
            router.reload({ only: ['customers', 'kpis'] });
        } catch (e) {
            setPayError(e.response?.data?.message || 'Error al registrar pago.');
        } finally {
            setPaying(false);
        }
    };

    const FILTERS = [
        { id: 'all',    label: 'Todos',         count: kpis.count_total },
        { id: 'debt',   label: 'Con deuda',      count: kpis.count_debt },
        { id: 'credit', label: 'Con crédito',    count: kpis.count_credit },
        { id: 'zero',   label: 'Sin movimientos',count: kpis.count_zero },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuentas Corrientes" />

            <div className="space-y-6 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${text}`}>Cuentas Corrientes</h1>
                        <p className={`text-sm mt-0.5 ${muted}`}>Estado financiero de clientes</p>
                    </div>
                    <Link href={route('customers.index')}
                        className={`text-sm font-semibold px-3 py-2 rounded-xl border transition-colors ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        Clientes
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <KpiCard label="Total a cobrar" value={`$${fmt(kpis.total_debt)}`}
                        sub={`${kpis.count_debt} cliente${kpis.count_debt !== 1 ? 's' : ''}`}
                        color={B.red} icon={TrendingUp} isDark={isDark} />
                    <KpiCard label="Saldo a favor" value={`$${fmt(kpis.total_credit)}`}
                        sub={`${kpis.count_credit} cliente${kpis.count_credit !== 1 ? 's' : ''}`}
                        color={B.green} icon={TrendingDown} isDark={isDark} />
                    <KpiCard label="Neto pendiente" value={`$${fmt(kpis.total_debt - kpis.total_credit)}`}
                        sub="Diferencia total"
                        color={B.blue} icon={Wallet} isDark={isDark} />
                    <KpiCard label="Clientes activos" value={kpis.count_total}
                        sub={`${kpis.count_zero} sin saldo`}
                        color={B.teal} icon={Users} isDark={isDark} />
                </div>

                {/* Filtros + Búsqueda */}
                <div className={`rounded-2xl border shadow-sm ${card}`}>
                    <div className={`flex flex-col gap-3 px-4 py-4 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        {/* Search */}
                        <div className="relative w-full">
                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearch}
                                placeholder="Buscar por nombre, DNI o teléfono..."
                                className={`${inputCls} pl-8`}
                            />
                        </div>

                        {/* Filter tabs */}
                        <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            {FILTERS.map(f => (
                                <button key={f.id} onClick={() => handleFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                                        ${activeFilter === f.id
                                            ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                                            : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f.label}
                                    <span className={`text-[10px] px-1 rounded-full ${activeFilter === f.id ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>
                                        {f.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile cards */}
                    {customers.length === 0 ? (
                        <div className={`py-16 text-center ${muted}`}>
                            <Users size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No se encontraron clientes</p>
                        </div>
                    ) : (<>
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {customers.map(c => {
                                const isDebt   = c.balance > 0;
                                const isCredit = c.balance < 0;
                                const balColor = isDebt ? B.red : isCredit ? B.green : (isDark ? '#64748b' : '#94a3b8');
                                return (
                                    <div key={c.id} className={`p-4 ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                                                    style={{ background: G.primary }}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link href={route('customers.account', c.id)}
                                                        className={`font-bold text-sm truncate block hover:underline ${text}`}>
                                                        {c.name}
                                                    </Link>
                                                    {c.dni && <p className={`text-[11px] ${muted}`}>DNI {c.dni}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base font-extrabold" style={{ color: balColor }}>
                                                    {isCredit ? '−' : ''}${fmt(Math.abs(c.balance))}
                                                </p>
                                                {isDebt ? (
                                                    <span className="text-[10px] font-bold" style={{ color: B.red }}>Deuda</span>
                                                ) : isCredit ? (
                                                    <span className="text-[10px] font-bold" style={{ color: B.green }}>A favor</span>
                                                ) : (
                                                    <span className={`text-[10px] font-bold ${muted}`}>Al día</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <button onClick={() => openPay(c)}
                                                className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg"
                                                style={{ background: `${B.teal}18`, color: B.teal }}>
                                                <Plus size={13} /> Pago
                                            </button>
                                            <Link href={route('customers.account', c.id)}
                                                className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                Ver <ChevronRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className={`text-[11px] uppercase font-bold tracking-wider ${isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="px-5 py-3 text-left">Cliente</th>
                                        <th className="px-5 py-3 text-left">Contacto</th>
                                        <th className="px-5 py-3 text-right">Saldo</th>
                                        <th className="px-5 py-3 text-right">Estado</th>
                                        <th className="px-5 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                                    {customers.map(c => {
                                        const isDebt   = c.balance > 0;
                                        const isCredit = c.balance < 0;
                                        const balColor = isDebt ? B.red : isCredit ? B.green : (isDark ? '#64748b' : '#94a3b8');

                                        return (
                                            <tr key={c.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                                                {/* Nombre */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                                                            style={{ background: G.primary }}>
                                                            {c.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link href={route('customers.account', c.id)}
                                                                className={`font-semibold hover:underline ${text}`}>
                                                                {c.name}
                                                            </Link>
                                                            {c.dni && <p className={`text-[11px] ${muted}`}>DNI {c.dni}</p>}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contacto */}
                                                <td className={`px-5 py-3.5 text-[12.5px] ${muted}`}>
                                                    {c.phone || c.email || '—'}
                                                </td>

                                                {/* Saldo */}
                                                <td className="px-5 py-3.5 text-right">
                                                    <span className="text-[15px] font-extrabold" style={{ color: balColor }}>
                                                        {isDebt ? '' : isCredit ? '−' : ''}${fmt(Math.abs(c.balance))}
                                                    </span>
                                                </td>

                                                {/* Estado badge */}
                                                <td className="px-5 py-3.5 text-right">
                                                    {isDebt ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${B.red}18`, color: B.red }}>
                                                            <AlertCircle size={10} /> Deuda
                                                        </span>
                                                    ) : isCredit ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${B.green}18`, color: B.green }}>
                                                            <BadgeCheck size={10} /> A favor
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                                                            Al día
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openPay(c)}
                                                            className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                                                            style={{ background: `${B.teal}18`, color: B.teal }}
                                                            title="Registrar pago"
                                                        >
                                                            <Plus size={12} /> Pago
                                                        </button>
                                                        <Link href={route('customers.account', c.id)}
                                                            className={`flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                            title="Ver detalle"
                                                        >
                                                            Ver <ChevronRight size={12} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>)}
                </div>
            </div>

            {/* Modal pago rápido */}
            {payModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div>
                                <p className={`font-extrabold text-[15px] ${text}`}>Registrar pago</p>
                                <p className={`text-xs mt-0.5 ${muted}`}>{payModal.name}</p>
                            </div>
                            <button onClick={() => setPayModal(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Saldo actual */}
                        <div className={`mx-5 mt-4 px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <p className={`text-[10.5px] font-bold uppercase tracking-wider ${muted}`}>Saldo actual</p>
                            <p className="text-lg font-extrabold mt-0.5" style={{ color: payModal.balance > 0 ? B.red : payModal.balance < 0 ? B.green : (isDark ? '#94a3b8' : '#64748b') }}>
                                {payModal.balance < 0 ? '−' : ''}${fmt(Math.abs(payModal.balance))}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="px-5 pt-4 pb-5 space-y-3">
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MONTO *</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${muted}`}>$</span>
                                    <input type="number" value={payForm.amount}
                                        onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="0,00" autoFocus
                                        className={`${inputCls} pl-7`} />
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>FECHA</label>
                                    <DatePicker value={payForm.move_date}
                                        onChange={v => setPayForm(p => ({ ...p, move_date: v }))}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>DESCRIPCIÓN</label>
                                    <input type="text" value={payForm.description}
                                        onChange={e => setPayForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Opcional"
                                        className={inputCls} />
                                </div>
                            </div>

                            {payError && <p className="text-red-400 text-xs font-semibold">{payError}</p>}

                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setPayModal(null)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    Cancelar
                                </button>
                                <button onClick={handlePay} disabled={paying}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                                    style={{ background: G.success }}>
                                    {paying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                                    {paying ? 'Guardando...' : 'Guardar pago'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
