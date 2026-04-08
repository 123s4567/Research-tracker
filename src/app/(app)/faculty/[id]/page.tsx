'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, BookOpen, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useFacultyMember, useFacultyWorkload } from '@/hooks/useApi'
import { StatusBadge, DivisionBadge } from '@/components/common/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'

export default function FacultyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: faculty, isLoading } = useFacultyMember(id)
  const { data: workload } = useFacultyWorkload(id)

  if (isLoading) return <PageLoader />
  if (!faculty) return (
    <div className="text-center py-16">
      <p className="text-gray-500">Faculty not found.</p>
      <Button variant="ghost" asChild className="mt-4"><Link href="/faculty">← Back</Link></Button>
    </div>
  )

  const f = faculty as {
    id: string; name: string; email: string; phone?: string | null; title?: string | null;
    maxGroups: number; rating: number; totalPublications: number; preferredDomains: string[];
    groupCount: number; utilizationPercent: number; isOverloaded: boolean;
    groups: Array<{ id: string; groupId: string; title: string; status: string; division: 'A' | 'B'; memberCount: number; domain: { name: string; color: string | null } }>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/faculty" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Faculty
        </Link>
        <span>/</span>
        <span className="text-gray-700">{f.name}</span>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold shrink-0">
            {f.name.split(' ').pop()![0]}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{f.name}</h1>
            {f.title && <p className="text-sm text-gray-500">{f.title}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <a href={`mailto:${f.email}`} className="flex items-center gap-1.5 hover:text-blue-600">
                <Mail className="h-4 w-4 text-gray-400" />{f.email}
              </a>
              {f.phone && (
                <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 hover:text-blue-600">
                  <Phone className="h-4 w-4 text-gray-400" />{f.phone}
                </a>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/faculty/${id}/edit`}>Edit Profile</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Groups', value: f.groupCount, sub: `of ${f.maxGroups} max` },
            { label: 'Utilization', value: `${f.utilizationPercent}%`, sub: f.isOverloaded ? 'Overloaded' : 'Capacity' },
            { label: 'Rating', value: f.rating.toFixed(1), sub: 'out of 5.0' },
            { label: 'Publications', value: f.totalPublications, sub: 'research papers' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Workload bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Workload Utilization</span>
            <span className={cn('font-medium', f.isOverloaded ? 'text-red-600' : '')}>
              {f.groupCount}/{f.maxGroups} groups
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-100">
            <div
              className={cn('h-2.5 rounded-full transition-all', f.utilizationPercent >= 90 ? 'bg-red-500' : f.utilizationPercent >= 70 ? 'bg-amber-500' : 'bg-green-500')}
              style={{ width: `${Math.min(100, f.utilizationPercent)}%` }}
            />
          </div>
        </div>

        {/* Workload alerts */}
        {workload && (
          <div className="mt-4 flex flex-wrap gap-3">
            {workload.overdueMilestones > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {workload.overdueMilestones} overdue milestone{workload.overdueMilestones > 1 ? 's' : ''}
              </div>
            )}
            {workload.upcomingDeadlines > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {workload.upcomingDeadlines} deadline{workload.upcomingDeadlines > 1 ? 's' : ''} in 7 days
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assigned groups */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">Assigned Research Groups</h2>
          <span className="text-sm text-gray-400">{f.groupCount} total</span>
        </div>
        {f.groups?.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No groups assigned</div>
        ) : (
          <div className="divide-y">
            {f.groups?.map(g => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <DivisionBadge division={g.division} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    <span className="text-gray-400 mr-2 font-mono text-xs">{g.groupId}</span>
                    {g.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: g.domain?.color ?? '#94a3b8' }} />
                    {g.domain?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="h-3 w-3" />{g.memberCount}
                  </span>
                  <StatusBadge status={g.status} type="group" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
