import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, Plus, Printer, Trash2, FileText, X, Check, CheckCircle } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => {
    if (!d) { return '—'; }
    const parts = String(d).split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const STATUS_LABELS = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };
const STATUS_COLORS = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paid: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
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

export default function Index({ auth, items, collaborators, filters, summary }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [collaboratorFilter, setCollaboratorFilter] = useState(filters?.collaborator_id || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [showCreate, setShowCreate] = useState(false);
    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canManage = hasPermission('staff.edit');
    const canDelete = hasPermission('staff.delete');
    const showActions = canManage || canDelete;

    const createForm = useForm({
        collaborator_id: '',
        period_from: '',
        period_to: '',
        notes: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                collaboratorFilter !== (filters?.collaborator_id || '') ||
                statusFilter !== (filters?.status || '')
            ) {
                router.get(route('collaborator-receipts.index'), {
                    collaborator_id: collaboratorFilter,
                    status: statusFilter,
                }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [collaboratorFilter, statusFilter, filters?.collaborator_id, filters?.status]);

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('collaborator-receipts.store'), {
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    };

    const markPaid = (item) => {
        confirmDialog(`¿Marcar el recibo de ${item.collaborator?.name} como pagado?`, () =>
            router.put(route('collaborator-receipts.update', item.id), {
                status: 'paid',
                notes: item.notes,
            }, { preserveScroll: true })
        );
    };

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar este recibo?', () =>
            router.delete(route('collaborator-receipts.destroy', id), { preserveScroll: true })
        );
    };

    const inputClass = `px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} outline-none`;
    const formInputClass = `w-full px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-slate-500' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Recibos de Colaboradores" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Recibos</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recibos de sueldo de colaboradores</p>
                    </div>
                    {canManage && (
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="text-white border-none shadow-md rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={16} />
                            Generar Recibo
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { label: 'Recibos', value: summary?.receipts ?? 0 },
                        { label: 'Neto total', value: `$${fmt(summary?.net)}` },
                        { label: 'Pagados', value: `$${fmt(summary?.paid)}` },
                        { label: 'Pendientes', value: `$${fmt(summary?.draft)}` },
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
                            value={String(collaboratorFilter || '')}
                            onChange={v => setCollaboratorFilter(v)}
                            placeholder="Todos los colaboradores"
                            options={collaborators.map(c => ({ value: String(c.id), label: c.name }))}
                        />
                    </div>
                    <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                        {[
                            { id: '', label: 'Todos' },
                            { id: 'draft', label: 'Borrador' },
                            { id: 'paid', label: 'Pagados' },
                            { id: 'cancelled', label: 'Cancelados' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statusFilter === tab.id ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm') : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {items?.total > 0 && (
                        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-lg border ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {items.to} de {items.total}
                        </span>
                    )}
                </div>

                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <FileText size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sin recibos</h3>
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay recibos generados aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Colaborador', 'Período', 'Días', 'Horas', 'Bruto', 'Extras', 'Descuentos', 'Neto', 'Estado', ...(showActions ? [''] : [])].map(h => (
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
                                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                <div>{fmtDate(item.period_from)}</div>
                                                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>{fmtDate(item.period_to)}</div>
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {item.days_worked ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.hours != null ? `${item.hours}h` : '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                ${fmt(item.gross)}
                                            </td>
                                            <td className={`px-4 py-3 ${item.extras_total > 0 ? 'text-green-500' : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                                                {item.extras_total > 0 ? `+$${fmt(item.extras_total)}` : '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${item.discounts_total > 0 ? 'text-red-400' : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                                                {item.discounts_total > 0 ? `-$${fmt(item.discounts_total)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 font-extrabold text-base" style={{ color: B.blue }}>
                                                ${fmt(item.net)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_COLORS[item.status] || 'bg-slate-500/10 text-slate-400'}`}>
                                                    {STATUS_LABELS[item.status] || item.status}
                                                </span>
                                            </td>
                                            {showActions && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-end">
                                                        {canManage && (
                                                            <Link href={route('collaborator-receipts.show', item.id)}>
                                                                <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`} title="Ver / Imprimir">
                                                                    <Printer size={14} />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {canManage && item.status === 'draft' && (
                                                            <button onClick={() => markPaid(item)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title="Marcar Pagado">
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button onClick={() => handleDelete(item.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`} title="Eliminar">
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

                <Pagination data={items} />
            </div>

            {showCreate && canManage && (
                <Modal title="Generar Recibo" onClose={() => setShowCreate(false)}>
                    <form onSubmit={submitCreate}>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelClass}>Colaborador *</label>
                                <SearchableSelect
                                    value={String(createForm.data.collaborator_id || '')}
                                    onChange={v => createForm.setData('collaborator_id', v)}
                                    placeholder="Seleccionar..."
                                    options={collaborators.map(c => ({ value: String(c.id), label: c.name }))}
                                />
                                {createForm.errors.collaborator_id && <p className="text-red-500 text-xs mt-1">{createForm.errors.collaborator_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Desde *</label>
                                    <input type="date" className={formInputClass} value={createForm.data.period_from} onChange={e => createForm.setData('period_from', e.target.value)} />
                                    {createForm.errors.period_from && <p className="text-red-500 text-xs mt-1">{createForm.errors.period_from}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Hasta *</label>
                                    <input type="date" className={formInputClass} value={createForm.data.period_to} onChange={e => createForm.setData('period_to', e.target.value)} />
                                    {createForm.errors.period_to && <p className="text-red-500 text-xs mt-1">{createForm.errors.period_to}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Notas</label>
                                <textarea className={formInputClass} rows={2} value={createForm.data.notes} onChange={e => createForm.setData('notes', e.target.value)} placeholder="Observaciones opcionales..." />
                            </div>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Se calcularán automáticamente las horas, extras y descuentos del período seleccionado.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowCreate(false)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={createForm.processing} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" />
                                Generar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
