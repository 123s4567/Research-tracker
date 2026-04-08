import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { apiSuccess, apiError, apiServerError } from '@/lib/utils'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Invalid input', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    return apiServerError(error)
  }
}
