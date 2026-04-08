import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'
import { sendStatusChangedEmail } from '@/lib/email'
import { sendWebhookEvent } from '@/lib/webhooks'
import { logger } from '@/lib/logger'

const statusSchema = z.object({
  status: z.enum(['Proposed', 'InReview', 'Active', 'Completed', 'OnHold']),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const body = await request.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Invalid status', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const existing = await prisma.researchGroup.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Research Group')

    const group = await prisma.researchGroup.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    await prisma.changeLog.create({
      data: {
        groupId: id,
        changeType: 'STATUS_CHANGED',
        details: { from: existing.status, to: parsed.data.status },
        changedBy: user.userId,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        groupId: id,
        type: 'StatusChanged',
        title: 'Group Status Updated',
        message: `Group ${existing.groupId} status changed from ${existing.status} to ${parsed.data.status}`,
        actionUrl: `/groups/${id}`,
      },
    })

    // Fire-and-forget side effects
    Promise.allSettled([
      sendStatusChangedEmail({
        to:         'coordinator@nmiet.edu',
        groupId:    existing.groupId,
        groupTitle: existing.title,
        oldStatus:  existing.status,
        newStatus:  parsed.data.status,
      }),
      sendWebhookEvent('group.status_changed', {
        id:        id,
        groupId:   existing.groupId,
        oldStatus: existing.status,
        newStatus: parsed.data.status,
      }),
    ]).catch(err => logger.warn('Status-change side effects failed', { err: String(err) }))

    logger.info('Group status changed', {
      groupId: existing.groupId,
      from: existing.status,
      to: parsed.data.status,
      by: user.userId,
    })

    return apiSuccess(group)
  } catch (error) {
    return apiServerError(error)
  }
}
