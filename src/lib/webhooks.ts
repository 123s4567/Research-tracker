import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// File-based webhook store
// ---------------------------------------------------------------------------

const DATA_DIR  = join(process.cwd(), 'data')
const STORE_PATH = join(DATA_DIR, 'webhooks.json')

export type WebhookEvent =
  | 'group.created'
  | 'group.updated'
  | 'group.status_changed'
  | 'milestone.completed'
  | 'approval.changed'

export interface WebhookConfig {
  id:     string
  url:    string
  events: WebhookEvent[]
  secret: string
  active: boolean
  createdAt: string
}

function ensureStore(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(STORE_PATH)) writeFileSync(STORE_PATH, '[]', 'utf-8')
}

export function listWebhooks(): WebhookConfig[] {
  ensureStore()
  try { return JSON.parse(readFileSync(STORE_PATH, 'utf-8')) } catch { return [] }
}

export function addWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt'>): WebhookConfig {
  ensureStore()
  const webhooks = listWebhooks()
  const entry: WebhookConfig = {
    ...config,
    id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  webhooks.push(entry)
  writeFileSync(STORE_PATH, JSON.stringify(webhooks, null, 2), 'utf-8')
  return entry
}

export function deleteWebhook(id: string): boolean {
  ensureStore()
  const before  = listWebhooks()
  const after   = before.filter(w => w.id !== id)
  if (before.length === after.length) return false
  writeFileSync(STORE_PATH, JSON.stringify(after, null, 2), 'utf-8')
  return true
}

export function updateWebhook(id: string, patch: Partial<Omit<WebhookConfig, 'id' | 'createdAt'>>): WebhookConfig | null {
  ensureStore()
  const webhooks = listWebhooks()
  const idx = webhooks.findIndex(w => w.id === id)
  if (idx === -1) return null
  webhooks[idx] = { ...webhooks[idx], ...patch }
  writeFileSync(STORE_PATH, JSON.stringify(webhooks, null, 2), 'utf-8')
  return webhooks[idx]
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export async function sendWebhookEvent(
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = listWebhooks().filter(
    w => w.active && w.events.includes(event)
  )
  if (webhooks.length === 0) return

  const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload })

  await Promise.allSettled(
    webhooks.map(async wh => {
      try {
        const sig = await computeSignature(body, wh.secret)
        const res = await fetch(wh.url, {
          method:  'POST',
          headers: {
            'Content-Type':            'application/json',
            'X-MCA-Webhook-Event':     event,
            'X-MCA-Webhook-Signature': sig,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        })
        if (!res.ok) {
          console.warn(`[webhooks] ${wh.url} responded ${res.status}`)
        }
      } catch (err) {
        console.error(`[webhooks] delivery failed for ${wh.url}:`, err)
      }
    })
  )
}

async function computeSignature(body: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}
