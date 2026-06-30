import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let _toastId = 0;

const STYLES = {
    success: { bg: '#16a34a', icon: CheckCircle },
    error:   { bg: '#dc2626', icon: AlertCircle },
    warning: { bg: '#d97706', icon: AlertTriangle },
    info:    { bg: '#2563eb', icon: Info },
};

function ToastItem({ item, onRemove }) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    const { bg, icon: Icon } = STYLES[item.variant] || STYLES.info;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        if (item.duration > 0) {
            timerRef.current = setTimeout(() => dismiss(), item.duration);
        }
        return () => clearTimeout(timerRef.current);
    }, []);

    const dismiss = () => {
        setVisible(false);
        setTimeout(() => onRemove(item.id), 280);
    };

    return (
        <div
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px',
                background: bg,
                borderRadius: 14,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                minWidth: 260, maxWidth: 360,
                color: '#fff',
                fontFamily: 'inherit',
                transition: 'opacity 280ms ease, transform 280ms cubic-bezier(0.34,1.56,0.64,1)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.96)',
                willChange: 'opacity, transform',
            }}
        >
            <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} strokeWidth={2.3} />
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1, lineHeight: 1.5 }}>
                {item.message}
            </span>
            <button
                onClick={dismiss}
                style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)',
                    cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0,
                    marginTop: 1,
                }}
            >
                <X size={13} strokeWidth={2.5} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, variant = 'info', duration = 4500) => {
        const id = ++_toastId;
        setToasts(prev => [...prev, { id, message, variant, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, d) => addToast(msg, 'success', d),
        error:   (msg, d) => addToast(msg, 'error', d ?? 6000),
        warning: (msg, d) => addToast(msg, 'warning', d),
        info:    (msg, d) => addToast(msg, 'info', d),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                style={{
                    position: 'fixed', top: 16, right: 16,
                    zIndex: 9998,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    pointerEvents: 'none',
                    maxWidth: 'calc(100vw - 32px)',
                }}
            >
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: 'auto' }}>
                        <ToastItem item={t} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
