import React, { useCallback, useEffect, useState } from 'react';
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
    READY: 'ready',
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
    const [state, setState] = useState(STATES.READY);
    const [message, setMessage] = useState('Presioná el botón y usá tu huella para fichar');
    const [result, setResult] = useState(null);
    const webAuthnSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

    const reset = useCallback(() => {
        setState(STATES.READY);
        setMessage('Presioná el botón y usá tu huella para fichar');
        setResult(null);
    }, []);

    useEffect(() => {
        if (state === STATES.SUCCESS || state === STATES.ERROR) {
            const timer = setTimeout(reset, 6000);
            return () => clearTimeout(timer);
        }
    }, [state, reset]);

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

    const isSpinnerState = state === STATES.PROCESSING;
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

                {/* Result card */}
                <div className="relative w-full max-w-md">
                    <div className="rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
                        <div className="relative aspect-[4/3] bg-slate-800 flex items-center justify-center">
                            {/* Idle state icon */}
                            {state === STATES.READY && (
                                <div className="flex flex-col items-center gap-4 text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                                    <p className="text-sm text-center px-6">{message}</p>
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

                            {/* Processing spinner */}
                            {isSpinnerState && (
                                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-slate-300 text-sm">{message}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-4">
                        {state === STATES.READY && (
                            <button
                                onClick={clockFingerprint}
                                disabled={!webAuthnSupported}
                                className="w-full py-4 rounded-2xl bg-violet-700 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2"
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
                                Fichar con Huella
                            </button>
                        )}
                        {!webAuthnSupported && state === STATES.READY && (
                            <p className="mt-2 text-center text-amber-400 text-xs">
                                Este dispositivo no soporta autenticación biométrica (WebAuthn).
                            </p>
                        )}
                        {isTerminal && (
                            <button
                                onClick={reset}
                                className="w-full py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors"
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
