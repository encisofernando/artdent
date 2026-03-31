import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Info, Building2, MapPin, Briefcase } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        type: 'individual', // 'individual' or 'clinic'
        name: '',
        contact_name: '',
        code: '',
        email: '',
        phone: '',
        phone_alt: '',
        whatsapp: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        cuit: '',
        iva_condition: 'consumidor_final',
        license_number: '',
        credit_limit: '',
        payment_days: 0,
        is_active: 1,
        notes: '',
        specialty: '',
        zone: '',
        instagram: '',
        website: '',
        source: '',
        discount_pct: '',
        preferred_delivery_day: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dentists.store'));
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
            <Head title="Nuevo Odontólogo" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Odontólogo
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar un nuevo cliente para el laboratorio
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('dentists.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Select Type */}
                    <div className={`p-1.5 rounded-2xl flex border w-fit shadow-sm
                        ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}
                    `}>
                        <button
                            type="button"
                            onClick={() => setData('type', 'individual')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all
                                ${data.type === 'individual'
                                    ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}
                            `}
                        >
                            Profesional
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('type', 'clinic')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all
                                ${data.type === 'clinic'
                                    ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}
                            `}
                        >
                            Clínica / Centro
                        </button>
                    </div>

                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Info size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Información Principal
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>
                                    {data.type === 'individual' ? 'Nombre y Apellido *' : 'Nombre de la Clínica *'}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder={data.type === 'individual' ? "Dr. Juan Pérez" : "Centro Odontológico Salud"}
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            {data.type === 'clinic' && (
                                <div>
                                    <label className={labelClasses}>Contacto Principal</label>
                                    <input
                                        type="text"
                                        value={data.contact_name}
                                        onChange={e => setData('contact_name', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Nombre de la persona de contacto..."
                                    />
                                    {errors.contact_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.contact_name}</div>}
                                </div>
                            )}

                            <div>
                                <label className={labelClasses}>Código Interno / Matrícula</label>
                                <input
                                    type="text"
                                    value={data.license_number}
                                    onChange={e => setData('license_number', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. MP-123456"
                                />
                                {errors.license_number && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.license_number}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={inputClasses}
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</div>}
                            </div>

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

                            <div>
                                <label className={labelClasses}>Teléfono Alternativo</label>
                                <input
                                    type="text"
                                    value={data.phone_alt}
                                    onChange={e => setData('phone_alt', e.target.value)}
                                    className={inputClasses}
                                    placeholder="+54 9 11 8765-4321"
                                />
                                {errors.phone_alt && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone_alt}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>WhatsApp</label>
                                <input
                                    type="text"
                                    value={data.whatsapp}
                                    onChange={e => setData('whatsapp', e.target.value)}
                                    className={inputClasses}
                                    placeholder="+54 9 11 1234-5678"
                                />
                                {errors.whatsapp && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.whatsapp}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Location & Billing Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors h-fit
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
                                <MapPin size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Ubicación
                                </h2>
                            </div>

                            <div className="flex flex-col gap-6">
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Ciudad</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={e => setData('city', e.target.value)}
                                            className={inputClasses}
                                            placeholder="CABA"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Provincia</label>
                                        <input
                                            type="text"
                                            value={data.province}
                                            onChange={e => setData('province', e.target.value)}
                                            className={inputClasses}
                                            placeholder="Buenos Aires"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Código Postal</label>
                                    <input
                                        type="text"
                                        value={data.postal_code}
                                        onChange={e => setData('postal_code', e.target.value)}
                                        className={inputClasses}
                                        placeholder="1425"
                                    />
                                    {errors.postal_code && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.postal_code}</div>}
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors h-fit
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
                                <Building2 size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Facturación y Cuenta
                                </h2>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className={labelClasses}>CUIT / DNI</label>
                                    <input
                                        type="text"
                                        value={data.cuit}
                                        onChange={e => setData('cuit', e.target.value)}
                                        className={inputClasses}
                                        placeholder="20-12345678-9"
                                    />
                                    {errors.cuit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.cuit}</div>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Condición frente al IVA</label>
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Días de Pago</label>
                                        <input
                                            type="number"
                                            value={data.payment_days}
                                            onChange={e => setData('payment_days', e.target.value)}
                                            className={inputClasses}
                                            placeholder="0"
                                            min="0"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Días de plazo en C/C</p>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Límite de Crédito</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.credit_limit}
                                            onChange={e => setData('credit_limit', e.target.value)}
                                            className={inputClasses}
                                            placeholder="Opcional..."
                                        />
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center mt-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <label className={labelClasses}>Notas adicionales</label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className={inputClasses}
                            placeholder="Preferencias del odontólogo, horarios de retiro, etc."
                            rows="3"
                        />
                    </div>

                    {/* CRM Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Briefcase size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Perfil CRM y Comercial
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Especialidad</label>
                                <input
                                    type="text"
                                    value={data.specialty}
                                    onChange={e => setData('specialty', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Ortodoncia, Implantología..."
                                />
                                {errors.specialty && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.specialty}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Zona</label>
                                <input
                                    type="text"
                                    value={data.zone}
                                    onChange={e => setData('zone', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Norte, Sur, Centro..."
                                />
                                {errors.zone && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.zone}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Instagram</label>
                                <input
                                    type="text"
                                    value={data.instagram}
                                    onChange={e => setData('instagram', e.target.value)}
                                    className={inputClasses}
                                    placeholder="@usuario"
                                />
                                {errors.instagram && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.instagram}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Sitio Web</label>
                                <input
                                    type="text"
                                    value={data.website}
                                    onChange={e => setData('website', e.target.value)}
                                    className={inputClasses}
                                    placeholder="https://..."
                                />
                                {errors.website && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.website}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Origen / Fuente</label>
                                <SearchableSelect
                                    value={data.source || ''}
                                    onChange={v => setData('source', v)}
                                    placeholder="Seleccionar..."
                                    options={[
                                        { value: 'referido', label: 'Referido' },
                                        { value: 'publicidad', label: 'Publicidad' },
                                        { value: 'espontaneo', label: 'Espontáneo' },
                                        { value: 'red_social', label: 'Red Social' },
                                        { value: 'otro', label: 'Otro' },
                                    ]}
                                />
                                {errors.source && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.source}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Descuento (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.discount_pct}
                                    onChange={e => setData('discount_pct', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0.00"
                                />
                                {errors.discount_pct && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.discount_pct}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Día de Entrega Preferido</label>
                                <SearchableSelect
                                    value={String(data.preferred_delivery_day || '')}
                                    onChange={v => setData('preferred_delivery_day', v)}
                                    placeholder="Sin preferencia"
                                    options={[
                                        { value: '1', label: 'Lunes' },
                                        { value: '2', label: 'Martes' },
                                        { value: '3', label: 'Miércoles' },
                                        { value: '4', label: 'Jueves' },
                                        { value: '5', label: 'Viernes' },
                                        { value: '6', label: 'Sábado' },
                                        { value: '7', label: 'Domingo' },
                                    ]}
                                />
                                {errors.preferred_delivery_day && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.preferred_delivery_day}</div>}
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('dentists.index')}>
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
                            Guardar Odontólogo
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
