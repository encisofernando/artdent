import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Building2, Receipt, MapPin, Globe, MessageSquare,
    Save, UploadCloud, X, Camera, CheckCircle2,
    ShieldCheck, KeyRound, FileCheck2, Loader2, Wifi, CircleCheck, CircleX, FileCog,
    Mail, Printer, Bot, Landmark, BookOpen, ShoppingBag, BarChart3,
    Plus, Trash2, Edit, Star, Store,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';
import axios from 'axios';
import {
    isNativePrintAvailable, getStoredPrinterConfig, setStoredPrinterConfig, printRawBytes,
    getStoredPrinterTransport, setStoredPrinterTransport,
    getStoredUsbPrinterConfig, setStoredUsbPrinterConfig, listUsbPrinters,
} from '@/lib/nativePrinter';
import { buildTestTicket } from '@/lib/escpos';

const CHATBOT_MODEL_OPTIONS = [
    { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 · rápido, menor costo (recomendado)' },
    { value: 'claude-sonnet-5', label: 'Sonnet 5 · equilibrado, alta calidad' },
    { value: 'claude-opus-4-8', label: 'Opus 4.8 · máxima inteligencia' },
];

const DEFAULT_CHATBOT_MODEL = 'claude-haiku-4-5-20251001';

function PointOfSaleForm({ isDark, branches, initial, onCancel, onSubmit, saving, error }) {
    const [form, setForm] = useState(initial);

    const inp = `w-full rounded-xl border text-sm font-medium px-3.5 py-2.5 transition-colors focus:ring-0 ${isDark
        ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm'}`;
    const lbl = `block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    // No es un <form> a propósito: este componente se renderiza dentro del
    // <form> grande de "Perfil de Empresa" (más abajo en este archivo), y
    // HTML no permite formularios anidados — el navegador termina mandando
    // el submit al formulario equivocado (el de perfil de empresa), que
    // hace su propio POST a /settings sin tocar el punto de venta.
    return (
        <div className={`p-4 rounded-xl border grid gap-4 sm:grid-cols-2 ${isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div>
                <label className={lbl}>Número de punto de venta</label>
                <input type="number" min="1" max="99999" className={inp} value={form.point_sale}
                    onChange={(e) => setForm((f) => ({ ...f, point_sale: e.target.value }))} placeholder="Ej: 1" />
            </div>
            <div>
                <label className={lbl}>Etiqueta</label>
                <input className={inp} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Ej: Sucursal Centro" />
            </div>
            <div>
                <label className={lbl}>Sucursal</label>
                <SearchableSelect
                    value={form.branch_id ? String(form.branch_id) : ''}
                    onChange={(v) => setForm((f) => ({ ...f, branch_id: v || null }))}
                    placeholder="Sin sucursal asignada (usa el default)"
                    options={branches.map((b) => ({ value: String(b.id), label: b.name }))}
                />
            </div>
            <div className="flex items-end gap-5 pb-1">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} className="rounded" />
                    Por defecto
                </label>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                    Activo
                </label>
            </div>

            {error && <div className="sm:col-span-2 text-red-500 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}

            <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                    Cancelar
                </Button>
                <Button type="button" onClick={() => onSubmit(form)} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 min-w-32">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                </Button>
            </div>
        </div>
    );
}

function PointsOfSaleManager({ isDark }) {
    const [items, setItems] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(route('afip.points-of-sale.index'));
            setItems(data.points_of_sale);
            setBranches(data.branches);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const blankForm = () => ({
        point_sale: '', branch_id: null, label: '', is_default: items.length === 0, is_active: true,
    });

    const submitCreate = async (form) => {
        setSaving(true);
        setError('');
        try {
            await axios.post(route('afip.points-of-sale.store'), form);
            setShowCreate(false);
            await load();
        } catch (e) {
            setError(e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : (e.response?.data?.error || 'Error al guardar.'));
        } finally {
            setSaving(false);
        }
    };

    const submitUpdate = async (id, form) => {
        setSaving(true);
        setError('');
        try {
            await axios.put(route('afip.points-of-sale.update', id), form);
            setEditingId(null);
            await load();
        } catch (e) {
            setError(e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : (e.response?.data?.error || 'Error al guardar.'));
        } finally {
            setSaving(false);
        }
    };

    const destroy = async (id) => {
        if (!window.confirm('¿Eliminar este punto de venta?')) return;
        try {
            await axios.delete(route('afip.points-of-sale.destroy', id));
            await load();
        } catch (e) {
            alert(e.response?.data?.error || 'Error al eliminar.');
        }
    };

    return (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                    <Store size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                    <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Puntos de venta
                    </h3>
                </div>
                {!showCreate && (
                    <Button type="button" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); }} className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                        <Plus size={14} /> Nuevo
                    </Button>
                )}
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cada venta usa el punto de venta asignado a su sucursal; si la sucursal no tiene uno propio, se usa el marcado como "Por defecto".
            </p>

            {showCreate && (
                <div className="mb-4">
                    <PointOfSaleForm
                        isDark={isDark}
                        branches={branches}
                        initial={blankForm()}
                        onCancel={() => { setShowCreate(false); setError(''); }}
                        onSubmit={submitCreate}
                        saving={saving}
                        error={error}
                    />
                </div>
            )}

            {loading ? (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cargando…</div>
            ) : items.length === 0 && !showCreate ? (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay puntos de venta configurados.</div>
            ) : (
                <div className="space-y-2">
                    {items.map((pos) => (
                        <div key={pos.id}>
                            {editingId === pos.id ? (
                                <PointOfSaleForm
                                    isDark={isDark}
                                    branches={branches}
                                    initial={{
                                        point_sale: pos.point_sale,
                                        branch_id: pos.branch_id,
                                        label: pos.label ?? '',
                                        is_default: pos.is_default,
                                        is_active: pos.is_active,
                                    }}
                                    onCancel={() => { setEditingId(null); setError(''); }}
                                    onSubmit={(form) => submitUpdate(pos.id, form)}
                                    saving={saving}
                                    error={error}
                                />
                            ) : (
                                <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                            {String(pos.point_sale).padStart(4, '0')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {pos.label || `Punto de venta ${pos.point_sale}`}
                                            </p>
                                            <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {pos.branch?.name || 'Sin sucursal asignada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {pos.is_default && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
                                                <Star size={10} /> Default
                                            </span>
                                        )}
                                        {pos.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Activo</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400">Inactivo</span>
                                        )}
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(pos.id); setShowCreate(false); setError(''); }} className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                            <Edit size={13} />
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => destroy(pos.id)} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Settings({ company, accountingSettings }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState(() => {
        try {
            const t = new URLSearchParams(window.location.search).get('tab');
            if (['perfil', 'fiscal', 'contable', 'ubicacion', 'preferencias', 'integraciones', 'ecommerce', 'emails', 'afip'].includes(t)) {
                return t;
            }
        } catch {}
        return 'perfil';
    });
    const [ticketFormat, setTicketFormat] = useState(
        () => localStorage.getItem('artdent_ticket_format') || '80mm'
    );
    const [printBackend, setPrintBackend] = useState(
        () => localStorage.getItem('artdent_print_backend') || 'electron'
    );

    const saveTicketFormat = (fmt) => {
        setTicketFormat(fmt);
        localStorage.setItem('artdent_ticket_format', fmt);
    };
    const savePrintBackend = (b) => {
        setPrintBackend(b);
        localStorage.setItem('artdent_print_backend', b);
    };
    const [printerConfig, setPrinterConfig] = useState(() => getStoredPrinterConfig());
    const [printerTestState, setPrinterTestState] = useState({ status: 'idle', message: '' });
    const [printerTransport, setPrinterTransport] = useState(() => getStoredPrinterTransport());
    const [usbPrinterConfig, setUsbPrinterConfig] = useState(() => getStoredUsbPrinterConfig());
    const [usbDevices, setUsbDevices] = useState([]);
    const [usbScanState, setUsbScanState] = useState({ status: 'idle', message: '' });

    const savePrinterConfig = (next) => {
        const saved = setStoredPrinterConfig(next);
        setPrinterConfig(saved);
        return saved;
    };

    const savePrinterTransport = (transport) => {
        setPrinterTransport(setStoredPrinterTransport(transport));
    };

    const saveUsbPrinterConfig = (next) => {
        const saved = setStoredUsbPrinterConfig(next);
        setUsbPrinterConfig(saved);
        return saved;
    };

    const handleScanUsb = async () => {
        setUsbScanState({ status: 'loading', message: '' });
        const result = await listUsbPrinters();

        if (!result.ok) {
            setUsbScanState({ status: 'error', message: result.error });
            return;
        }

        setUsbDevices(result.devices);
        setUsbScanState({
            status: 'success',
            message: result.devices.length ? `${result.devices.length} dispositivo(s) encontrado(s).` : 'No se encontró ningún dispositivo USB conectado.',
        });
    };

    const handleTestPrint = async () => {
        setPrinterTestState({ status: 'loading', message: '' });
        const ticket = buildTestTicket({ companyName: company.fantasy_name || company.name || 'ArtCode CRM' });
        const result = await printRawBytes(ticket, printerTransport === 'usb' ? usbPrinterConfig : printerConfig);

        setPrinterTestState({
            status: result.ok ? 'success' : 'error',
            message: result.ok ? 'Ticket de prueba enviado correctamente.' : result.error,
        });
    };
    const [logoPreview, setLogoPreview] = useState(company.logo_url || null);
    const [labLogoPreview, setLabLogoPreview] = useState(company.lab_logo_url || null);
    const fileInputRef = useRef(null);
    const labFileInputRef = useRef(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'put', // Using POST with _method=put to handle file uploads in Laravel
        name: company.name || '',
        fantasy_name: company.fantasy_name || '',
        logo: null,
        lab_logo: null,
        cuit: company.cuit || '',
        iva_condition: company.iva_condition || '',
        iibb: company.iibb || '',
        start_date: company.start_date ? String(company.start_date).substring(0, 10) : '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        instagram_handle: company.instagram_handle || '',
        tariff_notes: company.tariff_notes || '',
        collaborator_commission_pct: company.collaborator_commission_pct ?? '',
        address: company.address || '',
        city: company.city || '',
        province: company.province || '',
        postal_code: company.postal_code || '',
        country: company.country || '',
        currency: company.currency || 'ARS',
        timezone: company.timezone || 'America/Argentina/Buenos_Aires',
        whatsapp_phone_number_id: company.whatsapp_phone_number_id || '',
        whatsapp_access_token: company.whatsapp_access_token || '',
        whatsapp_message_template: company.whatsapp_message_template || '',
        whatsapp_contact_number: company.whatsapp_contact_number || '',
        ga4_measurement_id: company.ga4_measurement_id || '',
        meta_pixel_id: company.meta_pixel_id || '',
        hotjar_id: company.hotjar_id || '',
        google_tag_manager_id: company.google_tag_manager_id || '',
        email_sale_subject: company.email_sale_subject || '',
        email_sale_body: company.email_sale_body || '',
        email_quote_subject: company.email_quote_subject || '',
        email_quote_body: company.email_quote_body || '',
        email_payment_subject: company.email_payment_subject || '',
        email_payment_body: company.email_payment_body || '',
        chatbot_enabled: company.chatbot_enabled ?? true,
        chatbot_provider: 'claude',
        chatbot_model: company.chatbot_model || DEFAULT_CHATBOT_MODEL,
        chatbot_anthropic_key: company.chatbot_anthropic_key || '',
        accounting_settings: accountingSettings || {},
    });

    const TABS = [
        { id: 'perfil', label: 'Perfil de Empresa', icon: Building2 },
        { id: 'fiscal', label: 'Datos Fiscales', icon: Receipt },
        { id: 'contable', label: 'Contable', icon: Landmark },
        { id: 'ubicacion', label: 'Ubicación', icon: MapPin },
        { id: 'preferencias', label: 'Preferencias', icon: Globe },
        { id: 'integraciones', label: 'Integraciones', icon: MessageSquare },
        { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
        { id: 'emails', label: 'Emails', icon: Mail },
        { id: 'afip', label: 'AFIP / ARCA', icon: ShieldCheck },
    ];

    // ── Estado AFIP ──────────────────────────────────────────────────────────
    const [afipSettings, setAfipSettings] = useState({
        afip_environment:  company.afip_environment  ?? 'homo',
        afip_auto_invoice: company.afip_auto_invoice ?? false,
    });
    const [afipSaving,    setAfipSaving]    = useState(false);
    const [afipMsg,       setAfipMsg]       = useState('');
    const [afipError,     setAfipError]     = useState('');
    const [certUploading, setCertUploading] = useState({ cert_prod: false, cert_homo: false, key: false });
    const [certStatus,    setCertStatus]    = useState({
        cert_prod: company.afip_cert_path      ? 'ok' : null,
        cert_homo: company.afip_homo_cert_path ? 'ok' : null,
        key:       company.afip_key_path       ? 'ok' : null,
    });
    const [testingConn,   setTestingConn]   = useState(null); // null | 'homo' | 'prod'
    const [testResult,    setTestResult]    = useState(null); // null | { success, environment, checks, error }
    const certProdRef = useRef(null);
    const certHomoRef = useRef(null);
    const keyRef      = useRef(null);

    // ── Estado CSR ───────────────────────────────────────────────────────────
    const [csrAlias,      setCsrAlias]      = useState('');
    const [csrGenerating, setCsrGenerating] = useState(false);
    const [csrResult,     setCsrResult]     = useState(null); // null | { success, csr, alias, message, error }

    const handleAfipSave = async () => {
        setAfipSaving(true);
        setAfipMsg('');
        setAfipError('');
        try {
            await axios.post(route('afip.settings'), afipSettings);
            setAfipMsg('Configuración AFIP guardada correctamente.');
        } catch (e) {
            setAfipError(e.response?.data?.errors
                ? Object.values(e.response.data.errors).flat().join(' ')
                : (e.response?.data?.message || 'Error al guardar.'));
        } finally {
            setAfipSaving(false);
        }
    };

    // slotKey: 'cert_prod' | 'cert_homo' | 'key'
    const handleCertUpload = async (slotKey) => {
        const refMap = { cert_prod: certProdRef, cert_homo: certHomoRef, key: keyRef };
        const ref = refMap[slotKey];
        const file = ref.current?.files?.[0];
        if (!file) return;
        setCertUploading(s => ({ ...s, [slotKey]: true }));
        setCertStatus(s => ({ ...s, [slotKey]: null }));
        setAfipError('');
        try {
            const form = new FormData();
            form.append('type', slotKey === 'key' ? 'key' : 'cert');
            form.append('env',  slotKey === 'cert_homo' ? 'homo' : 'prod');
            form.append('file', file);
            await axios.post(route('afip.upload-cert'), form);
            setCertStatus(s => ({ ...s, [slotKey]: 'ok' }));
        } catch (e) {
            setCertStatus(s => ({ ...s, [slotKey]: 'error' }));
            setAfipError(e.response?.data?.message || 'Error al subir el archivo.');
        } finally {
            setCertUploading(s => ({ ...s, [slotKey]: false }));
            ref.current.value = '';
        }
    };

    const handleGenerateCsr = async () => {
        setCsrGenerating(true);
        setCsrResult(null);
        try {
            const { data } = await axios.post(route('afip.generate-csr'), { alias: csrAlias });
            setCsrResult(data);
            if (data.success) {
                // La clave privada se guardó automáticamente — reflejar en el indicador de estado
                setCertStatus(s => ({ ...s, key: 'ok' }));
            }
        } catch (e) {
            setCsrResult(e.response?.data ?? { success: false, error: 'Error de red o servidor.' });
        } finally {
            setCsrGenerating(false);
        }
    };

    const handleDownloadCsr = () => {
        if (!csrResult?.csr) return;
        const blob = new Blob([csrResult.csr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${csrResult.alias}.csr`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleTestConnection = async (env) => {
        setTestingConn(env);
        setTestResult(null);
        try {
            const { data } = await axios.get(route('afip.test-connection'), { params: { env } });
            setTestResult(data);
        } catch (e) {
            setTestResult(e.response?.data ?? { success: false, error: 'Error de red o servidor.' });
        } finally {
            setTestingConn(null);
        }
    };

    const handleLogoChange = (field, setPreview) => (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setData(field, file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = (field, setPreview, fallbackPreview, inputRef) => () => {
        setData(field, null);
        setPreview(fallbackPreview || null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const logoUploadFields = [
        {
            field: 'logo',
            preview: logoPreview,
            setPreview: setLogoPreview,
            fallbackPreview: company.logo_url || null,
            inputRef: fileInputRef,
            title: 'Logo general',
            hint: 'Usado en insumos, ecommerce y comprobantes A4 comerciales.',
            description: 'Recomendamos PNG o WebP transparente de al menos 600 px. También se reutiliza en PDFs, emails y tickets si no hay uno específico.',
            badge: 'Insumos + Ecommerce',
        },
        {
            field: 'lab_logo',
            preview: labLogoPreview,
            setPreview: setLabLogoPreview,
            fallbackPreview: company.lab_logo_url || null,
            inputRef: labFileInputRef,
            title: 'Logo laboratorio',
            hint: 'Usado en órdenes, recibos, finanzas y presupuestos del laboratorio.',
            description: 'Si no lo cargás, el sistema usa automáticamente el logo general como respaldo.',
            badge: 'Laboratorio',
        },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Inertia uses POST for multipart form data, even when updating. We injected _method: 'put'.
        post(route('settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const setChatbotProvider = () => {
        setData('chatbot_provider', 'claude');
    };

    const accounting = data.accounting_settings || {};
    const setAccountingSetting = (key, value) => {
        setData('accounting_settings', {
            ...accounting,
            [key]: value,
        });
    };

    const renderInput = (id, label, type = 'text', placeholder = '', className = '') => (
        <div className={className}>
            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
            </label>
            <input
                type={type}
                value={data[id]}
                onChange={e => setData(id, e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                        ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                    }`}
            />
            {errors[id] && <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{errors[id]}</div>}
        </div>
    );

    const renderAccountingToggle = (key, label, description) => {
        const enabled = Boolean(accounting[key]);

        return (
            <button
                type="button"
                onClick={() => setAccountingSetting(key, !enabled)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                    enabled
                        ? (isDark ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50')
                        : (isDark ? 'border-slate-700 bg-slate-800/40 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300')
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                        enabled
                            ? 'bg-emerald-500 text-white'
                            : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')
                    }`}>
                        {enabled ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </button>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configuración de la Empresa" />

            <div className="max-w-6xl mx-auto space-y-8 pt-8 pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Building2 className="text-blue-600 dark:text-blue-400" size={18} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                Plataforma & Empresa
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            Gestioná la identidad, fiscalidad y preferencias globales de tu organización.
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className={`rounded-2xl border p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible sticky top-24 shadow-xl ${isDark ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800' : 'bg-white/90 backdrop-blur-xl border-slate-100'
                            }`}>
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700')
                                            : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                                        }`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? (isDark ? 'text-blue-300' : 'text-blue-600') : ''} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`flex-1 rounded-3xl border p-8 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                        }`}>

                        {/* Tab Content: PERFIL */}
                        {activeTab === 'perfil' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Identidad Visual y Pública</h3>

                                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {logoUploadFields.map((logoField) => (
                                            <div
                                                key={logoField.field}
                                                className={`rounded-3xl border p-5 flex flex-col gap-4 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/70'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                                                {logoField.badge}
                                                            </span>
                                                        </div>
                                                        <h4 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                            {logoField.title}
                                                        </h4>
                                                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {logoField.hint}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-start gap-5">
                                                    <div className="relative group shrink-0">
                                                        <div className={`w-32 h-32 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'} ${logoField.preview ? 'border-transparent' : ''}`}>
                                                            {logoField.preview ? (
                                                                <img
                                                                    src={logoField.preview}
                                                                    alt={`Vista previa ${logoField.title}`}
                                                                    className="w-full h-full object-contain p-2"
                                                                />
                                                            ) : (
                                                                <Camera size={32} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                                                            )}
                                                        </div>

                                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-3xl transition-opacity">
                                                            <div className="flex flex-col items-center">
                                                                <UploadCloud size={24} className="mb-1" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Cambiar</span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                ref={logoField.inputRef}
                                                                onChange={handleLogoChange(logoField.field, logoField.setPreview)}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                        </label>

                                                        {data[logoField.field] && (
                                                            <button
                                                                type="button"
                                                                onClick={removeLogo(
                                                                    logoField.field,
                                                                    logoField.setPreview,
                                                                    logoField.fallbackPreview,
                                                                    logoField.inputRef,
                                                                )}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 active:scale-95 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            Aplicación
                                                        </label>
                                                        <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {logoField.description}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => logoField.inputRef.current?.click()}
                                                            className={`rounded-xl text-xs font-bold gap-2 ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}
                                                        >
                                                            <UploadCloud size={14} /> Subir imagen
                                                        </Button>
                                                        {errors[logoField.field] && (
                                                            <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2">
                                                                {errors[logoField.field]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {progress && (
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 dark:bg-slate-700">
                                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInput('name', 'Razón Social (Legal)', 'text', 'Ej: ArtCode S.A.')}
                                        {renderInput('fantasy_name', 'Nombre Comercial (Fantasía)', 'text', 'Ej: ArtCode Insumos')}
                                        {renderInput('email', 'Correo Corporativo', 'email', 'contacto@empresa.com')}
                                        {renderInput('phone', 'Teléfono Principal', 'text', '+54 11 1234-5678')}
                                        {renderInput('website', 'Sitio Web', 'url', 'https://www.empresa.com')}
                                        {renderInput('instagram_handle', 'Usuario de Instagram', 'text', 'artcodeformosa')}
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Notas del Arancel (PDF)</h3>
                                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Este texto aparece en la última página del PDF de arancel (plazos de entrega, formas de pago, intereses, etc.).
                                    </p>
                                    <textarea
                                        value={data.tariff_notes || ''}
                                        onChange={e => setData('tariff_notes', e.target.value)}
                                        rows={10}
                                        placeholder="Ej: TIEMPO ESTIMADO DE TRABAJO, FORMAS DE PAGO, INTERESES, etc."
                                        className={`w-full rounded-2xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                                        }`}
                                    />
                                    {errors.tariff_notes && (
                                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.tariff_notes}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: FISCAL */}
                        {activeTab === 'fiscal' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Configuración Impositiva (AFIP)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInput('cuit', 'CUIT', 'text', '20-12345678-9')}

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Condición frente al IVA</label>
                                            <SearchableSelect
                                                value={data.iva_condition || ''}
                                                onChange={v => setData('iva_condition', v)}
                                                placeholder="Seleccionar condición"
                                                options={[
                                                    { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                                                    { value: 'monotributista', label: 'Monotributista' },
                                                    { value: 'exento', label: 'Exento' },
                                                    { value: 'consumidor_final', label: 'Consumidor Final' },
                                                ]}
                                            />
                                        </div>

                                        {renderInput('iibb', 'Ingresos Brutos (IIBB)', 'text', 'Ej: 901-123456-1')}
                                        {renderInput('start_date', 'Fecha Inicio Actividades', 'date')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contable' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Perfil contable y presentaciones</h3>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Dejá preparado qué libros y presentaciones querés controlar desde el módulo contable. La carga exacta puede variar según tu contador, régimen y jurisdicción.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Régimen fiscal principal
                                            </label>
                                            <SearchableSelect
                                                value={accounting.tax_regime || ''}
                                                onChange={v => setAccountingSetting('tax_regime', v)}
                                                placeholder="Seleccionar régimen"
                                                options={[
                                                    { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                                                    { value: 'monotributista', label: 'Monotributista' },
                                                    { value: 'exento', label: 'Exento' },
                                                    { value: 'consumidor_final', label: 'No aplica / uso interno' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Esquema de presentación IVA
                                            </label>
                                            <SearchableSelect
                                                value={accounting.vat_presentation || ''}
                                                onChange={v => setAccountingSetting('vat_presentation', v)}
                                                placeholder="Seleccionar esquema"
                                                options={[
                                                    { value: 'iva_simple', label: 'IVA Simple / Portal IVA' },
                                                    { value: 'libro_iva_digital', label: 'Libro IVA Digital / control documental' },
                                                    { value: 'personalizado', label: 'Circuito personalizado con estudio contable' },
                                                    { value: 'no_aplica', label: 'No aplica' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Régimen de Ingresos Brutos
                                            </label>
                                            <SearchableSelect
                                                value={accounting.gross_income_regime || ''}
                                                onChange={v => setAccountingSetting('gross_income_regime', v)}
                                                placeholder="Seleccionar régimen"
                                                options={[
                                                    { value: 'local', label: 'Local / provincial' },
                                                    { value: 'convenio_multilateral', label: 'Convenio Multilateral' },
                                                    { value: 'simplificado', label: 'Simplificado / unificado' },
                                                    { value: 'exento', label: 'Exento' },
                                                    { value: 'no_aplica', label: 'No aplica' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Jurisdicción / organismo recaudador
                                            </label>
                                            <input
                                                type="text"
                                                value={accounting.gross_income_jurisdiction || ''}
                                                onChange={e => setAccountingSetting('gross_income_jurisdiction', e.target.value)}
                                                placeholder="Ej: ARBA, AGIP, API Santa Fe, SIFERE"
                                                className={`w-full rounded-xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                                                }`}
                                            />
                                            {errors['accounting_settings.gross_income_jurisdiction'] && (
                                                <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                    {errors['accounting_settings.gross_income_jurisdiction']}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                                        {renderAccountingToggle(
                                            'vat_sales_book',
                                            'Libro IVA Ventas',
                                            'Consolidar comprobantes emitidos, neto, IVA, total y destinatario.',
                                        )}
                                        {renderAccountingToggle(
                                            'vat_purchases_book',
                                            'Libro IVA Compras',
                                            'Consolidar compras a proveedores y crédito fiscal por período.',
                                        )}
                                        {renderAccountingToggle(
                                            'employer_book_enabled',
                                            'Libro sueldo y cargas sociales',
                                            'Preparar el módulo para recibos, obligaciones laborales y soporte al estudio contable.',
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Rol frente a retenciones / percepciones
                                            </label>
                                            <SearchableSelect
                                                value={accounting.withholding_agent_role || ''}
                                                onChange={v => setAccountingSetting('withholding_agent_role', v)}
                                                placeholder="Seleccionar rol"
                                                options={[
                                                    { value: 'none', label: 'No aplica' },
                                                    { value: 'retention', label: 'Agente de retención' },
                                                    { value: 'perception', label: 'Agente de percepción' },
                                                    { value: 'both', label: 'Retención y percepción' },
                                                ]}
                                            />
                                        </div>

                                        <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/70'}`}>
                                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Cómo se usará</div>
                                            <p className={`text-xs mt-2 leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                El módulo contable va a tomar esta configuración para mostrar libros de IVA, facturación general, compras, ingresos, egresos y una lista de obligaciones activas. No reemplaza el criterio profesional del estudio contable, pero sí deja el circuito preparado y ordenado.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Observaciones para el contador
                                        </label>
                                        <textarea
                                            value={accounting.accountant_notes || ''}
                                            onChange={e => setAccountingSetting('accountant_notes', e.target.value)}
                                            rows={5}
                                            placeholder="Ej: Jurisdicción principal, vencimientos, circuitos especiales, ajustes que se hacen fuera del sistema, etc."
                                            className={`w-full rounded-2xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                                ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                                            }`}
                                        />
                                        {errors['accounting_settings.accountant_notes'] && (
                                            <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                {errors['accounting_settings.accountant_notes']}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: UBICACION */}
                        {activeTab === 'ubicacion' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Dirección Legal y Comercial</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInput('address', 'Dirección Completa (Calle y Núm)', 'text', 'Av. Corrientes 1234', 'md:col-span-2')}
                                        {renderInput('city', 'Ciudad / Localidad')}
                                        {renderInput('province', 'Provincia / Estado')}
                                        {renderInput('postal_code', 'Código Postal', 'text', 'Ej: C1043')}
                                        {renderInput('country', 'País', 'text', 'Ej: Argentina')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: PREFERENCIAS */}
                        {activeTab === 'preferencias' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Preferencias Regionales */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Preferencias Regionales</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Moneda Principal</label>
                                            <SearchableSelect
                                                value={data.currency || ''}
                                                onChange={v => setData('currency', v)}
                                                options={[
                                                    { value: 'ARS', label: 'ARS - Peso Argentino' },
                                                    { value: 'USD', label: 'USD - Dólar Estadounidense' },
                                                    { value: 'EUR', label: 'EUR - Euro' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Zona Horaria</label>
                                            <SearchableSelect
                                                value={data.timezone || ''}
                                                onChange={v => setData('timezone', v)}
                                                options={[
                                                    { value: 'America/Argentina/Buenos_Aires', label: 'America/Argentina/Buenos_Aires (ART)' },
                                                    { value: 'America/Santiago', label: 'America/Santiago (CLT)' },
                                                    { value: 'America/Montevideo', label: 'America/Montevideo (UYT)' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Comisiones de Laboratorio */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Comisiones de Laboratorio</h3>
                                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Porcentaje del total de un trabajo que se reparte en partes iguales entre los colaboradores que completaron alguna fase. Se liquida automáticamente al finalizar cada trabajo.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInput('collaborator_commission_pct', 'Comisión colaboradores por trabajo %', 'number', '10')}
                                    </div>
                                </div>

                                {/* Impresión de Tickets */}
                                <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/60'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-teal-500/15' : 'bg-teal-50'}`}>
                                            <Printer size={18} className="text-teal-500" />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Impresión de Tickets</h4>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Formato predeterminado para el botón "Imprimir" del POS
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        {[
                                            { id: '80mm', label: '80 mm', desc: 'Rollo estándar', icon: '🖨️' },
                                            { id: '57mm', label: '57 mm', desc: 'Rollo compacto', icon: '🧾' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => saveTicketFormat(opt.id)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all
                                                    ${ticketFormat === opt.id
                                                        ? 'border-teal-500 bg-teal-500/10 text-teal-500'
                                                        : isDark
                                                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                                    }`}
                                            >
                                                <span className="text-2xl">{opt.icon}</span>
                                                <span className="font-black">{opt.label}</span>
                                                <span className={`text-[11px] font-medium ${ticketFormat === opt.id ? 'text-teal-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {opt.desc}
                                                </span>
                                                {ticketFormat === opt.id && (
                                                    <span className="text-[10px] font-black tracking-wide uppercase bg-teal-500 text-white px-2 py-0.5 rounded-full">
                                                        Activo
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <p className={`text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Esta preferencia se guarda en este navegador. Para cambiarla en otra computadora, configurá desde allí.
                                    </p>
                                </div>

                                {/* Motor de Impresión */}
                                <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/60'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-violet-500/15' : 'bg-violet-50'}`}>
                                            <Printer size={18} className="text-violet-500" />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Motor de Impresión</h4>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Cómo se envía la orden al hacer clic en "Imprimir"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        {[
                                            { id: 'electron', label: 'Print Service', desc: 'Gestor ArtCode instalado', icon: '🖨️' },
                                            { id: 'browser', label: 'Navegador', desc: 'Diálogo del sistema', icon: '🌐' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => savePrintBackend(opt.id)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all
                                                    ${printBackend === opt.id
                                                        ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                                                        : isDark
                                                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                                    }`}
                                            >
                                                <span className="text-2xl">{opt.icon}</span>
                                                <span className="font-black">{opt.label}</span>
                                                <span className={`text-[11px] font-medium ${printBackend === opt.id ? 'text-violet-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {opt.desc}
                                                </span>
                                                {printBackend === opt.id && (
                                                    <span className="text-[10px] font-black tracking-wide uppercase bg-violet-500 text-white px-2 py-0.5 rounded-full">
                                                        Activo
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <p className={`text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {printBackend === 'electron'
                                            ? 'Se usará el gestor ArtCode. Si no está instalado, caerá al diálogo del navegador automáticamente.'
                                            : 'Se usará siempre el diálogo de impresión del sistema, sin necesitar el Print Service instalado.'}
                                    </p>
                                </div>

                                {/* Impresora Térmica (App Android) */}
                                <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/60'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-sky-500/15' : 'bg-sky-50'}`}>
                                            <Printer size={18} className="text-sky-500" />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Impresora Térmica (App Android)</h4>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Conexión directa por red (LAN) a la impresora, sin pasar por el sistema operativo
                                            </p>
                                        </div>
                                    </div>

                                    {!isNativePrintAvailable() && (
                                        <p className={`text-xs mt-4 rounded-lg px-3 py-2 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                                            Esta función solo está disponible dentro de la app Android de ArtCode CRM. Desde el navegador podés dejar la configuración lista, pero la prueba de impresión no va a funcionar acá.
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        {[
                                            { id: 'lan', label: 'Red (WiFi)', desc: 'Impresora en la misma red', icon: '📶' },
                                            { id: 'usb', label: 'USB-OTG', desc: 'Impresora conectada por cable', icon: '🔌' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => savePrinterTransport(opt.id)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all
                                                    ${printerTransport === opt.id
                                                        ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                                                        : isDark
                                                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                                    }`}
                                            >
                                                <span className="text-2xl">{opt.icon}</span>
                                                <span className="font-black">{opt.label}</span>
                                                <span className={`text-[11px] font-medium ${printerTransport === opt.id ? 'text-sky-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {opt.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {printerTransport === 'lan' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                            <div className="md:col-span-2">
                                                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>IP de la impresora</label>
                                                <input
                                                    type="text"
                                                    value={printerConfig.ip}
                                                    onChange={(e) => savePrinterConfig({ ...printerConfig, ip: e.target.value })}
                                                    placeholder="192.168.1.50"
                                                    className={`w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-sky-500
                                                        ${isDark ? 'border-slate-700 bg-slate-900/60 text-white placeholder:text-slate-600' : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Puerto</label>
                                                <input
                                                    type="number"
                                                    value={printerConfig.port}
                                                    onChange={(e) => savePrinterConfig({ ...printerConfig, port: e.target.value })}
                                                    placeholder="9100"
                                                    className={`w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-sky-500
                                                        ${isDark ? 'border-slate-700 bg-slate-900/60 text-white placeholder:text-slate-600' : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'}`}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Impresora USB conectada</label>
                                                <Button type="button" size="sm" variant="outline" onClick={handleScanUsb} disabled={usbScanState.status === 'loading'}>
                                                    {usbScanState.status === 'loading' ? (
                                                        <span className="inline-flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Buscando...</span>
                                                    ) : 'Buscar dispositivos'}
                                                </Button>
                                            </div>

                                            {usbScanState.message && (
                                                <p className={`text-xs mb-2 ${usbScanState.status === 'error' ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {usbScanState.message}
                                                </p>
                                            )}

                                            {usbDevices.length > 0 && (
                                                <div className="space-y-1.5">
                                                    {usbDevices.map((device) => {
                                                        const isSelected = usbPrinterConfig.vendorId === device.vendorId && usbPrinterConfig.productId === device.productId;
                                                        return (
                                                            <button
                                                                key={`${device.vendorId}-${device.productId}`}
                                                                type="button"
                                                                onClick={() => saveUsbPrinterConfig(device)}
                                                                className={`w-full text-left px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all
                                                                    ${isSelected
                                                                        ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                                                                        : isDark
                                                                            ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                {device.productName || 'Dispositivo USB'}
                                                                <span className="block text-[11px] font-medium opacity-70">
                                                                    Vendor {device.vendorId} · Product {device.productId}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {usbPrinterConfig.vendorId && (
                                                <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Impresora seleccionada: {usbPrinterConfig.productName || `Vendor ${usbPrinterConfig.vendorId} · Product ${usbPrinterConfig.productId}`}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mt-5">
                                        <Button
                                            type="button"
                                            onClick={handleTestPrint}
                                            disabled={printerTestState.status === 'loading' || (printerTransport === 'lan' ? !printerConfig.ip : !usbPrinterConfig.vendorId)}
                                        >
                                            {printerTestState.status === 'loading' ? (
                                                <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Imprimiendo...</span>
                                            ) : 'Probar impresión'}
                                        </Button>

                                        {printerTestState.status === 'success' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500"><CheckCircle2 size={14} /> {printerTestState.message}</span>
                                        )}
                                        {printerTestState.status === 'error' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500"><CircleX size={14} /> {printerTestState.message}</span>
                                        )}
                                    </div>

                                    <p className={`text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Esta preferencia se guarda en este dispositivo. Configurá la IP local que la impresora tiene en la red WiFi del negocio.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: AFIP / ARCA */}
                        {activeTab === 'emails' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Emails transaccionales</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Personalizá el asunto y el cuerpo de cada email. Si se dejan vacíos se usa la plantilla predeterminada del sistema.
                                    </p>
                                </div>

                                {[
                                    {
                                        key: 'sale',
                                        label: 'Comprobante de venta',
                                        icon: '🧾',
                                        defaultSubject: 'Comprobante #{numero} · {empresa}',
                                        defaultBody: 'Hola {cliente},\n\nTe enviamos el comprobante de tu compra.\n\nN° {numero} · {fecha} · {total}\n\n{link}\n\n{empresa}',
                                        vars: ['{empresa}', '{numero}', '{cliente}', '{total}', '{fecha}', '{link}'],
                                    },
                                    {
                                        key: 'quote',
                                        label: 'Presupuesto',
                                        icon: '📋',
                                        defaultSubject: 'Presupuesto #{numero} · {empresa}',
                                        defaultBody: 'Hola {cliente},\n\nTe compartimos el presupuesto solicitado.\n\nN° {numero} · {fecha} · {total}\n\n{link}\n\n{empresa}',
                                        vars: ['{empresa}', '{numero}', '{cliente}', '{total}', '{fecha}', '{link}'],
                                    },
                                    {
                                        key: 'payment',
                                        label: 'Confirmación de pago',
                                        icon: '💳',
                                        defaultSubject: 'Confirmación de pago · {empresa}',
                                        defaultBody: 'Hola {cliente},\n\nConfirmamos la recepción de tu pago.\n\nMonto: {monto} · Fecha: {fecha} · Método: {metodo}\n\n{empresa}',
                                        vars: ['{empresa}', '{cliente}', '{monto}', '{fecha}', '{metodo}'],
                                    },
                                ].map(({ key, label, icon, defaultSubject, defaultBody, vars }) => (
                                    <div key={key} className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50/60'}`}>
                                        <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            <span>{icon}</span> {label}
                                        </h4>

                                        {/* Variables */}
                                        <div className="flex flex-wrap gap-2">
                                            {vars.map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    title={`Insertar ${v}`}
                                                    onClick={() => {
                                                        const bodyKey = `email_${key}_body`;
                                                        setData(bodyKey, (data[bodyKey] || '') + v);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${isDark
                                                        ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50'
                                                        : 'bg-white border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm'}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Asunto */}
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Asunto
                                            </label>
                                            <input
                                                type="text"
                                                value={data[`email_${key}_subject`]}
                                                onChange={e => setData(`email_${key}_subject`, e.target.value)}
                                                placeholder={defaultSubject}
                                                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-0 ${isDark
                                                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                    : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'}`}
                                            />
                                        </div>

                                        {/* Cuerpo */}
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Cuerpo del email
                                            </label>
                                            <textarea
                                                rows={6}
                                                value={data[`email_${key}_body`]}
                                                onChange={e => setData(`email_${key}_body`, e.target.value)}
                                                placeholder={defaultBody}
                                                className={`w-full rounded-xl border text-sm font-medium font-mono transition-colors focus:outline-none focus:ring-0 resize-none px-4 py-3 ${isDark
                                                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                    : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'}`}
                                            />
                                            <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Si se deja vacío se usa la plantilla predeterminada. Hacé clic en las variables para insertarlas en el cuerpo.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'afip' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Entorno y auto-factura */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        Configuración AFIP / ARCA
                                    </h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Configurá el entorno, el punto de venta y la facturación automática.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Entorno */}
                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Entorno
                                            </label>
                                            <SearchableSelect
                                                value={afipSettings.afip_environment || ''}
                                                onChange={v => setAfipSettings(s => ({ ...s, afip_environment: v }))}
                                                options={[
                                                    { value: 'homo', label: 'Homologación (Testing)' },
                                                    { value: 'prod', label: 'Producción' },
                                                ]}
                                            />
                                            {afipSettings.afip_environment === 'homo' && (
                                                <p className="text-[10px] text-amber-500 font-bold mt-1 pl-1">
                                                    Los comprobantes en homologación no tienen validez fiscal.
                                                </p>
                                            )}
                                        </div>

                                        {/* Auto-facturación */}
                                        <div className="md:col-span-2">
                                            <div className={`flex items-start gap-4 p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => setAfipSettings(s => ({ ...s, afip_auto_invoice: !s.afip_auto_invoice }))}
                                                    className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${afipSettings.afip_auto_invoice ? 'bg-blue-600' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${afipSettings.afip_auto_invoice ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                        Facturación automática
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Al cerrar una venta con tipo A, B o C se enviará automáticamente a AFIP para obtener el CAE.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mensajes */}
                                    {afipMsg && (
                                        <div className="flex items-center gap-2 mt-4 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-4 py-2 rounded-xl">
                                            <CheckCircle2 size={15} /> {afipMsg}
                                        </div>
                                    )}
                                    {afipError && (
                                        <div className="mt-4 text-red-500 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-xl">
                                            {afipError}
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={handleAfipSave}
                                        disabled={afipSaving}
                                        className="mt-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl gap-2 h-11 px-6 shadow-lg shadow-blue-500/20"
                                    >
                                        {afipSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Save size={16} /> Guardar configuración AFIP</>}
                                    </Button>
                                </div>

                                {/* Puntos de venta */}
                                <PointsOfSaleManager isDark={isDark} />

                                {/* Generar CSR */}
                                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileCog size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                                        <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            Generar solicitud de certificado (CSR)
                                        </h3>
                                    </div>
                                    <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Generá el par de claves y el archivo CSR directamente desde la plataforma. Luego subí el CSR al portal ARCA para obtener el certificado.
                                    </p>

                                    {/* Stepper */}
                                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                                        {[
                                            { n: '1', text: 'Completá el alias y generá el par clave\u00a0+\u00a0CSR' },
                                            { n: '2', text: 'Subí el archivo CSR al portal ARCA (wsass.afip.gov.ar)' },
                                            { n: '3', text: 'Descargá el .crt que te da ARCA y subilo abajo' },
                                        ].map(({ n, text }) => (
                                            <div key={n} className={`flex items-start gap-2 flex-1 p-3 rounded-xl border text-xs font-medium ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>{n}</span>
                                                {text}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Alias input */}
                                    <div className="mb-4">
                                        <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Alias del certificado
                                        </label>
                                        <input
                                            type="text"
                                            value={csrAlias}
                                            onChange={e => setCsrAlias(e.target.value)}
                                            placeholder="artcode-wsfe"
                                            maxLength={40}
                                            className={`w-full rounded-xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                                ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 placeholder:text-slate-600'
                                                : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500 placeholder:text-slate-400 shadow-sm'}`}
                                        />
                                        <p className={`text-[10px] mt-1 pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Solo letras, números y guiones. Ej: artcode-wsfe
                                        </p>
                                    </div>

                                    {/* Generate button */}
                                    <button
                                        type="button"
                                        onClick={handleGenerateCsr}
                                        disabled={csrGenerating || !csrAlias.trim()}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isDark
                                                ? 'bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-600/30'
                                                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                                        }`}
                                    >
                                        {csrGenerating
                                            ? <><Loader2 size={15} className="animate-spin" /> Generando…</>
                                            : <><KeyRound size={15} /> Generar clave privada y CSR</>}
                                    </button>

                                    {/* Result */}
                                    {csrResult && (
                                        <div className={`mt-4 rounded-2xl border p-4 space-y-3 ${
                                            csrResult.success
                                                ? isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                                                : isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                                        }`}>
                                            {csrResult.success ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                                                        <CircleCheck size={16} /> {csrResult.message}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleDownloadCsr}
                                                        className={`flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold transition-colors ${
                                                            isDark
                                                                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30'
                                                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                                        }`}
                                                    >
                                                        <FileCheck2 size={14} /> Descargar CSR (.pem)
                                                    </button>
                                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        La clave privada fue guardada automáticamente. Solo necesitás subir el .crt de ARCA.
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                                    <CircleX size={16} /> {csrResult.error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Certificados */}
                                <div>
                                    <h3 className={`text-base font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        Certificados Digitales
                                    </h3>
                                    <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Subí el certificado (.crt) de cada entorno y la clave privada (.key) compartida, emitidos por ARCA para tu CUIT.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { slotKey: 'cert_homo', label: 'Cert. Homologación',  ref: certHomoRef, icon: FileCheck2, accept: '.crt,.txt',     badge: 'HOMO' },
                                            { slotKey: 'cert_prod', label: 'Cert. Producción',    ref: certProdRef, icon: FileCheck2, accept: '.crt,.txt',     badge: 'PROD' },
                                            { slotKey: 'key',       label: 'Clave Privada (compartida)', ref: keyRef, icon: KeyRound, accept: '.key,.pem,.txt', badge: null  },
                                        ].map(({ slotKey, label, ref, icon: Icon, accept, badge }) => (
                                            <div key={slotKey} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Icon size={15} className={certStatus[slotKey] === 'ok' ? 'text-emerald-500' : 'text-slate-400'} />
                                                    <span className={`text-[11px] font-black uppercase tracking-wider flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {label}
                                                    </span>
                                                    {badge && (
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                            badge === 'HOMO'
                                                                ? 'bg-amber-500/20 text-amber-500'
                                                                : 'bg-blue-500/20 text-blue-500'
                                                        }`}>{badge}</span>
                                                    )}
                                                </div>
                                                {certStatus[slotKey] === 'ok' && (
                                                    <div className="text-[10px] font-bold text-emerald-500 mb-2">✓ Cargado</div>
                                                )}
                                                {certStatus[slotKey] === 'error' && (
                                                    <div className="text-[10px] font-bold text-red-500 mb-2">✗ Error</div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={ref}
                                                    accept={accept}
                                                    className="hidden"
                                                    onChange={() => handleCertUpload(slotKey)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => ref.current?.click()}
                                                    disabled={certUploading[slotKey]}
                                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed text-xs font-bold transition-colors ${
                                                        isDark
                                                            ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                                                            : 'border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500'
                                                    }`}
                                                >
                                                    {certUploading[slotKey]
                                                        ? <><Loader2 size={13} className="animate-spin" /> Subiendo…</>
                                                        : <><UploadCloud size={13} /> {certStatus[slotKey] === 'ok' ? 'Reemplazar' : 'Seleccionar'}</>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-4 p-4 rounded-xl text-xs leading-relaxed ${isDark ? 'bg-blue-500/5 border border-blue-500/20 text-blue-300' : 'bg-blue-50 border border-blue-100 text-blue-700'}`}>
                                        <strong>Instrucciones:</strong> En el portal ARCA obtenenés un certificado por entorno (Homo y Prod) desde el mismo CSR/clave privada.
                                        La <strong>clave privada</strong> (.key/.pem) es única y compartida por ambos entornos.
                                        Los archivos se guardan de forma segura fuera del acceso público.
                                    </div>

                                    {/* Botones de conexión por entorno */}
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {[
                                            { env: 'homo', label: 'Probar Homologación', color: 'amber' },
                                            { env: 'prod', label: 'Probar Producción',   color: 'teal'  },
                                        ].map(({ env, label, color }) => (
                                            <button
                                                key={env}
                                                type="button"
                                                onClick={() => handleTestConnection(env)}
                                                disabled={testingConn !== null}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                                    color === 'amber'
                                                        ? isDark ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                                        : isDark ? 'bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-600/30'   : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                                                }`}
                                            >
                                                {testingConn === env
                                                    ? <><Loader2 size={15} className="animate-spin" /> Validando…</>
                                                    : <><Wifi size={15} /> {label}</>}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Resultado */}
                                    {testResult && (
                                        <div className={`mt-4 rounded-2xl border p-4 space-y-2 ${
                                            testResult.success
                                                ? isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                                                : isDark ? 'bg-red-500/5 border-red-500/20'         : 'bg-red-50 border-red-200'
                                        }`}>
                                            <div className={`flex items-center gap-2 font-black text-sm ${testResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {testResult.success
                                                    ? <><CircleCheck size={16} /> Conexión exitosa — Entorno: {testResult.environment === 'homo' ? 'Homologación' : 'Producción'}</>
                                                    : <><CircleX size={16} /> Error de validación</>}
                                            </div>
                                            {testResult.checks?.length > 0 && (
                                                <div className="space-y-1 pt-1">
                                                    {testResult.checks.map((c, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-xs">
                                                            {c.ok
                                                                ? <CircleCheck size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                : <CircleX size={13} className="text-red-500 shrink-0 mt-0.5" />}
                                                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                                                <strong>{c.label}:</strong> {c.detail}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {!testResult.success && testResult.error && (
                                                <p className="text-xs text-red-500 font-medium pt-1">{testResult.error}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Tab Content: E-COMMERCE */}
                        {activeTab === 'ecommerce' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Analytics */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Analytics y rastreo</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Estas claves se sirven al frontend del e-commerce en tiempo real. No requieren rebuild.
                                    </p>
                                    <div className={`rounded-2xl border p-6 space-y-5 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        {[
                                            { field: 'ga4_measurement_id', label: 'Google Analytics 4 — Measurement ID', placeholder: 'G-XXXXXXXXXX', hint: 'Formato: G-XXXXXXXXXX' },
                                            { field: 'google_tag_manager_id', label: 'Google Tag Manager — Container ID', placeholder: 'GTM-XXXXXXX', hint: 'Formato: GTM-XXXXXXX' },
                                            { field: 'meta_pixel_id', label: 'Meta (Facebook) Pixel ID', placeholder: '123456789012345', hint: 'Solo dígitos, sin prefijo' },
                                            { field: 'hotjar_id', label: 'Hotjar Site ID', placeholder: '1234567', hint: 'Solo el número de sitio' },
                                        ].map(({ field, label, placeholder, hint }) => (
                                            <div key={field}>
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
                                                <input
                                                    type="text"
                                                    value={data[field]}
                                                    onChange={e => setData(field, e.target.value)}
                                                    placeholder={placeholder}
                                                    className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isDark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
                                                />
                                                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</p>
                                                {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* WhatsApp contacto */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>WhatsApp de contacto</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Número que se muestra en el botón de WhatsApp del e-commerce (distinto al número de la API de mensajería).
                                    </p>
                                    <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Número con código de país</label>
                                        <input
                                            type="text"
                                            value={data.whatsapp_contact_number}
                                            onChange={e => setData('whatsapp_contact_number', e.target.value)}
                                            placeholder="5493704995406"
                                            className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isDark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
                                        />
                                        <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin + ni espacios. Ejemplo: 5493704995406</p>
                                        {errors.whatsapp_contact_number && <p className="text-red-500 text-xs mt-1">{errors.whatsapp_contact_number}</p>}
                                    </div>
                                </div>

                                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                                    <BarChart3 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                        Los valores se entregan al e-commerce vía <code className="font-mono text-xs bg-blue-500/10 px-1 rounded">GET /api/config</code> con caché de 5 minutos. Los cambios se reflejan en el frontend sin necesidad de rebuild.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: INTEGRACIONES */}
                        {activeTab === 'integraciones' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Asistente Artie</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Activá el asistente interno, elegí el modelo Claude (Anthropic) y configurá la clave API por empresa. Las consultas frecuentes se responden desde la base de conocimiento local sin consumir tokens.
                                    </p>

                                    <div className={`rounded-2xl border p-6 space-y-6 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/70 border-blue-100'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/15' : 'bg-white shadow-sm'}`}>
                                                <Bot size={20} className="text-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-3">
                                                    {[
                                                        { value: true, label: 'Asistente activo', desc: 'Visible para los usuarios autenticados' },
                                                        { value: false, label: 'Asistente desactivado', desc: 'Oculta el widget en toda la empresa' },
                                                    ].map(option => (
                                                        <button
                                                            key={String(option.value)}
                                                            type="button"
                                                            onClick={() => setData('chatbot_enabled', option.value)}
                                                            className={`flex-1 min-w-[220px] rounded-2xl border px-4 py-3 text-left transition-colors ${data.chatbot_enabled === option.value
                                                                ? (isDark ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-blue-300 bg-white text-blue-700 shadow-sm')
                                                                : (isDark ? 'border-slate-700 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-white/70 text-slate-500')
                                                            }`}
                                                        >
                                                            <div className="font-black text-sm">{option.label}</div>
                                                            <div className={`text-xs mt-1 ${data.chatbot_enabled === option.value
                                                                ? (isDark ? 'text-blue-300/80' : 'text-blue-600')
                                                                : (isDark ? 'text-slate-500' : 'text-slate-400')
                                                            }`}>
                                                                {option.desc}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.chatbot_enabled && (
                                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2">{errors.chatbot_enabled}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-[10px] uppercase font-black tracking-widest mb-2 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Modelo Claude (Anthropic)
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {CHATBOT_MODEL_OPTIONS.map(option => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => setData('chatbot_model', option.value)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors text-left ${data.chatbot_model === option.value
                                                            ? (isDark ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-blue-300 bg-white text-blue-700 shadow-sm')
                                                            : (isDark ? 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
                                                        }`}
                                                    >
                                                        <div>{option.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={data.chatbot_model}
                                                onChange={e => setData('chatbot_model', e.target.value)}
                                                placeholder={DEFAULT_CHATBOT_MODEL}
                                                className={`w-full rounded-xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                    : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                                                }`}
                                            />
                                            {errors.chatbot_model && (
                                                <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.chatbot_model}</div>
                                            )}
                                            <div className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Haiku 4.5 es el más económico y rápido — ideal para consultas frecuentes. El sistema usa la base de conocimiento primero y solo llama a la IA cuando no puede responder localmente.
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-blue-500/10">
                                            <h4 className={`text-sm font-black tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                Clave API de Anthropic (Opcional)
                                            </h4>
                                            <div className="mb-4">
                                                <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Anthropic API Key
                                                </label>
                                                <input
                                                    type="password"
                                                    value={data.chatbot_anthropic_key}
                                                    onChange={e => setData('chatbot_anthropic_key', e.target.value)}
                                                    placeholder="sk-ant-..."
                                                    className={`w-full rounded-xl border text-sm font-medium transition-colors focus:ring-0 ${isDark
                                                        ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
                                                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400 shadow-sm'
                                                    }`}
                                                />
                                                {errors.chatbot_anthropic_key && (
                                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.chatbot_anthropic_key}</div>
                                                )}
                                                <p className={`text-[11px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Si no ingresás una clave por empresa, se usa la clave global configurada en el servidor (<code>CHATBOT_ANTHROPIC_API_KEY</code>).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>WhatsApp Cloud API</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Ingresá las credenciales de Meta for Developers para habilitar las notificaciones automáticas y envíos masivos.
                                    </p>
                                    <div className="grid grid-cols-1 gap-6 bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                                        {renderInput('whatsapp_phone_number_id', 'Phone Number ID', 'text', 'Ej: 104598...23')}
                                        {renderInput('whatsapp_access_token', 'Access Token (Permanente)', 'password', 'EAAMb...')}
                                    </div>
                                </div>

                                {/* Mensaje WhatsApp */}
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        Mensaje de comprobante
                                    </h3>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Texto que se envía por WhatsApp al compartir un comprobante. Usá las variables de abajo para incluir datos dinámicos.
                                    </p>

                                    {/* Variables disponibles */}
                                    <div className={`flex flex-wrap gap-2 mb-4`}>
                                        {[
                                            ['{empresa}', 'Nombre de la empresa'],
                                            ['{numero}', 'N° de comprobante'],
                                            ['{cliente}', 'Nombre del cliente'],
                                            ['{total}', 'Monto total'],
                                            ['{fecha}', 'Fecha de la venta'],
                                            ['{link}', 'URL del comprobante'],
                                        ].map(([v, desc]) => (
                                            <button
                                                key={v}
                                                type="button"
                                                title={desc}
                                                onClick={() => setData('whatsapp_message_template', (data.whatsapp_message_template || '') + v)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${isDark
                                                    ? 'bg-slate-800 border-slate-700 text-green-400 hover:bg-green-500/10 hover:border-green-500/50'
                                                    : 'bg-white border-slate-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className={`block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Plantilla del mensaje
                                        </label>
                                        <textarea
                                            rows={7}
                                            value={data.whatsapp_message_template}
                                            onChange={e => setData('whatsapp_message_template', e.target.value)}
                                            placeholder={`🦷 *{empresa}* — Comprobante {numero}\nCliente: {cliente}\nTotal: ${'{total}'}\nFecha: {fecha}\n\n📄 Ver comprobante: {link}`}
                                            className={`w-full rounded-xl border text-sm font-medium font-mono transition-colors focus:ring-0 resize-none ${isDark
                                                ? 'bg-slate-800/50 border-slate-700 text-white focus:border-green-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-green-500 placeholder:text-slate-400 shadow-sm'}`}
                                        />
                                        {errors.whatsapp_message_template && (
                                            <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{errors.whatsapp_message_template}</div>
                                        )}
                                        <p className={`text-[11px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Si se deja vacío se usa el mensaje predeterminado del sistema.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Action Area */}
                        <div className={`mt-8 pt-6 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'
                            }`}>
                            <div className="flex items-center gap-2">
                                {flash?.success && (
                                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-left-4">
                                        <CheckCircle2 size={16} />
                                        {flash.success}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl gap-2 h-12 px-8 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider"
                            >
                                <Save size={18} />
                                {processing ? 'Guardando...' : 'Aplicar Cambios'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
