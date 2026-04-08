import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiCreated, apiError, apiServerError, getPaginationParams } from '@/lib/utils'

const createFacultySchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  title: z.string().optional(),
  maxGroups: z.number().min(1).max(20).default(6),
  preferredDomains: z.array(z.string()).default([]),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit } = getPaginationParams(searchParams)

    const faculty = await prisma.faculty.findMany({
      include: {
        _count: { select: { groups: true } },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    })

    // Compute utilization
    const result = faculty.map(f => ({
      ...f,
      groupCount: f._count.groups,
      utilizationPercent: Math.round((f._count.groups / f.maxGroups) * 100),
      isOverloaded: f._count.groups >= f.maxGroups,
    }))

    return apiSuccess(result)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')
    if (!['Admin', 'Coordinator'].includes(user.role)) {
      return apiError('Forbidden', 403, 'FORBIDDEN')
    }

    const body = await request.json()
    const parsed = createFacultySchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const faculty = await prisma.faculty.create({ data: parsed.data })
    return apiCreated(faculty)
  } catch (error) {
    return apiServerError(error)
  }
}
