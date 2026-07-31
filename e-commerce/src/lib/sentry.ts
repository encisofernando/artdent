import * as Sentry from '@sentry/react'

/**
 * Solo se activa si VITE_SENTRY_DSN está definido — en dev local (donde
 * normalmente no está seteado) esto es un no-op, no hace falta ninguna
 * condición extra por entorno.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  })
}

export { Sentry }
