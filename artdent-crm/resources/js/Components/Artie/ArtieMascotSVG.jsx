import React from 'react';
import { ArtieTokens as B } from '../../config/artieConfig';

/**
 * Componente SVG puro de Artie optimizado.
 * Recibe 'lipIntensity' para escalar la apertura de la boca progresivamente,
 * creando una sensación real de habla en lugar de un switch booleano.
 */
export default function ArtieMascotSVG({ 
    size = 80, 
    blinking = false, 
    talking = false, 
    waving = false,
    emotion = 'idle',
    lipIntensity = 0 // Parámetro para Text-To-Speech (0.0 a 1.0)
}) {
    // Interpretación de estado para ajustes de rostro
    const isAlert = emotion === 'alert';
    const isThinking = emotion === 'thinking';
    const isListening = emotion === 'listening';

    // Movimiento ocular orgánico
    const eyeRy = blinking ? 0.8 : (isAlert ? 7 : (isThinking ? 4 : 5));
    const eyeYOffset = isThinking ? -1 : (isListening ? 1 : 0);
    const pupilXOffset = isThinking ? 1 : 0;
    
    // Reglas para la boca (Lip Sync Activo)
    const renderMouth = () => {
        if (talking || emotion === 'talking' || isAlert) {
            // Boca dinámica controlada multiplicando el escalar de 'lipIntensity'
            // rx (ancho): 8 mínimo, 14 máximo
            // ry (altura): 2 mínimo, 11 máximo
            const dynamicRy = isAlert ? 12 : (2 + (lipIntensity * 9));
            const dynamicRx = isAlert ? 10 : (8 + (lipIntensity * 6)); 
            
            return (
                <ellipse 
                    cx="50" cy="68" 
                    rx={dynamicRx} ry={dynamicRy} 
                    fill={B.teal} 
                    // Transición ultra rápida para la boca (símil 60fps)
                    style={{ transition: 'all 50ms ease-out' }} 
                />
            );
        }

        if (isThinking || isListening) {
            // Boca cerrada o "hmm"
            return (
                <path 
                    d="M42 68 Q50 66 58 68" 
                    stroke={B.teal} strokeWidth="3" strokeLinecap="round" 
                    style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
            );
        }

        // Boca sonriente predeterminada (Isotipo ArtDent)
        return (
            <g transform="translate(50,68)" style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <path
                    d="M-14,0 C-14,-9 -5,-9 0,0 C5,9 14,9 14,0 C14,-9 5,-9 0,0 C-5,9 -14,9 -14,0 Z"
                    fill={B.teal} stroke="white" strokeWidth="1.8" strokeLinejoin="round"
                />
            </g>
        );
    };

    return (
        <svg 
            width={size} height={size} 
            viewBox="0 0 100 112" fill="none" xmlns="http://www.w3.org/2000/svg" 
            className="artie-svg-core isolate" 
            style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
            {/* Sombra base */}
            <ellipse cx="50" cy="108" rx="22" ry="4" fill="rgba(57,123,156,0.18)" />

            {/* Cuerpo principal Ovalado */}
            <rect x="12" y="4" width="76" height="94" rx="38" fill={B.blue} />

            {/* Highlight/Reflejo (Apple Glass Feeling) */}
            <rect x="22" y="14" width="56" height="74" rx="28" fill="white" fillOpacity="0.08" />

            {/* Brazo Izquierdo Sutil (Ondulación controlada en CSS externo) */}
            <g className={waving ? "artie-arm-wave" : ""} style={{ transformOrigin: "28px 72px" }}>
                <ellipse cx="16" cy="76" rx="7" ry="10" rx2="5" fill={B.blue} transform="rotate(-20 16 76)" />
                <circle cx="10" cy="83" r="5" fill={B.teal} />
            </g>

            {/* Brazo Derecho */}
            <ellipse cx="84" cy="76" rx="7" ry="10" fill={B.blue} transform="rotate(20 84 76)" />
            <circle cx="90" cy="83" r="5" fill={B.teal} />

            {/* Globo ocular y Pupilas (Agrupado y con Physics transiciones) */}
            <g style={{ transform: `translateY(${eyeYOffset}px)`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Blancas */}
                <ellipse cx="37" cy="42" rx="6" ry={eyeRy} fill="white" style={{ transition: 'all 120ms ease' }} />
                <ellipse cx="63" cy="42" rx="6" ry={eyeRy} fill="white" style={{ transition: 'all 120ms ease' }} />

                {!blinking && (
                    <g style={{ transform: `translateX(${pupilXOffset}px)`, transition: 'transform 0.3s ease' }}>
                        <circle cx="38.5" cy="43" r="3" fill={B.dark} />
                        <circle cx="64.5" cy="43" r="3" fill={B.dark} />
                        {/* Brillo ocular refinado */}
                        <circle cx="40" cy="41.5" r="1.2" fill="white" />
                        <circle cx="66" cy="41.5" r="1.2" fill="white" />
                    </g>
                )}
            </g>

            {/* Cejas Expresivas */}
            <g style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} transform={isThinking ? "translate(0, 3)" : (isAlert ? "translate(0, -3)" : "")}>
                <path d="M31 34 Q37 30 43 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
                <path d="M57 33 Q63 30 69 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
            </g>

            {/* Componente de Boca Inyectado */}
            {renderMouth()}

            {/* Mejillas (Opacidad variante por Contexto de Escucha) */}
            <ellipse cx="28" cy="58" rx="7" ry="5" fill="white" fillOpacity={isListening ? 0.35 : 0.15} style={{ transition: 'fill-opacity 0.4s ease' }} />
            <ellipse cx="72" cy="58" rx="7" ry="5" fill="white" fillOpacity={isListening ? 0.35 : 0.15} style={{ transition: 'fill-opacity 0.4s ease' }} />
        </svg>
    );
}
