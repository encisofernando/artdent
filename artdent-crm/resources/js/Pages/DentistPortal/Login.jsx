import { Head, useForm } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { IdCard, Loader2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function Login() {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({ identifier: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('dentist-portal.login.send'));
    };

    const cls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500' : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
    }`;

    return (
        <DentistPortalLayout>
            <Head title="Ingresar" />

            <div className="max-w-sm mx-auto mt-6 sm:mt-16">
                <div className={`rounded-2xl border shadow-sm p-6 sm:p-8 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <IdCard size={22} className="text-white" />
                    </div>

                    <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Ingresá a tu portal
                    </h1>
                    <p className={`text-sm mt-1 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Con tu email o tu DNI te mandamos un código de acceso.
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Email o DNI
                            </label>
                            <input
                                type="text"
                                autoFocus
                                value={data.identifier}
                                onChange={(e) => setData('identifier', e.target.value)}
                                placeholder="tu@email.com o 12345678"
                                className={cls}
                            />
                            {errors.identifier && <p className="text-red-500 text-xs mt-1.5">{errors.identifier}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.identifier.trim()}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            {processing ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : 'Enviar código'}
                        </button>
                    </form>
                </div>
            </div>
        </DentistPortalLayout>
    );
}
