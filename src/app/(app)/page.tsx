'use client'

import Link from 'next/link'
import {
  FlaskConical, Users, GraduationCap, BookOpen,
  CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowRight,
} from 'lucide-react'
import { StatsCard } from '@/components/common/StatsCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { useDashboardStats, useGroups } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { GroupWithRelations } from '@/types'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentGroups = [], isLoading: groupsLoading } = useGroups({ limit: 6, status: 'Active' })

  if (statsLoading) return <PageLoader />

  const s = stats ?? {}

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          MCA Research Groups Overview · Academic Year 2025–26
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Groups"
          value={s.totalGroups ?? '—'}
          subtitle={`${s.activeGroups ?? 0} active`}
          icon={FlaskConical}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Students"
          value={s.totalStudents ?? '—'}
          subtitle="Across Div A & B"
          icon={GraduationCap}
          iconColor="text-indigo-600"
        />
        <StatsCard
          title="Faculty"
          value={s.totalFaculty ?? '—'}
          subtitle="Guide supervisors"
          icon={Users}
          iconColor="text-violet-600"
        />
        <StatsCard
          title="Research Domains"
          value={s.totalDomains ?? '—'}
          subtitle={`${s.totalGroups ?? 0} groups spread`}
          icon={BookOpen}
          iconColor="text-emerald-600"
        />
      </div>

      {/* Status breakdown row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active',    value: s.groupsByStatus?.Active ?? 0,     icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'In Review', value: s.groupsByStatus?.InReview ?? 0,   icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Proposed',  value: s.groupsByStatus?.Proposed ?? 0,   icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'On Hold',   value: s.groupsByStatus?.OnHold ?? 0,     icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border bg-white p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Division split */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Division A', value: s.groupsByDivision?.A ?? 0, color: 'bg-indigo-500' },
          { label: 'Division B', value: s.groupsByDivision?.B ?? 0, color: 'bg-purple-500' },
          { label: 'Avg Score',  value: `${s.avgSuccessScore ?? 0}%`, color: 'bg-teal-500' },
          { label: 'Pending Approvals', value: s.pendingApprovals ?? 0, color: 'bg-amber-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-white px-4 py-3 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${color} shrink-0`} />
            <div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent active groups */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">Active Research Groups</h2>
            <p className="text-xs text-gray-400 mt-0.5">Most recently updated</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>

        {groupsLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading groups…</div>
        ) : recentGroups.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No active groups found</div>
        ) : (
          <div className="divide-y">
            {(recentGroups as GroupWithRelations[]).map(g => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Division pill */}
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${g.division === 'A' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                  {g.division}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    <span className="text-gray-400 mr-2">{g.groupId}</span>{g.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {g.faculty?.name} · {g.domain?.name}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <StatusBadge status={g.status} type="group" />
                  <span className="text-xs text-gray-400">{formatDate(g.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
