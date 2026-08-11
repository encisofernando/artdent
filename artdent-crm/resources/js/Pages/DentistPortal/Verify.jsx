import { Head, useForm, usePage } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function Verify({ email }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ code: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        post(route('dentist-portal.verify.post'));
    };

    const cls = `w-full rounded-xl border px-4 py-3 text-sm text-center tracking-[0.5em] font-bold outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500' : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
    }`;

    return (
        <DentistPortalLayout>
            <Head title="Verificar código" />

            <div className="max-w-sm mx-auto mt-6 sm:mt-16">
                <div className={`rounded-2xl border shadow-sm p-6 sm:p-8 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <KeyRound size={22} className="text-white" />
                    </div>

                    <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Ingresá el código
                    </h1>
                    <p className={`text-sm mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {email ? <>Te lo mandamos a <strong>{email}</strong>.</> : 'Revisá tu email.'}
                    </p>

                    {flash?.success && (
                        <div className="flex items-start gap-2 mb-4 text-xs rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-emerald-500">
                            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoFocus
                                maxLength={4}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className={cls}
                            />
                            {errors.code && <p className="text-red-500 text-xs mt-1.5 text-center">{errors.code}</p>}
                        </div>

                        <label className={`flex items-center gap-2 text-sm select-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded"
                            />
                            Recordarme en este dispositivo (60 días)
                        </label>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 4}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            {processing ? <><Loader2 size={16} className="animate-spin" /> Verificando…</> : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
        </DentistPortalLayout>
    );
}
