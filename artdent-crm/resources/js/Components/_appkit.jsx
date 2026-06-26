/**
 * _appkit.jsx
 * ─────────────────────────────────────────────────────────────
 * Design system compartido para ArtDent Laravel+Inertia.
 * Reemplaza MUI _shared.jsx + alpha() + sx props.
 *
 * USO:
 *   import { B, useD, Chip, Modal, BottomSheet, FAB, ... } from '@/Components/_appkit';
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── BRAND TOKENS ────────────────────────────────────────────
export const B = {
    blue: '#397B9C',
    green: '#5AAD9C',
    teal: '#49949C',
    mint: '#ACD6CE',
    soft: '#7CA5C3',
    light: '#DAE6F0',
    pale: '#DAEEE3',
    red: '#E63946',
};

// Gradient strings reutilizables
export const G = {
    primary: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
    success: `linear-gradient(135deg, ${B.green}, ${B.teal})`,
    horizontal: `linear-gradient(90deg, ${B.green}, ${B.teal})`,
    bar: `linear-gradient(90deg, ${B.blue}, ${B.teal}, ${B.green})`,
};

// ─── DARK/LIGHT COLOR HELPER ─────────────────────────────────
/**
 * useD(isDark) → objeto D con todos los tokens de color para light/dark.
 * Reemplaza el patrón isDark ? '...' : '...' repetido.
 */
export function useD(isDark) {
    return isDark
        ? {
            // Backgrounds — slate palette, consistent with app sidebar/layout
            bg: '#020617',        // slate-950
            surface: '#0f172a',   // slate-900
            card: '#1e293b',      // slate-800
            sidebar: '#0f172a',   // slate-900
            input: '#1e293b',     // slate-800
            hover: 'rgba(255,255,255,0.04)',
            // Borders
            border: 'rgba(148,163,184,0.12)',  // slate-400/12
            borderFocus: B.teal,
            divider: 'rgba(148,163,184,0.10)',
            // Text
            text: '#cbd5e1',      // slate-300
            muted: 'rgba(148,163,184,0.7)',    // slate-400
            label: 'rgba(148,163,184,0.6)',
            placeholder: 'rgba(148,163,184,0.35)',
            // Input border
            inputBorder: 'rgba(148,163,184,0.15)',
        }
        : {
            bg: '#DAE6F0',
            surface: '#EAF3F9',
            card: '#F2F8FC',
            sidebar: '#FFFFFF',
            input: '#EAF3F9',
            hover: 'rgba(57,123,156,0.07)',
            border: 'rgba(57,123,156,0.22)',
            borderFocus: B.teal,
            divider: 'rgba(57,123,156,0.14)',
            text: '#1e293b',
            muted: 'rgba(51,65,85,0.55)',
            label: 'rgba(51,65,85,0.65)',
            placeholder: 'rgba(51,65,85,0.35)',
            inputBorder: 'rgba(57,123,156,0.18)',
        };
}

// ─── UTILS ───────────────────────────────────────────────────
export const fmt = (n = 0) =>
    Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-AR') : '—';

