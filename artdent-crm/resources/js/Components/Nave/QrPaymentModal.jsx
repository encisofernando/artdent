import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import QRCode from 'qrcode';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

const STATUS_LABELS = {
    pending: 'Esperando pago…',
    approved: 'Pago confirmado',
    rejected: 'Pago rechazado',
    cancelled: 'Cancelado',
    expired: 'Vencido',
};

const POLL_INTERVAL_MS = 10_000;

/**
 * Modal de cobro Nave (QR físico o link de pago) — compartido por Sale/Create
 * (POS presencial) y Customer/Account (cuenta corriente). Escucha el estado
 * de la intención por Reverb (canal privado por tenant/company/intent, mismo
 * patrón que EcommerceOrder/Show.jsx) con polling de 10s como respaldo.
 */
export default function QrPaymentModal({
    intentId,
    type, // 'static_qr' | 'payment_link'
    qrData,
    checkoutUrl,
    companyId,
    amount,
    onApproved,
    onClose,
}) {
    const { isDark } = useTheme();
    const { props: pageProps } = usePage();
    const tenantId = pageProps.tenant_info?.id;

    const [status, setStatus] = useState('pending');
    const [qrImage, setQrImage] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (type !== 'static_qr' || !qrData) return;
        QRCode.toDataURL(qrData, { width: 480, margin: 1, errorCorrectionLevel: 'M' })
            .then(setQrImage)
            .catch(() => {});
    }, [type, qrData]);

    useEffect(() => {
        if (status !== 'pending') return;

        const timer = setInterval(async () => {
            try {
                const res = await fetch(route('nave-charge-intents.status', intentId));
                if (!res.ok) return;
                const data = await res.json();
                if (data.status && data.status !== 'pending') {
                    setStatus(data.status);
                }
            } catch {
                // silencioso — vuelve a intentar en el próximo tick
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [status, intentId]);

    useEffect(() => {
        if (!window.Echo || !tenantId || !companyId || !intentId) return;

        const channelName = `tenant.${tenantId}.company.${companyId}.nave-intents.${intentId}`;
        const channel = window.Echo.private(channelName);
        channel.listen('.nave-intent-status-changed', (e) => {
            if (e.status) setStatus(e.status);
        });

        return () => window.Echo.leave(channelName);
    }, [tenantId, companyId, intentId]);

    useEffect(() => {
        if (status === 'approved') {
            onApproved?.();
        }
    }, [status]);

    const copyLink = async () => {
        if (!checkoutUrl) return;
        await navigator.clipboard.writeText(checkoutUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const whatsappHref = checkoutUrl
        ? `https://wa.me/?text=${encodeURIComponent(`Te comparto el link para completar el pago: ${checkoutUrl}`)}`
        : null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {type === 'static_qr' ? 'Cobrar con QR (Nave)' : 'Link de pago (Nave)'}
                    </h2>
                    <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <X size={16} />
                    </button>
                </div>

                {amount != null && (
                    <p className={`text-center text-2xl font-extrabold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                )}

                {type === 'static_qr' ? (
                    qrImage ? (
                        <img src={qrImage} alt="QR de pago Nave" className="w-full aspect-square rounded-xl border p-2 bg-white" />
                    ) : (
                        <div className={`w-full aspect-square rounded-xl border flex items-center justify-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <Loader2 className="animate-spin text-slate-400" size={32} />
                        </div>
                    )
                ) : (
                    <div className="space-y-3">
                        <div className={`text-xs break-all rounded-lg border p-3 font-mono ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                            {checkoutUrl}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyLink}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 ${isDark ? 'border-slate-700 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado' : 'Copiar link'}
                            </button>
                            {whatsappHref && (
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white text-center"
                                    style={{ background: '#25D366' }}
                                >
                                    WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className={`mt-4 flex items-center justify-center gap-2 text-sm font-semibold ${
                    status === 'approved' ? 'text-emerald-500'
                        : status === 'pending' ? (isDark ? 'text-slate-400' : 'text-slate-500')
                            : 'text-red-500'
                }`}>
                    {status === 'pending' && <Loader2 className="animate-spin" size={16} />}
                    {STATUS_LABELS[status] ?? status}
                </div>
            </div>
        </div>
    );
}
