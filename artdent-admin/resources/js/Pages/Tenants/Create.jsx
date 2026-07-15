import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

function Field({ label, help, error, children }) {
    const { isDark } = useTheme();
    return (
        <div>
            <label className="block text-sm font-bold mb-1.5">{label}</label>
            {children}
            {help && !error && <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{help}</p>}
            {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}

function inputClass(isDark) {
    return `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;
}

export default function Create({ plans }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        id: '',
        name: '',
        email: '',
        domain: '',
        plan: 'starter',
        status: 'trial',
        trial_ends_at: '',
        activated_at: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tenants.store'));
    };

    const cls = inputClass(isDark);

    return (
        <AdminLayout title="Nueva empresa">
            <Head title="Nueva empresa" />

            <Link href="/tenants" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a empresas
            </Link>

            <form onSubmit={submit} className="space-y-6 max-w-3xl">
                <Card title="Datos del tenant">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Slug / Subdominio" help='Ej: "artdent" → artdent.artdent.com.ar' error={errors.id}>
                            <input className={cls} value={data.id} onChange={(e) => setData('id', e.target.value.toLowerCase())} placeholder="artdent" />
                        </Field>

                        <Field label="Nombre de la empresa" error={errors.name}>
                            <input className={cls} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </Field>

                        <Field label="Email de contacto" error={errors.email}>
                            <input type="email" className={cls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </Field>

                        <Field label="Dominio principal" help="Opcional. Si se deja vacío se genera automáticamente." error={errors.domain}>
                            <input className={cls} value={data.domain} onChange={(e) => setData('domain', e.target.value)} placeholder={`${data.id || '{slug}'}.artdent.com.ar`} />
                        </Field>

                        <Field label="Plan" error={errors.plan}>
                            <select className={cls} value={data.plan} onChange={(e) => setData('plan', e.target.value)}>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.slug}>{p.name}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Estado" error={errors.status}>
                            <select className={cls} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                <option value="trial">Período de prueba</option>
                                <option value="active">Activo</option>
                                <option value="suspended">Suspendido</option>
                                <option value="cancelled">Cancelado</option>
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

                <Card title="Usuario owner" description="Se crea dentro del tenant para ingresar al CRM.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nombre del administrador" error={errors.owner_name}>
                            <input className={cls} value={data.owner_name} onChange={(e) => setData('owner_name', e.target.value)} />
                        </Field>

                        <Field label="Email del administrador" error={errors.owner_email}>
                            <input type="email" className={cls} value={data.owner_email} onChange={(e) => setData('owner_email', e.target.value)} />
                        </Field>

                        <Field label="Password inicial" help="Opcional. Si se deja vacío se genera una password temporal." error={errors.owner_password}>
                            <input type="password" className={cls} value={data.owner_password} onChange={(e) => setData('owner_password', e.target.value)} />
                        </Field>
                    </div>
                </Card>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing}>{processing ? 'Creando…' : 'Crear empresa'}</Button>
                    <Button as="link" href="/tenants" variant="outline">Cancelar</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
