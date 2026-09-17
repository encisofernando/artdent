import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { ArrowLeft, Trash2, Database, Globe, CreditCard, Layers, Plus, CircleDollarSign, FileCheck, ArrowLeftRight, QrCode, Banknote } from 'lucide-react';
import { STATUS_LABELS, PLAN_LABELS } from '@/lib/tenantMeta';
import ManualPaymentModal from '@/Components/Payments/ManualPaymentModal';
import InvoiceVoucherModal from '@/Components/Invoices/InvoiceVoucherModal';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-bold mb-1.5">{label}</label>
            {children}
            {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}

function toLocalInput(value) {
    if (!value) return '';
    return value.slice(0, 16);
}

export default function Edit({ tenant, userMaps, plans, modules, payments = [] }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name || '',
        email: tenant.email || '',
        plan: tenant.plan,
        status: tenant.status,
        trial_ends_at: toLocalInput(tenant.trial_ends_at),
        activated_at: toLocalInput(tenant.activated_at),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('tenants.update', tenant.id));
    };

    const [newEmail, setNewEmail] = useState('');

    const addUserMap = (e) => {
        e.preventDefault();
        router.post(route('tenants.user-maps.store', tenant.id), { email: newEmail }, {
            preserveScroll: true,
            onSuccess: () => setNewEmail(''),
        });
    };

    const removeUserMap = (map) => {
        confirmDialog(`¿Quitar el mapeo de "${map.email}"?`, () => {
            router.delete(route('tenants.user-maps.destroy', [tenant.id, map.id]), { preserveScroll: true });
        });
    };

    const toggleModule = (module) => {
        router.put(route('tenants.modules.update', [tenant.id, module.id]), { enabled: !module.effective }, { preserveScroll: true });
    };

    return (
        <AdminLayout title={tenant.name}>
            <Head title={tenant.name} />

            <Link href="/tenants" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a empresas
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={submit}>
                        <Card
                            title="Datos del tenant"
                            actions={<Button type="submit" size="sm" disabled={processing}>{processing ? 'Guardando…' : 'Guardar cambios'}</Button>}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Nombre de la empresa" error={errors.name}>
                                    <input className={cls} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                </Field>

                                <Field label="Email de contacto" error={errors.email}>
                                    <input type="email" className={cls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </Field>

                                <Field label="Plan" error={errors.plan}>
                                    <select className={cls} value={data.plan} onChange={(e) => setData('plan', e.target.value)}>
                                        {plans.map((p) => <option key={p.id} value={p.slug}>{p.name}</option>)}
                                    </select>
                                </Field>

                                <Field label="Estado" error={errors.status}>
                                    <select className={cls} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </Field>

                                <Field label="Vencimiento del trial" error={errors.trial_ends_at}>
                                    <input type="datetime-local" className={cls} value={data.trial_ends_at} onChange={(e) => setData('trial_ends_at', e.target.value)} />
                                </Field>

                                <Field label="Fecha de activación" error={errors.activated_at}>
                                    <input type="datetime-local" className={cls} value={data.activated_at} onChange={(e) => setData('activated_at', e.target.value)} />
                                </Field>
                            </div>
                        </Card>
                    </form>

                    <Card
                        title="Módulos"
                        description="Lo que incluye el plan, más add-ons o revocaciones puntuales para este tenant."
                    >
                        <ul className="space-y-1">
                            {modules.map((m) => (
                                <li
                                    key={m.id}
                                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg ${isDark ? 'bg-brand-navy' : 'bg-brand-mint'}`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Layers size={15} className={isDark ? 'text-slate-500 shrink-0' : 'text-slate-400 shrink-0'} />
                                        <span className="text-sm font-semibold truncate">{m.name}</span>
                                        {m.has_override && m.effective && !m.in_plan && <Badge color="success">Add-on</Badge>}
                                        {m.has_override && !m.effective && m.in_plan && <Badge color="danger">Revocado</Badge>}
                                        {!m.has_override && m.in_plan && <Badge color="primary">Plan</Badge>}
                                    </div>
                                    <Toggle
                                        checked={m.effective}
                                        title={m.effective ? 'Quitar módulo' : 'Habilitar módulo'}
                                        onChange={() => toggleModule(m)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Empleados (mapeo de emails)" description="Emails autorizados a iniciar sesión dentro de este tenant.">
                        <form onSubmit={addUserMap} className="flex gap-2 mb-4">
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="empleado@empresa.com"
                                className={cls}
                            />
                            <Button type="submit" size="sm" className="shrink-0">Agregar</Button>
                        </form>

                        <ul className="space-y-1">
                            {userMaps.map((m) => (
                                <li key={m.id} className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm ${isDark ? 'bg-brand-navy' : 'bg-brand-mint'}`}>
                                    {m.email}
                                    <button onClick={() => removeUserMap(m)} className="text-rose-500 hover:text-rose-400">
                                        <Trash2 size={15} />
                                    </button>
                                </li>
                            ))}
                            {userMaps.length === 0 && (
                                <li className={`text-sm text-center py-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Sin empleados mapeados todavía.</li>
                            )}
                        </ul>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Infraestructura">
                        <dl className="space-y-3 text-sm">
                            <div className="flex items-center gap-2.5">
                                <Database size={15} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                <div>
                                    <dt className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Base de datos</dt>
                                    <dd className="font-mono font-semibold">{tenant.database}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Globe size={15} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                <div>
                                    <dt className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Dominio</dt>
                                    <dd className="font-semibold">{tenant.domain || '—'}</dd>
                                </div>
                            </div>
                        </dl>
                    </Card>

                    <Card
                        title="Suscripción"
                        actions={
                            <Button size="sm" variant="outline" onClick={() => setIsPaymentModalOpen(true)} className="gap-1 text-xs">
                                <Plus size={13} /> Registrar Pago
                            </Button>
                        }
                    >
                        {tenant.active_subscription ? (
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-center gap-2.5">
                                    <CreditCard size={15} className="text-emerald-500" />
                                    <div>
                                        <dt className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Plan pago</dt>
                                        <dd className="font-semibold">{tenant.active_subscription.plan?.name}</dd>
                                    </div>
                                </div>
                                {tenant.active_subscription.next_payment_date && (
                                    <div>
                                        <dt className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Próximo pago</dt>
                                        <dd>{new Date(tenant.active_subscription.next_payment_date).toLocaleDateString('es-AR')}</dd>
                                    </div>
                                )}
                            </dl>
                        ) : (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                Sin suscripción autorizada — plan asignado manualmente: <Badge color="gray">{PLAN_LABELS[tenant.plan] || tenant.plan}</Badge>
                            </p>
                        )}
                    </Card>

                    <Card title="Pagos Recientes" description="Últimos cobros registrados para esta empresa.">
                        <ul className="space-y-2 text-xs">
                            {payments.map((p) => (
                                <li key={p.id} className={`p-2.5 rounded-lg border ${isDark ? 'bg-brand-navy border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold">${Number(p.amount).toLocaleString('es-AR')} ARS</span>
                                        <span className="text-slate-500">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-AR') : new Date(p.created_at).toLocaleDateString('es-AR')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">{p.payment_method === 'transfer' ? 'Transferencia' : (p.payment_method === 'qr' ? 'QR' : (p.payment_method === 'cash' ? 'Efectivo' : p.payment_method))}</span>
                                        {p.invoice && p.invoice.status === 'authorized' ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedInvoiceId(p.invoice.id);
                                                    setIsVoucherOpen(true);
                                                }}
                                                className="text-brand-cyan hover:underline inline-flex items-center gap-1 font-semibold"
                                            >
                                                <FileCheck size={12} /> Factura {p.invoice.receipt_type} Nº {p.invoice.number}
                                            </button>
                                        ) : (
                                            <span className="text-slate-400">Sin Factura</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                            {payments.length === 0 && (
                                <li className={`text-center py-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Sin pagos registrados todavía.
                                </li>
                            )}
                        </ul>
                    </Card>
                </div>
            </div>

            <ManualPaymentModal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                tenants={[tenant]}
                plans={plans}
                preselectedTenantId={tenant.id}
                issuerConfigured={true}
            />

            <InvoiceVoucherModal
                invoiceId={selectedInvoiceId}
                open={isVoucherOpen}
                onClose={() => {
                    setIsVoucherOpen(false);
                    setSelectedInvoiceId(null);
                }}
            />
        </AdminLayout>
    );
}
