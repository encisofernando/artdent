import { useState } from 'react';
import { Printer, X, Loader2, CheckCircle2, CircleX, Wifi, Usb } from 'lucide-react';
import {
    isNativePrintAvailable, getStoredPrinterConfig, setStoredPrinterConfig, printRawBytes,
    getStoredPrinterTransport, setStoredPrinterTransport,
    getStoredUsbPrinterConfig, setStoredUsbPrinterConfig, listUsbPrinters,
} from '@/lib/nativePrinter';
import { buildTestTicket } from '@/lib/escpos';

const AD = { blue: '#397B9C', teal: '#49949C' };

/**
 * Modal de configuración de impresora térmica — pensado para terminales
 * kiosco donde la pantalla queda fijada (screen pinning) y no hay forma de
 * llegar a Administración → Configuración para cargar la IP. Misma lógica
 * que esa pantalla (ver Admin/Settings.jsx), con estilo oscuro propio del
 * kiosk en vez de la librería de componentes del panel admin.
 */
export default function PrinterConfigModal({ open, onClose, companyName = 'ArtDent' }) {
    const [printerConfig, setPrinterConfig] = useState(() => getStoredPrinterConfig());
    const [printerTransport, setPrinterTransport] = useState(() => getStoredPrinterTransport());
    const [usbPrinterConfig, setUsbPrinterConfig] = useState(() => getStoredUsbPrinterConfig());
    const [usbDevices, setUsbDevices] = useState([]);
    const [usbScanState, setUsbScanState] = useState({ status: 'idle', message: '' });
    const [testState, setTestState] = useState({ status: 'idle', message: '' });

    if (!open) return null;

    const savePrinterConfig = (next) => setPrinterConfig(setStoredPrinterConfig(next));
    const saveTransport = (transport) => setPrinterTransport(setStoredPrinterTransport(transport));
    const saveUsbPrinterConfig = (next) => setUsbPrinterConfig(setStoredUsbPrinterConfig(next));

    const handleScanUsb = async () => {
        setUsbScanState({ status: 'loading', message: '' });
        const result = await listUsbPrinters();

        if (!result.ok) {
            setUsbScanState({ status: 'error', message: result.error });
            return;
        }

        setUsbDevices(result.devices);
        setUsbScanState({
            status: 'success',
            message: result.devices.length ? `${result.devices.length} dispositivo(s) encontrado(s).` : 'No se encontró ningún dispositivo USB conectado.',
        });
    };

    const handleTestPrint = async () => {
        setTestState({ status: 'loading', message: '' });
        const ticket = buildTestTicket({ companyName });
        const result = await printRawBytes(ticket, printerTransport === 'usb' ? usbPrinterConfig : printerConfig);

        setTestState(result.ok
            ? { status: 'success', message: 'Enviado a la impresora.' }
            : { status: 'error', message: result.error || 'No se pudo imprimir.' });
    };

    const inp = 'w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none focus:border-sky-500';
    const lbl = 'block text-xs font-bold mb-1.5 text-slate-300';

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})` }}>
                            <Printer size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Configurar impresora</h3>
                            <p className="text-xs text-slate-400">Se guarda en este dispositivo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Cerrar">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {!isNativePrintAvailable() && (
                    <p className="text-xs rounded-lg px-3 py-2 bg-amber-500/10 text-amber-400">
                        Esta función solo está disponible dentro de la app Android — desde el navegador podés dejar la configuración lista, pero la prueba de impresión no va a funcionar acá.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'lan', label: 'Red (WiFi)', icon: Wifi },
                        { id: 'usb', label: 'USB-OTG', icon: Usb },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => saveTransport(opt.id)}
                            className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all"
                            style={printerTransport === opt.id
                                ? { borderColor: AD.teal, background: `${AD.teal}1a`, color: AD.teal }
                                : { borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
                        >
                            <opt.icon size={18} />
                            {opt.label}
                        </button>
                    ))}
                </div>

                {printerTransport === 'lan' ? (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className={lbl}>IP de la impresora</label>
                            <input
                                type="text"
                                value={printerConfig.ip}
                                onChange={(e) => savePrinterConfig({ ...printerConfig, ip: e.target.value })}
                                placeholder="192.168.1.50"
                                className={inp}
                                style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label className={lbl}>Puerto</label>
                            <input
                                type="number"
                                value={printerConfig.port}
                                onChange={(e) => savePrinterConfig({ ...printerConfig, port: e.target.value })}
                                placeholder="9100"
                                className={inp}
                                style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={lbl}>Impresora USB conectada</label>
                            <button
                                type="button"
                                onClick={handleScanUsb}
                                disabled={usbScanState.status === 'loading'}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-50"
                                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}
                            >
                                {usbScanState.status === 'loading'
                                    ? <span className="inline-flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Buscando...</span>
                                    : 'Buscar dispositivos'}
                            </button>
                        </div>

                        {usbScanState.message && (
                            <p className={`text-xs ${usbScanState.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                                {usbScanState.message}
                            </p>
                        )}

                        {usbDevices.map((device) => {
                            const isSelected = usbPrinterConfig.vendorId === device.vendorId && usbPrinterConfig.productId === device.productId;
                            return (
                                <button
                                    key={`${device.vendorId}-${device.productId}`}
                                    type="button"
                                    onClick={() => saveUsbPrinterConfig(device)}
                                    className="w-full text-left px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all"
                                    style={isSelected
                                        ? { borderColor: AD.teal, background: `${AD.teal}1a`, color: AD.teal }
                                        : { borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}
                                >
                                    {device.productName || 'Dispositivo USB'}
                                    <span className="block text-[11px] font-medium opacity-70">
                                        Vendor {device.vendorId} · Product {device.productId}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleTestPrint}
                        disabled={testState.status === 'loading' || (printerTransport === 'lan' ? !printerConfig.ip : !usbPrinterConfig.vendorId)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg,${AD.blue},${AD.teal})` }}
                    >
                        {testState.status === 'loading'
                            ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Imprimiendo...</span>
                            : 'Probar impresión'}
                    </button>
                </div>

                {testState.status === 'success' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400"><CheckCircle2 size={14} /> {testState.message}</span>
                )}
                {testState.status === 'error' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400"><CircleX size={14} /> {testState.message}</span>
                )}
            </div>
        </div>
    );
}
