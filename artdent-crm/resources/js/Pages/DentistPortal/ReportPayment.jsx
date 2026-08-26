import { Link, useForm } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Receipt, Loader2, CheckCircle2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function ReportPayment({ balance, paymentMethods }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        amount: balance > 0 ? String(balance) : '',
        payment_method_id: paymentMethods[0]?.id ?? '',
        notes: '',
        image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dentist-portal.account.report-payment.store'), { forceFormData: true });
    };

    const inputClasses = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500' : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
    }`;
    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    if (wasSuccessful) {
        return (
            <DentistPortalLayout>
                <div className="max-w-sm mx-auto mt-10 text-center">
                    <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: '#5AAD9C' }} />
                    <h1 className={`text-lg font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Comprobante enviado</h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pendiente de aprobación por el laboratorio.</p>
                    <Link
                        href={route('dentist-portal.show')}
                        className="inline-block mt-6 text-sm font-bold"
                        style={{ color: B.blue }}
                    >
                        Volver a mi portal
                    </Link>
                </div>
            </DentistPortalLayout>
        );
    }

    if (balance <= 0) {
        return (
            <DentistPortalLayout>
                <div className="max-w-sm mx-auto mt-10 text-center">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No tenés saldo pendiente con el laboratorio.</p>
                    <Link href={route('dentist-portal.show')} className="inline-block mt-4 text-sm font-bold" style={{ color: B.blue }}>
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
                        Informar un pago
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Adjuntá el comprobante; el laboratorio lo revisará y acreditará el pago en tu cuenta.
                    </p>
                </div>

                <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saldo actual</p>
                    <p className="text-xl font-extrabold" style={{ color: '#E63946' }}>{fmt(balance)}</p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={labelClasses}>Monto pagado</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0,00"
                            className={inputClasses}
                        />
                        {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className={labelClasses}>Medio de pago</label>
                        <select
                            value={data.payment_method_id}
                            onChange={(e) => setData('payment_method_id', e.target.value)}
                            className={inputClasses}
                        >
                            {paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        {errors.payment_method_id && <p className="text-red-500 text-xs mt-1.5">{errors.payment_method_id}</p>}
                    </div>

                    <div>
                        <label className={labelClasses}>Notas (opcional)</label>
                        <textarea
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className={`${inputClasses} resize-y`}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Comprobante</label>
                        <label className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-slate-300 bg-slate-50'}`}>
                            <Receipt size={22} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {data.image ? data.image.name : 'Subí una foto o PDF del comprobante'}
                            </span>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                                className="hidden"
                            />
                        </label>
                        {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                    >
                        {processing ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : 'Enviar comprobante'}
                    </button>
                </form>
            </div>
        </DentistPortalLayout>
    );
}
