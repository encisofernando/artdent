import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default function Edit({ auth, item }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        address: item.address || '',
        city: item.city || '',
        province: item.province || 'Formosa',
        postal_code: item.postal_code || '',
        phone: item.phone || '',
        schedule: item.schedule || '',
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? '',
        notes: item.notes || '',
        is_active: item.is_active ?? true,
        accepts_cash_payment: item.accepts_cash_payment ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('shipping-pickup-points.update', item.id));
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1.5 font-medium';
    const section = `rounded-2xl border p-6 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar: ${item.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Punto de Retiro
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</p>
                    </div>
                    <Link href={route('shipping-pickup-points.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft size={15} className="mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className={section}>
                    <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <MapPin size={18} className="text-teal-500" />
                        <h2 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Datos del punto</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={lbl}>Nombre del punto *</label>
                            <input className={inp} value={data.name} onChange={e => setData('name', e.target.value)} />
                            {errors.name && <p className={err}>{errors.name}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={lbl}>Dirección *</label>
                            <input className={inp} value={data.address} onChange={e => setData('address', e.target.value)} />
                            {errors.address && <p className={err}>{errors.address}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Ciudad *</label>
                            <input className={inp} value={data.city} onChange={e => setData('city', e.target.value)} />
                            {errors.city && <p className={err}>{errors.city}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Provincia *</label>
                            <input className={inp} value={data.province} onChange={e => setData('province', e.target.value)} />
                            {errors.province && <p className={err}>{errors.province}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Código Postal</label>
                            <input className={inp} value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} />
                            {errors.postal_code && <p className={err}>{errors.postal_code}</p>}
                        </div>

                        <div>
                            <label className={lbl}>Teléfono</label>
                            <input className={inp} value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            {errors.phone && <p className={err}>{errors.phone}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={lbl}>Horario de atención</label>
                            <input className={inp} value={data.schedule} onChange={e => setData('schedule', e.target.value)} />
                            {errors.schedule && <p className={err}>{errors.schedule}</p>}
                        </div>
                    </div>
                </div>

                <div className={section}>
                    <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Ubicación en mapa</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={lbl}>Latitud</label>
                            <input className={inp} type="number" step="any" value={data.latitude} onChange={e => setData('latitude', e.target.value)} />
                            {errors.latitude && <p className={err}>{errors.latitude}</p>}
                        </div>
                        <div>
                            <label className={lbl}>Longitud</label>
                            <input className={inp} type="number" step="any" value={data.longitude} onChange={e => setData('longitude', e.target.value)} />
                            {errors.longitude && <p className={err}>{errors.longitude}</p>}
                        </div>
                    </div>

                    {/* Map preview */}
                    {data.latitude && data.longitude && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <iframe
                                title="Ubicación"
                                width="100%"
                                height="220"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(data.longitude) - 0.005},${Number(data.latitude) - 0.005},${Number(data.longitude) + 0.005},${Number(data.latitude) + 0.005}&layer=mapnik&marker=${data.latitude},${data.longitude}`}
                            />
                        </div>
                    )}
                </div>

                <div className={section}>
                    <div className="grid gap-4">
                        <div>
                            <label className={lbl}>Notas internas</label>
                            <textarea className={inp} rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            {errors.notes && <p className={err}>{errors.notes}</p>}
                        </div>

                        <label className={`flex items-center cursor-pointer gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_active ? 'translate-x-4' : ''}`} />
                            </div>
                            <span className="font-medium text-sm">Punto activo (visible en el checkout)</span>
                        </label>

                        <label className={`flex items-center cursor-pointer gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={data.accepts_cash_payment} onChange={e => setData('accepts_cash_payment', e.target.checked)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${data.accepts_cash_payment ? 'bg-amber-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.accepts_cash_payment ? 'translate-x-4' : ''}`} />
                            </div>
                            <span className="font-medium text-sm">Acepta pago en efectivo</span>
                        </label>
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
