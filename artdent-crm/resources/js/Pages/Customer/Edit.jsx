import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';

export default function Edit({ auth, item, portalUrl }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        email: item.email || '',
        phone: item.phone || '',
        dni: item.dni || '',
        cuit: item.cuit || '',
        iva_condition: item.iva_condition || 'consumidor_final',
        address: item.address || '',
        city: item.city || '',
        province: item.province || '',
        postal_code: item.postal_code || '',
        is_active: item.is_active !== undefined ? item.is_active : 1,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Cliente - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Cliente
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando registros de <strong>{item.name}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {portalUrl && (
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className={`gap-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}>
                                    <ExternalLink size={14} />
                                    Ver Portal
                                </Button>
                            </a>
                        )}
                        <Link href={route('customers.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <form onSubmit={submit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre / Razón Social *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Clínica Dental Sonrisas"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            {/* CUIT */}
                            <div>
                                <label className={labelClasses}>CUIT</label>
                                <input
                                    type="text"
                                    value={data.cuit}
                                    onChange={e => setData('cuit', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Sin guiones (11 dígitos)"
                                />
                                {errors.cuit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.cuit}</div>}
                            </div>

                            {/* DNI */}
                            <div>
                                <label className={labelClasses}>DNI</label>
                                <input
                                    type="text"
                                    value={data.dni}
                                    onChange={e => setData('dni', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Sin guiones ni espacios"
                                />
                                {errors.dni && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dni}</div>}
                            </div>

                            {/* Condición IVA */}
                            <div>
                                <label className={labelClasses}>Condición IVA</label>
                                <SearchableSelect
                                    value={data.iva_condition}
                                    onChange={v => setData('iva_condition', v)}
                                    options={[
                                        { value: 'consumidor_final', label: 'Consumidor Final' },
                                        { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                                        { value: 'monotributista', label: 'Monotributista' },
                                        { value: 'exento', label: 'Exento' },
                                    ]}
                                />
                                {errors.iva_condition && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.iva_condition}</div>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={inputClasses}
                                    placeholder="contacto@clinica.com"
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</div>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={labelClasses}>Teléfono</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className={inputClasses}
                                    placeholder="+54 9 11 1234-5678"
                                />
                                {errors.phone && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</div>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className={labelClasses}>Dirección</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Av. Principal 123"
                                />
                                {errors.address && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</div>}
                            </div>

                            {/* City */}
                            <div>
                                <label className={labelClasses}>Ciudad</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.city && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.city}</div>}
                            </div>

                            {/* Province */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Provincia</label>
                                    <input
                                        type="text"
                                        value={data.province}
                                        onChange={e => setData('province', e.target.value)}
                                        className={inputClasses}
                                    />
                                    {errors.province && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.province}</div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>C. Postal</label>
                                    <input
                                        type="text"
                                        value={data.postal_code}
                                        onChange={e => setData('postal_code', e.target.value)}
                                        className={inputClasses}
                                    />
                                    {errors.postal_code && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.postal_code}</div>}
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="md:col-span-2 flex items-center mt-2">
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
                                        Cliente Activo
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className={`pt-6 mt-6 border-t flex justify-end gap-3
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Link href={route('customers.index')}>
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
                                className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md"
                            >
                                <Save className="mr-2" size={16} />
                                Actualizar Cliente
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}