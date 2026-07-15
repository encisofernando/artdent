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

export default function KbArticleForm({ article, submitUrl, method = 'post' }) {
    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 bg-white dark:bg-brand-navy border-brand-aqua dark:border-white/15 focus:border-brand-cyan`;

    const { data, setData, post, put, processing, errors } = useForm({
        title: article?.title || '',
        slug: article?.slug || '',
        category: article?.category || '',
        body: article?.body || '',
        is_published: article?.is_published ?? false,
        order: article?.order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        (method === 'put' ? put : post)(submitUrl);
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-3xl mx-auto">
            <Card title="Artículo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Título" error={errors.title}>
                        <input className={cls} value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Cómo cambiar mi contraseña" />
                    </Field>

                    <Field label="Slug" help="Se genera solo desde el título si lo dejás vacío" error={errors.slug}>
                        <input className={cls} value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="cambiar-contrasena" />
                    </Field>

                    <Field label="Categoría" error={errors.category}>
                        <input className={cls} value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Cuenta, Facturación, Laboratorio…" />
                    </Field>

                    <Field label="Orden" help="Menor primero" error={errors.order}>
                        <input type="number" min="0" className={cls} value={data.order} onChange={(e) => setData('order', e.target.value)} />
                    </Field>

                    <div className="sm:col-span-2">
                        <Field label="Contenido" help="Texto simple (soporta markdown básico)" error={errors.body}>
                            <textarea rows={10} className={`${cls} font-mono`} value={data.body} onChange={(e) => setData('body', e.target.value)} />
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} className="rounded" />
                        Publicado (visible en la Ayuda del CRM)
                    </label>
                </div>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>{processing ? 'Guardando…' : 'Guardar artículo'}</Button>
                <Button as="link" href="/kb-articles" variant="outline">Cancelar</Button>
            </div>
        </form>
    );
}
