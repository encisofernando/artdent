import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { ArrowLeft, Wallet, CheckCircle2, DollarSign, Lock, Trash2, FileText } from 'lucide-react';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

const STATUS_BADGE = {
    draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    calculated: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    closed: 'bg-slate-700/10 text-slate-600 border-slate-500/20',
};
const STATUS_LABEL = { draft: 'Borrador', calculated: 'Calculada', approved: 'Aprobada', paid: 'Pagada', closed: 'Cerrada' };
const RECEIPT_STATUS_LABEL = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };
const TYPE_LABEL = { mensual: 'Mensual', sac: 'SAC / Aguinaldo', final: 'Liquidación final' };

export default function Show({ auth, run }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const permissions = usePage().props.auth.user.permissions ?? [];
    const isSuperAdmin = usePage().props.auth.user.is_super_admin;
    const canApprove = isSuperAdmin || permissions.includes('rrhh.liquidaciones.approve');
    const canRun = isSuperAdmin || permissions.includes('rrhh.liquidaciones.run');
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    const totalNet = run.receipts.reduce((s, r) => s + parseFloat(r.net), 0);

    const transition = (status, confirmMsg) => {
        const doIt = () => router.put(route('payroll-runs.update', run.id), { status });
        if (confirmMsg) { confirmDialog(confirmMsg, doIt); } else { doIt(); }
    };

    const handleDelete = () => {
        confirmDialog('¿Eliminar esta liquidación y sus recibos en borrador?', () => router.delete(route('payroll-runs.destroy', run.id)));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Liquidación ${fmtDate(run.period_from)} – ${fmtDate(run.period_to)}`} />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                <div className="flex items-center gap-3">
                    <Link href={route('payroll-runs.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Wallet size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className={`text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmtDate(run.period_from)} – {fmtDate(run.period_to)}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{TYPE_LABEL[run.type]} · generada por {run.generated_by?.name ?? run.generatedBy?.name ?? '—'}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_BADGE[run.status]}`}>{STATUS_LABEL[run.status]}</span>
                </div>

                <div className={`${card} p-5 grid grid-cols-2 sm:grid-cols-4 gap-4`}>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Empleados</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{run.receipts.length}</p>
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total neto</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{fmt(totalNet)}</p>
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sucursal</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{run.branch?.name ?? 'Todas'}</p>
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Aprobada por</p>
                        <p className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{run.approved_by?.name ?? run.approvedBy?.name ?? '—'}</p>
                    </div>
                </div>

                {/* Acciones de estado */}
                {canApprove && run.status !== 'closed' && (
                    <div className={`${card} p-4 flex flex-wrap items-center gap-2`}>
                        {run.status === 'calculated' && (
                            <button onClick={() => transition('approved', '¿Aprobar esta liquidación? Los recibos quedarán listos para pagar.')} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <CheckCircle2 size={14} /> Aprobar
                            </button>
                        )}
                        {run.status === 'approved' && (
                            <button onClick={() => transition('paid', '¿Marcar todos los recibos como pagados? Esto generará los gastos contables correspondientes.')} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg, #2E7D32, #43A047)' }}>
                                <DollarSign size={14} /> Marcar como Pagada
                            </button>
                        )}
                        {run.status === 'paid' && (
                            <button onClick={() => transition('closed', '¿Cerrar esta liquidación? No podrá modificarse luego.')} className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold border ${isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700'}`}>
                                <Lock size={14} /> Cerrar
                            </button>
                        )}
                        {canRun && (run.status === 'draft' || run.status === 'calculated') && (
                            <button onClick={handleDelete} className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold ml-auto ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}>
                                <Trash2 size={14} /> Eliminar
                            </button>
                        )}
                    </div>
                )}

                <div className={`${card} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                    {['Empleado', 'Sueldo', 'Comisión', 'Conceptos', 'Extras', 'Desc.', 'Neto', 'Estado', ''].map(h => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {run.receipts.map(r => (
                                    <tr key={r.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                        <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{r.employee?.user?.name ?? '—'}</td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fmt(r.salary_gross)}</td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{fmt(r.commission_gross)}</td>
                                        <td className={`px-4 py-3 ${r.concepts_total >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-red-400' : 'text-red-600')}`}>{fmt(r.concepts_total)}</td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{fmt(r.extras_total)}</td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{fmt(r.discounts_total)}</td>
                                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(r.net)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_BADGE[r.status] ?? ''}`}>{RECEIPT_STATUS_LABEL[r.status] ?? r.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={route('employee-receipts.show', r.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                <FileText size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
