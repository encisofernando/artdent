import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { UserCircle, FileText, Plane, IdCard, ArrowRight } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

const STATUS_LABEL = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };

export default function Index({ auth, employee, recentReceipts, vacationBalance, pendingRequests }) {
    const { isDark } = useTheme();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Portal" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <UserCircle size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Hola, {employee.user?.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{employee.job_position?.name || employee.position || 'Sin cargo asignado'} {employee.department?.name && `· ${employee.department.name}`}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Vacaciones Disponibles</p>
                        <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{vacationBalance?.remaining_days ?? '—'}</p>
                        {vacationBalance && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>de {vacationBalance.accrued_days} días este año</p>}
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Solicitudes Pendientes</p>
                        <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{pendingRequests}</p>
                    </div>
                    <div className={`${card} p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Legajo N°</p>
                        <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{String(employee.id).padStart(4, '0')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href={route('portal.recibos')} className={`${card} p-5 flex items-center justify-between hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center gap-3">
                            <FileText size={20} style={{ color: B.teal }} />
                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mis Recibos</span>
                        </div>
                        <ArrowRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    </Link>
                    <Link href={route('portal.licencias')} className={`${card} p-5 flex items-center justify-between hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center gap-3">
                            <Plane size={20} style={{ color: B.teal }} />
                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mis Licencias</span>
                        </div>
                        <ArrowRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    </Link>
                    <Link href={route('portal.legajo')} className={`${card} p-5 flex items-center justify-between hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center gap-3">
                            <IdCard size={20} style={{ color: B.teal }} />
                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Mi Legajo</span>
                        </div>
                        <ArrowRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    </Link>
                </div>

                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Últimos Recibos</h2>
                    </div>
                    {(!recentReceipts || recentReceipts.length === 0) ? (
                        <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no tenés recibos generados.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/30">
                            {recentReceipts.map(r => (
                                <div key={r.id} className="px-5 py-3 flex items-center justify-between text-sm">
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{fmtDate(r.period_from)} – {fmtDate(r.period_to)}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(r.net)}</span>
                                        <span className="text-xs opacity-70">{STATUS_LABEL[r.status]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
