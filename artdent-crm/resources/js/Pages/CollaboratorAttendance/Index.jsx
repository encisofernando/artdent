import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Clock, Calendar, X, Check } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const METHOD_LABELS = { biometric: 'Biométrico', manual: 'Manual', system: 'Sistema', webauthn: 'Huella' };
const METHOD_COLORS = {
    biometric: 'bg-blue-500/10 text-blue-500',
    manual: 'bg-amber-500/10 text-amber-500',
    system: 'bg-slate-500/10 text-slate-400',
    webauthn: 'bg-green-500/10 text-green-500',
};

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

function AttendanceForm({ form, collaborators, isEdit = false, isDark }) {
    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

    return (
        <div className="flex flex-col gap-4">
            {!isEdit && (
                <div>
                    <label className={labelClass}>Colaborador *</label>
                    <SearchableSelect
                        value={form.data.collaborator_id}
                        onChange={v => form.setData('collaborator_id', v)}
                        options={collaborators.map(c => ({ value: String(c.id), label: c.name }))}
                        placeholder="Seleccionar..."
                        error={form.errors.collaborator_id}
                    />
                </div>
            )}
            <div>
                <label className={labelClass}>Fecha *</label>
                <input type="date" className={inputClass} value={form.data.work_date} onChange={e => form.setData('work_date', e.target.value)} />
                {form.errors.work_date && <p className="text-red-500 text-xs mt-1">{form.errors.work_date}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Entrada *</label>
                    <input type="time" className={inputClass} value={form.data.time_in} onChange={e => form.setData('time_in', e.target.value)} />
                    {form.errors.time_in && <p className="text-red-500 text-xs mt-1">{form.errors.time_in}</p>}
                </div>
                <div>
                    <label className={labelClass}>Salida</label>
                    <input type="time" className={inputClass} value={form.data.time_out} onChange={e => form.setData('time_out', e.target.value)} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Método</label>
                <SearchableSelect
                    value={form.data.method}
                    onChange={v => form.setData('method', v)}
                    options={[
                        { value: 'manual', label: 'Manual' },
                        { value: 'biometric', label: 'Biométrico' },
                        { value: 'webauthn', label: 'Huella' },
                        { value: 'system', label: 'Sistema' },
                    ]}
                />
            </div>
            <div>
                <label className={labelClass}>Notas</label>
                <textarea className={inputClass} rows={2} value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} placeholder="Observaciones..." />
            </div>
        </div>
    );
}

export default function Index({ auth, items, collaborators, filters, summary }) {
    const { isDark } = useTheme();
    const data = items?.data || [];

    const [collaboratorFilter, setCollaboratorFilter] = useState(filters?.collaborator_id || '');
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canCreate = hasPermission('staff.edit');
    const canEdit = hasPermission('staff.edit');
    const canDelete = hasPermission('staff.delete');
    const showActions = canEdit || canDelete;

    const today = new Date().toISOString().split('T')[0];

    const createForm = useForm({ collaborator_id: '', work_date: today, time_in: '', time_out: '', method: 'manual', notes: '' });
    const editForm = useForm({ work_date: '', time_in: '', time_out: '', method: 'manual', notes: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                collaboratorFilter !== (filters?.collaborator_id || '') ||
                from !== (filters?.from || '') ||
                to !== (filters?.to || '')
            ) {
                router.get(route('collaborator-attendances.index'), {
                    collaborator_id: collaboratorFilter,
                    from,
                    to,
                }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [collaboratorFilter, from, to, filters?.collaborator_id, filters?.from, filters?.to]);

    const openEdit = (item) => {
        setEditItem(item);
        editForm.setData({
            work_date: item.work_date,
            time_in: (item.time_in || '').substring(0, 5),
            time_out: (item.time_out || '').substring(0, 5),
            method: item.method || 'manual',
            notes: item.notes || '',
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('collaborator-attendances.store'), {
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(route('collaborator-attendances.update', editItem.id), {
            onSuccess: () => setEditItem(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este registro de asistencia?')) {
            router.delete(route('collaborator-attendances.destroy', id), { preserveScroll: true });
        }
    };

    const inputClass = `px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} outline-none`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asistencias" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Asistencias</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Registro de fichajes de colaboradores</p>
                    </div>
                    {canCreate && (
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="text-white border-none shadow-md rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={16} />
                            Nuevo Registro
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { label: 'Registros', value: summary?.records ?? 0 },
                        { label: 'Colaboradores', value: summary?.collaborators ?? 0 },
                        { label: 'Horas', value: `${summary?.hours ?? 0}h` },
                        { label: 'Importe', value: `$${fmt(summary?.amount)}` },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className={`rounded-2xl border p-4 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`}
                        >
                            <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {label}
                            </p>
                            <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <SearchableSelect
                            value={collaboratorFilter}
                            onChange={v => setCollaboratorFilter(v)}
                            options={collaborators.map(c => ({ value: String(c.id), label: c.name }))}
                            placeholder="Todos los colaboradores"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <input type="date" className={inputClass} value={from} onChange={e => setFrom(e.target.value)} title="Desde" />
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                        <input type="date" className={inputClass} value={to} onChange={e => setTo(e.target.value)} title="Hasta" />
                    </div>
                    {(collaboratorFilter || from || to) && (
                        <button onClick={() => { setCollaboratorFilter(''); setFrom(''); setTo(''); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
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
                            <Clock size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sin registros</h3>
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay asistencias con los filtros aplicados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Colaborador', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Importe', 'Método', ...(showActions ? [''] : [])].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.collaborator?.name || '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {fmtDate(item.work_date)}
                                            </td>
                                            <td className={`px-4 py-3 font-mono ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                                {(item.time_in || '').substring(0, 5) || '—'}
                                            </td>
                                            <td className={`px-4 py-3 font-mono ${item.time_out ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-600' : 'text-slate-300')}`}>
                                                {(item.time_out || '').substring(0, 5) || '—'}
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.hours != null ? `${item.hours}h` : '—'}
                                            </td>
                                            <td className="px-4 py-3 font-bold" style={{ color: B.blue }}>
                                                {item.amount != null ? `$${fmt(item.amount)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${METHOD_COLORS[item.method] || 'bg-slate-500/10 text-slate-400'}`}>
                                                    {METHOD_LABELS[item.method] || item.method || '—'}
                                                </span>
                                            </td>
                                            {showActions && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-end">
                                                        {canEdit && (
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
                            {items.links.map((link, i) => (
                                <button
                                    key={i}
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

            {showCreate && canCreate && (
                <Modal title="Nuevo Registro de Asistencia" onClose={() => setShowCreate(false)}>
                    <form onSubmit={submitCreate}>
                        <AttendanceForm form={createForm} collaborators={collaborators} isDark={isDark} />
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

            {editItem && canEdit && (
                <Modal title="Editar Asistencia" onClose={() => setEditItem(null)}>
                    <div className={`mb-4 px-3 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {editItem.collaborator?.name}
                    </div>
                    <form onSubmit={submitEdit}>
                        <AttendanceForm form={editForm} collaborators={collaborators} isEdit isDark={isDark} />
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
