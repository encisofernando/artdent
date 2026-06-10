import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, UserRound, DollarSign, ScanFace, Camera, X, CheckCircle, AlertCircle, Fingerprint, Trash2 } from 'lucide-react';

function EnrollFaceModal({ item, isDark, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [enrollState, setEnrollState] = useState('idle'); // idle | camera | capturing | success | error
    const [enrollMsg, setEnrollMsg] = useState('');
    const streamRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        setEnrollState('camera');
        setEnrollMsg('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (e) {
            setEnrollState('error');
            setEnrollMsg('No se pudo acceder a la cámara. Verificá los permisos.');
        }
    }, []);

    const captureAndEnroll = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        // Resize to max 640px wide to keep payload small
        const maxW = 640;
        const scale = Math.min(1, maxW / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.75);

        stopCamera();
        setEnrollState('capturing');
        setEnrollMsg('Registrando rostro...');

        try {
            const { data } = await axios.post(route('collaborators.enroll-face', item.id), { image: imageBase64 });
            setEnrollState('success');
            setEnrollMsg(`Rostro registrado correctamente. ID: ${data.subject}`);
        } catch (e) {
            const msg = e?.response?.data?.error ?? e?.message ?? 'Error desconocido';
            setEnrollState('error');
            setEnrollMsg(msg);
        }
    }, [item.id, stopCamera]);

    const handleClose = useCallback(() => {
        stopCamera();
        onClose();
    }, [stopCamera, onClose]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const overlayBg = isDark ? 'bg-slate-900/95' : 'bg-slate-800/95';
    const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayBg}`}>
            <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${cardBg}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ScanFace size={20} className="text-teal-500" />
                        <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Registrar Rostro — {item.name}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                {enrollState === 'idle' && (
                    <div className="text-center py-4">
                        <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Capturá una foto clara del colaborador para registrar su rostro en el sistema de fichaje biométrico.
                            {item.faceio_fid && (
                                <span className="block mt-2 text-amber-500 font-medium">
                                    Ya tiene un rostro registrado. Al enrollar de nuevo lo reemplazará.
                                </span>
                            )}
                        </p>
                        <Button
                            onClick={startCamera}
                            className="bg-teal-600 hover:bg-teal-500 text-white"
                        >
                            <Camera className="mr-2" size={16} />
                            Abrir Cámara
                        </Button>
                    </div>
                )}

                {enrollState === 'camera' && (
                    <div>
                        <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-[4/3] mb-4">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-40 h-52 rounded-full border-2 border-teal-400/60 border-dashed" />
                            </div>
                        </div>
                        <p className={`text-xs text-center mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Asegurate de que el rostro esté centrado y bien iluminado
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} className="flex-1">
                                Cancelar
                            </Button>
                            <Button onClick={captureAndEnroll} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white">
                                <Camera className="mr-2" size={16} />
                                Capturar y Registrar
                            </Button>
                        </div>
                    </div>
                )}

                {enrollState === 'capturing' && (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{enrollMsg}</p>
                    </div>
                )}

                {enrollState === 'success' && (
                    <div className="flex flex-col items-center py-6 gap-3">
                        <CheckCircle size={48} className="text-emerald-500" />
                        <p className={`text-sm text-center font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {enrollMsg}
                        </p>
                        <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Recargá la página para ver el ID actualizado.
                        </p>
                        <Button onClick={handleClose} className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                            Cerrar
                        </Button>
                    </div>
                )}

                {enrollState === 'error' && (
                    <div className="flex flex-col items-center py-6 gap-3">
                        <AlertCircle size={48} className="text-red-500" />
                        <p className={`text-sm text-center ${isDark ? 'text-red-300' : 'text-red-600'}`}>{enrollMsg}</p>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleClose}>Cerrar</Button>
                            <Button onClick={() => { setEnrollState('idle'); setEnrollMsg(''); }} className="bg-teal-600 hover:bg-teal-500 text-white">
                                Reintentar
                            </Button>
                        </div>
                    </div>
                )}
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

function WebAuthnPanel({ item, isDark }) {
    const [credentials, setCredentials] = useState(item.webauthn_credentials ?? []);
    const [status, setStatus] = useState('idle'); // idle | registering | success | error
    const [message, setMessage] = useState('');
    const isSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

    const register = useCallback(async () => {
        setStatus('registering');
        setMessage('');
        try {
            // 1. Get registration options from server
            const { data: options } = await axios.get(
                route('collaborators.webauthn.registration-options', item.id),
            );

            // 2. Convert base64url fields to ArrayBuffers
            const publicKey = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                user: {
                    ...options.user,
                    id: base64urlToBuffer(options.user.id),
                },
                excludeCredentials: (options.excludeCredentials ?? []).map((c) => ({
                    ...c,
                    id: base64urlToBuffer(c.id),
                })),
            };

            // 3. Invoke the platform authenticator
            const credential = await navigator.credentials.create({ publicKey });

            // 4. Encode the response back to base64url for the server
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

            // 5. Send to server
            const { data } = await axios.post(
                route('collaborators.webauthn.register', item.id),
                payload,
            );

            setCredentials((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    credential_id: data.credential_id,
                    device_label: 'Este dispositivo',
                    created_at: new Date().toISOString(),
                },
            ]);
            setStatus('success');
            setMessage('Huella registrada correctamente en este dispositivo.');
        } catch (e) {
            const msg =
                e?.response?.data?.error ??
                (e?.name === 'NotAllowedError'
                    ? 'Permiso denegado por el usuario.'
                    : e?.message ?? 'Error desconocido al registrar la huella.');
            setStatus('error');
            setMessage(msg);
        }
    }, [item.id]);

    const cardBg = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors ${cardBg}`}>
            <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Fingerprint size={18} className="text-violet-500" />
                <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Autenticación por Huella (WebAuthn)
                </h2>
            </div>

            {!isSupported && (
                <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Este navegador no soporta WebAuthn. Usá Chrome, Edge o Safari actualizado.
                </p>
            )}

            {isSupported && (
                <div className="flex flex-col gap-4">
                    {/* Existing credentials list */}
                    {credentials.length > 0 && (
                        <div>
                            <label className={labelCls}>Dispositivos registrados</label>
                            <ul className="flex flex-col gap-2">
                                {credentials.map((cred) => (
                                    <li
                                        key={cred.id}
                                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm border
                                            ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Fingerprint size={14} className="text-violet-400 shrink-0" />
                                            <span className="font-medium">{cred.device_label ?? 'Dispositivo'}</span>
                                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                — {new Date(cred.created_at).toLocaleDateString('es-AR')}
                                            </span>
                                        </div>
                                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Register button */}
                    <div>
                        <Button
                            type="button"
                            onClick={register}
                            disabled={status === 'registering'}
                            className="gap-2 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-60"
                        >
                            <Fingerprint size={16} />
                            {status === 'registering' ? 'Registrando...' : 'Registrar Huella en este Dispositivo'}
                        </Button>
                    </div>

                    {/* Feedback */}
                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                            <CheckCircle size={16} />
                            {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle size={16} />
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Edit({ auth, item }) {
    const { isDark } = useTheme();
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        document: item.document || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        birth_date: item.birth_date ? item.birth_date.substring(0, 10) : '',
        specialty: item.specialty || '',
        hourly_rate: item.hourly_rate || '',
        faceio_fid: item.faceio_fid || '',
        is_active: item.is_active === false || item.is_active === 0 ? 0 : 1,
        notes: item.notes || '',
        pin: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('collaborators.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <>
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Colaborador - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Colaborador
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Modificando: {item.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('collaborators.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <UserRound size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos Personales
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Juan Pérez"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Documento (DNI/CUIT)</label>
                                <input
                                    type="text"
                                    value={data.document}
                                    onChange={e => setData('document', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.document && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.document}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Especialidad</label>
                                <input
                                    type="text"
                                    value={data.specialty}
                                    onChange={e => setData('specialty', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Técnico Dental"
                                />
                                {errors.specialty && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.specialty}</div>}
                            </div>
                            
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Teléfono</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.phone && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Dirección</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.address && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.address}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={e => setData('birth_date', e.target.value)}
                                    className={inputClasses}
                                />
                                {errors.birth_date && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.birth_date}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Rates & Configuration */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <DollarSign size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Configuración y Honorarios
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Precio por Hora</label>
                                <div className="relative">
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold
                                        ${isDark ? 'text-slate-400' : 'text-slate-500'}
                                    `}>
                                        $
                                    </div>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={data.hourly_rate}
                                        onChange={e => setData('hourly_rate', e.target.value)}
                                        className={`${inputClasses} pl-8`}
                                        placeholder="0"
                                    />
                                </div>
                                {errors.hourly_rate && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.hourly_rate}</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className={labelClasses}>PIN Portal Técnicos</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={data.pin}
                                    onChange={e => setData('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className={inputClasses}
                                    placeholder="Dejar vacío para no cambiar"
                                    autoComplete="new-password"
                                />
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>4 a 6 dígitos numéricos{item.pin ? ' · Ya tiene PIN configurado' : ' · Sin PIN asignado'}</p>
                                {errors.pin && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.pin}</div>}
                            </div>

                            <div className="md:col-span-1 flex items-center mt-2 md:mt-6">
                                <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.is_active === 1 || data.is_active === true}
                                            onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true)
                                            ? 'bg-emerald-500'
                                            : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                        }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'transform translate-x-4' : ''
                                        }`}></div>
                                    </div>
                                    <div className="ml-3 font-medium text-sm">
                                        Activo
                                    </div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Notas Internas</label>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Comentarios o notas..."
                                    rows="3"
                                />
                                {errors.notes && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.notes}</div>}
                            </div>
                        </div>
                    </div>

                    {/* FaceIO / Biometric */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <ScanFace size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Fichaje Biométrico
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelClasses}>CompreFace Subject ID</label>
                                <input
                                    type="text"
                                    value={data.faceio_fid}
                                    onChange={e => setData('faceio_fid', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Se asigna al enrollar el rostro (ej: collab-5)"
                                    readOnly
                                />
                                {errors.faceio_fid && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.faceio_fid}</div>}
                                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Se asigna automáticamente al registrar el rostro. Usá el botón de abajo para enrollar.
                                </p>
                            </div>

                            <div>
                                <Button
                                    type="button"
                                    onClick={() => setShowEnrollModal(true)}
                                    className="gap-2 text-white"
                                    style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                >
                                    <Camera size={16} />
                                    {data.faceio_fid ? 'Re-enrollar Rostro' : 'Enrollar Rostro'}
                                </Button>
                                {data.faceio_fid && (
                                    <span className={`ml-3 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        ✓ Rostro registrado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* WebAuthn / Fingerprint */}
                    <WebAuthnPanel item={item} isDark={isDark} />

                    {/* Actions */}
                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('collaborators.index')}>
                            <Button
                                type="button"
                                variant="outline"
                                className={isDark ? "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800" : ""}
                            >
                                Cancelar
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save className="mr-2" size={16} />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>

        {showEnrollModal && (
            <EnrollFaceModal
                item={item}
                isDark={isDark}
                onClose={() => setShowEnrollModal(false)}
            />
        )}
        </>
    );
}
