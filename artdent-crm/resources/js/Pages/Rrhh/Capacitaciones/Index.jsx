import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { GraduationCap, Plus, X, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const ENROLLMENT_STATUS_LABEL = { enrolled: 'Inscripto', completed: 'Completado', failed: 'No aprobado', cancelled: 'Cancelado' };
const ENROLLMENT_STATUS_COLOR = {
    enrolled: 'bg-blue-500/10 text-blue-500',
    completed: 'bg-emerald-500/10 text-emerald-500',
    failed: 'bg-red-500/10 text-red-500',
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

function SessionRow({ session, employees, canManage, isDark, confirmDialog }) {
    const [expanded, setExpanded] = useState(false);
    const [showEnroll, setShowEnroll] = useState(false);
    const enrollForm = useForm({ training_session_id: session.id, employee_id: '' });

    const submitEnroll = (e) => {
        e.preventDefault();
        enrollForm.post(route('training-enrollments.store'), { onSuccess: () => { setShowEnroll(false); enrollForm.reset(); } });
    };

    const setEnrollmentStatus = (enrollment, status) => router.put(route('training-enrollments.update', enrollment.id), { status, score: enrollment.score }, { preserveScroll: true });
    const deleteEnrollment = (id) => confirmDialog('¿Eliminar esta inscripción?', () => router.delete(route('training-enrollments.destroy', id), { preserveScroll: true }));
    const deleteSession = () => confirmDialog('¿Eliminar esta sesión?', () => router.delete(route('training-sessions.destroy', session.id), { preserveScroll: true }));

    return (
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {fmtDate(session.start_date)}{session.end_date && ` – ${fmtDate(session.end_date)}`} {session.location && `· ${session.location}`}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{session.enrollments.length}{session.capacity ? `/${session.capacity}` : ''} inscriptos</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>
            {expanded && (
                <div className={`px-4 py-4 border-t flex flex-col gap-3 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    {session.enrollments.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin inscriptos.</p>
                    ) : session.enrollments.map(en => (
                        <div key={en.id} className="flex items-center justify-between gap-2 text-sm">
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{en.employee?.user?.name || '—'}</span>
                            <div className="flex items-center gap-2">
                                {canManage ? (
                                    <select value={en.status} onChange={e => setEnrollmentStatus(en, e.target.value)} className={`px-2 py-1 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                                        {Object.entries(ENROLLMENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                ) : (
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ENROLLMENT_STATUS_COLOR[en.status]}`}>{ENROLLMENT_STATUS_LABEL[en.status]}</span>
                                )}
                                {canManage && (
                                    <button onClick={() => deleteEnrollment(en.id)} className="w-6 h-6 rounded flex items-center justify-center bg-red-500/10 text-red-500"><Trash2 size={11} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    {canManage && (
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setShowEnroll(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: B.teal }}>+ Inscribir</button>
                            <button onClick={deleteSession} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-500">Eliminar Sesión</button>
                        </div>
                    )}
                </div>
            )}
            {showEnroll && (
                <Modal title="Inscribir Empleado" onClose={() => setShowEnroll(false)}>
                    <form onSubmit={submitEnroll} className="flex flex-col gap-4">
                        <SearchableSelect value={enrollForm.data.employee_id} onChange={v => enrollForm.setData('employee_id', v)} options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))} placeholder="Seleccionar..." error={enrollForm.errors.employee_id} />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowEnroll(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Inscribir</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default function Index({ auth, trainings, employees }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const hasPermission = (p) => auth.user?.is_super_admin || auth.user?.permissions?.includes(p);
    const canManage = hasPermission('rrhh.trainings.manage');

    const [showTraining, setShowTraining] = useState(false);
    const [sessionTrainingId, setSessionTrainingId] = useState(null);

    const trainingForm = useForm({ name: '', provider: '', hours: '', category: '' });
    const sessionForm = useForm({ training_id: '', start_date: '', end_date: '', location: '', capacity: '' });

    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const submitTraining = (e) => { e.preventDefault(); trainingForm.post(route('trainings.store'), { onSuccess: () => { setShowTraining(false); trainingForm.reset(); } }); };
    const submitSession = (e) => { e.preventDefault(); sessionForm.setData('training_id', sessionTrainingId); sessionForm.post(route('training-sessions.store'), { onSuccess: () => { setSessionTrainingId(null); sessionForm.reset(); } }); };
    const deleteTraining = (id) => confirmDialog('¿Eliminar esta capacitación?', () => router.delete(route('trainings.destroy', id), { preserveScroll: true }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Capacitaciones" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Capacitaciones</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cursos, sesiones e inscripciones del personal</p>
                        </div>
                    </div>
                    {canManage && (
                        <Button onClick={() => setShowTraining(true)} className="text-white border-none shadow-md rounded-xl" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus className="mr-2" size={16} /> Nueva Capacitación
                        </Button>
                    )}
                </div>

                {(!trainings || trainings.length === 0) ? (
                    <div className={`${card} p-12 text-center`}>
                        <GraduationCap size={40} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin capacitaciones creadas.</p>
                    </div>
                ) : trainings.map(training => (
                    <div key={training.id} className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{training.name}</h2>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {training.provider && `${training.provider} · `}{training.hours && `${training.hours}hs · `}{training.category || 'Sin categoría'}
                                </p>
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => setSessionTrainingId(training.id)} className="text-white border-none" style={{ background: B.teal }}>+ Sesión</Button>
                                    <button onClick={() => deleteTraining(training.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                            {training.sessions.length === 0 ? (
                                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin sesiones programadas.</p>
                            ) : training.sessions.map(session => (
                                <SessionRow key={session.id} session={session} employees={employees} canManage={canManage} isDark={isDark} confirmDialog={confirmDialog} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showTraining && (
                <Modal title="Nueva Capacitación" onClose={() => setShowTraining(false)}>
                    <form onSubmit={submitTraining} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Nombre *</label>
                            <input className={inputClass} value={trainingForm.data.name} onChange={e => trainingForm.setData('name', e.target.value)} placeholder="Ej. Bioseguridad en Laboratorio" />
                            {trainingForm.errors.name && <p className="text-red-500 text-xs mt-1">{trainingForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Proveedor / Dictante</label>
                            <input className={inputClass} value={trainingForm.data.provider} onChange={e => trainingForm.setData('provider', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Horas</label>
                                <input type="number" min="0" className={inputClass} value={trainingForm.data.hours} onChange={e => trainingForm.setData('hours', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Categoría</label>
                                <input className={inputClass} value={trainingForm.data.category} onChange={e => trainingForm.setData('category', e.target.value)} placeholder="Ej. Seguridad" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowTraining(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}

            {sessionTrainingId && (
                <Modal title="Nueva Sesión" onClose={() => setSessionTrainingId(null)}>
                    <form onSubmit={submitSession} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Desde *</label>
                                <input type="date" className={inputClass} value={sessionForm.data.start_date} onChange={e => sessionForm.setData('start_date', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Hasta</label>
                                <input type="date" className={inputClass} value={sessionForm.data.end_date} onChange={e => sessionForm.setData('end_date', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Lugar</label>
                            <input className={inputClass} value={sessionForm.data.location} onChange={e => sessionForm.setData('location', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Cupo</label>
                            <input type="number" min="0" className={inputClass} value={sessionForm.data.capacity} onChange={e => sessionForm.setData('capacity', e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setSessionTrainingId(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
