import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import { ReceiptText, Check, X } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function Index({ auth, reports }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();

    const approve = (r) => {
        confirmDialog(`¿Aprobar el pago de ${fmt(r.amount)} de ${r.dentist}? Se va a acreditar en su cuenta corriente.`, () => {
            router.post(route('lab-account-payment-reports.approve', r.id), {}, { preserveScroll: true });
        });
    };

    const reject = (r) => {
        confirmDialog(`¿Rechazar el comprobante de ${r.dentist}?`, () => {
            router.post(route('lab-account-payment-reports.reject', r.id), {}, { preserveScroll: true });
        });
    };

    const card = `rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Comprobantes de pago" />

            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Comprobantes de pago
                    </h1>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Informados por odontólogos desde su portal — al aprobar se acredita automáticamente en su cuenta corriente.
                    </p>
                </div>

                {reports.length === 0 ? (
                    <div className={`${card} p-10 text-center`}>
                        <ReceiptText size={28} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay comprobantes pendientes.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {reports.map((r) => (
                            <div key={r.id} className={`${card} p-5 flex flex-col sm:flex-row gap-4`}>
                                <a href={r.image_url} target="_blank" rel="noreferrer" className="shrink-0">
                                    <img
                                        src={r.image_url}
                                        alt="Comprobante"
                                        className="w-full sm:w-28 h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </a>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <p className={`text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{r.dentist}</p>
                                            <p className="text-lg font-extrabold mt-0.5" style={{ color: B.blue }}>{fmt(r.amount)}</p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {r.payment_method} · {r.created_at}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => reject(r)}
                                                className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}
                                            >
                                                <X size={14} className="mr-1.5" /> Rechazar
                                            </Button>
                                            <Button
                                                onClick={() => approve(r)}
                                                className="text-white border-none"
                                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                            >
                                                <Check size={14} className="mr-1.5" /> Aprobar
                                            </Button>
                                        </div>
                                    </div>
                                    {r.notes && (
                                        <p className={`text-xs mt-2 rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                                            {r.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
