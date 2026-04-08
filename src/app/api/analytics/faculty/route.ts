import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        groups: {
          select: {
            id: true, status: true, successScore: true,
            _count: { select: { students: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = faculty.map(f => ({
      facultyId: f.id,
      facultyName: f.name,
      title: f.title,
      groupCount: f.groups.length,
      maxGroups: f.maxGroups,
      utilizationPercent: Math.round((f.groups.length / f.maxGroups) * 100),
      studentCount: f.groups.reduce((acc, g) => acc + g._count.students, 0),
      activeGroups: f.groups.filter(g => g.status === 'Active').length,
      completedGroups: f.groups.filter(g => g.status === 'Completed').length,
      avgSuccessScore: f.groups.length
        ? Math.round(f.groups.reduce((acc, g) => acc + g.successScore, 0) / f.groups.length)
        : 0,
      isOverloaded: f.groups.length >= f.maxGroups,
      rating: f.rating,
    }))

    return apiSuccess(result)
  } catch (error) {
    return apiServerError(error)
  }
}
