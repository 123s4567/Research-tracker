import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiCreated, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  mentions: z.array(z.string()).default([]),
  studentId: z.string().cuid().optional(),
  facultyId: z.string().cuid().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: { groupId: id },
      include: {
        student: { select: { id: true, name: true, prn: true } },
        faculty: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return apiSuccess(comments)
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
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const comment = await prisma.comment.create({
      data: { groupId: id, ...parsed.data },
      include: {
        student: { select: { id: true, name: true, prn: true } },
        faculty: { select: { id: true, name: true } },
      },
    })

    return apiCreated(comment)
  } catch (error) {
    return apiServerError(error)
  }
}
