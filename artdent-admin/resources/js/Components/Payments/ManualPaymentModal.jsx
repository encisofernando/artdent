import { useState, useEffect } from 'react';
import Modal from '@/Components/ui/Modal';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';
import { useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeftRight, QrCode, Banknote, MoreHorizontal, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ManualPaymentModal({ open, onClose, tenants, plans, preselectedTenantId, issuerConfigured, issuer }) {
    const { isDark } = useTheme();

    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 text-white focus:border-brand-cyan' : 'bg-white border-brand-aqua text-slate-900 focus:border-brand-cyan'
    }`;

    const todayStr = new Date().toISOString().slice(0, 10);
    const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data, setData, post, processing, errors, reset } = useForm({
        tenant_id: preselectedTenantId || '',
        plan_id: '',
        payment_method: 'transfer',
        amount: '',
        paid_at: todayStr,
        reference: '',
        notes: '',
        extend_subscription: true,
        next_payment_date: nextMonthStr,
        emit_invoice: false,
        receipt_type: 'auto',
        recipient_name: '',
        recipient_cuit: '',
        recipient_iva: 'consumidor_final',
        invoice_description: '',
    });

    useEffect(() => {
        if (preselectedTenantId) {
            setData('tenant_id', preselectedTenantId);
        }
    }, [preselectedTenantId]);

    // Cuando cambia el tenant, auto-completar su plan y precio
    useEffect(() => {
        if (!data.tenant_id) return;
        const tenant = tenants.find((t) => t.id === data.tenant_id);
        if (tenant) {
            const plan = plans.find((p) => p.slug === tenant.plan);
            if (plan) {
                setData((prev) => ({
                    ...prev,
                    plan_id: plan.id,
                    amount: prev.amount || plan.price,
                    recipient_name: prev.recipient_name || tenant.name,
                    invoice_description: prev.invoice_description || `Suscripción ${plan.name} — ${new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())}`,
                }));
            } else {
                setData((prev) => ({
                    ...prev,
                    recipient_name: prev.recipient_name || tenant.name,
                }));
            }
        }
    }, [data.tenant_id]);

    const handlePlanChange = (planId) => {
        const plan = plans.find((p) => String(p.id) === String(planId));
        setData((prev) => ({
            ...prev,
            plan_id: planId,
            amount: plan ? plan.price : prev.amount,
            invoice_description: plan ? `Suscripción ${plan.name} — ${new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())}` : prev.invoice_description,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const methods = [
        { id: 'transfer', label: 'Transferencia', icon: ArrowLeftRight },
        { id: 'qr', label: 'Pago QR', icon: QrCode },
        { id: 'cash', label: 'Efectivo', icon: Banknote },
        { id: 'other', label: 'Otro', icon: MoreHorizontal },
    ];

    return (
        <Modal open={open} onClose={onClose} title="Registrar Pago Manual">
            <form onSubmit={submit} className="space-y-4">
                {/* Selector de Tenant */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Empresa / Tenant *</label>
                    <select
                        required
                        className={cls}
                        value={data.tenant_id}
                        onChange={(e) => setData('tenant_id', e.target.value)}
                    >
                        <option value="">Seleccionar empresa…</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.id}) — Plan {t.plan}
                            </option>
                        ))}
                    </select>
                    {errors.tenant_id && <p className="text-rose-500 text-xs mt-1">{errors.tenant_id}</p>}
                </div>

                {/* Método de pago en botones tipo selector */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Método de pago *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {methods.map((m) => {
                            const Icon = m.icon;
                            const isSelected = data.payment_method === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setData('payment_method', m.id)}
                                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                                        isSelected
                                            ? 'bg-brand-cyan text-white border-brand-cyan shadow-sm ring-2 ring-brand-cyan/30'
                                            : isDark
                                                ? 'bg-brand-navy border-white/10 text-slate-300 hover:border-white/30'
                                                : 'bg-white border-brand-aqua/40 text-slate-700 hover:border-brand-cyan'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Plan y Monto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Plan imputado</label>
                        <select
                            className={cls}
                            value={data.plan_id}
                            onChange={(e) => handlePlanChange(e.target.value)}
                        >
                            <option value="">Seleccionar plan…</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (${Number(p.price).toLocaleString('es-AR')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Monto ($ ARS) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.00"
                            className={cls}
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
                    </div>
                </div>

                {/* Fecha y Referencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Fecha de pago *</label>
                        <input
                            type="date"
                            required
                            className={cls}
                            value={data.paid_at}
                            onChange={(e) => setData('paid_at', e.target.value)}
                        />
                        {errors.paid_at && <p className="text-rose-500 text-xs mt-1">{errors.paid_at}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">N° de referencia / Comprobante</label>
                        <input
                            type="text"
                            placeholder={data.payment_method === 'transfer' ? 'CBU / N° de operación' : 'Identificador / Recibo'}
                            className={cls}
                            value={data.reference}
                            onChange={(e) => setData('reference', e.target.value)}
                        />
                    </div>
                </div>

                {/* Notas / Observaciones */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Observaciones</label>
                    <input
                        type="text"
                        placeholder="Detalle adicional opcional…"
                        className={cls}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </div>

                {/* Switch: Actualizar vigencia del Tenant */}
                <div className={`p-3 rounded-lg border space-y-2.5 ${isDark ? 'bg-brand-navy/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold">Extender período de suscripción del tenant</p>
                            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Pone el tenant en estado "Activo" y actualiza la fecha de próximo cobro.
                            </p>
                        </div>
                        <Toggle
                            checked={data.extend_subscription}
                            onChange={() => setData('extend_subscription', !data.extend_subscription)}
                        />
                    </div>

                    {data.extend_subscription && (
                        <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                            <label className="text-xs font-semibold whitespace-nowrap">Nuevo vencimiento:</label>
                            <input
                                type="date"
                                className={`${cls} py-1.5 text-xs`}
                                value={data.next_payment_date}
                                onChange={(e) => setData('next_payment_date', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Switch: Emitir Factura Electrónica AFIP */}
                <div className={`p-3 rounded-lg border space-y-3 ${isDark ? 'bg-brand-navy/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className={issuerConfigured ? 'text-emerald-500' : 'text-amber-500'} />
                            <div>
                                <p className="text-xs font-bold">Emitir Factura Electrónica AFIP/ARCA ahora</p>
                                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {issuerConfigured
                                        ? `Conecta con WSFEv1 y genera el CAE para este pago (${issuer?.iva_condition === 'monotributista' ? 'Factura C' : 'Factura A/B'})`
                                        : 'El emisor AFIP no tiene certificados configurados en Facturación AFIP.'}
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={data.emit_invoice}
                            disabled={!issuerConfigured}
                            onChange={() => setData('emit_invoice', !data.emit_invoice)}
                        />
                    </div>

                    {data.emit_invoice && (
                        <div className="pt-3 border-t border-white/10 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Tipo de comprobante</label>
                                    <select
                                        className={`${cls} py-1.5 text-xs`}
                                        value={data.receipt_type}
                                        onChange={(e) => setData('receipt_type', e.target.value)}
                                    >
                                        <option value="auto">Automático (recomendado)</option>
                                        <option value="FC">Factura C (Monotributo)</option>
                                        <option value="FB">Factura B (Consumidor Final / Monotributo)</option>
                                        <option value="FA">Factura A (Responsable Inscripto con CUIT)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Condición IVA Receptor</label>
                                    <select
                                        className={`${cls} py-1.5 text-xs`}
                                        value={data.recipient_iva}
                                        onChange={(e) => setData('recipient_iva', e.target.value)}
                                    >
                                        <option value="consumidor_final">Consumidor Final</option>
                                        <option value="responsable_inscripto">IVA Responsable Inscripto</option>
                                        <option value="monotributista">Responsable Monotributo</option>
                                        <option value="exento">IVA Exento</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Razón Social receptor</label>
                                    <input
                                        type="text"
                                        className={`${cls} py-1.5 text-xs`}
                                        value={data.recipient_name}
                                        onChange={(e) => setData('recipient_name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">CUIT / DNI receptor (opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="20-xxxxxxxx-x o DNI"
                                        className={`${cls} py-1.5 text-xs`}
                                        value={data.recipient_cuit}
                                        onChange={(e) => setData('recipient_cuit', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">Concepto en la factura</label>
                                <input
                                    type="text"
                                    className={`${cls} py-1.5 text-xs`}
                                    value={data.invoice_description}
                                    onChange={(e) => setData('invoice_description', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={processing || !data.tenant_id || !data.amount}>
                        {processing ? 'Guardando…' : 'Registrar Pago'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
