import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/button';
import {
    CreditCard, Building2, Copy, Check, Calendar,
    DollarSign, AlertCircle, ArrowRight, ShieldCheck, X
} from 'lucide-react';

export default function PaymentAdvanceModal({ show, onClose, currentPlan, bankDetails }) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('online'); // 'online' | 'transfer'
    const [copiedField, setCopiedField] = useState(null);

    const pricePerMonth = Number(currentPlan?.price || 15000);

    // Formulario MercadoPago (pago único / adelanto)
    const mpForm = useForm({
        months: 1,
        plan_id: currentPlan?.id || '',
    });

    // Formulario Notificar Transferencia
    const transferForm = useForm({
        amount: pricePerMonth,
        paid_at: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
    });

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleMpSubmit = (e) => {
        e.preventDefault();
        mpForm.post(route('subscription.advance-checkout'));
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        transferForm.post(route('subscription.report-transfer'), {
            onSuccess: () => {
                transferForm.reset();
                onClose();
            },
        });
    };

    const cardCls = isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800';
    const inputCls = isDark
        ? 'w-full rounded-lg border-slate-700 bg-slate-900/60 text-slate-100 text-sm focus:border-blue-500 focus:ring-blue-500'
        : 'w-full rounded-lg border-slate-300 bg-white text-slate-900 text-sm focus:border-blue-500 focus:ring-blue-500';
    const labelCls = isDark ? 'block text-xs font-semibold text-slate-300 mb-1' : 'block text-xs font-semibold text-slate-700 mb-1';

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className={`p-6 ${cardCls}`}>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-bold">Pagar cuota o adelantar abono</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Plan actual: <strong className="text-blue-500">{currentPlan?.name || 'Starter'}</strong> (${pricePerMonth.toLocaleString('es-AR')} / mes)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 mt-4 mb-5">
                    <button
                        type="button"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                            activeTab === 'online'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        onClick={() => setActiveTab('online')}
                    >
                        <CreditCard size={15} /> Pago Online (MercadoPago)
                    </button>
                    <button
                        type="button"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                            activeTab === 'transfer'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                        onClick={() => setActiveTab('transfer')}
                    >
                        <Building2 size={15} /> Transferencia Bancaria
                    </button>
                </div>

                {/* TAB 1: MERCADOPAGO ONLINE */}
                {activeTab === 'online' && (
                    <form onSubmit={handleMpSubmit} className="space-y-4">
                        <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                            Podés pagar 1 mes o adelantar los meses que prefieras. Podrás abonar con tarjeta de crédito, débito, dinero en MercadoPago o cupones de pago (Rapipago/Pago Fácil).
                        </div>

                        <div>
                            <label className={labelCls}>Período a abonar / adelantar</label>
                            <div className="grid grid-cols-3 gap-2 mt-1.5">
                                {[
                                    { months: 1, label: '1 mes' },
                                    { months: 2, label: '2 meses' },
                                    { months: 3, label: '3 meses' },
                                    { months: 6, label: '6 meses' },
                                    { months: 12, label: '12 meses' },
                                ].map((opt) => (
                                    <button
                                        key={opt.months}
                                        type="button"
                                        onClick={() => mpForm.setData('months', opt.months)}
                                        className={`p-2.5 rounded-lg border text-center transition-all ${
                                            mpForm.data.months === opt.months
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="text-xs">{opt.label}</div>
                                        <div className="text-xs font-bold mt-0.5">
                                            ${(pricePerMonth * opt.months).toLocaleString('es-AR')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resumen */}
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span>Abono mensual:</span>
                                <span>${pricePerMonth.toLocaleString('es-AR')} ARS</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span>Cantidad de meses:</span>
                                <span>{mpForm.data.months}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between text-sm font-bold">
                                <span>Total a pagar:</span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    ${(pricePerMonth * mpForm.data.months).toLocaleString('es-AR')} ARS
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                disabled={mpForm.processing}
                            >
                                <CreditCard size={16} />
                                {mpForm.processing ? 'Redirigiendo a MercadoPago...' : 'Pagar con MercadoPago'}
                                <ArrowRight size={15} />
                            </Button>
                        </div>
                    </form>
                )}

                {/* TAB 2: TRANSFERENCIA BANCARIA */}
                {activeTab === 'transfer' && (
                    <div className="space-y-4">
                        {/* Datos bancarios */}
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                <Building2 size={14} className="text-blue-500" /> Datos para transferir:
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Banco</span>
                                    <span className="font-medium">{bankDetails?.bank_name || 'Banco Santander'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Titular</span>
                                    <span className="font-medium">{bankDetails?.account_holder || 'ArtCode SRL'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">CUIT</span>
                                    <span className="font-medium">{bankDetails?.cuit || '30-71829345-8'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Alias</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {bankDetails?.alias || 'ARTCODE.PAGOS'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(bankDetails?.alias || 'ARTCODE.PAGOS', 'alias')}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                            title="Copiar Alias"
                                        >
                                            {copiedField === 'alias' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block text-[11px]">CBU / CVU</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono font-medium text-xs break-all">
                                            {bankDetails?.cbu || '0720023420000001234567'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(bankDetails?.cbu || '0720023420000001234567', 'cbu')}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                            title="Copiar CBU"
                                        >
                                            {copiedField === 'cbu' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de reporte */}
                        <form onSubmit={handleTransferSubmit} className="space-y-3 pt-1">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Informar comprobante de pago:
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Monto transferido ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className={inputCls}
                                        value={transferForm.data.amount}
                                        onChange={(e) => transferForm.setData('amount', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Fecha de transferencia *</label>
                                    <input
                                        type="date"
                                        required
                                        className={inputCls}
                                        value={transferForm.data.paid_at}
                                        onChange={(e) => transferForm.setData('paid_at', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>N° de comprobante / Referencia bancaria *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: 178334185439 o código de transferencia"
                                    className={inputCls}
                                    value={transferForm.data.reference}
                                    onChange={(e) => transferForm.setData('reference', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Observaciones (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Pago cuota octubre / Banco Santander"
                                    className={inputCls}
                                    value={transferForm.data.notes}
                                    onChange={(e) => transferForm.setData('notes', e.target.value)}
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                                    disabled={transferForm.processing}
                                >
                                    <ShieldCheck size={16} />
                                    {transferForm.processing ? 'Enviando...' : 'Informar transferencia'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
}
