import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

const ConfirmContext = createContext(null);

const VARIANTS = {
    danger: {
        Icon: AlertTriangle,
        iconColor: '#dc2626',
        iconColorDark: '#f87171',
        btnBg: 'linear-gradient(135deg,#dc2626,#b91c1c)',
    },
    warning: {
        Icon: AlertTriangle,
        iconColor: '#d97706',
        iconColorDark: '#fbbf24',
        btnBg: 'linear-gradient(135deg,#d97706,#b45309)',
    },
    info: {
        Icon: Info,
        iconColor: '#2563eb',
        iconColorDark: '#60a5fa',
        btnBg: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    },
    default: {
        Icon: HelpCircle,
        iconColor: '#397B9C',
        iconColorDark: '#49949C',
        btnBg: 'linear-gradient(135deg,#397B9C,#2e6480)',
    },
};

function ConfirmModal({ dialog, onConfirm, onCancel }) {
    const { isDark } = useTheme();
    const [phase, setPhase] = useState(0); // 0=invisible, 1=visible
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 640);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 640px)');
        const handler = (e) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        setIsDesktop(mq.matches);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const id = requestAnimationFrame(() => setPhase(1));
        return () => cancelAnimationFrame(id);
    }, []);

    const v = VARIANTS[dialog.variant || 'danger'];
    const { Icon } = v;
    const iconColor = isDark ? v.iconColorDark : v.iconColor;
    const iconBg = `${iconColor}22`;

    const cardBg    = isDark ? '#161f2e' : '#ffffff';
    const border    = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const titleClr  = isDark ? '#f1f5f9' : '#0f172a';
    const msgClr    = isDark ? '#94a3b8' : '#64748b';
    const cancelBrd = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';
    const cancelClr = isDark ? '#94a3b8' : '#475569';
    const cancelHov = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9';

    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: isDesktop ? '16px' : '0',
        opacity: phase === 1 ? 1 : 0,
        transition: 'opacity 180ms ease',
    };

    const cardStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        background: cardBg,
        border: `1.5px solid ${border}`,
        borderRadius: isDesktop ? '20px' : '20px 20px 0 0',
        padding: '28px 24px 32px',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.3)',
        transform: phase === 1
            ? 'translateY(0) scale(1)'
            : isDesktop ? 'scale(0.95)' : 'translateY(60px)',
        transition: 'transform 240ms cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'inherit',
    };

    return (
        <div style={overlayStyle}>
            {/* Backdrop */}
            <div
                onClick={onCancel}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                }}
            />

            {/* Card */}
            <div style={cardStyle}>
                {/* Drag handle — mobile only */}
                {!isDesktop && (
                    <div style={{
                        width: 36, height: 4, borderRadius: 2,
                        background: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
                        margin: '0 auto 20px',
                    }} />
                )}

                {/* Icon badge */}
                <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                }}>
                    <Icon size={22} color={iconColor} strokeWidth={2.2} />
                </div>

                {dialog.title && (
                    <p style={{ fontWeight: 800, fontSize: 16, color: titleClr, marginBottom: 6, lineHeight: 1.3 }}>
                        {dialog.title}
                    </p>
                )}

                <p style={{ fontSize: 14, color: msgClr, marginBottom: 24, lineHeight: 1.6 }}>
                    {dialog.message}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <ConfirmBtn
                        onClick={onConfirm}
                        bg={v.btnBg}
                        label={dialog.confirmLabel || 'Confirmar'}
                    />
                    <CancelBtn
                        onClick={onCancel}
                        border={cancelBrd}
                        color={cancelClr}
                        hoverBg={cancelHov}
                        label={dialog.cancelLabel || 'Cancelar'}
                    />
                </div>
            </div>
        </div>
    );
}

function ConfirmBtn({ onClick, bg, label }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: '100%', padding: '13px 16px',
                borderRadius: 13, border: 'none',
                background: bg,
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
                opacity: hov ? 0.88 : 1,
                transition: 'opacity 140ms',
            }}
        >
            {label}
        </button>
    );
}

function CancelBtn({ onClick, border, color, hoverBg, label }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: '100%', padding: '12px 16px',
                borderRadius: 13, border: `1.5px solid ${border}`,
                background: hov ? hoverBg : 'transparent',
                color, fontWeight: 600, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 140ms',
            }}
        >
            {label}
        </button>
    );
}

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    const confirmDialog = useCallback((messageOrOptions, onConfirmCallback) => {
        if (typeof messageOrOptions === 'string') {
            setDialog({ message: messageOrOptions, onConfirm: onConfirmCallback, variant: 'danger' });
        } else {
            setDialog(messageOrOptions);
        }
    }, []);

    const handleConfirm = useCallback(() => {
        const fn = dialog?.onConfirm;
        setDialog(null);
        fn?.();
    }, [dialog]);

    const handleCancel = useCallback(() => {
        dialog?.onCancel?.();
        setDialog(null);
    }, [dialog]);

    useEffect(() => {
        if (!dialog) { return; }
        const handleKey = (e) => { if (e.key === 'Escape') { handleCancel(); } };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dialog, handleCancel]);

    return (
        <ConfirmContext.Provider value={confirmDialog}>
            {children}
            {dialog && (
                <ConfirmModal
                    dialog={dialog}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
}

export const useConfirm = () => useContext(ConfirmContext);
