import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        groups: {
          select: {
            id: true,
            successScore: true,
            _count: { select: { students: true } },
          },
        },
      },
      orderBy: { groupCount: 'desc' },
    })

    const result = domains.map(d => ({
      domainId: d.id,
      domainName: d.name,
      color: d.color,
      category: d.category,
      groupCount: d.groups.length,
      studentCount: d.groups.reduce((acc, g) => acc + g._count.students, 0),
      avgSuccessScore: d.groups.length
        ? Math.round(d.groups.reduce((acc, g) => acc + g.successScore, 0) / d.groups.length)
        : 0,
    }))

    return apiSuccess(result)
  } catch (error) {
    return apiServerError(error)
  }
}
