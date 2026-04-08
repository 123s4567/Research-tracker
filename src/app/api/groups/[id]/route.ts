import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const updateGroupSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().optional(),
  division: z.enum(['A', 'B']).optional(),
  type: z.enum(['Respondent', 'NonResp', 'CrossDiv']).optional(),
  facultyId: z.string().cuid().optional(),
  domainId: z.string().cuid().optional(),
  targetEndDate: z.string().datetime().optional().nullable(),
  successScore: z.number().min(0).max(100).optional(),
  completionPercent: z.number().min(0).max(100).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const group = await prisma.researchGroup.findUnique({
      where: { id },
      include: {
        faculty: true,
        domain: true,
        students: { orderBy: [{ division: 'asc' }, { roll: 'asc' }] },
        milestones: { orderBy: { dueDate: 'asc' } },
        comments: {
          include: {
            student: { select: { id: true, name: true, prn: true } },
            faculty: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        approvals: {
          include: { faculty: { select: { id: true, name: true } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { students: true } },
      },
    })
    if (!group) return apiNotFound('Research Group')
    return apiSuccess(group)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const body = await request.json()
    const parsed = updateGroupSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const existing = await prisma.researchGroup.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Research Group')

    const { targetEndDate, ...rest } = parsed.data
    const updateData: Record<string, unknown> = { ...rest }
    if (targetEndDate !== undefined) {
      updateData.targetEndDate = targetEndDate ? new Date(targetEndDate) : null
    }

    const group = await prisma.researchGroup.update({
      where: { id },
      data: updateData,
      include: {
        faculty: { select: { id: true, name: true, title: true } },
        domain: { select: { id: true, name: true, color: true } },
      },
    })

    await prisma.changeLog.create({
      data: {
        groupId: id,
        changeType: 'UPDATED',
        details: { changes: rest },
        changedBy: user.userId,
      },
    })

    return apiSuccess(group)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')
    if (!['Admin', 'Coordinator'].includes(user.role)) {
      return apiError('Forbidden', 403, 'FORBIDDEN')
    }

    const { id } = await params
    const existing = await prisma.researchGroup.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Research Group')

    await prisma.researchGroup.delete({ where: { id } })
    return apiSuccess({ message: 'Group deleted successfully' })
  } catch (error) {
    return apiServerError(error)
  }
}
