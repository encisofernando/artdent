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
        name: '', device_model: 'DS-K1T320MFWX', ip_address: '',
        port: '80', username: 'admin', password: '', isup_verify_code: '', notes: '',
    });

    /* ── Edit form ── */
    const editForm = useForm({
        name: '', ip_address: '', port: '80', username: 'admin',
        password: '', isup_verify_code: '', is_active: true, notes: '',
    });

    function startEdit(device) {
        setEditId(device.id);
        editForm.setData({
            name: device.name,
            ip_address: device.ip_address,
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
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>IP del terminal</label>
                                <input className={inputCls} value={addForm.data.ip_address}
                                    onChange={e => addForm.setData('ip_address', e.target.value)}
                                    placeholder="192.168.1.100" />
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
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${muted}`}>Código ISUP (opcional)</label>
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
                                                    </div>
                                                    <p className={`text-xs mt-0.5 ${muted}`}>
                                                        {device.device_model} · {device.ip_address}:{device.port} · usuario: {device.username}
                                                    </p>
                                                    {device.serial_no && (
                                                        <p className={`text-xs ${muted}`}>S/N: {device.serial_no} · FW: {device.firmware_version}</p>
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

                                        {/* Actions row */}
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
