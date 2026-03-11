import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Building2, WalletCards, FileText } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth, dentists, paymentMethods }) {
    const { isDark } = useTheme();

    const { data, setData, post, processing, errors } = useForm({
        dentist_id: '',
        amount: '',
        payment_method_id: '',
        description: 'Pago a cuenta',
        move_date: new Date().toISOString().split('T')[0]
    });

    const selectedDentist = dentists.find(d => d.id === parseInt(data.dentist_id));
    const currentBalance = selectedDentist?.lab_account?.balance || 0;

    const submit = (e) => {
        e.preventDefault();
        post(route('lab-account-moves.store'));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const dentistOptions = dentists.map(d => ({
        value: d.id,
        label: `${d.name}${d.last_name ? ' ' + d.last_name : ''} — Saldo: ${formatCurrency(d.lab_account?.balance || 0)}`
    }));

    const paymentMethodOptions = paymentMethods.map(pm => ({
        value: pm.id,
        label: pm.name
    }));

    const inputClasses = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Registrar Pago" />

            <div className="flex flex-col gap-6 font-sans max-w-2xl mx-auto pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Registrar Pago
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Ingresa un pago o abono recibido de un odontólogo.
                        </p>
                    </div>
                    <Link href={route('lab-account-moves.index')}>
                        <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300" : ""}>
                            <ArrowLeft className="mr-2" size={16} />
                            Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className={`rounded-3xl border shadow-lg overflow-hidden transition-colors
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}
                >
                    <div className="p-6 md:p-8 space-y-6">

                        {/* 1. Odontólogo */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                                <Building2 size={18} />
                                <h2 className="font-bold text-sm uppercase tracking-wider">Detalles del Cliente</h2>
                            </div>
                            <div>
                                <label className={labelClasses}>Odontólogo / Clínica *</label>
                                <SearchableSelect
                                    options={dentistOptions}
                                    value={data.dentist_id}
                                    onChange={val => setData('dentist_id', val)}
                                    placeholder="Seleccione un Odontólogo..."
                                    required
                                    error={errors.dentist_id}
                                />
                                {errors.dentist_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.dentist_id}</div>}
                            </div>

                            {/* Saldo Preview */}
                            {data.dentist_id && (
                                <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between
                                    ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}
                                `}>
                                    <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saldo Actual en Cuenta:</span>
                                    <span className={`text-lg font-bold ${currentBalance > 0 ? 'text-red-500' : currentBalance < 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                        {formatCurrency(currentBalance)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. Detalles del Pago */}
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                                <WalletCards size={18} />
                                <h2 className="font-bold text-sm uppercase tracking-wider">Información del Pago</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Monto a Acreditar ($) *</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className={`${inputClasses} font-bold text-lg text-emerald-600 dark:text-emerald-400`}
                                        placeholder="0"
                                        required
                                    />
                                    {errors.amount && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.amount}</div>}
                                </div>

                                <div>
                                    <label className={labelClasses}>Fecha del Pago *</label>
                                    <input
                                        type="date"
                                        value={data.move_date}
                                        onChange={e => setData('move_date', e.target.value)}
                                        className={inputClasses}
                                        required
                                    />
                                    {errors.move_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.move_date}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Método de Pago *</label>
                                    <SearchableSelect
                                        options={paymentMethodOptions}
                                        value={data.payment_method_id}
                                        onChange={val => setData('payment_method_id', val)}
                                        placeholder="Seleccionar método..."
                                        required
                                        error={errors.payment_method_id}
                                    />
                                    {errors.payment_method_id && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.payment_method_id}</div>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Descripción / Concepto *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                            <FileText size={16} className="text-slate-400" />
                                        </div>
                                        <textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className={`${inputClasses} pl-10`}
                                            rows="2"
                                            required
                                        />
                                    </div>
                                    {errors.description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Summary projection */}
                        {data.dentist_id && data.amount && (
                            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Saldo Resultante</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">El nuevo saldo de la cuenta será:</span>
                                </div>
                                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(currentBalance - parseFloat(data.amount || 0))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`p-4 md:p-6 border-t flex justify-end gap-3
                        ${isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 shadow-md"
                        >
                            <Save className="mr-2" size={18} />
                            Registrar y Acreditar
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
