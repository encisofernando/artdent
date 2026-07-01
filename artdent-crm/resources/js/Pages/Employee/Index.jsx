import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Users, Search, Plus, Pencil, Trash2, X, Save, CheckCircle, XCircle, Eye, Percent, BadgeDollarSign } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtPct = (n) => n == null ? '—' : `${parseFloat(n).toFixed(1)}%`;
const fmtDate = (d) => {
    if (!d) { return '—'; }
    const [y, m, day] = String(d).split('T')[0].split('-');
    return `${day}/${m}/${y}`;
};

const EMPTY_FORM = {
    user_id: '', dni: '', position: '', salary: '', commission_pct: '',
    hire_date: '', end_date: '', is_active: true, notes: '',
};

function Modal({ open, onClose, title, isDark, children }) {
    if (!open) { return null; }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <X size={15} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Index({ auth, items, users, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [search, setSearch] = useState(filters.search ?? '');
    const [active, setActive] = useState(filters.active ?? '');

    const applyFilters = () => router.get(route('employees.index'), {
        search: search || undefined,
        active: active !== '' ? active : undefined,
    }, { preserveState: true, replace: true });

    const clearFilters = () => { setSearch(''); setActive(''); router.get(route('employees.index')); };

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => {
        setEditing(item);
        setForm({
            user_id: String(item.user_id),
            dni: item.dni ?? '',
            position: item.position ?? '',
            salary: item.salary ?? '',
            commission_pct: item.commission_pct ?? '',
            hire_date: item.hire_date ? String(item.hire_date).split('T')[0] : '',
            end_date: item.end_date ? String(item.end_date).split('T')[0] : '',
            is_active: item.is_active ?? true,
            notes: item.notes ?? '',
        });
        setErrors({});
        setModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        setProcessing(true);
        const isEdit = !!editing;
        const url = isEdit ? route('employees.update', editing.id) : route('employees.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, { ...form, is_active: form.is_active ? 1 : 0 }, {
            onSuccess: () => { setModal(false); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    const handleDelete = (item) => {
        confirmDialog(`¿Eliminar a "${item.user?.name}"?`, () =>
            router.delete(route('employees.destroy', item.id), { preserveScroll: true })
        );
    };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const errCls = 'text-red-500 text-xs mt-1';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Personal" />
            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Personal</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Empleados, sueldos y comisiones de insumos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('employee-receipts.index')} className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            Recibos
                        </Link>
                        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={16} /> Nuevo Empleado
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className={`${card} p-4 flex flex-wrap gap-3`}>
                    <div className="relative flex-1 min-w-48">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input type="text" placeholder="Buscar por nombre, DNI o cargo..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            className={`${inputCls} pl-9`} />
                    </div>
                    <select value={active} onChange={e => setActive(e.target.value)} className={`${inputCls} w-44`}>
                        <option value="">Todos</option>
                        <option value="1">Solo activos</option>
                        <option value="0">Solo inactivos</option>
                    </select>
                    <button onClick={applyFilters} className="px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white whitespace-nowrap shrink-0" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>Filtrar</button>
                    <button onClick={clearFilters} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Limpiar</button>
                </div>

                {/* Tabla */}
                <div className={`${card} overflow-hidden`}>
                    {items.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Users size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay empleados registrados</p>
                            <button onClick={openCreate} className="text-sm font-bold" style={{ color: B.teal }}>+ Agregar empleado</button>
                        </div>
                    ) : (
                        <>
                        {/* Mobile cards */}
                        <div className="sm:hidden flex flex-col gap-3 p-4">
                            {items.data.map(item => (
                                <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0">
                                                <p className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.user?.name ?? '—'}</p>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.position ?? '—'}</p>
                                                {item.salary && (
                                                    <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                                                        {fmt(item.salary)}
                                                        {item.commission_pct > 0 && <span className={`ml-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>· {fmtPct(item.commission_pct)} comisión</span>}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                {item.is_active
                                                    ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><CheckCircle size={10} /> Activo</span>
                                                    : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><XCircle size={10} /> Inactivo</span>
                                                }
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Desde: <span className="font-semibold">{fmtDate(item.hire_date)}</span>
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Link href={route('employees.show', item.id)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <Eye size={12} />
                                                </Link>
                                                <button onClick={() => openEdit(item)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <Pencil size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(item)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Nombre', 'DNI', 'Cargo', 'Sueldo base', 'Comisión', 'Desde', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {items.data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className="px-4 py-3">
                                                <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.user?.name ?? '—'}</div>
                                                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.user?.email ?? ''}</div>
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.dni ?? '—'}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.position ?? '—'}</td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                <div className="flex items-center gap-1">
                                                    <BadgeDollarSign size={12} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                                                    {item.salary ? fmt(item.salary) : '—'}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {item.commission_pct > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        <Percent size={11} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                                                        {fmtPct(item.commission_pct)}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(item.hire_date)}</td>
                                            <td className="px-4 py-3">
                                                {item.is_active
                                                    ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><CheckCircle size={10} /> Activo</span>
                                                    : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><XCircle size={10} /> Inactivo</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Link href={route('employees.show', item.id)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                        <Eye size={12} />
                                                    </Link>
                                                    <button onClick={() => openEdit(item)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}

                    <Pagination data={items} />
                </div>
            </div>

            {/* Modal Crear / Editar */}
            <Modal open={modal} onClose={() => setModal(false)} title={editing ? `Editar: ${editing.user?.name}` : 'Nuevo Empleado'} isDark={isDark}>
                <form onSubmit={submitForm} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Usuario CRM *</label>
                        <SearchableSelect
                            options={users.map(u => ({ value: String(u.id), label: `${u.name} (${u.email})` }))}
                            value={form.user_id}
                            onChange={v => setForm(f => ({ ...f, user_id: v }))}
                            placeholder="Seleccionar usuario..."
                            required
                        />
                        {errors.user_id && <p className={errCls}>{errors.user_id}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>DNI</label>
                            <input type="text" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} className={inputCls} placeholder="30123456" />
                        </div>
                        <div>
                            <label className={labelCls}>Cargo</label>
                            <input type="text" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className={inputCls} placeholder="Vendedor, Encargado..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Sueldo base mensual</label>
                            <input type="number" step="0.01" min="0" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} className={inputCls} placeholder="0.00" />
                            {errors.salary && <p className={errCls}>{errors.salary}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Comisión sobre ventas %</label>
                            <input type="number" step="0.01" min="0" max="100" value={form.commission_pct} onChange={e => setForm(f => ({ ...f, commission_pct: e.target.value }))} className={inputCls} placeholder="0" />
                            {errors.commission_pct && <p className={errCls}>{errors.commission_pct}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Fecha de ingreso</label>
                            <input type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Fecha de egreso</label>
                            <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Notas</label>
                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} placeholder="Observaciones..." />
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-teal-500" />
                        Empleado activo
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> {editing ? 'Actualizar' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
