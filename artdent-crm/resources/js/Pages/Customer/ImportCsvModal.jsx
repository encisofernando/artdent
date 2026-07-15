import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import SearchableSelect from '@/Components/SearchableSelect';
import { useTheme } from '@/Contexts/ThemeContext';
import { router } from '@inertiajs/react';
import axios from 'axios';
import Papa from 'papaparse';

const CUSTOMER_FIELDS = [
    { key: 'name', label: 'Nombre', required: true },
    { key: 'dni', label: 'DNI', required: false },
    { key: 'email', label: 'Correo Electrónico', required: false },
    { key: 'phone', label: 'Teléfono', required: false },
    { key: 'address', label: 'Dirección', required: false },
    { key: 'city', label: 'Ciudad', required: false },
    { key: 'province', label: 'Provincia', required: false },
];

export default function ImportCsvModal({ isOpen, onClose }) {
    const { isDark } = useTheme();
    const [step, setStep] = useState(1);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [columnMap, setColumnMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const resetState = () => {
        setStep(1);
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMap({});
        setError('');
        setSuccess('');
    };

    const handleClose = () => { resetState(); onClose(); };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    setCsvHeaders(Object.keys(results.data[0]));
                    setCsvData(results.data);

                    const initialMap = {};
                    Object.keys(results.data[0]).forEach((header) => {
                        const h = header.toLowerCase();
                        if (h.includes('nombre') || h === 'name') initialMap.name = header;
                        if (h === 'dni') initialMap.dni = header;
                        if (h.includes('mail')) initialMap.email = header;
                        if (h.includes('tel') || h.includes('phone')) initialMap.phone = header;
                        if (h.includes('direcc') || h === 'address') initialMap.address = header;
                        if (h.includes('ciudad') || h === 'city') initialMap.city = header;
                        if (h.includes('provincia') || h === 'province') initialMap.province = header;
                    });
                    setColumnMap(initialMap);
                    setStep(2);
                } else {
                    setError('El archivo CSV está vacío o no se pudo leer.');
                }
            },
            error: (err) => setError('Error leyendo CSV: ' + err.message),
        });
    };

    const handleMapChange = (field, header) => setColumnMap((prev) => ({ ...prev, [field]: header }));

    const submitImport = () => {
        if (!columnMap.name) {
            setError('Debés mapear al menos el campo Nombre.');
            return;
        }

        setLoading(true);
        setError('');

        const mappedData = csvData.map((row) => {
            const item = {};
            Object.keys(columnMap).forEach((key) => {
                if (columnMap[key]) item[key] = row[columnMap[key]];
            });
            return item;
        }).filter((item) => item.name);

        axios.post(route('customers.import-csv'), { customers: mappedData })
            .then((res) => {
                setSuccess(`${res.data.imported} cliente(s) importado(s)/actualizado(s)` + (res.data.skipped ? `, ${res.data.skipped} omitido(s) por datos duplicados.` : '.'));
                setStep(3);
                router.reload({ only: ['items'] });
            })
            .catch((err) => setError(err.response?.data?.message ?? 'Error importando clientes.'))
            .finally(() => setLoading(false));
    };

    const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-[700px] border-none shadow-2xl p-0 overflow-hidden font-sans ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
                <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                        <DialogTitle className="text-xl font-bold">Importar Clientes desde CSV</DialogTitle>
                        <DialogDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Se actualizan clientes existentes por DNI o correo, y se crean los nuevos.
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

                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCsvUpload} />
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border dark:bg-slate-800 dark:border-slate-700">
                                <Upload size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Subir Archivo CSV</h3>
                            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Asegurate de que la primera fila contenga los títulos.</p>
                            <Button onClick={() => fileInputRef.current?.click()}>Seleccionar Archivo</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2 dark:border-slate-700">Mapear Columnas</h3>
                            <p className="text-sm text-slate-500">Relacioná las columnas de tu CSV con los campos de ArtDent.</p>

                            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <table className="w-full text-sm text-left">
                                    <thead className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
                                        <tr>
                                            <th className="px-4 py-3 font-semibold w-1/2 border-r dark:border-slate-700">Campo en ArtDent</th>
                                            <th className="px-4 py-3 font-semibold w-1/2">Columna en tu CSV</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-slate-700">
                                        {CUSTOMER_FIELDS.map((field) => (
                                            <tr key={field.key}>
                                                <td className="px-4 py-2 border-r dark:border-slate-700">
                                                    <div className="font-medium">{field.label}</div>
                                                    {field.required && <span className="text-[10px] text-red-500 font-bold tracking-wider">REQUERIDO</span>}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <SearchableSelect
                                                        value={columnMap[field.key] || ''}
                                                        onChange={(v) => handleMapChange(field.key, v)}
                                                        placeholder="-- Ignorar --"
                                                        options={csvHeaders.map((h) => ({ value: h, label: h }))}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-xs text-slate-500 italic">{csvData.length} fila(s) detectada(s) en el archivo.</p>

                            <div className="flex justify-end pt-4 gap-3">
                                <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                                <Button
                                    onClick={submitImport}
                                    disabled={loading || !columnMap.name}
                                    style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                                    className="text-white border-none min-w-[150px]"
                                >
                                    {loading ? 'Procesando...' : `Importar ${csvData.length} cliente(s)`}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">¡Importación completada!</h3>
                            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{success}</p>
                            <Button onClick={handleClose}>Cerrar</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
