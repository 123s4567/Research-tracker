import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
  apiSuccess, apiCreated, apiError, apiServerError,
  getPaginationParams, buildPaginationMeta,
} from '@/lib/utils'
import { sendGroupCreatedEmail } from '@/lib/email'
import { sendWebhookEvent } from '@/lib/webhooks'
import { logger } from '@/lib/logger'
import type { Division, GroupStatus } from '@prisma/client'

const createGroupSchema = z.object({
  groupId: z.string().min(1).max(20),
  title: z.string().min(3).max(300),
  description: z.string().optional(),
  division: z.enum(['A', 'B']),
  type: z.enum(['Respondent', 'NonResp', 'CrossDiv']),
  facultyId: z.string().cuid(),
  domainId: z.string().cuid(),
  targetEndDate: z.string().datetime().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    const where: Record<string, unknown> = {}
    const division = searchParams.get('division') as Division | null
    const status = searchParams.get('status') as GroupStatus | null
    const facultyId = searchParams.get('facultyId')
    const domainId = searchParams.get('domainId')
    const search = searchParams.get('search')

    if (division) where.division = division
    if (status) where.status = status
    if (facultyId) where.facultyId = facultyId
    if (domainId) where.domainId = domainId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { groupId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const sort = searchParams.get('sort') ?? 'created'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'
    const orderBy =
      sort === 'title' ? { title: order } :
      sort === 'faculty' ? { faculty: { name: order } } :
      sort === 'domain' ? { domain: { name: order } } :
      { createdAt: order }

    const [groups, total] = await Promise.all([
      prisma.researchGroup.findMany({
        where,
        include: {
          faculty: { select: { id: true, name: true, email: true, title: true } },
          domain: { select: { id: true, name: true, color: true } },
          _count: { select: { students: true, milestones: true, comments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.researchGroup.count({ where }),
    ])

    return apiSuccess(groups, 200)
  } catch (error) {
    return apiServerError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return apiError('Unauthorized', 401, 'UNAUTHORIZED')

    const body = await request.json()
    const parsed = createGroupSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten())
    }

    const { targetEndDate, ...rest } = parsed.data

    // Check groupId uniqueness
    const existing = await prisma.researchGroup.findUnique({ where: { groupId: rest.groupId } })
    if (existing) return apiError('Group ID already exists', 409, 'DUPLICATE_GROUP_ID')

    // Verify faculty & domain exist
    const [faculty, domain] = await Promise.all([
      prisma.faculty.findUnique({ where: { id: rest.facultyId } }),
      prisma.domain.findUnique({ where: { id: rest.domainId } }),
    ])
    if (!faculty) return apiError('Faculty not found', 404, 'FACULTY_NOT_FOUND')
    if (!domain) return apiError('Domain not found', 404, 'DOMAIN_NOT_FOUND')

    const group = await prisma.researchGroup.create({
      data: {
        ...rest,
        ...(targetEndDate ? { targetEndDate: new Date(targetEndDate) } : {}),
      },
      include: {
        faculty: { select: { id: true, name: true, email: true, title: true } },
        domain: { select: { id: true, name: true, color: true } },
      },
    })

    // Log creation
    await prisma.changeLog.create({
      data: {
        groupId: group.id,
        changeType: 'CREATED',
        details: { groupId: group.groupId, title: group.title },
        changedBy: user.userId,
      },
    })

    // Fire-and-forget: email + webhook (don't block the response)
    Promise.allSettled([
      sendGroupCreatedEmail({
        to:          'coordinator@nmiet.edu',
        groupId:     group.groupId,
        title:       group.title,
        facultyName: group.faculty.name,
        division:    group.division,
      }),
      sendWebhookEvent('group.created', {
        id:       group.id,
        groupId:  group.groupId,
        title:    group.title,
        division: group.division,
        status:   group.status,
        faculty:  group.faculty.name,
        domain:   group.domain.name,
      }),
    ]).catch(err => logger.warn('Post-create side effects failed', { err: String(err) }))

    logger.info('Group created', { groupId: group.groupId, by: user.userId })
    return apiCreated(group)
  } catch (error) {
    return apiServerError(error)
  }
}
