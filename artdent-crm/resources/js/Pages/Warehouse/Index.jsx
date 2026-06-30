import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Search, Plus, Pencil, Trash2, Warehouse as WarehouseIcon, X, Save, CheckCircle, XCircle } from 'lucide-react';

/* ─── Modal genérico ────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, isDark }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
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

const EMPTY_FORM = { name: '', code: '', address: '', is_active: true };

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    /* ── Filtros ── */
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = () => router.get(route('warehouses.index'), { search: search || undefined }, { preserveState: true, replace: true });
    const clearFilters = () => { setSearch(''); router.get(route('warehouses.index')); };

    /* ── Modal crear / editar ── */
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null); // null = crear
    const [form, setForm] = useState(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name, code: item.code ?? '', address: item.address ?? '', is_active: item.is_active ?? true });
        setErrors({});
        setModal(true);
    };

    const closeModal = () => { setModal(false); setEditing(null); };

    const submitForm = (e) => {
        e.preventDefault();
        setProcessing(true);
        const url = editing ? route('warehouses.update', editing.id) : route('warehouses.store');
        const method = editing ? 'put' : 'post';
        router[method](url, form, {
            onSuccess: () => { closeModal(); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    /* ── Eliminar ── */
    const handleDelete = (item) => {
        confirmDialog(`¿Eliminar el depósito "${item.name}"? Solo se puede eliminar si no tiene stock.`, () => {
            router.delete(route('warehouses.destroy', item.id), { preserveScroll: true });
        });
    };

    /* ── Estilos ── */
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const errCls = 'text-red-500 text-xs mt-1';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Depósitos" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <WarehouseIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Depósitos</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Administración de almacenes y depósitos</p>
                        </div>
                    </div>
                    <button onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Plus size={16} /> Nuevo Depósito
                    </button>
                </div>

                {/* Filtros */}
                <div className={`${card} p-4 flex gap-3`}>
                    <div className="relative flex-1">
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input type="text" placeholder="Buscar por nombre, código o dirección..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            className={`${inputCls} pl-9`} />
                    </div>
                    <button onClick={applyFilters} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>Filtrar</button>
                    <button onClick={clearFilters} className={`px-4 py-2 rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Limpiar</button>
                </div>

                {/* Tabla */}
                <div className={`${card} overflow-hidden`}>
                    {items.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <WarehouseIcon size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay depósitos registrados</p>
                            <button onClick={openCreate} className="mt-3 text-sm font-bold" style={{ color: B.teal }}>
                                + Crear primer depósito
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Nombre', 'Código', 'Dirección', 'Stock registros', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {items.data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</td>
                                            <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.code ?? '—'}</td>
                                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.address ?? '—'}</td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.stocks_count ?? 0}</td>
                                            <td className="px-4 py-3">
                                                {item.is_active
                                                    ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><CheckCircle size={10} /> Activo</span>
                                                    : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><XCircle size={10} /> Inactivo</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
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
                    )}

                    {items.last_page > 1 && (
                        <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                            <span className="text-xs">Mostrando {items.from}–{items.to} de {items.total}</span>
                            <div className="flex gap-1">
                                {items.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${link.active ? 'text-white' : ''} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        style={link.active ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` } : {}}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Modal Crear / Editar ─── */}
            <Modal open={modal} onClose={closeModal} title={editing ? `Editar: ${editing.name}` : 'Nuevo Depósito'} isDark={isDark}>
                <form onSubmit={submitForm} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Nombre *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className={inputCls} placeholder="Ej: Depósito Principal" required />
                        {errors.name && <p className={errCls}>{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Código</label>
                            <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                className={inputCls} placeholder="DEP-01" />
                            {errors.code && <p className={errCls}>{errors.code}</p>}
                        </div>
                        <div className="flex flex-col justify-end pb-0.5">
                            <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                    className="rounded accent-teal-500" />
                                Depósito activo
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Dirección</label>
                        <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            className={inputCls} placeholder="Calle, número, ciudad..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={closeModal}
                            className={`px-4 py-2 rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> {editing ? 'Actualizar' : 'Crear Depósito'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
