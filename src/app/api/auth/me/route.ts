import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const tokenUser = await getCurrentUser()
    if (!tokenUser) return apiUnauthorized()

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, email: true, name: true, role: true, linkedId: true },
    })
    if (!user) return apiUnauthorized()

    return apiSuccess({ user })
  } catch (error) {
    return apiServerError(error)
  }
}
