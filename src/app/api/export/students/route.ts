import { prisma } from '@/lib/prisma'
import { apiServerError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format   = searchParams.get('format') ?? 'csv'
    const division = searchParams.get('division')

    const students = await prisma.student.findMany({
      where: division ? { division: division as 'A' | 'B' } : undefined,
      include: {
        group: {
          select: { groupId: true, title: true, faculty: { select: { name: true } } },
        },
      },
      orderBy: [{ division: 'asc' }, { roll: 'asc' }],
    })

    if (format === 'csv') {
      const headers = [
        'PRN', 'Name', 'Division', 'Roll', 'Semester', 'Academic Year',
        'Group ID', 'Group Title', 'Faculty', 'GPA', 'Status',
        'Skills', 'Interests',
      ]

      const rows = students.map(s => [
        s.prn,
        `"${s.name.replace(/"/g, '""')}"`,
        s.division,
        s.roll,
        s.semester,
        s.academicYear,
        s.group.groupId,
        `"${s.group.title.replace(/"/g, '""')}"`,
        `"${s.group.faculty.name}"`,
        s.gpa,
        s.status,
        `"${s.skills.join('; ')}"`,
        `"${s.interests.join('; ')}"`,
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="mca-students${division ? `-div${division}` : ''}.csv"`,
        },
      })
    }

    return Response.json({ success: true, data: students, total: students.length })
  } catch (error) {
    return apiServerError(error)
  }
}
