import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiUnauthorized, apiNotFound, apiServerError } from '@/lib/utils'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiUnauthorized()

    const { id } = await params
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) return apiNotFound('Notification')

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    })

    return apiSuccess(updated)
  } catch (error) {
    return apiServerError(error)
  }
}
