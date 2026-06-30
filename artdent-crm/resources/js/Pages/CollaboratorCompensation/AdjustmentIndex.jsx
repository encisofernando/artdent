import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Calendar, X, Check, WalletCards } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', red: '#ef4444' };

const fmt = (value) => Number(value || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const fmtDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-AR') : '—';

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

function AdjustmentForm({ form, collaborators, isEdit = false, isDark, isDiscount }) {
    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

    return (
        <div className="flex flex-col gap-4">
            {!isEdit && (
                <div>
                    <label className={labelClass}>Colaborador *</label>
                    <SearchableSelect
                        value={String(form.data.collaborator_id || '')}
                        onChange={(value) => form.setData('collaborator_id', value)}
                        options={collaborators.map((collaborator) => ({ value: String(collaborator.id), label: collaborator.name }))}
                        placeholder="Seleccionar..."
                        error={form.errors.collaborator_id}
                    />
                </div>
            )}
            <div>
                <label className={labelClass}>Fecha *</label>
                <input type="date" className={inputClass} value={form.data.date} onChange={(event) => form.setData('date', event.target.value)} />
                {form.errors.date && <p className="text-red-500 text-xs mt-1">{form.errors.date}</p>}
            </div>
            <div>
                <label className={labelClass}>Concepto *</label>
                <input
                    type="text"
                    className={inputClass}
                    value={form.data.concept}
                    onChange={(event) => form.setData('concept', event.target.value)}
                    placeholder={isDiscount ? 'Ej. Adelanto, retención, falta...' : 'Ej. Horas extra, viático, presentismo...'}
                />
                {form.errors.concept && <p className="text-red-500 text-xs mt-1">{form.errors.concept}</p>}
            </div>
            <div>
                <label className={labelClass}>Importe *</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass}
                    value={form.data.amount}
                    onChange={(event) => form.setData('amount', event.target.value)}
                    placeholder="0.00"
                />
                {form.errors.amount && <p className="text-red-500 text-xs mt-1">{form.errors.amount}</p>}
            </div>
        </div>
    );
}

export default function AdjustmentIndex({
    auth,
    items,
    collaborators,
    filters,
    summary,
    config,
}) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];
    const today = new Date().toISOString().split('T')[0];
    const { routeBase, pageTitle, title, subtitle, createLabel, emptyTitle, emptyText, amountLabel, isDiscount } = config;

    const [search, setSearch] = useState(filters?.search || '');
    const [collaboratorFilter, setCollaboratorFilter] = useState(filters?.collaborator_id || '');
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canManage = hasPermission('staff.edit');
    const canDelete = hasPermission('staff.delete');
    const showActions = canManage || canDelete;
    const amountTone = isDiscount ? B.red : B.green;
    const amountPrefix = isDiscount ? '-' : '+';

    const createForm = useForm({ collaborator_id: '', date: today, concept: '', amount: '' });
    const editForm = useForm({ date: '', concept: '', amount: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (
            debouncedSearch !== (filters?.search || '') ||
            collaboratorFilter !== (filters?.collaborator_id || '') ||
            from !== (filters?.from || '') ||
            to !== (filters?.to || '')
        ) {
            router.get(route(`${routeBase}.index`), {
                search: debouncedSearch,
                collaborator_id: collaboratorFilter,
                from,
                to,
            }, { preserveState: true, preserveScroll: true, replace: true });
        }
    }, [debouncedSearch, collaboratorFilter, from, to, filters?.search, filters?.collaborator_id, filters?.from, filters?.to, routeBase]);

    const openEdit = (item) => {
        setEditItem(item);
        editForm.setData({
            date: item.date,
            concept: item.concept || '',
            amount: item.amount ?? '',
        });
    };

    const submitCreate = (event) => {
        event.preventDefault();
        createForm.post(route(`${routeBase}.store`), {
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        editForm.put(route(`${routeBase}.update`, editItem.id), {
            onSuccess: () => setEditItem(null),
        });
    };

    const handleDelete = (id) => {
        confirmDialog(`¿Eliminar este ${isDiscount ? 'descuento' : 'extra'}?`, () =>
            router.delete(route(`${routeBase}.destroy`, id), { preserveScroll: true })
        );
    };

    const inputClass = `px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} outline-none`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={pageTitle} />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
                    </div>
                    {canManage && (
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="text-white border-none shadow-md rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={16} />
                            {createLabel}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[
                        { label: isDiscount ? 'Descuentos' : 'Extras', value: summary?.records ?? 0 },
                        { label: 'Colaboradores', value: summary?.collaborators ?? 0 },
                        { label: amountLabel, value: `${amountPrefix}$${fmt(summary?.amount)}` },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className={`rounded-2xl border p-4 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {label}
                                    </p>
                                    <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`} style={label === amountLabel ? { color: amountTone } : undefined}>
                                        {value}
                                    </p>
                                </div>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <WalletCards size={20} style={{ color: amountTone }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            className={`${inputClass} min-w-56`}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por concepto..."
                        />
                    </div>
                    <SearchableSelect
                        value={String(collaboratorFilter || '')}
                        onChange={(value) => setCollaboratorFilter(value)}
                        placeholder="Todos los colaboradores"
                        options={collaborators.map((collaborator) => ({ value: String(collaborator.id), label: collaborator.name }))}
                    />
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <input type="date" className={inputClass} value={from} onChange={(event) => setFrom(event.target.value)} title="Desde" />
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                        <input type="date" className={inputClass} value={to} onChange={(event) => setTo(event.target.value)} title="Hasta" />
                    </div>
                    {(search || collaboratorFilter || from || to) && (
                        <button onClick={() => { setSearch(''); setCollaboratorFilter(''); setFrom(''); setTo(''); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <X size={14} /> Limpiar
                        </button>
                    )}
                    {items?.total > 0 && (
                        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-lg border ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {items.to} de {items.total}
                        </span>
                    )}
                </div>

                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <WalletCards size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{emptyTitle}</h3>
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emptyText}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Colaborador', 'Fecha', 'Concepto', 'Importe', ...(showActions ? [''] : [])].map((header) => (
                                            <th key={header} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map((item) => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.collaborator?.name || '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {fmtDate(item.date)}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {item.concept || '—'}
                                            </td>
                                            <td className="px-4 py-3 font-extrabold" style={{ color: amountTone }}>
                                                {amountPrefix}${fmt(item.amount)}
                                            </td>
                                            {showActions && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-end">
                                                        {canManage && (
                                                            <button onClick={() => openEdit(item)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button onClick={() => handleDelete(item.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className={`flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                            {items.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') : (!link.url ? 'opacity-30 cursor-default' : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'))}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showCreate && canManage && (
                <Modal title={createLabel} onClose={() => setShowCreate(false)}>
                    <form onSubmit={submitCreate}>
                        <AdjustmentForm form={createForm} collaborators={collaborators} isDark={isDark} isDiscount={isDiscount} />
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowCreate(false)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={createForm.processing} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {editItem && canManage && (
                <Modal title={`Editar ${isDiscount ? 'descuento' : 'extra'}`} onClose={() => setEditItem(null)}>
                    <div className={`mb-4 px-3 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {editItem.collaborator?.name}
                    </div>
                    <form onSubmit={submitEdit}>
                        <AdjustmentForm form={editForm} collaborators={collaborators} isEdit isDark={isDark} isDiscount={isDiscount} />
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setEditItem(null)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={editForm.processing} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" />
                                Actualizar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
