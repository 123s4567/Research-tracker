import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiCreated, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const milestoneSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  completionPercent: z.number().min(0).max(100).default(0),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const milestones = await prisma.milestone.findMany({
      where: { groupId: id },
      orderBy: { dueDate: 'asc' },
    })
    return apiSuccess(milestones)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const group = await prisma.researchGroup.findUnique({ where: { id } })
    if (!group) return apiNotFound('Research Group')

    const body = await request.json()
    const parsed = milestoneSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const milestone = await prisma.milestone.create({
      data: { groupId: id, ...parsed.data, dueDate: new Date(parsed.data.dueDate) },
    })

    return apiCreated(milestone)
  } catch (error) {
    return apiServerError(error)
  }
}
