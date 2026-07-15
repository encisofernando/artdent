import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { useTheme } from '@/Contexts/ThemeContext';
import { useForm } from '@inertiajs/react';

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

export default function PlanForm({ plan, moduleIds = [], modules, submitUrl, method = 'post' }) {
    const { isDark } = useTheme();
    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, post, put, processing, errors } = useForm({
        slug: plan?.slug || '',
        name: plan?.name || '',
        description: plan?.description || '',
        price: plan?.price ?? 0,
        trial_days: plan?.trial_days ?? 14,
        is_active: plan?.is_active ?? true,
        is_public: plan?.is_public ?? true,
        max_users: plan?.max_users ?? '',
        max_products: plan?.max_products ?? '',
        max_sales_per_month: plan?.max_sales_per_month ?? '',
        max_chat_messages_per_month: plan?.max_chat_messages_per_month ?? '',
        features: plan?.features ?? [],
        module_ids: moduleIds,
    });

    const submit = (e) => {
        e.preventDefault();
        (method === 'put' ? put : post)(submitUrl);
    };

    const toggleModule = (id) => {
        setData('module_ids', data.module_ids.includes(id) ? data.module_ids.filter((m) => m !== id) : [...data.module_ids, id]);
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-3xl">
            <Card title="Información del plan">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Slug" help="Identificador único interno (ej: starter, pro)" error={errors.slug}>
                        <input className={cls} value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="starter" />
                    </Field>

                    <Field label="Nombre" error={errors.name}>
                        <input className={cls} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Plan Starter" />
                    </Field>

                    <Field label="Precio mensual (ARS)" error={errors.price}>
                        <input type="number" min="0" step="0.01" className={cls} value={data.price} onChange={(e) => setData('price', e.target.value)} />
                    </Field>

                    <Field label="Días de prueba gratis" error={errors.trial_days}>
                        <input type="number" min="0" className={cls} value={data.trial_days} onChange={(e) => setData('trial_days', e.target.value)} />
                    </Field>

                    <div className="sm:col-span-2">
                        <Field label="Descripción" error={errors.description}>
                            <textarea rows={2} className={cls} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded" />
                        Plan activo
                    </label>

                    <label className="flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={data.is_public} onChange={(e) => setData('is_public', e.target.checked)} className="rounded" />
                        Plan público
                    </label>
                </div>
            </Card>

            <Card title="Límites del plan" description="Dejar en blanco para ilimitado">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Usuarios máx." error={errors.max_users}>
                        <input type="number" min="0" className={cls} placeholder="∞" value={data.max_users} onChange={(e) => setData('max_users', e.target.value)} />
                    </Field>
                    <Field label="Productos máx." error={errors.max_products}>
                        <input type="number" min="0" className={cls} placeholder="∞" value={data.max_products} onChange={(e) => setData('max_products', e.target.value)} />
                    </Field>
                    <Field label="Ventas/mes máx." error={errors.max_sales_per_month}>
                        <input type="number" min="0" className={cls} placeholder="∞" value={data.max_sales_per_month} onChange={(e) => setData('max_sales_per_month', e.target.value)} />
                    </Field>
                    <Field label="Mensajes Chat IA/mes máx." error={errors.max_chat_messages_per_month}>
                        <input type="number" min="0" className={cls} placeholder="∞" value={data.max_chat_messages_per_month} onChange={(e) => setData('max_chat_messages_per_month', e.target.value)} />
                    </Field>
                </div>
            </Card>

            <Card title="Módulos incluidos" description="Qué funcionalidades desbloquea este plan en el CRM.">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {modules.map((m) => (
                        <label
                            key={m.id}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border transition-colors ${
                                data.module_ids.includes(m.id)
                                    ? (isDark ? 'bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan' : 'bg-brand-mint border-brand-cyan/50 text-brand-blue')
                                    : (isDark ? 'border-white/10 hover:bg-white/5' : 'border-brand-aqua/40 hover:bg-brand-mint')
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="rounded"
                                checked={data.module_ids.includes(m.id)}
                                onChange={() => toggleModule(m.id)}
                            />
                            {m.name}
                        </label>
                    ))}
                </div>
            </Card>

            <Card title="Features (marketing)" description="Bullets mostrados al comparar planes — texto libre, no afecta el acceso real.">
                <FeaturesInput data={data} setData={setData} cls={cls} />
            </Card>

            {plan && (
                <Card title="MercadoPago" description="Información sincronizada con MP — se completa automáticamente al publicar.">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="ID del plan en MP">
                            <input className={`${cls} opacity-60`} disabled value={plan.mp_plan_id || 'Se completa al publicar'} />
                        </Field>
                        <Field label="URL de checkout MP">
                            <input className={`${cls} opacity-60`} disabled value={plan.mp_init_point || 'Se completa al publicar'} />
                        </Field>
                    </div>
                </Card>
            )}

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>{processing ? 'Guardando…' : 'Guardar plan'}</Button>
                <Button as="link" href="/plans" variant="outline">Cancelar</Button>
            </div>
        </form>
    );
}

function FeaturesInput({ data, setData, cls }) {
    const addFeature = (value) => {
        const trimmed = value.trim();
        if (trimmed && !data.features.includes(trimmed)) {
            setData('features', [...data.features, trimmed]);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {data.features.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                        {f}
                        <button type="button" onClick={() => setData('features', data.features.filter((_, idx) => idx !== i))} className="opacity-60 hover:opacity-100">
                            ×
                        </button>
                    </span>
                ))}
            </div>
            <input
                className={cls}
                placeholder="Agregar feature y presionar Enter…"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                }}
            />
        </div>
    );
}
