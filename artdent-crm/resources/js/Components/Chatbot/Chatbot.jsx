import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Send, Bot, Sparkles, RotateCcw } from 'lucide-react';
import axios from 'axios';
import './Chatbot.css';
import { useTheme } from '@/Contexts/ThemeContext';

const FALLBACK_WELCOME_MESSAGE = '¡Hola! Soy **Artie**, tu asistente inteligente de **Artdent CRM**. 👋 Estoy aquí para ayudarte con ventas, laboratorio, stock y navegación del sistema. ¿En qué te doy una mano?';

const buildDefaultMessages = (welcomeMessage) => ([
    { role: 'assistant', content: welcomeMessage || FALLBACK_WELCOME_MESSAGE }
]);

const providerLabels = {
    openai: 'OpenAI',
    gemini: 'Gemini',
};

export default function Chatbot() {
    const { isDark } = useTheme();
    const { chatbot } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => buildDefaultMessages(chatbot?.welcome_message));
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const [hasAttemptedHistoryLoad, setHasAttemptedHistoryLoad] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isLoading, isHistoryLoading]);

    useEffect(() => {
        if (!chatbot?.enabled || !isOpen || hasLoadedHistory || hasAttemptedHistoryLoad || isHistoryLoading) {
            return;
        }

        loadHistory();
    }, [chatbot?.enabled, hasAttemptedHistoryLoad, hasLoadedHistory, isHistoryLoading, isOpen]);

    const renderInlineContent = (text) => {
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }

            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    const formatMessage = (text) => {
        if (!text) return null;

        const blocks = [];
        let bulletItems = [];

        const flushBulletItems = (keySuffix) => {
            if (bulletItems.length === 0) {
                return;
            }

            blocks.push(
                <ul key={`list-${keySuffix}`} className="message-list">
                    {bulletItems.map((item, index) => (
                        <li key={`item-${keySuffix}-${index}`}>{renderInlineContent(item)}</li>
                    ))}
                </ul>
            );

            bulletItems = [];
        };

        text.split('\n').forEach((rawLine, index) => {
            const line = rawLine.trim();

            if (line === '') {
                flushBulletItems(index);
                blocks.push(<div key={`space-${index}`} className="message-spacer" />);
                return;
            }

            if (/^[*-]\s+/.test(line)) {
                bulletItems.push(line.replace(/^[*-]\s+/, ''));
                return;
            }

            flushBulletItems(index);
            blocks.push(
                <p key={`paragraph-${index}`} className="message-paragraph">
                    {renderInlineContent(line)}
                </p>
            );
        });

        flushBulletItems('end');

        return blocks;
    };

    const loadHistory = async (force = false) => {
        if (!chatbot?.enabled) return buildDefaultMessages(chatbot?.welcome_message);
        if ((hasAttemptedHistoryLoad || isHistoryLoading) && !force) return messages;

        setHasAttemptedHistoryLoad(true);
        setIsHistoryLoading(true);

        try {
            const response = await axios.get(route('api.chatbot.history'));
            const remoteMessages = response.data.messages || [];
            const welcomeMessage = response.data.meta?.welcome_message || chatbot?.welcome_message;
            const nextMessages = remoteMessages.length > 0 ? remoteMessages : buildDefaultMessages(welcomeMessage);

            setMessages(nextMessages);
            setHasLoadedHistory(true);
            return nextMessages;
        } catch (error) {
            console.error('Chatbot history error:', error);
            const fallbackMessages = buildDefaultMessages(chatbot?.welcome_message);

            if (!hasLoadedHistory) {
                setMessages(fallbackMessages);
            }

            return fallbackMessages;
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleSend = async () => {
        const trimmedInput = input.trim();

        if (!trimmedInput || isLoading || isHistoryLoading || isResetting) return;

        let baseMessages = messages;

        if (!hasLoadedHistory) {
            if (!hasAttemptedHistoryLoad) {
                setHasAttemptedHistoryLoad(true);
            }

            const loadedMessages = await loadHistory();

            if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
                baseMessages = loadedMessages;
            }
        }

        const userMessage = { role: 'user', content: trimmedInput };
        const optimisticMessages = [...baseMessages, userMessage];

        setMessages(optimisticMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(route('api.chatbot'), {
                message: trimmedInput,
            });

            setMessages(
                response.data.messages?.length
                    ? response.data.messages
                    : [...optimisticMessages, { role: 'assistant', content: response.data.message }]
            );
            setHasLoadedHistory(true);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: error.response?.data?.message || 'Lo siento, hubo un error al procesar tu consulta. Revisá la configuración del chatbot e intentá nuevamente.'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetConversation = async () => {
        if (isResetting) return;

        setIsResetting(true);

        try {
            const response = await axios.delete(route('api.chatbot.reset'));
            const welcomeMessage = response.data.meta?.welcome_message || chatbot?.welcome_message;

            setMessages(buildDefaultMessages(welcomeMessage));
            setHasAttemptedHistoryLoad(true);
            setHasLoadedHistory(true);
        } catch (error) {
            console.error('Chatbot reset error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'No pude reiniciar la conversación en este momento.'
                }
            ]);
        } finally {
            setIsResetting(false);
        }
    };

    if (chatbot?.enabled === false) {
        return null;
    }

    const handleOpen = () => {
        if (!isOpen && hasAttemptedHistoryLoad && !hasLoadedHistory) {
            setHasAttemptedHistoryLoad(false);
        }

        setIsOpen(true);
    };

    return (
        <div className={`chatbot-container ${isDark ? 'dark-mode' : ''}`}>
            <div
                className={`chatbot-bubble ${isOpen ? 'open' : ''}`}
                onClick={handleOpen}
            >
                <Sparkles size={28} />
            </div>

            <div className={`chatbot-window ${!isOpen ? 'closed' : ''}`}>
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3>Artie Assistant</h3>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                En línea
                            </span>
                        </div>
                    </div>
                    <div className="chatbot-header-actions">
                        <button
                            type="button"
                            className="chatbot-icon-button"
                            onClick={handleResetConversation}
                            disabled={isResetting || isHistoryLoading}
                            title="Nuevo chat"
                        >
                            <RotateCcw size={16} className={isResetting ? 'spin' : ''} />
                        </button>
                        <button
                            type="button"
                            className="chatbot-icon-button"
                            onClick={() => setIsOpen(false)}
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-content">
                                {typeof msg.content === 'string' ? formatMessage(msg.content) : msg.content}
                            </div>
                        </div>
                    ))}
                    {(isLoading || isHistoryLoading) && (
                        <div className="message assistant">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbot-input-container">
                    <input
                        type="text"
                        className="chatbot-input"
                        placeholder={isHistoryLoading ? 'Cargando conversación...' : 'Pregunta algo sobre el CRM...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading || isHistoryLoading || isResetting}
                    />
                    <button
                        className="chatbot-send"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || isHistoryLoading || isResetting}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
