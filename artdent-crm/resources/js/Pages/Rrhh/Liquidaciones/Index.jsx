import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Wallet, Plus, Users } from 'lucide-react';

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
const TYPE_LABEL = { mensual: 'Mensual', sac: 'SAC / Aguinaldo', final: 'Liquidación final' };

export default function Index({ auth, runs }) {
    const { isDark } = useTheme();
    const permissions = usePage().props.auth.user.permissions ?? [];
    const isSuperAdmin = usePage().props.auth.user.is_super_admin;
    const canRun = isSuperAdmin || permissions.includes('rrhh.liquidaciones.run');
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Liquidaciones de Sueldos" />
            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Wallet size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Liquidaciones de Sueldos</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Liquidación masiva por período, con motor de fórmulas</p>
                        </div>
                    </div>
                    {canRun && (
                        <Link href={route('payroll-runs.create')} className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={16} /> Nueva Liquidación
                        </Link>
                    )}
                </div>

                <div className={`${card} overflow-hidden`}>
                    {runs.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Wallet size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sin liquidaciones generadas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Período', 'Tipo', 'Empleados', 'Total neto', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {runs.data.map(run => (
                                        <tr key={run.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fmtDate(run.period_from)} – {fmtDate(run.period_to)}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{TYPE_LABEL[run.type]}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                <span className="inline-flex items-center gap-1"><Users size={12} /> {run.receipts_count}</span>
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(run.receipts_sum_net)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_BADGE[run.status]}`}>{STATUS_LABEL[run.status]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={route('payroll-runs.show', run.id)} className="text-xs font-bold" style={{ color: B.teal }}>Ver detalle →</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination data={runs} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
