import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ShieldCheck, Search, XCircle, Code2 } from 'lucide-react';
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS } from '@/lib/auditMeta';

const B = { blue: '#397B9C', teal: '#49949C' };

const BADGE_COLORS = {
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

function ActionBadge({ action }) {
    const color = BADGE_COLORS[AUDIT_ACTION_COLORS[action]] || BADGE_COLORS.gray;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${color}`}>
            {AUDIT_ACTION_LABELS[action] || action}
        </span>
    );
}

export default function Index({ auth, logs, filters, actions }) {
    const { isDark } = useTheme();
    const [search, setSearch] = useState(filters.search || '');
    const [changes, setChanges] = useState(null);

    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const row = isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50';
    const th = isDark ? 'text-slate-400' : 'text-slate-500';

    const applyFilters = (next) => {
        router.get(route('audit-logs.index'), { search, action: filters.action, ...next }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Auditoría" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Auditoría</h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registro de acciones sensibles: ventas canceladas, cambios de precio masivos, altas y bajas de usuarios y roles.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-sm flex-1 ${card}`}>
                        <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder="Buscar por usuario que hizo el cambio..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
                        />
                        {search && (
                            <button onClick={() => { setSearch(''); applyFilters({ search: '' }); }} className={isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}>
                                <XCircle size={15} />
                            </button>
                        )}
                    </div>
                    <select
                        value={filters.action || ''}
                        onChange={(e) => applyFilters({ action: e.target.value })}
                        className={`rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none ${card} ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    >
                        <option value="">Todas las acciones</option>
                        {actions.map((a) => <option key={a} value={a}>{AUDIT_ACTION_LABELS[a] || a}</option>)}
                    </select>
                </div>

                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b text-xs uppercase tracking-wider font-semibold ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                                    <th className={`px-5 py-3 text-left ${th}`}>Fecha</th>
                                    <th className={`px-5 py-3 text-left ${th}`}>Usuario</th>
                                    <th className={`px-5 py-3 text-left ${th}`}>Acción</th>
                                    <th className={`px-5 py-3 text-left ${th}`}>Nota</th>
                                    <th className={`px-5 py-3 text-right ${th}`}>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={`px-5 py-10 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Sin actividad registrada.
                                        </td>
                                    </tr>
                                )}
                                {logs.data.map((log) => (
                                    <tr key={log.id} className={`border-b transition-colors ${row}`}>
                                        <td className={`px-5 py-3 whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {new Date(log.created_at).toLocaleString('es-AR')}
                                        </td>
                                        <td className={`px-5 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {log.actor?.name || log.actor_name || '—'}
                                        </td>
                                        <td className="px-5 py-3"><ActionBadge action={log.action} /></td>
                                        <td className={`px-5 py-3 max-w-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{log.note || '—'}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => setChanges(log.changes)}
                                                disabled={!log.changes}
                                                title="Ver detalle"
                                                className={`p-1.5 rounded-lg inline-flex disabled:opacity-20 disabled:cursor-not-allowed transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                            >
                                                <Code2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination data={logs} />
            </div>

            <Modal show={!!changes} onClose={() => setChanges(null)}>
                <div className="p-5">
                    <h2 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Detalle del cambio</h2>
                    <pre className={`text-xs font-mono overflow-x-auto p-3 rounded-lg max-h-96 ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                        {JSON.stringify(changes, null, 2)}
                    </pre>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
