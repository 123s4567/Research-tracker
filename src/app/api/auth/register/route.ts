import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { apiSuccess, apiError, apiServerError } from '@/lib/utils'
import { rateLimit } from '@/lib/rateLimit'
import { cookies } from 'next/headers'

const registerSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name:     z.string().min(2).max(100),
  role:     z.enum(['Student', 'Faculty', 'Coordinator', 'Admin']).default('Student'),
  // Optional: link to faculty/student record
  linkedId: z.string().cuid().optional(),
})

export async function POST(request: Request) {
  // Rate limit: 5 registrations per minute per IP
  const limited = rateLimit(request, { limit: 5, windowSec: 60 })
  if (limited) return limited

  try {
    const body   = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const { email, password, name, role, linkedId } = parsed.data

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('Email already registered', 409, 'EMAIL_EXISTS')

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role, linkedId },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = generateToken({
      userId: user.id,
      role:   user.role,
      email:  user.email,
      name:   user.name,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return apiSuccess(user, 201)
  } catch (error) {
    return apiServerError(error)
  }
}