export const toNumber = (v, fallback = 0) => {
    const n = Number(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
};

// ─── COMPONENTS ──────────────────────────────────────────────

/**
 * StatusChip — reemplaza MUI Chip para estados
 * usage: <StatusChip label="Activo" color={B.green} />
 */
export function StatusChip({ label, color = B.teal, size = 'sm' }) {
    const pad = size === 'xs' ? 'px-1.5 py-[1px] text-[9px]' : 'px-2 py-0.5 text-[10.5px]';
    return (
        <span
            className={`inline-flex items-center font-bold rounded-md border tracking-wide ${pad}`}
            style={{ color, background: `${color}22`, borderColor: `${color}44` }}
        >
            {label}
        </span>
    );
}

/**
 * Badge — número sobre ícono (estilo MUI Badge)
 */
export function Badge({ count, color = B.blue, children }) {
    return (
        <div className="relative inline-flex">
            {children}
            {count > 0 && (
                <span
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black text-white px-0.5 leading-none"
                    style={{ background: color, boxShadow: `0 2px 6px ${color}80` }}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </div>
    );
}

/**
 * SectionLabel — título de sección en formularios
 * Reemplaza el <SectionLabel> de _shared.jsx
 */
export function SectionLabel({ children, isDark }) {
    return (
        <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase mb-3"
            style={{ color: isDark ? `${B.mint}99` : `${B.blue}b3` }}>
            {children}
        </p>
    );
}

/**
 * Divider con etiqueta central
 */
export function LabelDivider({ label, D }) {
    return (
        <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px" style={{ background: D.divider }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: D.label }}>
                {label}
            </span>
            <div className="flex-1 h-px" style={{ background: D.divider }} />
        </div>
    );
}

/**
 * InputField — input con label integrado
 */
export function InputField({ label, error, D, className = '', ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                    style={{ color: D.label }}>
                    {label}
                </label>
            )}
            <input
                {...props}
                className="w-full outline-none"
                style={{
                    padding: '8px 11px',
                    borderRadius: 10,
                    border: `1.5px solid ${error ? B.red : D.inputBorder}`,
                    background: D.input,
                    color: D.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = error ? B.red : D.borderFocus}
                onBlur={e => e.target.style.borderColor = error ? B.red : D.inputBorder}
            />
            {error && <p className="text-[10px] mt-1 font-semibold" style={{ color: B.red }}>{error}</p>}
        </div>
    );
}

/**
 * SelectField — select con chevron custom
 */
export function SelectField({ label, error, D, className = '', children, ...props }) {
    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-[10px] font-bold uppercase tracking-[0.08em] mb-1"
                    style={{ color: D.label }}>
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    {...props}
                    className="w-full outline-none appearance-none cursor-pointer"
                    style={{
                        padding: '8px 30px 8px 11px',
                        borderRadius: 10,
                        border: `1.5px solid ${error ? B.red : D.inputBorder}`,
                        background: D.input,
                        color: D.text,
                        fontSize: 13,
                        fontFamily: 'inherit',
                    }}
                >
                    {children}
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke={D.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {error && <p className="text-[10px] mt-1 font-semibold" style={{ color: B.red }}>{error}</p>}
        </div>
    );
}

/**
 * Btn — botón base con variantes
 * variant: 'primary' | 'outline' | 'ghost' | 'danger'
 */
export function Btn({ children, variant = 'primary', size = 'md', disabled, style, className = '', ...props }) {
    const sizes = {
        xs: 'px-2.5 py-1 text-[11px] rounded-lg',
        sm: 'px-3.5 py-1.5 text-[12px] rounded-[10px]',
        md: 'px-4 py-2 text-[13px] rounded-[11px]',
        lg: 'px-6 py-3 text-[14px] rounded-[12px]',
    };
    const variants = {
        primary: { background: G.primary, color: '#fff', border: 'none', boxShadow: `0 4px 14px ${B.blue}44` },
        success: { background: G.success, color: '#fff', border: 'none', boxShadow: `0 4px 14px ${B.green}44` },
        outline: { background: 'transparent', color: B.blue, border: `1.5px solid ${B.blue}66` },
        ghost: { background: 'transparent', color: 'inherit', border: '1.5px solid transparent' },
        danger: { background: `${B.red}18`, color: B.red, border: `1.5px solid ${B.red}44` },
    };

    return (
        <button
            {...props}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 font-bold transition-all select-none
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-[0.97]'}
                ${sizes[size]} ${className}`}
            style={{ fontFamily: 'inherit', ...variants[variant], ...style }}
        >
            {children}
        </button>
    );
}

/**
 * FAB — Floating Action Button
 * Equivalente al Fab de MUI para mobile.
 */
export function FAB({ children, onClick, badge = 0, color = G.success, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-[76px] lg:bottom-6 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform ${className}`}
            style={{ background: color, boxShadow: `0 8px 24px ${B.green}55` }}
        >
            <Badge count={badge} color={B.blue}>
                {children}
            </Badge>
        </button>
    );
}

/**
 * BottomSheet — Drawer que sube desde abajo en mobile.
 * Reemplaza MUI Drawer anchor="bottom".
 *
 * Props:
 *   open, onClose, title, maxHeight='85vh', children
 */
export function BottomSheet({ open, onClose, title, maxHeight = '85vh', D, children }) {
    // Lock body scroll while open
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Backdrop — z-[55] cubre la BottomNav (z-50) */}
            <div
                className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sheet — z-[60] encima de todo */}
            <div
                className={`fixed inset-x-0 bottom-0 z-[60] flex flex-col transition-transform duration-300 ease-out lg:hidden
                    ${open ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight, borderRadius: '20px 20px 0 0', background: D?.sidebar || '#0D1B24' }}
            >
                {/* Drag handle */}
                <div className="flex flex-col items-center pt-3 pb-2 flex-shrink-0">
                    <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
                        style={{ borderBottom: `1px solid ${D?.divider || 'rgba(255,255,255,0.07)'}` }}>
                        <span className="font-extrabold text-[15px]" style={{ color: D?.text || '#E6EEF5' }}>
                            {title}
                        </span>
                        <button onClick={onClose} className="opacity-50 hover:opacity-100 p-1">
                            <X size={18} color={D?.text || '#E6EEF5'} />
                        </button>
                    </div>
                )}

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain styled-scrollbar pb-[env(safe-area-inset-bottom)]">
                    {children}
                </div>
            </div>
        </>
    );
}

/**
 * Modal — Dialog genérico centrado.
 * Reemplaza MUI Dialog.
 */
export function Modal({ open, onClose, title, maxWidth = 420, D, children, footer }) {
    const ref = useRef(null);

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                ref={ref}
                className="w-full flex flex-col overflow-hidden rounded-[16px] shadow-2xl"
                style={{
                    maxWidth,
                    background: D?.card || '#0F1F2A',
                    border: `1px solid ${D?.border || 'rgba(255,255,255,0.10)'}`,
                }}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-5 py-4"
                        style={{ borderBottom: `1px solid ${D?.divider || 'rgba(255,255,255,0.07)'}` }}>
                        <span className="font-extrabold text-[15px]" style={{ color: D?.text || '#E6EEF5' }}>
                            {title}
                        </span>
                        <button onClick={onClose} className="opacity-50 hover:opacity-100 p-1">
                            <X size={18} color={D?.text || '#E6EEF5'} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 styled-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-5 py-4 flex justify-end gap-3"
                        style={{ borderTop: `1px solid ${D?.divider || 'rgba(255,255,255,0.07)'}` }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * TabStrip — Tabs con indicador deslizante.
 * Reemplaza MUI Tabs.
 *
 * tabs: [{ id, label }]
 */
export function TabStrip({ tabs, value, onChange, D }) {
    return (
        <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: D.hover, border: `1px solid ${D.border}` }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                    style={{
                        background: value === tab.id ? (D.card) : 'transparent',
                        color: value === tab.id ? D.text : D.muted,
                        boxShadow: value === tab.id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/**
 * KpiCard — tarjeta métrica
 */
export function KpiCard({ title, value, subtitle, icon: Icon, color, D }) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            style={{ background: D.card, border: `1.5px solid ${D.border}` }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={28} color={color} />
            </div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: D.muted }}>
                {title}
            </p>
            <div className="text-2xl font-extrabold mb-0.5" style={{ color }}>
                {value}
            </div>
            <p className="text-[11px]" style={{ color: D.muted }}>{subtitle}</p>
        </div>
    );
}

/**
 * ProductCard — card de catálogo POS
 */
export function ProductCard({ product, cartItem, onAdd, isDark, D }) {
    const inCart = !!cartItem;
    const hasStock = !product.track_stock || (product.stock_quantity ?? product.stock ?? 999) > 0;

    return (
        <div
            onClick={() => hasStock && onAdd(product)}
            className={`relative flex flex-col rounded-[11px] overflow-hidden cursor-pointer select-none
                transition-all duration-150 hover:-translate-y-[2px]`}
            style={{
                background: D.card,
                border: `1.5px solid ${inCart ? B.green : D.border}`,
                boxShadow: inCart ? `0 4px 12px ${B.green}33` : undefined,
                opacity: hasStock ? 1 : 0.55,
            }}
        >
            {/* Cart badge */}
            {inCart && (
                <div className="absolute top-[7px] right-[7px] z-10 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9.5px] font-extrabold"
                    style={{ background: B.green, boxShadow: `0 2px 6px ${B.green}80` }}>
                    {cartItem.quantity}
                </div>
            )}

            {/* Image placeholder */}
            <div className="h-[90px] flex items-center justify-center relative"
                style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                {(product.image_url || product.image)
                    ? <img src={product.image_url || product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    : <img src="/placeholder-product.png" alt="Sin imagen" className="h-full w-full object-contain p-1 opacity-80" />
                }
                {/* Stock badge — esquina inferior izquierda de la imagen */}
                {product.track_stock && (
                    <div className="absolute bottom-[5px] left-[6px] z-10 px-1.5 py-[2px] rounded-[5px] text-[9px] font-extrabold leading-none"
                        style={{
                            background: hasStock ? `${B.green}CC` : `${B.red}CC`,
                            color: '#fff',
                            backdropFilter: 'blur(4px)',
                        }}>
                        Stock: {Math.max(0, Math.round(product.stock_quantity ?? 0))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-[8px_9px_9px] flex flex-col flex-1">
                <div className="text-[9px] font-semibold tracking-[0.04em] mb-0.5 uppercase truncate"
                    style={{ color: D.muted }}>
                    {product.sku || 'SIN SKU'}
                </div>
                <div className="text-[11.5px] font-bold leading-[1.25] mb-1.5 line-clamp-2" style={{ color: D.text }}>
                    {product.name}
                </div>
                <div className="text-[16px] font-black" style={{ color: B.blue }}>
                    ${fmt(product.price)}
                </div>
                <div className="mt-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-[1px] rounded-[4px] border"
                        style={{
                            color: hasStock ? B.green : B.red,
                            background: hasStock ? `${B.green}22` : `${B.red}18`,
                            borderColor: hasStock ? `${B.green}44` : `${B.red}44`,
                        }}>
                        {hasStock ? 'Disponible' : 'Sin stock'}
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * DatePicker — Selector de fecha con popover posicionado dinámicamente.
 * Reemplaza <input type="date"> nativo para mantener el estilo del proyecto.
 *
 * Props:
 *   value       — string YYYY-MM-DD (puede estar vacío)
 *   onChange    — fn(string) llamada con YYYY-MM-DD o '' al borrar
 *   placeholder — texto cuando no hay fecha
 *   D           — design tokens de useD()
 *   className   — clases extra para el trigger
 *   style       — estilos extra para el trigger
 */
export function DatePicker({ value, onChange, placeholder = 'dd/mm/aaaa', D, className = '', style = {} }) {
    const [open, setOpen]           = useState(false);
    const [pos, setPos]             = useState({ top: 0, left: 0, width: 276 });
    const triggerRef                = useRef(null);
    const popoverRef                = useRef(null);

    // Inicializar vista en el mes de la fecha seleccionada o el actual
    const parsedDate = value ? new Date(value + 'T12:00:00') : null;
    const [viewYear,  setViewYear]  = useState(() => parsedDate ? parsedDate.getFullYear()  : new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => parsedDate ? parsedDate.getMonth()     : new Date().getMonth());

    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DAYS   = ['L','M','M','J','V','S','D'];

    // Posicionar el popover al abrir
    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect  = triggerRef.current.getBoundingClientRect();
        const winH  = window.innerHeight;
        const winW  = window.innerWidth;
        // En mobile dejamos margen de 8px a cada lado
        const calW  = Math.min(276, winW - 16);
        const calH  = 300;

        // BottomNav ocupa 56px en mobile (<= 1024px)
        const bottomReserve = winW < 1024 ? 64 : 12;

        let top  = rect.bottom + 6;
        let left = rect.left;

        if (top + calH > winH - bottomReserve) top  = rect.top - calH - 6;
        if (left + calW > winW - 8)            left = winW - calW - 8;
        if (left < 8)                          left = 8;
        if (top < 8)                           top  = 8;

        setPos({ top, left, width: calW });
    }, [open]);

    // Cerrar al click fuera
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (!triggerRef.current?.contains(e.target) && !popoverRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Sincronizar vista si cambia value externamente
    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T12:00:00');
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const getDaysInMonth   = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstWeekday  = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

    const handleSelect = (day) => {
        const mm  = String(viewMonth + 1).padStart(2, '0');
        const dd  = String(day).padStart(2, '0');
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const today    = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const displayValue = parsedDate
        ? parsedDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay    = getFirstWeekday(viewYear, viewMonth);
    const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const bg     = D?.card    || '#0F1F2A';
    const border = D?.border  || 'rgba(255,255,255,0.10)';
    const text   = D?.text    || '#E6EEF5';
    const muted  = D?.muted   || '#6B8A9A';
    const hover  = D?.hover   || 'rgba(255,255,255,0.06)';

    return (
        <>
            {/* Trigger — div para evitar <button> anidado */}
            <div
                ref={triggerRef}
                role="button"
                tabIndex={0}
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
                className={`flex items-center gap-2 text-left w-full cursor-pointer select-none ${className}`}
                style={style}
            >
                <Calendar size={14} style={{ color: muted, flexShrink: 0 }} />
                <span className="flex-1 text-[13px]" style={{ color: displayValue ? text : muted }}>
                    {displayValue || placeholder}
                </span>
                {value && (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); onChange(''); }}
                        onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), onChange(''))}
                        className="p-0.5 rounded-full opacity-60 hover:opacity-100 cursor-pointer"
                        style={{ color: muted }}
                    >
                        <X size={12} />
                    </span>
                )}
            </div>

            {/* Popover — portaled al body para evitar clipping */}
            {open && createPortal(
                <div
                    ref={popoverRef}
                    style={{
                        position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
                        width: pos.width, borderRadius: 16, overflow: 'hidden',
                        background: bg, border: `1px solid ${border}`,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Header mes/año */}
                    <div className="flex items-center justify-between px-4 py-3"
                        style={{ background: G.horizontal }}>
                        <button type="button" onClick={prevMonth}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/20">
                            <ChevronLeft size={16} color="white" />
                        </button>
                        <span className="font-extrabold text-[14px] text-white select-none">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button" onClick={nextMonth}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/20">
                            <ChevronRight size={16} color="white" />
                        </button>
                    </div>

                    {/* Encabezado días */}
                    <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                        {DAYS.map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-extrabold uppercase tracking-wider pb-1"
                                style={{ color: muted }}>{d}</div>
                        ))}
                    </div>

                    {/* Grilla de días */}
                    <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                        {cells.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const mm     = String(viewMonth + 1).padStart(2, '0');
                            const dd     = String(day).padStart(2, '0');
                            const dayStr = `${viewYear}-${mm}-${dd}`;
                            const isSel  = dayStr === value;
                            const isToday = dayStr === todayStr;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    className="w-full aspect-square max-w-[34px] mx-auto flex items-center justify-center rounded-full text-[13px] transition-all"
                                    style={{
                                        background: isSel ? B.blue : isToday ? `${B.blue}25` : 'transparent',
                                        color:      isSel ? '#fff' : isToday ? B.blue : text,
                                        fontWeight: isSel ? 800 : isToday ? 700 : 400,
                                        boxShadow:  isSel ? `0 2px 10px ${B.blue}60` : 'none',
                                    }}
                                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = hover; }}
                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isToday ? `${B.blue}25` : 'transparent'; }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Acciones rápidas */}
                    <div className="px-3 pb-3 flex gap-2" style={{ borderTop: `1px solid ${border}`, paddingTop: 10 }}>
                        <button type="button"
                            onClick={() => { const d = new Date(); handleSelect(d.getDate()); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}
                            className="flex-1 py-1.5 rounded-[8px] text-[11px] font-bold transition-colors"
                            style={{ background: `${B.blue}22`, color: B.blue }}>
                            Hoy
                        </button>
                        {value && (
                            <button type="button"
                                onClick={() => { onChange(''); setOpen(false); }}
                                className="flex-1 py-1.5 rounded-[8px] text-[11px] font-bold transition-colors"
                                style={{ background: hover, color: muted }}>
                                Borrar
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// ─── APP-LEVEL LAYOUT CONSTANTS ─────────────────────────────
// Altura del navbar top (ajustá si tu nav es diferente)
export const NAV_HEIGHT = 64; // px — top-16

// Ancho sidebar collapsed/expanded
export const SIDEBAR_W = { expanded: 256, collapsed: 80 }; // px — left-64 / left-20