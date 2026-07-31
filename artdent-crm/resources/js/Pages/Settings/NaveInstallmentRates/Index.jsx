import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Percent, Plus, Trash2, Save } from 'lucide-react';
import { BANK_LABELS, CARD_TYPE_LABELS } from '@/lib/naveInstallments';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#E63946', amber: '#F59E0B' };
const BANKS = ['galicia', 'naranja', 'otros_bancos'];
const CARD_TYPES = ['credit', 'debit'];

export default function Index({ auth, rates: initialRates }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const text = isDark ? 'text-slate-100' : 'text-slate-900';
    const inputStyle = {
        width: '100%', padding: '8px 10px', borderRadius: 8,
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    const [rows, setRows] = useState(() => initialRates.map((r, i) => ({ ...r, _key: i })));
    const [saving, setSaving] = useState(false);

    const updateRow = (key, field, value) => {
        setRows(prev => prev.map(r => (r._key === key ? { ...r, [field]: value } : r)));
    };
    const addRow = () => {
        setRows(prev => [...prev, {
            _key: `new-${Date.now()}`, bank: 'otros_bancos', card_brand: 'visa', card_type: 'credit',
            installments: 3, rate_pct: 0, tier_label: '', is_active: true,
        }]);
    };
    const removeRow = (key) => setRows(prev => prev.filter(r => r._key !== key));

    const handleSave = () => {
        setSaving(true);
        router.post(route('nave-installment-rates.store'), {
            rates: rows.map(({ _key, ...r }) => ({ ...r, tier_label: r.tier_label || null })),
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tasas de Cuotas (Nave)" />

            <div className="flex flex-col gap-6 max-w-5xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Percent size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Tasas de Cuotas (Nave)</h1>
                        <p className={`text-sm ${muted}`}>
                            Tabla de intereses a cargo del cliente que usa el Simulador de Cuotas (Ventas) y el widget de
                            cuotas en la tienda online.
                        </p>
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${card}`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold ${text}`}>Tasas cargadas</h3>
                        <button onClick={addRow}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <Plus size={13} /> Agregar fila
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className={`uppercase font-bold tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <tr>
                                    <th className="text-left py-1.5 pr-2">Banco</th>
                                    <th className="text-left py-1.5 pr-2">Marca</th>
                                    <th className="text-left py-1.5 pr-2">Tipo</th>
                                    <th className="text-left py-1.5 pr-2">Cuotas</th>
                                    <th className="text-left py-1.5 pr-2">Tasa %</th>
                                    <th className="text-left py-1.5 pr-2">Etiqueta</th>
                                    <th className="text-center py-1.5 pr-2">Activa</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr key={r._key} className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <td className="py-1 pr-2">
                                            <select value={r.bank} onChange={e => updateRow(r._key, 'bank', e.target.value)} style={inputStyle}>
                                                {BANKS.map(b => <option key={b} value={b}>{BANK_LABELS[b]}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-1 pr-2">
                                            <input value={r.card_brand} onChange={e => updateRow(r._key, 'card_brand', e.target.value)} style={{ ...inputStyle, width: 110 }} />
                                        </td>
                                        <td className="py-1 pr-2">
                                            <select value={r.card_type} onChange={e => updateRow(r._key, 'card_type', e.target.value)} style={inputStyle}>
                                                {CARD_TYPES.map(t => <option key={t} value={t}>{CARD_TYPE_LABELS[t] ?? t}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-1 pr-2">
                                            <input type="number" min="1" value={r.installments} onChange={e => updateRow(r._key, 'installments', e.target.value)} style={{ ...inputStyle, width: 64 }} />
                                        </td>
                                        <td className="py-1 pr-2">
                                            <input type="number" step="0.01" min="0" value={r.rate_pct} onChange={e => updateRow(r._key, 'rate_pct', e.target.value)} style={{ ...inputStyle, width: 80 }} />
                                        </td>
                                        <td className="py-1 pr-2">
                                            <input value={r.tier_label ?? ''} onChange={e => updateRow(r._key, 'tier_label', e.target.value)} placeholder="Opcional" style={{ ...inputStyle, width: 110 }} />
                                        </td>
                                        <td className="py-1 pr-2 text-center">
                                            <input type="checkbox" checked={!!r.is_active} onChange={e => updateRow(r._key, 'is_active', e.target.checked)} />
                                        </td>
                                        <td className="py-1">
                                            <button onClick={() => removeRow(r._key)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-bold text-white transition-opacity"
                            style={{ background: `linear-gradient(135deg, ${B.teal}, ${B.blue})`, opacity: saving ? 0.6 : 1 }}>
                            <Save size={14} />
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
