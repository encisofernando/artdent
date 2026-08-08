import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { Wallet, Save, CheckCircle } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function CashRegisterSettingsIndex({ auth, settings }) {
    const { isDark } = useTheme();
    const [saved, setSaved] = useState(false);

    const { data, setData, put, processing } = useForm({
        is_enabled: settings.is_enabled ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('cash-register-settings.update'), {
            onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Caja — Configuración" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Wallet size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Caja
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Apertura/cierre de caja con arqueo. Si tu negocio no maneja caja física
                            (solo pagos digitales), dejalo apagado y el sistema vende con normalidad.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className={`rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                    <div className={`flex items-center justify-between gap-4 px-6 py-4 ${data.is_enabled ? 'border-b' : ''} ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div>
                            <span className={`text-xs font-semibold block ${data.is_enabled ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                {data.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                            </span>
                            {data.is_enabled && (
                                <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Con esto prendido, hace falta abrir caja para poder vender, y si a
                                    alguien le queda una caja abierta de un día anterior el sistema lo
                                    obliga a cerrarla antes de seguir. Sólo afecta a Ventas — no a
                                    Laboratorio ni al e-commerce.
                                </p>
                            )}
                        </div>
                        <label className="flex items-center cursor-pointer gap-2 shrink-0">
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={data.is_enabled}
                                    onChange={e => setData('is_enabled', e.target.checked)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_enabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </label>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {saved && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                                <CheckCircle size={16} /> Guardado correctamente
                            </div>
                        )}

                        <div className="flex justify-end pt-1">
                            <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                                <Save size={15} /> {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
