import AdminLayout from '@/Layouts/AdminLayout';
import PlanForm from '@/Components/Plans/PlanForm';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ plan, moduleIds, modules }) {
    const { isDark } = useTheme();

    return (
        <AdminLayout title={plan.name}>
            <Head title={plan.name} />

            <Link href="/plans" className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                <ArrowLeft size={16} /> Volver a planes
            </Link>

            <PlanForm plan={plan} moduleIds={moduleIds} modules={modules} submitUrl={route('plans.update', plan.id)} method="put" />
        </AdminLayout>
    );
}
