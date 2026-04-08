import { prisma } from '@/lib/prisma'
import { apiSuccess, apiNotFound, apiServerError } from '@/lib/utils'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            _count: { select: { students: true } },
            milestones: {
              where: { status: { in: ['NotStarted', 'InProgress', 'Overdue'] } },
              select: { dueDate: true, status: true },
            },
          },
        },
      },
    })
    if (!faculty) return apiNotFound('Faculty')

    const groupCount = faculty.groups.length
    const studentCount = faculty.groups.reduce((acc, g) => acc + g._count.students, 0)
    const activeGroups = faculty.groups.filter(g => g.status === 'Active').length
    const overdueMilestones = faculty.groups
      .flatMap(g => g.milestones)
      .filter(m => m.status === 'Overdue').length

    const upcomingDeadlines = faculty.groups
      .flatMap(g => g.milestones)
      .filter(m => {
        const due = new Date(m.dueDate)
        const now = new Date()
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return due >= now && due <= in7Days
      }).length

    return apiSuccess({
      facultyId: id,
      facultyName: faculty.name,
      groupCount,
      maxGroups: faculty.maxGroups,
      utilizationPercent: Math.round((groupCount / faculty.maxGroups) * 100),
      studentCount,
      activeGroups,
      overdueMilestones,
      upcomingDeadlines,
      isOverloaded: groupCount >= faculty.maxGroups,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
