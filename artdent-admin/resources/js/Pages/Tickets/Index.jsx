import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';

const STATUS_LABELS = {
    abierto: 'Abierto',
    en_progreso: 'En progreso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
};

const STATUS_COLORS = {
    abierto: 'danger',
    en_progreso: 'warning',
    resuelto: 'success',
    cerrado: 'gray',
};

const PRIORITY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta' };
const PRIORITY_COLORS = { baja: 'gray', media: 'info', alta: 'danger' };

export default function Index({ tickets, filters }) {
    const { isDark } = useTheme();

    const cls = `rounded-lg border px-3.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const applyFilters = (next) => {
        router.get('/tickets', { ...filters, ...next }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Soporte">
            <Head title="Soporte" />

            <Card>
                <div className="flex flex-wrap gap-3 mb-5">
                    <input
                        className={`${cls} w-64`}
                        placeholder="Buscar por asunto, tenant o email…"
                        defaultValue={filters.search || ''}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search: e.currentTarget.value })}
                    />
                    <select value={filters.status || ''} onChange={(e) => applyFilters({ status: e.target.value })} className={`${cls} w-auto`}>
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select value={filters.priority || ''} onChange={(e) => applyFilters({ priority: e.target.value })} className={`${cls} w-auto`}>
                        <option value="">Toda prioridad</option>
                        {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">#</th>
                                <th className="px-6 py-2">Asunto</th>
                                <th className="px-6 py-2">Tenant</th>
                                <th className="px-6 py-2">Prioridad</th>
                                <th className="px-6 py-2">Estado</th>
                                <th className="px-6 py-2">Asignado</th>
                                <th className="px-6 py-2">Última actividad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.data.map((t) => (
                                <tr key={t.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>#{t.id}</td>
                                    <td className="px-6 py-3.5">
                                        <Link href={`/tickets/${t.id}`} className="font-bold hover:text-brand-cyan transition-colors">
                                            {t.subject}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3.5">{t.tenant_name || t.tenant_id}</td>
                                    <td className="px-6 py-3.5"><Badge color={PRIORITY_COLORS[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge></td>
                                    <td className="px-6 py-3.5"><Badge color={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</Badge></td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t.assigned_to?.name || '—'}</td>
                                    <td className={`px-6 py-3.5 whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {t.last_message_at ? new Date(t.last_message_at).toLocaleString('es-AR') : '—'}
                                    </td>
                                </tr>
                            ))}
                            {tickets.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Sin tickets.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {tickets.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 mt-5">
                        {tickets.links.map((link, i) => (
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
        </AdminLayout>
    );
}
