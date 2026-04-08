'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useDomains, useFaculty } from '@/hooks/useApi'
import type { GroupFilters } from '@/hooks/useApi'

interface GroupFiltersBarProps {
  filters: GroupFilters
  onChange: (f: GroupFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Proposed', label: 'Proposed' },
  { value: 'InReview', label: 'In Review' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'OnHold', label: 'On Hold' },
]

export function GroupFiltersBar({ filters, onChange }: GroupFiltersBarProps) {
  const { data: domains = [] } = useDomains()
  const { data: faculty = [] } = useFaculty()

  const hasFilters = !!(filters.search || filters.status || filters.division || filters.domainId || filters.facultyId)

  function set(key: keyof GroupFilters, value: string) {
    onChange({ ...filters, [key]: value === 'all' ? undefined : value || undefined, page: 1 })
  }

  function clearAll() {
    onChange({ page: 1 })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search title, group ID…"
          className="pl-9"
          value={filters.search ?? ''}
          onChange={e => set('search', e.target.value)}
        />
      </div>

      {/* Division */}
      <Select value={filters.division ?? 'all'} onValueChange={v => set('division', v ?? 'all')}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Division" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Div</SelectItem>
          <SelectItem value="A">Division A</SelectItem>
          <SelectItem value="B">Division B</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={filters.status ?? 'all'} onValueChange={v => set('status', v ?? 'all')}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Domain */}
      <Select value={filters.domainId ?? 'all'} onValueChange={v => set('domainId', v ?? 'all')}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Domain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Domains</SelectItem>
          {(domains as { id: string; name: string }[]).map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Faculty */}
      <Select value={filters.facultyId ?? 'all'} onValueChange={v => set('facultyId', v ?? 'all')}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Faculty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Faculty</SelectItem>
          {(faculty as { id: string; name: string }[]).map((f) => (
            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-400 hover:text-gray-700">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
