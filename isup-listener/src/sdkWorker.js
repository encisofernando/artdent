// Proceso hijo aislado: acá y sólo acá se carga HCISUPSDK (koffi + los .so
// del SDK, que traen su propio OpenSSL 1.0.0 embebido). Nunca debe cargarse
// en el mismo proceso que hace fetch()/TLS con el OpenSSL propio de Node —
// confirmado con un core dump real que las dos versiones de OpenSSL en el
// mismo proceso chocan símbolos y crashean con SIGSEGV apenas Node necesita
// su propio crypto (ver docs/hikvision-isup-arquitectura.md § 6). Este
// proceso sólo habla con el padre (index.js) por IPC — nunca hace red él
// mismo, así que nunca necesita el crypto/TLS de Node.
import 'dotenv/config';
import { logger } from './logger.js';
import { createSdk } from './sdk.js';

const PORT = Number(process.env.ISUP_LISTEN_PORT || 15900);

const sdk = createSdk({
    onConnect: (payload) => process.send?.({ type: 'connect', payload }),
    onDisconnect: (payload) => process.send?.({ type: 'disconnect', payload }),
    onEvent: (payload) => process.send?.({ type: 'event', payload }),
});

sdk.start(PORT);

// El SDK corre su propio listener en threads nativos que Node no "ve" — sin
// nada más, el event loop se queda vacío y el proceso termina solo apenas
// termina este script síncrono. Este intervalo lo mantiene vivo.
setInterval(() => {}, 1 << 30);

function shutdown(signal) {
    logger.info('sdkWorker: apagando', { signal });
    sdk.stop();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info('sdkWorker arrancado', { port: PORT, pid: process.pid });
