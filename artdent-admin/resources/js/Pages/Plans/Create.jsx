import AdminLayout from '@/Layouts/AdminLayout';
import PlanForm from '@/Components/Plans/PlanForm';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function Create({ modules }) {
    const { isDark } = useTheme();

    return (
        <AdminLayout title="Nuevo plan">
            <Head title="Nuevo plan" />

            <Link href="/plans" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a planes
            </Link>

            <PlanForm modules={modules} moduleIds={[]} submitUrl={route('plans.store')} method="post" />
        </AdminLayout>
    );
}
