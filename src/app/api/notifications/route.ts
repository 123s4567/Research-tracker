import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiUnauthorized()

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: Record<string, unknown> = {}
    if (unreadOnly) where.isRead = false

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        group: { select: { id: true, groupId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({ where: { isRead: false } })

    return apiSuccess({ notifications, unreadCount })
  } catch (error) {
    return apiServerError(error)
  }
}
