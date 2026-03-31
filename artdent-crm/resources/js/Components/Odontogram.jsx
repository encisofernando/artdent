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

// Simplified SVG Tooth representation — realistic crown silhouettes
function ToothSVG({ type, selected, color, isDark }) {
    const fill   = selected ? (color || "#397B9C") : (isDark ? "#1e293b" : "#f8fafc");
    const stroke = selected ? (color || "#397B9C") : (isDark ? "#64748b" : "#94a3b8");
    const detail = selected ? "rgba(255,255,255,0.25)" : (isDark ? "#2d3f55" : "#cbd5e1");

    if (type === "molar3") return (
        <svg width={30} height={30} viewBox="0 0 30 30">
            {/* Wide molar del juicio with 5 cusp bumps */}
            <path d="M3,27 Q3,29 15,29 Q27,29 27,27 L27,14 Q27,11 22,11 L22,8 Q20,3 17,3 Q15,1 13,3 Q10,3 8,8 L8,11 Q3,11 3,14 Z"
                fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
            {/* cusp line */}
            <path d="M8,13 Q10,9 13,8 Q15,7 17,8 Q20,9 22,13"
                fill="none" stroke={detail} strokeWidth="1" />
            {/* central groove */}
            <line x1="15" y1="13" x2="15" y2="22" stroke={detail} strokeWidth="1" />
        </svg>
    );

    if (type === "molar") return (
        <svg width={28} height={28} viewBox="0 0 28 28">
            {/* Molar — wide with 4 cusps */}
            <path d="M2,25 Q2,27 14,27 Q26,27 26,25 L26,13 Q26,10 21,10 L21,7 Q19,2 14,2 Q9,2 7,7 L7,10 Q2,10 2,13 Z"
                fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
            {/* cusp bumps */}
            <path d="M7,12 Q9,7 14,6 Q19,7 21,12"
                fill="none" stroke={detail} strokeWidth="1" />
            {/* grooves */}
            <line x1="14" y1="12" x2="14" y2="20" stroke={detail} strokeWidth="1" />
            <line x1="8"  y1="16" x2="20" y2="16" stroke={detail} strokeWidth="0.8" />
        </svg>
    );

    if (type === "premolar") return (
        <svg width={22} height={27} viewBox="0 0 22 27">
            {/* Premolar — 2 cusps */}
            <path d="M2,24 Q2,26 11,26 Q20,26 20,24 L20,11 Q20,9 17,9 L17,7 Q15,2 11,2 Q7,2 5,7 L5,9 Q2,9 2,11 Z"
                fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
            {/* 2 cusps */}
            <path d="M5,11 Q7,6 11,5 Q15,6 17,11"
                fill="none" stroke={detail} strokeWidth="1" />
            {/* central groove */}
            <line x1="11" y1="11" x2="11" y2="19" stroke={detail} strokeWidth="1" />
        </svg>
    );

    if (type === "canino") return (
        <svg width={18} height={28} viewBox="0 0 18 28">
            {/* Canino — single pointed cusp */}
            <path d="M2,25 Q2,27 9,27 Q16,27 16,25 L16,12 Q14,7 9,2 Q4,7 2,12 Z"
                fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
            {/* cusp ridge */}
            <path d="M4,13 Q6,8 9,4 Q12,8 14,13"
                fill="none" stroke={detail} strokeWidth="1" />
        </svg>
    );

    // incisivo
    return (
        <svg width={16} height={26} viewBox="0 0 16 26">
            {/* Incisivo — flat incisal edge, slightly tapered */}
            <path d="M1,23 Q1,25 8,25 Q15,25 15,23 L15,7 Q14,2 8,2 Q2,2 1,7 Z"
                fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
            {/* incisal edge highlight */}
            <line x1="2" y1="5" x2="14" y2="5" stroke={detail} strokeWidth="1" />
            {/* 2 mammelons (ridges on incisors) */}
            <line x1="5"  y1="5" x2="5"  y2="8" stroke={detail} strokeWidth="0.8" />
            <line x1="11" y1="5" x2="11" y2="8" stroke={detail} strokeWidth="0.8" />
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
                            {[...CUADRANTES[3].nums, ...CUADRANTES[2].nums].map(n => (
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
