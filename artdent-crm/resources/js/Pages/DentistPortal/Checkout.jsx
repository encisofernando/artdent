import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import QrPaymentModal from '@/Components/Nave/QrPaymentModal';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const B = { blue: '#397B9C', teal: '#49949C' };

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function Checkout({ balance }) {
    const { isDark } = useTheme();
    const toast = useToast();
    const [tab, setTab] = useState('nave');
    const [loading, setLoading] = useState(false);
    const [naveIntent, setNaveIntent] = useState(null);
    const [paid, setPaid] = useState(false);

    const payWithNave = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                route('dentist-portal.account.nave-charge'),
                { type: 'static_qr' },
                { headers: { Accept: 'application/json' } }
            );
            setNaveIntent({
                intentId: res.data.intent_id,
                type: 'static_qr',
                qrData: res.data.qr_data,
                checkoutUrl: res.data.checkout_url,
                amount: balance,
            });
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'No se pudo generar el QR.');
        } finally {
            setLoading(false);
        }
    };

    const payWithMercadoPago = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                route('dentist-portal.account.mp-preference'),
                {},
                { headers: { Accept: 'application/json' } }
            );
            window.location.href = res.data.init_point;
        } catch (e) {
            toast.error(e.response?.data?.message ?? 'No se pudo iniciar el pago con Mercado Pago.');
            setLoading(false);
        }
    };

    const handleApproved = () => {
        setNaveIntent(null);
        setPaid(true);
        router.reload({ only: ['balance'] });
    };

    const card = `rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`;

    if (paid) {
        return (
            <DentistPortalLayout>
                <div className="max-w-sm mx-auto mt-10 text-center">
                    <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: '#5AAD9C' }} />
                    <h1 className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>¡Pago confirmado!</h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tu cuenta corriente ya está al día.</p>
                    <Link href={route('dentist-portal.show')} className="inline-block mt-6 text-sm font-bold" style={{ color: B.blue }}>
                        Volver a mi portal
                    </Link>
                </div>
            </DentistPortalLayout>
        );
    }

    return (
        <DentistPortalLayout>
            <div className="max-w-lg mx-auto flex flex-col gap-6">
                <div>
                    <Link
                        href={route('dentist-portal.show')}
                        className={`inline-flex items-center gap-1.5 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <ArrowLeft size={15} /> Mi portal
                    </Link>
                    <h1 className={`text-xl font-extrabold tracking-tight mt-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Pagar cuenta corriente
                    </h1>
                </div>

                <div className={`${card} p-4`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saldo a pagar</p>
                    <p className="text-2xl font-extrabold" style={{ color: '#E63946' }}>{fmt(balance)}</p>
                </div>

                {balance <= 0 ? (
                    <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No tenés saldo pendiente con el laboratorio.</p>
                ) : (
                    <>
                        <div className={`flex items-center p-1 gap-1 rounded-xl border w-fit mx-auto ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            {[['nave', 'QR Nave'], ['mp', 'Mercado Pago']].map(([id, label]) => (
                                <button
                                    key={id}
                                    onClick={() => setTab(id)}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors ${
                                        tab === id ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm') : (isDark ? 'text-slate-400' : 'text-slate-500')
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === 'nave' && (
                            <div className="text-center">
                                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Generá un código QR para escanear desde la app de tu banco o billetera virtual.
                                </p>
                                <button
                                    onClick={payWithNave}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                    style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                >
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Generando…</> : 'Generar código QR'}
                                </button>
                            </div>
                        )}

                        {tab === 'mp' && (
                            <div className="text-center py-3">
                                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Vas a ser redirigido a Mercado Pago para pagar con tarjeta, dinero en cuenta u otros medios disponibles.
                                </p>
                                <button
                                    onClick={payWithMercadoPago}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                    style={{ background: '#00B1EA' }}
                                >
                                    {loading ? 'Redirigiendo…' : 'Ir a pagar con Mercado Pago'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {naveIntent && (
                <QrPaymentModal
                    intentId={naveIntent.intentId}
                    type={naveIntent.type}
                    qrData={naveIntent.qrData}
                    checkoutUrl={naveIntent.checkoutUrl}
                    amount={naveIntent.amount}
                    statusRouteName="dentist-portal.nave-charge-intents.status"
                    onApproved={handleApproved}
                    onClose={() => setNaveIntent(null)}
                />
            )}
        </DentistPortalLayout>
    );
}
