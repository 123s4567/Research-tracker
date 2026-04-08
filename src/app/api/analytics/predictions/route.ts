import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/utils'

export async function GET() {
  try {
    const groups = await prisma.researchGroup.findMany({
      where: { status: { in: ['Active', 'InReview', 'Proposed'] } },
      include: {
        faculty: { select: { id: true, name: true, rating: true } },
        domain: { select: { id: true, name: true } },
        milestones: { select: { status: true, dueDate: true } },
        _count: { select: { students: true } },
      },
    })

    const predictions = groups.map(g => {
      const totalMilestones = g.milestones.length
      const completedMilestones = g.milestones.filter(m => m.status === 'Completed').length
      const overdueMilestones = g.milestones.filter(m => m.status === 'Overdue').length

      // Simple scoring algorithm
      let score = 50 // Base score
      if (totalMilestones > 0) {
        score += (completedMilestones / totalMilestones) * 30
        score -= (overdueMilestones / totalMilestones) * 20
      }
      score += g.completionPercent * 0.2
      score += (g.faculty.rating / 5) * 10
      if (g._count.students >= 2) score += 5
      score = Math.min(100, Math.max(0, score))

      const riskLevel =
        score >= 70 ? 'low' :
        score >= 40 ? 'medium' : 'high'

      return {
        groupId: g.id,
        groupLabel: g.groupId,
        title: g.title,
        faculty: g.faculty.name,
        domain: g.domain.name,
        successScore: Math.round(score),
        completionPercent: g.completionPercent,
        riskLevel,
        overdueMilestones,
        totalMilestones,
        recommendations: [
          ...(overdueMilestones > 0 ? [`Address ${overdueMilestones} overdue milestone(s)`] : []),
          ...(g._count.students < 2 ? ['Group has fewer than 2 students'] : []),
          ...(g.completionPercent < 30 && g.status === 'Active'
            ? ['Progress is below 30%, consider scheduling a review'] : []),
        ],
      }
    })

    // Sort by risk (high first)
    predictions.sort((a, b) => a.successScore - b.successScore)

    return apiSuccess({
      predictions,
      atRiskCount: predictions.filter(p => p.riskLevel === 'high').length,
      onTrackCount: predictions.filter(p => p.riskLevel === 'low').length,
    })
  } catch (error) {
    return apiServerError(error)
  }
}
