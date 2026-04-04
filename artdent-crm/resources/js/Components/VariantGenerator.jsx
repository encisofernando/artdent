import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Plus, X, ListTree, RefreshCcw } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function VariantGenerator({ variantsData = [], onVariantsChange, hidePrices = false, trackStock = false }) {
    const { isDark } = useTheme();

    const normalizeOptionName = (value) => value.trim().replace(/\s+/g, ' ');
    const normalizeOptionValue = (value) => value.trim().replace(/\s+/g, ' ').toLocaleUpperCase('es-AR');
    const normalizeAttributes = (attributes = {}) =>
        Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [
                normalizeOptionName(key),
                normalizeOptionValue(String(value ?? '')),
            ]),
        );
    
    // options structure: [{ id: 1, name: 'Color', values: ['Red', 'Blue'] }]
    const [options, setOptions] = useState([]);
    const [variants, setVariants] = useState([]);
    const [optionsError, setOptionsError] = useState('');
    
    // Initialize from existing data (used in Edit mode)
    useEffect(() => {
        if (variantsData && variantsData.length > 0 && options.length === 0 && variants.length === 0) {
            // Reconstruct options from variants
            const reconstructedOptions = {};
            
            variantsData.forEach(v => {
                if (v.attributes) {
                    Object.entries(normalizeAttributes(v.attributes)).forEach(([key, val]) => {
                        if (!reconstructedOptions[key]) {
                            reconstructedOptions[key] = new Set();
                        }
                        reconstructedOptions[key].add(val);
                    });
                }
            });
            
            const newOptions = Object.keys(reconstructedOptions).map((key, index) => ({
                id: Date.now() + index,
                name: key,
                values: Array.from(reconstructedOptions[key])
            }));
            
            setOptions(newOptions);
            setVariants(variantsData.map((variant) => ({
                ...variant,
                attributes: normalizeAttributes(variant.attributes),
            })));
        }
    }, [variantsData]);

    const addOption = () => {
        setOptions([...options, { id: Date.now(), name: '', values: [] }]);
    };

    const removeOption = (id) => {
        setOptions(options.filter(opt => opt.id !== id));
    };

    const updateOptionName = (id, name) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, name } : opt));
    };

    const handleValuesChange = (id, valuesString) => {
        // Split by comma, normalize spacing/case, remove empty and duplicates
        const values = Array.from(new Set(
            valuesString
                .split(',')
                .map(normalizeOptionValue)
                .filter(v => v),
        ));
        setOptions(options.map(opt => opt.id === id ? { ...opt, values } : opt));
    };

    const generateVariants = () => {
        setOptionsError('');

        // Only consider options that have both a name and at least one value
        const validOptions = options
            .map((opt) => ({
                ...opt,
                name: normalizeOptionName(opt.name),
                values: Array.from(new Set(opt.values.map(normalizeOptionValue).filter(v => v))),
            }))
            .filter(opt => opt.name !== '' && opt.values.length > 0);

        const normalizedNames = validOptions.map(opt => opt.name.toLocaleLowerCase('es-AR'));
        const hasDuplicateNames = new Set(normalizedNames).size !== normalizedNames.length;

        if (hasDuplicateNames) {
            setVariants([]);
            onVariantsChange([]);
            setOptionsError('Cada opción debe tener un nombre único (ej. Color, Talle, Material).');
            return;
        }
        
        if (validOptions.length === 0) {
            setVariants([]);
            onVariantsChange([]);
            return;
        }

        // Generate combinations using Cartesian Product
        const attributesLists = validOptions.map(opt => 
            opt.values.map(val => ({ [opt.name]: val }))
        );

        const combinations = attributesLists.reduce((acc, curr) => {
            const temp = [];
            acc.forEach(a => {
                curr.forEach(c => {
                    temp.push({ ...a, ...c });
                });
            });
            return temp;
        });

        // Map to variant objects, trying to preserve existing data if attributes match
        const newVariants = combinations.map(combo => {
            const normalizedCombo = normalizeAttributes(combo);

            // Find if this exact combination already exists to preserve its price/sku/id
            const existing = variants.find(v => {
                if (!v.attributes) return false;
                const normalizedAttributes = normalizeAttributes(v.attributes);
                const vKeys = Object.keys(normalizedAttributes);
                const cKeys = Object.keys(normalizedCombo);
                if (vKeys.length !== cKeys.length) return false;
                return vKeys.every(k => normalizedAttributes[k] === normalizedCombo[k]);
            });

            if (existing) {
                return {
                    ...existing,
                    attributes: normalizedCombo,
                };
            }

            return {
                id: null,
                attributes: normalizedCombo,
                sku: '',
                price: '',
                cost_price: '',
                stock_quantity: '',
                is_active: 1
            };
        });

        setVariants(newVariants);
        onVariantsChange(newVariants);
    };

    const updateVariantField = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
        onVariantsChange(updated); // Sync with parent form
    };

    const inputClasses = `w-full rounded-lg border px-3 py-1.5 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    return (
        <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-200/50'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <ListTree size={16} className="text-teal-500" />
                        Opciones de Variante
                    </h3>
                    <Button type="button" size="sm" variant="outline" onClick={addOption} className="h-8 text-xs">
                        <Plus size={14} className="mr-1" /> Añadir Opción
                    </Button>
                </div>

                {options.length === 0 ? (
                    <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No hay opciones definidas. Añade colores, tamaños, materiales, etc.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {options.map((opt, index) => (
                            <div key={opt.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <div className="w-full sm:w-1/3">
                                    <input 
                                        type="text" 
                                        placeholder="Nombre (ej. Color)" 
                                        className={inputClasses}
                                        value={opt.name}
                                        onChange={(e) => updateOptionName(opt.id, normalizeOptionName(e.target.value))}
                                    />
                                </div>
                                <div className="w-full sm:w-flex-1 flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="Valores separados por coma (ej. Rojo, Azul)" 
                                        className={inputClasses}
                                        defaultValue={opt.values.join(', ')}
                                        onBlur={(e) => handleValuesChange(opt.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleValuesChange(opt.id, e.target.value);
                                            }
                                        }}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(opt.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100/50">
                                        <X size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end mt-2">
                            <Button type="button" onClick={generateVariants} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs">
                                <RefreshCcw size={14} className="mr-1" /> {variants.length > 0 ? 'Regenerar Tabla' : 'Generar Variantes'}
                            </Button>
                        </div>
                    </div>
                )}

                {optionsError && (
                    <p className="text-xs mt-3 text-red-500 font-medium">{optionsError}</p>
                )}
            </div>

            {/* Generated Variants Table */}
            {variants.length > 0 && (
                <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className={`text-xs uppercase bg-slate-50 border-b
                                ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'}
                            `}>
                                <tr>
                                    <th className="px-4 py-3">Variante</th>
                                    <th className="px-4 py-3">SKU</th>
                                    {!hidePrices && (
                                        <>
                                            <th className="px-4 py-3 w-32">Precio</th>
                                            <th className="px-4 py-3 w-32">Costo (Opcional)</th>
                                        </>
                                    )}
                                    {trackStock && (
                                        <th className="px-4 py-3 w-28">Stock</th>
                                    )}
                                    <th className="px-4 py-3 text-center">Activo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {variants.map((variant, index) => (
                                    <tr key={index} className={isDark ? 'bg-slate-900/50 hover:bg-slate-800/80' : 'bg-white hover:bg-slate-50'}>
                                        <td className="px-4 py-2 font-medium">
                                            {variant.attributes && Object.values(variant.attributes).join(' / ')}
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                className={`w-full text-xs px-2 py-1 rounded border focus:ring-1 focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                                                value={variant.sku || ''}
                                                onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                                                placeholder="SKU"
                                            />
                                        </td>
                                        {!hidePrices && (
                                            <>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        className={`w-full text-xs px-2 py-1 rounded border focus:ring-1 focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                                                        value={variant.price || ''}
                                                        onChange={(e) => updateVariantField(index, 'price', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        className={`w-full text-xs px-2 py-1 rounded border focus:ring-1 focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                                                        value={variant.cost_price || ''}
                                                        onChange={(e) => updateVariantField(index, 'cost_price', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            </>
                                        )}
                                        {trackStock && (
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    className={`w-full text-xs px-2 py-1 rounded border focus:ring-1 focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                                                    value={variant.stock_quantity ?? ''}
                                                    onChange={(e) => updateVariantField(index, 'stock_quantity', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={variant.is_active === 1 || variant.is_active === true}
                                                onChange={(e) => updateVariantField(index, 'is_active', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 text-teal-600 bg-slate-100 border-slate-300 rounded focus:ring-teal-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
