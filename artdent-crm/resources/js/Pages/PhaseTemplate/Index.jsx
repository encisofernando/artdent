import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Plus, Pencil, Trash2, Layers, X, Save, CheckCircle, XCircle } from 'lucide-react';

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

const B = { blue: '#397B9C', teal: '#49949C' };
const EMPTY_FORM = { name: '', price: '', is_active: true };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

export default function Index({ items }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => { setEditing(item); setForm({ name: item.name, price: item.price, is_active: item.is_active }); setErrors({}); setModal(true); };
    const closeModal = () => { setModal(false); setEditing(null); };

    const submitForm = (e) => {
        e.preventDefault();
        setProcessing(true);
        const url = editing ? route('phase-templates.update', editing.id) : route('phase-templates.store');
        const method = editing ? 'put' : 'post';
        router[method](url, form, {
            onSuccess: () => { closeModal(); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    const handleDelete = (item) => {
        confirmDialog(`¿Eliminar la fase "${item.name}" del catálogo? Solo se puede si ningún arancel la usa.`, () => {
            router.delete(route('phase-templates.destroy', item.id));
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Catálogo de Fases" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Layers size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Catálogo de Fases</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Definí cada fase de producción una sola vez — se asigna a los aranceles desde ahí</p>
                        </div>
                    </div>
                    <button onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white shadow-md"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Plus size={16} /> Nueva Fase
                    </button>
                </div>

                <div className={`${card} overflow-hidden`}>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Layers size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay fases en el catálogo</p>
                            <button onClick={openCreate} className="mt-3 text-sm font-bold" style={{ color: B.teal }}>+ Crear primera fase</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/20">
                            {items.map((item) => (
                                <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.name}</p>
                                            {item.is_active
                                                ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}><CheckCircle size={10} /> Activa</span>
                                                : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}><XCircle size={10} /> Inactiva</span>
                                            }
                                        </div>
                                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Usada en {item.tariff_phases_count} arancel{item.tariff_phases_count === 1 ? '' : 'es'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-bold text-sm" style={{ color: B.teal }}>$ {fmt(item.price)}</span>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal open={modal} onClose={closeModal} title={editing ? `Editar: ${editing.name}` : 'Nueva Fase'} isDark={isDark}>
                <form onSubmit={submitForm} className="flex flex-col gap-4">
                    {editing && editing.tariff_phases_count > 0 && (
                        <p className={`text-xs px-3 py-2 rounded-lg ${isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                            Esta fase se usa en {editing.tariff_phases_count} arancel{editing.tariff_phases_count === 1 ? '' : 'es'}. Al guardar, se actualiza el precio ahí también.
                        </p>
                    )}
                    <div>
                        <label className={labelCls}>Nombre *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toUpperCase() }))}
                            className={inputCls} placeholder="Ej: FRESADO" required />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Precio *</label>
                        <input type="number" step="0.01" min="0" value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            className={inputCls} placeholder="0.00" required />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                            className="rounded accent-teal-500" />
                        Fase activa (disponible para asignar)
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={closeModal}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> {editing ? 'Actualizar' : 'Crear Fase'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
