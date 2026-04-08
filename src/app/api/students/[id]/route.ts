import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, apiNotFound, apiServerError } from '@/lib/utils'

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  roll: z.number().int().positive().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  gpa: z.number().min(0).max(10).optional(),
  status: z.enum(['Active', 'Inactive', 'Graduated', 'Withdrawn']).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            faculty: { select: { id: true, name: true } },
            domain: { select: { id: true, name: true } },
          },
        },
      },
    })
    if (!student) return apiNotFound('Student')
    return apiSuccess(student)
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

    const existing = await prisma.student.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Student')

    const student = await prisma.student.update({ where: { id }, data: parsed.data })
    return apiSuccess(student)
  } catch (error) {
    return apiServerError(error)
  }
}
