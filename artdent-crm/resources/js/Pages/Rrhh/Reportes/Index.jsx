import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart3, Users, TrendingDown, DollarSign, CalendarX } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import BarChart from '@/Components/Charts/BarChart';
import LineChart from '@/Components/Charts/LineChart';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

export default function Index({ auth, kpis, headcountByDepartment, rotacion, ausentismo, masaSalarial }) {
    const { isDark } = useTheme();
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const rotacionSeries = [
        { id: 'Altas', data: rotacion.map(r => ({ x: r.label, y: r.altas })) },
        { id: 'Bajas', data: rotacion.map(r => ({ x: r.label, y: r.bajas })) },
    ];

    const ausentismoSeries = [
        { id: 'Ausencias (fichaje)', data: ausentismo.map(a => ({ x: a.label, y: a.ausencias_fichaje })) },
        { id: 'Días de licencia', data: ausentismo.map(a => ({ x: a.label, y: a.dias_licencia })) },
    ];

    const masaSalarialSeries = [
        { id: 'Neto', data: masaSalarial.map(m => ({ x: m.label, y: m.neto })) },
        { id: 'Bruto', data: masaSalarial.map(m => ({ x: m.label, y: m.bruto })) },
        { id: 'Costo Empleador', data: masaSalarial.map(m => ({ x: m.label, y: m.costo_empleador })) },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reportes RRHH" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <BarChart3 size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Reportes RRHH</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rotación, ausentismo, masa salarial y KPIs de personal</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Users, label: 'Empleados Activos', value: kpis.active_employees },
                        { icon: TrendingDown, label: 'Antigüedad Promedio', value: `${kpis.avg_tenure_years} años` },
                        { icon: Users, label: 'Altas (12 meses)', value: kpis.hires_last_12_months },
                        { icon: CalendarX, label: 'Bajas (12 meses)', value: kpis.terminations_last_12_months },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className={`${card} p-4`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={14} style={{ color: B.teal }} />
                                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
                            </div>
                            <p className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Dotación por departamento */}
                <div className={`${card} p-5`}>
                    <h2 className={`font-extrabold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Dotación por Departamento</h2>
                    <div style={{ height: 260 }}>
                        <BarChart data={headcountByDepartment} isDark={isDark} />
                    </div>
                </div>

                {/* Rotación */}
                <div className={`${card} p-5`}>
                    <h2 className={`font-extrabold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Rotación de Personal (últimos 6 meses)</h2>
                    <div style={{ height: 260 }}>
                        <LineChart data={rotacionSeries} isDark={isDark} />
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm">
                            <thead className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <tr>
                                    {['Mes', 'Altas', 'Bajas', 'Dotación', 'Rotación %'].map(h => (
                                        <th key={h} className={`px-3 py-2 text-left text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {rotacion.map(r => (
                                    <tr key={r.label}>
                                        <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.label}</td>
                                        <td className="px-3 py-2 text-emerald-500 font-semibold">{r.altas}</td>
                                        <td className="px-3 py-2 text-red-500 font-semibold">{r.bajas}</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.dotacion}</td>
                                        <td className={`px-3 py-2 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{r.rotacion_pct}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ausentismo */}
                <div className={`${card} p-5`}>
                    <h2 className={`font-extrabold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Ausentismo (últimos 6 meses)</h2>
                    <div style={{ height: 260 }}>
                        <LineChart data={ausentismoSeries} isDark={isDark} />
                    </div>
                    <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Ausencias de fichaje (Control Horario) + días de licencia aprobados que se solapan con cada mes.
                    </p>
                </div>

                {/* Masa Salarial */}
                <div className={`${card} p-5`}>
                    <h2 className={`font-extrabold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <DollarSign size={16} /> Masa Salarial (últimos 6 meses)
                    </h2>
                    <div style={{ height: 260 }}>
                        <LineChart data={masaSalarialSeries} isDark={isDark} />
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm">
                            <thead className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <tr>
                                    {['Mes', 'Neto', 'Bruto', 'Costo Empleador'].map(h => (
                                        <th key={h} className={`px-3 py-2 text-left text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {masaSalarial.map(m => (
                                    <tr key={m.label}>
                                        <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{m.label}</td>
                                        <td className={`px-3 py-2 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{fmt(m.neto)}</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmt(m.bruto)}</td>
                                        <td className="px-3 py-2 font-bold" style={{ color: B.teal }}>{fmt(m.costo_empleador)}</td>
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
