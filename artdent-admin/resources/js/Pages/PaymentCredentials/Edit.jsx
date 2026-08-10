import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Toggle from '@/Components/ui/Toggle';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function Edit({ credentials }) {
    const { isDark } = useTheme();
    const [testing, setTesting] = useState(null); // null | 'mp' | 'nave'
    const [testResult, setTestResult] = useState({ mp: null, nave: null });

    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, put, processing, errors } = useForm({
        mp_public_key: credentials.mp_public_key || '',
        mp_access_token: '',
        nave_client_id: credentials.nave_client_id || '',
        nave_client_secret: '',
        nave_pos_id: credentials.nave_pos_id || '',
        nave_sandbox_mode: credentials.nave_sandbox_mode,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('payment-credentials.update'));
    };

    const testConnection = async (provider) => {
        setTesting(provider);
        setTestResult((r) => ({ ...r, [provider]: null }));
        try {
            const res = await fetch(route('payment-credentials.test-connection'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ provider }),
            });
            const json = await res.json();
            setTestResult((r) => ({ ...r, [provider]: json }));
        } catch {
            setTestResult((r) => ({ ...r, [provider]: { success: false, error: 'Error de red al probar la conexión.' } }));
        } finally {
            setTesting(null);
        }
    };

    const renderTestResult = (provider) => {
        const result = testResult[provider];
        if (! result) return null;

        return (
            <div className="mt-3 space-y-2">
                {result.success ? (
                    result.checks.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div><p className="font-semibold">{c.label}</p><p className={isDark ? 'text-slate-500' : 'text-slate-500'}>{c.detail}</p></div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-start gap-2 text-xs">
                        <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <p>{result.error}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout title="Credenciales de Pago — Suscripciones">
            <Head title="Credenciales de Pago" />

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card
                        title="Mercado Pago"
                        description="Credenciales con las que ArtCode cobra la suscripción SaaS a sus tenants (planes, checkout y webhooks)."
                        actions={<Button type="submit" size="sm" disabled={processing}>{processing ? 'Guardando…' : 'Guardar'}</Button>}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1.5">Public Key</label>
                                <input className={cls} value={data.mp_public_key} onChange={(e) => setData('mp_public_key', e.target.value)} placeholder="APP_USR-..." />
                                {errors.mp_public_key && <p className="text-rose-500 text-xs mt-1.5">{errors.mp_public_key}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5">Access Token</label>
                                <input
                                    type="password"
                                    className={cls}
                                    value={data.mp_access_token}
                                    onChange={(e) => setData('mp_access_token', e.target.value)}
                                    placeholder={credentials.mp_access_token_masked || 'APP_USR-...'}
                                />
                                <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {credentials.mp_access_token_masked
                                        ? `Ya hay uno guardado (${credentials.mp_access_token_masked}). Dejalo vacío para no cambiarlo.`
                                        : 'Se guarda encriptado. Nunca se muestra completo una vez guardado.'}
                                </p>
                                {errors.mp_access_token && <p className="text-rose-500 text-xs mt-1.5">{errors.mp_access_token}</p>}
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Nave"
                        description="Credenciales de Nave para cobrar suscripciones. Configurables desde acá; todavía no hay un checkout de Nave conectado del lado de suscripciones."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1.5">Client ID</label>
                                <input className={cls} value={data.nave_client_id} onChange={(e) => setData('nave_client_id', e.target.value)} />
                                {errors.nave_client_id && <p className="text-rose-500 text-xs mt-1.5">{errors.nave_client_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5">POS ID</label>
                                <input className={cls} value={data.nave_pos_id} onChange={(e) => setData('nave_pos_id', e.target.value)} />
                                {errors.nave_pos_id && <p className="text-rose-500 text-xs mt-1.5">{errors.nave_pos_id}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold mb-1.5">Client Secret</label>
                                <input
                                    type="password"
                                    className={cls}
                                    value={data.nave_client_secret}
                                    onChange={(e) => setData('nave_client_secret', e.target.value)}
                                    placeholder={credentials.nave_client_secret_masked || '••••••••'}
                                />
                                <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                    {credentials.nave_client_secret_masked
                                        ? `Ya hay uno guardado (${credentials.nave_client_secret_masked}). Dejalo vacío para no cambiarlo.`
                                        : 'Se guarda encriptado. Nunca se muestra completo una vez guardado.'}
                                </p>
                                {errors.nave_client_secret && <p className="text-rose-500 text-xs mt-1.5">{errors.nave_client_secret}</p>}
                            </div>

                            <div className="sm:col-span-2 flex items-center justify-between px-3.5 py-3 rounded-lg mt-1" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#E6F5F2' }}>
                                <div>
                                    <p className="text-sm font-bold">Modo sandbox</p>
                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Apagalo sólo cuando tengas credenciales reales de producción de Nave.
                                    </p>
                                </div>
                                <Toggle checked={data.nave_sandbox_mode} onChange={() => setData('nave_sandbox_mode', ! data.nave_sandbox_mode)} />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Probar Mercado Pago">
                        <Button type="button" onClick={() => testConnection('mp')} disabled={testing !== null} variant="outline" className="w-full justify-center">
                            <ShieldCheck size={15} /> {testing === 'mp' ? 'Probando…' : 'Probar conexión'}
                        </Button>
                        {renderTestResult('mp')}
                    </Card>

                    <Card title="Probar Nave">
                        <Button type="button" onClick={() => testConnection('nave')} disabled={testing !== null} variant="outline" className="w-full justify-center">
                            <ShieldCheck size={15} /> {testing === 'nave' ? 'Probando…' : 'Probar conexión'}
                        </Button>
                        {renderTestResult('nave')}
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
