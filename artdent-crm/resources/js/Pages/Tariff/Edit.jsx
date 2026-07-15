import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Banknote, FileText, Calculator, Layers, Plus, Trash2 } from 'lucide-react';
import TariffCostBuilder from '@/Components/TariffCostBuilder';
import SearchableSelect from '@/Components/SearchableSelect';

function PhasesManager({ tariffId, phases, setPhases, phaseTemplates, margin, onMarginChange, isDark }) {
    const confirmDialog = useConfirm();
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [saving, setSaving] = useState(false);

    const B = { blue: '#397B9C', teal: '#5AAD9C' };
    const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
    const input = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900';

    const templateOptions = phaseTemplates.map((t) => ({ value: t.id, label: `${t.name} — $ ${Number(t.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` }));

    const handleAdd = () => {
        if (!selectedTemplateId) return;
        setSaving(true);
        router.post(route('tariff-phases.store', tariffId), {
            phase_template_id: selectedTemplateId,
            sort_order: phases.length,
        }, {
            preserveState: true,
            onSuccess: (page) => {
                setPhases(page.props.item?.phases || phases);
                setSelectedTemplateId('');
            },
            onFinish: () => setSaving(false),
        });
    };

    const handleDelete = (phaseId) => {
        confirmDialog('¿Eliminar esta fase del arancel?', () => {
            router.delete(route('tariff-phases.destroy', { tariff: tariffId, phase: phaseId }), {
                preserveState: true,
                onSuccess: (page) => setPhases(page.props.item?.phases || phases.filter(p => p.id !== phaseId)),
            });
        });
    };

    const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const phasesTotal = phases.reduce((s, p) => s + Number(p.price), 0);
    const marginNum = parseFloat(margin) || 0;
    const finalPrice = round2(phasesTotal * (1 + marginNum / 100));

    return (
        <div className={`rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-4">
                <Layers size={16} style={{ color: B.teal }} />
                <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Fases de Trabajo</h2>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {phases.length} {phases.length === 1 ? 'fase' : 'fases'}
                </span>
            </div>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Asigná fases del catálogo. El precio final del arancel se calcula solo: suma de fases + margen. El cargo al odontólogo se genera al enviar cada fase a prueba (o al completarla, si nunca pasa por prueba).
            </p>

            {/* Lista de fases existentes */}
            {phases.length > 0 && (
                <div className="space-y-2 mb-4">
                    {phases.map((phase, idx) => (
                        <div key={phase.id} className={`flex items-center gap-3 p-3 rounded-xl border ${card}`}>
                            <span className={`text-xs font-bold w-5 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{phase.name}</p>
                            </div>
                            <span className="font-bold text-sm" style={{ color: B.teal }}>$ {fmt(phase.price)}</span>
                            <button onClick={() => handleDelete(phase.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Agregar fase del catálogo */}
            <div className={`flex gap-2 items-end p-3 rounded-xl border mb-4 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex-1">
                    <label className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fase del catálogo</label>
                    <SearchableSelect
                        options={templateOptions}
                        value={selectedTemplateId}
                        onChange={setSelectedTemplateId}
                        placeholder="Buscar fase..."
                    />
                </div>
                <button onClick={handleAdd} disabled={saving || !selectedTemplateId}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-40 transition-all"
                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                    <Plus size={14} />
                    Agregar
                </button>
            </div>
            {phaseTemplates.length === 0 && (
                <p className={`text-xs mb-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    No hay fases en el catálogo todavía. Cargalas desde Laboratorio → Catálogo de Fases.
                </p>
            )}

            {/* Total + margen + precio final */}
            {phases.length > 0 && (
                <div className={`rounded-xl border p-4 ${card}`}>
                    <div className="flex justify-between items-center text-xs font-semibold mb-3">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total fases</span>
                        <span style={{ color: B.blue }}>$ {fmt(phasesTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <label className={`text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Margen de rentabilidad</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={margin}
                            onChange={(e) => onMarginChange(e.target.value)}
                            className={`w-24 text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${input}`}
                        />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>%</span>
                    </div>
                    <div className={`flex justify-between items-center pt-3 border-t text-sm font-bold ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Precio final del arancel</span>
                        <span style={{ color: B.teal }}>$ {fmt(finalPrice)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function round2(v) {
    return Math.round(v * 100) / 100;
}

export default function Edit({ auth, item, phaseTemplates = [] }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors } = useForm({
        code: item.code || '',
        name: item.name || '',
        category: item.category || '',
        price: item.price !== undefined ? item.price : '',
        margin_pct: item.margin_pct ?? 0,
        unit: item.unit || 'Unidad',
        description: item.description || '',
        is_active: item.is_active !== undefined ? item.is_active : 1,
        // The controller sends relations if loaded with `->with('costs')`
        costs: item.costs || []
    });

    const [phases, setPhases] = useState(item.phases || []);
    const hasPhases = phases.length > 0;

    const calculateTotalCosts = (costsArr) => {
        let finalPrice = 0;
        costsArr.forEach(c => {
            const cost = (parseFloat(c.unit_cost) || 0) * (parseFloat(c.quantity) || 0);
            const margin = parseFloat(c.margin_pct) || 0;
            finalPrice += cost * (1 + (margin / 100));
        });
        return Math.round(finalPrice * 100) / 100;
    };

    const handleCostsChange = (newCosts) => {
        setData(prev => ({
            ...prev,
            costs: newCosts,
            price: newCosts.length > 0 ? calculateTotalCosts(newCosts) : prev.price
        }));
    };

    // El precio final manda de las fases (si hay) por sobre la fórmula de costos o el
    // valor manual — se recalcula solo (el servidor hace lo mismo al guardar).
    useEffect(() => {
        if (!hasPhases) return;
        const phasesTotal = phases.reduce((s, p) => s + Number(p.price), 0);
        const margin = parseFloat(data.margin_pct) || 0;
        const finalPrice = Math.round(phasesTotal * (1 + margin / 100) * 100) / 100;
        setData(prev => ({ ...prev, price: finalPrice }));
    }, [phases, data.margin_pct]);

    const submit = (e) => {
        e.preventDefault();
        put(route('tariffs.update', item.id));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
        }`;

    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5
        ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Editar Arancel - ${item.name}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Editar Arancel
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Actualizando: <strong>{item.name}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('tariffs.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}>
                                <ArrowLeft className="mr-2" size={16} />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">

                    {/* General Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Banknote size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Datos del Trabajo
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className={labelClasses}>Código Interno</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. CER-001"
                                />
                                {errors.code && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.code}</div>}
                            </div>

                            <div className="md:col-start-1 md:col-span-2">
                                <label className={labelClasses}>Descripción del Trabajo *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Corona Porcelana sobre Metal"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</div>}
                            </div>

                            <div>
                                <label className={labelClasses}>Categoría</label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Prótesis Fija, Ortodoncia..."
                                    list="categories-list"
                                />
                                <p className="text-xs text-slate-500 mt-1">Escriba para agrupar trabajos</p>
                                {errors.category && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.category}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>
                                        {hasPhases ? 'Precio Final (Fases + Margen)' : 'Precio Final (Manual o Auto-Calculado)'} *
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
                                            ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
                                        >
                                            $
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            readOnly={hasPhases || data.costs.length > 0}
                                            className={`${inputClasses} pl-8 ${(hasPhases || data.costs.length > 0) ? (isDark ? 'bg-slate-800/80 text-teal-400 font-bold border-teal-500/30' : 'bg-teal-50 text-teal-700 font-bold border-teal-200') : ''}`}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.price && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.price}</div>}
                                    {hasPhases && (
                                        <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Se calcula solo a partir de las fases asignadas más abajo. Para cambiarlo, ajustá el margen o las fases.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClasses}>Unidad de Medida</label>
                                    <input
                                        type="text"
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Unidad, Pieza, Arcada..."
                                    />
                                    {errors.unit && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.unit}</div>}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Cost Builder Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <Calculator size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Fórmula de Costos (Opcional)
                            </h2>
                        </div>

                        <TariffCostBuilder
                            costs={data.costs}
                            onChange={handleCostsChange}
                        />
                    </div>

                    {/* Details Section */}
                    <div className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <div className={`flex items-center gap-2 mb-6 pb-2 border-b
                            ${isDark ? 'border-slate-800' : 'border-slate-100'}
                        `}>
                            <FileText size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                Detalles Adicionales
                            </h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <label className={labelClasses}>Detalles Técnicos</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Especificaciones o materiales involucrados..."
                                    rows="3"
                                />
                                {errors.description && <div className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</div>}
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center mt-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={data.is_active === 1 || data.is_active === true}
                                            onChange={e => setData('is_active', e.target.checked ? 1 : 0)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true)
                                            ? 'bg-emerald-500'
                                            : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                            }`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'transform translate-x-4' : ''
                                            }`}></div>
                                    </div>
                                    <div className="ml-3 font-medium text-sm">
                                        Arancel Activo (disponible en facturación)
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>


                    {/* Fases de trabajo */}
                    <PhasesManager
                        tariffId={item.id}
                        phases={phases}
                        setPhases={setPhases}
                        phaseTemplates={phaseTemplates}
                        margin={data.margin_pct}
                        onMarginChange={(v) => setData('margin_pct', v)}
                        isDark={isDark}
                    />

                    <div className={`rounded-2xl border p-6 shadow-sm transition-colors flex justify-end gap-3
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                    `}>
                        <Link href={route('tariffs.index')}>
                            <Button
                                type="button"
                                variant="outline"
                                className={isDark ? "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800" : ""}
                            >
                                Cancelar
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save className="mr-2" size={16} />
                            Actualizar Arancel
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
