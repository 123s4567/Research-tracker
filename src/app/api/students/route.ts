import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiCreated, apiError, apiServerError, getPaginationParams } from '@/lib/utils'

const createStudentSchema = z.object({
  prn: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  division: z.enum(['A', 'B']),
  roll: z.number().int().positive(),
  semester: z.string().default('II'),
  academicYear: z.string().default('2025-26'),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  gpa: z.number().min(0).max(10).default(0),
  groupId: z.string().cuid(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit } = getPaginationParams(searchParams)

    const where: Record<string, unknown> = {}
    const division = searchParams.get('division')
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search')

    if (division) where.division = division
    if (groupId) where.groupId = groupId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { prn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        group: { select: { id: true, groupId: true, title: true } },
      },
      orderBy: [{ division: 'asc' }, { roll: 'asc' }],
      skip,
      take: limit,
    })

    return apiSuccess(students)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const existing = await prisma.student.findUnique({ where: { prn: parsed.data.prn } })
    if (existing) return apiError('Student with this PRN already exists', 409, 'DUPLICATE_PRN')

    const student = await prisma.student.create({ data: parsed.data })

    // Update group member count
    await prisma.researchGroup.update({
      where: { id: parsed.data.groupId },
      data: { memberCount: { increment: 1 } },
    })

    return apiCreated(student)
  } catch (error) {
    return apiServerError(error)
  }
}
