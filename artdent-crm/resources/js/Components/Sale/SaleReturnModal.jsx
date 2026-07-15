import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, RotateCcw } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function SaleReturnModal({ sale, isDark, onClose, toast }) {
    const returnableItems = (sale.sale_items || [])
        .map((item) => ({ ...item, remaining: (item.quantity ?? 0) - (item.returned_quantity ?? 0) }))
        .filter((item) => item.remaining > 0.0001);

    const [quantities, setQuantities] = useState({});
    const [reason, setReason] = useState('');
    const [refundMethod, setRefundMethod] = useState(sale.customer ? 'store_credit' : 'cash');
    const [processing, setProcessing] = useState(false);

    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const setQty = (itemId, value, max) => {
        const num = Math.max(0, Math.min(parseFloat(value || 0), max));
        setQuantities((prev) => ({ ...prev, [itemId]: num }));
    };

    const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);
    const totalRefund = selectedItems.reduce((sum, [itemId, qty]) => {
        const item = returnableItems.find((i) => String(i.id) === String(itemId));
        return sum + (item ? item.unit_price * qty : 0);
    }, 0);

    const submit = () => {
        if (selectedItems.length === 0) return;

        setProcessing(true);
        router.post(route('sales.returns.store', sale.id), {
            reason: reason || null,
            refund_method: refundMethod,
            items: selectedItems.map(([sale_item_id, quantity]) => ({ sale_item_id, quantity })),
        }, {
            preserveScroll: true,
            onSuccess: () => { toast?.success?.('Devolución registrada correctamente.'); onClose(); },
            onError: (errs) => { toast?.error?.(Object.values(errs)[0] ?? 'No se pudo registrar la devolución.'); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        <RotateCcw size={18} /> Cambio / Devolución
                    </h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <X size={15} />
                    </button>
                </div>

                {returnableItems.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No quedan artículos disponibles para devolver en esta venta.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            {returnableItems.map((item) => (
                                <div key={item.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.product_name}</p>
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmt(item.unit_price)} c/u · disponibles: {item.remaining}</p>
                                    </div>
                                    <input type="number" min="0" max={item.remaining} step="0.01"
                                        value={quantities[item.id] ?? ''}
                                        onChange={(e) => setQty(item.id, e.target.value, item.remaining)}
                                        className={`${inputCls} w-24 shrink-0`} placeholder="0" />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className={labelCls}>Motivo</label>
                            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder="Ej: producto con falla, cambio de talle..." />
                        </div>

                        <div>
                            <label className={labelCls}>Reintegro</label>
                            <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className={inputCls}>
                                <option value="cash">Efectivo (caja abierta)</option>
                                <option value="store_credit" disabled={!sale.customer}>Nota de crédito (cuenta corriente){!sale.customer && ' — requiere cliente'}</option>
                                <option value="none">Sin reintegro monetario (solo cambio de mercadería)</option>
                            </select>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
                            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Total a reintegrar</span>
                            <span className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(totalRefund)}</span>
                        </div>

                        <button onClick={submit} disabled={selectedItems.length === 0 || processing}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                            style={{ background: 'linear-gradient(90deg, #B23A3A, #397B9C)' }}>
                            {processing ? 'Procesando...' : 'Confirmar devolución'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
