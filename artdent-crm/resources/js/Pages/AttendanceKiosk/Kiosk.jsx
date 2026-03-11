import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

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

const STATES = {
    LOADING: 'loading',
    READY: 'ready',
    DETECTING: 'detecting',
    LIVENESS: 'liveness',
    CAPTURING: 'capturing',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    ERROR: 'error',
};

function KioskClock() {
    const [time, setTime] = useState(new Date().toLocaleTimeString('es-AR'));
    useEffect(() => {
        const id = setInterval(() => setTime(new Date().toLocaleTimeString('es-AR')), 1000);
        return () => clearInterval(id);
    }, []);
    return <div className="mt-8 text-slate-500 text-sm font-mono">{time}</div>;
}

export default function Kiosk({ kioskToken }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [state, setState] = useState(STATES.LOADING);
    const [message, setMessage] = useState('Cargando sistema...');
    const [result, setResult] = useState(null);
    const detectionInterval = useRef(null);
    const livenessData = useRef({ blinked: false, baseEAR: null, lowCount: 0 });
    const faceapi = useRef(null);
    const webAuthnSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

    // Load face-api.js models from public folder
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
        script.onload = async () => {
            faceapi.current = window.faceapi;
            try {
                const MODEL_URL = '/face-api-models';
                await Promise.all([
                    faceapi.current.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.current.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
                ]);
                setState(STATES.READY);
                setMessage('Presioná "Iniciar Fichaje" para comenzar');
            } catch (e) {
                console.error('Model load error:', e);
                setState(STATES.ERROR);
                setMessage('Error cargando modelos de reconocimiento facial. Verificá la conexión.');
            }
        };
        script.onerror = () => {
            setState(STATES.ERROR);
            setMessage('Error cargando la librería face-api.js. Verificá la conexión a internet.');
        };
        document.head.appendChild(script);
        return () => {
            if (document.head.contains(script)) document.head.removeChild(script);
        };
    }, []);

    const getEAR = (landmarks) => {
        const leftEye = [
            landmarks[36], landmarks[37], landmarks[38],
            landmarks[39], landmarks[40], landmarks[41],
        ];
        const rightEye = [
            landmarks[42], landmarks[43], landmarks[44],
            landmarks[45], landmarks[46], landmarks[47],
        ];

        const earForEye = (eye) => {
            const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
            const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
            const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
            return (A + B) / (2.0 * C);
        };

        return (earForEye(leftEye) + earForEye(rightEye)) / 2;
    };

    const clockFingerprint = useCallback(async () => {
        setState(STATES.PROCESSING);
        setMessage('Verificando huella...');

        try {
            const headers = kioskToken ? { 'X-Kiosk-Token': kioskToken } : {};

            // 1. Get challenge from server
            const { data: options } = await axios.post(
                route('attendance-kiosk.webauthn.authentication-options'),
                {},
                { headers },
            );

            // 2. Convert challenge to ArrayBuffer
            const publicKey = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                allowCredentials: (options.allowCredentials ?? []).map((c) => ({
                    ...c,
                    id: base64urlToBuffer(c.id),
                })),
            };

            // 3. Invoke the platform authenticator (fingerprint / face ID / Windows Hello)
            const assertion = await navigator.credentials.get({ publicKey });

            // 4. Encode response back to base64url for the server
            const payload = {
                id: assertion.id,
                rawId: bufferToBase64url(assertion.rawId),
                type: assertion.type,
                response: {
                    clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
                    authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
                    signature: bufferToBase64url(assertion.response.signature),
                    userHandle: assertion.response.userHandle
                        ? bufferToBase64url(assertion.response.userHandle)
                        : null,
                },
            };

            // 5. Verify on server and record attendance
            const { data } = await axios.post(
                route('attendance-kiosk.webauthn.verify'),
                payload,
                { headers },
            );

            setResult(data);
            setState(STATES.SUCCESS);
        } catch (e) {
            const msg =
                e?.response?.data?.error ??
                (e?.name === 'NotAllowedError'
                    ? 'Autenticación cancelada o no disponible.'
                    : 'Error de conexión. Intentá de nuevo.');
            setState(STATES.ERROR);
            setMessage(msg);
        }
    }, [kioskToken]);

    const captureAndSend = useCallback(async () => {
        setState(STATES.CAPTURING);
        setMessage('Perfecto! Procesando...');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

        // Stop camera
        video.srcObject?.getTracks().forEach((t) => t.stop());

        setState(STATES.PROCESSING);
        setMessage('Identificando...');

        try {
            const headers = kioskToken ? { 'X-Kiosk-Token': kioskToken } : {};
            const { data } = await axios.post(route('attendance-kiosk.clock-face'), { image: imageBase64 }, { headers });
            setResult(data);
            setState(STATES.SUCCESS);
        } catch (e) {
            console.error('Clock face error:', e);
            const msg = e?.response?.data?.error ?? 'Error de conexión. Intentá de nuevo.';
            setState(STATES.ERROR);
            setMessage(msg);
        }
    }, []);

    const startDetection = useCallback(() => {
        setState(STATES.DETECTING);
        setMessage('Mirá a la cámara...');
        livenessData.current = { blinked: false, baseEAR: null, lowCount: 0 };

        detectionInterval.current = setInterval(async () => {
            if (!videoRef.current || !faceapi.current) return;

            try {
                const detections = await faceapi.current
                    .detectAllFaces(
                        videoRef.current,
                        new faceapi.current.TinyFaceDetectorOptions({ inputSize: 320 }),
                    )
                    .withFaceLandmarks(true);

                if (detections.length === 0) {
                    setMessage('No se detecta ningún rostro. Acercate a la cámara.');
                    return;
                }

                if (detections.length > 1) {
                    setMessage('Se detectaron múltiples rostros. Solo una persona a la vez.');
                    return;
                }

                const landmarks = detections[0].landmarks.positions;
                const ear = getEAR(landmarks);

                if (livenessData.current.baseEAR === null) {
                    livenessData.current.baseEAR = ear;
                    setState(STATES.LIVENESS);
                    setMessage('Parpadea para confirmar que sos una persona real');
                    return;
                }

                // Blink detection: EAR drops significantly below baseline
                if (ear < livenessData.current.baseEAR * 0.65) {
                    livenessData.current.lowCount++;
                } else if (livenessData.current.lowCount > 1) {
                    // Blink completed
                    livenessData.current.blinked = true;
                }

                if (livenessData.current.blinked) {
                    clearInterval(detectionInterval.current);
                    captureAndSend();
                }
            } catch (e) {
                // Silently ignore detection errors
            }
        }, 200);
    }, [captureAndSend]);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            startDetection();
        } catch (e) {
            console.error('Camera error:', e);
            setState(STATES.ERROR);
            setMessage('No se pudo acceder a la cámara. Verificá los permisos.');
        }
    }, [startDetection]);

    const reset = useCallback(() => {
        clearInterval(detectionInterval.current);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
        setState(STATES.READY);
        setMessage('Presioná "Iniciar Fichaje" para comenzar');
        setResult(null);
        livenessData.current = { blinked: false, baseEAR: null, lowCount: 0 };
    }, []);

    useEffect(() => {
        if (state === STATES.SUCCESS || state === STATES.ERROR) {
            const timer = setTimeout(reset, 6000);
            return () => clearTimeout(timer);
        }
    }, [state, reset]);

    useEffect(() => () => {
        clearInterval(detectionInterval.current);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
    }, []);

    const isSpinnerState = [STATES.LOADING, STATES.PROCESSING, STATES.CAPTURING].includes(state);
    const isActiveDetection = [STATES.DETECTING, STATES.LIVENESS].includes(state);
    const isTerminal = [STATES.SUCCESS, STATES.ERROR].includes(state);

    return (
        <>
            <Head title="Fichaje Biométrico - ArtDent" />
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <img
                        src="/assets/logo-artdent-blanco.png"
                        alt="ArtDent"
                        className="h-12 mx-auto mb-3 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Fichaje Biométrico</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                </div>

                {/* Camera / Result card */}
                <div className="relative w-full max-w-md">
                    <div className="rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
                        {/* Video feed */}
                        <div className="relative aspect-[4/3] bg-slate-800 flex items-center justify-center">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Face oval overlay */}
                            {isActiveDetection && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div
                                        className="w-48 h-64 rounded-full border-4 border-emerald-400/60"
                                        style={{ boxShadow: '0 0 30px rgba(52,211,153,0.3)' }}
                                    />
                                </div>
                            )}

                            {/* Success overlay */}
                            {state === STATES.SUCCESS && result && (
                                <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center">
                                    <div className="text-6xl mb-2">{result.action === 'in' ? '✅' : '👋'}</div>
                                    <div className="text-white font-extrabold text-xl text-center px-4">
                                        {result.collaborator}
                                    </div>
                                    <div className="text-emerald-300 font-bold text-lg">
                                        {result.action === 'in' ? 'ENTRADA' : 'SALIDA'} — {result.time?.substring(0, 5)}
                                    </div>
                                    {result.action === 'out' && result.hours !== undefined && (
                                        <div className="text-slate-300 text-sm mt-1">
                                            {result.hours}h trabajadas
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error overlay */}
                            {state === STATES.ERROR && (
                                <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center">
                                    <div className="text-5xl mb-2">❌</div>
                                    <div className="text-red-300 font-bold text-center px-6 text-sm">{message}</div>
                                </div>
                            )}

                            {/* Loading / Processing spinner */}
                            {isSpinnerState && (
                                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-slate-300 text-sm">{message}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status bar */}
                        <div className="p-4 border-t border-slate-700 min-h-[56px] flex items-center justify-center">
                            {isActiveDetection ? (
                                <p className="text-center text-emerald-400 font-medium text-sm animate-pulse">
                                    {message}
                                </p>
                            ) : !isTerminal && !isSpinnerState ? (
                                <p className="text-center text-slate-400 text-sm">{message}</p>
                            ) : null}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-3">
                        {state === STATES.READY && (
                            <>
                                <button
                                    onClick={startCamera}
                                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors shadow-lg"
                                >
                                    Iniciar Fichaje
                                </button>
                                {webAuthnSupported && (
                                    <button
                                        onClick={clockFingerprint}
                                        title="Fichar con huella / biometría del dispositivo"
                                        className="px-4 py-3 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white font-bold text-base transition-colors shadow-lg flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                                            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                                            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                                            <path d="M2 12a10 10 0 0 1 18-6" />
                                            <path d="M2 16h.01" />
                                            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                                            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                                            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                                            <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                                        </svg>
                                        <span className="hidden sm:inline">Huella</span>
                                    </button>
                                )}
                            </>
                        )}
                        {isActiveDetection && (
                            <button
                                onClick={reset}
                                className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                        {isTerminal && (
                            <button
                                onClick={reset}
                                className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors"
                            >
                                Volver al inicio
                            </button>
                        )}
                    </div>
                </div>

                <KioskClock />
            </div>
        </>
    );
}
