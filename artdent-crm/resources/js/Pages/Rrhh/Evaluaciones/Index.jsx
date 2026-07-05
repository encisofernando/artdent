import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ClipboardList, Plus, X, Check, Trash2, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const CYCLE_TYPE_LABEL = { 90: '90°', 180: '180°', 360: '360°', objectives: 'Por Objetivos' };
const CYCLE_STATUS_LABEL = { draft: 'Borrador', active: 'Activo', closed: 'Cerrado' };
const EVAL_STATUS_LABEL = { pending: 'Pendiente', in_progress: 'En Curso', completed: 'Completada' };
const OBJ_STATUS_LABEL = { pending: 'Pendiente', in_progress: 'En Curso', completed: 'Completado', cancelled: 'Cancelado' };

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

function EvaluationRow({ evaluation, cycle, canManage, isDark }) {
    const [expanded, setExpanded] = useState(false);
    const confirmDialog = useConfirm();
    const scoreForm = useForm({
        status: evaluation.status,
        summary: evaluation.summary || '',
        scores: cycle.criteria.map(c => {
            const existing = evaluation.scores?.find(s => s.evaluation_criterion_id === c.id);
            return { criterion_id: c.id, score: existing?.score ?? '', comment: existing?.comment ?? '' };
        }),
    });

    const submitScores = (e) => {
        e.preventDefault();
        router.put(route('evaluations.update', evaluation.id), scoreForm.data, { preserveScroll: true });
    };

    const deleteEvaluation = () => confirmDialog('¿Eliminar esta evaluación?', () => router.delete(route('evaluations.destroy', evaluation.id), { preserveScroll: true }));

    return (
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{evaluation.employee?.user?.name || '—'}</span>
                    {evaluation.evaluator && <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>evaluado por {evaluation.evaluator.user?.name}</span>}
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${evaluation.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {EVAL_STATUS_LABEL[evaluation.status]}
                    </span>
                    {evaluation.weighted_score != null && (
                        <span className="font-bold text-sm" style={{ color: B.teal }}>{evaluation.weighted_score}/10</span>
                    )}
                </div>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded && (
                <div className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    {canManage ? (
                        <form onSubmit={submitScores} className="flex flex-col gap-3">
                            {cycle.criteria.map((c, i) => (
                                <div key={c.id} className="grid grid-cols-[1fr_80px] gap-2 items-center">
                                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.name} <span className="text-xs opacity-60">({c.weight}%)</span></span>
                                    <input
                                        type="number" min="0" max="10" step="0.5"
                                        className={`px-2 py-1.5 rounded-lg border text-sm text-center ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                        value={scoreForm.data.scores[i].score}
                                        onChange={e => {
                                            const scores = [...scoreForm.data.scores];
                                            scores[i] = { ...scores[i], score: e.target.value };
                                            scoreForm.setData('scores', scores);
                                        }}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Resumen</label>
                                <textarea rows={2} className={`w-full px-2 py-1.5 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                    value={scoreForm.data.summary} onChange={e => scoreForm.setData('summary', e.target.value)} />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estado</label>
                                <select className={`px-2 py-1.5 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                    value={scoreForm.data.status} onChange={e => scoreForm.setData('status', e.target.value)}>
                                    {Object.entries(EVAL_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                    <Check size={12} className="inline mr-1" /> Guardar Puntajes
                                </button>
                                <button type="button" onClick={deleteEvaluation} className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-500">
                                    <Trash2 size={12} className="inline mr-1" /> Eliminar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{evaluation.summary || 'Sin resumen todavía.'}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ auth, cycles, employees, objectives }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const hasPermission = (p) => auth.user?.is_super_admin || auth.user?.permissions?.includes(p);
    const canManage = hasPermission('rrhh.evaluations.manage');

    const [showCycle, setShowCycle] = useState(false);
    const [criterionCycleId, setCriterionCycleId] = useState(null);
    const [evalCycleId, setEvalCycleId] = useState(null);
    const [showObjective, setShowObjective] = useState(false);

    const cycleForm = useForm({ name: '', type: '90', period_start: '', period_end: '', status: 'draft' });
    const criterionForm = useForm({ evaluation_cycle_id: '', name: '', weight: '' });
    const evalForm = useForm({ evaluation_cycle_id: '', employee_id: '', evaluator_id: '' });
    const objectiveForm = useForm({ employee_id: '', title: '', target: '', due_date: '' });

    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const submitCycle = (e) => { e.preventDefault(); cycleForm.post(route('evaluation-cycles.store'), { onSuccess: () => { setShowCycle(false); cycleForm.reset(); } }); };
    const submitCriterion = (e) => { e.preventDefault(); criterionForm.post(route('evaluation-criteria.store'), { onSuccess: () => { setCriterionCycleId(null); criterionForm.reset(); } }); };
    const submitEval = (e) => { e.preventDefault(); evalForm.post(route('evaluations.store'), { onSuccess: () => { setEvalCycleId(null); evalForm.reset(); } }); };
    const submitObjective = (e) => { e.preventDefault(); objectiveForm.post(route('objectives.store'), { onSuccess: () => { setShowObjective(false); objectiveForm.reset(); } }); };

    const deleteCycle = (id) => confirmDialog('¿Eliminar este ciclo?', () => router.delete(route('evaluation-cycles.destroy', id), { preserveScroll: true }));
    const deleteCriterion = (id) => confirmDialog('¿Eliminar este criterio?', () => router.delete(route('evaluation-criteria.destroy', id), { preserveScroll: true }));
    const deleteObjective = (id) => confirmDialog('¿Eliminar este objetivo?', () => router.delete(route('objectives.destroy', id), { preserveScroll: true }));
    const updateObjectiveProgress = (obj, progress) => router.put(route('objectives.update', obj.id), { title: obj.title, target: obj.target, due_date: obj.due_date, progress, status: progress >= 100 ? 'completed' : 'in_progress' }, { preserveScroll: true });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Evaluaciones de Desempeño" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <ClipboardList size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Evaluaciones de Desempeño</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ciclos de evaluación, criterios y objetivos</p>
                        </div>
                    </div>
                    {canManage && (
                        <Button onClick={() => setShowCycle(true)} className="text-white border-none shadow-md rounded-xl" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus className="mr-2" size={16} /> Nuevo Ciclo
                        </Button>
                    )}
                </div>

                {(!cycles || cycles.length === 0) ? (
                    <div className={`${card} p-12 text-center`}>
                        <ClipboardList size={40} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin ciclos de evaluación creados.</p>
                    </div>
                ) : cycles.map(cycle => (
                    <div key={cycle.id} className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b flex items-center justify-between flex-wrap gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cycle.name}</h2>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {CYCLE_TYPE_LABEL[cycle.type]} · {fmtDate(cycle.period_start)} – {fmtDate(cycle.period_end)} · {CYCLE_STATUS_LABEL[cycle.status]}
                                </p>
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setCriterionCycleId(cycle.id)}>+ Criterio</Button>
                                    <Button size="sm" onClick={() => setEvalCycleId(cycle.id)} className="text-white border-none" style={{ background: B.teal }}>+ Evaluación</Button>
                                    <button onClick={() => deleteCycle(cycle.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            {cycle.criteria.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {cycle.criteria.map(c => (
                                        <span key={c.id} className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                            {c.name} ({c.weight}%)
                                            {canManage && <button onClick={() => deleteCriterion(c.id)}><X size={10} className="text-red-400" /></button>}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {cycle.evaluations.length === 0 ? (
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin evaluaciones cargadas en este ciclo.</p>
                                ) : cycle.evaluations.map(ev => (
                                    <EvaluationRow key={ev.id} evaluation={ev} cycle={cycle} canManage={canManage} isDark={isDark} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Objetivos */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}><Target size={16} /> Objetivos Individuales</h2>
                        {canManage && (
                            <Button size="sm" onClick={() => setShowObjective(true)} className="text-white border-none" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={14} className="mr-1" /> Nuevo Objetivo
                            </Button>
                        )}
                    </div>
                    {(!objectives || objectives.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin objetivos cargados.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/50">
                            {objectives.map(o => (
                                <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="min-w-0">
                                        <p className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{o.employee?.user?.name} — {o.title}</p>
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{o.target} {o.due_date && `· Vence ${fmtDate(o.due_date)}`} · {OBJ_STATUS_LABEL[o.status]}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-32 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            <div className="h-full" style={{ width: `${o.progress}%`, background: B.teal }} />
                                        </div>
                                        <span className="text-xs font-bold w-10 text-right">{o.progress}%</span>
                                        {canManage && (
                                            <>
                                                <input type="number" min="0" max="100" defaultValue={o.progress} className={`w-16 px-2 py-1 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                                    onBlur={e => updateObjectiveProgress(o, Number(e.target.value))} />
                                                <button onClick={() => deleteObjective(o.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500"><Trash2 size={12} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showCycle && (
                <Modal title="Nuevo Ciclo de Evaluación" onClose={() => setShowCycle(false)}>
                    <form onSubmit={submitCycle} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Nombre *</label>
                            <input className={inputClass} value={cycleForm.data.name} onChange={e => cycleForm.setData('name', e.target.value)} placeholder="Ej. Evaluación Semestral 2026" />
                            {cycleForm.errors.name && <p className="text-red-500 text-xs mt-1">{cycleForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Tipo</label>
                            <select className={inputClass} value={cycleForm.data.type} onChange={e => cycleForm.setData('type', e.target.value)}>
                                {Object.entries(CYCLE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Desde *</label>
                                <input type="date" className={inputClass} value={cycleForm.data.period_start} onChange={e => cycleForm.setData('period_start', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Hasta *</label>
                                <input type="date" className={inputClass} value={cycleForm.data.period_end} onChange={e => cycleForm.setData('period_end', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Estado</label>
                            <select className={inputClass} value={cycleForm.data.status} onChange={e => cycleForm.setData('status', e.target.value)}>
                                {Object.entries(CYCLE_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowCycle(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}

            {criterionCycleId && (
                <Modal title="Nuevo Criterio" onClose={() => setCriterionCycleId(null)}>
                    <form onSubmit={(e) => { criterionForm.setData('evaluation_cycle_id', criterionCycleId); submitCriterion(e); }} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Nombre *</label>
                            <input className={inputClass} value={criterionForm.data.name} onChange={e => criterionForm.setData('name', e.target.value)} placeholder="Ej. Puntualidad" />
                        </div>
                        <div>
                            <label className={labelClass}>Peso % *</label>
                            <input type="number" min="0" max="100" className={inputClass} value={criterionForm.data.weight} onChange={e => criterionForm.setData('weight', e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setCriterionCycleId(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}

            {evalCycleId && (
                <Modal title="Nueva Evaluación" onClose={() => setEvalCycleId(null)}>
                    <form onSubmit={(e) => { evalForm.setData('evaluation_cycle_id', evalCycleId); submitEval(e); }} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Empleado a Evaluar *</label>
                            <SearchableSelect value={evalForm.data.employee_id} onChange={v => evalForm.setData('employee_id', v)} options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))} placeholder="Seleccionar..." error={evalForm.errors.employee_id} />
                        </div>
                        <div>
                            <label className={labelClass}>Evaluador (opcional)</label>
                            <SearchableSelect value={evalForm.data.evaluator_id} onChange={v => evalForm.setData('evaluator_id', v)} options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))} placeholder="Sin especificar" />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setEvalCycleId(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showObjective && (
                <Modal title="Nuevo Objetivo" onClose={() => setShowObjective(false)}>
                    <form onSubmit={submitObjective} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Empleado *</label>
                            <SearchableSelect value={objectiveForm.data.employee_id} onChange={v => objectiveForm.setData('employee_id', v)} options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))} placeholder="Seleccionar..." error={objectiveForm.errors.employee_id} />
                        </div>
                        <div>
                            <label className={labelClass}>Título *</label>
                            <input className={inputClass} value={objectiveForm.data.title} onChange={e => objectiveForm.setData('title', e.target.value)} placeholder="Ej. Reducir ausentismo del equipo" />
                        </div>
                        <div>
                            <label className={labelClass}>Meta</label>
                            <input className={inputClass} value={objectiveForm.data.target} onChange={e => objectiveForm.setData('target', e.target.value)} placeholder="Ej. Menos de 2% de ausentismo" />
                        </div>
                        <div>
                            <label className={labelClass}>Vencimiento</label>
                            <input type="date" className={inputClass} value={objectiveForm.data.due_date} onChange={e => objectiveForm.setData('due_date', e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowObjective(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Check size={14} className="inline mr-1" /> Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
