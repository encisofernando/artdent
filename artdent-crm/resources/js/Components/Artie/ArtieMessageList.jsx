import React, { useEffect, useRef } from 'react';
import { ArtieTokens as B } from '../../config/artieConfig';

function TypingDots() {
    return (
        <div style={{ 
            display: "flex", gap: 5, padding: "12px 16px", 
            background: B.pale, borderRadius: "16px 16px 16px 4px", 
            width: "fit-content", boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
        }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: B.teal,
                    animation: `artieDotBounce 0.9s ease ${i * 0.18}s infinite`,
                }} />
            ))}
        </div>
    );
}

export default function ArtieMessageList({ messages, isLoading, isHistoryLoading }) {
    const listRef = useRef(null);

    // Scroll elegante hacia abajo
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading, isHistoryLoading]);

    // Procesador de markdown simplificado (Soporta **negrita** y saltos de línea)
    const renderInlineContent = (text) => {
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    const formatMessage = (text) => {
        if (!text) return null;
        const blocks = [];
        let bulletItems = [];

        const flushBullets = (keyIdx) => {
            if (bulletItems.length > 0) {
                blocks.push(
                    <ul key={`list-${keyIdx}`} className="list-disc pl-5 my-1 space-y-1">
                        {bulletItems.map((item, i) => <li key={i}>{renderInlineContent(item)}</li>)}
                    </ul>
                );
                bulletItems = [];
            }
        };

        text.split('\n').forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed === '') {
                flushBullets(index);
                blocks.push(<div key={`spc-${index}`} className="h-2" />);
                return;
            }
            if (/^[*-]\s+/.test(trimmed)) {
                bulletItems.push(trimmed.replace(/^[*-]\s+/, ''));
                return;
            }
            flushBullets(index);
            blocks.push(
                <div key={`p-${index}`} className="mb-1 leading-relaxed">
                    {renderInlineContent(trimmed)}
                </div>
            );
        });
        flushBullets('end');
        return blocks;
    };

    return (
        <div 
            ref={listRef}
            className="flex-1 overflow-y-auto w-full flex flex-col gap-3 p-4 bg-transparent"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${B.light} transparent` }}
        >
            {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                    <div key={i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                            <div className="w-7 h-7 rounded-full shrink-0 mr-2 flex items-center justify-center shadow-sm" style={{ background: B.blue, alignSelf: "flex-end", marginBottom: "2px" }}>
                                <svg width="14" height="14" viewBox="0 0 100 112" fill="white">
                                    <rect x="12" y="4" width="76" height="94" rx="38" fill="white" fillOpacity="0.9"/>
                                    <g transform="translate(50,68)">
                                        <path d="M-10,0 C-10,-6 -3,-6 0,0 C3,6 10,6 10,0 C10,-6 3,-6 0,0 C-3,6 -10,6 -10,0 Z" fill={B.teal} />
                                    </g>
                                </svg>
                            </div>
                        )}
                        <div 
                            className="max-w-[80%] px-3.5 py-2.5 text-[13.5px] shadow-sm transition-all duration-300 transform translate-y-0 opacity-100"
                            style={{
                                borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                background: isUser ? B.blue : 'white',
                                color: isUser ? "white" : B.dark,
                                border: isUser ? 'none' : `1px solid ${B.pale}`,
                                animation: "artieFloatIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}
                        >
                            {typeof msg.content === 'string' ? formatMessage(msg.content) : msg.content}
                        </div>
                    </div>
                );
            })}
            
            {(isLoading || isHistoryLoading) && (
                <div className="flex w-full justify-start mt-1 mb-2">
                    <div className="w-7 h-7 rounded-full shrink-0 mr-2 flex items-center justify-center shadow-sm" style={{ background: B.blue, alignSelf: "flex-end", marginBottom: "2px" }}>
                        <svg width="14" height="14" viewBox="0 0 100 112" fill="white">
                            <rect x="12" y="4" width="76" height="94" rx="38" fill="white" fillOpacity="0.9"/>
                        </svg>
                    </div>
                    <TypingDots />
                </div>
            )}
        </div>
    );
}
