import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Search } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * SearchableSelect — combobox con búsqueda en tiempo real.
 * El dropdown se renderiza via portal para nunca salirse de pantalla.
 *
 * Props:
 *   options      - array de { value, label }
 *   value        - valor seleccionado actual
 *   onChange     - fn(value) cuando cambia la selección
 *   placeholder  - texto cuando no hay selección
 *   required     - boolean
 *   disabled     - boolean
 *   error        - string de error
 */
export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    error,
}) {
    const { isDark } = useTheme();
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState('');
    const [pos, setPos]     = useState({ top: 0, left: 0, width: 0 });
    const triggerRef        = useRef(null);
    const dropdownRef       = useRef(null);
    const inputRef          = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));
    const filtered  = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    // Posicionar el dropdown al abrir
    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect    = triggerRef.current.getBoundingClientRect();
        const winH    = window.innerHeight;
        const winW    = window.innerWidth;
        const dropH   = Math.min(260, filtered.length * 40 + 48);
        const width   = Math.min(rect.width, winW - 16);

        let top  = rect.bottom + 4;
        let left = rect.left;

        // Flip hacia arriba si no cabe abajo
        if (top + dropH > winH - 64) top = rect.top - dropH - 4;
        if (top < 8)                  top = 8;
        // Ajuste horizontal
        if (left + width > winW - 8)  left = winW - width - 8;
        if (left < 8)                 left = 8;

        setPos({ top, left, width });
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    // Cerrar al click fuera
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(o => !o);
        setQuery('');
    };

    const handleSelect = (opt) => {
        onChange(opt.value);
        setOpen(false);
        setQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const base = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }
        ${error    ? 'border-red-500'              : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

    const dropBg   = isDark ? '#1e293b' : '#ffffff';
    const dropBorder = isDark ? 'rgba(100,116,139,0.4)' : 'rgba(203,213,225,1)';
    const optHover = isDark ? 'hover:bg-teal-500/20 text-slate-200' : 'hover:bg-teal-50 text-slate-800';

    return (
        <div className="relative w-full">
            {/* Trigger */}
            <div
                ref={triggerRef}
                className={`${base} flex items-center justify-between gap-2 min-h-[38px]`}
                onClick={handleOpen}
                role="combobox"
                aria-expanded={open}
            >
                <span className={`truncate flex-1 ${!selected ? (isDark ? 'text-slate-500' : 'text-slate-400') : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {selected && !disabled && (
                        <button type="button" onClick={handleClear}
                            className={`p-0.5 rounded transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-200'}`}>
                            <X size={12} />
                        </button>
                    )}
                    <ChevronDown size={14}
                        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
                    />
                </div>
            </div>

            {/* Dropdown — portaled al body para nunca salirse de pantalla */}
            {open && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top:      pos.top,
                        left:     pos.left,
                        width:    pos.width,
                        zIndex:   10000,
                        background: dropBg,
                        border:   `1px solid ${dropBorder}`,
                        borderRadius: 14,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Search */}
                    <div className={`flex items-center gap-2 px-3 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <Search size={13} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Buscar..."
                            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                        />
                    </div>

                    {/* Options */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-3 text-xs text-slate-400 text-center">Sin resultados</li>
                        ) : (
                            filtered.map(opt => (
                                <li key={opt.value} onClick={() => handleSelect(opt)}
                                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${optHover}
                                        ${String(opt.value) === String(value)
                                            ? (isDark ? 'bg-teal-500/30 text-teal-300 font-semibold' : 'bg-teal-50 text-teal-700 font-semibold')
                                            : ''
                                        }
                                    `}
                                >
                                    {opt.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>,
                document.body
            )}

            {/* Native input oculto para validación required */}
            {required && (
                <input type="text" required value={value || ''} onChange={() => {}}
                    className="sr-only" tabIndex={-1} />
            )}

            {error && <div className="text-red-500 text-xs mt-1.5 font-medium">{error}</div>}
        </div>
    );
}
