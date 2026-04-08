import { prisma } from '@/lib/prisma'
import { apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') ?? 'csv'

    const groups = await prisma.researchGroup.findMany({
      include: {
        faculty: { select: { name: true, email: true } },
        domain: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ division: 'asc' }, { groupId: 'asc' }],
    })

    if (format === 'csv') {
      const headers = [
        'Group ID', 'Title', 'Division', 'Type', 'Faculty', 'Domain',
        'Status', 'Members', 'Success Score', 'Completion %', 'Created At',
      ]

      const rows = groups.map(g => [
        g.groupId,
        `"${g.title.replace(/"/g, '""')}"`,
        g.division,
        g.type,
        `"${g.faculty.name}"`,
        `"${g.domain.name}"`,
        g.status,
        g._count.students,
        g.successScore,
        g.completionPercent,
        g.createdAt.toISOString().split('T')[0],
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="mca-groups.csv"',
        },
      })
    }

    // JSON fallback
    return Response.json({ success: true, data: groups, total: groups.length })
  } catch (error) {
    return apiServerError(error)
  }
}
