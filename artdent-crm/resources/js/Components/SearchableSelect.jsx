import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * SearchableSelect — combobox con búsqueda en tiempo real.
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
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    const filtered = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
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

    // Base classes matching inputClasses from parent
    const base = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }
        ${error ? 'border-red-500' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

    const dropdownBg = isDark
        ? 'bg-slate-800 border-slate-700 shadow-2xl'
        : 'bg-white border-slate-200 shadow-xl';

    const optionHover = isDark
        ? 'hover:bg-teal-500/20 text-slate-200'
        : 'hover:bg-teal-50 text-slate-800';

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger */}
            <div
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
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
                        >
                            <X size={12} />
                        </button>
                    )}
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {open && (
                <div className={`absolute z-50 w-full mt-1 rounded-xl border ${dropdownBg} overflow-hidden`}
                    style={{ minWidth: '100%' }}
                >
                    {/* Search input */}
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

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-3 text-xs text-slate-400 text-center">Sin resultados</li>
                        ) : (
                            filtered.map(opt => (
                                <li
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${optionHover}
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
                </div>
            )}

            {/* Hidden native input for required validation */}
            {required && (
                <input
                    type="text"
                    required
                    value={value || ''}
                    onChange={() => {}}
                    className="sr-only"
                    tabIndex={-1}
                />
            )}

            {error && <div className="text-red-500 text-xs mt-1.5 font-medium">{error}</div>}
        </div>
    );
}
