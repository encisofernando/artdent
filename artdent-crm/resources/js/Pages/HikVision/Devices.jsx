import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    Fingerprint, Wifi, WifiOff, Plus, Trash2, Pencil, RotateCcw,
    Users, Radio, Clock, AlertCircle, CheckCircle2, Loader2,
    ChevronDown, ChevronUp, Link2,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Devices({ auth, devices = [], collaborators = [], webhookUrl }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const [editId, setEditId] = useState(null);
    const [loadingAction, setLoadingAction] = useState({}); // { deviceId_action: true }
    const [actionResult, setActionResult] = useState({}); // { deviceId_action: {ok, message} }
    const [showAddForm, setShowAddForm] = useState(false);

    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
        isDark
            ? 'bg-slate-800 border-slate-600 text-slate-100 focus:ring-teal-500/40'
            : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/30'
    }`;

    /* ── Add form ── */
    const addForm = useForm({
        name: '', device_model: 'DS-K1T320MFWX', connection_type: 'isapi', ip_address: '', mac_address: '',
        port: '80', username: 'admin', password: '', isup_verify_code: '', notes: '',
    });

    /* ── Edit form ── */
    const editForm = useForm({
        name: '', ip_address: '', mac_address: '', port: '80', username: 'admin',
        password: '', isup_verify_code: '', is_active: true, notes: '',
    });

    function startEdit(device) {
        setEditId(device.id);
        editForm.setData({
            name: device.name,
            ip_address: device.ip_address,
            mac_address: device.mac_address ?? '',
            port: String(device.port),
            username: device.username,
            password: '',
            isup_verify_code: device.isup_verify_code ?? '',
            is_active: device.is_active,
            notes: device.notes ?? '',
        });
    }

    function submitAdd(e) {
        e.preventDefault();
        addForm.post(route('hikvision.devices.store'), {
            onSuccess: () => { addForm.reset(); setShowAddForm(false); },
        });
    }

    function submitEdit(e, deviceId) {
        e.preventDefault();
        editForm.put(route('hikvision.devices.update', deviceId), {
            onSuccess: () => setEditId(null),
        });
    }

    async function deleteDevice(device) {
        const ok = await confirmDialog({
            title: 'Eliminar terminal',
            message: `¿Eliminar "${device.name}"? Se perderán todos los eventos asociados.`,
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) { return; }
        router.delete(route('hikvision.devices.destroy', device.id));
    }

    /* ── Device actions (ISAPI calls, return JSON) ── */
    async function deviceAction(device, action, label) {
        const key = `${device.id}_${action}`;
        setLoadingAction(prev => ({ ...prev, [key]: true }));
        setActionResult(prev => ({ ...prev, [key]: null }));

        try {
            const response = await fetch(route(`hikvision.devices.${action}`, device.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            setActionResult(prev => ({
                ...prev,
                [key]: { ok: data.ok, message: data.ok ? `${label} exitoso` : (data.error ?? 'Error') },
            }));

            // Recargar la página para ver cambios (último heartbeat, etc.)
            if (data.ok && action === 'test-connection') {
                router.reload({ only: ['devices'] });
            }
        } catch {
            setActionResult(prev => ({ ...prev, [key]: { ok: false, message: 'Error de red' } }));
        } finally {
            setLoadingAction(prev => ({ ...prev, [key]: false }));
        }
    }

    function ActionBtn({ device, action, routeName, icon: Icon, label, className = '' }) {
        const key = `${device.id}_${action}`;
        const loading = loadingAction[key];
        const result = actionResult[key];

        return (
            <div className="flex flex-col gap-0.5">
                <button
                    onClick={() => deviceAction(device, action, label)}
                    disabled={loading}
                    title={label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${className}`}
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                    {label}
                </button>
                {result && (
                    <span className={`text-[10px] px-2 ${result.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                        {result.ok ? '✓' : '✗'} {result.message}
                    </span>
                )}
            </div>
        );
    }

    const btnOutline = isDark
        ? 'border border-slate-600 text-slate-300 hover:bg-slate-700'
        : 'border border-slate-300 text-slate-700 hover:bg-slate-50';

    const btnTeal = 'bg-teal-600 hover:bg-teal-700 text-white';
    const btnRed = isDark
        ? 'border border-red-500/40 text-red-400 hover:bg-red-950/40'
        : 'border border-red-300 text-red-600 hover:bg-red-50';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Terminales HikVision" />
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Fingerprint className={`h-7 w-7 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                        <div>
                            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Terminales HikVision
                            </h1>
                            <p className={`text-sm ${muted}`}>ISAPI + push de eventos de asistencia</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={route('hikvision.events.index')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${btnOutline}`}>
                            <Radio className="h-4 w-4" /> Eventos
                        </a>
                        <Button onClick={() => setShowAddForm(!showAddForm)} className={btnTeal}>
                            <Plus className="h-4 w-4" /> Agregar terminal
                        </Button>
                    </div>
                </div>

                {/* Webhook URL info */}
                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${card}`}>
                    <Link2 className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    <div className="min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            URL del Webhook (configurar en el terminal)
                        </p>
                        <code className={`text-xs break-all ${muted}`}>{webhookUrl}</code>
                        <p className={`text-xs mt-1 ${muted}`}>
                            En el terminal: Configuración → Red → Plataforma de Acceso → HTTP → Dirección del servidor
                        </p>
                    </div>
                </div>

                {/* Add form */}
                {showAddForm && (
                    <div className={`rounded-2xl border p-6 ${card}`}>
                        <h2 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Registrar nuevo terminal
                        </h2>
                        <form onSubmit={submitAdd} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Nombre</label>
                                <input className={inputCls} value={addForm.data.name}
                                    onChange={e => addForm.setData('name', e.target.value)}
                                    placeholder="ej. Terminal Entrada" />
                                {addForm.errors.name && <p className="text-red-400 text-xs mt-1">{addForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Modelo</label>
                                <input className={inputCls} value={addForm.data.device_model}
                                    onChange={e => addForm.setData('device_model', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Tipo de conexión</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'isapi', label: 'ISAPI (pull/push por IP)' },
                                        { value: 'isup', label: 'ISUP (el terminal se conecta al listener)' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => addForm.setData('connection_type', opt.value)}
                                            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium text-left transition ${
                                                addForm.data.connection_type === opt.value
                                                    ? 'border-teal-500 bg-teal-500/10 text-teal-500'
                                                    : (isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600')
                                            }`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {addForm.data.connection_type === 'isup' ? (
                                <div className={`col-span-2 rounded-xl border p-3 text-xs ${isDark ? 'border-teal-500/30 bg-teal-500/5 text-teal-300' : 'border-teal-300 bg-teal-50 text-teal-700'}`}>
                                    Al registrar se genera un <strong>Account ID</strong> nuevo, que hay que cargar en el
                                    terminal en Configuración → Red → Plataforma de acceso → ISUP, junto con la
                                    dirección y el puerto del listener. No hace falta IP ni contraseña acá — el
                                    terminal es el que inicia la conexión.
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${muted}`}>IP o hostname del terminal</label>
                                        <input className={inputCls} value={addForm.data.ip_address}
                                            onChange={e => addForm.setData('ip_address', e.target.value)}
                                            placeholder="192.168.1.100 o midominio.ddns.net" />
                                        {addForm.errors.ip_address && <p className="text-red-400 text-xs mt-1">{addForm.errors.ip_address}</p>}
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${muted}`}>Puerto</label>
                                        <input className={inputCls} type="number" value={addForm.data.port}
                                            onChange={e => addForm.setData('port', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${muted}`}>Usuario</label>
                                        <input className={inputCls} value={addForm.data.username}
                                            onChange={e => addForm.setData('username', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${muted}`}>Contraseña</label>
                                        <input className={inputCls} type="password" value={addForm.data.password}
                                            onChange={e => addForm.setData('password', e.target.value)} />
                                        {addForm.errors.password && <p className="text-red-400 text-xs mt-1">{addForm.errors.password}</p>}
                                    </div>
                                </>
                            )}
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>MAC address (opcional)</label>
                                <input className={inputCls} value={addForm.data.mac_address}
                                    onChange={e => addForm.setData('mac_address', e.target.value)}
                                    placeholder="AA:BB:CC:DD:EE:FF" />
                                {addForm.errors.mac_address && <p className="text-red-400 text-xs mt-1">{addForm.errors.mac_address}</p>}
                                <p className={`text-[11px] mt-1 ${muted}`}>Configuración → Red → TCP/IP en el terminal. Necesaria si el terminal pushea eventos a través de un router/WAN (la IP de origen no coincide con la IP configurada).</p>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Código ISUP 5.0 (opcional, sólo ISAPI)</label>
                                <input className={inputCls} value={addForm.data.isup_verify_code}
                                    onChange={e => addForm.setData('isup_verify_code', e.target.value)}
                                    placeholder="Para registro ISUP 5.0" />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Notas</label>
                                <input className={inputCls} value={addForm.data.notes}
                                    onChange={e => addForm.setData('notes', e.target.value)} />
                            </div>
                            <div className="col-span-2 flex gap-2 justify-end">
                                <Button type="button" onClick={() => setShowAddForm(false)} className={btnOutline}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={addForm.processing} className={btnTeal}>
                                    {addForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Registrar
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Device list */}
                {devices.length === 0 ? (
                    <div className={`rounded-2xl border p-12 text-center ${card}`}>
                        <Fingerprint className={`h-10 w-10 mx-auto mb-3 ${muted}`} />
                        <p className={`text-sm ${muted}`}>No hay terminales registrados. Agrega uno para comenzar.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {devices.map(device => (
                            <div key={device.id} className={`rounded-2xl border ${card}`}>
                                {editId === device.id ? (
                                    /* Edit form */
                                    <form onSubmit={e => submitEdit(e, device.id)} className="p-6 grid grid-cols-2 gap-4">
                                        <div className="col-span-2 flex items-center justify-between mb-2">
                                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                Editando: {device.name}
                                            </span>
                                            <button type="button" onClick={() => setEditId(null)}
                                                className={`text-xs ${muted} hover:underline`}>Cancelar</button>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>Nombre</label>
                                            <input className={inputCls} value={editForm.data.name}
                                                onChange={e => editForm.setData('name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>IP</label>
                                            <input className={inputCls} value={editForm.data.ip_address}
                                                onChange={e => editForm.setData('ip_address', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>MAC address (opcional)</label>
                                            <input className={inputCls} value={editForm.data.mac_address}
                                                onChange={e => editForm.setData('mac_address', e.target.value)}
                                                placeholder="AA:BB:CC:DD:EE:FF" />
                                            {editForm.errors.mac_address && <p className="text-red-400 text-xs mt-1">{editForm.errors.mac_address}</p>}
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>Puerto</label>
                                            <input className={inputCls} type="number" value={editForm.data.port}
                                                onChange={e => editForm.setData('port', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>Usuario</label>
                                            <input className={inputCls} value={editForm.data.username}
                                                onChange={e => editForm.setData('username', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>Contraseña (dejar vacío para no cambiar)</label>
                                            <input className={inputCls} type="password" value={editForm.data.password}
                                                onChange={e => editForm.setData('password', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${muted}`}>Código ISUP</label>
                                            <input className={inputCls} value={editForm.data.isup_verify_code}
                                                onChange={e => editForm.setData('isup_verify_code', e.target.value)} />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <input type="checkbox" id="is_active_edit" checked={editForm.data.is_active}
                                                onChange={e => editForm.setData('is_active', e.target.checked)}
                                                className="rounded" />
                                            <label htmlFor="is_active_edit" className={`text-sm ${muted}`}>Activo</label>
                                        </div>
                                        <div className="col-span-2 flex gap-2 justify-end">
                                            <Button type="button" onClick={() => setEditId(null)} className={btnOutline}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={editForm.processing} className={btnTeal}>
                                                {editForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                                Guardar
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    /* Device card */
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left: info */}
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={`mt-0.5 p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                    {device.is_active
                                                        ? <Wifi className="h-5 w-5 text-teal-500" />
                                                        : <WifiOff className={`h-5 w-5 ${muted}`} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                            {device.name}
                                                        </span>
                                                        {!device.is_active && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                        {device.connection_type === 'isup' && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                                device.isup_effective_status === 'connected'
                                                                    ? 'bg-emerald-500/15 text-emerald-500'
                                                                    : device.isup_effective_status === 'stale'
                                                                        ? 'bg-red-500/15 text-red-500'
                                                                        : device.isup_effective_status === 'disconnected'
                                                                            ? 'bg-amber-500/15 text-amber-500'
                                                                            : 'bg-slate-500/20 text-slate-400'
                                                            }`} title={device.isup_effective_status === 'stale' ? `Sin señal desde ${device.isup_last_connected_at ? new Date(device.isup_last_connected_at).toLocaleString('es-AR') : '?'} — puede estar colgado` : undefined}>
                                                                ISUP · {
                                                                    device.isup_effective_status === 'connected' ? 'conectado'
                                                                        : device.isup_effective_status === 'stale' ? 'sin señal'
                                                                            : device.isup_effective_status === 'disconnected' ? 'desconectado'
                                                                                : 'nunca se conectó'
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {device.connection_type === 'isup' ? (
                                                        <p className={`text-xs mt-0.5 ${muted}`}>
                                                            {device.device_model} · Account ID: <code className="font-mono">{device.isup_account_id}</code>
                                                            {device.ip_address && device.ip_address !== '0.0.0.0' && ` · última IP: ${device.ip_address}`}
                                                        </p>
                                                    ) : (
                                                        <p className={`text-xs mt-0.5 ${muted}`}>
                                                            {device.device_model} · {device.ip_address}:{device.port} · usuario: {device.username}
                                                            {device.mac_address && ` · MAC: ${device.mac_address}`}
                                                        </p>
                                                    )}
                                                    {device.serial_no && (
                                                        <p className={`text-xs ${muted}`}>S/N: {device.serial_no} · FW: {device.firmware_version}</p>
                                                    )}
                                                    {device.connection_type === 'isup' && device.isup_last_connected_at && (
                                                        <p className={`text-xs ${muted}`}>
                                                            <Clock className="inline h-3 w-3 mr-0.5" />
                                                            Última conexión ISUP: {new Date(device.isup_last_connected_at).toLocaleString('es-AR')}
                                                        </p>
                                                    )}
                                                    {device.last_heartbeat_at && (
                                                        <p className={`text-xs ${muted}`}>
                                                            <Clock className="inline h-3 w-3 mr-0.5" />
                                                            Último heartbeat: {new Date(device.last_heartbeat_at).toLocaleString('es-AR')}
                                                        </p>
                                                    )}
                                                    <p className={`text-xs ${muted}`}>
                                                        {device.events_count ?? 0} eventos registrados
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Right: edit/delete */}
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => startEdit(device)}
                                                    className={`p-1.5 rounded-lg ${btnOutline}`}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => deleteDevice(device)}
                                                    className={`p-1.5 rounded-lg ${btnRed}`}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions row — llamadas ISAPI directas al terminal, no aplican a ISUP
                                            (ahí es el terminal el que se conecta al listener, no al revés) */}
                                        {device.connection_type === 'isup' ? (
                                            <div className={`mt-4 pt-4 border-t text-xs ${muted}`}
                                                style={{ borderColor: isDark ? 'rgb(51,65,85)' : 'rgb(226,232,240)' }}>
                                                Cargá el Account ID de arriba en el terminal (Configuración → Red →
                                                Plataforma de acceso → ISUP) para que se conecte al listener. El estado
                                                de conexión se actualiza solo cuando el terminal se registra.
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2"
                                                style={{ borderColor: isDark ? 'rgb(51,65,85)' : 'rgb(226,232,240)' }}>
                                                <ActionBtn device={device} action="test-connection"
                                                    icon={Wifi} label="Probar conexión"
                                                    className={btnOutline} />
                                                <ActionBtn device={device} action="sync-collaborators"
                                                    icon={Users} label="Sincronizar colaboradores"
                                                    className={btnOutline} />
                                                <ActionBtn device={device} action="subscribe-events"
                                                    icon={Radio} label="Configurar eventos"
                                                    className={btnOutline} />
                                                <ActionBtn device={device} action="sync-time"
                                                    icon={Clock} label="Sincronizar hora"
                                                    className={btnOutline} />
                                                <ActionBtn device={device} action="pull-records"
                                                    icon={RotateCcw} label="Pull registros"
                                                    className={btnOutline} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
