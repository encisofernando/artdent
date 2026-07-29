import 'dotenv/config';
import { fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from './logger.js';
import { notifyConnect, notifyDisconnect, sendEvent } from './laravelClient.js';
import { RetryQueue } from './retryQueue.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RETRY_INTERVAL_MS = Number(process.env.RETRY_INTERVAL_MS || 5000);

const retryQueue = new RetryQueue(process.env.RETRY_QUEUE_PATH || './data/retry-queue.jsonl');

// El SDK real (HCISUPSDK) corre en un proceso hijo aparte — ver sdkWorker.js
// para el porqué (choque de OpenSSL). Este proceso (el que corre bajo
// systemd) nunca carga koffi/el SDK directo, sólo habla con el hijo por IPC
// y hace las llamadas fetch()/HTTPS a Laravel.
let worker = null;
let shuttingDown = false;

function startWorker() {
    worker = fork(path.join(__dirname, 'sdkWorker.js'));

    worker.on('message', async (msg) => {
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'connect') {
            const { accountId, sourceIp, serialNo, macAddr } = msg.payload;
            logger.info('Terminal conectado', { accountId, sourceIp, serialNo, macAddr });
            await notifyConnect({ accountId, sourceIp, serialNo, macAddress: macAddr });
        } else if (msg.type === 'disconnect') {
            const { accountId, serialNo } = msg.payload;
            logger.info('Terminal desconectado', { accountId, serialNo });
            await notifyDisconnect({ accountId, serialNo });
        } else if (msg.type === 'event') {
            const { accountId, serialNo, macAddress, eventType, eventTime, accessControllerEvent, rawPayload, format } = msg.payload;
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
        }
    });

    worker.on('exit', (code, signal) => {
        worker = null;

        if (shuttingDown) return;

        logger.warn('sdkWorker terminó inesperadamente, reiniciando en 3s', { code, signal });
        setTimeout(startWorker, 3000);
    });
}

startWorker();

const retryTimer = setInterval(() => {
    if (retryQueue.size === 0) return;

    logger.info('Reintentando eventos pendientes', { pending: retryQueue.size });
    retryQueue.flush(sendEvent);
}, RETRY_INTERVAL_MS);

function shutdown(signal) {
    logger.info('Apagando isup-listener', { signal });
    shuttingDown = true;
    clearInterval(retryTimer);
    worker?.kill();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info('isup-listener (proceso principal) arrancado');
