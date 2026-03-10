import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { User, Lock, Trash2, ShieldAlert } from 'lucide-react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function Section({ icon: Icon, title, subtitle, children, danger = false, isDark }) {
    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>
            {/* Section header */}
            <div className={`flex items-center gap-3 px-6 py-4 border-b
                ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0`}
                    style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(57,123,156,0.12)' }}>
                    <Icon size={15} style={{ color: danger ? '#ef4444' : B.blue }} />
                </div>
                <div>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h2>
                    {subtitle && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
                </div>
            </div>
            {/* Section body */}
            <div className="px-6 py-6">
                {children}
            </div>
        </div>
    );
}

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { isDark } = useTheme();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Perfil" />

            <div className="flex flex-col gap-6 max-w-2xl">
                {/* Page title */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Mi Perfil
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Administrá tu información personal y seguridad de la cuenta.
                    </p>
                </div>

                {/* Información personal */}
                <Section
                    icon={User}
                    title="Información Personal"
                    subtitle="Actualizá tu nombre y correo electrónico"
                    isDark={isDark}
                >
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </Section>

                {/* Contraseña */}
                <Section
                    icon={Lock}
                    title="Cambiar Contraseña"
                    subtitle="Usá una contraseña larga y segura"
                    isDark={isDark}
                >
                    <UpdatePasswordForm />
                </Section>

                {/* Eliminar cuenta */}
                <Section
                    icon={Trash2}
                    title="Eliminar Cuenta"
                    subtitle="Esta acción es permanente e irreversible"
                    danger
                    isDark={isDark}
                >
                    <DeleteUserForm />
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}
