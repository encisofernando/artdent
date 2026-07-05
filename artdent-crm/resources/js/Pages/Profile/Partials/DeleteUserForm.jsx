import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteUserForm({ compact = false }) {
    const { isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    return (
        <div className={compact ? '' : 'space-y-4'}>
            {!compact && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Una vez eliminada, toda la información de tu cuenta será borrada permanentemente.
                    Asegurate de descargar cualquier dato que quieras conservar antes de continuar.
                </p>
            )}

            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 bg-red-600 hover:bg-red-700 whitespace-nowrap shrink-0"
            >
                <Trash2 size={13} />
                Eliminar cuenta
            </button>

            <Modal show={open} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                ¿Eliminar tu cuenta?
                            </h2>
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Esta acción es permanente. Ingresá tu contraseña para confirmar.
                            </p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5
                            ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Contraseña
                        </label>
                        <input
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                                ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-red-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-red-400'
                                }`}
                        />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-semibold transition-colors
                                ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all"
                        >
                            <Trash2 size={13} />
                            Sí, eliminar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
