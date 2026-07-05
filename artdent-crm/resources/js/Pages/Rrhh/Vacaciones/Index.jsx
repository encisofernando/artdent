import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plane, Plus, Check, X, Trash2, Calendar, Ban } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

const STATUS_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada', cancelled: 'Cancelada' };
const STATUS_COLOR = {
    pending: 'bg-amber-500/10 text-amber-500',
    approved: 'bg-emerald-500/10 text-emerald-500',
    rejected: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-slate-500/10 text-slate-400',
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

export default function Index({ auth, leaveTypes, employees, balances, requests, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = requests?.data || [];

    const [year, setYear] = useState(filters?.year || new Date().getFullYear());
    const [employeeFilter, setEmployeeFilter] = useState(filters?.employee_id || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [showCreate, setShowCreate] = useState(false);

    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canRequest = hasPermission('staff.edit');
    const canApprove = hasPermission('rrhh.leaves.approve');

    const createForm = useForm({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', notes: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                year !== (filters?.year || new Date().getFullYear()) ||
                employeeFilter !== (filters?.employee_id || '') ||
                statusFilter !== (filters?.status || '')
            ) {
                router.get(route('vacaciones.index'), { year, employee_id: employeeFilter, status: statusFilter }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [year, employeeFilter, statusFilter, filters?.year, filters?.employee_id, filters?.status]);

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('leave-requests.store'), {
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    };

    const changeStatus = (request, status) => {
        const labels = { approved: 'aprobar', rejected: 'rechazar', cancelled: 'cancelar' };
        confirmDialog(`¿Confirmás ${labels[status]} esta solicitud?`, () =>
            router.put(route('leave-requests.update', request.id), { status }, { preserveScroll: true })
        );
    };

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar esta solicitud?', () =>
            router.delete(route('leave-requests.destroy', id), { preserveScroll: true })
        );
    };

    const inputClass = `px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Vacaciones y Licencias" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Plane size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Vacaciones y Licencias</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saldos y solicitudes de licencia del personal</p>
                        </div>
                    </div>
                    {canRequest && (
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="text-white border-none shadow-md rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={16} />
                            Nueva Solicitud
                        </Button>
                    )}
                </div>

                {/* Saldos de vacaciones */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Saldo de Vacaciones — {year}</h2>
                        <select value={year} onChange={e => setYear(Number(e.target.value))} className={inputClass}>
                            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {(!balances || balances.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin empleados activos.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Empleado', 'Días Otorgados', 'Días Usados', 'Días Disponibles'].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {balances.map(b => (
                                        <tr key={b.employee_id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{b.employee_name}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.accrued_days}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.used_days}</td>
                                            <td className="px-4 py-2.5 font-bold" style={{ color: b.remaining_days > 0 ? B.teal : undefined }}>{b.remaining_days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Filtros de solicitudes */}
                <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <SearchableSelect
                        value={employeeFilter}
                        onChange={v => setEmployeeFilter(v)}
                        options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))}
                        placeholder="Todos los empleados"
                    />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass}>
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {(employeeFilter || statusFilter) && (
                        <button onClick={() => { setEmployeeFilter(''); setStatusFilter(''); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <X size={14} /> Limpiar
                        </button>
                    )}
                </div>

                {/* Solicitudes */}
                {data.length === 0 ? (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Calendar size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Sin solicitudes</h3>
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay solicitudes de licencia con los filtros aplicados</p>
                        </div>
                    </div>
                ) : (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Empleado', 'Tipo', 'Desde', 'Hasta', 'Días', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map(item => (
                                        <tr key={item.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.employee?.user?.name || '—'}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.leave_type?.name}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(item.start_date)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(item.end_date)}</td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.days_count}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 justify-end">
                                                    {canApprove && item.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => changeStatus(item, 'approved')} title="Aprobar" className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={() => changeStatus(item, 'rejected')} title="Rechazar" className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {canApprove && item.status === 'approved' && (
                                                        <button onClick={() => changeStatus(item, 'cancelled')} title="Cancelar" className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-500/10 text-slate-400 hover:bg-slate-500/20">
                                                            <Ban size={14} />
                                                        </button>
                                                    )}
                                                    {item.status === 'pending' && (
                                                        <button onClick={() => handleDelete(item.id)} title="Eliminar" className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Pagination data={requests} />
            </div>

            {showCreate && canRequest && (
                <Modal title="Nueva Solicitud de Licencia" onClose={() => setShowCreate(false)}>
                    <form onSubmit={submitCreate} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Empleado *</label>
                            <SearchableSelect
                                value={createForm.data.employee_id}
                                onChange={v => createForm.setData('employee_id', v)}
                                options={employees.map(e => ({ value: String(e.id), label: e.user?.name || `Empleado #${e.id}` }))}
                                placeholder="Seleccionar..."
                                error={createForm.errors.employee_id}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Tipo de Licencia *</label>
                            <SearchableSelect
                                value={createForm.data.leave_type_id}
                                onChange={v => createForm.setData('leave_type_id', v)}
                                options={leaveTypes.map(t => ({ value: String(t.id), label: t.name }))}
                                placeholder="Seleccionar..."
                                error={createForm.errors.leave_type_id}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Desde *</label>
                                <input type="date" className={`w-full ${inputClass}`} value={createForm.data.start_date} onChange={e => createForm.setData('start_date', e.target.value)} />
                                {createForm.errors.start_date && <p className="text-red-500 text-xs mt-1">{createForm.errors.start_date}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Hasta *</label>
                                <input type="date" className={`w-full ${inputClass}`} value={createForm.data.end_date} onChange={e => createForm.setData('end_date', e.target.value)} />
                                {createForm.errors.end_date && <p className="text-red-500 text-xs mt-1">{createForm.errors.end_date}</p>}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Notas</label>
                            <textarea className={`w-full ${inputClass}`} rows={2} value={createForm.data.notes} onChange={e => createForm.setData('notes', e.target.value)} placeholder="Observaciones..." />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowCreate(false)} className={`flex-1 py-2.5 min-h-[40px] rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={createForm.processing} className="flex-1 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Check size={14} className="inline mr-1" />
                                Solicitar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
