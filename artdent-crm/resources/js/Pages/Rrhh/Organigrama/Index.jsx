import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import SearchableSelect from '@/Components/SearchableSelect';
import { Network, Building2, Briefcase, Users, Plus, Pencil, Trash2, X, Save, ChevronRight, ChevronDown } from 'lucide-react';

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

function DepartmentNode({ dept, allDepartments, isDark, B, onEdit, onDelete, depth = 0 }) {
    const [open, setOpen] = useState(true);
    const children = allDepartments.filter(d => d.parent_id === dept.id);

    return (
        <div style={{ marginLeft: depth * 20 }}>
            <div className={`flex items-center justify-between gap-2 py-2 px-2 rounded-lg ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2 min-w-0">
                    {children.length > 0 ? (
                        <button onClick={() => setOpen(o => !o)} className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : <span className="w-3.5" />}
                    <Building2 size={14} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                    <span className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{dept.name}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {dept.positions_count ?? 0} puestos · {dept.employees_count ?? 0} empleados
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onEdit(dept)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Pencil size={11} /></button>
                    <button onClick={() => onDelete(dept)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                </div>
            </div>
            {open && children.map(child => (
                <DepartmentNode key={child.id} dept={child} allDepartments={allDepartments} isDark={isDark} B={B} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
            ))}
        </div>
    );
}

export default function Index({ auth, departments, positions, employees }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const permissions = usePage().props.auth.user.permissions ?? [];
    const isSuperAdmin = usePage().props.auth.user.is_super_admin;
    const canManage = isSuperAdmin || permissions.includes('rrhh.organigrama.manage');
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    /* ── Department modal ── */
    const [deptModal, setDeptModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deptForm, setDeptForm] = useState({ name: '', parent_id: '', is_active: true });
    const [deptProcessing, setDeptProcessing] = useState(false);
    const [deptErrors, setDeptErrors] = useState({});

    const openCreateDept = () => { setEditingDept(null); setDeptForm({ name: '', parent_id: '', is_active: true }); setDeptErrors({}); setDeptModal(true); };
    const openEditDept = (dept) => { setEditingDept(dept); setDeptForm({ name: dept.name, parent_id: dept.parent_id ? String(dept.parent_id) : '', is_active: dept.is_active }); setDeptErrors({}); setDeptModal(true); };

    const submitDept = (e) => {
        e.preventDefault();
        setDeptProcessing(true);
        const isEdit = !!editingDept;
        const url = isEdit ? route('departments.update', editingDept.id) : route('departments.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...deptForm, is_active: deptForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setDeptModal(false); setDeptProcessing(false); },
            onError: (errs) => { setDeptErrors(errs); setDeptProcessing(false); },
        });
    };

    const deleteDept = (dept) => {
        confirmDialog(`¿Eliminar el departamento "${dept.name}"?`, () => router.delete(route('departments.destroy', dept.id), { preserveScroll: true }));
    };

    /* ── Position modal ── */
    const [posModal, setPosModal] = useState(false);
    const [editingPos, setEditingPos] = useState(null);
    const [posForm, setPosForm] = useState({ name: '', department_id: '', reports_to_position_id: '', is_active: true });
    const [posProcessing, setPosProcessing] = useState(false);
    const [posErrors, setPosErrors] = useState({});

    const openCreatePos = () => { setEditingPos(null); setPosForm({ name: '', department_id: '', reports_to_position_id: '', is_active: true }); setPosErrors({}); setPosModal(true); };
    const openEditPos = (pos) => {
        setEditingPos(pos);
        setPosForm({
            name: pos.name,
            department_id: pos.department_id ? String(pos.department_id) : '',
            reports_to_position_id: pos.reports_to_position_id ? String(pos.reports_to_position_id) : '',
            is_active: pos.is_active,
        });
        setPosErrors({});
        setPosModal(true);
    };

    const submitPos = (e) => {
        e.preventDefault();
        setPosProcessing(true);
        const isEdit = !!editingPos;
        const url = isEdit ? route('positions.update', editingPos.id) : route('positions.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...posForm, is_active: posForm.is_active ? 1 : 0 }, {
            onSuccess: () => { setPosModal(false); setPosProcessing(false); },
            onError: (errs) => { setPosErrors(errs); setPosProcessing(false); },
        });
    };

    const deletePos = (pos) => {
        confirmDialog(`¿Eliminar el puesto "${pos.name}"?`, () => router.delete(route('positions.destroy', pos.id), { preserveScroll: true }));
    };

    const rootDepartments = departments.filter(d => !d.parent_id);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Organigrama" />
            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Network size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Organigrama</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Departamentos, puestos y jerarquías</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Departamentos */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Departamentos</h2>
                            {canManage && (
                                <button onClick={openCreateDept} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                    <Plus size={13} />
                                </button>
                            )}
                        </div>
                        {rootDepartments.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin departamentos registrados</p>
                        ) : (
                            <div className="flex flex-col gap-0.5">
                                {rootDepartments.map(dept => (
                                    <DepartmentNode key={dept.id} dept={dept} allDepartments={departments} isDark={isDark} B={B} onEdit={canManage ? openEditDept : () => {}} onDelete={canManage ? deleteDept : () => {}} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Puestos */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Puestos</h2>
                            {canManage && (
                                <button onClick={openCreatePos} className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                    <Plus size={13} />
                                </button>
                            )}
                        </div>
                        {positions.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin puestos registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {positions.map(pos => (
                                    <div key={pos.id} className="flex items-center justify-between py-2">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <Briefcase size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pos.name}</p>
                                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {departments.find(d => d.id === pos.department_id)?.name ?? 'Sin depto.'} · {pos.employees_count ?? 0} empleados
                                                </p>
                                            </div>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => openEditPos(pos)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Pencil size={11} /></button>
                                                <button onClick={() => deletePos(pos)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Empleados por jerarquía */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <Users size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Personal Activo</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                                    {['Nombre', 'Departamento', 'Puesto', 'Reporta a'].map(h => (
                                        <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {employees.map(emp => (
                                    <tr key={emp.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                        <td className="px-4 py-2.5">
                                            <Link href={route('employees.show', emp.id)} className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>{emp.user?.name ?? '—'}</Link>
                                        </td>
                                        <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{emp.department?.name ?? '—'}</td>
                                        <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{emp.job_position?.name ?? emp.position ?? '—'}</td>
                                        <td className={`px-4 py-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.supervisor?.user?.name ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Departamento */}
            <Modal open={deptModal} onClose={() => setDeptModal(false)} title={editingDept ? 'Editar Departamento' : 'Nuevo Departamento'} isDark={isDark}>
                <form onSubmit={submitDept} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />{deptErrors.name && <p className="text-red-500 text-xs mt-1">{deptErrors.name}</p>}</div>
                    <div>
                        <label className={labelCls}>Departamento padre</label>
                        <SearchableSelect
                            options={departments.filter(d => !editingDept || d.id !== editingDept.id).map(d => ({ value: String(d.id), label: d.name }))}
                            value={deptForm.parent_id}
                            onChange={v => setDeptForm(f => ({ ...f, parent_id: v }))}
                            placeholder="Ninguno (raíz)"
                        />
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={deptForm.is_active} onChange={e => setDeptForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Activo
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDeptModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={deptProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Puesto */}
            <Modal open={posModal} onClose={() => setPosModal(false)} title={editingPos ? 'Editar Puesto' : 'Nuevo Puesto'} isDark={isDark}>
                <form onSubmit={submitPos} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={posForm.name} onChange={e => setPosForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />{posErrors.name && <p className="text-red-500 text-xs mt-1">{posErrors.name}</p>}</div>
                    <div>
                        <label className={labelCls}>Departamento</label>
                        <SearchableSelect
                            options={departments.map(d => ({ value: String(d.id), label: d.name }))}
                            value={posForm.department_id}
                            onChange={v => setPosForm(f => ({ ...f, department_id: v }))}
                            placeholder="Sin asignar"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Reporta al puesto</label>
                        <SearchableSelect
                            options={positions.filter(p => !editingPos || p.id !== editingPos.id).map(p => ({ value: String(p.id), label: p.name }))}
                            value={posForm.reports_to_position_id}
                            onChange={v => setPosForm(f => ({ ...f, reports_to_position_id: v }))}
                            placeholder="Ninguno"
                        />
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={posForm.is_active} onChange={e => setPosForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Activo
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setPosModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={posProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
