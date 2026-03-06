import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Upload, Download, FileText, Database, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { router } from '@inertiajs/react';
import Papa from 'papaparse';

export default function ImportExportModal({ isOpen, onClose }) {
    const { isDark } = useTheme();
    const [mode, setMode] = useState('select'); // select, export, import_csv, import_sql
    const [step, setStep] = useState(1);
    
    // CSV State
    const [csvFile, setCsvFile] = useState(null);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [columnMap, setColumnMap] = useState({});
    
    // SQL State
    const [sqlFile, setSqlFile] = useState(null);
    const [sqlPreview, setSqlPreview] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fileInputRef = useRef(null);

    const laravelFields = [
        { key: 'name', label: 'Nombre del Producto', required: true },
        { key: 'sku', label: 'SKU / Código', required: false },
        { key: 'category_id', label: 'ID Categoría', required: false },
        { key: 'cost_price', label: 'Costo ($)', required: false },
        { key: 'price', label: 'Precio de Venta ($)', required: true },
        { key: 'stock', label: 'Stock Inicial', required: false },
        { key: 'description', label: 'Descripción', required: false },
    ];

    const resetState = () => {
        setMode('select');
        setStep(1);
        setCsvFile(null);
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMap({});
        setSqlFile(null);
        setSqlPreview('');
        setError('');
        setSuccess('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // --- CSV LOGIC ---
    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCsvFile(file);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    setCsvHeaders(Object.keys(results.data[0]));
                    setCsvData(results.data);
                    
                    // Auto-map common names
                    const initialMap = {};
                    Object.keys(results.data[0]).forEach(header => {
                        const hLower = header.toLowerCase();
                        if (hLower.includes('nombre') || hLower === 'name') initialMap['name'] = header;
                        if (hLower.includes('sku') || hLower.includes('codigo')) initialMap['sku'] = header;
                        if (hLower === 'costo' || hLower.includes('cost')) initialMap['cost_price'] = header;
                        if (hLower === 'precio' || hLower.includes('price')) initialMap['price'] = header;
                    });
                    setColumnMap(initialMap);
                    setStep(2);
                } else {
                    setError('El archivo CSV está vacío o no se pudo leer.');
                }
            },
            error: (err) => {
                setError('Error leyendo CSV: ' + err.message);
            }
        });
    };

    const handleMapChange = (laravelKey, csvHeader) => {
        setColumnMap(prev => ({
            ...prev,
            [laravelKey]: csvHeader
        }));
    };

    const submitCsvImport = () => {
        if (!columnMap.name || !columnMap.price) {
            setError('Debes mapear al menos el Nombre y el Precio de Venta.');
            return;
        }

        setLoading(true);
        setError('');

        // Transform data based on map
        const mappedData = csvData.map(row => {
            const newItem = {};
            Object.keys(columnMap).forEach(key => {
                if (columnMap[key]) {
                    newItem[key] = row[columnMap[key]];
                }
            });
            return newItem;
        }).filter(item => item.name && item.price); // filter empty rows

        axios.post(route('products.import.csv'), { products: mappedData })
            .then(res => {
                setSuccess(`¡${res.data.imported} productos importados/actualizados correctamente!`);
                setStep(4);
                router.reload({ only: ['items'] });
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Error importando productos.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // --- SQL LOGIC ---
    const handleSqlUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSqlFile(file);
        setError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            setSqlPreview(content.substring(0, 1000) + (content.length > 1000 ? '\n\n... (truncado)' : ''));
            setStep(2);
        };
        reader.readAsText(file);
    };

    const submitSqlImport = () => {
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('sql_file', sqlFile);

        axios.post(route('products.import.sql'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                setSuccess(res.data.message || 'Script SQL ejecutado correctamente.');
                setStep(4);
                router.reload({ only: ['items'] });
            })
            .catch(err => {
                setError(err.response?.data?.message || err.response?.data?.error || 'Error ejecutando script SQL.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // --- UI HELPERS ---
    const B = { blue: "#397B9C", green: "#5AAD9C", teal: "#49949C" };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-[700px] border-none shadow-2xl p-0 overflow-hidden font-sans
                ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}
            `}>
                {/* Header Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b
                    ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-50 border-slate-200'}
                `}>
                    <div>
                        <DialogTitle className="text-xl font-bold">Importar / Exportar Productos</DialogTitle>
                        <DialogDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Sube un archivo genérico o corre migraciones masivas complejas.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-sm">{error}</div>
                        </div>
                    )}

                    {/* --- STEP 1: SELECT MODE --- */}
                    {mode === 'select' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('import_csv')}
                                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all
                                    ${isDark ? 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'}
                                `}
                            >
                                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                                    <FileText size={28} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Importar CSV</h3>
                                <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Ideal para productos simples, listas de precios y updates rápidos sin variantes.
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('import_sql')}
                                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all
                                    ${isDark ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}
                                `}
                            >
                                <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                                    <Database size={28} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Ejecutar SQL</h3>
                                <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Para tablas complejas, múltiples relaciones, atributos y cientos de variantes (ej. Acritone).
                                </p>
                            </button>
                        </div>
                    )}

                    {/* --- CSV IMPORT FLOW --- */}
                    {mode === 'import_csv' && (
                        <div className="space-y-6">
                            {step === 1 && (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleCsvUpload} 
                                    />
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border dark:bg-slate-800 dark:border-slate-700">
                                        <Upload size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Subir Archivo CSV</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Asegúrate de que la primera fila contenga los títulos.</p>
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        Seleccionar Archivo
                                    </Button>
                                    <button onClick={() => setMode('select')} className="mt-4 text-sm text-slate-500 hover:underline">Volver atraś</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold border-b pb-2 dark:border-slate-700">Mapear Columnas</h3>
                                    <p className="text-sm text-slate-500">Relaciona las columnas de tu CSV con los campos de la base de datos de ArtDent.</p>
                                    
                                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <table className="w-full text-sm text-left">
                                            <thead className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold w-1/2 border-r dark:border-slate-700">Campo en ArtDent</th>
                                                    <th className="px-4 py-3 font-semibold w-1/2">Columna en tu CSV</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-slate-700">
                                                {laravelFields.map(field => (
                                                    <tr key={field.key} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-4 py-2 border-r dark:border-slate-700">
                                                            <div className="font-medium">{field.label}</div>
                                                            {field.required && <span className="text-[10px] text-red-500 font-bold tracking-wider">REQUERIDO</span>}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <select
                                                                value={columnMap[field.key] || ''}
                                                                onChange={(e) => handleMapChange(field.key, e.target.value)}
                                                                className={`w-full text-sm rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none p-2
                                                                    ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}
                                                                `}
                                                            >
                                                                <option value="">-- Ignorar --</option>
                                                                {csvHeaders.map(h => (
                                                                    <option key={h} value={h}>{h}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end pt-4 gap-3">
                                        <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                                        <Button 
                                            onClick={() => setStep(3)}
                                            disabled={!columnMap.name || !columnMap.price}
                                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} 
                                            className="text-white border-none"
                                        >
                                            Siguiente: Vista Previa
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                     <h3 className="font-bold border-b pb-2 dark:border-slate-700">Vista Previa</h3>
                                     <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
                                        <table className="w-full text-sm text-left">
                                            <thead className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                                                <tr>
                                                    {Object.entries(columnMap).filter(([k,v]) => v).map(([key, col]) => (
                                                        <th key={key} className="px-4 py-2 font-semibold whitespace-nowrap">
                                                            {laravelFields.find(f => f.key === key)?.label || key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-slate-700">
                                                {csvData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        {Object.entries(columnMap).filter(([k,v]) => v).map(([key, col]) => (
                                                            <td key={key} className="px-4 py-2 truncate max-w-[200px]">
                                                                {row[col]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                     </div>
                                     <p className="text-xs text-slate-500 italic">Mostrando las primeras 5 filas...</p>

                                     <div className="flex justify-end pt-4 gap-3">
                                        <Button variant="outline" onClick={() => setStep(2)}>Atrás</Button>
                                        <Button 
                                            onClick={submitCsvImport}
                                            disabled={loading}
                                            style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }} 
                                            className="text-white border-none min-w-[150px]"
                                        >
                                            {loading ? 'Procesando...' : `Importar ${csvData.length} ítems`}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- SQL IMPORT FLOW --- */}
                    {mode === 'import_sql' && (
                        <div className="space-y-6">
                             {step === 1 && (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <input 
                                        type="file" 
                                        accept=".sql" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleSqlUpload} 
                                    />
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border dark:bg-slate-800 dark:border-slate-700">
                                        <Database size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Subir Script SQL</h3>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Se ejecutarán transacciones o inserciones masivas complejas.
                                    </p>
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        Seleccionar Archivo .sql
                                    </Button>
                                    <button onClick={() => setMode('select')} className="mt-4 text-sm text-slate-500 hover:underline">Volver atraś</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div className="text-sm font-medium">
                                            ⚠️ Advertencia de Seguridad: Los scripts SQL interactúan directamente con la base de datos.
                                            Asegúrate de que este archivo provenga de una fuente confiable.
                                        </div>
                                    </div>

                                    <h3 className="font-bold mt-4">Vista previa del script</h3>
                                    <div className={`p-4 rounded-xl font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap
                                        ${isDark ? 'bg-slate-950/50 text-slate-400 border border-slate-800' : 'bg-slate-100/50 text-slate-600 border border-slate-200'}
                                    `}>
                                        {sqlPreview}
                                    </div>

                                    <div className="flex justify-end pt-4 gap-3">
                                        <Button variant="outline" onClick={() => setStep(1)}>Cancelar</Button>
                                        <Button 
                                            onClick={submitSqlImport}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white min-w-[150px] border-none"
                                        >
                                            {loading ? 'Ejecutando...' : 'Ejecutar Script SQL'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- SUCCESS STEP --- */}
                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">¡Proceso Completado!</h3>
                            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {success}
                            </p>
                            <Button onClick={handleClose}>
                                Cerrar y ver catálogo
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
