import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePage } from '@inertiajs/react';
import axios from 'axios';

// ─── Brand tokens ──────────────────────────────────────────────────────────
const B = {
  blue:   "#397b9c",
  teal:   "#5aad9c",
  light:  "#acd6ce",
  pale:   "#daeee9",
  dark:   "#2d5a72",
  blueDark: "#2c6180",
};

// ─── Frases espontáneas ────────────────────────────────────────────────────
const PHRASES = [
  "¿Cómo va el laboratorio hoy? 😊",
  "Recordá registrar los trabajos del día",
  "¿Necesitás generar una nueva venta?",
  "¡Aquí para lo que necesites!",
  "¿Alguna consulta sobre los clientes?",
  "No olvides revisar los trabajos pendientes",
];

// ─── Mascot SVG ────────────────────────────────────────────────────────────
function MascotSVG({ size = 80, blinking = false, talking = false, waving = false }) {
  const eyeRy = blinking ? 0.8 : 5;
  return (
    <svg width={size} height={size} viewBox="0 0 100 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="50" cy="108" rx="22" ry="4" fill="rgba(57,123,156,0.18)" />

      {/* Body oval — matches ArtDent icon shape */}
      <rect x="12" y="4" width="76" height="94" rx="38" fill={B.blue} />

      {/* Inner highlight */}
      <rect x="22" y="14" width="56" height="74" rx="28" fill="white" fillOpacity="0.08" />

      {/* Left arm (waving animation handled via CSS) */}
      <g className={waving ? "arm-wave" : ""} style={{ transformOrigin: "28px 72px" }}>
        <ellipse cx="16" cy="76" rx="7" ry="10" rx2="5" fill={B.blue} transform="rotate(-20 16 76)" />
        {/* small hand */}
        <circle cx="10" cy="83" r="5" fill={B.teal} />
      </g>

      {/* Right arm */}
      <ellipse cx="84" cy="76" rx="7" ry="10" fill={B.blue} transform="rotate(20 84 76)" />
      <circle cx="90" cy="83" r="5" fill={B.teal} />

      {/* Eyes */}
      <ellipse cx="37" cy="42" rx="6" ry={eyeRy} fill="white" />
      <ellipse cx="63" cy="42" rx="6" ry={eyeRy} fill="white" />
      {!blinking && (
        <React.Fragment>
          <circle cx="38.5" cy="43" r="3" fill={B.dark} />
          <circle cx="64.5" cy="43" r="3" fill={B.dark} />
          {/* Eye shine */}
          <circle cx="40" cy="41.5" r="1.2" fill="white" />
          <circle cx="66" cy="41.5" r="1.2" fill="white" />
        </React.Fragment>
      )}

      {/* Eyebrows */}
      <path d="M31 34 Q37 30 43 33" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M57 33 Q63 30 69 34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />

      {/* Mouth */}
      {talking ? (
        <ellipse cx="50" cy="68" rx="12" ry="9" fill={B.teal} />
      ) : (
        <g transform="translate(50,68)">
          <path
            d="M-14,0 C-14,-9 -5,-9 0,0 C5,9 14,9 14,0 C14,-9 5,-9 0,0 C-5,9 -14,9 -14,0 Z"
            fill={B.teal}
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Mejillas */}
      <ellipse cx="28" cy="58" rx="7" ry="5" fill="white" fillOpacity="0.15" />
      <ellipse cx="72" cy="58" rx="7" ry="5" fill="white" fillOpacity="0.15" />
    </svg>
  );
}

// ─── Dot typing indicator ──────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: B.pale, borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: B.teal,
          animation: `artDotBounce 0.9s ease ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Helper de mensajes originales ─────────────────────────────────────────
const FALLBACK_WELCOME_MESSAGE = '¡Hola! Soy **Artie**, tu asistente de **Artdent CRM**. 👋 ¿En qué te puedo ayudar hoy?';
const buildDefaultMessages = (welcomeMessage) => ([
    { role: 'assistant', content: welcomeMessage || FALLBACK_WELCOME_MESSAGE }
]);

// ─── Component principal ───────────────────────────────────────────────────
export default function Chatbot() {
  const { chatbot } = usePage().props;

  const [open, setOpen]           = useState(false);
  const [phrase, setPhrase]       = useState(null);
  const [blinking, setBlinking]   = useState(false);
  const [talking, setTalking]     = useState(false);
  const [waving, setWaving]       = useState(false);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  
  const [messages, setMessages]   = useState(() => buildDefaultMessages(chatbot?.welcome_message));
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [hasAttemptedHistoryLoad, setHasAttemptedHistoryLoad] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const chatEndRef   = useRef(null);
  const phraseRef    = useRef(null);
  const blinkRef     = useRef(null);

  // ── Carga de historial ──────────────────────────────────────────────────
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

  useEffect(() => {
    if (!chatbot?.enabled || !open || hasLoadedHistory || hasAttemptedHistoryLoad || isHistoryLoading) {
        return;
    }
    loadHistory();
  }, [chatbot?.enabled, hasAttemptedHistoryLoad, hasLoadedHistory, isHistoryLoading, open]);

  // ── Frases espontáneas ──────────────────────────────────────────────────
  useEffect(() => {
    const schedule = () => {
      const delay = 7000 + Math.random() * 13000;
      phraseRef.current = setTimeout(() => {
        if (!open) {
          const p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
          setPhrase(p);
          setTalking(true);
          setWaving(true);
          setTimeout(() => { setPhrase(null); setTalking(false); setWaving(false); }, 4500);
        }
        schedule();
      }, delay);
    };
    phraseRef.current = setTimeout(schedule, 4000);
    return () => clearTimeout(phraseRef.current);
  }, [open]);

  // ── Parpadeo ────────────────────────────────────────────────────────────
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
      blinkRef.current = setTimeout(blink, 2200 + Math.random() * 2800);
    };
    blinkRef.current = setTimeout(blink, 1200);
    return () => clearTimeout(blinkRef.current);
  }, []);

  // ── Scroll al fondo ─────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isHistoryLoading]);

  // ── Formateo de mensajes (del original) ─────────────────────────────────
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
          if (bulletItems.length === 0) return;
          blocks.push(
              <ul key={`list-${keySuffix}`} style={{ paddingLeft: 20, margin: "4px 0" }}>
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
              blocks.push(<div key={`space-${index}`} style={{ height: 6 }} />);
              return;
          }
          if (/^[*-]\s+/.test(line)) {
              bulletItems.push(line.replace(/^[*-]\s+/, ''));
              return;
          }

          flushBulletItems(index);
          blocks.push(
              <div key={`paragraph-${index}`} style={{ marginBottom: 4 }}>
                  {renderInlineContent(line)}
              </div>
          );
      });

      flushBulletItems('end');
      return blocks;
  };

  // ── Enviar mensaje ──────────────────────────────────────────────────────
  const send = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading || isHistoryLoading) return;
    
    setInput("");
    
    let baseMessages = messages;
    if (!hasLoadedHistory) {
        if (!hasAttemptedHistoryLoad) setHasAttemptedHistoryLoad(true);
        const loadedMessages = await loadHistory();
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            baseMessages = loadedMessages;
        }
    }

    const userMessage = { role: "user", content: trimmedInput };
    const optimisticMessages = [...baseMessages, userMessage];
    
    setMessages(optimisticMessages);
    setLoading(true);
    setTalking(true);

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
              content: error.response?.data?.message || 'Hubo un error de conexión. Intentá de nuevo.'
          }
      ]);
    }

    setLoading(false);
    setTalking(false);
  }, [input, loading, messages, isHistoryLoading, hasLoadedHistory, hasAttemptedHistoryLoad]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const openChat = () => {
    if (!open && hasAttemptedHistoryLoad && !hasLoadedHistory) {
        setHasAttemptedHistoryLoad(false);
    }
    setOpen(o => !o);
    setPhrase(null);
    setTalking(false);
    setWaving(false);
  };

  if (chatbot?.enabled === false) {
      return null;
  }

  return (
    <React.Fragment>
      {/* ── Estilos globales ────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        .artdent-mascot * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; }

        @keyframes artFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30%       { transform: translateY(-10px) rotate(-1.5deg); }
          70%       { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes artBubbleIn {
          from { opacity: 0; transform: scale(0.7) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes artPanelIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes artDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-7px); }
        }
        @keyframes artPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(57,123,156,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(57,123,156,0); }
        }
        .arm-wave {
          animation: armWave 0.5s ease-in-out infinite alternate;
          transform-origin: 28px 72px;
        }
        @keyframes armWave {
          from { transform: rotate(-5deg); }
          to   { transform: rotate(20deg); }
        }
        .artdent-avatar {
          animation: artFloat 3.4s ease-in-out infinite;
          cursor: pointer;
          filter: drop-shadow(0 8px 16px rgba(57,123,156,0.35));
          transition: filter 0.2s;
        }
        .artdent-avatar:hover {
          filter: drop-shadow(0 10px 22px rgba(57,123,156,0.5));
        }
        .artdent-msg-input:focus { outline: none; border-color: ${B.teal} !important; }
        .artdent-send-btn:hover  { background: ${B.teal} !important; }
        .artdent-send-btn:active { transform: scale(0.94); }

        .artdent-messages::-webkit-scrollbar       { width: 4px; }
        .artdent-messages::-webkit-scrollbar-track  { background: transparent; }
        .artdent-messages::-webkit-scrollbar-thumb  { background: ${B.light}; border-radius: 4px; }
      `}</style>

      <div className="artdent-mascot" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999 }}>

        {/* ── Burbuja de frase espontánea ──────────────────────────────── */}
        {phrase && !open && (
          <div style={{
            position: "absolute", bottom: 96, right: 14,
            background: "white",
            border: `2px solid ${B.blue}`,
            borderRadius: 14,
            padding: "10px 14px",
            maxWidth: 220,
            fontSize: 12,
            fontWeight: 500,
            color: B.dark,
            lineHeight: 1.5,
            animation: "artBubbleIn 0.35s cubic-bezier(.34,1.56,.64,1)",
            boxShadow: "0 6px 24px rgba(57,123,156,0.2)",
          }}>
            {phrase}
            <div style={{
              position: "absolute", bottom: -11, right: 28,
              width: 0, height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderTop: `11px solid ${B.blue}`,
            }} />
            <div style={{
              position: "absolute", bottom: -8, right: 29,
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid white",
            }} />
          </div>
        )}

        {/* ── Panel de chat ─────────────────────────────────────────────── */}
        {open && (
          <div style={{
            position: "absolute",
            bottom: 96, right: 0,
            width: 330,
            height: 460,
            background: "white",
            borderRadius: 22,
            border: `2px solid ${B.blue}`,
            boxShadow: "0 12px 48px rgba(57,123,156,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "artPanelIn 0.3s cubic-bezier(.34,1.28,.64,1)",
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${B.blue} 0%, ${B.teal} 100%)`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{ flexShrink: 0 }}>
                <MascotSVG size={42} blinking={blinking} talking={talking} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>Artie</div>
                <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 11 }}>Asistente ArtDent · {(loading || isHistoryLoading) ? "escribiendo..." : "en línea"}</div>
              </div>
              <button
                onClick={openChat}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30, height: 30,
                  cursor: "pointer",
                  color: "white",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            <div
              className="artdent-messages"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: B.blue,
                      flexShrink: 0,
                      marginRight: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      alignSelf: "flex-end",
                      marginBottom: 2,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 100 112" fill="white">
                        <rect x="12" y="4" width="76" height="94" rx="38" fill="white" fillOpacity="0.9"/>
                        <g transform="translate(50,68)">
                          <path d="M-10,0 C-10,-6 -3,-6 0,0 C3,6 10,6 10,0 C10,-6 3,-6 0,0 C-3,6 -10,6 -10,0 Z" fill={B.teal} />
                        </g>
                      </svg>
                    </div>
                  )}
                  <div style={{
                    maxWidth: "76%",
                    padding: "9px 13px",
                    borderRadius: msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    background: msg.role === "user" ? B.blue : B.pale,
                    color: msg.role === "user" ? "white" : B.dark,
                    fontSize: 13,
                    lineHeight: 1.55,
                    fontWeight: 400,
                  }}>
                    {typeof msg.content === 'string' ? formatMessage(msg.content) : msg.content}
                  </div>
                </div>
              ))}

              {(loading || isHistoryLoading) && <TypingDots />}
              <div ref={chatEndRef} />
            </div>

            <div style={{
              padding: "10px 12px",
              borderTop: `1px solid ${B.pale}`,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              <input
                className="artdent-msg-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={isHistoryLoading ? 'Cargando conversación...' : 'Escribí tu consulta...'}
                style={{
                  flex: 1,
                  border: `1.5px solid ${B.light}`,
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: B.dark,
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                disabled={loading || isHistoryLoading}
              />
              <button
                className="artdent-send-btn"
                onClick={send}
                disabled={loading || isHistoryLoading || !input.trim()}
                style={{
                  background: B.blue,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  width: 38, height: 38,
                  cursor: loading || isHistoryLoading || !input.trim() ? "default" : "pointer",
                  opacity: loading || isHistoryLoading || !input.trim() ? 0.55 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  transition: "background 0.2s, transform 0.1s",
                  flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>

            <div style={{
              textAlign: "center",
              fontSize: 10,
              color: B.light,
              padding: "4px 0 8px",
              letterSpacing: 0.3,
            }}>
              ArtDent · Laboratorio Odontológico
            </div>
          </div>
        )}

        <div
          className="artdent-avatar"
          onClick={openChat}
          style={{
            animation: open ? "none" : "artFloat 3.4s ease-in-out infinite",
            ...(open && { filter: "drop-shadow(0 4px 12px rgba(57,123,156,0.4))" }),
          }}
          title="Hablar con Artie"
        >
          <MascotSVG
            size={82}
            blinking={blinking}
            talking={talking}
            waving={waving}
          />
          {!open && (
            <div style={{
              position: "absolute",
              top: 4, right: 2,
              width: 14, height: 14,
              background: B.teal,
              borderRadius: "50%",
              border: "2.5px solid white",
              animation: "artPulse 2s ease-in-out infinite",
            }} />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
