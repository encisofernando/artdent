import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Code2 } from 'lucide-react';
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS } from '@/lib/auditMeta';

export default function Index({ logs, filters, actions }) {
    const { isDark } = useTheme();
    const [changes, setChanges] = useState(null);

    const cls = `rounded-lg border px-3.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const applyFilters = (next) => {
        router.get('/audit-logs', { ...filters, ...next }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Auditoría">
            <Head title="Auditoría" />

            <Card>
                <div className="flex flex-wrap gap-3 mb-5">
                    <input
                        className={`${cls} w-64`}
                        placeholder="Buscar por tenant o email…"
                        defaultValue={filters.search || ''}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                    />
                    <select value={filters.action || ''} onChange={(e) => applyFilters({ action: e.target.value })} className={`${cls} w-auto`}>
                        <option value="">Todas las acciones</option>
                        {actions.map((a) => <option key={a} value={a}>{AUDIT_ACTION_LABELS[a] || a}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Fecha</th>
                                <th className="px-6 py-2">Actor</th>
                                <th className="px-6 py-2">Acción</th>
                                <th className="px-6 py-2">Empresa</th>
                                <th className="px-6 py-2">Nota</th>
                                <th className="px-6 py-2 text-right">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className={`px-6 py-3.5 whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {new Date(log.created_at).toLocaleString('es-AR')}
                                    </td>
                                    <td className="px-6 py-3.5">{log.actor?.name || log.actor_email || '—'}</td>
                                    <td className="px-6 py-3.5">
                                        <Badge color={AUDIT_ACTION_COLORS[log.action] || 'gray'}>{AUDIT_ACTION_LABELS[log.action] || log.action}</Badge>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        {log.tenant_id ? (
                                            <Link href={`/tenants/${log.tenant_id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">
                                                {log.tenant_name || log.tenant_id}
                                            </Link>
                                        ) : (
                                            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>—</span>
                                        )}
                                    </td>
                                    <td className={`px-6 py-3.5 max-w-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{log.note || '—'}</td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button
                                            onClick={() => setChanges(log.changes)}
                                            disabled={!log.changes}
                                            title="Ver detalle"
                                            className={`p-1.5 rounded-lg inline-flex disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                                        >
                                            <Code2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Sin actividad registrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 mt-5">
                        {logs.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                    link.active ? 'bg-brand-cyan text-white' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-brand-mint'
                                } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <Modal open={!!changes} onClose={() => setChanges(null)} title="Detalle del cambio">
                <pre className={`text-xs font-mono overflow-x-auto p-3 rounded-lg max-h-96 ${isDark ? 'bg-brand-navy text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                    {JSON.stringify(changes, null, 2)}
                </pre>
            </Modal>
        </AdminLayout>
    );
}
