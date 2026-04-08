import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiCreated, apiError, apiServerError } from '@/lib/utils'

const createDomainSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      include: { _count: { select: { groups: true } } },
      orderBy: { groupCount: 'desc' },
    })
    return apiSuccess(domains)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const body = await request.json()
    const parsed = createDomainSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const existing = await prisma.domain.findUnique({ where: { name: parsed.data.name } })
    if (existing) return apiError('Domain with this name already exists', 409, 'DUPLICATE_DOMAIN')

    const domain = await prisma.domain.create({ data: parsed.data })
    return apiCreated(domain)
  } catch (error) {
    return apiServerError(error)
  }
}
