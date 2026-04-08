'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/LoadingSpinner'
import { DivisionBadge } from '@/components/common/StatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStudents } from '@/hooks/useApi'

interface StudentItem {
  id: string; prn: string; name: string; email?: string | null;
  division: 'A' | 'B'; roll: number; gpa: number; skills: string[];
  group: { id: string; groupId: string; title: string }
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [division, setDivision] = useState('all')

  const { data: students = [], isLoading } = useStudents({
    search: search || undefined,
    division: division === 'all' ? undefined : division,
  })
  const list = students as StudentItem[]

  return (
    <div className="space-y-5">
      <PageHeader title="Students" description={`${list.length} enrolled`} />

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search name or PRN…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={division} onValueChange={v => setDivision(v ?? 'all')}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            <SelectItem value="A">Division A</SelectItem>
            <SelectItem value="B">Division B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <EmptyState icon={GraduationCap} title="No students found" description="Try adjusting the search or filter." />
      )}

      {!isLoading && list.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PRN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Group</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Skills</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Div/Roll</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{s.prn}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/students/${s.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">{s.name}</Link>
                    {s.email && <p className="text-xs text-gray-400">{s.email}</p>}
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    {s.group && (
                      <Link href={`/groups/${s.group.id}`} className="text-xs text-blue-600 hover:underline font-mono font-semibold">
                        {s.group.groupId}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {s.skills.slice(0, 2).map(sk => (
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-gray-100 text-xs text-gray-600">{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center hidden lg:table-cell">
                    <DivisionBadge division={s.division} />
                    <span className="ml-1 text-xs text-gray-400">/{s.roll}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center hidden lg:table-cell text-sm font-medium text-gray-700">{s.gpa.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
