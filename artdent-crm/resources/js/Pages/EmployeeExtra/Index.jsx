import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Plus, Search, Trash2, Pencil, X, Save, CirclePlus } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
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

const EMPTY = { employee_id: '', date: '', concept: '', amount: '' };

export default function Index({ auth, items, employees, filters, summary }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [empFilter, setEmpFilter] = useState(filters.employee_id ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyFilters = () => router.get(route('employee-extras.index'), { employee_id: empFilter || undefined, search: search || undefined, from: from || undefined, to: to || undefined }, { preserveState: true, replace: true });
    const clearFilters = () => { setEmpFilter(''); setSearch(''); setFrom(''); setTo(''); router.get(route('employee-extras.index')); };

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [processing, setProcessing] = useState(false);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
    const openEdit = (item) => { setEditing(item); setForm({ employee_id: String(item.employee_id), date: item.date, concept: item.concept, amount: item.amount }); setModal(true); };

    const submitForm = (e) => {
        e.preventDefault();
        setProcessing(true);
        const url = editing ? route('employee-extras.update', editing.id) : route('employee-extras.store');
        const method = editing ? 'put' : 'post';
        router[method](url, form, {
            onSuccess: () => { setModal(false); setProcessing(false); },
            onError: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => { confirmDialog('¿Eliminar este extra?', () => router.delete(route('employee-extras.destroy', id), { preserveScroll: true })); };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const empOptions = [{ value: '', label: 'Todos' }, ...employees.map(e => ({ value: String(e.id), label: e.user?.name ?? `Emp #${e.id}` }))];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Extras de Personal" />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <CirclePlus size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Extras / Adicionales</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{summary.records} registros · Total: ${fmt(summary.amount)}</p>
                        </div>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Plus size={15} /> Nuevo Extra
                    </button>
                </div>

                <div className={`${card} p-4 flex flex-wrap gap-3`}>
                    <div className="w-52"><SearchableSelect options={empOptions} value={String(empFilter)} onChange={setEmpFilter} placeholder="Empleado..." /></div>
                    <div className="relative flex-1 min-w-40">
                        <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className={`${inputCls} pl-9`} placeholder="Concepto..." />
                    </div>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={`${inputCls} w-36`} />
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} className={`${inputCls} w-36`} />
                    <button onClick={applyFilters} className="px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white whitespace-nowrap shrink-0" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>Filtrar</button>
                    <button onClick={clearFilters} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Limpiar</button>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden flex flex-col gap-3">
                    {items.data.length === 0 ? (
                        <div className={`rounded-2xl border p-10 text-center text-sm ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>Sin registros</div>
                    ) : items.data.map(item => (
                        <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-bold text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.employee?.user?.name ?? '—'}</p>
                                        <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.concept}</p>
                                    </div>
                                    <p className={`font-extrabold text-base shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+${fmt(item.amount)}</p>
                                </div>
                                <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDate(item.date)}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(item)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Pencil size={12} /></button>
                                        <button onClick={() => handleDelete(item.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className={`hidden sm:block ${card} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                    {['Empleado', 'Fecha', 'Concepto', 'Importe', ''].map(h => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {items.data.length === 0 ? (
                                    <tr><td colSpan="5" className={`px-4 py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin registros</td></tr>
                                ) : items.data.map(item => (
                                    <tr key={item.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                        <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.employee?.user?.name ?? '—'}</td>
                                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(item.date)}</td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.concept}</td>
                                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+${fmt(item.amount)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(item)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Pencil size={12} /></button>
                                                <button onClick={() => handleDelete(item.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Extra' : 'Nuevo Extra'} isDark={isDark}>
                <form onSubmit={submitForm} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Empleado *</label><SearchableSelect options={employees.map(e => ({ value: String(e.id), label: e.user?.name ?? `Emp #${e.id}` }))} value={form.employee_id} onChange={v => setForm(f => ({ ...f, employee_id: v }))} placeholder="Seleccionar..." required /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Fecha *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} required /></div>
                        <div><label className={labelCls}>Importe *</label><input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} required /></div>
                    </div>
                    <div><label className={labelCls}>Concepto *</label><input type="text" value={form.concept} onChange={e => setForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} placeholder="Premio, Bono..." required /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}><Save size={14} /> Guardar</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
