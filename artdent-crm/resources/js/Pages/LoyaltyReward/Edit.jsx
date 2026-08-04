import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Gift } from 'lucide-react';

export default function Edit({ auth, item }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        points_cost: item.points_cost ?? '',
        discount_amount: item.discount_amount ?? '',
        is_active: item.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('loyalty-rewards.update', item.id));
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1.5 font-medium';
    const section = `rounded-2xl border p-6 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar: ${item.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-6 font-sans max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Recompensa
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</p>
                    </div>
                    <Link href={route('loyalty-rewards.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft size={15} className="mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className={section}>
                    <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <Gift size={18} className="text-teal-500" />
                        <h2 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Datos de la recompensa</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={lbl}>Nombre *</label>
                            <input className={inp} value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <p className={err}>{errors.name}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Puntos necesarios *</label>
                            <input className={inp} type="number" min="1" step="1" value={data.points_cost} onChange={e => setData('points_cost', e.target.value)} />
                            {errors.points_cost && <p className={err}>{errors.points_cost}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Descuento que otorga *</label>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                                <input className={`${inp} pl-7`} type="number" min="0" step="0.01" value={data.discount_amount} onChange={e => setData('discount_amount', e.target.value)} />
                            </div>
                            {errors.discount_amount && <p className={err}>{errors.discount_amount}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={`flex items-center cursor-pointer gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_active ? 'translate-x-4' : ''}`} />
                                </div>
                                <span className="font-medium text-sm">Recompensa activa (disponible para canjear)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-32">
                        <Save size={15} /> {processing ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
