import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Plus, ArrowUpCircle, RefreshCw, Pencil, Trash2, Globe, Lock } from 'lucide-react';

export default function Index({ plans }) {
    const { isDark } = useTheme();

    const destroy = (plan) => {
        if (confirm(`¿Eliminar el plan "${plan.name}"?`)) {
            router.delete(route('plans.destroy', plan.id));
        }
    };

    return (
        <AdminLayout title="Planes">
            <Head title="Planes" />

            <Card actions={<Button as="link" href="/plans/create"><Plus size={16} /> Nuevo plan</Button>}>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Plan</th>
                                <th className="px-6 py-2">Precio/mes</th>
                                <th className="px-6 py-2">Trial</th>
                                <th className="px-6 py-2">Suscriptores</th>
                                <th className="px-6 py-2">Visibilidad</th>
                                <th className="px-6 py-2">MercadoPago</th>
                                <th className="px-6 py-2">Activo</th>
                                <th className="px-6 py-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((p) => (
                                <tr key={p.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3.5">
                                        <Link href={`/plans/${p.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">{p.name}</Link>
                                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.description || p.slug}</div>
                                    </td>
                                    <td className="px-6 py-3.5"><Badge color="success">${Number(p.price).toLocaleString('es-AR')} ARS</Badge></td>
                                    <td className="px-6 py-3.5"><Badge color="warning">{p.trial_days} días</Badge></td>
                                    <td className="px-6 py-3.5"><Badge color="primary">{p.subscriptions_count}</Badge></td>
                                    <td className="px-6 py-3.5">
                                        {p.is_public
                                            ? <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-bold"><Globe size={14} /> Público</span>
                                            : <span className={`inline-flex items-center gap-1 text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}><Lock size={14} /> Superadmin</span>}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        {p.mp_plan_id
                                            ? <Badge color="success">Publicado</Badge>
                                            : <Badge color="gray">Sin publicar</Badge>}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <Toggle
                                            checked={p.is_active}
                                            title={p.is_active ? 'Desactivar plan' : 'Activar plan'}
                                            onChange={() => router.patch(route('plans.toggle-active', p.id), {}, { preserveScroll: true })}
                                        />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            {!p.mp_plan_id && p.is_public && (
                                                <button
                                                    title="Publicar en MercadoPago"
                                                    onClick={() => confirm(`Se creará el plan "${p.name}" ($${p.price} ARS/mes) en MercadoPago. ¿Continuar?`) && router.patch(route('plans.publish-to-mp', p.id))}
                                                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                                                >
                                                    <ArrowUpCircle size={16} className="text-emerald-500" />
                                                </button>
                                            )}
                                            {p.mp_plan_id && (
                                                <button
                                                    title="Sincronizar precio"
                                                    onClick={() => router.patch(route('plans.sync-mp', p.id))}
                                                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                                                >
                                                    <RefreshCw size={16} className="text-amber-500" />
                                                </button>
                                            )}
                                            <Link href={`/plans/${p.id}/edit`} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Editar">
                                                <Pencil size={16} />
                                            </Link>
                                            <button onClick={() => destroy(p)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Eliminar">
                                                <Trash2 size={16} className="text-rose-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}
