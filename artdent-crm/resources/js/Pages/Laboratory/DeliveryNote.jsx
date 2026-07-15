import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import axios from 'axios';
import { FileText, Printer, AlertCircle } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmtDate = (d) => {
    if (!d) return '—';
    const [y, m, day] = String(d).split('T')[0].split('-');
    return `${day}/${m}/${y}`;
};

export default function DeliveryNote({ dentists, selectedDentistId, jobs }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const [dentistId, setDentistId] = useState(selectedDentistId ?? '');
    const [selected, setSelected] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const changeDentist = (value) => {
        setDentistId(value);
        setSelected([]);
        router.get(route('remitos.create'), value ? { dentist_id: value } : {}, { preserveState: true });
    };

    const toggleJob = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        setSelected(selected.length === jobs.length ? [] : jobs.map((j) => j.id));
    };

    const generate = () => {
        if (selected.length === 0) return;
        confirmDialog(`¿Generar el remito y marcar ${selected.length} orden(es) como entregadas? No se puede deshacer.`, () => {
            setProcessing(true);
            setError(null);
            axios.post(route('remitos.store'), { dentist_id: dentistId, job_ids: selected })
                .then((res) => {
                    window.open(res.data.pdf_url, '_blank');
                    router.reload({ only: ['jobs'] });
                    setSelected([]);
                })
                .catch((e) => setError(e.response?.data?.message ?? 'No se pudo generar el remito.'))
                .finally(() => setProcessing(false));
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Remitos de Entrega" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <FileText size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Remitos de Entrega</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generá el comprobante que acompaña la entrega de trabajos a un odontólogo</p>
                    </div>
                </div>

                <div className={`${card} p-5`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Odontólogo</label>
                    <select value={dentistId} onChange={(e) => changeDentist(e.target.value)} className={inputCls}>
                        <option value="">Seleccioná un odontólogo...</option>
                        {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                {error && (
                    <div className={`${card} p-4 flex items-center gap-2 border-red-500/40`}>
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{error}</p>
                    </div>
                )}

                {dentistId && (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Órdenes listas para entregar ({jobs.length})</h2>
                            <button onClick={generate} disabled={selected.length === 0 || processing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Printer size={14} /> {processing ? 'Generando...' : `Generar remito (${selected.length})`}
                            </button>
                        </div>
                        {jobs.length === 0 ? (
                            <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Este odontólogo no tiene órdenes en estado "Listo" para entregar.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                            <th className="px-4 py-3">
                                                <input type="checkbox" checked={selected.length === jobs.length} onChange={toggleAll} className="rounded accent-teal-500" />
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>N° Orden</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Paciente</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Descripción</th>
                                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Entrega</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {jobs.map((job) => (
                                            <tr key={job.id} className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`} onClick={() => toggleJob(job.id)}>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <input type="checkbox" checked={selected.includes(job.id)} onChange={() => toggleJob(job.id)} className="rounded accent-teal-500" />
                                                </td>
                                                <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{job.job_number}</td>
                                                <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.patient?.name ?? '—'}</td>
                                                <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.description ?? '—'}</td>
                                                <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(job.due_date)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
