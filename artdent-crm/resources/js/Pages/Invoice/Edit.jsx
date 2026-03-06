import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Receipt, Building2, Calculator } from 'lucide-react';
import dayjs from 'dayjs';

export default function Edit({ auth, item, invoiceTypes }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        invoice_type_id: item.invoice_type_id || '',
        recipient_name: item.recipient_name || '',
        recipient_cuit: item.recipient_cuit || '',
        recipient_iva: item.recipient_iva || '',
        recipient_address: item.recipient_address || '',
        point_sale: item.point_sale || '',
        number: item.number || '',
        subtotal: item.subtotal || '',
        discount: item.discount || 0,
        tax_amount: item.tax_amount || '',
        total: item.total || '',
        status: item.status || 'draft',
        issued_at: item.issued_at ? dayjs(item.issued_at).format('YYYY-MM-DD') : '',
        due_date: item.due_date ? dayjs(item.due_date).format('YYYY-MM-DD') : '',
        notes: item.notes || '',
    });

    const calculateTotal = () => {
        const sub = parseFloat(data.subtotal || 0);
        const disc = parseFloat(data.discount || 0);
        const tax = parseFloat(data.tax_amount || 0);
        const calcTotal = sub - disc + tax;
        setData('total', calcTotal.toFixed(2));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('invoices.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Factura`} />

            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Factura
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Actualizando registro
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('invoices.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* General Header Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Receipt size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Comprobante
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Tipo *</label>
                                <select
                                    value={data.invoice_type_id}
                                    onChange={e => setData('invoice_type_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {invoiceTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.code} - {type.name}</option>
                                    ))}
                                </select>
                                {errors.invoice_type_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.invoice_type_id}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Punto de Venta</label>
                                <input
                                    type="number"
                                    value={data.point_sale}
                                    onChange={e => setData('point_sale', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0001"
                                />
                                {errors.point_sale && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.point_sale}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Número</label>
                                <input
                                    type="number"
                                    value={data.number}
                                    onChange={e => setData('number', e.target.value)}
                                    className={inputClasses}
                                    placeholder="00000001"
                                />
                                {errors.number && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.number}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Fecha de Emisión</label>
                                <input
                                    type="date"
                                    value={data.issued_at}
                                    onChange={e => setData('issued_at', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.issued_at && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.issued_at}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Recipient Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Building2 size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Receptor
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Razón Social o Nombre *</label>
                                <input
                                    type="text"
                                    value={data.recipient_name}
                                    onChange={e => setData('recipient_name', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                                {errors.recipient_name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.recipient_name}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>CUIT / DNI</label>
                                <input
                                    type="text"
                                    value={data.recipient_cuit}
                                    onChange={e => setData('recipient_cuit', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.recipient_cuit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.recipient_cuit}</div>}
                            </div>
                            
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Condición frente al IVA</label>
                                <select
                                    value={data.recipient_iva}
                                    onChange={e => setData('recipient_iva', e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                                    <option value="Monotributo">Monotributo</option>
                                    <option value="Exento">Exento</option>
                                    <option value="Consumidor Final">Consumidor Final</option>
                                </select>
                                {errors.recipient_iva && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.recipient_iva}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Dirección</label>
                                <input
                                    type="text"
                                    value={data.recipient_address}
                                    onChange={e => setData('recipient_address', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.recipient_address && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.recipient_address}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Financials & Status */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Calculator size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Totales y Estado
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Subtotal</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.subtotal}
                                        onBlur={calculateTotal}
                                        onChange={e => setData('subtotal', e.target.value)}
                                        className={`${inputClasses} pl-8`}
                                    />
                                </div>
                                {errors.subtotal && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.subtotal}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Impuestos (IVA)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.tax_amount}
                                        onBlur={calculateTotal}
                                        onChange={e => setData('tax_amount', e.target.value)}
                                        className={`${inputClasses} pl-8`}
                                    />
                                </div>
                                {errors.tax_amount && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.tax_amount}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Descuentos</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.discount}
                                        onBlur={calculateTotal}
                                        onChange={e => setData('discount', e.target.value)}
                                        className={`${inputClasses} pl-8`}
                                    />
                                </div>
                                {errors.discount && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.discount}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>TOTAL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold text-slate-500">$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.total}
                                        onChange={e => setData('total', e.target.value)}
                                        className={`${inputClasses} pl-8 font-bold border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-900/10`}
                                    />
                                </div>
                                {errors.total && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.total}</div>}
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <label className={labelClasses}>Estado *</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="issued">Emitida</option>
                                    <option value="paid">Pagada</option>
                                    <option value="cancelled">Anulada</option>
                                </select>
                                {errors.status && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.status}</div>}
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <label className={labelClasses}>Fecha de Vencimiento</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.due_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.due_date}</div>}
                            </div>

                            <div className="md:col-span-4">
                                <label className={labelClasses}>Notas adicionales</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    rows="2"
                                />
                                {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('invoices.index')}>
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
