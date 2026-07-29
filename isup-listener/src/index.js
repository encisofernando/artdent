import 'dotenv/config';
import { logger } from './logger.js';
import { createSdk } from './sdk.js';
import { notifyConnect, notifyDisconnect, sendEvent } from './laravelClient.js';
import { RetryQueue } from './retryQueue.js';

const PORT = Number(process.env.ISUP_LISTEN_PORT || 15900);
const RETRY_INTERVAL_MS = Number(process.env.RETRY_INTERVAL_MS || 5000);

const retryQueue = new RetryQueue(process.env.RETRY_QUEUE_PATH || './data/retry-queue.jsonl');

const sdk = createSdk({
    onConnect: async ({ accountId, sourceIp, serialNo, macAddr }) => {
        logger.info('Terminal conectado', { accountId, sourceIp, serialNo, macAddr });
        await notifyConnect({ accountId, sourceIp, serialNo, macAddress: macAddr });
    },

    onDisconnect: async ({ accountId, serialNo }) => {
        logger.info('Terminal desconectado', { accountId, serialNo });
        await notifyDisconnect({ accountId, serialNo });
    },

    onEvent: async ({ accountId, serialNo, macAddress, eventType, eventTime, accessControllerEvent, rawPayload, format }) => {
        const payload = {
            account_id: accountId,
            serial_no: serialNo,
            mac_address: macAddress,
            event_type: eventType,
            event_time: eventTime,
            // Modo real (HCISUPSDK): el ACS event llega crudo (XML/JSON) desde
            // NET_EHOME_ALARM_ISAPI_INFO — Laravel lo decodifica con la misma
            // lógica que ya usa el webhook ISAPI. Modo mock: manda el objeto
            // ya armado directo, sin pasar por decode.
            raw_payload: rawPayload,
            format,
            access_controller_event: accessControllerEvent,
        };

        logger.info('Evento recibido', { accountId, serialNo, eventType });

        const delivered = await sendEvent(payload);

        if (!delivered) {
            retryQueue.push(payload);
        }
    },
});

sdk.start(PORT);

const retryTimer = setInterval(() => {
    if (retryQueue.size === 0) return;

    logger.info('Reintentando eventos pendientes', { pending: retryQueue.size });
    retryQueue.flush(sendEvent);
}, RETRY_INTERVAL_MS);

function shutdown(signal) {
    logger.info('Apagando isup-listener', { signal });
    clearInterval(retryTimer);
    sdk.stop();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info('isup-listener arrancado', { port: PORT });
