import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook central de orquestación de animaciones para Artie.
 * Incorpora un simulador de Lip Sync basado en requestAnimationFrame preparado
 * para ser reemplazado por un nodo Audio API (Text-To-Speech) en el futuro.
 */
export function useArtieAnimator(isOpen) {
    const [blinking, setBlinking] = useState(false);
    const [talking, setTalking] = useState(false);
    const [waving, setWaving] = useState(false);
    
    // Estados visuales: 'idle', 'listening', 'thinking', 'talking', 'alert'
    const [emotion, setEmotion] = useState('idle');
    
    // Intensidad labial dinámica [0.0 - 1.0]
    const [lipIntensity, setLipIntensity] = useState(0);

    const blinkRef = useRef(null);
    const lipAnimationRef = useRef(null);
    const speakTimeoutRef = useRef(null);

    // 1. Lógica de parpadeo continuo y orgánico
    useEffect(() => {
        const blink = () => {
            setBlinking(true);
            setTimeout(() => setBlinking(false), 150 + Math.random() * 50);
            blinkRef.current = setTimeout(blink, 2000 + Math.random() * 4000);
        };
        blinkRef.current = setTimeout(blink, 1000);
        return () => clearTimeout(blinkRef.current);
    }, []);

    // 2. Lazo reactivo de Lip Sync Sintético
    // Si Artie "habla", se generan fonemas falsos midiendo frecuencias aleatorias.
    useEffect(() => {
        if (talking || emotion === 'talking') {
            let lastUpdate = performance.now();
            const animateLips = (time) => {
                // Actualiza cada ~80ms para igualar el ritmo silábico natural
                if (time - lastUpdate > 80) { 
                    setLipIntensity(Math.random() * 0.8 + 0.2); // Intensidad variable
                    lastUpdate = time;
                }
                lipAnimationRef.current = requestAnimationFrame(animateLips);
            };
            lipAnimationRef.current = requestAnimationFrame(animateLips);
        } else {
            setLipIntensity(0);
            if (lipAnimationRef.current) cancelAnimationFrame(lipAnimationRef.current);
        }

        return () => {
            if (lipAnimationRef.current) cancelAnimationFrame(lipAnimationRef.current);
        };
    }, [talking, emotion]);

    // 3. Actions visuales explícitas
    const speak = useCallback((durationMs = 2000) => {
        if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
        }

        setTalking(true);
        setEmotion('talking');

        speakTimeoutRef.current = setTimeout(() => {
            setTalking(false);
            setEmotion('idle');
        }, durationMs);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = null;
        }

        setTalking(false);
        setEmotion('idle');
    }, []);

    const greet = useCallback(() => {
        setWaving(true);
        speak(2500);
        setTimeout(() => setWaving(false), 2500);
    }, [speak]);

    // 4. Arquitectura de Inyección Externa (Voz, Lip Sync Real, STT)
    // Cuando el micrófono o el Text-To-Speech esté activo, se llama este método.
    const onSpeechResult = useCallback((volumeScalar) => {
        setLipIntensity(Math.max(0, Math.min(1, volumeScalar)));
    }, []);

    const startListening = useCallback(() => setEmotion('listening'), []);
    const stopListening = useCallback(() => setEmotion('idle'), []);

    useEffect(() => () => {
        if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
        }
    }, []);

    return {
        blinking,
        talking,
        waving,
        emotion,
        lipIntensity,
        setEmotion,
        setTalking,
        speak,
        stopSpeaking,
        greet,
        startListening,
        stopListening,
        onSpeechResult
    };
}
