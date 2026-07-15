import { Capacitor, registerPlugin } from '@capacitor/core';

const ThermalPrinter = registerPlugin('ThermalPrinter');

export const PRINTER_CONFIG_KEY = 'artdent_printer_lan';
export const PRINTER_USB_CONFIG_KEY = 'artdent_printer_usb';
export const PRINTER_TRANSPORT_KEY = 'artdent_printer_transport';

export function isNativePrintAvailable() {
    return Capacitor.isNativePlatform();
}

export function getStoredPrinterConfig() {
    if (typeof window === 'undefined') return { ip: '', port: 9100 };

    try {
        const raw = window.localStorage.getItem(PRINTER_CONFIG_KEY);
        if (!raw) return { ip: '', port: 9100 };

        const parsed = JSON.parse(raw);
        return { ip: parsed.ip || '', port: Number(parsed.port) || 9100 };
    } catch {
        return { ip: '', port: 9100 };
    }
}

export function setStoredPrinterConfig({ ip, port }) {
    const config = { ip: ip || '', port: Number(port) || 9100 };

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(PRINTER_CONFIG_KEY, JSON.stringify(config));
        } catch {
            // La impresión debe seguir funcionando aunque falle guardar la preferencia.
        }
    }

    return config;
}

export function getStoredPrinterTransport() {
    if (typeof window === 'undefined') return 'lan';

    try {
        return window.localStorage.getItem(PRINTER_TRANSPORT_KEY) || 'lan';
    } catch {
        return 'lan';
    }
}

export function setStoredPrinterTransport(transport) {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(PRINTER_TRANSPORT_KEY, transport);
        } catch {
            // ignore
        }
    }

    return transport;
}

export function getStoredUsbPrinterConfig() {
    if (typeof window === 'undefined') return { vendorId: null, productId: null, productName: '' };

    try {
        const raw = window.localStorage.getItem(PRINTER_USB_CONFIG_KEY);
        if (!raw) return { vendorId: null, productId: null, productName: '' };

        const parsed = JSON.parse(raw);
        return {
            vendorId: parsed.vendorId ?? null,
            productId: parsed.productId ?? null,
            productName: parsed.productName || '',
        };
    } catch {
        return { vendorId: null, productId: null, productName: '' };
    }
}

export function setStoredUsbPrinterConfig({ vendorId, productId, productName }) {
    const config = { vendorId, productId, productName: productName || '' };

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(PRINTER_USB_CONFIG_KEY, JSON.stringify(config));
        } catch {
            // ignore
        }
    }

    return config;
}

export async function listUsbPrinters() {
    if (!isNativePrintAvailable()) {
        return { ok: false, error: 'Solo disponible dentro de la app Android.', devices: [] };
    }

    try {
        const result = await ThermalPrinter.listUsbDevices();
        return { ok: true, devices: result?.devices || [] };
    } catch (error) {
        return { ok: false, error: error?.message || 'No se pudo listar dispositivos USB.', devices: [] };
    }
}

export async function printRawBytes(bytes, options = {}) {
    if (!isNativePrintAvailable()) {
        return { ok: false, error: 'La impresión directa a la impresora solo está disponible dentro de la app Android.' };
    }

    const transport = options.transport || getStoredPrinterTransport();

    if (transport === 'usb') {
        const config = (options.vendorId && options.productId)
            ? { vendorId: options.vendorId, productId: options.productId }
            : getStoredUsbPrinterConfig();

        if (!config.vendorId || !config.productId) {
            return { ok: false, error: 'Configurá la impresora USB antes de imprimir.' };
        }

        try {
            await ThermalPrinter.printRawUsb({
                vendorId: config.vendorId,
                productId: config.productId,
                bytesBase64: bytesToBase64(bytes),
            });
            return { ok: true };
        } catch (error) {
            return { ok: false, error: error?.message || 'No se pudo imprimir por USB.' };
        }
    }

    const config = options.ip ? { ip: options.ip, port: options.port || 9100 } : getStoredPrinterConfig();

    if (!config.ip) {
        return { ok: false, error: 'Configurá la IP de la impresora antes de imprimir.' };
    }

    try {
        await ThermalPrinter.printRaw({
            ip: config.ip,
            port: config.port,
            bytesBase64: bytesToBase64(bytes),
        });
        return { ok: true };
    } catch (error) {
        return { ok: false, error: error?.message || 'No se pudo imprimir.' };
    }
}

function bytesToBase64(bytes) {
    let binary = '';

    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
}
