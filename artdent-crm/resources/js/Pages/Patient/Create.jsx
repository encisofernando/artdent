import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, User, FileText, Phone } from 'lucide-react';

export default function Create({ auth, dentists }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        dentist_id: '',
        name: '',
        birth_date: '',
        gender: '',
        phone: '',
        email: '',
        dni: '',
        address: '',
        city: '',
        province: '',
        notes: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('patients.store'));
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
            <Head title="Nuevo Paciente" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Nuevo Paciente
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrar un paciente asociado a un odontólogo
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('patients.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">

                    {/* Dentist Selection Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className="mb-4">
                            <label className={labelClasses}>
                                Odontólogo / Clínica Asociada *
                            </label>
                            <select
                                value={data.dentist_id}
                                onChange={e => setData('dentist_id', e.target.value)}
                                className={inputClasses}
                                required
                            >
                                <option value="">-- Seleccionar Odontólogo --</option>
                                {dentists.map((dentist) => (
                                    <option key={dentist.id} value={dentist.id}>
                                        {dentist.name} {dentist.code ? `(${dentist.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                        </div>
                    </div>

                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <User size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos Personales
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Juan Pérez"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={e => setData('birth_date', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.birth_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.birth_date}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Género</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.gender && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.gender}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>
                                    <div className="flex items-center gap-1.5">
                                        <Phone size={14} /> Teléfono
                                    </div>
                                </label>
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
                                <label className={labelClasses}>DNI</label>
                                <input
                                    type="text"
                                    value={data.dni}
                                    onChange={e => setData('dni', e.target.value)}
                                    className={inputClasses}
                                    placeholder="12.345.678"
                                />
                                {errors.dni && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dni}</div>}
                            </div>

                            <div className="md:col-span-2">
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
                                <label className={labelClasses}>Ciudad</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    className={inputClasses}
                                    placeholder="CABA"
                                />
                                {errors.city && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.city}</div>}
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
                                {errors.province && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.province}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <FileText size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Historial Clínico / Notas
                            </h2>
                        </div>

                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className={inputClasses}
                            placeholder="Alergias, especificaciones, etc."
                            rows="4"
                        />
                        {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                    </div>


                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('patients.index')}>
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
                            Guardar Paciente
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
