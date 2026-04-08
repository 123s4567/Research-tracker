import { prisma } from '@/lib/prisma'
import { apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') ?? 'csv'

    const faculty = await prisma.faculty.findMany({
      include: {
        groups: {
          select: { groupId: true, status: true, successScore: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    if (format === 'csv') {
      const headers = [
        'Name', 'Title', 'Email', 'Phone',
        'Max Groups', 'Current Groups', 'Utilization %',
        'Avg Success Score', 'Preferred Domains', 'Rating', 'Publications',
      ]

      const rows = faculty.map(f => {
        const current     = f.groups.length
        const utilPct     = Math.round((current / f.maxGroups) * 100)
        const avgScore    = f.groups.length
          ? (f.groups.reduce((sum, g) => sum + g.successScore, 0) / f.groups.length).toFixed(1)
          : '0'

        return [
          `"${f.name}"`,
          f.title ?? '',
          f.email,
          f.phone ?? '',
          f.maxGroups,
          current,
          utilPct,
          avgScore,
          `"${f.preferredDomains.join('; ')}"`,
          f.rating,
          f.totalPublications,
        ]
      })

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="mca-faculty.csv"',
        },
      })
    }

    return Response.json({ success: true, data: faculty, total: faculty.length })
  } catch (error) {
    return apiServerError(error)
  }
}
