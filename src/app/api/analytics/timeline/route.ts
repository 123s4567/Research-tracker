import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const groups = await prisma.researchGroup.findMany({
      select: {
        id: true,
        groupId: true,
        title: true,
        division: true,
        status: true,
        startDate: true,
        targetEndDate: true,
        completionPercent: true,
        milestones: {
          select: { name: true, dueDate: true, status: true, completionPercent: true },
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: [{ division: 'asc' }, { groupId: 'asc' }],
    })

    const now = new Date()
    const onTrack = groups.filter(g =>
      g.milestones.every(m => m.status !== 'Overdue') && g.status === 'Active'
    ).length

    const atRisk = groups.filter(g =>
      g.milestones.some(m => m.status === 'Overdue')
    ).length

    const upcoming = await prisma.milestone.findMany({
      where: {
        status: { in: ['NotStarted', 'InProgress'] },
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        group: { select: { groupId: true, title: true, division: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    })

    return apiSuccess({
      groups: groups.map(g => ({
        id: g.id,
        groupId: g.groupId,
        title: g.title,
        division: g.division,
        status: g.status,
        startDate: g.startDate,
        targetEndDate: g.targetEndDate,
        completionPercent: g.completionPercent,
        milestones: g.milestones,
      })),
      summary: {
        onTrack,
        atRisk,
        total: groups.length,
        avgCompletion: groups.length
          ? Math.round(groups.reduce((a, g) => a + g.completionPercent, 0) / groups.length)
          : 0,
      },
      upcomingMilestones: upcoming,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
