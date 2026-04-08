import { apiSuccess } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  return apiSuccess({ message: 'Logged out successfully' })
}
