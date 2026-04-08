import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const schema = z.object({ comments: z.string().optional() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const approval = await prisma.approval.findUnique({ where: { id } })
    if (!approval) return apiNotFound('Approval')

    const body = await request.json().catch(() => ({}))
    const { comments } = schema.parse(body)

    const updated = await prisma.approval.update({
      where: { id },
      data: { status: 'Approved', comments, approvalDate: new Date() },
    })

    // Update group approvalStatus if all approvals are done
    const allApprovals = await prisma.approval.findMany({ where: { groupId: approval.groupId } })
    const allApproved = allApprovals.every(a => a.id === id || a.status === 'Approved')
    if (allApproved) {
      await prisma.researchGroup.update({
        where: { id: approval.groupId },
        data: { approvalStatus: 'Approved', approvalDate: new Date(), status: 'Active' },
      })
    }

    return apiSuccess(updated)
  } catch (error) {
    return apiServerError(error)
  }
}
