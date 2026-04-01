import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePage } from '@inertiajs/react';

import ArtieAvatar from './ArtieAvatar';
import ArtiePanel from './ArtiePanel';

import { useArtieAnimator } from '../../hooks/useArtieAnimator';
import { artieService } from '../../Services/artieService';
import { ArtieTokens as B } from '../../config/artieConfig';

const MOBILE_BREAKPOINT = 1024;

const HIDDEN_ALL_VIEWPORTS_PATTERNS = [
    /^\/sales\/create(?:\/)?$/,
];

const HIDDEN_MOBILE_PATTERNS = [
    /^\/quotes(?:\/.*)?$/,
];

const matchesAnyPattern = (path, patterns) => patterns.some((pattern) => pattern.test(path));

export default function ArtieWidget() {
    const page = usePage();
    const { chatbot } = page.props;
    const currentPath = (page.url || '/').split('?')[0];
    // Habilitado por defecto si no viene del backend
    const isEnabled = chatbot?.enabled !== false; 

    // Estados
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(() => (
        typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
    ));
    
    // Historial
    const [messages, setMessages] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    // Burbuja Espontánea
    const [spontaneousPhrase, setSpontaneousPhrase] = useState(null);

    // Contexto de UI (Animación y Temporizadores)
    const animator = useArtieAnimator(isOpen);
    const phraseTimer = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileViewport(window.innerWidth < MOBILE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Cargar historial
    const handleLoadHistory = useCallback(async () => {
        if (hasLoadedHistory || isHistoryLoading) return;
        setIsHistoryLoading(true);
        const history = await artieService.loadHistory(isEnabled, chatbot?.welcome_message, conversationId);
        setMessages(history.messages);
        setConversationId(history.conversationId ?? null);
        setHasLoadedHistory(true);
        setIsHistoryLoading(false);
    }, [hasLoadedHistory, isHistoryLoading, isEnabled, chatbot?.welcome_message, conversationId]);

    useEffect(() => {
        if (isOpen && !hasLoadedHistory) {
            handleLoadHistory();
        }
    }, [isOpen, hasLoadedHistory, handleLoadHistory]);

    // 2. Frases ocasionales (Idle behavior)
    useEffect(() => {
        const schedule = () => {
            const delay = 15000 + Math.random() * 25000;
            phraseTimer.current = setTimeout(() => {
                if (!isOpen) {
                    setSpontaneousPhrase(artieService.getRandomPhrase());
                    animator.greet();
                    setTimeout(() => setSpontaneousPhrase(null), 5000);
                }
                schedule();
            }, delay);
        };
        phraseTimer.current = setTimeout(schedule, 8000);
        return () => clearTimeout(phraseTimer.current);
    }, [isOpen, animator]);

    // 3. Flujo central de mensajes
    const handleSend = async (forcedAction = null) => {
        const text = forcedAction
            ? artieService.getQuickActionPrompt(forcedAction)
            : inputValue.trim();

        if (!text || isLoading || isHistoryLoading) return;

        setInputValue("");
        animator.stopListening();
        
        let currentMessages = messages;
        if (!hasLoadedHistory) {
            const history = await artieService.loadHistory(isEnabled, chatbot?.welcome_message, conversationId);
            currentMessages = history.messages;
            setMessages(history.messages);
            setConversationId(history.conversationId ?? null);
            setHasLoadedHistory(true);
        }

        const optimisticMessages = [...currentMessages, { role: "user", content: text }];
        setMessages(optimisticMessages);
        setIsLoading(true);
        animator.setEmotion('thinking');
        animator.speak(15000);

        const response = await artieService.sendMessage({
            messageText: text,
            conversationId,
        });

        if (response.success && response.messages) {
            setMessages(response.messages);
            setConversationId(response.conversationId ?? null);
        } else {
            setMessages([...optimisticMessages, { role: 'assistant', content: response.reply }]);
        }

        animator.stopSpeaking();
        setIsLoading(false);
    };

    const handleResetConversation = async () => {
        if (isResetting || isLoading || isHistoryLoading) return;

        setIsResetting(true);

        const response = await artieService.resetConversation(chatbot?.welcome_message);

        setConversationId(response.conversationId ?? null);
        setMessages(response.messages);
        setHasLoadedHistory(true);
        animator.setEmotion('idle');
        animator.stopSpeaking();
        setIsResetting(false);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setSpontaneousPhrase(null);
        if (!isOpen) { 
            // Saluda al abrir
            animator.speak(1000); 
        }
    };

    const shouldHideForCurrentRoute = matchesAnyPattern(currentPath, HIDDEN_ALL_VIEWPORTS_PATTERNS)
        || (isMobileViewport && matchesAnyPattern(currentPath, HIDDEN_MOBILE_PATTERNS));

    if (!isEnabled || shouldHideForCurrentRoute) return null;

    const widgetBottom = isMobileViewport ? 92 : 28;
    const widgetRight = isMobileViewport ? 16 : 32;
    const avatarSize = isMobileViewport ? 68 : 82;

    return (
        <React.Fragment>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap');
                
                .artie-widget * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
                .artie-widget .font-montserrat { font-family: 'Montserrat', sans-serif; }

                @keyframes artieFloat {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes artiePanelIn {
                    0%   { opacity: 0; transform: translateY(24px) scale(0.96); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes artieBubbleIn {
                    0%   { opacity: 0; transform: scale(0.85) translateY(12px) rotate(-3deg); }
                    100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
                }
                @keyframes artieDotBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30%           { transform: translateY(-5px); }
                }
                @keyframes artiePulse {
                    0%   { box-shadow: 0 0 0 0 rgba(90,173,156,0.35); }
                    70%  { box-shadow: 0 0 0 9px rgba(90,173,156,0); }
                    100% { box-shadow: 0 0 0 0 rgba(90,173,156,0); }
                }
                @keyframes artieFloatIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .artie-arm-wave {
                    animation: artieArmWave 0.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
                }
                @keyframes artieArmWave {
                    0%   { transform: rotate(-8deg); }
                    100% { transform: rotate(28deg); }
                }
                .artie-send-btn:hover:not(:disabled) {
                    transform: scale(1.06);
                    background: ${B.teal} !important;
                }
                .artie-send-btn:active:not(:disabled) {
                    transform: scale(0.94);
                }
            `}</style>

            <div className="artie-widget" style={{ position: "fixed", bottom: widgetBottom, right: widgetRight, zIndex: 9999 }}>
                
                {/* Burbuja Spontánea */}
                {spontaneousPhrase && !isOpen && (
                    <div style={{
                        position: "absolute", bottom: 104,
                        right: isMobileViewport ? 6 : 18,
                        background: "white",
                        border: `1px solid rgba(57,123,156,0.1)`,
                        borderRadius: 18,
                        padding: "14px 20px",
                        maxWidth: 240,
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: B.blueDark,
                        lineHeight: 1.45,
                        animation: "artieBubbleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        boxShadow: "0 12px 32px -8px rgba(57,123,156,0.2), 0 4px 12px -2px rgba(0,0,0,0.06)",
                    }}>
                        {spontaneousPhrase}
                        {/* Triángulo Inferior */}
                        <div style={{
                            position: "absolute", bottom: -9, right: 28,
                            width: 18, height: 18,
                            background: "white",
                            borderBottom: `1px solid rgba(57,123,156,0.05)`,
                            borderRight: `1px solid rgba(57,123,156,0.05)`,
                            transform: "rotate(45deg) skew(5deg, 5deg)",
                            boxShadow: "4px 4px 8px -4px rgba(57,123,156,0.1)",
                        }} />
                    </div>
                )}

                <ArtiePanel 
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onReset={handleResetConversation}
                    animator={animator}
                    messages={messages}
                    isLoading={isLoading} 
                    isHistoryLoading={isHistoryLoading}
                    isResetting={isResetting}
                    isMobileViewport={isMobileViewport}
                    inputValue={inputValue}
                    onInputChange={(e) => setInputValue(e.target.value)}
                    onSend={() => handleSend()}
                    onQuickAction={(action) => handleSend(action)}
                />

                <ArtieAvatar 
                    isOpen={isOpen}
                    onClick={toggleOpen}
                    animator={animator}
                    size={avatarSize}
                />
            </div>
        </React.Fragment>
    );
}
