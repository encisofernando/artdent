import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { User, Lock, Trash2, Calendar, ShieldCheck, Mail } from 'lucide-react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function getInitials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function SectionCard({ icon: Icon, title, subtitle, children, isDark, className = '' }) {
    return (
        <div className={`rounded-2xl border flex flex-col
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}
            ${className}`}>
            <div className={`flex items-center gap-3 px-5 py-3.5 border-b shrink-0
                ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(57,123,156,0.10)' }}>
                    <Icon size={14} style={{ color: B.blue }} />
                </div>
                <div>
                    <p className={`text-sm font-bold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</p>
                    {subtitle && <p className={`text-xs leading-tight mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
                </div>
            </div>
            <div className="px-5 py-5 flex-1">{children}</div>
        </div>
    );
}

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { isDark } = useTheme();
    const user = auth.user;

    const initials = getInitials(user.name);
    const joinedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
        : null;
    const roleLabel = user.is_super_admin
        ? 'Super Admin'
        : (Array.isArray(user.roles) && user.roles[0]?.name) || 'Usuario';

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Mi Perfil" />

            <div className="flex flex-col gap-5">

                {/* ── Identity header — full width ─────────────────────── */}
                <div className={`rounded-2xl border overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>

                    {/* Gradient strip */}
                    <div className="h-3 w-full"
                        style={{ background: `linear-gradient(90deg, ${B.blue} 0%, ${B.teal} 50%, ${B.green} 100%)` }} />

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-5">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold select-none shrink-0 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.green})` }}>
                            {initials || <User size={24} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className={`text-lg font-extrabold leading-tight truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {user.name}
                            </h2>
                            <div className={`flex items-center gap-1.5 text-sm mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Mail size={12} className="shrink-0" />
                                {user.email}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(57,123,156,0.10)', color: B.blue }}>
                                <ShieldCheck size={12} />
                                {roleLabel}
                            </span>
                            {joinedDate && (
                                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                                    ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                    <Calendar size={12} />
                                    Desde {joinedDate}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Forms grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Info personal */}
                    <SectionCard
                        icon={User}
                        title="Información Personal"
                        subtitle="Nombre y correo electrónico"
                        isDark={isDark}
                        className="lg:col-span-2"
                    >
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </SectionCard>

                    {/* Contraseña */}
                    <SectionCard
                        icon={Lock}
                        title="Cambiar Contraseña"
                        subtitle="Usá una contraseña segura y única"
                        isDark={isDark}
                        className="lg:col-span-3"
                    >
                        <UpdatePasswordForm />
                    </SectionCard>
                </div>

                {/* ── Compact delete zone — oculto para Super Admin ────── */}
                {!user.is_super_admin && (
                    <div className={`rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4
                        ${isDark ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50/60 border-red-200/60'}`}>
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 mt-0.5">
                                <Trash2 size={13} className="text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Eliminar cuenta</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-red-500/70' : 'text-red-500/80'}`}>
                                    Acción permanente e irreversible. Se borrarán todos tus datos.
                                </p>
                            </div>
                        </div>
                        <DeleteUserForm compact />
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
