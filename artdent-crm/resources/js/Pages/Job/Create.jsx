import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft, Save, BriefcaseMedical, User as UserIcon, Calendar,
    FileText, Activity, Layers, Receipt, PlusCircle, Trash2, ShieldPlus,
    Users
} from 'lucide-react';
import Odontogram from '@/Components/Odontogram';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth, dentists, patients, jobTypes, collaborators, tariffs }) {
    const { isDark } = useTheme();

    const [isOdontogramOpen, setIsOdontogramOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        dentist_id: '',
        patient_name: '',
        job_type_id: '',
        assigned_user_id: '',
        status: 'received',
        priority: 'normal',
        description: '',
        clinical_notes: '',
        shade: '',
        received_at: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivered_at: '',
        discount_amount: 0,
        notes: '',
        items: [],
        teeth: []
    });

    const filteredPatients = data.dentist_id
        ? patients.filter(p => p.dentist_id === parseInt(data.dentist_id))
        : patients;

    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
    const total = subtotal - Number(data.discount_amount);

    const addItem = () => {
        setData('items', [...data.items, { tariff_id: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;

        if (field === 'tariff_id' && value) {
            const selectedTariff = tariffs.find(t => t.id === parseInt(value));
            if (selectedTariff) {
                newItems[index].description = selectedTariff.name;
                newItems[index].unit_price = selectedTariff.price;
            }
        }

        setData('items', newItems);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('jobs.store'));
    };

    const inputClasses = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;


    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const B = { blue: "#397B9C", teal: "#49949C" };

    // Options for SearchableSelect
    const dentistOptions = dentists.map(d => ({ value: d.id, label: d.name }));
    const tariffOptions = tariffs.map(t => ({ value: t.id, label: `${t.name}  $${Number(t.price).toLocaleString('es-AR')}` }));
    const jobTypeOptions = [{ value: '', label: 'Categoría General...' }, ...jobTypes.map(jt => ({ value: jt.id, label: jt.name }))];
    const collaboratorOptions = collaborators.map(c => ({ value: c.id, label: c.name }));
    const statusOptions = [
        { value: 'received', label: 'Pendiente' },
        { value: 'in_progress', label: 'En Proceso' },
        { value: 'quality_check', label: 'En Prueba' },
        { value: 'ready', label: 'Terminado' },
        { value: 'delivered', label: 'Entregado' },
        { value: 'cancelled', label: 'Cancelado' },
    ];
    const priorityOptions = [
        { value: 'normal', label: 'Normal' },
        { value: 'urgent', label: 'Urgente' },
        { value: 'rush', label: 'Extra Urgente' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Orden de Trabajo" />

            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #397B9C, #49949C)' }}>
                            <BriefcaseMedical size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Nueva Orden de Trabajo
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Registra un nuevo trabajo enviado por un odontólogo.
                            </p>
                        </div>
                    </div>
                    <Link href={route('jobs.index')}>
                        <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                            <ArrowLeft className="mr-2" size={16} />
                            Volver a la Lista
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* 1. Cliente y Paciente */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <UserIcon size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Cliente y Paciente
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Odontólogo / Clínica *</label>
                                    <SearchableSelect
                                        options={dentistOptions}
                                        value={data.dentist_id}
                                        onChange={val => { setData('dentist_id', val); setData('patient_name', ''); }}
                                        placeholder="Buscar odontólogo..."
                                        required
                                        error={errors.dentist_id}
                                    />
                                </div>

                                <div>
                                    <label className={labelClasses}>Paciente</label>
                                    <input
                                        type="text"
                                        list="patients-list"
                                        value={data.patient_name}
                                        onChange={e => setData('patient_name', e.target.value)}
                                        className={inputClasses}
                                        disabled={!data.dentist_id}
                                        placeholder={data.dentist_id ? "Nombre del paciente..." : "Seleccione un odontólogo primero"}
                                    />
                                    <datalist id="patients-list">
                                        {filteredPatients.map(p => (
                                            <option key={p.id} value={p.name} />
                                        ))}
                                    </datalist>
                                    {errors.patient_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.patient_name}</div>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Especificaciones del Trabajo */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                    <BriefcaseMedical size={18} style={{ color: B.teal }} />
                                    <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        Especificaciones del Trabajo
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOdontogramOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600 dark:text-teal-400 rounded-lg border border-teal-500/20 hover:bg-teal-500/20 transition-all font-bold text-xs"
                                >
                                    <ShieldPlus size={14} />
                                    Seleccionar Dientes
                                </button>
                            </div>

                            {data.teeth.length > 0 && (
                                <div className="mb-6 p-4 rounded-xl border border-teal-500/30 bg-teal-500/5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                                        Odontograma ({data.teeth.length} piezas):
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.teeth.map((t, i) => (
                                            <div key={i} className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold flex gap-2">
                                                <span className="text-slate-800 dark:text-slate-200">{t.tooth}</span>
                                                {t.note && <span className="text-teal-600 dark:text-teal-400">{t.note}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.teeth && <div className="text-red-500 text-xs mb-4 font-medium">{errors.teeth}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClasses}>Tipo de Trabajo</label>
                                    <SearchableSelect
                                        options={jobTypeOptions}
                                        value={data.job_type_id}
                                        onChange={val => setData('job_type_id', val)}
                                        placeholder="Categoría General..."
                                        error={errors.job_type_id}
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className={labelClasses}>Color / Tono (Gral)</label>
                                    <input
                                        type="text"
                                        value={data.shade}
                                        onChange={e => setData('shade', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Ej. A2, A3, Blanco Bleach..."
                                    />
                                    {errors.shade && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.shade}</div>}
                                </div>

                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className={labelClasses}>Instrucciones / Descripción del Médico</label>
                                    <textarea
                                        value={data.clinical_notes}
                                        onChange={e => setData('clinical_notes', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Detalles sobre terminación, metales, pruebas, etc."
                                        rows="3"
                                    />
                                    {errors.clinical_notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.clinical_notes}</div>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Trabajos a Facturar */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                    <Layers size={18} style={{ color: B.teal }} />
                                    <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        Trabajos a Facturar
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors font-bold text-xs"
                                >
                                    <PlusCircle size={14} />
                                    Agregar Ítem
                                </button>
                            </div>

                            {errors.items && typeof errors.items === 'string' && (
                                <div className="text-red-500 text-xs mb-4 font-medium">{errors.items}</div>
                            )}

                            {data.items.length === 0 ? (
                                <div className="py-8 text-center flex flex-col items-center">
                                    <Receipt size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No has agregado ningún arancel todavía.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {/* Header row */}
                                    <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <div className="col-span-5">Arancel / Descripción</div>
                                        <div className="col-span-2 text-center">Cant.</div>
                                        <div className="col-span-2 text-right pr-2">Precio U.</div>
                                        <div className="col-span-2 text-right pr-2">Subtotal</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {data.items.map((item, index) => (
                                        <div key={index} className={`relative flex flex-col md:grid md:grid-cols-12 gap-3 items-start p-4 md:p-2 rounded-xl border md:border-transparent md:border-b
                                            ${isDark ? 'border-slate-700/50 bg-slate-800/20 md:bg-transparent md:border-b-slate-800' : 'border-slate-200 bg-slate-50/50 md:bg-transparent md:border-b-slate-100'}`}>

                                            {/* Arancel selector */}
                                            <div className="col-span-5 w-full">
                                                <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 mb-1 block">Arancel</span>
                                                <SearchableSelect
                                                    options={tariffOptions}
                                                    value={item.tariff_id}
                                                    onChange={val => handleItemChange(index, 'tariff_id', val)}
                                                    placeholder="Buscar arancel..."
                                                    required
                                                    error={errors[`items.${index}.tariff_id`]}
                                                />
                                            </div>

                                            {/* Cantidad — sin flechas */}
                                            <div className="col-span-2 w-full flex items-center md:justify-center">
                                                <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 w-20">Cant:</span>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                    className={`${inputClasses} text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                    min="1"
                                                    step="1"
                                                    required
                                                />
                                            </div>

                                            {/* Precio unitario — sin flechas */}
                                            <div className="col-span-2 w-full flex items-center md:justify-end">
                                                <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 w-20">Precio:</span>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                                    className={`${inputClasses} text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* Subtotal */}
                                            <div className="col-span-2 w-full flex items-center md:justify-end text-sm font-bold opacity-80 pl-20 md:pl-0 text-slate-700 dark:text-slate-300">
                                                {formatCurrency(Number(item.quantity) * Number(item.unit_price))}
                                            </div>

                                            {/* Eliminar */}
                                            <div className="col-span-1 w-full md:w-auto absolute top-4 right-4 md:static flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-96 lg:shrink-0 flex flex-col gap-6">

                        {/* Estado y Tiempos */}
                        <div className={`rounded-2xl border shadow-sm transition-colors overflow-hidden
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity size={18} style={{ color: B.blue }} />
                                    <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        Estado y Tiempos
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className={labelClasses}>Estado Actual *</label>
                                        <SearchableSelect
                                            options={statusOptions}
                                            value={data.status}
                                            onChange={val => setData('status', val)}
                                            placeholder="Seleccionar estado..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Prioridad</label>
                                        <SearchableSelect
                                            options={priorityOptions}
                                            value={data.priority}
                                            onChange={val => setData('priority', val)}
                                            placeholder="Seleccionar prioridad..."
                                        />
                                    </div>

                                    {/* Colaborador asignado */}
                                    <div>
                                        <label className={labelClasses}>
                                            <Users size={11} className="inline mr-1" />
                                            Colaborador Asignado
                                        </label>
                                        <SearchableSelect
                                            options={collaboratorOptions}
                                            value={data.assigned_user_id}
                                            onChange={val => setData('assigned_user_id', val)}
                                            placeholder="Asignar colaborador..."
                                            error={errors.assigned_user_id}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-4 bg-slate-50 dark:bg-slate-800/10">
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 text-slate-400" size={16} />
                                    <div className="flex-1">
                                        <label className={labelClasses}>Fecha Ingreso</label>
                                        <input
                                            type="date"
                                            value={data.received_at}
                                            onChange={e => setData('received_at', e.target.value)}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-0.5 text-amber-500" size={16} />
                                    <div className="flex-1">
                                        <label className={labelClasses}>Fecha Entrega (Prevista)</label>
                                        <input
                                            type="date"
                                            value={data.due_date}
                                            onChange={e => setData('due_date', e.target.value)}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen */}
                        <div className={`rounded-2xl border p-6 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <FileText size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Resumen
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3 text-sm">
                                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                    <span>Descuento ($):</span>
                                    <input
                                        type="number"
                                        value={data.discount_amount}
                                        onChange={e => setData('discount_amount', e.target.value)}
                                        className="w-24 text-right rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm py-1 px-2 focus:ring-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div className={`flex justify-between items-center pt-3 border-t font-extrabold text-lg
                                    ${isDark ? 'border-slate-800 text-teal-400' : 'border-slate-200 text-teal-700'}`}>
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                className="w-full text-white border-none shadow-md mt-6 h-12 text-base"
                            >
                                <Save className="mr-2" size={18} />
                                Registrar Orden
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <Odontogram
                open={isOdontogramOpen}
                onClose={() => setIsOdontogramOpen(false)}
                initialValue={data.teeth}
                onSelect={(selections) => setData('teeth', selections)}
            />
        </AuthenticatedLayout>
    );
}
