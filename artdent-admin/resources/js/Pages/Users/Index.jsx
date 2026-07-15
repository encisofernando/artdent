import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ users }) {
    const { isDark } = useTheme();
    const { auth } = usePage().props;

    const destroy = (user) => {
        if (confirm(`¿Eliminar el usuario "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AdminLayout title="Usuarios">
            <Head title="Usuarios" />

            <Card actions={<Button as="link" href="/users/create"><Plus size={16} /> Nuevo usuario</Button>}>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Nombre</th>
                                <th className="px-6 py-2">Email</th>
                                <th className="px-6 py-2">Verificado</th>
                                <th className="px-6 py-2">Alta</th>
                                <th className="px-6 py-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3.5 font-bold">{u.name}</td>
                                    <td className="px-6 py-3.5">{u.email}</td>
                                    <td className="px-6 py-3.5">
                                        {u.email_verified_at
                                            ? <Badge color="success">Verificado</Badge>
                                            : <Badge color="gray">Pendiente</Badge>}
                                    </td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(u.created_at).toLocaleDateString('es-AR')}</td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/users/${u.id}/edit`} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Editar">
                                                <Pencil size={16} />
                                            </Link>
                                            {u.id !== auth.user.id && (
                                                <button onClick={() => destroy(u)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Eliminar">
                                                    <Trash2 size={16} className="text-rose-500" />
                                                </button>
                                            )}
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
