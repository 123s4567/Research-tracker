import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const schema = z.object({ comments: z.string().min(1, 'Rejection reason required') })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const approval = await prisma.approval.findUnique({ where: { id } })
    if (!approval) return apiNotFound('Approval')

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return apiError('Rejection reason is required', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const updated = await prisma.approval.update({
      where: { id },
      data: { status: 'Rejected', comments: parsed.data.comments, approvalDate: new Date() },
    })

    await prisma.researchGroup.update({
      where: { id: approval.groupId },
      data: { approvalStatus: 'Rejected' },
    })

    return apiSuccess(updated)
  } catch (error) {
    return apiServerError(error)
  }
}
