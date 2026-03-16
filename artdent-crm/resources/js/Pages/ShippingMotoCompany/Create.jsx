import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Bike } from 'lucide-react';

export default function Create({ auth }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        price: '',
        zone: 'Formosa Capital',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('shipping-moto-companies.store'));
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1.5 font-medium';
    const section = `rounded-2xl border p-6 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Empresa de Moto Mandados" />

            <form onSubmit={submit} className="flex flex-col gap-6 font-sans max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nueva Empresa
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Agregar empresa de moto mandados
                        </p>
                    </div>
                    <Link href={route('shipping-moto-companies.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft size={15} className="mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className={section}>
                    <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <Bike size={18} className="text-teal-500" />
                        <h2 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Datos de la empresa</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={lbl}>Nombre de la empresa *</label>
                            <input className={inp} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej: Moto Express Formosa" />
                            {errors.name && <p className={err}>{errors.name}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Teléfono</label>
                            <input className={inp} value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+54 370 000-0000" />
                            {errors.phone && <p className={err}>{errors.phone}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Precio del envío *</label>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                                <input className={`${inp} pl-7`} type="number" min="0" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} placeholder="0.00" />
                            </div>
                            {errors.price && <p className={err}>{errors.price}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={lbl}>Zona de cobertura</label>
                            <input className={inp} value={data.zone} onChange={e => setData('zone', e.target.value)} placeholder="Formosa Capital" />
                            {errors.zone && <p className={err}>{errors.zone}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={lbl}>Notas</label>
                            <textarea className={inp} rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Horarios, condiciones especiales..." />
                            {errors.notes && <p className={err}>{errors.notes}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={`flex items-center cursor-pointer gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_active ? 'translate-x-4' : ''}`} />
                                </div>
                                <span className="font-medium text-sm">Empresa activa (disponible en el checkout)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-32">
                        <Save size={15} /> {processing ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
