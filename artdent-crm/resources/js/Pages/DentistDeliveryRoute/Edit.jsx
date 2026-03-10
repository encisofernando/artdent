import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Truck } from 'lucide-react';

const B = { blue: "#397B9C", teal: "#49949C" };

export default function Edit({ auth, item, dentists }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        dentist_id: item.dentist_id || '',
        route_name: item.route_name || '',
        delivery_day: item.delivery_day ? String(item.delivery_day) : '',
        delivery_order: item.delivery_order || '',
        address: item.address || '',
        contact_name: item.contact_name || '',
        contact_phone: item.contact_phone || '',
        notes: item.notes || '',
        is_active: item.is_active !== undefined ? item.is_active : true
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dentist-delivery-routes.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Editar Ruta de Entrega" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Ruta de Entrega
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando {item.route_name || `ruta #${item.id}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('dentist-delivery-routes.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Truck size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos de la Ruta
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Odontólogo *</label>
                                <select
                                    value={data.dentist_id}
                                    onChange={e => setData('dentist_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">-- Seleccionar odontólogo --</option>
                                    {dentists?.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Nombre de la Ruta</label>
                                <input
                                    type="text"
                                    value={data.route_name}
                                    onChange={e => setData('route_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Ruta Norte..."
                                />
                                {errors.route_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.route_name}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Día de Entrega</label>
                                <select
                                    value={data.delivery_day}
                                    onChange={e => setData('delivery_day', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Sin día asignado</option>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6">Sábado</option>
                                    <option value="7">Domingo</option>
                                </select>
                                {errors.delivery_day && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.delivery_day}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Orden de Entrega</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.delivery_order}
                                    onChange={e => setData('delivery_order', e.target.value)}
                                    className={inputClasses}
                                    placeholder="1"
                                />
                                {errors.delivery_order && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.delivery_order}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Dirección</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Av. Siempre Viva 123"
                                />
                                {errors.address && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Nombre de Contacto</label>
                                <input
                                    type="text"
                                    value={data.contact_name}
                                    onChange={e => setData('contact_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Nombre del recepcionista..."
                                />
                                {errors.contact_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.contact_name}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    value={data.contact_phone}
                                    onChange={e => setData('contact_phone', e.target.value)}
                                    className={inputClasses}
                                    placeholder="+54 9 11 1234-5678"
                                />
                                {errors.contact_phone && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.contact_phone}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Notas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Instrucciones especiales, referencias, etc."
                                    rows="3"
                                />
                                {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                            </div>

                            <div className="md:col-span-2 flex items-center pt-2">
                                <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.is_active === true || data.is_active === 1}
                                            onChange={e => setData('is_active', e.target.checked)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === true || data.is_active === 1)
                                            ? 'bg-emerald-500'
                                            : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                        }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === true || data.is_active === 1) ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 font-medium text-sm">Ruta Activa</div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('dentist-delivery-routes.index')}>
                            <Button
                                type="button"
                                variant="outline"
                                className={isDark ? "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800" : ""}
                            >
                                Cancelar
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save className="mr-2" size={16} />
                            Actualizar Ruta
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
