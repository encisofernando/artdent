import AdminLayout from '@/Layouts/AdminLayout';
import KbArticleForm from '@/Components/KbArticles/KbArticleForm';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ article }) {
    const { isDark } = useTheme();

    return (
        <AdminLayout title="Editar artículo">
            <Head title={`Editar · ${article.title}`} />

            <Link href="/kb-articles" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a la base de conocimiento
            </Link>

            <KbArticleForm article={article} submitUrl={route('kb-articles.update', article.id)} method="put" />
        </AdminLayout>
    );
}
