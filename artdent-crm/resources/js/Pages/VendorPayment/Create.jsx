import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';

export default function Create({ auth, vendors, paymentMethods }) {
    const { isDark } = useTheme();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        vendor_id: '',
        payment_method_id: '',
        amount: '',
        payment_date: today,
        reference_no: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('proveedores.pagos.store'));
    };

    const inputCls = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Registrar Pago a Proveedor" />

            <div className="flex flex-col gap-6 font-sans max-w-2xl mx-auto">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Registrar Pago
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Pago o cancelación de deuda a proveedor
                        </p>
                    </div>
                    <Link href={route('proveedores.pagos.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft className="mr-2" size={16} /> Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <CreditCard size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos del Pago
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Proveedor *</label>
                                <select value={data.vendor_id} onChange={e => setData('vendor_id', e.target.value)} className={inputCls} required>
                                    <option value="">Seleccionar proveedor...</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                                {errors.vendor_id && <p className="text-red-500 text-xs mt-1">{errors.vendor_id}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Monto *</label>
                                <input
                                    type="number" min="0.01" step="0.01"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className={inputCls}
                                    placeholder="0.00"
                                    required
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Fecha de Pago *</label>
                                <input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={e => setData('payment_date', e.target.value)}
                                    className={inputCls}
                                    required
                                />
                                {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Método de Pago</label>
                                <select value={data.payment_method_id} onChange={e => setData('payment_method_id', e.target.value)} className={inputCls}>
                                    <option value="">Sin especificar</option>
                                    {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Número de Referencia</label>
                                <input
                                    type="text"
                                    value={data.reference_no}
                                    onChange={e => setData('reference_no', e.target.value)}
                                    className={inputCls}
                                    placeholder="Cheque, transferencia, etc."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelCls}>Notas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputCls}
                                    rows="3"
                                    placeholder="Observaciones del pago..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-5 shadow-sm flex justify-end gap-3 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <Link href={route('proveedores.pagos.index')}>
                            <Button type="button" variant="outline" className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md">
                            <Save className="mr-2" size={16} />
                            Registrar Pago
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
