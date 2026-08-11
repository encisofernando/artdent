import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ articles }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();

    const destroy = (article) => {
        confirmDialog(`¿Eliminar el artículo "${article.title}"?`, () => {
            router.delete(route('kb-articles.destroy', article.id));
        });
    };

    return (
        <AdminLayout title="Base de Conocimiento">
            <Head title="Base de Conocimiento" />

            <Card actions={<Button as="link" href="/kb-articles/create"><Plus size={16} /> Nuevo artículo</Button>}>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Título</th>
                                <th className="px-6 py-2">Categoría</th>
                                <th className="px-6 py-2">Orden</th>
                                <th className="px-6 py-2">Publicado</th>
                                <th className="px-6 py-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((a) => (
                                <tr key={a.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3.5">
                                        <Link href={`/kb-articles/${a.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">{a.title}</Link>
                                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/{a.slug}</div>
                                    </td>
                                    <td className="px-6 py-3.5">{a.category ? <Badge color="primary">{a.category}</Badge> : '—'}</td>
                                    <td className={`px-6 py-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{a.order}</td>
                                    <td className="px-6 py-3.5">
                                        <Toggle
                                            checked={a.is_published}
                                            title={a.is_published ? 'Despublicar' : 'Publicar'}
                                            onChange={() => router.patch(route('kb-articles.toggle-publish', a.id), {}, { preserveScroll: true })}
                                        />
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/kb-articles/${a.id}/edit`} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Editar">
                                                <Pencil size={16} />
                                            </Link>
                                            <button onClick={() => destroy(a)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`} title="Eliminar">
                                                <Trash2 size={16} className="text-rose-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Sin artículos todavía.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}
