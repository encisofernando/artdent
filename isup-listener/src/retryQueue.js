import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { logger } from './logger.js';

/**
 * Cola de reintentos persistida en disco (JSON-lines) para eventos que no se
 * pudieron mandar a Laravel (deploy, reinicio, caída momentánea). Un fichaje
 * de asistencia no se debe perder porque Laravel estaba reiniciando — se
 * reintenta hasta que el POST responda 2xx.
 *
 * No es una cola de alto throughput (reescribe el archivo completo en cada
 * flush): para el volumen esperado (eventos de fichada de un puñado de
 * terminales) es más que suficiente y mucho más simple que meter Redis/SQLite
 * acá sólo para esto.
 */
export class RetryQueue {
    constructor(path) {
        this.path = path;
        mkdirSync(dirname(path), { recursive: true });
        this.items = this.load();
    }

    load() {
        if (!existsSync(this.path)) return [];

        try {
            return readFileSync(this.path, 'utf8')
                .split('\n')
                .filter(Boolean)
                .map((line) => JSON.parse(line));
        } catch (error) {
            logger.error('retry-queue: no se pudo leer el archivo, se arranca vacío', { error: String(error) });
            return [];
        }
    }

    persist() {
        writeFileSync(this.path, this.items.map((item) => JSON.stringify(item)).join('\n') + (this.items.length ? '\n' : ''));
    }

    push(item) {
        this.items.push({ ...item, enqueuedAt: new Date().toISOString(), attempts: 0 });
        this.persist();
    }

    get size() {
        return this.items.length;
    }

    /**
     * Intenta reenviar todo lo pendiente con `sendFn(item) => Promise<boolean>`
     * (true = entregado, se saca de la cola). Se corre en un intervalo desde
     * index.js.
     */
    async flush(sendFn) {
        if (this.items.length === 0) return;

        const remaining = [];

        for (const item of this.items) {
            try {
                const delivered = await sendFn(item);
                if (!delivered) {
                    remaining.push({ ...item, attempts: item.attempts + 1 });
                }
            } catch (error) {
                logger.warn('retry-queue: fallo al reintentar, se mantiene en cola', { error: String(error) });
                remaining.push({ ...item, attempts: item.attempts + 1 });
            }
        }

        this.items = remaining;
        this.persist();
    }
}
