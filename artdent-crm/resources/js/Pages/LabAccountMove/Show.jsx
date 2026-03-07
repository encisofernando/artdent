import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Printer, Building2, WalletCards, Receipt, CalendarDays } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Show({ auth, move }) {
    const { isDark } = useTheme();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const formatDate = (dateString, includeTime = false) => {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('es-AR', options);
    };

    const isCredit = move.type === 'credit';
    const isDebit = move.type === 'debit';

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Comprobante #${move.id}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto pb-12 print:max-w-none print:pb-0">
                {/* Header Actions (Hidden when printing) */}
                <div className="flex items-center justify-between print:hidden">
                    <Link href={route('lab-account-moves.index')}>
                        <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300" : ""}>
                            <ArrowLeft className="mr-2" size={16} />
                            Volver a Cuentas
                        </Button>
                    </Link>
                    <Button
                        onClick={handlePrint}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <Printer className="mr-2" size={18} />
                        Imprimir / PDF
                    </Button>
                </div>

                {/* Printable Receipt Area */}
                <div className={`rounded-3xl border shadow-lg overflow-hidden transition-colors !bg-white !text-black
                    ${isDark ? 'border-slate-700/60' : 'border-slate-100'} 
                    print:shadow-none print:border-none print:rounded-none`}
                >
                    {/* Receipt Header */}
                    <div className="p-8 md:p-12 border-b border-slate-200 bg-slate-50 print:bg-transparent">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md">
                                    AD
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">ArtDent Lab</h1>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Laboratorio Dental y Fresado</p>
                                </div>
                            </div>

                            <div className="text-left md:text-right space-y-1">
                                <div className="text-4xl font-extrabold text-emerald-600 tracking-tighter">
                                    COMPROBANTE
                                </div>
                                <div className="text-lg font-bold text-slate-900">
                                    No. {String(move.id).padStart(6, '0')}
                                </div>
                                <div className="text-sm text-slate-500 font-medium flex items-center justify-start md:justify-end gap-1.5 mt-2">
                                    <CalendarDays size={14} />
                                    {formatDate(move.move_date || move.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-8 md:p-12 space-y-12 bg-white">

                        {/* Parties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* To */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <Building2 size={16} /> Odontólogo / Cliente
                                </h3>
                                <div className="space-y-1 text-slate-900">
                                    <div className="text-lg font-bold">{move.lab_account.dentist.name} {move.lab_account.dentist.last_name || ''}</div>
                                    {move.lab_account.dentist.contact_name && (
                                        <div className="text-sm text-slate-600">Contacto: {move.lab_account.dentist.contact_name}</div>
                                    )}
                                    {move.lab_account.dentist.phone && (
                                        <div className="text-sm text-slate-600">Tel: {move.lab_account.dentist.phone}</div>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <Receipt size={16} /> Información del Movimiento
                                </h3>
                                <div className="space-y-2 text-sm text-slate-900">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 font-medium">Tipo:</span>
                                        <span className="font-bold">
                                            {isCredit ? 'Pago a Cuenta' : 'Cargo por Trabajo'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 font-medium">Concepto:</span>
                                        <span className="font-bold text-right">{move.description}</span>
                                    </div>
                                    {move.payment_method && (
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500 font-medium">Forma de Pago:</span>
                                            <span className="font-bold">{move.payment_method.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 font-medium">Emitido por:</span>
                                        <span className="font-bold">{move.user?.name || 'Sistema'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-slate-200 gap-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    {isCredit ? 'Importe Abonado' : 'Importe Cargado'}
                                </h3>
                                <div className="text-slate-600 text-sm">
                                    {isCredit ? 'Este monto ha sido deducido del saldo deudor.' : 'Este monto ha sido sumado al saldo deudor.'}
                                </div>
                            </div>
                            <div className={`text-4xl md:text-5xl font-black ${isCredit ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {formatCurrency(move.amount)}
                            </div>
                        </div>

                        {/* Balance Remaining */}
                        <div className="flex justify-end pt-4">
                            <div className="w-full md:w-1/2 p-6 border-2 border-slate-100 rounded-2xl flex items-center justify-between">
                                <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Saldo Actual en Cuenta</span>
                                <span className="text-2xl font-black text-slate-900">{formatCurrency(move.balance_after)}</span>
                            </div>
                        </div>

                    </div>

                    {/* Footer Warning / Info */}
                    <div className="p-8 bg-slate-50 text-center border-t border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">
                            Documento no válido como factura. <br />
                            Reporte generado el {formatDate(new Date(), true)}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
