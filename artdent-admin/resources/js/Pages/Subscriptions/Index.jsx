import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Code2 } from 'lucide-react';
import { SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_COLORS } from '@/lib/tenantMeta';

export default function Index({ subscriptions, filters }) {
    const { isDark } = useTheme();
    const [mpData, setMpData] = useState(null);

    const cls = `rounded-lg border px-3.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const applyStatus = (status) => {
        router.get('/subscriptions', { status }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Suscripciones">
            <Head title="Suscripciones" />

            <Card>
                <div className="flex flex-wrap gap-3 mb-5">
                    <select value={filters.status || ''} onChange={(e) => applyStatus(e.target.value)} className={`${cls} w-auto`}>
                        <option value="">Todos los estados</option>
                        {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Empresa</th>
                                <th className="px-6 py-2">Plan</th>
                                <th className="px-6 py-2">Estado</th>
                                <th className="px-6 py-2">Monto</th>
                                <th className="px-6 py-2">Próximo pago</th>
                                <th className="px-6 py-2">Preapproval MP</th>
                                <th className="px-6 py-2 text-right">Datos MP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.data.map((s) => (
                                <tr key={s.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3.5">
                                        {s.tenant ? (
                                            <Link href={`/tenants/${s.tenant.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">{s.tenant.name}</Link>
                                        ) : (
                                            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>Tenant eliminado</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5">{s.plan?.name ?? '—'}</td>
                                    <td className="px-6 py-3.5"><Badge color={SUBSCRIPTION_STATUS_COLORS[s.status]}>{SUBSCRIPTION_STATUS_LABELS[s.status] || s.status}</Badge></td>
                                    <td className="px-6 py-3.5">{s.amount ? `$${Number(s.amount).toLocaleString('es-AR')} ARS` : '—'}</td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString('es-AR') : '—'}
                                    </td>
                                    <td className={`px-6 py-3.5 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{s.mp_preapproval_id || '—'}</td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button
                                            onClick={() => setMpData(s.mp_data)}
                                            disabled={!s.mp_data}
                                            title="Ver datos crudos de MercadoPago"
                                            className={`p-1.5 rounded-lg inline-flex disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                                        >
                                            <Code2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>No hay suscripciones registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {subscriptions.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 mt-5">
                        {subscriptions.links.map((link, i) => (
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

            <Modal open={!!mpData} onClose={() => setMpData(null)} title="Datos crudos — MercadoPago">
                <pre className={`text-xs font-mono overflow-x-auto p-3 rounded-lg max-h-96 ${isDark ? 'bg-brand-navy text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                    {JSON.stringify(mpData, null, 2)}
                </pre>
            </Modal>
        </AdminLayout>
    );
}
