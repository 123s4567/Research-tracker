import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

const startTime = Date.now()

export async function GET() {
  try {
    const dbStart = Date.now()
    const [groupCount, studentCount] = await Promise.all([
      prisma.researchGroup.count(),
      prisma.student.count(),
    ])
    const dbMs = Date.now() - dbStart

    return apiSuccess({
      status:    'healthy',
      timestamp: new Date().toISOString(),
      uptime:    Math.round((Date.now() - startTime) / 1000),
      database: {
        status:      'connected',
        responseMs:  dbMs,
        groups:      groupCount,
        students:    studentCount,
      },
      version: process.env.npm_package_version ?? '1.0.0',
      env:     process.env.NODE_ENV,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
