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

// Cuánto tiempo sin que el SDK invoque NINGÚN callback (registro o alarma)
// antes de asumir que quedó colgado y reiniciarse solo. En producción se
// observó el proceso quedar "vivo" (según systemd, sin crashear, 30+ horas
// de uptime) pero mudo durante horas — el socket TCP con el terminal queda
// abierto pero el SDK deja de llamar al callback. Con el terminal
// reconectando en promedio cada 10-60s cuando funciona bien (visto en los
// logs reales de producción), 10 minutos de silencio total es un margen
// amplio que nunca debería dispararse en operación normal.
const WATCHDOG_TIMEOUT_MS = Number(process.env.ISUP_WATCHDOG_TIMEOUT_MS || 10 * 60 * 1000);
const WATCHDOG_CHECK_INTERVAL_MS = 60 * 1000;

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

const watchdogTimer = setInterval(() => {
    const idleMs = Date.now() - sdk.getLastActivityAt();

    if (idleMs < WATCHDOG_TIMEOUT_MS) return;

    // No llamamos sdk.stop() acá a propósito: si el SDK está colgado de
    // verdad, StopListen/Fini pueden bloquearse esperando un thread nativo
    // trabado y el watchdog nunca terminaría de reiniciar. process.exit()
    // mata TODOS los threads del proceso (comparten PID en Linux), así que
    // alcanza — y si por algo raro no alcanza, el SIGKILL de más abajo es la
    // red de seguridad final. index.js ya reinicia este proceso solo al
    // detectar que salió (worker.on('exit', ...)).
    logger.error('Watchdog: sin actividad del SDK, reiniciando proceso', {
        idleMs,
        thresholdMs: WATCHDOG_TIMEOUT_MS,
        lastActivityAt: new Date(sdk.getLastActivityAt()).toISOString(),
    });

    setTimeout(() => process.kill(process.pid, 'SIGKILL'), 5000).unref();
    process.exit(1);
}, WATCHDOG_CHECK_INTERVAL_MS);

function shutdown(signal) {
    logger.info('sdkWorker: apagando', { signal });
    clearInterval(watchdogTimer);
    sdk.stop();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info('sdkWorker arrancado', { port: PORT, pid: process.pid });
