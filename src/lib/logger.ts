/**
 * Lightweight structured logger for MCA Research Tracker.
 * Uses winston in production, console in dev (avoids heavy deps in Edge runtime).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
  [key: string]: unknown
}

function formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
  const ts  = new Date().toISOString()
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`
  if (!meta || Object.keys(meta).length === 0) return base
  return `${base} ${JSON.stringify(meta)}`
}

const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  debug(message: string, meta?: LogMeta) {
    if (isDev) console.debug(formatMessage('debug', message, meta))
  },

  info(message: string, meta?: LogMeta) {
    console.info(formatMessage('info', message, meta))
  },

  warn(message: string, meta?: LogMeta) {
    console.warn(formatMessage('warn', message, meta))
  },

  error(message: string, meta?: LogMeta) {
    console.error(formatMessage('error', message, meta))
  },

  // HTTP request logger — call at top of API handlers
  request(method: string, path: string, statusCode?: number, durationMs?: number) {
    const meta: LogMeta = { method, path }
    if (statusCode !== undefined) meta.status = statusCode
    if (durationMs !== undefined) meta.ms = durationMs
    console.info(formatMessage('info', 'HTTP', meta))
  },
}
