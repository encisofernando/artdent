import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    Monitor, Plus, Trash2, Copy, Check, ShieldCheck, AlertTriangle,
    Wifi, WifiOff, Key, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function KioskAccess({ auth, allowedIps = [], deviceTokens = [], tokens = [], currentIp }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const { flash } = usePage().props;
    const [copied, setCopied] = useState(false);
    const [showTokens, setShowTokens] = useState(false);

    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const label = isDark ? 'text-slate-300' : 'text-slate-700';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
        isDark
            ? 'bg-slate-800 border-slate-600 text-slate-100 focus:ring-teal-500/40'
            : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/30'
    }`;

    /* ── IP form ── */
    const ipForm = useForm({ label: '', ip_address: '' });

    const currentIpAlreadyAdded = allowedIps.some(
        (ip) => ip.ip_address === currentIp && ip.is_active,
    );

    const submitIp = (e) => {
        e.preventDefault();
        ipForm.post(route('admin.kiosk-access.ips.store'), { onSuccess: () => ipForm.reset() });
    };

    const addCurrentIp = () => {
        ipForm.setData({ label: 'Este dispositivo', ip_address: currentIp });
        ipForm.post(route('admin.kiosk-access.ips.store'), {
            data: { label: 'Este dispositivo', ip_address: currentIp },
            onSuccess: () => ipForm.reset(),
        });
    };

    const toggleIp = (ip) =>
        router.patch(route('admin.kiosk-access.ips.toggle', ip.id), {}, { preserveScroll: true });

    const deleteIp = (ip) =>
        confirmDialog(`¿Eliminar la IP ${ip.ip_address}?`, () =>
            router.delete(route('admin.kiosk-access.ips.destroy', ip.id), { preserveScroll: true }),
        );

    /* ── Device token (Kiosk de Producción) form ── */
    const deviceTokenForm = useForm({ label: '' });

    const submitDeviceToken = (e) => {
        e.preventDefault();
        deviceTokenForm.post(route('admin.kiosk-access.device-tokens.store'), { onSuccess: () => deviceTokenForm.reset() });
    };

    const toggleDeviceToken = (t) =>
        router.patch(route('admin.kiosk-access.device-tokens.toggle', t.id), {}, { preserveScroll: true });

    const revokeDeviceToken = (t) =>
        confirmDialog(`¿Revocar el token "${t.label}"? La tablet dejará de poder acceder al Kiosk de Producción con ese link.`, () =>
            router.delete(route('admin.kiosk-access.device-tokens.destroy', t.id), { preserveScroll: true }),
        );

    /* ── Token form ── */
    const tokenForm = useForm({ name: '' });

    const submitToken = (e) => {
        e.preventDefault();
        tokenForm.post(route('admin.kiosk-access.tokens.store'), { onSuccess: () => tokenForm.reset() });
    };

    const revokeToken = (id) =>
        confirmDialog('¿Revocar este token? No podrá usarse más.', () =>
            router.delete(route('admin.kiosk-access.tokens.destroy', id), { preserveScroll: true }),
        );

    const copyToken = (token) => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Acceso Kiosk" />

            <div className="flex flex-col gap-6 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Acceso Kiosk
                    </h1>
                    <p className={`text-sm mt-1 ${muted}`}>
                        Habilitá las IPs que pueden acceder al <strong>Kiosk de Producción</strong> y al <strong>Kiosk de Fichaje</strong> sin necesitar login.
                    </p>
                </div>

                {/* Token recién creado — una sola vez */}
                {flash?.new_token && (
                    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                            <span className={`font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                Token creado — copialo ahora, no se mostrará de nuevo
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className={`flex-1 rounded-lg px-3 py-2 text-xs font-mono break-all ${
                                isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800 border border-slate-200'
                            }`}>
                                {flash.new_token}
                            </code>
                            <button
                                onClick={() => copyToken(flash.new_token)}
                                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* IPs permitidas */}
                <div className={`rounded-2xl border ${card}`}>
                    <div className="px-6 py-5 border-b border-inherit">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wifi size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                                <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    IPs permitidas
                                </span>
                            </div>
                            {!currentIpAlreadyAdded && (
                                <button
                                    onClick={addCurrentIp}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                                        isDark
                                            ? 'bg-teal-900/40 text-teal-400 hover:bg-teal-900/60 border border-teal-700/50'
                                            : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                                    }`}
                                >
                                    + Agregar mi IP ({currentIp})
                                </button>
                            )}
                        </div>
                        <p className={`text-xs mt-1 ${muted}`}>
                            Tu IP actual: <code className="font-mono">{currentIp}</code>
                        </p>
                    </div>

                    {/* Lista de IPs */}
                    {allowedIps.length === 0 ? (
                        <div className={`px-6 py-8 text-center text-sm ${muted}`}>
                            Ninguna IP configurada. Agregá la IP de la Raspberry Pi o de cualquier dispositivo que deba acceder al kiosk.
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-700/30">
                            {allowedIps.map((ip) => (
                                <li key={ip.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {ip.label}
                                            </span>
                                            {!ip.is_active && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    deshabilitada
                                                </span>
                                            )}
                                        </div>
                                        <code className={`text-xs font-mono ${muted}`}>{ip.ip_address}</code>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleIp(ip)}
                                        title={ip.is_active ? 'Deshabilitar' : 'Habilitar'}
                                        className={`p-2 rounded-lg transition ${
                                            ip.is_active
                                                ? isDark ? 'text-teal-400 hover:bg-teal-900/30' : 'text-teal-600 hover:bg-teal-50'
                                                : isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {ip.is_active ? <Wifi size={16} /> : <WifiOff size={16} />}
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteIp(ip)}
                                        className={`p-2 rounded-lg transition ${
                                            isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Formulario para agregar IP */}
                    <div className="px-6 py-5 border-t border-inherit">
                        <form onSubmit={submitIp} className="flex flex-col sm:flex-row gap-3">
                            <input
                                className={inputCls}
                                placeholder="Descripción (ej: Raspberry Pi Lab)"
                                value={ipForm.data.label}
                                onChange={(e) => ipForm.setData('label', e.target.value)}
                            />
                            <input
                                className={inputCls}
                                placeholder="IP o CIDR (ej: 192.168.1.50)"
                                value={ipForm.data.ip_address}
                                onChange={(e) => ipForm.setData('ip_address', e.target.value)}
                            />
                            <Button type="submit" disabled={ipForm.processing} className="shrink-0">
                                <Plus size={16} className="mr-1" /> Agregar
                            </Button>
                        </form>
                        {(ipForm.errors.label || ipForm.errors.ip_address) && (
                            <p className="mt-2 text-xs text-red-500">
                                {ipForm.errors.label || ipForm.errors.ip_address}
                            </p>
                        )}
                        <p className={`mt-2 text-xs ${muted}`}>
                            Soporta IP exacta (<code className="font-mono">192.168.1.50</code>) o rango CIDR (<code className="font-mono">192.168.1.0/24</code>).
                        </p>
                    </div>
                </div>

                {/* Token recién creado — Kiosk de Producción */}
                {flash?.new_device_token && (
                    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                            <span className={`font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                Token de dispositivo creado — copiá el link ahora, no se mostrará de nuevo
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className={`flex-1 rounded-lg px-3 py-2 text-xs font-mono break-all ${
                                isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800 border border-slate-200'
                            }`}>
                                {`${route('job-kiosk')}?token=${flash.new_device_token}`}
                            </code>
                            <button
                                onClick={() => copyToken(`${route('job-kiosk')}?token=${flash.new_device_token}`)}
                                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className={`text-xs mt-2 ${muted}`}>
                            Cargá este link en la app Android de la tablet (config del kiosk). Funciona sin importar la IP del dispositivo.
                        </p>
                    </div>
                )}

                {/* Tokens de dispositivo — Kiosk de Producción */}
                <div className={`rounded-2xl border ${card}`}>
                    <div className="px-6 py-5 border-b border-inherit">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                            <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Tokens de dispositivo — Kiosk de Producción
                            </span>
                        </div>
                        <p className={`text-xs mt-1 ${muted}`}>
                            Alternativa a la IP para la tablet del taller: no depende de la red, así que sobrevive cortes de luz,
                            reconexiones y cambios de IP. Se usa agregando <code className="font-mono">?token=...</code> al link del Kiosk.
                        </p>
                    </div>

                    {deviceTokens.length === 0 ? (
                        <div className={`px-6 py-8 text-center text-sm ${muted}`}>
                            Ningún token configurado todavía.
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-700/30">
                            {deviceTokens.map((t) => (
                                <li key={t.id} className="flex items-center gap-4 px-6 py-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {t.label}
                                            </span>
                                            {!t.is_active && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    deshabilitado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleDeviceToken(t)}
                                        title={t.is_active ? 'Deshabilitar' : 'Habilitar'}
                                        className={`p-2 rounded-lg transition ${
                                            t.is_active
                                                ? isDark ? 'text-teal-400 hover:bg-teal-900/30' : 'text-teal-600 hover:bg-teal-50'
                                                : isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {t.is_active ? <Wifi size={16} /> : <WifiOff size={16} />}
                                    </button>

                                    <button
                                        onClick={() => revokeDeviceToken(t)}
                                        className={`p-2 rounded-lg transition ${
                                            isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="px-6 py-5 border-t border-inherit">
                        <form onSubmit={submitDeviceToken} className="flex gap-3">
                            <input
                                className={inputCls}
                                placeholder="Nombre del dispositivo (ej: Tablet taller)"
                                value={deviceTokenForm.data.label}
                                onChange={(e) => deviceTokenForm.setData('label', e.target.value)}
                            />
                            <Button type="submit" disabled={deviceTokenForm.processing} className="shrink-0">
                                <Plus size={16} className="mr-1" /> Generar
                            </Button>
                        </form>
                        {deviceTokenForm.errors.label && (
                            <p className="mt-2 text-xs text-red-500">{deviceTokenForm.errors.label}</p>
                        )}
                    </div>
                </div>

                {/* Tokens de API (colapsable) */}
                <div className={`rounded-2xl border ${card}`}>
                    <button
                        className="w-full flex items-center justify-between px-6 py-5"
                        onClick={() => setShowTokens((v) => !v)}
                    >
                        <div className="flex items-center gap-2">
                            <Key size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                            <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Tokens de API
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {tokens.length}
                            </span>
                        </div>
                        {showTokens ? <ChevronUp size={16} className={muted} /> : <ChevronDown size={16} className={muted} />}
                    </button>

                    {showTokens && (
                        <>
                            <div className={`px-6 pb-2 text-xs ${muted} border-t border-inherit pt-3`}>
                                Tokens para conectar el <strong>Panel de Asignación</strong> u otras integraciones externas (Bearer token).
                            </div>

                            {tokens.length === 0 ? (
                                <div className={`px-6 py-6 text-center text-sm ${muted}`}>
                                    Sin tokens activos.
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-700/30">
                                    {tokens.map((t) => (
                                        <li key={t.id} className="flex items-center gap-4 px-6 py-4">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {t.name}
                                                </p>
                                                <p className={`text-xs ${muted}`}>
                                                    Creado {t.created_at}
                                                    {t.last_used_at ? ` · Último uso ${t.last_used_at}` : ' · Nunca usado'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => revokeToken(t.id)}
                                                className={`p-2 rounded-lg transition ${
                                                    isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                                                }`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="px-6 py-5 border-t border-inherit">
                                <form onSubmit={submitToken} className="flex gap-3">
                                    <input
                                        className={inputCls}
                                        placeholder="Nombre del token (ej: Panel Asignación)"
                                        value={tokenForm.data.name}
                                        onChange={(e) => tokenForm.setData('name', e.target.value)}
                                    />
                                    <Button type="submit" disabled={tokenForm.processing} variant="outline" className="shrink-0">
                                        <Plus size={16} className="mr-1" /> Generar
                                    </Button>
                                </form>
                                {tokenForm.errors.name && (
                                    <p className="mt-2 text-xs text-red-500">{tokenForm.errors.name}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
