import React from 'react';
import ArtieMascotSVG from './ArtieMascotSVG';
import { ArtieTokens as B } from '../../config/artieConfig';

export default function ArtieAvatar({ isOpen, onClick, animator, size = 82 }) {
    return (
        <div
            className="artie-avatar group"
            onClick={onClick}
            style={{
                animation: isOpen ? "none" : "artieFloat 3.4s ease-in-out infinite",
                cursor: "pointer",
                filter: isOpen 
                    ? "drop-shadow(0 4px 12px rgba(57,123,156,0.4))" 
                    : "drop-shadow(0 8px 16px rgba(57,123,156,0.35))",
                transition: "filter 0.3s ease, transform 0.2s ease",
                transform: "translateY(0)"
            }}
            title="Hablar con Artie"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <ArtieMascotSVG
                size={size}
                blinking={animator.blinking}
                talking={animator.talking}
                waving={animator.waving}
                emotion={animator.emotion}
                lipIntensity={animator.lipIntensity}
            />
            {/* Badge de estado online, latente cuando no está abierto */}
            {!isOpen && (
                <div style={{
                    position: "absolute",
                    top: 4, right: 2,
                    width: 14, height: 14,
                    background: B.teal,
                    borderRadius: "50%",
                    border: "2.5px solid white",
                    animation: "artiePulse 2s ease-in-out infinite",
                }} />
            )}
        </div>
    );
}
