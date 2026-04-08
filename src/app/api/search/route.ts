import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    if (!q || q.length < 2) {
      return apiError('Search query must be at least 2 characters', 400, 'QUERY_TOO_SHORT')
    }

    const contains = { contains: q, mode: 'insensitive' as const }

    const [groups, students, faculty] = await Promise.all([
      prisma.researchGroup.findMany({
        where: { OR: [{ title: contains }, { groupId: contains }, { description: contains }] },
        select: {
          id: true, groupId: true, title: true, status: true,
          faculty: { select: { name: true } },
          domain: { select: { name: true } },
        },
        take: 10,
      }),
      prisma.student.findMany({
        where: { OR: [{ name: contains }, { prn: contains }] },
        select: {
          id: true, name: true, prn: true, division: true,
          group: { select: { groupId: true, title: true } },
        },
        take: 10,
      }),
      prisma.faculty.findMany({
        where: { OR: [{ name: contains }, { email: contains }] },
        select: { id: true, name: true, email: true, title: true },
        take: 5,
      }),
    ])

    const results = [
      ...groups.map(g => ({
        type: 'group' as const,
        id: g.id,
        title: g.groupId + ' – ' + g.title,
        subtitle: g.faculty.name + ' · ' + g.domain.name,
        url: `/groups/${g.id}`,
        badge: g.status,
      })),
      ...students.map(s => ({
        type: 'student' as const,
        id: s.id,
        title: s.name,
        subtitle: `PRN: ${s.prn} · ${s.group.groupId}`,
        url: `/groups/${s.group.groupId}`,
        badge: s.division,
      })),
      ...faculty.map(f => ({
        type: 'faculty' as const,
        id: f.id,
        title: (f.title ? f.title + ' ' : '') + f.name,
        subtitle: f.email,
        url: `/faculty/${f.id}`,
        badge: null,
      })),
    ]

    return apiSuccess({ results, total: results.length, query: q })
  } catch (error) {
    return apiServerError(error)
  }
}
