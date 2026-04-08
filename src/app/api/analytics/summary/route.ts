import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const [
      totalGroups,
      totalStudents,
      totalFaculty,
      totalDomains,
      groupsByStatus,
      groupsByDivision,
      pendingApprovals,
      avgSuccessScore,
    ] = await Promise.all([
      prisma.researchGroup.count(),
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.domain.count(),
      prisma.researchGroup.groupBy({ by: ['status'], _count: true }),
      prisma.researchGroup.groupBy({ by: ['division'], _count: true }),
      prisma.approval.count({ where: { status: 'Pending' } }),
      prisma.researchGroup.aggregate({ _avg: { successScore: true } }),
    ])

    const statusMap = Object.fromEntries(
      groupsByStatus.map(g => [g.status, g._count])
    )
    const divisionMap = Object.fromEntries(
      groupsByDivision.map(g => [g.division, g._count])
    )

    return apiSuccess({
      totalGroups,
      totalStudents,
      totalFaculty,
      totalDomains,
      activeGroups: statusMap.Active ?? 0,
      completedGroups: statusMap.Completed ?? 0,
      pendingApprovals,
      avgSuccessScore: Math.round(avgSuccessScore._avg.successScore ?? 0),
      groupsByStatus: statusMap,
      groupsByDivision: divisionMap,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
