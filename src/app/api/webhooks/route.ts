import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'
import {
  listWebhooks,
  addWebhook,
  deleteWebhook,
  updateWebhook,
  type WebhookEvent,
} from '@/lib/webhooks'

const VALID_EVENTS: WebhookEvent[] = [
  'group.created',
  'group.updated',
  'group.status_changed',
  'milestone.completed',
  'approval.changed',
]

const createSchema = z.object({
  url:    z.string().url('Must be a valid URL'),
  events: z.array(z.enum([
    'group.created', 'group.updated', 'group.status_changed',
    'milestone.completed', 'approval.changed',
  ])).min(1, 'Select at least one event'),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
  active: z.boolean().default(true),
})

export async function GET(_req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')
    return apiSuccess({ webhooks: listWebhooks(), availableEvents: VALID_EVENTS })
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const body   = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const webhook = addWebhook(parsed.data)
    return apiSuccess(webhook, 201)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return apiError('id is required', 400, 'MISSING_PARAM')

    const body    = await request.json()
    const updated = updateWebhook(id, body)
    if (!updated) return apiNotFound('Webhook')

    return apiSuccess(updated)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return apiError('id is required', 400, 'MISSING_PARAM')

    const deleted = deleteWebhook(id)
    if (!deleted) return apiNotFound('Webhook')

    return apiSuccess({ deleted: true })
  } catch (error) {
    return apiServerError(error)
  }
}
