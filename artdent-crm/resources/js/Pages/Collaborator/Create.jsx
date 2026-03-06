import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Info, UserRound, DollarSign } from 'lucide-react';

export default function Create({ auth }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        specialty: '',
        hourly_rate: '',
        is_active: 1,
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('collaborators.store'));
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
            <Head title="Nuevo Colaborador" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Colaborador
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Agregar un integrante al equipo
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('collaborators.index')}>
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
                            <UserRound size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos Personales
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Juan Pérez"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Documento (DNI/CUIT)</label>
                                <input
                                    type="text"
                                    value={data.document}
                                    onChange={e => setData('document', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.document && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.document}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Especialidad</label>
                                <input
                                    type="text"
                                    value={data.specialty}
                                    onChange={e => setData('specialty', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Técnico Dental"
                                />
                                {errors.specialty && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.specialty}</div>}
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
                        </div>
                    </div>

                    {/* Rates & Configuration */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <DollarSign size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Configuración y Honorarios
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Precio por Hora</label>
                                <div className="relative">
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold
                                        ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                    `}>
                                        $
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.hourly_rate}
                                        onChange={e => setData('hourly_rate', e.target.value)}
                                        className={`${inputClasses} pl-8`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.hourly_rate && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.hourly_rate}</div>}
                                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Sugerencia: configure el precio por hora, el sistema calculará importe automático en Asistencias.
                                </p>
                            </div>

                            <div className="md:col-span-1 flex items-center mt-2 md:mt-6">
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
                                        Activo
                                    </div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Notas Internas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Comentarios o notas..."
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
                        <Link href={route('collaborators.index')}>
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
                            Guardar Colaborador
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
