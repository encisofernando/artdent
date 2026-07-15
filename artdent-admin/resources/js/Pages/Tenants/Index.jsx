import { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Plus, Search, MoreVertical, Star, CreditCard, PlayCircle, PauseCircle, Trash2, Pencil } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, PLAN_LABELS, PLAN_COLORS } from '@/lib/tenantMeta';

function RowMenu({ tenant, onAssignOwner, onCheckout }) {
    const { isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const destroy = () => {
        if (confirm(`¿Eliminar la empresa "${tenant.name}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('tenants.destroy', tenant.id));
        }
    };

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}>
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className={`absolute right-0 top-full mt-1 w-56 rounded-xl shadow-2xl border z-20 overflow-hidden py-1 ${isDark ? 'bg-brand-navy-light border-white/10' : 'bg-white border-brand-aqua/40'}`}>
                    {tenant.plan !== 'owner' && (
                        <button
                            onClick={() => { setOpen(false); onAssignOwner(tenant); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                        >
                            <Star size={15} className="text-amber-500" /> Licencia Owner
                        </button>
                    )}
                    {tenant.plan !== 'owner' && (
                        <button
                            onClick={() => { setOpen(false); onCheckout(tenant); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                        >
                            <CreditCard size={15} className="text-brand-cyan" /> Generar pago
                        </button>
                    )}
                    <button onClick={destroy} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-rose-500 ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}>
                        <Trash2 size={15} /> Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Index({ tenants, filters, plans }) {
    const { isDark } = useTheme();
    const [search, setSearch] = useState(filters.search || '');
    const [checkoutTenant, setCheckoutTenant] = useState(null);
    const checkoutForm = useForm({ plan_id: '' });

    const applyFilters = (extra = {}) => {
        router.get('/tenants', { search, ...filters, ...extra }, { preserveState: true, replace: true });
    };

    const submitSearch = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const toggleStatus = (tenant) => {
        const action = tenant.status === 'active' ? 'suspend' : 'activate';
        router.patch(route(`tenants.${action}`, tenant.id));
    };

    const assignOwner = (tenant) => {
        if (confirm(`Se asignará la licencia Owner (ilimitada, sin cobro) a "${tenant.name}". ¿Continuar?`)) {
            router.patch(route('tenants.assign-owner', tenant.id));
        }
    };

    const submitCheckout = (e) => {
        e.preventDefault();
        checkoutForm.post(route('tenants.checkout', checkoutTenant.id), {
            onSuccess: () => setCheckoutTenant(null),
        });
    };

    const cls = `w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    return (
        <AdminLayout title="Empresas">
            <Head title="Empresas" />

            <Card
                actions={<Button as="link" href="/tenants/create"><Plus size={16} /> Nueva empresa</Button>}
            >
                <form onSubmit={submitSearch} className="flex flex-wrap gap-3 mb-5">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, slug o email…"
                            className={`${cls} pl-9`}
                        />
                    </div>
                    <select value={filters.status || ''} onChange={(e) => applyFilters({ status: e.target.value })} className={`${cls} w-auto`}>
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select value={filters.plan || ''} onChange={(e) => applyFilters({ plan: e.target.value })} className={`${cls} w-auto`}>
                        <option value="">Todos los planes</option>
                        {plans.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
                    </select>
                    <Button type="submit" variant="outline">Buscar</Button>
                </form>

                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Empresa</th>
                                <th className="px-6 py-2">Plan</th>
                                <th className="px-6 py-2">Estado</th>
                                <th className="px-6 py-2">Trial vence</th>
                                <th className="px-6 py-2">Empleados</th>
                                <th className="px-6 py-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.data.map((t) => (
                                <tr key={t.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3.5">
                                        <Link href={`/tenants/${t.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">{t.name}</Link>
                                        <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <span className="font-mono">{t.id}</span>
                                            {t.email && <span>· {t.email}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5"><Badge color={PLAN_COLORS[t.plan]}>{PLAN_LABELS[t.plan] || t.plan}</Badge></td>
                                    <td className="px-6 py-3.5"><Badge color={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status] || t.status}</Badge></td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {t.trial_ends_at ? new Date(t.trial_ends_at).toLocaleDateString('es-AR') : '—'}
                                    </td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t.user_maps_count}</td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => toggleStatus(t)}
                                                title={t.status === 'active' ? 'Suspender' : 'Activar'}
                                                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                                            >
                                                {t.status === 'active'
                                                    ? <PauseCircle size={16} className="text-rose-500" />
                                                    : <PlayCircle size={16} className="text-emerald-500" />}
                                            </button>
                                            <Link href={`/tenants/${t.id}/edit`} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Editar">
                                                <Pencil size={16} />
                                            </Link>
                                            <RowMenu tenant={t} onAssignOwner={assignOwner} onCheckout={(tenant) => { setCheckoutTenant(tenant); checkoutForm.setData('plan_id', ''); }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tenants.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>No se encontraron empresas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {tenants.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 mt-5">
                        {tenants.links.map((link, i) => (
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

            <Modal open={!!checkoutTenant} onClose={() => setCheckoutTenant(null)} title={`Generar pago — ${checkoutTenant?.name ?? ''}`}>
                <form onSubmit={submitCheckout} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1.5">Plan</label>
                        <select
                            className={cls}
                            value={checkoutForm.data.plan_id}
                            onChange={(e) => checkoutForm.setData('plan_id', e.target.value)}
                            required
                        >
                            <option value="">Seleccionar plan…</option>
                            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {checkoutForm.errors.plan_id && <p className="text-rose-500 text-xs mt-1.5">{checkoutForm.errors.plan_id}</p>}
                    </div>
                    <Button type="submit" disabled={checkoutForm.processing} className="w-full justify-center">
                        {checkoutForm.processing ? 'Generando…' : 'Generar URL de pago'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
