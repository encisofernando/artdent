import React, { useState, useEffect } from "react";
import { useTheme } from "@/Contexts/ThemeContext";
import { X, Check } from "lucide-react";
import { Button } from "@/Components/ui/button";

// ── VITA Palette ───────────────────────────────────────────────────────────────
const VITA = [
    { code: "A1", hex: "#F9EDE1" },
    { code: "A2", hex: "#F2DCC8" },
    { code: "A3", hex: "#E6C4A8" },
    { code: "A3.5", hex: "#D9AF8E" },
    { code: "A4", hex: "#CC9878" },
    { code: "B1", hex: "#FBF0E3" },
    { code: "B2", hex: "#F4DCBF" },
    { code: "B3", hex: "#E7C5A0" },
    { code: "B4", hex: "#D9AF88" },
    { code: "C1", hex: "#F7E8D0" },
    { code: "C2", hex: "#EBCFAC" },
    { code: "C3", hex: "#DCB58A" },
    { code: "C4", hex: "#CC9A6E" },
    { code: "D2", hex: "#EDD5B0" },
    { code: "D3", hex: "#DEC090" },
    { code: "D4", hex: "#CEA872" },
];

// ── FDI Numbering ────────────────────────────────────────────────────────────
const CUADRANTES = [
    { label: "Superior Derecha", nums: [18, 17, 16, 15, 14, 13, 12, 11] },
    { label: "Superior Izquierda", nums: [21, 22, 23, 24, 25, 26, 27, 28] },
    { label: "Inferior Izquierda", nums: [31, 32, 33, 34, 35, 36, 37, 38] },
    { label: "Inferior Derecha", nums: [48, 47, 46, 45, 44, 43, 42, 41] },
];

// Tooth types
function toothType(n) {
    const u = n % 10;
    if (u === 8) return "molar3";
    if (u === 7 || u === 6) return "molar";
    if (u === 5 || u === 4) return "premolar";
    if (u === 3) return "canino";
    return "incisivo";
}

// Simplified SVG Tooth representation
function ToothSVG({ type, selected, color, isDark }) {
    const fill = selected ? (color || "#397B9C") : "transparent";
    const stroke = selected ? (color || "#397B9C") : (isDark ? "#475569" : "#CBD5E1");
    const w = 24, h = type === "molar" || type === "molar3" ? 28 : 24;

    if (type === "molar" || type === "molar3") return (
        <svg width={w} height={h} viewBox="0 0 28 32">
            <rect x="2" y="4" width="24" height="24" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <rect x="7" y="9" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5" />
            <rect x="16" y="9" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5" />
            <rect x="7" y="18" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5" />
            <rect x="16" y="18" width="5" height="5" rx="1.5" fill={stroke} opacity="0.5" />
            <path d="M 14 4 Q 14 0 14 0" stroke={stroke} strokeWidth="1.5" fill="none" />
        </svg>
    );

    if (type === "premolar") return (
        <svg width={w} height={h} viewBox="0 0 28 28">
            <rect x="2" y="4" width="24" height="22" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <rect x="8" y="10" width="12" height="7" rx="2" fill={stroke} opacity="0.4" />
            <path d="M 14 4 Q 14 0 14 0" stroke={stroke} strokeWidth="1.5" fill="none" />
        </svg>
    );

    if (type === "canino") return (
        <svg width={w} height={h} viewBox="0 0 28 28">
            <path d="M 4 6 Q 4 3 14 3 Q 24 3 24 6 L 22 24 Q 22 26 14 26 Q 6 26 6 24 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M 14 3 L 14 0" stroke={stroke} strokeWidth="1.5" />
        </svg>
    );

    return ( // incisivo
        <svg width={w} height={h} viewBox="0 0 28 28">
            <rect x="4" y="4" width="20" height="22" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M 14 4 L 14 0" stroke={stroke} strokeWidth="1.5" />
        </svg>
    );
}

