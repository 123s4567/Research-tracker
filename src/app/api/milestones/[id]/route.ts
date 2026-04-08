import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'
import { sendWebhookEvent } from '@/lib/webhooks'
import { logger } from '@/lib/logger'

const patchSchema = z.object({
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Overdue']).optional(),
  completionPercent: z.number().min(0).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const existing = await prisma.milestone.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Milestone')

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const { dueDate, ...rest } = parsed.data
    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      },
    })

    // Update group completion percent based on milestones
    const milestones = await prisma.milestone.findMany({
      where: { groupId: existing.groupId },
    })
    const completedCount = milestones.filter(m => m.status === 'Completed').length
    const completionPercent = milestones.length
      ? Math.round((completedCount / milestones.length) * 100)
      : 0

    await prisma.researchGroup.update({
      where: { id: existing.groupId },
      data: { completionPercent },
    })

    // Fire webhook if milestone was just completed
    if (parsed.data.status === 'Completed' && existing.status !== 'Completed') {
      sendWebhookEvent('milestone.completed', {
        milestoneId: id,
        name:        milestone.name,
        groupId:     existing.groupId,
      }).catch(err => logger.warn('Milestone webhook failed', { err: String(err) }))
    }

    return apiSuccess(milestone)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const existing = await prisma.milestone.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Milestone')

    await prisma.milestone.delete({ where: { id } })
    return apiSuccess({ deleted: true })
  } catch (error) {
    return apiServerError(error)
  }
}
