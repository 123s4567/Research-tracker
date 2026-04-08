import { prisma } from '@/lib/prisma'
import { apiServerError } from '@/lib/utils'

function icalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcal(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId  = searchParams.get('groupId')
    const division = searchParams.get('division')

    const milestones = await prisma.milestone.findMany({
      where: {
        ...(groupId  ? { groupId } : {}),
        ...(division ? { group: { division: division as 'A' | 'B' } } : {}),
      },
      include: {
        group: { select: { groupId: true, title: true, division: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MCA Research Tracker//NMIET//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:MCA Research Milestones',
      'X-WR-CALDESC:Research group milestone deadlines – NMIET Pune',
      'X-WR-TIMEZONE:Asia/Kolkata',
    ]

    for (const m of milestones) {
      const due   = new Date(m.dueDate)
      const start = icalDate(due)
      // Events are all-day style — set end to next day
      const endDate = new Date(due)
      endDate.setDate(endDate.getDate() + 1)
      const end = icalDate(endDate)

      const status = m.status === 'Completed' ? 'CONFIRMED' : 'TENTATIVE'
      const summary = escapeIcal(`[${m.group.groupId}] ${m.name}`)
      const desc    = escapeIcal(
        `Group: ${m.group.groupId} – ${m.group.title}\nDivision: ${m.group.division}\nStatus: ${m.status}\nCompletion: ${m.completionPercent}%`
      )

      lines.push(
        'BEGIN:VEVENT',
        `UID:milestone-${m.id}@mca-tracker.nmiet.edu`,
        `DTSTAMP:${icalDate(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc}`,
        `STATUS:${status}`,
        `CATEGORIES:MILESTONE,RESEARCH`,
        'END:VEVENT',
      )
    }

    lines.push('END:VCALENDAR')

    return new Response(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mca-milestones.ics"',
        'Cache-Control': 'no-cache, no-store',
      },
    })
  } catch (error) {
    return apiServerError(error)
  }
}
