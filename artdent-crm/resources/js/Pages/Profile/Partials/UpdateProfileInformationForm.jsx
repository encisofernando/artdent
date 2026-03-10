import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Save } from 'lucide-react';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function Field({ label, children, error }) {
    const { isDark } = useTheme();
    return (
        <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5
                ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
            </label>
            {children}
            {error && <InputError className="mt-1.5" message={error} />}
        </div>
    );
}

function StyledInput({ className = '', ...props }) {
    const { isDark } = useTheme();
    return (
        <input
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                ${isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400'
                } ${className}`}
            {...props}
        />
    );
}

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { isDark } = useTheme();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name:  user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Field label="Nombre completo" error={errors.name}>
                <StyledInput
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Tu nombre"
                />
            </Field>

            <Field label="Correo electrónico" error={errors.email}>
                <StyledInput
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="tu@email.com"
                />
            </Field>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className={`text-xs rounded-xl px-4 py-3 border
                    ${isDark ? 'bg-yellow-900/20 border-yellow-700/40 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                    Tu email no está verificado.{' '}
                    <Link
                        href={route('verification.send')}
                        method="post"
                        as="button"
                        className="underline font-semibold hover:opacity-80"
                    >
                        Reenviar verificación
                    </Link>
                    {status === 'verification-link-sent' && (
                        <span className="block mt-1 font-medium" style={{ color: B.green }}>
                            ¡Email enviado!
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 pt-1">
                <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                >
                    <Save size={14} />
                    Guardar
                </button>
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0 translate-y-1"
                    leave="transition ease-in-out duration-300"
                    leaveTo="opacity-0"
                >
                    <p className="text-xs font-semibold" style={{ color: B.green }}>
                        ✓ Guardado
                    </p>
                </Transition>
            </div>
        </form>
    );
}
