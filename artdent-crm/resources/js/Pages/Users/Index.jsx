import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Users, Plus, Edit2, Trash2, Search, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const ROLE_COLORS = {
    admin:              { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
    lab_manager:        { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
    lab_operator:       { bg: 'rgba(249,115,22,0.12)', text: '#f97316' },
    seller:             { bg: 'rgba(57,123,156,0.12)', text: '#397B9C' },
    ecommerce_manager:  { bg: 'rgba(90,173,156,0.12)', text: '#5AAD9C' },
};

function RoleBadge({ role }) {
    const color = ROLE_COLORS[role.name] ?? { bg: 'rgba(100,116,139,0.12)', text: '#64748b' };
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: color.bg, color: color.text }}
        >
            {role.display_name ?? role.name}
        </span>
    );
}

export default function Index({ auth, users }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const row  = isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50';
    const th   = isDark ? 'text-slate-400' : 'text-slate-500';

    const destroy = (user) => {
        if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('users.destroy', user.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Usuarios" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Gestión de Usuarios
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Administrá las cuentas de usuario y sus roles de acceso.
                        </p>
                    </div>
                    <Link href={route('users.create')}>
                        <Button style={{ background: B.blue }} className="text-white gap-2">
                            <Plus size={16} />
                            Nuevo Usuario
                        </Button>
                    </Link>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border
                        ${isDark ? 'bg-green-900/20 border-green-700/40 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        <CheckCircle2 size={16} />
                        {flash.success}
                    </div>
                )}

                {/* Search */}
                <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-sm ${card}`}>
                    <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`flex-1 bg-transparent text-sm outline-none
                            ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className={isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}>
                            <XCircle size={15} />
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b text-xs uppercase tracking-wider font-semibold
                                    ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                                    <th className={`px-5 py-3 text-left ${th}`}>Usuario</th>
                                    <th className={`px-5 py-3 text-left ${th}`}>Teléfono</th>
                                    <th className={`px-5 py-3 text-left ${th}`}>Roles</th>
                                    <th className={`px-5 py-3 text-center ${th}`}>Estado</th>
                                    <th className={`px-5 py-3 text-center ${th}`}>Alta</th>
                                    <th className={`px-5 py-3 text-right ${th}`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={`px-5 py-10 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(user => (
                                    <tr key={user.id} className={`border-b transition-colors ${row}`}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: B.teal }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user.name}</p>
                                                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-5 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {user.phone ?? '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length === 0
                                                    ? <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>Sin roles</span>
                                                    : user.roles.map(r => <RoleBadge key={r.id} role={r} />)
                                                }
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {user.is_active
                                                ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                                                    <CheckCircle2 size={13} /> Activo
                                                </span>
                                                : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                                                    <XCircle size={13} /> Inactivo
                                                </span>
                                            }
                                        </td>
                                        <td className={`px-5 py-3 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {user.created_at}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('users.edit', user.id)}>
                                                    <button className={`p-1.5 rounded-lg transition-colors
                                                        ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                                        title="Editar usuario">
                                                        <Edit2 size={15} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => destroy(user)}
                                                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className={`px-5 py-3 border-t text-xs ${isDark ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
