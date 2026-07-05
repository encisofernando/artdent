import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FileText, Download } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };
const STATUS_LABEL = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };
const STATUS_COLOR = {
    draft: 'bg-amber-500/10 text-amber-500',
    paid: 'bg-emerald-500/10 text-emerald-500',
    cancelled: 'bg-red-500/10 text-red-400',
};

export default function MisRecibos({ auth, receipts }) {
    const { isDark } = useTheme();
    const data = receipts?.data || [];
    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Recibos" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <FileText size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Mis Recibos</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Historial de recibos de sueldo</p>
                    </div>
                </div>

                {data.length === 0 ? (
                    <div className={`${card} p-12 text-center`}>
                        <FileText size={40} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no tenés recibos generados.</p>
                    </div>
                ) : (
                    <div className={`${card} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className={`border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <tr>
                                        {['Período', 'Neto', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {data.map(r => (
                                        <tr key={r.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmtDate(r.period_from)} – {fmtDate(r.period_to)}</td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(r.net)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={route('portal.recibos.pdf', r.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <Download size={14} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Pagination data={receipts} />
            </div>
        </AuthenticatedLayout>
    );
}
