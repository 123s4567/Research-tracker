'use client'

import Link from 'next/link'
import { Users, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { StatusBadge, DivisionBadge, TypeBadge } from '@/components/common/StatusBadge'
import { cn, formatDate } from '@/lib/utils'
import type { GroupWithRelations } from '@/types'

interface GroupCardProps {
  group: GroupWithRelations
  className?: string
}

export function GroupCard({ group, className }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div
        className={cn(
          'group rounded-xl border bg-white p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer',
          className
        )}
      >
        {/* Top row: badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <DivisionBadge division={group.division} />
          <span className="text-xs font-mono text-gray-500 font-semibold">{group.groupId}</span>
          <div className="ml-auto flex gap-1.5">
            <StatusBadge status={group.status} type="group" />
            <TypeBadge type={group.type} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
          {group.title}
        </h3>

        {/* Domain */}
        <div className="flex items-center gap-1.5 mb-3">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: group.domain?.color ?? '#94a3b8' }}
          />
          <span className="text-xs text-gray-500 truncate">{group.domain?.name}</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group._count?.students ?? group.memberCount ?? 0}
            </span>
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <TrendingUp className="h-3 w-3 shrink-0" />
              {group.faculty?.name}
            </span>
          </div>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3" />
            {formatDate(group.createdAt)}
          </span>
        </div>

        {/* Progress bar */}
        {group.completionPercent > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{group.completionPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${group.completionPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
