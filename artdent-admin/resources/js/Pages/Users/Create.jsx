import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const { isDark } = useTheme();
    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, post, processing, errors } = useForm({ name: '', email: '', password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AdminLayout title="Nuevo usuario">
            <Head title="Nuevo usuario" />

            <Link href="/users" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a usuarios
            </Link>

            <form onSubmit={submit} className="max-w-md">
                <Card title="Datos del usuario">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1.5">Nombre</label>
                            <input className={cls} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-rose-500 text-xs mt-1.5">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1.5">Email</label>
                            <input type="email" className={cls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            {errors.email && <p className="text-rose-500 text-xs mt-1.5">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1.5">Contraseña</label>
                            <input type="password" className={cls} value={data.password} onChange={(e) => setData('password', e.target.value)} />
                            {errors.password && <p className="text-rose-500 text-xs mt-1.5">{errors.password}</p>}
                        </div>
                    </div>
                </Card>

                <div className="flex items-center gap-3 mt-6">
                    <Button type="submit" disabled={processing}>{processing ? 'Creando…' : 'Crear usuario'}</Button>
                    <Button as="link" href="/users" variant="outline">Cancelar</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
