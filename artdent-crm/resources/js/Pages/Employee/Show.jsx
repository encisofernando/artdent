import React, { useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { ArrowLeft, User, BadgeDollarSign, Percent, Plus, Trash2, Pencil, FileText, X, Save, Paperclip, Users2, Download, Fingerprint } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

const STATUS_BADGE = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LABEL = { draft: 'Borrador', paid: 'Pagado', cancelled: 'Cancelado' };

function Modal({ open, onClose, title, isDark, children }) {
    if (!open) { return null; }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={15} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ── WebAuthn helpers ──────────────────────────────────────────────────────────

function base64urlToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0)).buffer;
}

function bufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function EmployeeWebAuthnPanel({ employee, isDark, B, card }) {
    const [credentials, setCredentials] = useState(employee.web_authn_credentials ?? []);
    const [status, setStatus] = useState('idle'); // idle | registering | success | error
    const [message, setMessage] = useState('');
    const isSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

    const register = async () => {
        setStatus('registering');
        setMessage('');
        try {
            const { data: options } = await axios.get(
                route('employees.webauthn.registration-options', employee.id),
            );

            const publicKey = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                user: { ...options.user, id: base64urlToBuffer(options.user.id) },
                excludeCredentials: (options.excludeCredentials ?? []).map((c) => ({
                    ...c,
                    id: base64urlToBuffer(c.id),
                })),
            };

            const credential = await navigator.credentials.create({ publicKey });

            const payload = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
                    attestationObject: bufferToBase64url(credential.response.attestationObject),
                },
                device_label: 'Este dispositivo',
            };

            const { data } = await axios.post(
                route('employees.webauthn.register', employee.id),
                payload,
            );

            setCredentials((prev) => [
                ...prev,
                { id: Date.now(), credential_id: data.credential_id, device_label: 'Este dispositivo', created_at: new Date().toISOString() },
            ]);
            setStatus('success');
            setMessage('Huella registrada correctamente en este dispositivo.');
        } catch (e) {
            const msg =
                e?.response?.data?.error ??
                (e?.name === 'NotAllowedError' ? 'Permiso denegado por el usuario.' : e?.message ?? 'Error desconocido al registrar la huella.');
            setStatus('error');
            setMessage(msg);
        }
    };

    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <div className={`${card} p-5`}>
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Fingerprint size={18} className="text-violet-500" />
                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Fichaje Biométrico (Huella)
                </h2>
            </div>

            {!isSupported && (
                <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Este navegador no soporta WebAuthn. Usá Chrome, Edge o Safari actualizado.
                </p>
            )}

            {isSupported && (
                <div className="flex flex-col gap-4">
                    {credentials.length > 0 && (
                        <div>
                            <label className={labelCls}>Dispositivos registrados</label>
                            <ul className="flex flex-col gap-2">
                                {credentials.map((cred) => (
                                    <li
                                        key={cred.id}
                                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Fingerprint size={14} className="text-violet-400 shrink-0" />
                                            <span className="font-medium">{cred.device_label ?? 'Dispositivo'}</span>
                                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                — {new Date(cred.created_at).toLocaleDateString('es-AR')}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <button
                            type="button"
                            onClick={register}
                            disabled={status === 'registering'}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Fingerprint size={16} />
                            {status === 'registering' ? 'Registrando...' : 'Registrar Huella en este Dispositivo'}
                        </button>
                    </div>

                    {status === 'success' && (
                        <div className="text-sm text-emerald-500 font-medium">{message}</div>
                    )}
                    {status === 'error' && (
                        <div className="text-sm text-red-500">{message}</div>
                    )}
                </div>
            )}
        </div>
    );
}

const RELATIONSHIPS = ['Cónyuge', 'Hijo/a', 'Padre', 'Madre', 'Hermano/a', 'Otro'];
const DOCUMENT_TYPES = [
    { value: 'dni', label: 'DNI' },
    { value: 'contrato', label: 'Contrato' },
    { value: 'cv', label: 'Currículum' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'otro', label: 'Otro' },
];

export default function Show({ auth, employee, extras, discounts, departments = [], positions = [], employeeOptions = [], laborAgreementCategories = [] }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    /* ── Extra modal ── */
    const [extraModal, setExtraModal] = useState(false);
    const [extraForm, setExtraForm] = useState({ date: '', concept: '', amount: '' });
    const [extraProcessing, setExtraProcessing] = useState(false);

    const submitExtra = (e) => {
        e.preventDefault();
        setExtraProcessing(true);
        router.post(route('employee-extras.store'), { ...extraForm, employee_id: employee.id }, {
            onSuccess: () => { setExtraModal(false); setExtraForm({ date: '', concept: '', amount: '' }); setExtraProcessing(false); },
            onError: () => setExtraProcessing(false),
        });
    };

    /* ── Discount modal ── */
    const [discountModal, setDiscountModal] = useState(false);
    const [discountForm, setDiscountForm] = useState({ date: '', concept: '', amount: '' });
    const [discountProcessing, setDiscountProcessing] = useState(false);

    const submitDiscount = (e) => {
        e.preventDefault();
        setDiscountProcessing(true);
        router.post(route('employee-discounts.store'), { ...discountForm, employee_id: employee.id }, {
            onSuccess: () => { setDiscountModal(false); setDiscountForm({ date: '', concept: '', amount: '' }); setDiscountProcessing(false); },
            onError: () => setDiscountProcessing(false),
        });
    };

    /* ── Receipt modal ── */
    const [receiptModal, setReceiptModal] = useState(false);
    const [receiptForm, setReceiptForm] = useState({ period_from: '', period_to: '', notes: '' });
    const [receiptProcessing, setReceiptProcessing] = useState(false);

    const submitReceipt = (e) => {
        e.preventDefault();
        setReceiptProcessing(true);
        router.post(route('employee-receipts.store'), { ...receiptForm, employee_id: employee.id }, {
            onError: () => setReceiptProcessing(false),
        });
    };

    const deleteExtra = (id) => { confirmDialog('¿Eliminar este extra?', () => router.delete(route('employee-extras.destroy', id), { preserveScroll: true })); };
    const deleteDiscount = (id) => { confirmDialog('¿Eliminar este descuento?', () => router.delete(route('employee-discounts.destroy', id), { preserveScroll: true })); };

    /* ── Legajo modal ── */
    const [legajoModal, setLegajoModal] = useState(false);
    const [legajoForm, setLegajoForm] = useState(() => ({
        cuil: employee.cuil ?? '',
        birth_date: employee.birth_date ? String(employee.birth_date).split('T')[0] : '',
        gender: employee.gender ?? '',
        marital_status: employee.marital_status ?? '',
        nationality: employee.nationality ?? '',
        address: employee.address ?? '',
        city: employee.city ?? '',
        province: employee.province ?? '',
        postal_code: employee.postal_code ?? '',
        phone: employee.phone ?? '',
        personal_email: employee.personal_email ?? '',
        bank_cbu: employee.bank_cbu ?? '',
        bank_name: employee.bank_name ?? '',
        health_insurance: employee.health_insurance ?? '',
        department_id: employee.department_id ? String(employee.department_id) : '',
        position_id: employee.position_id ? String(employee.position_id) : '',
        supervisor_id: employee.supervisor_id ? String(employee.supervisor_id) : '',
        labor_agreement_category_id: employee.labor_agreement_category_id ? String(employee.labor_agreement_category_id) : '',
    }));
    const [legajoProcessing, setLegajoProcessing] = useState(false);
    const [legajoErrors, setLegajoErrors] = useState({});

    const openLegajo = () => {
        setLegajoForm({
            cuil: employee.cuil ?? '',
            birth_date: employee.birth_date ? String(employee.birth_date).split('T')[0] : '',
            gender: employee.gender ?? '',
            marital_status: employee.marital_status ?? '',
            nationality: employee.nationality ?? '',
            address: employee.address ?? '',
            city: employee.city ?? '',
            province: employee.province ?? '',
            postal_code: employee.postal_code ?? '',
            phone: employee.phone ?? '',
            personal_email: employee.personal_email ?? '',
            bank_cbu: employee.bank_cbu ?? '',
            bank_name: employee.bank_name ?? '',
            health_insurance: employee.health_insurance ?? '',
            department_id: employee.department_id ? String(employee.department_id) : '',
            position_id: employee.position_id ? String(employee.position_id) : '',
            supervisor_id: employee.supervisor_id ? String(employee.supervisor_id) : '',
            labor_agreement_category_id: employee.labor_agreement_category_id ? String(employee.labor_agreement_category_id) : '',
        });
        setLegajoErrors({});
        setLegajoModal(true);
    };

    const submitLegajo = (e) => {
        e.preventDefault();
        setLegajoProcessing(true);
        router.put(route('employees.legajo', employee.id), legajoForm, {
            onSuccess: () => { setLegajoModal(false); setLegajoProcessing(false); },
            onError: (errs) => { setLegajoErrors(errs); setLegajoProcessing(false); },
        });
    };

    /* ── Document modal ── */
    const [docModal, setDocModal] = useState(false);
    const [docForm, setDocForm] = useState({ type: 'dni', file: null, expires_at: '', notes: '' });
    const [docProcessing, setDocProcessing] = useState(false);
    const [docErrors, setDocErrors] = useState({});

    const submitDocument = (e) => {
        e.preventDefault();
        setDocProcessing(true);
        router.post(route('employee-documents.store', employee.id), docForm, {
            forceFormData: true,
            onSuccess: () => { setDocModal(false); setDocForm({ type: 'dni', file: null, expires_at: '', notes: '' }); setDocProcessing(false); },
            onError: (errs) => { setDocErrors(errs); setDocProcessing(false); },
        });
    };

    const deleteDocument = (id) => { confirmDialog('¿Eliminar este documento?', () => router.delete(route('employee-documents.destroy', id), { preserveScroll: true })); };

    /* ── Family member modal ── */
    const [familyModal, setFamilyModal] = useState(false);
    const [familyForm, setFamilyForm] = useState({ name: '', relationship: 'Cónyuge', dni: '', birth_date: '', disability: false });
    const [familyProcessing, setFamilyProcessing] = useState(false);
    const [familyErrors, setFamilyErrors] = useState({});

    const submitFamily = (e) => {
        e.preventDefault();
        setFamilyProcessing(true);
        router.post(route('employee-family-members.store', employee.id), familyForm, {
            onSuccess: () => { setFamilyModal(false); setFamilyForm({ name: '', relationship: 'Cónyuge', dni: '', birth_date: '', disability: false }); setFamilyProcessing(false); },
            onError: (errs) => { setFamilyErrors(errs); setFamilyProcessing(false); },
        });
    };

    const deleteFamily = (id) => { confirmDialog('¿Eliminar este familiar?', () => router.delete(route('employee-family-members.destroy', id), { preserveScroll: true })); };

    const sectionTitle = (t) => <h2 className={`text-sm font-extrabold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t}</h2>;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Personal — ${employee.user?.name}`} />
            <div className="flex flex-col gap-6 font-sans max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('employees.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <User size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{employee.user?.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{employee.position ?? 'Sin cargo asignado'} · {employee.user?.email}</p>
                    </div>
                    <button onClick={() => setReceiptModal(true)} className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <FileText size={14} /> Generar Recibo
                    </button>
                </div>

                {/* Info card */}
                <div className={`${card} p-5 grid grid-cols-2 sm:grid-cols-4 gap-4`}>
                    {[
                        { label: 'Sueldo base', value: fmt(employee.salary), icon: BadgeDollarSign, color: 'teal' },
                        { label: 'Comisión', value: employee.commission_pct > 0 ? `${parseFloat(employee.commission_pct).toFixed(1)}%` : '—', icon: Percent, color: 'amber' },
                        { label: 'Ingreso', value: fmtDate(employee.hire_date), icon: null, color: null },
                        { label: 'DNI', value: employee.dni ?? '—', icon: null, color: null },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                            <p className={`font-bold text-base flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {Icon && <Icon size={14} className={color === 'teal' ? (isDark ? 'text-teal-400' : 'text-teal-600') : (isDark ? 'text-amber-400' : 'text-amber-600')} />}
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Legajo */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                        {sectionTitle('Datos del Legajo')}
                        <button onClick={openLegajo} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <Pencil size={12} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'CUIL', value: employee.cuil ?? '—' },
                            { label: 'Fecha de nacimiento', value: fmtDate(employee.birth_date) },
                            { label: 'Teléfono', value: employee.phone ?? '—' },
                            { label: 'Email personal', value: employee.personal_email ?? '—' },
                            { label: 'Domicilio', value: employee.address ? `${employee.address}${employee.city ? ', ' + employee.city : ''}` : '—' },
                            { label: 'Obra social', value: employee.health_insurance ?? '—' },
                            { label: 'Banco', value: employee.bank_name ?? '—' },
                            { label: 'CBU', value: employee.bank_cbu ?? '—' },
                            { label: 'Departamento', value: employee.department?.name ?? '—' },
                            { label: 'Puesto', value: employee.job_position?.name ?? '—' },
                            { label: 'Supervisor', value: employee.supervisor?.user?.name ?? '—' },
                            { label: 'Convenio / Categoría', value: employee.labor_agreement_category ? `${employee.labor_agreement_category.labor_agreement?.name} — ${employee.labor_agreement_category.name}` : '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                                <p className={`font-medium text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Extras */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Extras / Adicionales')}
                            <button onClick={() => setExtraModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {extras.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin extras registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {extras.map(e => (
                                    <div key={e.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{e.concept}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDate(e.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+{fmt(e.amount)}</span>
                                            <button onClick={() => deleteExtra(e.id)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`mt-3 pt-3 border-t text-sm font-bold flex justify-between ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-800'}`}>
                            <span>Total extras</span>
                            <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{fmt(extras.reduce((s, e) => s + parseFloat(e.amount), 0))}</span>
                        </div>
                    </div>

                    {/* Descuentos */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Descuentos')}
                            <button onClick={() => setDiscountModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, #9C3939, #9C6149)` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {discounts.length === 0 ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin descuentos registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {discounts.map(d => (
                                    <div key={d.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{d.concept}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmtDate(d.date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>−{fmt(d.amount)}</span>
                                            <button onClick={() => deleteDiscount(d.id)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={`mt-3 pt-3 border-t text-sm font-bold flex justify-between ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-800'}`}>
                            <span>Total descuentos</span>
                            <span className={isDark ? 'text-red-400' : 'text-red-600'}>{fmt(discounts.reduce((s, d) => s + parseFloat(d.amount), 0))}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Documentos */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Documentos')}
                            <button onClick={() => setDocModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {(!employee.documents || employee.documents.length === 0) ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin documentos cargados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {employee.documents.map(d => (
                                    <div key={d.id} className="flex items-center justify-between py-2">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <Paperclip size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{DOCUMENT_TYPES.find(t => t.value === d.type)?.label ?? d.type}</p>
                                                {d.expires_at && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Vence: {fmtDate(d.expires_at)}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a href={`/storage/${d.file_path}`} target="_blank" rel="noreferrer" className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Download size={11} /></a>
                                            <button onClick={() => deleteDocument(d.id)} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Familiares */}
                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            {sectionTitle('Familiares a Cargo')}
                            <button onClick={() => setFamilyModal(true)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-white`} style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={13} />
                            </button>
                        </div>
                        {(!employee.family_members || employee.family_members.length === 0) ? (
                            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin familiares registrados</p>
                        ) : (
                            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {employee.family_members.map(f => (
                                    <div key={f.id} className="flex items-center justify-between py-2">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <Users2 size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{f.name}</p>
                                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{f.relationship}{f.disability ? ' · Discapacidad' : ''}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteFamily(f.id)} className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={11} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fichaje biométrico (WebAuthn) */}
                <EmployeeWebAuthnPanel employee={employee} isDark={isDark} B={B} card={card} />

                {/* Historial de recibos */}
                {employee.receipts?.length > 0 && (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Historial de Recibos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Período', 'Sueldo', 'Comisión', 'Extras', 'Desc.', 'Neto', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {employee.receipts.map(r => (
                                        <tr key={r.id} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDate(r.period_from)} – {fmtDate(r.period_to)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fmt(r.salary_gross)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{fmt(r.commission_gross)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{fmt(r.extras_total)}</td>
                                            <td className={`px-4 py-2.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{fmt(r.discounts_total)}</td>
                                            <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(r.net)}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Link href={route('employee-receipts.show', r.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    <FileText size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Extra */}
            <Modal open={extraModal} onClose={() => setExtraModal(false)} title="Agregar Extra" isDark={isDark}>
                <form onSubmit={submitExtra} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Fecha *</label><input type="date" value={extraForm.date} onChange={e => setExtraForm(f => ({ ...f, date: e.target.value }))} className={inputCls} required /></div>
                    <div><label className={labelCls}>Concepto *</label><input type="text" value={extraForm.concept} onChange={e => setExtraForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} placeholder="Premio, Bono, Horas extra..." required /></div>
                    <div><label className={labelCls}>Importe *</label><input type="number" step="0.01" min="0.01" value={extraForm.amount} onChange={e => setExtraForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" required /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setExtraModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={extraProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Descuento */}
            <Modal open={discountModal} onClose={() => setDiscountModal(false)} title="Agregar Descuento" isDark={isDark}>
                <form onSubmit={submitDiscount} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Fecha *</label><input type="date" value={discountForm.date} onChange={e => setDiscountForm(f => ({ ...f, date: e.target.value }))} className={inputCls} required /></div>
                    <div><label className={labelCls}>Concepto *</label><input type="text" value={discountForm.concept} onChange={e => setDiscountForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} placeholder="Adelanto, Falta, Descuento..." required /></div>
                    <div><label className={labelCls}>Importe *</label><input type="number" step="0.01" min="0.01" value={discountForm.amount} onChange={e => setDiscountForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" required /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDiscountModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={discountProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(90deg, #9C3939, #9C6149)' }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Recibo */}
            <Modal open={receiptModal} onClose={() => setReceiptModal(false)} title="Generar Recibo de Sueldo" isDark={isDark}>
                <form onSubmit={submitReceipt} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Período desde *</label><input type="date" value={receiptForm.period_from} onChange={e => setReceiptForm(f => ({ ...f, period_from: e.target.value }))} className={inputCls} required /></div>
                        <div><label className={labelCls}>Período hasta *</label><input type="date" value={receiptForm.period_to} onChange={e => setReceiptForm(f => ({ ...f, period_to: e.target.value }))} className={inputCls} required /></div>
                    </div>
                    <div><label className={labelCls}>Notas</label><input type="text" value={receiptForm.notes} onChange={e => setReceiptForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} placeholder="Observaciones..." /></div>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        El sistema calculará automáticamente: sueldo base + comisiones sobre ventas del período + extras − descuentos.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setReceiptModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={receiptProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <FileText size={14} /> Generar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Legajo */}
            <Modal open={legajoModal} onClose={() => setLegajoModal(false)} title="Editar Legajo" isDark={isDark}>
                <form onSubmit={submitLegajo} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>CUIL</label><input type="text" value={legajoForm.cuil} onChange={e => setLegajoForm(f => ({ ...f, cuil: e.target.value }))} className={inputCls} placeholder="20-30123456-7" />{legajoErrors.cuil && <p className="text-red-500 text-xs mt-1">{legajoErrors.cuil}</p>}</div>
                        <div><label className={labelCls}>Fecha de nacimiento</label><input type="date" value={legajoForm.birth_date} onChange={e => setLegajoForm(f => ({ ...f, birth_date: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Género</label><input type="text" value={legajoForm.gender} onChange={e => setLegajoForm(f => ({ ...f, gender: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Estado civil</label><input type="text" value={legajoForm.marital_status} onChange={e => setLegajoForm(f => ({ ...f, marital_status: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Nacionalidad</label><input type="text" value={legajoForm.nationality} onChange={e => setLegajoForm(f => ({ ...f, nationality: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Domicilio</label><input type="text" value={legajoForm.address} onChange={e => setLegajoForm(f => ({ ...f, address: e.target.value }))} className={inputCls} /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className={labelCls}>Ciudad</label><input type="text" value={legajoForm.city} onChange={e => setLegajoForm(f => ({ ...f, city: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Provincia</label><input type="text" value={legajoForm.province} onChange={e => setLegajoForm(f => ({ ...f, province: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>CP</label><input type="text" value={legajoForm.postal_code} onChange={e => setLegajoForm(f => ({ ...f, postal_code: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Teléfono</label><input type="text" value={legajoForm.phone} onChange={e => setLegajoForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Email personal</label><input type="email" value={legajoForm.personal_email} onChange={e => setLegajoForm(f => ({ ...f, personal_email: e.target.value }))} className={inputCls} />{legajoErrors.personal_email && <p className="text-red-500 text-xs mt-1">{legajoErrors.personal_email}</p>}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Banco</label><input type="text" value={legajoForm.bank_name} onChange={e => setLegajoForm(f => ({ ...f, bank_name: e.target.value }))} className={inputCls} placeholder="Banco Nación, Banco Galicia..." /></div>
                        <div><label className={labelCls}>CBU</label><input type="text" value={legajoForm.bank_cbu} onChange={e => setLegajoForm(f => ({ ...f, bank_cbu: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Obra social</label><input type="text" value={legajoForm.health_insurance} onChange={e => setLegajoForm(f => ({ ...f, health_insurance: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <div>
                        <label className={labelCls}>Departamento</label>
                        <SearchableSelect
                            options={departments.map(d => ({ value: String(d.id), label: d.name }))}
                            value={legajoForm.department_id}
                            onChange={v => setLegajoForm(f => ({ ...f, department_id: v }))}
                            placeholder="Sin asignar"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Puesto</label>
                        <SearchableSelect
                            options={positions.map(p => ({ value: String(p.id), label: p.name }))}
                            value={legajoForm.position_id}
                            onChange={v => setLegajoForm(f => ({ ...f, position_id: v }))}
                            placeholder="Sin asignar"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Supervisor</label>
                        <SearchableSelect
                            options={employeeOptions.map(e => ({ value: String(e.id), label: e.user?.name ?? `Empleado #${e.id}` }))}
                            value={legajoForm.supervisor_id}
                            onChange={v => setLegajoForm(f => ({ ...f, supervisor_id: v }))}
                            placeholder="Sin asignar"
                        />
                        {legajoErrors.supervisor_id && <p className="text-red-500 text-xs mt-1">{legajoErrors.supervisor_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Convenio / Categoría</label>
                        <SearchableSelect
                            options={laborAgreementCategories.map(c => ({ value: String(c.id), label: `${c.labor_agreement?.name} — ${c.name}` }))}
                            value={legajoForm.labor_agreement_category_id}
                            onChange={v => setLegajoForm(f => ({ ...f, labor_agreement_category_id: v }))}
                            placeholder="Sin asignar"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setLegajoModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={legajoProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Documento */}
            <Modal open={docModal} onClose={() => setDocModal(false)} title="Cargar Documento" isDark={isDark}>
                <form onSubmit={submitDocument} className="flex flex-col gap-4">
                    <div>
                        <label className={labelCls}>Tipo *</label>
                        <select value={docForm.type} onChange={e => setDocForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                            {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Archivo *</label>
                        <input type="file" onChange={e => setDocForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))} className={inputCls} required />
                        {docErrors.file && <p className="text-red-500 text-xs mt-1">{docErrors.file}</p>}
                    </div>
                    <div><label className={labelCls}>Vencimiento</label><input type="date" value={docForm.expires_at} onChange={e => setDocForm(f => ({ ...f, expires_at: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Notas</label><input type="text" value={docForm.notes} onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} /></div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDocModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={docProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Familiar */}
            <Modal open={familyModal} onClose={() => setFamilyModal(false)} title="Agregar Familiar" isDark={isDark}>
                <form onSubmit={submitFamily} className="flex flex-col gap-4">
                    <div><label className={labelCls}>Nombre *</label><input type="text" value={familyForm.name} onChange={e => setFamilyForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />{familyErrors.name && <p className="text-red-500 text-xs mt-1">{familyErrors.name}</p>}</div>
                    <div>
                        <label className={labelCls}>Vínculo *</label>
                        <select value={familyForm.relationship} onChange={e => setFamilyForm(f => ({ ...f, relationship: e.target.value }))} className={inputCls}>
                            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>DNI</label><input type="text" value={familyForm.dni} onChange={e => setFamilyForm(f => ({ ...f, dni: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Fecha de nacimiento</label><input type="date" value={familyForm.birth_date} onChange={e => setFamilyForm(f => ({ ...f, birth_date: e.target.value }))} className={inputCls} /></div>
                    </div>
                    <label className={`flex items-center gap-2 text-sm cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <input type="checkbox" checked={familyForm.disability} onChange={e => setFamilyForm(f => ({ ...f, disability: e.target.checked }))} className="rounded accent-teal-500" />
                        Certificado de discapacidad
                    </label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setFamilyModal(false)} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium whitespace-nowrap shrink-0 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</button>
                        <button type="submit" disabled={familyProcessing} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
