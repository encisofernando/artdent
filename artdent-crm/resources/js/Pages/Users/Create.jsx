import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function Field({ label, error, children, isDark }) {
    return (
        <div className="flex flex-col gap-1">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}

function Input({ isDark, ...props }) {
    return (
        <input
            {...props}
            className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                ${isDark
                    ? 'bg-[#1E293B] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400'
                }`}
        />
    );
}


export default function Create({ auth, roles, branches }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        phone:                 '',
        branch_id:             '',
        is_active:             true,
        roles:                 [],
    });

    const toggleRole = (id) => {
        setData('roles', data.roles.includes(id)
            ? data.roles.filter(r => r !== id)
            : [...data.roles, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Usuario" />

            <div className="flex flex-col gap-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('users.index')}>
                        <button className={`p-2 rounded-xl transition-colors
                            ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Usuario
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Creá una cuenta de acceso al sistema.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    {/* Datos personales */}
                    <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold mb-5 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Datos Personales
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nombre completo *" error={errors.name} isDark={isDark}>
                                <Input isDark={isDark} type="text" value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej: Juan García" />
                            </Field>

                            <Field label="Teléfono" error={errors.phone} isDark={isDark}>
                                <Input isDark={isDark} type="text" value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="Ej: +54 9 11 1234-5678" />
                            </Field>

                            <Field label="Correo electrónico *" error={errors.email} isDark={isDark}>
                                <Input isDark={isDark} type="email" value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="usuario@empresa.com" />
                            </Field>

                            <Field label="Sucursal" error={errors.branch_id} isDark={isDark}>
                                <SearchableSelect
                                    value={data.branch_id}
                                    onChange={v => setData('branch_id', v)}
                                    options={branches.map(b => ({ value: String(b.id), label: b.name }))}
                                    placeholder="Sin sucursal asignada"
                                    error={errors.branch_id}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold mb-5 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Contraseña
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Contraseña *" error={errors.password} isDark={isDark}>
                                <Input isDark={isDark} type="password" value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Mínimo 8 caracteres" />
                            </Field>

                            <Field label="Confirmar contraseña *" error={errors.password_confirmation} isDark={isDark}>
                                <Input isDark={isDark} type="password" value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="Repetir contraseña" />
                            </Field>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                        <div className="flex items-center gap-2 mb-5">
                            <ShieldCheck size={16} style={{ color: B.teal }} />
                            <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Roles de Acceso
                            </h2>
                        </div>
                        {errors.roles && <p className="text-xs text-red-400 mb-3">{errors.roles}</p>}
                        <div className="flex flex-col gap-2">
                            {roles.map(role => {
                                const selected = data.roles.includes(role.id);
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => toggleRole(role.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                                            ${selected
                                                ? isDark
                                                    ? 'border-teal-600/60 bg-teal-900/20'
                                                    : 'border-teal-400/60 bg-teal-50'
                                                : isDark
                                                    ? 'border-slate-700 hover:border-slate-600'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                                            ${selected ? 'border-teal-500 bg-teal-500' : isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                                            {selected && (
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {role.display_name}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {role.name}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estado */}
                    <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold mb-4 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Estado de la cuenta
                        </h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${data.is_active ? 'bg-teal-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                                    ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {data.is_active ? 'Cuenta activa' : 'Cuenta inactiva'}
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('users.index')}>
                            <Button type="button" variant="outline"
                                className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}
                            style={{ background: B.blue }} className="text-white gap-2">
                            <UserPlus size={15} />
                            {processing ? 'Guardando...' : 'Crear Usuario'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
