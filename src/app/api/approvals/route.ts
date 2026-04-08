import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? 'Pending'

    const approvals = await prisma.approval.findMany({
      where: { status: status as 'Pending' | 'Approved' | 'Rejected' },
      include: {
        group: {
          select: { id: true, groupId: true, title: true, division: true },
        },
        faculty: { select: { id: true, name: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    return apiSuccess(approvals)
  } catch (error) {
    return apiServerError(error)
  }
}
