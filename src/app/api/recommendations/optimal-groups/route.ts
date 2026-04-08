import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    // Find underloaded faculty (< 70% capacity)
    const faculty = await prisma.faculty.findMany({
      include: { _count: { select: { groups: true } } },
    })

    const availableFaculty = faculty.filter(
      f => f._count.groups < f.maxGroups * 0.7
    )

    // Find domains with fewer groups (underexplored)
    const domains = await prisma.domain.findMany({
      include: { _count: { select: { groups: true } } },
      orderBy: { groupCount: 'asc' },
      take: 5,
    })

    // Find groups that could benefit from collaboration (same domain, different divisions)
    const crossDivOpportunities = await prisma.researchGroup.findMany({
      where: { status: 'Active' },
      include: {
        domain: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
      },
      take: 20,
    })

    // Group by domain to find cross-div opportunities
    const domainGroupMap = new Map<string, typeof crossDivOpportunities>()
    crossDivOpportunities.forEach(g => {
      const existing = domainGroupMap.get(g.domainId) ?? []
      existing.push(g)
      domainGroupMap.set(g.domainId, existing)
    })

    const collaborationSuggestions = Array.from(domainGroupMap.entries())
      .filter(([, groups]) => {
        const divisions = new Set(groups.map(g => g.division))
        return divisions.size > 1
      })
      .slice(0, 5)
      .map(([domainId, groups]) => ({
        domainId,
        domainName: groups[0].domain.name,
        groups: groups.map(g => ({ id: g.id, groupId: g.groupId, title: g.title, division: g.division })),
        reason: 'Groups in same domain across divisions could collaborate',
      }))

    return apiSuccess({
      availableFaculty: availableFaculty.map(f => ({
        id: f.id, name: f.name, title: f.title,
        currentGroups: f._count.groups,
        maxGroups: f.maxGroups,
        availableSlots: f.maxGroups - f._count.groups,
      })),
      underexploredDomains: domains.map(d => ({
        id: d.id, name: d.name, color: d.color,
        groupCount: d._count.groups,
        reason: 'This domain has fewer research groups',
      })),
      collaborationSuggestions,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
