import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Search } from 'lucide-react';
import axios from 'axios';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        dni: '',
        cuit: '',
        iva_condition: 'consumidor_final',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        is_active: 1,
    });

    const [padronLoading, setPadronLoading] = useState(false);
    const [padronResult, setPadronResult] = useState(null);
    const [padronError, setPadronError] = useState('');

    const handlePadronLookup = async () => {
        const cuit = data.cuit.replace(/\D/g, '');
        if (cuit.length !== 11) { setPadronError('El CUIT debe tener 11 dígitos.'); return; }
        setPadronLoading(true);
        setPadronError('');
        setPadronResult(null);
        try {
            const res = await axios.get(route('padron.lookup', { cuit }), { headers: { Accept: 'application/json' } });
            const d = res.data.data;
            setPadronResult(d);
            setData(prev => ({
                ...prev,
                name: d.razon_social || prev.name,
                address: d.direccion || prev.address,
                iva_condition: d.condicion_iva || prev.iva_condition,
            }));
        } catch (e) {
            setPadronError(e.response?.data?.error || 'No se encontró el CUIT en el padrón ARCA.');
        } finally {
            setPadronLoading(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
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
            <Head title="Nuevo Cliente" />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Cliente
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Alta de cliente o clínica en el sistema
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
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

                            {/* CUIT + Padrón */}
                            <div className="md:col-span-2">
                                <label className={labelClasses}>CUIT</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.cuit}
                                        onChange={e => { setData('cuit', e.target.value); setPadronResult(null); setPadronError(''); }}
                                        className={inputClasses + ' flex-1'}
                                        placeholder="Sin guiones ni espacios (11 dígitos)"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handlePadronLookup}
                                        disabled={padronLoading}
                                        className={`shrink-0 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} border`}
                                        variant="outline"
                                    >
                                        <Search size={15} className="mr-1.5" />
                                        {padronLoading ? 'Buscando…' : 'Buscar ARCA'}
                                    </Button>
                                </div>
                                {padronError && <div className="text-red-500 text-xs mt-1.5 font-medium">{padronError}</div>}
                                {errors.cuit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.cuit}</div>}
                                {padronResult && (
                                    <div className={`mt-2 p-3 rounded-xl text-sm border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-emerald-50 border-emerald-200 text-slate-700'}`}>
                                        <span className="font-semibold">{padronResult.razon_social}</span>
                                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}> · {padronResult.condicion_iva_label}</span>
                                        {padronResult.estado && padronResult.estado !== 'ACTIVO' && (
                                            <span className="text-amber-500 font-semibold"> · {padronResult.estado}</span>
                                        )}
                                    </div>
                                )}
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
                                Guardar Cliente
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}