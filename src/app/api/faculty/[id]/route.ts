import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  maxGroups: z.number().min(1).max(20).optional(),
  preferredDomains: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalPublications: z.number().min(0).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        groups: {
          select: {
            id: true, groupId: true, title: true, status: true,
            division: true, memberCount: true,
            domain: { select: { name: true, color: true } },
          },
          orderBy: { groupId: 'asc' },
        },
        _count: { select: { groups: true } },
      },
    })
    if (!faculty) return apiNotFound('Faculty')

    return apiSuccess({
      ...faculty,
      groupCount: faculty._count.groups,
      utilizationPercent: Math.round((faculty._count.groups / faculty.maxGroups) * 100),
    })
  } catch (error) {
    return apiServerError(error)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const existing = await prisma.faculty.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Faculty')

    const faculty = await prisma.faculty.update({ where: { id }, data: parsed.data })
    return apiSuccess(faculty)
  } catch (error) {
    return apiServerError(error)
  }
}
