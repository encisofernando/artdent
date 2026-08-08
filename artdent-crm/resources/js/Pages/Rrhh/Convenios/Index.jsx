import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import SearchableSelect from '@/Components/SearchableSelect';
import { todayIso } from '@/lib/localDate';
import { ScrollText, Layers, TrendingUp, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight, History } from 'lucide-react';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

function Modal({ open, onClose, title, isDark, children }) {
    if (!open) { return null; }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={15} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function currentScaleOf(category) {
    const today = todayIso();
    return (category.salary_scales ?? [])
        .filter(s => s.effective_from <= today && (!s.effective_to || s.effective_to >= today))
        .sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1))[0] ?? null;
}

export default function Index({ auth, agreements }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const permissions = usePage().props.auth.user.permissions ?? [];
    const isSuperAdmin = usePage().props.auth.user.is_super_admin;
    const canManage = isSuperAdmin || permissions.includes('rrhh.convenios.manage');
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const [expanded, setExpanded] = useState({});
    const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

    /* ── Convenio modal ── */
    const [agModal, setAgModal] = useState(false);
    const [editingAg, setEditingAg] = useState(null);
    const [agForm, setAgForm] = useState({ name: '', code: '', description: '', is_active: true });
    const [agProcessing, setAgProcessing] = useState(false);
    const [agErrors, setAgErrors] = useState({});

    const openCreateAg = () => { setEditingAg(null); setAgForm({ name: '', code: '', description: '', is_active: true }); setAgErrors({}); setAgModal(true); };
    const openEditAg = (ag) => { setEditingAg(ag); setAgForm({ name: ag.name, code: ag.code ?? '', description: ag.description ?? '', is_active: ag.is_active }); setAgErrors({}); setAgModal(true); };

    const submitAg = (e) => {
        e.preventDefault();
        setAgProcessing(true);
        const isEdit = !!editingAg;
        const url = isEdit ? route('labor-agreements.update', editingAg.id) : route('labor-agreements.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...agForm, is_active: agForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setAgModal(false); setAgProcessing(false); },
            onError: (errs) => { setAgErrors(errs); setAgProcessing(false); },
        });
    };

    const deleteAg = (ag) => confirmDialog(`¿Eliminar el convenio "${ag.name}"?`, () => router.delete(route('labor-agreements.destroy', ag.id), { preserveScroll: true }));

    /* ── Categoría modal ── */
    const [catModal, setCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [catForm, setCatForm] = useState({ labor_agreement_id: '', name: '', code: '', order: 0, is_active: true });
    const [catProcessing, setCatProcessing] = useState(false);
    const [catErrors, setCatErrors] = useState({});

    const openCreateCat = (agreementId) => { setEditingCat(null); setCatForm({ labor_agreement_id: String(agreementId), name: '', code: '', order: 0, is_active: true }); setCatErrors({}); setCatModal(true); };
    const openEditCat = (cat) => { setEditingCat(cat); setCatForm({ labor_agreement_id: String(cat.labor_agreement_id), name: cat.name, code: cat.code ?? '', order: cat.order ?? 0, is_active: cat.is_active }); setCatErrors({}); setCatModal(true); };

    const submitCat = (e) => {
        e.preventDefault();
        setCatProcessing(true);
        const isEdit = !!editingCat;
        const url = isEdit ? route('labor-agreement-categories.update', editingCat.id) : route('labor-agreement-categories.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...catForm, is_active: catForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setCatModal(false); setCatProcessing(false); },
            onError: (errs) => { setCatErrors(errs); setCatProcessing(false); },
        });
    };

    const deleteCat = (cat) => confirmDialog(`¿Eliminar la categoría "${cat.name}"?`, () => router.delete(route('labor-agreement-categories.destroy', cat.id), { preserveScroll: true }));

    /* ── Escala modal ── */
    const [scaleModal, setScaleModal] = useState(false);
    const [scaleForm, setScaleForm] = useState({ labor_agreement_category_id: '', base_amount: '', effective_from: '', notes: '' });
    const [scaleProcessing, setScaleProcessing] = useState(false);
    const [scaleErrors, setScaleErrors] = useState({});

    const openScale = (categoryId) => { setScaleForm({ labor_agreement_category_id: String(categoryId), base_amount: '', effective_from: '', notes: '' }); setScaleErrors({}); setScaleModal(true); };

    const submitScale = (e) => {
        e.preventDefault();
        setScaleProcessing(true);
        router.post(route('salary-scales.store'), scaleForm, {
            onSuccess: () => { setScaleModal(false); setScaleProcessing(false); },
            onError: (errs) => { setScaleErrors(errs); setScaleProcessing(false); },
        });
    };

    const deleteScale = (scale) => confirmDialog('¿Eliminar esta escala salarial?', () => router.delete(route('salary-scales.destroy', scale.id), { preserveScroll: true }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Convenios Colectivos" />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <ScrollText size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Convenios Colectivos</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Categorías y escalas salariales</p>
                        </div>
                    </div>
                    {canManage && (
                        <button onClick={openCreateAg} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={16} /> Nuevo Convenio
                        </button>
                    )}
                </div>

                {agreements.length === 0 ? (
                    <div className={`${card} flex flex-col items-center justify-center py-16`}>
                        <ScrollText size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sin convenios registrados</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {agreements.map(ag => (
                            <div key={ag.id} className={`${card} overflow-hidden`}>
                                <div className={`flex items-center justify-between gap-2 px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <button onClick={() => toggle(ag.id)} className="flex items-center gap-2 min-w-0 text-left">
                                        {expanded[ag.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        <div className="min-w-0">
                                            <p className={`font-extrabold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{ag.name} {ag.code && <span className={`font-normal text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({ag.code})</span>}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ag.categories_count} categorías</p>
                                        </div>
                                    </button>
                                    {canManage && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openCreateCat(ag.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} title="Nueva categoría"><Plus size={12} /></button>
                                            <button onClick={() => openEditAg(ag)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Pencil size={12} /></button>
                                            <button onClick={() => deleteAg(ag)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}><Trash2 size={12} /></button>
                                        </div>
                                    )}
                                </div>
                                {expanded[ag.id] && (
                                    <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {ag.categories.length === 0 ? (
                                            <p className={`px-5 py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin categorías. Agregá una para empezar a definir escalas.</p>
                                        ) : ag.categories.map(cat => {
                                            const scale = currentScaleOf(cat);
                                            return (
                                                <div key={cat.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Layers size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cat.name}</p>
                                                            <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                {scale ? (
                                                                    <><TrendingUp size={11} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} /> {fmt(scale.base_amount)} · vigente desde {fmtDate(scale.effective_from)}</>
                                                                ) : 'Sin escala vigente'}
                                                                {(cat.salary_scales?.length ?? 0) > 0 && <span className="inline-flex items-center gap-0.5 ml-1"><History size={10} /> {cat.salary_scales.length}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {canManage && (
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button onClick={() => openScale(cat.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} title="Nueva escala"><TrendingUp size={12} /></button>
                                                            {scale && <button onClick={() => deleteScale(scale)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`} title="Eliminar escala vigente"><Trash2 size={12} /></button>}
                                                            <button onClick={() => openEditCat(cat)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Pencil size={12} /></button>
                                                            <button onClick={() => deleteCat(cat)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}><Trash2 size={12} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Convenio */}
            <Modal open={agModal} onClose={() => setAgModal(false)} title={editingAg ? 'Editar Convenio' : 'Nuevo Convenio'} isDark={isDark}>
                <form onSubmit={submitAg} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={agForm.name} onChange={e => setAgForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Convenio Colectivo de Trabajo..." required />{agErrors.name && <p className="text-red-500 text-xs mt-1">{agErrors.name}</p>}</div>
                    <div><label className={labelCls}>Código</label><input type="text" value={agForm.code} onChange={e => setAgForm(f => ({ ...f, code: e.target.value }))} className={inputCls} placeholder="CCT 130/75" /></div>
                    <div><label className={labelCls}>Descripción</label><textarea value={agForm.description} onChange={e => setAgForm(f => ({ ...f, description: e.target.value }))} className={inputCls} rows={3} /></div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={agForm.is_active} onChange={e => setAgForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Activo
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAgModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={agProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Categoría */}
            <Modal open={catModal} onClose={() => setCatModal(false)} title={editingCat ? 'Editar Categoría' : 'Nueva Categoría'} isDark={isDark}>
                <form onSubmit={submitCat} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Convenio *</label>
                        <SearchableSelect
                            options={agreements.map(a => ({ value: String(a.id), label: a.name }))}
                            value={catForm.labor_agreement_id}
                            onChange={v => setCatForm(f => ({ ...f, labor_agreement_id: v }))}
                            placeholder="Seleccionar..."
                            required
                        />
                    </div>
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Oficial, Medio Oficial, Auxiliar..." required />{catErrors.name && <p className="text-red-500 text-xs mt-1">{catErrors.name}</p>}</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Código</label><input type="text" value={catForm.code} onChange={e => setCatForm(f => ({ ...f, code: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Orden</label><input type="number" min="0" value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={catForm.is_active} onChange={e => setCatForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Activo
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setCatModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={catProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Escala */}
            <Modal open={scaleModal} onClose={() => setScaleModal(false)} title="Nueva Escala Salarial" isDark={isDark}>
                <form onSubmit={submitScale} className="flex flex-col gap-4">
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Registra una nueva versión de la escala. La vigente actual se cerrará automáticamente el día anterior a la fecha de vigencia elegida.
                    </p>
                    <div><label className={labelCls}>Importe base *</label><input type="number" step="0.01" min="0" value={scaleForm.base_amount} onChange={e => setScaleForm(f => ({ ...f, base_amount: e.target.value }))} className={inputCls} placeholder="0.00" required />{scaleErrors.base_amount && <p className="text-red-500 text-xs mt-1">{scaleErrors.base_amount}</p>}</div>
                    <div><label className={labelCls}>Vigencia desde *</label><input type="date" value={scaleForm.effective_from} onChange={e => setScaleForm(f => ({ ...f, effective_from: e.target.value }))} className={inputCls} required />{scaleErrors.effective_from && <p className="text-red-500 text-xs mt-1">{scaleErrors.effective_from}</p>}</div>
                    <div><label className={labelCls}>Notas</label><input type="text" value={scaleForm.notes} onChange={e => setScaleForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setScaleModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={scaleProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
