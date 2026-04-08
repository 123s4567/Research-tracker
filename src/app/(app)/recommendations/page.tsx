'use client'

import Link from 'next/link'
import { Lightbulb, Users, BookOpen, GitMerge, TrendingUp, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { useRecommendations } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

interface AvailableFaculty {
  id: string; name: string; title: string
  currentGroups: number; maxGroups: number; availableSlots: number
}

interface UnderexploredDomain {
  id: string; name: string; color: string | null
  groupCount: number; reason: string
}

interface CollabSuggestion {
  domainId: string; domainName: string
  groups: { id: string; groupId: string; title: string; division: string }[]
  reason: string
}

export default function RecommendationsPage() {
  const { data, isLoading } = useRecommendations()

  if (isLoading) return <PageLoader />

  const faculty: AvailableFaculty[]       = data?.availableFaculty ?? []
  const domains: UnderexploredDomain[]    = data?.underexploredDomains ?? []
  const collabs: CollabSuggestion[]       = data?.collaborationSuggestions ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Recommendations"
        description="Intelligent suggestions for group allocation, faculty assignment, and collaboration"
      />

      {/* Faculty availability */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Available Faculty Supervisors</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{faculty.length}</span>
        </div>
        {faculty.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-400">
            All faculty are near capacity
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {faculty.map(f => {
              const utilPct = Math.round((f.currentGroups / f.maxGroups) * 100)
              return (
                <Link key={f.id} href={`/faculty/${f.id}`}>
                  <div className="rounded-xl border bg-white p-4 hover:shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{f.title} {f.name}</p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          {f.availableSlots} slot{f.availableSlots !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                        {utilPct}% utilized
                      </span>
                    </div>
                    {/* Capacity bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{f.currentGroups} / {f.maxGroups} groups</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            utilPct >= 80 ? 'bg-red-400' : utilPct >= 60 ? 'bg-amber-400' : 'bg-green-400'
                          )}
                          style={{ width: `${utilPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Underexplored domains */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <BookOpen className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Underexplored Research Domains</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{domains.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {domains.map(d => (
            <Link key={d.id} href={`/groups?domainId=${d.id}`}>
              <div className="rounded-xl border bg-white p-4 hover:shadow-sm hover:border-violet-200 transition-all h-full">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: d.color ? `${d.color}20` : '#f1f5f9' }}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color ?? '#94a3b8' }} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{d.name}</p>
                </div>
                <p className="text-xs text-gray-400">{d.groupCount} group{d.groupCount !== 1 ? 's' : ''}</p>
                <p className="text-xs text-violet-600 mt-1">{d.reason}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cross-division collaboration */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <GitMerge className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Cross-Division Collaboration Opportunities</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{collabs.length}</span>
        </div>
        {collabs.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-400">
            No cross-division opportunities found right now
          </div>
        ) : (
          <div className="space-y-3">
            {collabs.map(c => (
              <div key={c.domainId} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.domainName}</p>
                    <p className="text-xs text-amber-600 mt-0.5">{c.reason}</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.groups.map(g => (
                    <Link key={g.id} href={`/groups/${g.id}`}>
                      <div className="flex items-center gap-1.5 rounded-lg border bg-gray-50 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 transition-colors">
                        <span className={cn(
                          'inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white',
                          g.division === 'A' ? 'bg-blue-500' : 'bg-purple-500'
                        )}>
                          {g.division}
                        </span>
                        <span className="text-xs font-mono font-semibold text-gray-600">{g.groupId}</span>
                        <span className="text-xs text-gray-500 max-w-[140px] truncate">{g.title}</span>
                        <ArrowRight className="h-3 w-3 text-gray-300 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tip box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex gap-3">
        <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">How recommendations work</p>
          <p className="text-xs text-blue-700 mt-1">
            Faculty availability is based on current group load vs. max capacity (below 70% utilization). Underexplored domains are the 5 with fewest active groups. Collaboration suggestions identify active groups in the same domain across different divisions.
          </p>
        </div>
      </div>
    </div>
  )
}
