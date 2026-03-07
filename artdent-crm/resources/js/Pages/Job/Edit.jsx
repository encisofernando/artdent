import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft, Save, BriefcaseMedical, User as UserIcon, Calendar,
    FileText, Activity, Layers, Receipt, PlusCircle, Trash2, ShieldPlus
} from 'lucide-react';
import Odontogram from '@/Components/Odontogram';

export default function Edit({ auth, item, dentists, patients, jobTypes, users, tariffs }) {
    const { isDark } = useTheme();

    const [isOdontogramOpen, setIsOdontogramOpen] = useState(false);

    // Prepare initial items and teeth
    const initialItems = (item.job_items || []).map(i => ({
        id: i.id, // Keep track of existing IDs
        tariff_id: i.tariff_id || '',
        description: i.description || '',
        quantity: i.quantity || 1,
        unit_price: i.unit_price || 0,
    }));

    const initialTeeth = (item.job_teeths || []).map(t => ({
        tooth: t.tooth_number,
        note: t.notes || ''
    }));

    const { data, setData, put, processing, errors } = useForm({
        dentist_id: item.dentist_id || '',
        patient_name: item.patient_id ? (patients.find(p => p.id === item.patient_id)?.name || '') : '',
        job_type_id: item.job_type_id || '',
        assigned_user_id: item.assigned_user_id || '',
        status: item.status || 'received',
        priority: item.priority || 'normal',
        description: item.description || '',
        clinical_notes: item.clinical_notes || '',
        shade: item.shade || '',
        received_at: item.received_at ? item.received_at.substring(0, 10) : '',
        due_date: item.due_date ? item.due_date.substring(0, 10) : '',
        delivered_at: item.delivered_at ? item.delivered_at.substring(0, 10) : '',
        discount_amount: item.discount_amount || 0,
        notes: item.notes || '',
        items: initialItems,
        teeth: initialTeeth
    });

    // Generate Derived Values
    const filteredPatients = data.dentist_id
        ? patients.filter(p => p.dentist_id === parseInt(data.dentist_id))
        : patients;

    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
    const total = subtotal - Number(data.discount_amount);

    // Item Management
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

        // Auto-fill price and description when tariff changes
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
        put(route('jobs.update', item.id));
    };

    // Styling helpers
    const inputClasses = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Orden #${item.job_number}`} />

            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Editar Orden #{item.job_number}
                            </h1>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${isDark ? 'bg-slate-800 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                                {data.status === 'received' && 'Pendiente'}
                                {data.status === 'in_progress' && 'En Proceso'}
                                {data.status === 'quality_check' && 'En Prueba'}
                                {data.status === 'ready' && 'Terminado'}
                                {data.status === 'delivered' && 'Entregado'}
                                {data.status === 'cancelled' && 'Cancelado'}
                            </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modifica los detalles del trabajo enviado por el odontólogo.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('jobs.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver a la Lista
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col xl:flex-row gap-6">

                    {/* Left Column: Form Details */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* 1. Cliente y Paciente */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
                                <UserIcon size={18} style={{ color: B.teal }} />
                                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Cliente y Paciente
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Odontólogo / Clínica *</label>
                                    <select
                                        value={data.dentist_id}
                                        onChange={e => {
                                            setData('dentist_id', e.target.value);
                                            // Reset patient if dentist changes
                                            setData('patient_name', '');
                                        }}
                                        className={inputClasses}
                                        required
                                    >
                                        <option value="">Seleccione un Odontólogo...</option>
                                        {dentists.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} {d.contact_name ? `(${d.contact_name})` : ''}</option>
                                        ))}
                                    </select>
                                    {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                                </div>

                                <div>
                                    <label className={labelClasses}>Paciente</label>
                                    <input
                                        type="text"
                                        list="patients-list-edit"
                                        value={data.patient_name}
                                        onChange={e => setData('patient_name', e.target.value)}
                                        className={inputClasses}
                                        disabled={!data.dentist_id}
                                        placeholder={data.dentist_id ? "Nombre del paciente (se creará si no existe)..." : "Seleccione un odontólogo primero"}
                                    />
                                    <datalist id="patients-list-edit">
                                        {filteredPatients.map(p => (
                                            <option key={p.id} value={p.name} />
                                        ))}
                                    </datalist>
                                    {errors.patient_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.patient_name}</div>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Detalles del Trabajo */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b justify-between
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
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
                                    Editar Dientes ({data.teeth.length})
                                </button>
                            </div>

                            {/* Teeth Selection Preview */}
                            {data.teeth.length > 0 ? (
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
                            ) : (
                                <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">No se han seleccionado piezas dentales.</p>
                                </div>
                            )}
                            {errors.teeth && <div className="text-red-500 text-xs mb-4 font-medium">{errors.teeth}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClasses}>Tipo de Trabajo</label>
                                    <select
                                        value={data.job_type_id}
                                        onChange={e => setData('job_type_id', e.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="">Categoría General...</option>
                                        {jobTypes.map(jt => (
                                            <option key={jt.id} value={jt.id}>{jt.name}</option>
                                        ))}
                                    </select>
                                    {errors.job_type_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.job_type_id}</div>}
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

                        {/* 3. Items / Aranceles */}
                        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-6 pb-2 border-b justify-between
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
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
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No hay aranceles en esta orden.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <div className="col-span-5 border-r border-slate-200 dark:border-slate-700">Arancel / Descripción</div>
                                        <div className="col-span-2 text-center border-r border-slate-200 dark:border-slate-700">Cant.</div>
                                        <div className="col-span-2 text-right border-r border-slate-200 dark:border-slate-700 pr-2">Precio U.</div>
                                        <div className="col-span-2 text-right pr-2">Subtotal</div>
                                        <div className="col-span-1 border-slate-200 dark:border-slate-700"></div>
                                    </div>

                                    {data.items.map((item, index) => (
                                        <div key={index} className={`relative flex flex-col md:grid md:grid-cols-12 gap-4 items-center p-4 md:p-2 rounded-xl border md:border-transparent md:border-b
                                            ${isDark ? 'border-slate-700/50 bg-slate-800/20 md:bg-transparent md:border-b-slate-800' : 'border-slate-200 bg-slate-50/50 md:bg-transparent md:border-b-slate-100'}
                                        `}>
                                            <div className="col-span-5 w-full space-y-2">
                                                <select
                                                    value={item.tariff_id}
                                                    onChange={e => handleItemChange(index, 'tariff_id', e.target.value)}
                                                    className={inputClasses}
                                                    required
                                                >
                                                    <option value="">Seleccionar Lista de Precios...</option>
                                                    {tariffs.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} (Base: ${t.price})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                    className={`${inputClasses} text-xs`}
                                                    placeholder="Detalle adicional..."
                                                    required
                                                />
                                                {errors[`items.${index}.tariff_id`] && <div className="text-red-500 text-[10px]">{errors[`items.${index}.tariff_id`]}</div>}
                                            </div>

                                            <div className="col-span-2 w-full flex items-center md:justify-center">
                                                <span className="md:hidden text-xs font-bold text-slate-500 w-24">Cant:</span>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                    className={`${inputClasses} text-center`}
                                                    step="0.01"
                                                    min="0.01"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-2 w-full flex items-center md:justify-end relative">
                                                <span className="md:hidden text-xs font-bold text-slate-500 w-24">Precio:</span>
                                                <div className="absolute inset-y-0 left-0 pl-3 md:pl-2 flex items-center pointer-events-none md:hidden">
                                                    <span className="text-slate-400 text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                                    className={`${inputClasses} text-right pl-6 md:pl-2`}
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-2 w-full flex items-center md:justify-end text-sm font-bold opacity-80 pl-24 md:pl-0 text-slate-700 dark:text-slate-300">
                                                {formatCurrency(Number(item.quantity) * Number(item.unit_price))}
                                            </div>

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

                    {/* Right Column: Status & Timeline */}
                    <div className="w-full xl:w-96 flex flex-col gap-6">

                        {/* Status Panel */}
                        <div className={`rounded-2xl border shadow-sm transition-colors overflow-hidden
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
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
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className={`${inputClasses} font-bold`}
                                        >
                                            <option value="received">Pendiente</option>
                                            <option value="in_progress">En Proceso</option>
                                            <option value="quality_check">En Prueba</option>
                                            <option value="ready">Terminado</option>
                                            <option value="delivered">Entregado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Prioridad</label>
                                        <select
                                            value={data.priority}
                                            onChange={e => setData('priority', e.target.value)}
                                            className={`${inputClasses} ${data.priority === 'Urgente' ? 'text-red-500 font-bold border-red-500/50' : ''}`}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="urgent">Urgente</option>
                                            <option value="rush">Extra Urgente / Baja</option>
                                        </select>
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
                                        {errors.received_at && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.received_at}</div>}
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
                                        {errors.due_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.due_date}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Panel */}
                        <div className={`rounded-2xl border p-6 shadow-sm transition-colors
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                        `}>
                            <div className={`flex items-center gap-2 mb-4 pb-2 border-b
                                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                            `}>
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
                                        className="w-24 text-right rounded-md border-slate-200 dark:border-slate-700 bg-transparent text-sm py-1 px-2 focus:ring-1"
                                    />
                                </div>
                                <div className={`flex justify-between items-center pt-3 border-t font-extrabold text-lg
                                    ${isDark ? 'border-slate-800 text-teal-400' : 'border-slate-200 text-teal-700'}
                                `}>
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
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </form>

            </div>

            <Odontogram
                open={isOdontogramOpen}
                onClose={() => setIsOdontogramOpen(false)}
                initialValue={data.teeth}
                onSelect={(selections) => {
                    setData('teeth', selections);
                }}
            />
        </AuthenticatedLayout>
    );
}
