'use client'

import { cn } from '@/lib/utils'
import type { GroupStatus, ApprovalStatus, MilestoneStatus } from '@/types'

// ─── Group Status ─────────────────────────────────────────────────────────────

const GROUP_STATUS: Record<GroupStatus, { label: string; class: string }> = {
  Proposed:  { label: 'Proposed',   class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  InReview:  { label: 'In Review',  class: 'bg-blue-100 text-blue-800 border-blue-200' },
  Active:    { label: 'Active',     class: 'bg-green-100 text-green-800 border-green-200' },
  Completed: { label: 'Completed',  class: 'bg-gray-100 text-gray-700 border-gray-200' },
  OnHold:    { label: 'On Hold',    class: 'bg-red-100 text-red-800 border-red-200' },
}

const APPROVAL_STATUS: Record<ApprovalStatus, { label: string; class: string }> = {
  Pending:  { label: 'Pending',  class: 'bg-amber-100 text-amber-800 border-amber-200' },
  Approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800 border-red-200' },
}

const MILESTONE_STATUS: Record<MilestoneStatus, { label: string; class: string }> = {
  NotStarted: { label: 'Not Started', class: 'bg-gray-100 text-gray-600 border-gray-200' },
  InProgress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  Completed:  { label: 'Completed',   class: 'bg-green-100 text-green-700 border-green-200' },
  Overdue:    { label: 'Overdue',     class: 'bg-red-100 text-red-700 border-red-200' },
}

interface StatusBadgeProps {
  status: GroupStatus | ApprovalStatus | MilestoneStatus | string
  type?: 'group' | 'approval' | 'milestone'
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, type = 'group', size = 'sm', className }: StatusBadgeProps) {
  let config = { label: status, class: 'bg-gray-100 text-gray-600 border-gray-200' }

  if (type === 'group' && status in GROUP_STATUS) {
    config = GROUP_STATUS[status as GroupStatus]
  } else if (type === 'approval' && status in APPROVAL_STATUS) {
    config = APPROVAL_STATUS[status as ApprovalStatus]
  } else if (type === 'milestone' && status in MILESTONE_STATUS) {
    config = MILESTONE_STATUS[status as MilestoneStatus]
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  )
}

// ─── Division Badge ───────────────────────────────────────────────────────────

export function DivisionBadge({ division, className }: { division: 'A' | 'B'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
        division === 'A'
          ? 'bg-indigo-100 text-indigo-700'
          : 'bg-purple-100 text-purple-700',
        className
      )}
    >
      {division}
    </span>
  )
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Respondent: 'bg-sky-100 text-sky-700 border-sky-200',
  NonResp:    'bg-orange-100 text-orange-700 border-orange-200',
  CrossDiv:   'bg-violet-100 text-violet-700 border-violet-200',
}
const TYPE_LABELS: Record<string, string> = {
  Respondent: 'Respondent',
  NonResp:    'Non-Respondent',
  CrossDiv:   'Cross-Division',
}

export function TypeBadge({ type, size = 'sm', className }: { type: string; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 border-gray-200',
        className
      )}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}
