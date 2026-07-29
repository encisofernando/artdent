import { logger } from './logger.js';

const BASE_URL = process.env.LARAVEL_BASE_URL;
const TOKEN = process.env.LARAVEL_INTERNAL_TOKEN;

async function post(path, body) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Laravel respondió ${response.status} en ${path}: ${text.slice(0, 300)}`);
    }

    return response.json().catch(() => ({}));
}

/**
 * Notifica conexión/desconexión de un terminal. No pasa por la cola de
 * reintentos: si esta llamada falla, la próxima conexión/desconexión real del
 * terminal la va a volver a mandar — no hay un evento irremplazable acá, sólo
 * un estado que se termina auto-corrigiendo.
 */
export async function notifyConnect({ accountId, sourceIp, serialNo, macAddress } = {}) {
    try {
        await post('/internal/isup/connect', {
            account_id: accountId, source_ip: sourceIp, serial_no: serialNo, mac_address: macAddress,
        });
        logger.info('Laravel notificado: connect', { accountId, serialNo });
    } catch (error) {
        logger.warn('No se pudo notificar connect a Laravel', { accountId, serialNo, error: String(error) });
    }
}

export async function notifyDisconnect({ accountId, serialNo } = {}) {
    try {
        await post('/internal/isup/disconnect', { account_id: accountId, serial_no: serialNo });
        logger.info('Laravel notificado: disconnect', { accountId, serialNo });
    } catch (error) {
        logger.warn('No se pudo notificar disconnect a Laravel', { accountId, serialNo, error: String(error) });
    }
}

/**
 * Manda un evento de acceso/asistencia normalizado. A diferencia de
 * connect/disconnect, este SÍ es irremplazable (una fichada real) — el
 * llamador debe encolarlo en RetryQueue si esto devuelve false.
 *
 * @returns {Promise<boolean>} true si Laravel lo recibió OK
 */
export async function sendEvent(payload) {
    try {
        await post('/internal/isup/events', payload);

        return true;
    } catch (error) {
        logger.warn('No se pudo mandar evento a Laravel, se encola para reintentar', {
            accountId: payload.account_id,
            error: String(error),
        });

        return false;
    }
}
