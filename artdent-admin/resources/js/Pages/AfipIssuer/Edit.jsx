import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Toggle from '@/Components/ui/Toggle';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ShieldCheck, CheckCircle2, XCircle, UploadCloud, KeyRound, Download } from 'lucide-react';

const STATUS_COLORS = { pending: 'warning', authorized: 'success', failed: 'danger' };
const STATUS_LABELS = { pending: 'Pendiente', authorized: 'Autorizada', failed: 'Falló' };

export default function Edit({ issuer, invoices }) {
    const { isDark } = useTheme();
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [uploading, setUploading] = useState(null);
    const [csrAlias, setCsrAlias] = useState('');
    const [csrGenerating, setCsrGenerating] = useState(false);
    const [csrResult, setCsrResult] = useState(null); // null | { success, csr, alias, message, error }

    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 focus:border-brand-cyan' : 'bg-white border-brand-aqua focus:border-brand-cyan'
    }`;

    const { data, setData, put, processing, errors } = useForm({
        name: issuer?.name || '',
        cuit: issuer?.cuit || '',
        iva_condition: issuer?.iva_condition || 'responsable_inscripto',
        point_sale: issuer?.point_sale || 1,
        environment: issuer?.environment || 'homo',
        auto_invoice: issuer?.auto_invoice ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('afip-issuer.update'));
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch(route('afip-issuer.test-connection', { env: data.environment }), {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            setTestResult(await res.json());
        } catch {
            setTestResult({ success: false, error: 'Error de red al probar la conexión.' });
        } finally {
            setTesting(false);
        }
    };

    const upload = (type, env, file) => {
        if (! file) return;
        setUploading(`${type}-${env || ''}`);
        const form = new FormData();
        form.append('type', type);
        if (env) form.append('env', env);
        form.append('file', file);

        fetch(route('afip-issuer.upload'), {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, 'X-Requested-With': 'XMLHttpRequest' },
            body: form,
        }).finally(() => {
            setUploading(null);
            window.location.reload();
        });
    };

    const generateCsr = async () => {
        setCsrGenerating(true);
        setCsrResult(null);
        try {
            const res = await fetch(route('afip-issuer.generate-csr'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ alias: csrAlias }),
            });
            setCsrResult(await res.json());
        } catch {
            setCsrResult({ success: false, error: 'Error de red o servidor.' });
        } finally {
            setCsrGenerating(false);
        }
    };

    const downloadCsr = () => {
        if (! csrResult?.csr) return;
        const blob = new Blob([csrResult.csr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${csrResult.alias}.csr`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout title="Facturación AFIP — Suscripciones">
            <Head title="Facturación AFIP" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={submit}>
                        <Card
                            title="Identidad emisora"
                            description="Con esta identidad ArtCode factura la suscripción SaaS a sus tenants — separada de la identidad AFIP de cada tenant."
                            actions={<Button type="submit" size="sm" disabled={processing}>{processing ? 'Guardando…' : 'Guardar'}</Button>}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold mb-1.5">Razón social</label>
                                    <input className={cls} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-rose-500 text-xs mt-1.5">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5">CUIT</label>
                                    <input className={cls} value={data.cuit} onChange={(e) => setData('cuit', e.target.value)} />
                                    {errors.cuit && <p className="text-rose-500 text-xs mt-1.5">{errors.cuit}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5">Condición IVA</label>
                                    <select className={cls} value={data.iva_condition} onChange={(e) => setData('iva_condition', e.target.value)}>
                                        <option value="responsable_inscripto">Responsable Inscripto</option>
                                        <option value="monotributista">Monotributista</option>
                                        <option value="exento">Exento</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5">Punto de venta</label>
                                    <input type="number" min="1" className={cls} value={data.point_sale} onChange={(e) => setData('point_sale', e.target.value)} />
                                    {errors.point_sale && <p className="text-rose-500 text-xs mt-1.5">{errors.point_sale}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1.5">Entorno</label>
                                    <select className={cls} value={data.environment} onChange={(e) => setData('environment', e.target.value)}>
                                        <option value="homo">Homologación (pruebas)</option>
                                        <option value="prod">Producción</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2 flex items-center justify-between px-3.5 py-3 rounded-lg mt-1" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#E6F5F2' }}>
                                    <div>
                                        <p className="text-sm font-bold">Auto-facturar pagos de suscripción</p>
                                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Si está apagado, los pagos de MercadoPago no generan factura automáticamente aunque estén configurados los certificados.
                                        </p>
                                    </div>
                                    <Toggle checked={data.auto_invoice} onChange={() => setData('auto_invoice', !data.auto_invoice)} />
                                </div>
                            </div>
                        </Card>
                    </form>

                    <Card
                        title="Generar solicitud de certificado (CSR)"
                        description="Generá el par de claves y el CSR acá mismo, subilo al portal ARCA (wsass.afip.gov.ar) y después cargá el .crt que te den en Certificados."
                    >
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold mb-1.5">Alias del certificado</label>
                                <input
                                    className={cls}
                                    value={csrAlias}
                                    onChange={(e) => setCsrAlias(e.target.value)}
                                    placeholder="artcode-wsfe"
                                    maxLength={40}
                                />
                            </div>
                            <Button type="button" onClick={generateCsr} disabled={csrGenerating || ! csrAlias.trim()} className="shrink-0">
                                <KeyRound size={15} /> {csrGenerating ? 'Generando…' : 'Generar clave privada y CSR'}
                            </Button>
                        </div>

                        {csrResult && (
                            <div className={`mt-4 rounded-xl border p-4 space-y-3 ${
                                csrResult.success
                                    ? isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                                    : isDark ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-200'
                            }`}>
                                {csrResult.success ? (
                                    <>
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                            <CheckCircle2 size={15} /> {csrResult.message}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={downloadCsr}>
                                            <Download size={14} /> Descargar CSR (.pem)
                                        </Button>
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                            La clave privada ya se guardó — sólo necesitás subir el .crt que te dé ARCA.
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                                        <XCircle size={15} /> {csrResult.error}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <Card title="Facturas de suscripción emitidas">
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <th className="px-6 py-2">Fecha</th>
                                        <th className="px-6 py-2">Tenant</th>
                                        <th className="px-6 py-2">Comprobante</th>
                                        <th className="px-6 py-2">Total</th>
                                        <th className="px-6 py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                            <td className={`px-6 py-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(inv.created_at).toLocaleDateString('es-AR')}</td>
                                            <td className="px-6 py-3 font-semibold">{inv.tenant_id}</td>
                                            <td className="px-6 py-3 font-mono text-xs">{inv.receipt_type} {String(inv.point_sale).padStart(5, '0')}-{String(inv.number ?? 0).padStart(8, '0')}</td>
                                            <td className="px-6 py-3">${Number(inv.total).toLocaleString('es-AR')}</td>
                                            <td className="px-6 py-3"><Badge color={STATUS_COLORS[inv.status]}>{STATUS_LABELS[inv.status]}</Badge></td>
                                        </tr>
                                    ))}
                                    {invoices.length === 0 && (
                                        <tr><td colSpan={5} className={`px-6 py-10 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Todavía no se emitió ninguna factura.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Certificados">
                        <div className="space-y-3">
                            {['cert', 'cert_homo'].map((f) => {
                                const loaded = f === 'cert' ? !! issuer?.cert_path : !! issuer?.homo_cert_path;
                                return (
                                    <div key={f} className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold inline-flex items-center gap-1.5">
                                            {loaded && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                                            {f === 'cert' ? 'Certificado producción' : 'Certificado homologación'}
                                        </span>
                                        <label className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-brand-mint hover:bg-brand-aqua/40'}`}>
                                            <UploadCloud size={14} />
                                            {uploading === `cert-${f === 'cert' ? 'prod' : 'homo'}` ? 'Subiendo…' : (loaded ? 'Reemplazar' : 'Subir')}
                                            <input type="file" accept=".crt,.pem" className="hidden" onChange={(e) => upload('cert', f === 'cert' ? 'prod' : 'homo', e.target.files[0])} />
                                        </label>
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold inline-flex items-center gap-1.5">
                                    {!!issuer?.key_path && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                                    Clave privada
                                </span>
                                <label className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-brand-mint hover:bg-brand-aqua/40'}`}>
                                    <UploadCloud size={14} />
                                    {uploading === 'key-' ? 'Subiendo…' : (issuer?.key_path ? 'Reemplazar' : 'Subir')}
                                    <input type="file" accept=".key,.pem" className="hidden" onChange={(e) => upload('key', null, e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    </Card>

                    <Card title="Probar conexión">
                        <Button onClick={testConnection} disabled={testing} variant="outline" className="w-full justify-center">
                            <ShieldCheck size={15} /> {testing ? 'Probando…' : `Probar (${data.environment})`}
                        </Button>

                        {testResult && (
                            <div className="mt-4 space-y-2">
                                {testResult.success ? (
                                    testResult.checks.map((c, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <div><p className="font-semibold">{c.label}</p><p className={isDark ? 'text-slate-500' : 'text-slate-500'}>{c.detail}</p></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-start gap-2 text-xs">
                                        <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                        <p>{testResult.error}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
