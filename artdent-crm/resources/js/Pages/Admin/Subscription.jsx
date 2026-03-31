import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Infinity, Star, CreditCard, AlertCircle, CheckCircle2,
    Clock, XCircle, RefreshCcw, Zap, Shield, ChevronRight,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

const STATUS_LABELS = {
    trial:     { label: 'Período de prueba', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    active:    { label: 'Activo',            color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    suspended: { label: 'Suspendido',        color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    cancelled: { label: 'Cancelado',         color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

function StatusBadge({ status }) {
    const s = STATUS_LABELS[status] ?? STATUS_LABELS.cancelled;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${s.color} ${s.bg}`}>
            {status === 'active'    && <CheckCircle2 size={14} />}
            {status === 'trial'     && <Clock size={14} />}
            {status === 'suspended' && <AlertCircle size={14} />}
            {status === 'cancelled' && <XCircle size={14} />}
            {s.label}
        </span>
    );
}

function PlanCard({ plan, current, onSelect, disabled }) {
    const isCurrentPlan = current?.slug === plan.slug;
    const { isDark } = useTheme();

    return (
        <div className={`relative rounded-xl border-2 p-5 transition-all
            ${isCurrentPlan
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : isDark
                    ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                    : 'border-slate-200 bg-white hover:border-blue-300'}
        `}>
            {isCurrentPlan && (
                <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Plan actual
                </span>
            )}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {plan.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {plan.description}
                    </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        ${Number(plan.price).toLocaleString('es-AR')}
                    </span>
                    <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/mes</span>
                </div>
            </div>

            {plan.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                    {plan.features.map((f, i) => (
                        <li key={i} className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            {f}
                        </li>
                    ))}
                </ul>
            )}

            {!isCurrentPlan && (
                <Button
                    size="sm"
                    className="w-full"
                    disabled={disabled || !plan.mp_plan_id}
                    onClick={() => onSelect(plan.id)}
                    title={!plan.mp_plan_id ? 'Próximamente disponible' : ''}
                >
                    {plan.mp_plan_id ? (
                        <>Suscribirse <ChevronRight size={14} /></>
                    ) : (
                        'Próximamente'
                    )}
                </Button>
            )}
        </div>
    );
}

export default function Subscription({ tenant, subscription, plans }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const checkoutForm = useForm({ plan_id: '' });
    const cancelForm = useForm({});

    const handleSelectPlan = (planId) => {
        checkoutForm.setData('plan_id', planId);
        checkoutForm.post(route('subscription.checkout'));
    };

    const handleCancel = () => {
        cancelForm.post(route('subscription.cancel'), {
            onSuccess: () => setShowCancelConfirm(false),
        });
    };

    const card = isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200';
    const text = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    // ── Plan Owner: pantalla simplificada ──────────────────────────────────────
    if (tenant.plan === 'owner') {
        return (
            <AuthenticatedLayout>
                <Head title="Suscripción" />
                <div className="max-w-lg mx-auto px-4 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg">
                        <Infinity size={36} className="text-white" />
                    </div>
                    <h1 className={`text-2xl font-bold mb-2 ${text}`}>Plan Ilimitado</h1>
                    <p className={`${muted} mb-6`}>
                        Tu cuenta tiene acceso <strong className={text}>permanente e ilimitado</strong> a todas las funcionalidades de ArtDent. No se requiere suscripción ni pagos periódicos.
                    </p>
                    <div className={`rounded-xl p-5 ${card} text-left`}>
                        <ul className="space-y-2">
                            {['Usuarios ilimitados', 'Todas las funcionalidades', 'Soporte prioritario', 'Sin fecha de vencimiento'].map(f => (
                                <li key={f} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const currentPlanObj = plans.find(p => p.slug === tenant.plan);
    const trialEnd = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
    const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - new Date()) / 86400000)) : null;

    return (
        <AuthenticatedLayout>
            <Head title="Suscripción" />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Flash messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">
                        <CheckCircle2 size={16} /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                        <AlertCircle size={16} /> {flash.error}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-bold ${text}`}>Suscripción</h1>
                    <p className={`text-sm mt-1 ${muted}`}>Administrá tu plan y método de pago</p>
                </div>

                {/* Estado actual */}
                <div className={`rounded-xl p-6 ${card}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${muted}`}>Plan actual</p>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl font-bold ${text}`}>
                                    {currentPlanObj?.name ?? tenant.plan ?? 'Sin plan'}
                                </span>
                                <StatusBadge status={tenant.status} />
                            </div>

                            {tenant.status === 'trial' && trialEnd && (
                                <p className={`text-sm mt-2 ${daysLeft <= 3 ? 'text-red-500' : muted}`}>
                                    <Clock size={13} className="inline mr-1" />
                                    {daysLeft > 0
                                        ? `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''} (${trialEnd.toLocaleDateString('es-AR')})`
                                        : 'El período de prueba venció'}
                                </p>
                            )}

                            {subscription?.next_payment_date && (
                                <p className={`text-sm mt-2 ${muted}`}>
                                    <RefreshCcw size={13} className="inline mr-1" />
                                    Próximo cobro: {new Date(subscription.next_payment_date).toLocaleDateString('es-AR')}
                                    &nbsp;·&nbsp;${Number(subscription.amount).toLocaleString('es-AR')} ARS
                                </p>
                            )}
                        </div>

                        {/* Acción de cancelar */}
                        {subscription?.status === 'authorized' && !showCancelConfirm && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                <XCircle size={15} className="mr-1" /> Cancelar suscripción
                            </Button>
                        )}
                    </div>

                    {/* Confirmación de cancelación */}
                    {showCancelConfirm && (
                        <div className={`mt-4 rounded-lg p-4 border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                ¿Estás seguro que querés cancelar tu suscripción? Mantendrás el acceso hasta el fin del período ya pagado.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={cancelForm.processing}
                                    onClick={handleCancel}
                                >
                                    Sí, cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowCancelConfirm(false)}
                                >
                                    Volver
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Alertas de estado */}
                {tenant.status === 'suspended' && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Cuenta suspendida</p>
                            <p className="text-xs mt-0.5">Tu acceso está limitado. Suscribite a un plan para reactivar todas las funcionalidades.</p>
                        </div>
                    </div>
                )}

                {tenant.status === 'cancelled' && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Shield size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Suscripción cancelada</p>
                            <p className="text-xs mt-0.5">Podés volver a suscribirte en cualquier momento eligiendo un plan.</p>
                        </div>
                    </div>
                )}

                {/* Planes disponibles */}
                <div>
                    <h2 className={`text-base font-semibold mb-4 ${text}`}>
                        {tenant.status === 'active' && subscription ? 'Cambiar plan' : 'Elegí tu plan'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                current={currentPlanObj}
                                onSelect={handleSelectPlan}
                                disabled={checkoutForm.processing}
                            />
                        ))}
                    </div>
                    {plans.every(p => !p.mp_plan_id) && (
                        <p className={`text-xs mt-3 flex items-center gap-1.5 ${muted}`}>
                            <Zap size={12} /> Los pagos online estarán disponibles próximamente. Contactá al soporte para activar tu plan.
                        </p>
                    )}
                </div>

                {/* Info adicional */}
                <div className={`rounded-xl p-4 text-xs ${muted} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p>Los pagos se procesan de forma segura a través de MercadoPago. Podés cancelar en cualquier momento desde esta página. Al cancelar, mantenés el acceso hasta el fin del período ya abonado.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
