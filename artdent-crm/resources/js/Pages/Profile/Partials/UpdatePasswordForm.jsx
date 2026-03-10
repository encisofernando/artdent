import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

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

export default function UpdatePasswordForm() {
    const { isDark } = useTheme();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const label = (text) => (
        <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5
            ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {text}
        </label>
    );

    return (
        <form onSubmit={updatePassword} className="space-y-5">
            <div>
                {label('Contraseña actual')}
                <StyledInput
                    id="current_password"
                    ref={currentPasswordInput}
                    type="password"
                    value={data.current_password}
                    onChange={e => setData('current_password', e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                />
                <InputError message={errors.current_password} className="mt-1.5" />
            </div>

            <div>
                {label('Nueva contraseña')}
                <StyledInput
                    id="password"
                    ref={passwordInput}
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                <InputError message={errors.password} className="mt-1.5" />
            </div>

            <div>
                {label('Confirmar contraseña')}
                <StyledInput
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={e => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                <InputError message={errors.password_confirmation} className="mt-1.5" />
            </div>

            <div className="flex items-center gap-4 pt-1">
                <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                >
                    <ShieldCheck size={14} />
                    Actualizar contraseña
                </button>
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out duration-300"
                    leaveTo="opacity-0"
                >
                    <p className="text-xs font-semibold" style={{ color: B.green }}>✓ Actualizada</p>
                </Transition>
            </div>
        </form>
    );
}
