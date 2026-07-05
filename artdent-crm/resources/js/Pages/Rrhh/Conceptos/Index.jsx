import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Calculator, Variable, Plus, Pencil, Trash2, X, Save, History, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react';

const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

const TYPE_LABEL = {
    remunerative: 'Remunerativo',
    non_remunerative: 'No remunerativo',
    deduction: 'Descuento',
    contribution: 'Aporte',
    employer_contribution: 'Contribución patronal',
};
const CALC_LABEL = { fixed: 'Fijo', percentage: 'Porcentaje', formula: 'Fórmula' };
const CATEGORY_LABEL = { seguridad_social: 'Seguridad Social (Jubilación)', obra_social: 'Obra Social', sindical: 'Sindical', art: 'A.R.T.', inssjp: 'INSSJP (Ley 19032)', seguro_vida: 'Seguro de Vida', camaras_empresariales: 'Cámaras o Entidades Empresariales', otros: 'Otros Rubros' };
const DATA_TYPE_LABEL = { number: 'Número', bool: 'Sí/No', date: 'Fecha', string: 'Texto' };

function Modal({ open, onClose, title, isDark, children, wide = false }) {
    if (!open) { return null; }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${wide ? 'max-w-xl' : 'max-w-md'} rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={15} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Index({ auth, variables, concepts }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const permissions = usePage().props.auth.user.permissions ?? [];
    const isSuperAdmin = usePage().props.auth.user.is_super_admin;
    const canManage = isSuperAdmin || permissions.includes('rrhh.formulas.manage');
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const monoCls = `w-full rounded-xl border px-3 py-2 text-sm font-mono transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const chipCls = `px-2 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${isDark ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-slate-100 text-teal-700 hover:bg-slate-200'}`;

    const [expanded, setExpanded] = useState({});
    const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

    /* ── Variable modal ── */
    const [varModal, setVarModal] = useState(false);
    const [editingVar, setEditingVar] = useState(null);
    const [varForm, setVarForm] = useState({ code: '', name: '', data_type: 'number', description: '', is_active: true });
    const [varProcessing, setVarProcessing] = useState(false);
    const [varErrors, setVarErrors] = useState({});

    const openCreateVar = () => { setEditingVar(null); setVarForm({ code: '', name: '', data_type: 'number', description: '', is_active: true }); setVarErrors({}); setVarModal(true); };
    const openEditVar = (v) => { setEditingVar(v); setVarForm({ code: v.code, name: v.name, data_type: v.data_type, description: v.description ?? '', is_active: v.is_active }); setVarErrors({}); setVarModal(true); };

    const submitVar = (e) => {
        e.preventDefault();
        setVarProcessing(true);
        const isEdit = !!editingVar;
        const url = isEdit ? route('payroll-variables.update', editingVar.id) : route('payroll-variables.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...varForm, is_active: varForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setVarModal(false); setVarProcessing(false); },
            onError: (errs) => { setVarErrors(errs); setVarProcessing(false); },
        });
    };

    const deleteVar = (v) => confirmDialog(`¿Eliminar la variable "${v.name}"?`, () => router.delete(route('payroll-variables.destroy', v.id), { preserveScroll: true }));

    /* ── Concepto modal ── */
    const [conceptModal, setConceptModal] = useState(false);
    const [editingConcept, setEditingConcept] = useState(null);
    const [conceptForm, setConceptForm] = useState({ code: '', name: '', type: 'remunerative', category: '', calculation_type: 'formula', affects_sac: true, affects_vacation: true, is_active: true, order: 0 });
    const [conceptProcessing, setConceptProcessing] = useState(false);
    const [conceptErrors, setConceptErrors] = useState({});

    const openCreateConcept = () => { setEditingConcept(null); setConceptForm({ code: '', name: '', type: 'remunerative', category: '', calculation_type: 'formula', affects_sac: true, affects_vacation: true, is_active: true, order: 0 }); setConceptErrors({}); setConceptModal(true); };
    const openEditConcept = (c) => { setEditingConcept(c); setConceptForm({ code: c.code, name: c.name, type: c.type, category: c.category ?? '', calculation_type: c.calculation_type, affects_sac: c.affects_sac, affects_vacation: c.affects_vacation, is_active: c.is_active, order: c.order }); setConceptErrors({}); setConceptModal(true); };

    const submitConcept = (e) => {
        e.preventDefault();
        setConceptProcessing(true);
        const isEdit = !!editingConcept;
        const url = isEdit ? route('payroll-concepts.update', editingConcept.id) : route('payroll-concepts.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...conceptForm, affects_sac: conceptForm.affects_sac ? 1 : 0, affects_vacation: conceptForm.affects_vacation ? 1 : 0, is_active: conceptForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setConceptModal(false); setConceptProcessing(false); },
            onError: (errs) => { setConceptErrors(errs); setConceptProcessing(false); },
        });
    };

    const deleteConcept = (c) => confirmDialog(`¿Eliminar el concepto "${c.name}"?`, () => router.delete(route('payroll-concepts.destroy', c.id), { preserveScroll: true }));

    /* ── Fórmula (nueva versión) modal ── */
    const [formulaModal, setFormulaModal] = useState(false);
    const [formulaConcept, setFormulaConcept] = useState(null);
    const [formulaForm, setFormulaForm] = useState({ formula: '', effective_from: '', notes: '' });
    const [formulaProcessing, setFormulaProcessing] = useState(false);
    const [formulaErrors, setFormulaErrors] = useState({});
    const formulaRef = useRef(null);

    const [simValues, setSimValues] = useState({});
    const [simResult, setSimResult] = useState(null);
    const [simError, setSimError] = useState(null);
    const [simLoading, setSimLoading] = useState(false);

    const openFormula = (concept) => {
        setFormulaConcept(concept);
        setFormulaForm({ formula: '', effective_from: '', notes: '' });
        setFormulaErrors({});
        setSimValues({});
        setSimResult(null);
        setSimError(null);
        setFormulaModal(true);
    };

    const insertVariable = (code) => {
        const el = formulaRef.current;
        if (!el) { setFormulaForm(f => ({ ...f, formula: f.formula + code })); return; }
        const start = el.selectionStart ?? formulaForm.formula.length;
        const end = el.selectionEnd ?? formulaForm.formula.length;
        const next = formulaForm.formula.slice(0, start) + code + formulaForm.formula.slice(end);
        setFormulaForm(f => ({ ...f, formula: next }));
        requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start + code.length; });
    };

    const runSimulation = async () => {
        setSimLoading(true);
        setSimError(null);
        setSimResult(null);
        try {
            const numericValues = Object.fromEntries(Object.entries(simValues).map(([k, v]) => [k, v === '' ? 0 : Number(v)]));
            const { data } = await axios.post(route('payroll-concepts.simulate'), { formula: formulaForm.formula, variables: numericValues });
            setSimResult(data.result);
        } catch (err) {
            setSimError(err.response?.data?.error ?? 'Error al simular la fórmula.');
        } finally {
            setSimLoading(false);
        }
    };

    const submitFormula = (e) => {
        e.preventDefault();
        setFormulaProcessing(true);
        router.post(route('payroll-concept-versions.store'), { ...formulaForm, payroll_concept_id: formulaConcept.id }, {
            onSuccess: () => { setFormulaModal(false); setFormulaProcessing(false); },
            onError: (errs) => { setFormulaErrors(errs); setFormulaProcessing(false); },
        });
    };

    const deleteVersion = (version) => confirmDialog('¿Eliminar esta versión de fórmula?', () => router.delete(route('payroll-concept-versions.destroy', version.id), { preserveScroll: true }));

    const currentVersionOf = (concept) => {
        const today = new Date().toISOString().split('T')[0];
        return (concept.versions ?? []).filter(v => v.effective_from <= today && (!v.effective_to || v.effective_to >= today))
            .sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1))[0] ?? null;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Motor de Fórmulas" />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Calculator size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Motor de Fórmulas</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Variables y conceptos de liquidación, 100% parametrizables</p>
                    </div>
                </div>

                {/* Variables */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Variable size={15} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Variables</h2>
                        </div>
                        {canManage && (
                            <button onClick={openCreateVar} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                            </button>
                        )}
                    </div>
                    {variables.length === 0 ? (
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin variables registradas</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {variables.map(v => (
                                <div key={v.id} className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border text-xs ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className={`font-mono font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>{v.code}</span>
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{v.name} · {DATA_TYPE_LABEL[v.data_type]}</span>
                                    {canManage && v.source !== 'system' && (
                                        <span className="flex items-center gap-0.5 ml-1">
                                            <button onClick={() => openEditVar(v)} className={isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}><Pencil size={10} /></button>
                                            <button onClick={() => deleteVar(v)} className="text-red-400 hover:text-red-500"><Trash2 size={10} /></button>
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conceptos */}
                <div className="flex items-center justify-between">
                    <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Conceptos de Liquidación</h2>
                    {canManage && (
                        <button onClick={openCreateConcept} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={16} /> Nuevo Concepto
                        </button>
                    )}
                </div>

                {concepts.length === 0 ? (
                    <div className={`${card} flex flex-col items-center justify-center py-16`}>
                        <Calculator size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sin conceptos registrados</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {concepts.map(concept => {
                            const current = currentVersionOf(concept);
                            return (
                                <div key={concept.id} className={`${card} overflow-hidden`}>
                                    <div className="flex items-center justify-between gap-2 px-5 py-4">
                                        <button onClick={() => toggle(concept.id)} className="flex items-center gap-2 min-w-0 text-left flex-1">
                                            {expanded[concept.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            <div className="min-w-0">
                                                <p className={`font-extrabold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {concept.name} <span className={`font-mono font-normal text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{concept.code}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{TYPE_LABEL[concept.type]}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{CALC_LABEL[concept.calculation_type]}</span>
                                                    {!concept.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500">Inactivo</span>}
                                                </div>
                                            </div>
                                        </button>
                                        {canManage && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => openFormula(concept)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} title="Nueva versión de fórmula"><PlayCircle size={13} /></button>
                                                <button onClick={() => openEditConcept(concept)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Pencil size={12} /></button>
                                                <button onClick={() => deleteConcept(concept)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`px-5 pb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {current ? (
                                            <p className={`font-mono text-xs rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>{current.formula}</p>
                                        ) : (
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin fórmula vigente</p>
                                        )}
                                    </div>
                                    {expanded[concept.id] && (
                                        <div className={`border-t divide-y ${isDark ? 'border-slate-800 divide-slate-800' : 'border-slate-100 divide-slate-100'}`}>
                                            {(concept.versions ?? []).length === 0 ? (
                                                <p className={`px-5 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin historial de versiones</p>
                                            ) : concept.versions.map(v => (
                                                <div key={v.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                                                    <div className="min-w-0 flex items-center gap-2">
                                                        <History size={12} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                                        <div className="min-w-0">
                                                            <p className={`text-xs font-mono truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.formula}</p>
                                                            <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                {fmtDate(v.effective_from)} — {v.effective_to ? fmtDate(v.effective_to) : 'vigente'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {canManage && !v.effective_to && (
                                                        <button onClick={() => deleteVersion(v)} className="text-red-400 hover:text-red-500 shrink-0"><Trash2 size={12} /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Variable */}
            <Modal open={varModal} onClose={() => setVarModal(false)} title={editingVar ? 'Editar Variable' : 'Nueva Variable'} isDark={isDark}>
                <form onSubmit={submitVar} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Código *</label><input type="text" value={varForm.code} onChange={e => setVarForm(f => ({ ...f, code: e.target.value.toLowerCase() }))} className={monoCls} placeholder="sueldo_basico" required />{varErrors.code && <p className="text-red-500 text-xs mt-1">{varErrors.code}</p>}</div>
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={varForm.name} onChange={e => setVarForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Sueldo Básico" required /></div>
                    <div>
                        <label className={labelCls}>Tipo de dato</label>
                        <select value={varForm.data_type} onChange={e => setVarForm(f => ({ ...f, data_type: e.target.value }))} className={inputCls}>
                            {Object.entries(DATA_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div><label className={labelCls}>Descripción</label><input type="text" value={varForm.description} onChange={e => setVarForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={varForm.is_active} onChange={e => setVarForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Activa
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setVarModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={varProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Concepto */}
            <Modal open={conceptModal} onClose={() => setConceptModal(false)} title={editingConcept ? 'Editar Concepto' : 'Nuevo Concepto'} isDark={isDark}>
                <form onSubmit={submitConcept} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Código *</label><input type="text" inputMode="numeric" value={conceptForm.code} onChange={e => setConceptForm(f => ({ ...f, code: e.target.value.replace(/\D/g, '') }))} className={monoCls} placeholder="103 (haberes), 800 (descuentos legales)" required />{conceptErrors.code && <p className="text-red-500 text-xs mt-1">{conceptErrors.code}</p>}</div>
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={conceptForm.name} onChange={e => setConceptForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Presentismo" required /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Tipo</label>
                            <select value={conceptForm.type} onChange={e => setConceptForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Categoría (para Costo Empresa)</label>
                            <select value={conceptForm.category} onChange={e => setConceptForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                                <option value="">Sin categoría</option>
                                {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Cálculo</label>
                            <select value={conceptForm.calculation_type} onChange={e => setConceptForm(f => ({ ...f, calculation_type: e.target.value }))} className={inputCls}>
                                {Object.entries(CALC_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className={labelCls}>Orden</label><input type="number" min="0" value={conceptForm.order} onChange={e => setConceptForm(f => ({ ...f, order: e.target.value }))} className={inputCls} /></div>
                    <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <input type="checkbox" checked={conceptForm.affects_sac} onChange={e => setConceptForm(f => ({ ...f, affects_sac: e.target.checked }))} className="rounded accent-teal-500" />
                            Afecta base de cálculo del SAC
                        </label>
                        <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <input type="checkbox" checked={conceptForm.affects_vacation} onChange={e => setConceptForm(f => ({ ...f, affects_vacation: e.target.checked }))} className="rounded accent-teal-500" />
                            Afecta base de cálculo de vacaciones
                        </label>
                        <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <input type="checkbox" checked={conceptForm.is_active} onChange={e => setConceptForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                            Activo
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setConceptModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={conceptProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Fórmula + Simulación */}
            <Modal open={formulaModal} onClose={() => setFormulaModal(false)} title={`Nueva fórmula — ${formulaConcept?.name ?? ''}`} isDark={isDark} wide>
                <form onSubmit={submitFormula} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Variables disponibles (click para insertar)</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {variables.map(v => (
                                <button type="button" key={v.id} onClick={() => insertVariable(v.code)} className={chipCls}>{v.code}</button>
                            ))}
                        </div>
                        <textarea
                            ref={formulaRef}
                            value={formulaForm.formula}
                            onChange={e => setFormulaForm(f => ({ ...f, formula: e.target.value }))}
                            className={`${monoCls} min-h-[80px]`}
                            placeholder="sueldo_basico * (1 + antiguedad_pct / 100)"
                            required
                        />
                        {formulaErrors.formula && <p className="text-red-500 text-xs mt-1">{formulaErrors.formula}</p>}
                    </div>
                    <div><label className={labelCls}>Vigencia desde *</label><input type="date" value={formulaForm.effective_from} onChange={e => setFormulaForm(f => ({ ...f, effective_from: e.target.value }))} className={inputCls} required />{formulaErrors.effective_from && <p className="text-red-500 text-xs mt-1">{formulaErrors.effective_from}</p>}</div>
                    <div><label className={labelCls}>Notas</label><input type="text" value={formulaForm.notes} onChange={e => setFormulaForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} /></div>

                    <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Simular</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            {variables.map(v => (
                                <div key={v.id}>
                                    <label className={`block text-[10px] font-mono mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{v.code}</label>
                                    <input type="number" step="0.01" value={simValues[v.code] ?? ''} onChange={e => setSimValues(s => ({ ...s, [v.code]: e.target.value }))} className={`${inputCls} py-1.5`} placeholder="0" />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={runSimulation} disabled={simLoading || !formulaForm.formula} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-white'}`}>
                                <PlayCircle size={13} /> {simLoading ? 'Calculando...' : 'Calcular'}
                            </button>
                            {simResult !== null && <span className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Resultado: {simResult}</span>}
                            {simError && <span className="text-xs text-red-500">{simError}</span>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setFormulaModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={formulaProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar versión
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
