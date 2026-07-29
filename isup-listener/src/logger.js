const LEVELS = ['debug', 'info', 'warn', 'error'];
const configuredLevel = LEVELS.includes(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'info';
const minIndex = LEVELS.indexOf(configuredLevel);

function log(level, message, meta = {}) {
    if (LEVELS.indexOf(level) < minIndex) return;

    const line = {
        ts: new Date().toISOString(),
        level,
        message,
        ...meta,
    };

    // JSON lines: fácil de parsear con journalctl/logrotate, mismo criterio
    // que los logs estructurados que ya usa artdent-crm.
    (level === 'error' || level === 'warn' ? console.error : console.log)(JSON.stringify(line));
}

export const logger = {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
};
