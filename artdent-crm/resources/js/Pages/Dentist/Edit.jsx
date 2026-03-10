import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Info, Building2, MapPin, Banknote, Search, X, Briefcase } from 'lucide-react';

export default function Edit({ auth, item, tariffs = [], customPrices = {} }) {
    const { isDark } = useTheme();

    // Initialize custom_prices array from the backend mapped data
    const initialCustomPrices = tariffs.map(t => {
        const cp = customPrices[t.id];
        return {
            tariff_id: t.id,
            price: cp ? cp.price : ''
        };
    });

    const { data, setData, put, processing, errors } = useForm({
        type: item.type || 'individual',
        name: item.name || '',
        contact_name: item.contact_name || '',
        code: item.code || '',
        email: item.email || '',
        phone: item.phone || '',
        phone_alt: item.phone_alt || '',
        whatsapp: item.whatsapp || '',
        address: item.address || '',
        city: item.city || '',
        province: item.province || '',
        postal_code: item.postal_code || '',
        cuit: item.cuit || '',
        iva_condition: item.iva_condition || 'consumidor_final',
        license_number: item.license_number || '',
        credit_limit: item.credit_limit || '',
        payment_days: item.payment_days || 0,
        is_active: item.is_active !== undefined ? item.is_active : 1,
        notes: item.notes || '',
        specialty: item.specialty || '',
        zone: item.zone || '',
        instagram: item.instagram || '',
        website: item.website || '',
        source: item.source || '',
        discount_pct: item.discount_pct || '',
        preferred_delivery_day: item.preferred_delivery_day || '',
        custom_prices: initialCustomPrices
    });

    const [tariffSearch, setTariffSearch] = useState('');

    const submit = (e) => {
        e.preventDefault();
        put(route('dentists.update', item.id));
    };

    const handleCustomPriceChange = (tariffId, newValue) => {
        const value = newValue === '' ? '' : Number(newValue);
        const newPrices = data.custom_prices.map(cp => {
            if (cp.tariff_id === tariffId) {
                return { ...cp, price: value };
            }
            return cp;
        });
        setData('custom_prices', newPrices);
    };

    const clearCustomPrice = (tariffId) => {
        handleCustomPriceChange(tariffId, '');
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const B = { blue: "#397B9C", teal: "#49949C" };

    const filteredTariffs = tariffs.filter(t =>
        t.name.toLowerCase().includes(tariffSearch.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(tariffSearch.toLowerCase()))
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Odontólogo - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Odontólogo
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando a <strong>{item.name}</strong>
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
                                    <select
                                        value={data.iva_condition}
                                        onChange={e => setData('iva_condition', e.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="consumidor_final">Consumidor Final</option>
                                        <option value="responsable_inscripto">Responsable Inscripto</option>
                                        <option value="monotributista">Monotributista</option>
                                        <option value="exento">Exento</option>
                                    </select>
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
                                <select
                                    value={data.source}
                                    onChange={e => setData('source', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="referido">Referido</option>
                                    <option value="publicidad">Publicidad</option>
                                    <option value="espontaneo">Espontáneo</option>
                                    <option value="red_social">Red Social</option>
                                    <option value="otro">Otro</option>
                                </select>
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
                                <select
                                    value={data.preferred_delivery_day}
                                    onChange={e => setData('preferred_delivery_day', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Sin preferencia</option>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6">Sábado</option>
                                    <option value="7">Domingo</option>
                                </select>
                                {errors.preferred_delivery_day && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.preferred_delivery_day}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Custom Tariffs Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Banknote size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Precios Personalizados (Aranceles)
                                </h2>
                            </div>
                            <div className={`flex items-center px-3 py-1.5 rounded-xl border transition-colors w-full sm:w-64
                                ${isDark ? 'bg-slate-800/50 border-slate-700 focus-within:border-slate-500' : 'bg-slate-50 border-slate-200 focus-within:border-slate-400'}
                            `}>
                                <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                <input
                                    type="text"
                                    placeholder="Buscar trabajo o categoría..."
                                    value={tariffSearch}
                                    onChange={(e) => setTariffSearch(e.target.value)}
                                    className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full
                                        ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                    `}
                                />
                            </div>
                        </div>

                        <div className={`rounded-xl border overflow-hidden
                            ${isDark ? 'border-slate-800' : 'border-slate-200'}
                        `}>
                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className={`text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm
                                        ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        <tr>
                                            <th className="px-4 py-3">Trabajo / Categoría</th>
                                            <th className="px-4 py-3 text-right">Precio Base</th>
                                            <th className="px-4 py-3">Precio Acordado (Personalizado)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTariffs.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No se encontraron aranceles activos.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTariffs.map((t) => {
                                                const currentCustom = data.custom_prices.find(cp => cp.tariff_id === t.id);
                                                const hasCustomPrice = currentCustom && currentCustom.price !== '';

                                                return (
                                                    <tr key={t.id} className={`border-b last:border-0 transition-colors
                                                        ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50/50'}
                                                    `}>
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-900 dark:text-slate-200">{t.name}</div>
                                                            {t.category && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.category}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded-md
                                                                ${hasCustomPrice ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'}`}
                                                            >
                                                                {formatCurrency(t.price)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                                <div className="relative flex-1">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 text-sm">
                                                                        $
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="Usar precio base"
                                                                        value={currentCustom ? currentCustom.price : ''}
                                                                        onChange={(e) => handleCustomPriceChange(t.id, e.target.value)}
                                                                        className={`w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-teal-500/20
                                                                            ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500'
                                                                                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500'}
                                                                            ${hasCustomPrice ? 'border-teal-500/50 bg-teal-50/50 dark:bg-teal-900/10' : ''}
                                                                        `}
                                                                    />
                                                                </div>
                                                                {hasCustomPrice && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => clearCustomPrice(t.id)}
                                                                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Restablecer a precio base"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
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
                            Actualizar Odontólogo
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
