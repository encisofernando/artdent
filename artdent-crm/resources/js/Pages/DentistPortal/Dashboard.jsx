import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import Pagination from '@/Components/Pagination';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { Package, PackageCheck, Wallet, Download, Send, CheckCircle2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C', green: '#5AAD9C', red: '#E63946' };

const STATUS_COLORS = {
    received: '#94a3b8',
    in_progress: B.blue,
    quality_check: '#d97706',
    ready: B.green,
    delivered: '#64748b',
    cancelled: B.red,
};

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

function StatCard({ icon: Icon, label, value, accent, isDark }) {
    return (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}1a` }}>
                <Icon size={20} style={{ color: accent }} />
            </div>
            <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-lg font-extrabold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
            </div>
        </div>
    );
}

export default function Dashboard({ dentist, jobs, readyCount, account, recentMoves }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const toast = useToast();
    const [tab, setTab] = useState('jobs');
    const [requesting, setRequesting] = useState(false);

    const requestPickup = () => {
        setRequesting(true);
        router.post(route('dentist-portal.request-pickup'), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Avisamos al laboratorio que querés retirar tus trabajos.'),
            onFinish: () => setRequesting(false),
        });
    };

    const card = `rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`;

    return (
        <DentistPortalLayout dentist={dentist}>
            <Head title="Mi portal" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Hola, {dentist.name}
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tus trabajos y tu cuenta corriente con el laboratorio.
                        </p>
                    </div>
                    {readyCount > 0 && (
                        <button
                            onClick={requestPickup}
                            disabled={requesting}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                        >
                            <Send size={15} /> Avisar que quiero retirar
                        </button>
                    )}
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-2 text-sm rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-emerald-500">
                        <CheckCircle2 size={15} /> {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={Package} label="Trabajos" value={jobs.total} accent={B.blue} isDark={isDark} />
                    <StatCard icon={PackageCheck} label="Listos para retirar" value={readyCount} accent={B.green} isDark={isDark} />
                    <StatCard icon={Wallet} label="Saldo cuenta corriente" value={fmt(account.balance)} accent={account.balance > 0 ? B.red : B.green} isDark={isDark} />
                </div>

                <div className={`flex items-center p-1 gap-1 rounded-xl border w-fit ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {[['jobs', 'Mis trabajos'], ['account', 'Cuenta corriente']].map(([id, label]) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                tab === id
                                    ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                    : (isDark ? 'text-slate-400' : 'text-slate-500')
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'jobs' && (
                    <div className={`${card} overflow-hidden`}>
                        {jobs.data.length === 0 ? (
                            <p className={`p-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no tenés trabajos enviados.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/20">
                                {jobs.data.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => router.visit(route('dentist-portal.jobs.show', job.id))}
                                        className="p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                                    >
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {job.number} {job.patient && <span className="font-normal">— {job.patient}</span>}
                                            </p>
                                            {job.job_type && (
                                                <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{job.job_type}</p>
                                            )}
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {job.delivered_at ? `Entregado ${job.delivered_at}` : job.due_date ? `Estimado ${job.due_date}` : ''}
                                            </p>
                                        </div>
                                        <span
                                            className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg"
                                            style={{ background: `${STATUS_COLORS[job.status] ?? '#94a3b8'}1a`, color: STATUS_COLORS[job.status] ?? '#94a3b8' }}
                                        >
                                            {job.status_label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-3"><Pagination data={jobs} /></div>
                    </div>
                )}

                {tab === 'account' && (
                    <div className={`${card} overflow-hidden`}>
                        {recentMoves.data.length === 0 ? (
                            <p className={`p-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Todavía no hay movimientos.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/20">
                                {recentMoves.data.map((m) => (
                                    <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold ${m.is_payment ? 'text-emerald-500' : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                                                {m.type_label}
                                            </p>
                                            {m.description && (
                                                <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.description}</p>
                                            )}
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.move_date}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${m.is_payment ? 'text-emerald-500' : (isDark ? 'text-slate-200' : 'text-slate-800')}`}>
                                                    {m.is_payment ? '-' : ''}{fmt(m.amount)}
                                                </p>
                                                <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saldo {fmt(m.balance_after)}</p>
                                            </div>
                                            {m.downloadable && (
                                                <a
                                                    href={route('dentist-portal.move-pdf', m.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                                    title="Descargar comprobante"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-3"><Pagination data={recentMoves} /></div>
                    </div>
                )}
            </div>
        </DentistPortalLayout>
    );
}
