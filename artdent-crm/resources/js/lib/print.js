const DEFAULT_PRINT_SERVER_URL = import.meta.env.VITE_PRINT_SERVER_URL || 'http://localhost:1234/print';

export const TICKET_FORMAT_STORAGE_KEY = 'artdent_ticket_format';
export const MONTSERRAT_PRINT_HEAD = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet">';

const THERMAL_MODES = new Set(['80mm', '57mm', '54mm']);
const THERMAL_ZONE_WIDTHS = {
    '57mm': '180px',
    '80mm': '260px',
};

export const isThermalMode = (mode) => THERMAL_MODES.has(mode);
export const normalizePrintMode = (mode) => (mode === '54mm' ? '57mm' : mode);
export const getThermalZoneWidth = (mode) => THERMAL_ZONE_WIDTHS[normalizePrintMode(mode)] || THERMAL_ZONE_WIDTHS['80mm'];
// Keep the original 57mm scaling that we know prints correctly.
// 80mm stays at 1x until we isolate the Windows direct-print mismatch there.
export const getThermalPrintZoom = (mode) => (normalizePrintMode(mode) === '57mm' ? 388 / 180 : 1);

export function getStoredTicketFormat(fallback = '80mm') {
    if (typeof window === 'undefined') return fallback;

    try {
        return window.localStorage.getItem(TICKET_FORMAT_STORAGE_KEY) || fallback;
    } catch {
        return fallback;
    }
}

export function setStoredTicketFormat(format) {
    if (typeof window === 'undefined') return format;

    try {
        window.localStorage.setItem(TICKET_FORMAT_STORAGE_KEY, format);
    } catch {
        // Ignore localStorage errors; printing should keep working.
    }

    return format;
}

export function collectPrintAssets() {
    if (typeof document === 'undefined') return '';

    return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');
}

export function buildPrintHtml({
    title = 'ArtDent',
    bodyHtml,
    pageSize = 'auto',
    zoneWidth,
    zoom = 1,
    extraHead = '',
    extraStyles = '',
    includeDocumentStyles = true,
    zoneSelector = '#print-zone',
    bodyStyle = '',
}) {
    const assets = includeDocumentStyles ? collectPrintAssets() : '';
    const zoneRules = [
        zoneWidth ? `width: ${zoneWidth} !important; max-width: ${zoneWidth} !important;` : '',
        'box-shadow: none !important;',
        'margin: 0 !important;',
        'background: #fff !important;',
        zoom && zoom !== 1 ? `zoom: ${zoom}; transform-origin: top left;` : '',
    ]
        .filter(Boolean)
        .join(' ');

    return `<!DOCTYPE html>
<html>
    <head>
        <title>${title}</title>
        <base href="${window.location.origin}">
        ${extraHead}
        ${assets}
        <style>
            @page { margin: 0; size: ${pageSize}; }
            * { box-sizing: border-box; }
            body {
                margin: 0;
                padding: 0;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                ${bodyStyle}
            }
            ${zoneSelector} {
                ${zoneRules}
            }
            img { display: block; }
            ${extraStyles}
        </style>
    </head>
    <body>${bodyHtml}</body>
</html>`;
}

export function openBrowserPrint(html, { delay = 500 } = {}) {
    const win = window.open('', '_blank');

    if (!win) {
        return false;
    }

    win.document.write(html);
    win.document.close();

    window.setTimeout(() => {
        win.focus?.();
        win.print();
        win.close();
    }, delay);

    return true;
}

export async function printHtmlWithElectron({ html, mode = '80mm' }) {
    try {
        const response = await fetch(DEFAULT_PRINT_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html,
                mode: normalizePrintMode(mode),
            }),
        });

        let payload = null;
        try {
            payload = await response.clone().json();
        } catch {
            payload = null;
        }

        if (!response.ok) {
            return {
                ok: false,
                type: 'server',
                status: response.status,
                error: payload?.error || `HTTP ${response.status}`,
            };
        }

        return {
            ok: true,
            payload,
        };
    } catch (error) {
        return {
            ok: false,
            type: 'network',
            error: error?.message || 'No se pudo contactar el servidor de impresión.',
        };
    }
}

export async function printElementWithElectron({
    element,
    elementId = 'print-zone',
    title = 'ArtDent',
    mode = '80mm',
    pageSize = 'auto',
    zoneWidth,
    zoom = 1,
    extraHead = '',
    extraStyles = '',
    includeDocumentStyles = true,
    zoneSelector = '#print-zone',
    bodyStyle = '',
    fallbackToBrowser = false,
    browserDelay = 500,
}) {
    const target = typeof element === 'string'
        ? document.getElementById(element)
        : element || document.getElementById(elementId);

    if (!target) {
        return {
            ok: false,
            type: 'missing-element',
            error: 'No se encontró el contenido a imprimir.',
        };
    }

    const html = buildPrintHtml({
        title,
        bodyHtml: target.outerHTML,
        pageSize,
        zoneWidth,
        zoom,
        extraHead,
        extraStyles,
        includeDocumentStyles,
        zoneSelector,
        bodyStyle,
    });

    const result = await printHtmlWithElectron({ html, mode });

    if (!result.ok && fallbackToBrowser) {
        openBrowserPrint(html, { delay: browserDelay });
    }

    return {
        ...result,
        html,
        fallbackUsed: !result.ok && fallbackToBrowser,
    };
}
