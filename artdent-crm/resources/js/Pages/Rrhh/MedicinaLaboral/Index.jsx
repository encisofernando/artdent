import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { HeartPulse, Plus, X, Check, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const EXAM_TYPE_LABEL = { preocupacional: 'Preocupacional', periodico: 'Periódico', egreso: 'Egreso' };
const ACCIDENT_STATUS_LABEL = { reported: 'Denunciado', in_treatment: 'En tratamiento', closed: 'Cerrado' };
const ACCIDENT_STATUS_COLOR = {
    reported: 'bg-amber-500/10 text-amber-500',
    in_treatment: 'bg-blue-500/10 text-blue-500',
    closed: 'bg-emerald-500/10 text-emerald-500',
};

function Modal({ title, onClose, children }) {
    const { isDark } = useTheme();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
                    <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Index({ auth, employees, artProviders, medicalExams, expiringExams, expiredExams, artAccidents }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canManage = hasPermission('rrhh.medical.manage');

    const [showArtProvider, setShowArtProvider] = useState(false);
    const [showExam, setShowExam] = useState(false);
    const [showAccident, setShowAccident] = useState(false);

    const artForm = useForm({ name: '', cuit: '', policy_number: '' });
    const examForm = useForm({ employee_id: '', type: 'periodico', exam_date: '', result: '', restrictions: '', expires_at: '' });
    const accidentForm = useForm({ employee_id: '', occurred_at: '', description: '', art_case_number: '', status: 'reported', days_lost: '' });

    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const submitArt = (e) => {
        e.preventDefault();
        artForm.post(route('art-providers.store'), { onSuccess: () => { setShowArtProvider(false); artForm.reset(); } });
    };
    const submitExam = (e) => {
        e.preventDefault();
        examForm.post(route('medical-exams.store'), { onSuccess: () => { setShowExam(false); examForm.reset(); } });
    };
    const submitAccident = (e) => {
        e.preventDefault();
        accidentForm.post(route('art-accidents.store'), { onSuccess: () => { setShowAccident(false); accidentForm.reset(); } });
    };

    const deleteArt = (id) => confirmDialog('¿Eliminar esta ART?', () => router.delete(route('art-providers.destroy', id), { preserveScroll: true }));
    const deleteExam = (id) => confirmDialog('¿Eliminar este examen médico?', () => router.delete(route('medical-exams.destroy', id), { preserveScroll: true }));
    const deleteAccident = (id) => confirmDialog('¿Eliminar este registro?', () => router.delete(route('art-accidents.destroy', id), { preserveScroll: true }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Medicina Laboral" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <HeartPulse size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Medicina Laboral</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ART, exámenes médicos y siniestros del personal</p>
                    </div>
                </div>

                {/* Alertas de vencimiento */}
                {(expiredExams?.length > 0 || expiringExams?.length > 0) && (
                    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <h2 className={`font-bold text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Vencimientos de Exámenes Médicos</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            {expiredExams.map(e => (
                                <div key={e.id} className="flex items-center justify-between text-sm">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{e.employee?.user?.name} — {EXAM_TYPE_LABEL[e.type]}</span>
                                    <span className="text-red-500 font-bold text-xs">Vencido el {fmtDate(e.expires_at)}</span>
                                </div>
                            ))}
                            {expiringExams.map(e => (
                                <div key={e.id} className="flex items-center justify-between text-sm">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{e.employee?.user?.name} — {EXAM_TYPE_LABEL[e.type]}</span>
                                    <span className="text-amber-500 font-bold text-xs">Vence el {fmtDate(e.expires_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ART Providers */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>ART (Aseguradoras de Riesgos del Trabajo)</h2>
                        {canManage && (
                            <Button onClick={() => setShowArtProvider(true)} size="sm" className="text-white border-none" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={14} className="mr-1" /> Nueva ART
                            </Button>
                        )}
                    </div>
                    {(!artProviders || artProviders.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin ART registradas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Nombre', 'CUIT', 'N° Póliza', 'Empleados', ''].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {artProviders.map(a => (
                                        <tr key={a.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{a.name}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.cuit || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.policy_number || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.employees_count}</td>
                                            <td className="px-4 py-2.5">
                                                {canManage && (
                                                    <button onClick={() => deleteArt(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                        <Trash2 size={13} />
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

                {/* Exámenes médicos */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Exámenes Médicos</h2>
                        {canManage && (
                            <Button onClick={() => setShowExam(true)} size="sm" className="text-white border-none" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={14} className="mr-1" /> Nuevo Examen
                            </Button>
                        )}
                    </div>
                    {(!medicalExams || medicalExams.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin exámenes registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Empleado', 'Tipo', 'Fecha', 'Resultado', 'Vence', ''].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {medicalExams.map(e => (
                                        <tr key={e.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{e.employee?.user?.name || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{EXAM_TYPE_LABEL[e.type]}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(e.exam_date)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{e.result || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(e.expires_at)}</td>
                                            <td className="px-4 py-2.5">
                                                {canManage && (
                                                    <button onClick={() => deleteExam(e.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                        <Trash2 size={13} />
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

                {/* Accidentes / Siniestros ART */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <ShieldAlert size={16} /> Accidentes y Siniestros ART
                        </h2>
                        {canManage && (
                            <Button onClick={() => setShowAccident(true)} size="sm" className="text-white border-none" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={14} className="mr-1" /> Nuevo Registro
                            </Button>
                        )}
                    </div>
                    {(!artAccidents || artAccidents.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin accidentes registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Empleado', 'Fecha', 'Descripción', 'N° Siniestro', 'Días Perdidos', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {artAccidents.map(a => (
                                        <tr key={a.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{a.employee?.user?.name || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(a.occurred_at).toLocaleDateString('es-AR')}</td>
                                            <td className={`px-4 py-2.5 max-w-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.description}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.art_case_number || '—'}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a.days_lost}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ACCIDENT_STATUS_COLOR[a.status]}`}>{ACCIDENT_STATUS_LABEL[a.status]}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {canManage && (
                                                    <button onClick={() => deleteAccident(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                        <Trash2 size={13} />
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
            </div>

            {showArtProvider && (
                <Modal title="Nueva ART" onClose={() => setShowArtProvider(false)}>
                    <form onSubmit={submitArt} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Nombre *</label>
                            <input className={inputClass} value={artForm.data.name} onChange={e => artForm.setData('name', e.target.value)} placeholder="Ej. Galeno ART" />
                            {artForm.errors.name && <p className="text-red-500 text-xs mt-1">{artForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>CUIT</label>
                            <input className={inputClass} value={artForm.data.cuit} onChange={e => artForm.setData('cuit', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>N° de Póliza</label>
                            <input className={inputClass} value={artForm.data.policy_number} onChange={e => artForm.setData('policy_number', e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowArtProvider(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" disabled={artForm.processing} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" /> Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showExam && (
                <Modal title="Nuevo Examen Médico" onClose={() => setShowExam(false)}>
                    <form onSubmit={submitExam} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Empleado *</label>
                            <SearchableSelect
                                value={examForm.data.employee_id}
                                onChange={v => examForm.setData('employee_id', v)}
                                options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))}
                                placeholder="Seleccionar..."
                                error={examForm.errors.employee_id}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Tipo *</label>
                            <select className={inputClass} value={examForm.data.type} onChange={e => examForm.setData('type', e.target.value)}>
                                {Object.entries(EXAM_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Fecha *</label>
                                <input type="date" className={inputClass} value={examForm.data.exam_date} onChange={e => examForm.setData('exam_date', e.target.value)} />
                                {examForm.errors.exam_date && <p className="text-red-500 text-xs mt-1">{examForm.errors.exam_date}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Vence</label>
                                <input type="date" className={inputClass} value={examForm.data.expires_at} onChange={e => examForm.setData('expires_at', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Resultado</label>
                            <input className={inputClass} value={examForm.data.result} onChange={e => examForm.setData('result', e.target.value)} placeholder="Ej. Apto" />
                        </div>
                        <div>
                            <label className={labelClass}>Restricciones / Observaciones</label>
                            <textarea className={inputClass} rows={2} value={examForm.data.restrictions} onChange={e => examForm.setData('restrictions', e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowExam(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" disabled={examForm.processing} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" /> Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showAccident && (
                <Modal title="Nuevo Accidente / Siniestro" onClose={() => setShowAccident(false)}>
                    <form onSubmit={submitAccident} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Empleado *</label>
                            <SearchableSelect
                                value={accidentForm.data.employee_id}
                                onChange={v => accidentForm.setData('employee_id', v)}
                                options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))}
                                placeholder="Seleccionar..."
                                error={accidentForm.errors.employee_id}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Fecha y hora *</label>
                            <input type="datetime-local" className={inputClass} value={accidentForm.data.occurred_at} onChange={e => accidentForm.setData('occurred_at', e.target.value)} />
                            {accidentForm.errors.occurred_at && <p className="text-red-500 text-xs mt-1">{accidentForm.errors.occurred_at}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Descripción *</label>
                            <textarea className={inputClass} rows={2} value={accidentForm.data.description} onChange={e => accidentForm.setData('description', e.target.value)} />
                            {accidentForm.errors.description && <p className="text-red-500 text-xs mt-1">{accidentForm.errors.description}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>N° Siniestro</label>
                                <input className={inputClass} value={accidentForm.data.art_case_number} onChange={e => accidentForm.setData('art_case_number', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Días Perdidos</label>
                                <input type="number" min="0" className={inputClass} value={accidentForm.data.days_lost} onChange={e => accidentForm.setData('days_lost', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Estado</label>
                            <select className={inputClass} value={accidentForm.data.status} onChange={e => accidentForm.setData('status', e.target.value)}>
                                {Object.entries(ACCIDENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowAccident(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" disabled={accidentForm.processing} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" /> Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
