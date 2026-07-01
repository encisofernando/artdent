import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { 
    MessageSquare, Plus, Send, Bot, User, 
    History, Sparkles
} from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { artieService } from '@/Services/artieService';
import './Assistant.css';

export default function Assistant() {
    const { chatbot } = usePage().props;
    const { isDark } = useTheme();
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (activeId) {
            loadHistory(activeId);
        } else {
            setMessages(artieService.buildWelcomeMessages(chatbot?.welcome_message));
        }
    }, [activeId, chatbot?.welcome_message]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const loadConversations = async () => {
        setIsHistoryLoading(true);
        const nextConversations = await artieService.loadConversations();
        setConversations(nextConversations);
        setIsHistoryLoading(false);
    };

    const loadHistory = async (id) => {
        setIsLoading(true);
        const response = await artieService.loadHistory(chatbot?.enabled !== false, chatbot?.welcome_message, id);
        setMessages(response.messages);
        setActiveId(response.conversationId ?? id);
        setIsLoading(false);
    };

    const handleNewChat = async () => {
        setIsLoading(true);
        const response = await artieService.resetConversation(chatbot?.welcome_message);
        setActiveId(response.conversationId);
        setMessages(response.messages);
        await loadConversations();
        setIsLoading(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const response = await artieService.sendMessage({
            messageText: userMessage.content,
            conversationId: activeId,
        });

        if (response.success) {
            setMessages(response.messages);

            if (response.conversationId && response.conversationId !== activeId) {
                setActiveId(response.conversationId);
            }

            await loadConversations();
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error al procesar mensaje.' }]);
        }

        setIsLoading(false);
    };

    const formatMessage = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) => 
                    part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={j}>{part.slice(2, -2)}</strong> 
                        : part
                )}
            </p>
        ));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Asistente Artie IA" />

            <div className={`assistant-layout ${isDark ? 'dark' : ''}`}>
                {/* Sidebar de Historial */}
                <div className={`assistant-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                    <button 
                        className="new-chat-btn"
                        onClick={handleNewChat}
                        disabled={isLoading}
                    >
                        <Plus size={18} />
                        <span>Nueva Conversación</span>
                    </button>

                    <div className="history-list">
                        <div className="history-label">
                            <History size={14} />
                            Recientes
                        </div>
                        {isHistoryLoading ? (
                            <div className="px-4 py-2 opacity-50 text-xs">Cargando...</div>
                        ) : conversations.length === 0 ? (
                            <div className="px-4 py-2 opacity-30 text-xs italic">Sin historial</div>
                        ) : conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`history-item ${activeId === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveId(conv.id)}
                            >
                                <MessageSquare size={16} />
                                <span className="truncate">{conv.title || 'Conversación'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Área de Chat Principal */}
                <div className="assistant-main">
                    <div className="assistant-content">
                        {messages.length === 0 && !isLoading && (
                            <div className="welcome-hero">
                                <div className="hero-icon">
                                    <Sparkles size={48} className="text-emerald-500" />
                                </div>
                                <h1>¿En qué puedo ayudarte hoy?</h1>
                                <p>Consulta cualquier dato del CRM, desde ventas hasta stock de laboratorio.</p>
                                <div className="suggestion-grid">
                                    <button onClick={() => setInput('¿Cuáles son las ventas de este mes?')}>Ventas del mes</button>
                                    <button onClick={() => setInput('¿Qué trabajos de laboratorio hay pendientes?')}>Trabajos pendientes</button>
                                    <button onClick={() => setInput('¿Cuál es el saldo de Carlos Consiglio?')}>Saldos de hoy</button>
                                </div>
                            </div>
                        )}

                        <div className="messages-container">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.role}`}>
                                    <div className="message-avatar">
                                        {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                                    </div>
                                    <div className="message-bubble">
                                        <div className="message-role">
                                            {msg.role === 'assistant' ? 'Artie' : 'Tú'}
                                        </div>
                                        <div className="message-text">
                                            {formatMessage(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="chat-message assistant">
                                    <div className="message-avatar"><Bot size={20} /></div>
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="assistant-input-area">
                        <div className="input-box">
                            <textarea 
                                rows="1"
                                placeholder="Escribe un mensaje..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button 
                                className="send-btn"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="input-footer">
                            Artie puede cometer errores. Considera verificar la información importante.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
