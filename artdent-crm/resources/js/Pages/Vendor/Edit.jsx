import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';
import { ArrowLeft, Save, Store, Factory } from 'lucide-react';

export default function Edit({ auth, item }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        contact_name: item.contact_name || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        cuit: item.cuit || '',
        iva_condition: item.iva_condition || '',
        is_active: item.is_active === false || item.is_active === 0 ? 0 : 1,
        notes: item.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('vendors.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Proveedor - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Proveedor
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando: {item.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('vendors.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Store size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos de la Empresa
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Razón Social o Nombre *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Distribuidora S.A."
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>CUIT</label>
                                <input
                                    type="text"
                                    value={data.cuit}
                                    onChange={e => setData('cuit', e.target.value)}
                                    className={inputClasses}
                                    placeholder="00-00000000-0"
                                />
                                {errors.cuit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.cuit}</div>}
                            </div>
                            
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Condición frente al IVA</label>
                                <SearchableSelect
                                    value={data.iva_condition}
                                    onChange={v => setData('iva_condition', v)}
                                    placeholder="Seleccione..."
                                    options={[
                                        { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                                        { value: 'monotributista', label: 'Monotributista' },
                                        { value: 'exento', label: 'Exento' },
                                    ]}
                                />
                                {errors.iva_condition && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.iva_condition}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Factory size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Contacto y Configuración
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre del Contacto</label>
                                <input
                                    type="text"
                                    value={data.contact_name}
                                    onChange={e => setData('contact_name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Martín (Ventas)"
                                />
                                {errors.contact_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.contact_name}</div>}
                            </div>
                            
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Teléfono</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.phone && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Dirección</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.address && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</div>}
                            </div>

                            <div className="md:col-span-2 flex items-center mt-2 border-t pt-4 dark:border-slate-800">
                                <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.is_active === 1 || data.is_active === true}
                                            onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true)
                                            ? 'bg-emerald-500'
                                            : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                        }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'transform translate-x-4' : ''
                                        }`}></div>
                                    </div>
                                    <div className="ml-3 font-medium text-sm">
                                        Proveedor Activo
                                    </div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Notas Internas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Comentarios, condiciones especiales..."
                                    rows="3"
                                />
                                {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('vendors.index')}>
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
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
