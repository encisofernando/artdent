import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { BookLock, AlertTriangle, Eye, X } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';
import Pagination from '@/Components/Pagination';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

function PayloadModal({ payload, onClose }) {
    const { isDark } = useTheme();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl border p-6 flex flex-col ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Payload de Referencia (no enviado)</h2>
                    <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <X size={16} />
                    </button>
                </div>
                <pre className={`overflow-auto text-xs p-4 rounded-xl flex-1 ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                    {JSON.stringify(payload, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default function Index({ auth, submissions, payrollRuns }) {
    const { isDark } = useTheme();
    const data = submissions?.data || [];
    const [viewPayload, setViewPayload] = useState(null);
    const form = useForm({ payroll_run_id: '' });
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const submit = (e) => {
        e.preventDefault();
        form.post(route('payroll-book-submissions.store'), { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Libro de Sueldos Digital" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <BookLock size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Libro de Sueldos Digital</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Integración con AFIP/ARCA (SICOSS) — en preparación</p>
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 flex gap-3 ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                        <p className="font-bold mb-1">Esta función todavía NO envía nada a AFIP/ARCA.</p>
                        <p>
                            Es un placeholder de arquitectura: solo arma localmente un payload de referencia con los datos de una liquidación,
                            para dejar la estructura lista. Antes de habilitar un envío real hace falta confirmar con vos/tu contador el endpoint
                            exacto, el esquema de datos vigente y el período de obligatoriedad — igual que se hizo con la integración AFIP de facturación ya existente.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className={`${card} p-5 flex flex-col sm:flex-row items-end gap-3`}>
                    <div className="flex-1 w-full">
                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Liquidación</label>
                        <SearchableSelect
                            value={form.data.payroll_run_id}
                            onChange={v => form.setData('payroll_run_id', v)}
                            options={payrollRuns.map(r => ({ value: String(r.id), label: `${fmtDate(r.period_from)} – ${fmtDate(r.period_to)} (${r.type})` }))}
                            placeholder="Seleccionar liquidación..."
                            error={form.errors.payroll_run_id}
                        />
                    </div>
                    <Button type="submit" disabled={form.processing} className="text-white border-none shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        Generar Payload de Referencia
                    </Button>
                </form>

                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Historial</h2>
                    </div>
                    {data.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin registros todavía.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Período', 'Estado', 'Creado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map(s => (
                                        <tr key={s.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.period}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-400">No implementado</span>
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(s.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => setViewPayload(s.request_payload)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Pagination data={submissions} />
            </div>

            {viewPayload && <PayloadModal payload={viewPayload} onClose={() => setViewPayload(null)} />}
        </AuthenticatedLayout>
    );
}
