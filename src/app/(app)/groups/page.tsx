'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, LayoutGrid, List, Download } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { GroupCard } from '@/components/groups/GroupCard'
import { GroupFiltersBar } from '@/components/groups/GroupFilters'
import { StatusBadge, DivisionBadge, TypeBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useGroups } from '@/hooks/useApi'
import type { GroupFilters } from '@/hooks/useApi'
import type { GroupWithRelations } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { FlaskConical } from 'lucide-react'

export default function GroupsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<GroupFilters>({ page: 1, limit: 30 })

  const { data: groups = [], isLoading } = useGroups(filters)
  const typedGroups = groups as GroupWithRelations[]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Research Groups"
        description={`${typedGroups.length} groups found`}
      >
        <Button variant="outline" size="sm" asChild>
          <a href="/api/export/groups?format=csv" download>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </a>
        </Button>
        <Button size="sm" asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4 mr-1.5" /> New Group
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <GroupFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? 'Loading…' : `${typedGroups.length} results`}
        </p>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={cn('px-3 py-1.5 text-sm transition-colors', view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('px-3 py-1.5 text-sm transition-colors', view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && typedGroups.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="No groups found"
          description="Try adjusting your filters or create a new research group."
          action={
            <Button size="sm" asChild>
              <Link href="/groups/new"><Plus className="h-4 w-4 mr-1.5" />New Group</Link>
            </Button>
          }
        />
      )}

      {/* Grid view */}
      {!isLoading && view === 'grid' && typedGroups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {typedGroups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      {/* List/Table view */}
      {!isLoading && view === 'list' && typedGroups.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Faculty</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Domain</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Members</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {typedGroups.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DivisionBadge division={g.division} />
                      <Link href={`/groups/${g.id}`} className="font-mono text-xs font-semibold text-blue-600 hover:underline">
                        {g.groupId}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <Link href={`/groups/${g.id}`} className="font-medium text-gray-900 hover:text-blue-700 line-clamp-1">
                      {g.title}
                    </Link>
                    <TypeBadge type={g.type} size="sm" className="mt-0.5" />
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{g.faculty?.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: g.domain?.color ?? '#94a3b8' }} />
                      {g.domain?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} type="group" /></td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs text-center">{g._count?.students ?? g.memberCount}</td>
                  <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{formatDate(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
