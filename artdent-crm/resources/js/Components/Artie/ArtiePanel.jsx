import React from 'react';
import ArtieMascotSVG from './ArtieMascotSVG';
import ArtieMessageList from './ArtieMessageList';
import ArtieQuickActions from './ArtieQuickActions';
import { ArtieTokens as B } from '../../config/artieConfig';

export default function ArtiePanel({ 
    isOpen, 
    onClose, 
    onReset,
    animator, 
    messages, 
    isLoading, 
    isHistoryLoading,
    isResetting,
    isMobileViewport,
    inputValue,
    onInputChange,
    onSend,
    onQuickAction
}) {
    if (!isOpen) return null;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div style={{
            position: "absolute",
            bottom: isMobileViewport ? 82 : 96,
            right: 0,
            width: isMobileViewport ? "min(360px, calc(100vw - 24px))" : 360,
            height: isMobileViewport ? "min(580px, calc(100vh - 180px))" : 580,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 24,
            border: `1px solid rgba(57,123,156,0.15)`,
            boxShadow: "0 24px 48px -12px rgba(57,123,156,0.18), 0 4px 8px -4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "artiePanelIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
            zIndex: 10000
        }}>
            {/* Header Premium */}
            <div style={{
                background: `linear-gradient(135deg, ${B.blueDark} 0%, ${B.teal} 100%)`,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                    <ArtieMascotSVG
                        size={48}
                        blinking={animator.blinking}
                        talking={animator.talking}
                        emotion={animator.emotion}
                        waving={animator.waving}
                        lipIntensity={animator.lipIntensity}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 16, letterSpacing: 0.3 }} className="font-montserrat">Artie</div>
                    <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 11.5, fontWeight: 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 0 2px rgba(74,222,128,0.2)' }}></span>
                        {animator.emotion === 'thinking' ? "pensando..." : (animator.emotion === 'listening' ? "escuchando..." : "Asistente clínico")}
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="hover:bg-white/20 transition-all duration-300"
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "none",
                        borderRadius: 999,
                        minWidth: 92,
                        height: 32,
                        cursor: isResetting || isLoading || isHistoryLoading ? "default" : "pointer",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: isResetting || isLoading || isHistoryLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 12px",
                    }}
                    aria-label="Iniciar una nueva conversación"
                    disabled={isResetting || isLoading || isHistoryLoading}
                >
                    {isResetting ? 'Reiniciando...' : 'Nuevo chat'}
                </button>
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 transition-all duration-300"
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "none",
                        borderRadius: "50%",
                        width: 32, height: 32,
                        cursor: "pointer",
                        color: "white",
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                    }}
                    aria-label="Cerrar asistente"
                >×</button>
            </div>

            {/* Lista de mensajes */}
            <ArtieMessageList 
                messages={messages} 
                isLoading={isLoading} 
                isHistoryLoading={isHistoryLoading} 
            />

            {/* Quick Actions (Botones píldora recomendados) */}
            <ArtieQuickActions 
                onActionClick={onQuickAction} 
                disabled={isLoading || isHistoryLoading} 
            />

            {/* Input Footer */}
            <div style={{
                padding: "14px 18px",
                borderTop: `1px solid ${B.pale}`,
                background: 'rgba(255, 255, 255, 0.5)',
                display: "flex",
                gap: 12,
                alignItems: "center",
            }}>
                <input
                    className="artie-msg-input"
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isHistoryLoading ? 'Conectando...' : 'Consulta el CRM...'}
                    style={{
                        flex: 1,
                        border: `1.5px solid ${B.pale}`,
                        borderRadius: 24,
                        padding: "12px 18px",
                        fontSize: 14,
                        color: B.dark,
                        background: "#f8fafc",
                        transition: "all 0.2s ease",
                        outline: 'none',
                    }}
                    aria-label="Mensaje para Artie"
                    onFocus={(e) => { 
                        e.currentTarget.style.borderColor = B.teal; 
                        e.currentTarget.style.background = 'white'; 
                        e.currentTarget.style.boxShadow = `0 0 0 4px rgba(90,173,156,0.1)`; 
                        animator.startListening(); 
                    }}
                    onBlur={(e) => { 
                        e.currentTarget.style.borderColor = B.pale; 
                        e.currentTarget.style.background = '#f8fafc'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                        animator.stopListening(); 
                    }}
                    disabled={isLoading || isHistoryLoading}
                />
                <button
                    className="artie-send-btn shadow-sm"
                    onClick={onSend}
                    disabled={isLoading || isHistoryLoading || !inputValue.trim()}
                    style={{
                        background: B.blue,
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 44, height: 44,
                        cursor: isLoading || isHistoryLoading || !inputValue.trim() ? "default" : "pointer",
                        opacity: isLoading || isHistoryLoading || !inputValue.trim() ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        flexShrink: 0,
                    }}
                    aria-label="Enviar mensaje"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "translateX(-1px) translateY(1px)" }}>
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
}
