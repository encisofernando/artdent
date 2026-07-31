import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Calculator, RotateCcw } from 'lucide-react';
import { computeInstallment, BANK_LABELS, CARD_BRAND_LABELS, CARD_TYPE_LABELS } from '@/lib/naveInstallments';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

const EMPTY_FORM = { amount: '', cardType: '', bank: '', cardBrand: '', rateKey: '' };

export default function Index({ auth, rates }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';
    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 10,
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [result, setResult] = useState(null);

    // ── Opciones en cascada, cada paso filtra por lo elegido antes ──────
    const cardTypes = useMemo(() => [...new Set(rates.map(r => r.card_type))], [rates]);

    const banks = useMemo(() => {
        if (!form.cardType) return [];
        return [...new Set(rates.filter(r => r.card_type === form.cardType).map(r => r.bank))];
    }, [rates, form.cardType]);

    const cardBrands = useMemo(() => {
        if (!form.bank) return [];
        return [...new Set(
            rates.filter(r => r.card_type === form.cardType && r.bank === form.bank).map(r => r.card_brand)
        )];
    }, [rates, form.cardType, form.bank]);

    const installmentOptions = useMemo(() => {
        if (!form.cardBrand) return [];
        return rates
            .filter(r => r.card_type === form.cardType && r.bank === form.bank && r.card_brand === form.cardBrand)
            .sort((a, b) => a.installments - b.installments || a.rate_pct - b.rate_pct)
            .map(r => ({
                key: `${r.installments}-${r.rate_pct}`,
                label: `${r.installments} cuota${r.installments > 1 ? 's' : ''}${r.tier_label ? ` — ${r.tier_label}` : ''}`,
                rate: r,
            }));
    }, [rates, form.cardType, form.bank, form.cardBrand]);

    const canSimulate = form.amount && Number(form.amount) > 0 && form.rateKey;

    // ── Handlers: cambiar un select "reinicia" los pasos siguientes ────
    const setCardType = (v) => { setForm({ ...EMPTY_FORM, amount: form.amount, cardType: v }); setResult(null); };
    const setBank = (v) => { setForm(f => ({ ...f, bank: v, cardBrand: '', rateKey: '' })); setResult(null); };
    const setCardBrand = (v) => { setForm(f => ({ ...f, cardBrand: v, rateKey: '' })); setResult(null); };
    const setRateKey = (v) => { setForm(f => ({ ...f, rateKey: v })); setResult(null); };

    const handleSimulate = () => {
        const selected = installmentOptions.find(o => o.key === form.rateKey);
        if (!selected) return;
        setResult({
            ...computeInstallment(Number(form.amount), selected.rate.rate_pct, selected.rate.installments),
            installments: selected.rate.installments,
            tierLabel: selected.rate.tier_label,
        });
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setResult(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Simulador de Cuotas" />

            <div className="flex flex-col gap-6 max-w-4xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Calculator size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Simulador de Cuotas</h1>
                        <p className={`text-sm ${muted}`}>Cotizá cuánto paga el cliente en cuotas con Nave.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
                    {/* Formulario */}
                    <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${card}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-bold ${text}`}>Simulador de cuotas</h3>
                            <button onClick={handleReset} title="Reiniciar"
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MONTO A COBRAR</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${muted}`}>$</span>
                                    <input type="number" value={form.amount}
                                        onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setResult(null); }}
                                        placeholder="Ingresar monto" className="outline-none" style={{ ...inputStyle, paddingLeft: 24 }} />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MEDIO DE PAGO</label>
                                <select value={form.cardType} onChange={e => setCardType(e.target.value)} style={inputStyle}>
                                    <option value="">Seleccioná uno</option>
                                    {cardTypes.map(t => <option key={t} value={t}>{CARD_TYPE_LABELS[t] ?? t}</option>)}
                                </select>
                            </div>

                            {form.cardType && (
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>BANCO</label>
                                    <select value={form.bank} onChange={e => setBank(e.target.value)} style={inputStyle}>
                                        <option value="">Seleccioná uno</option>
                                        {banks.map(b => <option key={b} value={b}>{BANK_LABELS[b] ?? b}</option>)}
                                    </select>
                                </div>
                            )}

                            {form.bank && (
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>MARCA DE TARJETA</label>
                                    <select value={form.cardBrand} onChange={e => setCardBrand(e.target.value)} style={inputStyle}>
                                        <option value="">Seleccioná uno</option>
                                        {cardBrands.map(c => <option key={c} value={c}>{CARD_BRAND_LABELS[c] ?? c}</option>)}
                                    </select>
                                </div>
                            )}

                            {form.cardBrand && (
                                <div>
                                    <label className={`block text-[10.5px] font-bold tracking-widest mb-1 ${muted}`}>EN</label>
                                    <select value={form.rateKey} onChange={e => setRateKey(e.target.value)} style={inputStyle}>
                                        <option value="">Seleccionar cuotas</option>
                                        {installmentOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <button onClick={handleSimulate} disabled={!canSimulate}
                            className="px-5 py-2.5 rounded-lg text-[12.5px] font-bold text-white transition-opacity disabled:opacity-40"
                            style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})` }}>
                            Simular
                        </button>
                    </div>

                    {/* Resultado */}
                    <div className={`rounded-2xl border p-5 shadow-sm flex items-center justify-center text-center ${card}`}>
                        {result ? (
                            <div className="space-y-2">
                                <p className={`text-xs font-bold uppercase tracking-widest ${muted}`}>
                                    {result.installments} cuota{result.installments > 1 ? 's' : ''}
                                    {result.tierLabel && ` — ${result.tierLabel}`}
                                </p>
                                <p className={`text-3xl font-extrabold ${text}`}>${fmt(result.cuota)}</p>
                                <p className={`text-xs ${muted}`}>por cuota</p>
                                <p className={`text-sm mt-3 ${muted}`}>Total financiado (PTF): <strong className={text}>${fmt(result.ptf)}</strong></p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Calculator size={28} className={`mx-auto ${muted}`} />
                                <p className={`text-sm font-bold ${text}`}>Acá aparecerá el detalle</p>
                                <p className={`text-xs ${muted}`}>Cuando hagas una simulación.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
