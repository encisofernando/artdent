import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { Gift, Save, CheckCircle } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function LoyaltySettingsIndex({ auth, settings }) {
    const { isDark } = useTheme();
    const [saved, setSaved] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        is_enabled: settings.is_enabled ?? false,
        accrual_percentage: settings.accrual_percentage ?? 0,
        min_purchase_amount: settings.min_purchase_amount ?? '',
        max_redemption_percentage: settings.max_redemption_percentage ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('loyalty-settings.update'), {
            onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
        });
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Puntos de fidelización" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Gift size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Puntos de fidelización
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Se acumulan igual comprando en el local o en la tienda online, y se pueden canjear en cualquiera de los dos.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className={`rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                    <div className={`flex items-center justify-between gap-4 px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={`text-xs font-semibold ${data.is_enabled ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                            {data.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                        <label className="flex items-center cursor-pointer gap-2">
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={data.is_enabled}
                                    onChange={e => setData('is_enabled', e.target.checked)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_enabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </label>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={lbl}>% de acumulación</label>
                                <input type="number" step="0.01" min="0" max="100" className={inp}
                                    value={data.accrual_percentage}
                                    onChange={e => setData('accrual_percentage', e.target.value)} placeholder="5" />
                                {errors.accrual_percentage && <p className="text-xs text-red-500 mt-1">{errors.accrual_percentage}</p>}
                                <p className="text-xs text-slate-400 mt-1">Porcentaje del total de la compra que se acredita como puntos. Definí cuánto vale cada punto en Recompensas de Puntos.</p>
                            </div>
                            <div>
                                <label className={lbl}>Compra mínima para acumular</label>
                                <input type="number" step="0.01" min="0" className={inp}
                                    value={data.min_purchase_amount}
                                    onChange={e => setData('min_purchase_amount', e.target.value)} placeholder="Sin mínimo" />
                                <p className="text-xs text-slate-400 mt-1">Dejalo vacío si no querés poner un piso.</p>
                            </div>
                            <div>
                                <label className={lbl}>Tope de canje (% del total)</label>
                                <input type="number" step="0.01" min="0" max="100" className={inp}
                                    value={data.max_redemption_percentage}
                                    onChange={e => setData('max_redemption_percentage', e.target.value)} placeholder="Sin tope" />
                                <p className="text-xs text-slate-400 mt-1">Cuánto del total de una compra se puede pagar con puntos. Vacío = sin límite.</p>
                            </div>
                        </div>

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
