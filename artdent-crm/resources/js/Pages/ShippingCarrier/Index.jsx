import { useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    Truck, Eye, EyeOff, Save, CheckCircle, AlertCircle, PlugZap, Loader2,
} from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

const CARRIER_META = {
    andreani: {
        color: 'text-red-600',
        bg: 'bg-red-500/10',
        title: 'Andreani',
        description: 'Cotización automática, alta de envíos y etiquetas.',
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

function CarrierCard({ config, isDark }) {
    const meta = CARRIER_META[config.type] ?? {};

    const [form, setForm] = useState({
        is_enabled: config.is_enabled ?? false,
        config: config.config ?? {},
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testError, setTestError] = useState(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const setConfigField = (key, val) => setForm(f => ({ ...f, config: { ...f.config, [key]: val } }));

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setSaveError(null);

        try {
            const res = await axios.put(route('shipping-carrier-configs.update', config.type), form);
            if (res.data?.config?.hash_andreani) {
                setForm(f => ({ ...f, config: { ...f.config, hash_andreani: res.data.config.hash_andreani } }));
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

    async function testConnection() {
        setTesting(true);
        setTestResult(null);
        setTestError(null);
        try {
            const res = await axios.post(route('shipping-carrier-configs.test', config.type));
            setTestResult(res.data);
        } catch (err) {
            setTestError(err?.response?.data?.message ?? 'No se pudo probar la conexión.');
        } finally {
            setTesting(false);
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
                        <Truck size={20} className={meta.color} />
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

            <div className="px-6 py-5 space-y-4">
                <div className={`rounded-xl border p-4 text-sm ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-100 bg-blue-50'}`}>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Credencial ID de Andreani</p>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        La da Andreani al habilitar la integración con tu tienda online (distinta del usuario/contraseña
                        de la API general de desarrolladores). El tipo de cuenta (Pyme/Corporativo) y los contratos se
                        detectan solos al guardar — probá la conexión para verificarlo.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={lbl}>Credencial ID</label>
                        <PasswordInput
                            className={inp}
                            value={form.config.hash_andreani ?? ''}
                            onChange={e => setConfigField('hash_andreani', e.target.value)}
                            placeholder="UHltZXxIaVZ0VFFSV1U0R2RB..."
                        />
                    </div>
                    <div>
                        <label className={lbl}>Código Postal de origen</label>
                        <input
                            className={inp}
                            value={form.config.cp_origen ?? ''}
                            onChange={e => setConfigField('cp_origen', e.target.value)}
                            placeholder="3600"
                        />
                        <p className="text-xs text-slate-400 mt-1">Desde dónde salen los envíos.</p>
                    </div>
                </div>

                {form.config.client_type && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tipo de cuenta detectado: <strong className="capitalize">{form.config.client_type}</strong>
                        {Array.isArray(form.config.contratos) && form.config.contratos.length > 0 && (
                            <> — {form.config.contratos.length} contrato{form.config.contratos.length === 1 ? '' : 's'}</>
                        )}
                    </p>
                )}

                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={testConnection} disabled={testing || !form.config.hash_andreani} className="gap-2">
                        {testing ? <Loader2 size={15} className="animate-spin" /> : <PlugZap size={15} />}
                        {testing ? 'Probando...' : 'Probar conexión'}
                    </Button>
                </div>

                {testResult && (
                    <div className={`rounded-xl border p-4 text-sm ${isDark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50'}`}>
                        <p className={`font-semibold mb-1 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            <CheckCircle size={15} /> Conexión OK
                        </p>
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {testResult.nombre_cuenta} (CUIT {testResult.cuit}) — cuenta <strong className="capitalize">{testResult.client_type}</strong>
                        </p>
                        {Array.isArray(testResult.contratos) && testResult.contratos.length > 0 && (
                            <ul className={`mt-2 space-y-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {testResult.contratos.map(c => (
                                    <li key={c.id}>{c.modoDeEntregaNombre} — contrato {c.numeroDeContrato}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {testError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                        <AlertCircle size={16} /> {testError}
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

export default function ShippingCarrierIndex({ auth, configs }) {
    const { isDark } = useTheme();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Transportistas" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Truck size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Transportistas
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Configurá la cotización y el envío automático con transportistas reales.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {configs.map(config => (
                        <CarrierCard key={config.type} config={config} isDark={isDark} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
