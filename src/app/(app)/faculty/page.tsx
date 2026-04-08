'use client'

import Link from 'next/link'
import { Users, BookOpen, TrendingUp, Mail, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useFaculty } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

interface FacultyItem {
  id: string
  name: string
  email: string
  title?: string | null
  maxGroups: number
  rating: number
  groupCount: number
  utilizationPercent: number
  isOverloaded: boolean
  preferredDomains: string[]
}

export default function FacultyPage() {
  const { data: faculty = [], isLoading } = useFaculty()
  const list = faculty as FacultyItem[]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Faculty"
        description={`${list.length} supervisors`}
      >
        <Button size="sm" asChild>
          <Link href="/faculty/new"><Plus className="h-4 w-4 mr-1.5" />Add Faculty</Link>
        </Button>
      </PageHeader>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <EmptyState icon={Users} title="No faculty found" description="Add faculty members to begin assigning research groups." />
      )}

      {!isLoading && list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(f => (
            <Link key={f.id} href={`/faculty/${f.id}`}>
              <div className="group rounded-xl border bg-white p-5 hover:shadow-md hover:border-blue-200 transition-all">
                {/* Avatar + name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shrink-0">
                    {f.name.split(' ').pop()![0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{f.name}</p>
                    {f.title && <p className="text-xs text-gray-400">{f.title}</p>}
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 shrink-0" />{f.email}
                    </p>
                  </div>
                </div>

                {/* Workload bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Workload</span>
                    <span className={cn('font-medium', f.isOverloaded ? 'text-red-600' : 'text-gray-600')}>
                      {f.groupCount}/{f.maxGroups} groups
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={cn('h-2 rounded-full transition-all', f.utilizationPercent >= 90 ? 'bg-red-500' : f.utilizationPercent >= 70 ? 'bg-amber-500' : 'bg-green-500')}
                      style={{ width: `${Math.min(100, f.utilizationPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />{f.groupCount} groups
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />Rating {f.rating.toFixed(1)}
                  </span>
                  <span className={cn('font-medium px-2 py-0.5 rounded-full text-xs', f.isOverloaded ? 'bg-red-100 text-red-700' : f.groupCount >= f.maxGroups * 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
                    {f.isOverloaded ? 'Full' : f.utilizationPercent >= 70 ? 'Busy' : 'Available'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
