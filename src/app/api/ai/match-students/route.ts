import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, apiServerError } from '@/lib/utils'

/**
 * GET /api/ai/match-students?domainId=...&limit=5
 *
 * Returns students whose skills/interests best match the given domain.
 * Scoring: 2pts per exact skill match + 2pts per exact interest match (case-insensitive)
 * plus domain name and category tokens for partial matching.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get('domainId')
    const limit    = Math.min(Number(searchParams.get('limit') ?? 10), 50)

    if (!domainId) {
      return apiError('domainId is required', 400, 'MISSING_PARAM')
    }

    const domain = await prisma.domain.findUnique({ where: { id: domainId } })
    if (!domain) return apiError('Domain not found', 404, 'NOT_FOUND')

    // Keywords derived from domain name + category
    const keywords = [
      ...domain.name.toLowerCase().split(/[\s,/-]+/),
      ...(domain.category ?? '').toLowerCase().split(/[\s,/-]+/),
    ].filter(Boolean)

    const students = await prisma.student.findMany({
      include: {
        group: { select: { groupId: true, title: true, domain: { select: { name: true } } } },
      },
    })

    const scored = students
      .map(s => {
        const skillsLower    = s.skills.map(x => x.toLowerCase())
        const interestsLower = s.interests.map(x => x.toLowerCase())

        let score = 0

        // Exact keyword match
        for (const kw of keywords) {
          if (skillsLower.some(sk => sk.includes(kw))) score += 2
          if (interestsLower.some(int => int.includes(kw))) score += 2
        }

        // GPA bonus (normalised to 0–2)
        score += (s.gpa / 10) * 2

        return {
          id:        s.id,
          name:      s.name,
          prn:       s.prn,
          division:  s.division,
          skills:    s.skills,
          interests: s.interests,
          gpa:       s.gpa,
          currentGroup: {
            groupId: s.group.groupId,
            title:   s.group.title,
            domain:  s.group.domain.name,
          },
          matchScore:  Math.round(score * 10) / 10,
          matchReason: buildReason(s.skills, s.interests, keywords),
        }
      })
      .filter(s => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return apiSuccess({
      domain: { id: domain.id, name: domain.name, category: domain.category },
      keywords,
      matches: scored,
      total: scored.length,
    })
  } catch (error) {
    return apiServerError(error)
  }
}

function buildReason(skills: string[], interests: string[], keywords: string[]): string {
  const matchedSkills    = skills.filter(s => keywords.some(kw => s.toLowerCase().includes(kw)))
  const matchedInterests = interests.filter(i => keywords.some(kw => i.toLowerCase().includes(kw)))

  const parts: string[] = []
  if (matchedSkills.length)    parts.push(`Skills: ${matchedSkills.slice(0, 3).join(', ')}`)
  if (matchedInterests.length) parts.push(`Interests: ${matchedInterests.slice(0, 3).join(', ')}`)
  return parts.join(' · ') || 'GPA-based match'
}
