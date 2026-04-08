'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { DivisionBadge } from '@/components/common/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { useGroups, useUpdateGroupStatus } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import type { GroupWithRelations } from '@/types'
import type { GroupStatus } from '@/types'

const COLUMNS: { status: GroupStatus; label: string; colorClass: string; bgClass: string; headerBorder: string }[] = [
  {
    status: 'Proposed',
    label: 'Proposed',
    colorClass: 'text-yellow-700',
    bgClass: 'bg-yellow-50',
    headerBorder: 'border-t-yellow-400',
  },
  {
    status: 'InReview',
    label: 'In Review',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    headerBorder: 'border-t-blue-400',
  },
  {
    status: 'Active',
    label: 'Active',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-50',
    headerBorder: 'border-t-green-400',
  },
  {
    status: 'Completed',
    label: 'Completed',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    headerBorder: 'border-t-gray-400',
  },
  {
    status: 'OnHold',
    label: 'On Hold',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-50',
    headerBorder: 'border-t-red-400',
  },
]

// ─── Draggable Card ───────────────────────────────────────────────────────────

interface CardProps {
  group: GroupWithRelations
  isDragging?: boolean
}

function GroupCard({ group, isDragging = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-3 transition-all',
        isDragging
          ? 'shadow-xl opacity-90 ring-2 ring-blue-400'
          : 'hover:shadow-sm hover:border-blue-200 cursor-grab active:cursor-grabbing'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <DivisionBadge division={group.division} />
        <span className="text-xs font-mono text-gray-400">{group.groupId}</span>
      </div>
      <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-2">{group.title}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="truncate max-w-[120px]">{group.faculty?.name}</span>
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: group.domain?.color ?? '#94a3b8' }}
        />
      </div>
      {group.completionPercent > 0 && (
        <div className="mt-2 h-1 w-full rounded-full bg-gray-100">
          <div
            className="h-1 rounded-full bg-blue-400"
            style={{ width: `${group.completionPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}

function DraggableCard({ group }: { group: GroupWithRelations }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: group.id,
    data: { group },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link
        href={`/groups/${group.id}`}
        onClick={e => { if (isDragging) e.preventDefault() }}
      >
        <GroupCard group={group} isDragging={isDragging} />
      </Link>
    </div>
  )
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

interface ColumnProps {
  col: typeof COLUMNS[number]
  groups: GroupWithRelations[]
}

function KanbanColumn({ col, groups }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.status })

  return (
    <div className="flex-shrink-0 w-72">
      {/* Header */}
      <div
        className={cn(
          'rounded-t-xl border-t-4 border-x bg-white px-4 py-3 flex items-center justify-between',
          col.headerBorder
        )}
      >
        <span className={cn('text-sm font-semibold', col.colorClass)}>{col.label}</span>
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            col.bgClass,
            col.colorClass
          )}
        >
          {groups.length}
        </span>
      </div>

      {/* Cards drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-b-xl border-x border-b p-2 space-y-2 min-h-[240px] transition-colors',
          isOver ? 'bg-blue-50/70' : 'bg-gray-50/60'
        )}
      >
        {groups.map(g => (
          <DraggableCard key={g.id} group={g} />
        ))}
        {groups.length === 0 && (
          <div
            className={cn(
              'py-8 text-center text-xs rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-blue-300 text-blue-400' : 'border-gray-200 text-gray-300'
            )}
          >
            {isOver ? 'Drop here' : 'Empty'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const { data: groups = [], isLoading } = useGroups({ limit: 200 })
  const updateStatus = useUpdateGroupStatus('')
  const [localGroups, setLocalGroups] = useState<GroupWithRelations[] | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupWithRelations | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const all: GroupWithRelations[] = localGroups ?? (groups as GroupWithRelations[])

  // Update local state optimistically
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const g = all.find(x => x.id === event.active.id)
      setActiveGroup(g ?? null)
    },
    [all]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveGroup(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const groupId = active.id as string
      const newStatus = over.id as GroupStatus
      const dragged = all.find(g => g.id === groupId)
      if (!dragged || dragged.status === newStatus) return

      // Optimistic update
      setLocalGroups(
        all.map(g => (g.id === groupId ? { ...g, status: newStatus } : g))
      )

      try {
        // We need to call the right mutation — build one-off
        await fetch(`/api/groups/${groupId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        toast.success(`Moved to ${COLUMNS.find(c => c.status === newStatus)?.label}`)
      } catch {
        // Rollback
        setLocalGroups(null)
        toast.error('Failed to update status')
      }
    },
    [all]
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kanban Board"
        description={`${all.length} groups · drag cards to change status`}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.status}
              col={col}
              groups={all.filter(g => g.status === col.status)}
            />
          ))}
        </div>

        {/* Drag overlay — floating card while dragging */}
        <DragOverlay>
          {activeGroup ? (
            <div className="w-72">
              <GroupCard group={activeGroup} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
