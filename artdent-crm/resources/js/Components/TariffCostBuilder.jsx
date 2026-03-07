import React, { useMemo } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { Plus, Trash2, Box, PenTool, Truck, Hammer, Hexagon } from 'lucide-react';

const TYPE_ICONS = {
    'material': { icon: Box, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'mano_obra': { icon: Hammer, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    'herramienta': { icon: PenTool, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'logistica': { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'otros': { icon: Hexagon, color: 'text-slate-500', bg: 'bg-slate-500/10' }
};

export default function TariffCostBuilder({ costs, onChange }) {
    const { isDark } = useTheme();

    const addCost = () => {
        onChange([...costs, {
            type: 'material',
            description: '',
            supplier: '',
            unit: 'un',
            unit_cost: 0,
            quantity: 1,
            margin_pct: 30
        }]);
    };

    const updateCost = (index, field, value) => {
        const newCosts = [...costs];
        newCosts[index] = { ...newCosts[index], [field]: value };
        onChange(newCosts);
    };

    const removeCost = (index) => {
        onChange(costs.filter((_, i) => i !== index));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const totals = useMemo(() => {
        let rawCost = 0;
        let finalPrice = 0;
        costs.forEach(c => {
            const cost = (parseFloat(c.unit_cost) || 0) * (parseFloat(c.quantity) || 0);
            const margin = parseFloat(c.margin_pct) || 0;
            rawCost += cost;
            finalPrice += cost * (1 + (margin / 100));
        });
        return { rawCost, finalPrice };
    }, [costs]);

    const inputClass = `w-full rounded-lg border px-3 py-1.5 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/80 border-slate-700/80 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Desglose de Costos</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Agregue los materiales y mano de obra para calcular el precio final automáticamente.</p>
                </div>
                <Button
                    type="button"
                    onClick={addCost}
                    className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-white"
                >
                    <Plus size={14} className="mr-1" /> Agregar Costo
                </Button>
            </div>

            {costs.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border border-dashed
                    ${isDark ? 'bg-slate-800/30 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-400'}
                `}>
                    Sin costos agregados. El precio del arancel será manual.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {costs.map((cost, idx) => {
                        const Icon = TYPE_ICONS[cost.type]?.icon || Hexagon;
                        const iconColor = TYPE_ICONS[cost.type]?.color || 'text-slate-500';
                        const iconBg = TYPE_ICONS[cost.type]?.bg || 'bg-slate-500/10';

                        const itemCost = (parseFloat(cost.unit_cost) || 0) * (parseFloat(cost.quantity) || 0);
                        const itemSuggested = itemCost * (1 + ((parseFloat(cost.margin_pct) || 0) / 100));

                        return (
                            <div key={idx} className={`p-4 rounded-xl border relative flex flex-col gap-3
                                ${isDark ? 'bg-slate-900/50 border-slate-700/80' : 'bg-white border-slate-200'}
                            `}>
                                <button
                                    type="button"
                                    onClick={() => removeCost(idx)}
                                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors
                                        ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/40' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}
                                    `}
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-8">
                                    <div className="md:col-span-3">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tipo</label>
                                        <div className="relative">
                                            <div className={`absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md ${iconBg} ${iconColor}`}>
                                                <Icon size={12} />
                                            </div>
                                            <select
                                                value={cost.type}
                                                onChange={e => updateCost(idx, 'type', e.target.value)}
                                                className={`${inputClass} pl-8 py-1.5`}
                                            >
                                                <option value="material">Material</option>
                                                <option value="mano_obra">Mano de Obra</option>
                                                <option value="herramienta">Herramienta</option>
                                                <option value="logistica">Logística</option>
                                                <option value="otros">Otros / Varios</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-5">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Descripción *</label>
                                        <input
                                            type="text"
                                            value={cost.description}
                                            onChange={e => updateCost(idx, 'description', e.target.value)}
                                            className={inputClass}
                                            placeholder="Zirconio, Resina, Impresión..."
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Proveedor</label>
                                        <input
                                            type="text"
                                            value={cost.supplier || ''}
                                            onChange={e => updateCost(idx, 'supplier', e.target.value)}
                                            className={inputClass}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unidad (U)</label>
                                        <input
                                            type="text"
                                            value={cost.unit || ''}
                                            onChange={e => updateCost(idx, 'unit', e.target.value)}
                                            className={inputClass}
                                            placeholder="gr, ml, un"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-3 items-end pr-8">
                                    <div className="sm:col-span-2 md:col-span-2">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Costo Unitario (1U)</label>
                                        <div className="relative">
                                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                                            <input
                                                type="number" step="0.01" min="0" required
                                                value={cost.unit_cost}
                                                onChange={e => updateCost(idx, 'unit_cost', e.target.value)}
                                                className={`${inputClass} pl-6 font-mono text-sm`}
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cant (Q)</label>
                                        <input
                                            type="number" step="0.001" min="0" required
                                            value={cost.quantity}
                                            onChange={e => updateCost(idx, 'quantity', e.target.value)}
                                            className={`${inputClass} font-mono text-sm`}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-2">
                                        <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-emerald-500/80' : 'text-emerald-600'}`}>Margen % (+)</label>
                                        <div className="relative">
                                            <input
                                                type="number" step="0.1" min="0" required
                                                value={cost.margin_pct}
                                                onChange={e => updateCost(idx, 'margin_pct', e.target.value)}
                                                className={`${inputClass} pr-6 font-mono text-sm font-bold text-emerald-500`}
                                            />
                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/50'}`}>%</span>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 md:col-span-2 flex flex-col items-end justify-center pb-2">
                                        <div className={`text-[10px] font-bold uppercase mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Costo: {formatCurrency(itemCost)}
                                        </div>
                                        <div className={`font-mono font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                            Sugerido: {formatCurrency(itemSuggested)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {costs.length > 0 && (
                <div className={`mt-2 p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4
                    ${isDark ? 'bg-slate-800/40 border-teal-500/30' : 'bg-teal-50/50 border-teal-200'}
                `}>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Costo Neto Total</span>
                        <span className={`text-lg font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {formatCurrency(totals.rawCost)}
                        </span>
                    </div>

                    <div className="hidden sm:block text-teal-500 opacity-50">
                        <Plus size={24} />
                    </div>

                    <div className="flex flex-col sm:items-end">
                        <span className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>Precio sugerido automático</span>
                        <span className={`text-2xl font-mono font-extrabold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                            {formatCurrency(totals.finalPrice)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
