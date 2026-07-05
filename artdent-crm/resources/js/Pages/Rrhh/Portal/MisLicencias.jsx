import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plane, Plus, X, Check, Ban } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import Pagination from '@/Components/Pagination';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const STATUS_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada', cancelled: 'Cancelada' };
const STATUS_COLOR = {
    pending: 'bg-amber-500/10 text-amber-500',
    approved: 'bg-emerald-500/10 text-emerald-500',
    rejected: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-slate-500/10 text-slate-400',
};

function Modal({ title, onClose, children }) {
    const { isDark } = useTheme();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
                    <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function MisLicencias({ auth, leaveTypes, balances, requests, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = requests?.data || [];
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({ leave_type_id: '', start_date: '', end_date: '', notes: '' });
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('portal.licencias.store'), { onSuccess: () => { setShowCreate(false); createForm.reset(); } });
    };

    const cancelRequest = (id) => confirmDialog('¿Cancelar esta solicitud?', () => router.delete(route('portal.licencias.cancel', id), { preserveScroll: true }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Licencias" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Plane size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Mis Licencias</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saldos y solicitudes de licencia</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="text-white border-none shadow-md rounded-xl" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Plus className="mr-2" size={16} /> Solicitar Licencia
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {balances.filter(b => b.accrued_days > 0).map(b => (
                        <div key={b.leave_type_id} className={`${card} p-4`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{b.leave_type_name}</p>
                            <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{b.remaining_days}</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>de {b.accrued_days} días disponibles</p>
                        </div>
                    ))}
                </div>

                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mis Solicitudes</h2>
                    </div>
                    {data.length === 0 ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no solicitaste ninguna licencia.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Tipo', 'Desde', 'Hasta', 'Días', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map(item => (
                                        <tr key={item.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.leave_type?.name}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(item.start_date)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(item.end_date)}</td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.days_count}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.status === 'pending' && (
                                                    <button onClick={() => cancelRequest(item.id)} title="Cancelar" className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                        <Ban size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Pagination data={requests} />
            </div>

            {showCreate && (
                <Modal title="Solicitar Licencia" onClose={() => setShowCreate(false)}>
                    <form onSubmit={submitCreate} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Tipo de Licencia *</label>
                            <SearchableSelect
                                value={createForm.data.leave_type_id}
                                onChange={v => createForm.setData('leave_type_id', v)}
                                options={leaveTypes.map(t => ({ value: String(t.id), label: t.name }))}
                                placeholder="Seleccionar..."
                                error={createForm.errors.leave_type_id}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Desde *</label>
                                <input type="date" className={inputClass} value={createForm.data.start_date} onChange={e => createForm.setData('start_date', e.target.value)} />
                                {createForm.errors.start_date && <p className="text-red-500 text-xs mt-1">{createForm.errors.start_date}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Hasta *</label>
                                <input type="date" className={inputClass} value={createForm.data.end_date} onChange={e => createForm.setData('end_date', e.target.value)} />
                                {createForm.errors.end_date && <p className="text-red-500 text-xs mt-1">{createForm.errors.end_date}</p>}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Notas</label>
                            <textarea className={inputClass} rows={2} value={createForm.data.notes} onChange={e => createForm.setData('notes', e.target.value)} placeholder="Motivo u observaciones..." />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowCreate(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" disabled={createForm.processing} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" /> Solicitar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
