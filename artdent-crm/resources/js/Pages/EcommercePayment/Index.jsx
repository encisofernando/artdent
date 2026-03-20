import { useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    CreditCard, Banknote, QrCode, Landmark,
    Eye, EyeOff, Save, CheckCircle, AlertCircle,
} from 'lucide-react';

const METHOD_META = {
    mercadopago: {
        icon: CreditCard,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        title: 'MercadoPago',
        description: 'Pago online con tarjeta, débito o saldo en cuenta.',
    },
    bank_transfer: {
        icon: Landmark,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        title: 'Transferencia / CBU',
        description: 'El cliente transfiere al CBU/CVU de la cuenta.',
    },
    qr: {
        icon: QrCode,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        title: 'Código QR',
        description: 'El cliente escanea el QR para pagar.',
    },
    cash: {
        icon: Banknote,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        title: 'Efectivo',
        description: 'Pago en persona en los puntos de retiro habilitados.',
    },
};

function Toggle({ checked, onChange, color = 'bg-emerald-500' }) {
    return (
        <label className="flex items-center cursor-pointer gap-2">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? color : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
            </div>
        </label>
    );
}

function PasswordInput({ className, value, onChange, placeholder }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                className={`${className} pr-10`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

function PaymentCard({ config, pickupPoints, isDark }) {
    const meta = METHOD_META[config.type] ?? {};
    const Icon = meta.icon ?? CreditCard;

    const [form, setForm] = useState({
        is_enabled: config.is_enabled ?? false,
        label: config.label ?? '',
        instructions: config.instructions ?? '',
        config: config.config ?? {},
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const setConfigField = (key, val) => setForm(f => ({ ...f, config: { ...f.config, [key]: val } }));

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setSaveError(null);

        try {
            const res = await axios.put(route('ecommerce-payment-configs.update', config.type), form);
            // Update the access_token field to show the masked version returned by the server
            if (config.type === 'mercadopago') {
                if (res.data?.config?.access_token) {
                    setForm(f => ({ ...f, config: { ...f.config, access_token: res.data.config.access_token } }));
                }
                if (res.data?.config?.webhook_secret) {
                    setForm(f => ({ ...f, config: { ...f.config, webhook_secret: res.data.config.webhook_secret } }));
                }
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            const errors = err?.response?.data?.errors;
            const msg = errors ? Object.values(errors)[0]?.[0] : (err?.response?.data?.message ?? 'Error al guardar.');
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    }

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <form onSubmit={save} className={`rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between gap-4 px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <Icon size={20} className={meta.color} />
                    </div>
                    <div>
                        <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{meta.title}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{meta.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold ${form.is_enabled ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                        {form.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                    <Toggle checked={form.is_enabled} onChange={v => set('is_enabled', v)} />
                </div>
            </div>

            {/* Config fields */}
            <div className="px-6 py-5 space-y-4">
                <div>
                    <label className={lbl}>Nombre visible en checkout</label>
                    <input className={inp} value={form.label} onChange={e => set('label', e.target.value)} />
                </div>

                <div>
                    <label className={lbl}>Instrucciones para el cliente</label>
                    <textarea
                        className={inp}
                        rows={3}
                        value={form.instructions ?? ''}
                        onChange={e => set('instructions', e.target.value)}
                        placeholder="Texto informativo que verá el cliente al seleccionar este método..."
                    />
                </div>

                {/* MercadoPago */}
                {config.type === 'mercadopago' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={lbl}>Access Token (privado)</label>
                            <PasswordInput
                                className={inp}
                                value={form.config.access_token ?? ''}
                                onChange={e => setConfigField('access_token', e.target.value)}
                                placeholder="APP_USR-..."
                            />
                            <p className="text-xs text-slate-400 mt-1">Nunca se expone al frontend.</p>
                        </div>
                        <div>
                            <label className={lbl}>Public Key</label>
                            <input
                                className={inp}
                                value={form.config.public_key ?? ''}
                                onChange={e => setConfigField('public_key', e.target.value)}
                                placeholder="APP_USR-..."
                            />
                            <p className="text-xs text-slate-400 mt-1">Se envía al checkout del e-commerce.</p>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={lbl}>Webhook Secret (privado)</label>
                            <PasswordInput
                                className={inp}
                                value={form.config.webhook_secret ?? ''}
                                onChange={e => setConfigField('webhook_secret', e.target.value)}
                                placeholder="Firma para validación de origen"
                            />
                            <p className="text-xs text-slate-400 mt-1">Garantiza la autenticidad de las notificaciones de Mercado Pago.</p>
                        </div>
                    </div>
                )}

                {/* Transferencia */}
                {config.type === 'bank_transfer' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={lbl}>Titular de la cuenta</label>
                            <input className={inp} value={form.config.account_name ?? ''} onChange={e => setConfigField('account_name', e.target.value)} placeholder="Nombre o razón social" />
                        </div>
                        <div>
                            <label className={lbl}>CBU / CVU</label>
                            <input className={inp} value={form.config.cbu ?? ''} onChange={e => setConfigField('cbu', e.target.value)} placeholder="0000000000000000000000" />
                        </div>
                        <div>
                            <label className={lbl}>Alias</label>
                            <input className={inp} value={form.config.alias ?? ''} onChange={e => setConfigField('alias', e.target.value)} placeholder="mi.alias.mercadopago" />
                        </div>
                    </div>
                )}

                {/* QR */}
                {config.type === 'qr' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={lbl}>URL de imagen QR</label>
                            <input className={inp} type="url" value={form.config.image_url ?? ''} onChange={e => setConfigField('image_url', e.target.value)} placeholder="https://..." />
                        </div>
                        <div>
                            <label className={lbl}>URL de pago (opcional)</label>
                            <input className={inp} type="url" value={form.config.payment_url ?? ''} onChange={e => setConfigField('payment_url', e.target.value)} placeholder="https://..." />
                        </div>
                        {form.config.image_url && (
                            <div className="sm:col-span-2">
                                <p className={lbl}>Vista previa</p>
                                <img src={form.config.image_url} alt="QR" className="h-32 w-32 rounded-xl border object-contain p-2 bg-white" />
                            </div>
                        )}
                    </div>
                )}

                {/* Efectivo — no extra config, shows pickup points info */}
                {config.type === 'cash' && (
                    <div className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-amber-100 bg-amber-50/60'}`}>
                        <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            Puntos de retiro que aceptan efectivo ({pickupPoints.filter(p => p.accepts_cash_payment).length} habilitados)
                        </p>
                        {pickupPoints.length === 0 ? (
                            <p className="text-xs text-slate-400">No hay puntos de retiro creados.</p>
                        ) : (
                            <ul className="space-y-1">
                                {pickupPoints.map(p => (
                                    <li key={p.id} className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <span className={`h-2 w-2 rounded-full shrink-0 ${p.accepts_cash_payment ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        {p.name} — {p.city}
                                        {!p.accepts_cash_payment && <span className="text-slate-400">(sin efectivo)</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Habilitá el efectivo en cada punto desde <strong>E-commerce → Puntos de Retiro</strong>.
                        </p>
                    </div>
                )}

                {/* Save feedback */}
                {saved && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                        <CheckCircle size={16} /> Guardado correctamente
                    </div>
                )}
                {saveError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                        <AlertCircle size={16} /> {saveError}
                    </div>
                )}

                <div className="flex justify-end pt-1">
                    <Button type="submit" disabled={saving} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                        <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default function EcommercePaymentIndex({ auth, configs, pickupPoints }) {
    const { isDark } = useTheme();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Métodos de Pago" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Métodos de Pago
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Configurá los métodos de pago habilitados en el checkout del e-commerce.
                    </p>
                </div>

                <div className="space-y-4">
                    {configs.map(config => (
                        <PaymentCard
                            key={config.type}
                            config={config}
                            pickupPoints={pickupPoints}
                            isDark={isDark}
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
