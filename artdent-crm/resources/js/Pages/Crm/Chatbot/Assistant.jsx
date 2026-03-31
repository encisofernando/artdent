import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    MessageSquare, Plus, Send, Bot, User, 
    Clock, History, Sparkles, MoreVertical, 
    Trash2, Search
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '@/Contexts/ThemeContext';
import './Assistant.css';

export default function Assistant({ auth }) {
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
            setMessages([
                { role: 'assistant', content: '¡Hola! Soy **Artie**, tu asistente de Artdent. ¿Cómo puedo ayudarte hoy con el CRM?' }
            ]);
        }
    }, [activeId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const loadConversations = async () => {
        try {
            const response = await axios.get(route('api.chatbot.index'));
            setConversations(response.data.conversations || []);
            setIsHistoryLoading(false);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setIsHistoryLoading(false);
        }
    };

    const loadHistory = async (id) => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('api.chatbot.history', { id }));
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(route('api.chatbot.reset'));
            const newConv = {
                id: response.data.conversation_id,
                title: 'Nueva Conversación',
                last_message_at: new Date().toISOString()
            };
            setConversations([newConv, ...conversations]);
            setActiveId(newConv.id);
            setMessages([]);
        } catch (error) {
            console.error('Error creating new chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(route('api.chatbot'), {
                message: userMessage.content,
                conversation_id: activeId
            });

            if (!activeId && response.data.conversation_id) {
                setActiveId(response.data.conversation_id);
                loadConversations();
            }

            setMessages(response.data.messages);
            
            // Si el titulo de la conversacion activa cambio (ej. de 'Nueva Conversacion' a algo real)
            if (activeId) {
                const currentConv = conversations.find(c => c.id === activeId);
                if (currentConv && currentConv.title === 'Nueva Conversación') {
                    loadConversations();
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error al procesar mensaje.' }]);
        } finally {
            setIsLoading(false);
        }
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
                                            {msg.role === 'assistant' ? 'Artie AI' : 'Tú'}
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