export default function Odontogram({ open, onClose, onSelect, initialValue = [] }) {
    const { isDark } = useTheme();

    // State: { [toothNumber]: { tooth: number, note?: string (contains color) } }
    const [selMap, setSelMap] = useState({});
    const [activeTono, setActiveTono] = useState("A2");

    useEffect(() => {
        if (open) {
            const m = {};
            initialValue.forEach(v => {
                // v comes in as { tooth: 11, note: 'A2' }
                if (v.tooth) {
                    m[v.tooth] = v.note || '';
                }
            });
            setSelMap(m);
        }
    }, [open, initialValue]);

    if (!open) return null;

    const handleTooth = (num) => {
        setSelMap(prev => {
            const next = { ...prev };
            if (next[num]) {
                delete next[num];
            } else {
                next[num] = activeTono;
            }
            return next;
        });
    };

    const handleGuardar = () => {
        // Format the selection to match JobTeeth expected format
        const arr = Object.entries(selMap).map(([n, t]) => ({
            tooth: n.toString(),
            note: t || null,
        }));
        onSelect(arr);
        onClose();
    };

    const isSelected = (n) => !!selMap[n];
    const tonoForTooth = (n) => selMap[n] ? VITA.find(v => v.code === selMap[n])?.hex : undefined;
    const selCount = Object.keys(selMap).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col
          ${isDark ? 'bg-slate-900 border border-slate-700/60' : 'bg-white border border-slate-200'}
      `}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-t-3xl border-transparent">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Selector de Piezas Dentales</h2>
                        <p className="text-sm opacity-80">Sistema FDI — Seleccioná pieza y tono VITA</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">

                    {/* Odontogram Visual Diagram */}
                    <div className={`p-4 rounded-2xl border flex flex-col items-center
             ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
          `}>
                        <div className="text-[10px] font-bold tracking-widest text-[#397B9C] mb-2 uppercase">↑ Arcada Superior</div>

                        {/* Superior */}
                        <div className={`flex gap-1 pb-3 mb-2 border-b-2 border-dashed
                ${isDark ? 'border-slate-700' : 'border-slate-300'}
             `}>
                            {[...CUADRANTES[0].nums, ...CUADRANTES[1].nums].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleTooth(n)}
                                    title={`Pieza ${n}`}
                                    className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all
                      ${isSelected(n) ? 'scale-110 drop-shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:scale-105'}
                    `}
                                >
                                    <ToothSVG type={toothType(n)} selected={isSelected(n)} color={tonoForTooth(n)} isDark={isDark} />
                                    <span className={`text-[10px] ${isSelected(n) ? 'font-bold text-[#397B9C]' : 'font-medium opacity-60'}`}>{n}</span>
                                </button>
                            ))}
                        </div>

                        {/* Inferior */}
                        <div className="flex gap-1 pt-2 mb-2">
                            {[...CUADRANTES[2].nums, ...CUADRANTES[3].nums].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleTooth(n)}
                                    title={`Pieza ${n}`}
                                    className={`flex flex-col-reverse items-center gap-1 p-1 rounded-lg transition-all
                      ${isSelected(n) ? 'scale-110 drop-shadow-md' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:scale-105'}
                    `}
                                >
                                    <ToothSVG type={toothType(n)} selected={isSelected(n)} color={tonoForTooth(n)} isDark={isDark} />
                                    <span className={`text-[10px] ${isSelected(n) ? 'font-bold text-[#397B9C]' : 'font-medium opacity-60'}`}>{n}</span>
                                </button>
                            ))}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest text-teal-600 mt-2 uppercase">↓ Arcada Inferior</div>
                    </div>

                    {/* VITA Palette */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tono VITA activo:</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#397B9C] text-white">
                                {activeTono}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {VITA.map(v => (
                                <button
                                    key={v.code}
                                    type="button"
                                    onClick={() => setActiveTono(v.code)}
                                    title={v.code}
                                    className={`w-12 h-10 rounded-xl relative flex items-center justify-center transition-all shadow-sm
                      ${activeTono === v.code ? 'ring-4 ring-[#397B9C] ring-opacity-50 scale-110 z-10' : 'border border-slate-300 dark:border-slate-600 hover:scale-105'}
                   `}
                                    style={{ backgroundColor: v.hex }}
                                >
                                    <span className="text-[10px] font-bold text-slate-800 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">{v.code}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selections Preview */}
                    {selCount > 0 && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
                            <span className={`text-sm font-bold block mb-2 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                                Piezas seleccionadas ({selCount}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(selMap).map(([n, t]) => (
                                    <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                        <span>{n}</span>
                                        <span className="opacity-50">—</span>
                                        <span>{t}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleTooth(n)}
                                            className="ml-1 opacity-70 hover:opacity-100 hover:text-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className={`p-4 sm:p-6 border-t flex justify-end gap-3 rounded-b-3xl
          ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}
        `}>
                    <Button variant="outline" onClick={onClose} className={isDark ? "bg-transparent border-slate-600 text-slate-300" : ""}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGuardar}
                        disabled={selCount === 0}
                        className="bg-gradient-to-r from-teal-600 to-teal-800 text-white border-0"
                    >
                        <Check className="mr-2" size={16} />
                        Confirmar Selección
                    </Button>
                </div>

            </div>
        </div>
    );
}
