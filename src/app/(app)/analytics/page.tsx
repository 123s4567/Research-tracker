'use client'

import { BarChart3, TrendingUp, Users, BookOpen, AlertTriangle, CheckCircle2, Clock, Target, Download } from 'lucide-react'

const NOW_MS = Date.now()
import Link from 'next/link'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLoader } from '@/components/common/LoadingSpinner'
import {
  useDashboardStats,
  useDomainAnalytics,
  useFacultyAnalytics,
  usePredictions,
  useTimeline,
} from '@/hooks/useApi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  RadialBarChart, RadialBar,
} from 'recharts'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
const RISK_COLORS = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' } as const

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: domains = [] } = useDomainAnalytics()
  const { data: faculty = [] } = useFacultyAnalytics()
  const { data: predictData } = usePredictions()
  const { data: timelineData } = useTimeline()

  if (isLoading) return <PageLoader />

  const s = stats ?? {}
  const statusData = Object.entries(s.groupsByStatus ?? {}).map(([name, value]) => ({ name, value }))
  const domainData = (domains as { domainName: string; groupCount: number }[])
    .slice(0, 10)
    .map(d => ({
      name: d.domainName.length > 20 ? d.domainName.slice(0, 18) + '…' : d.domainName,
      groups: d.groupCount,
    }))
  const facultyData = (faculty as { facultyName: string; groupCount: number; utilizationPercent: number }[]).map(f => ({
    name: f.facultyName.split(' ').pop()!,
    groups: f.groupCount,
    util: f.utilizationPercent,
  }))

  // Predictions data
  const predictions = (predictData?.predictions ?? []) as {
    groupId: string; groupLabel: string; title: string; faculty: string
    successScore: number; completionPercent: number; riskLevel: 'low' | 'medium' | 'high'
    overdueMilestones: number; recommendations: string[]
  }[]
  const atRisk = predictions.filter(p => p.riskLevel === 'high')
  const radialData = [
    { name: 'On Track', value: predictData?.onTrackCount ?? 0, fill: '#10B981' },
    { name: 'Medium',   value: predictions.filter(p => p.riskLevel === 'medium').length, fill: '#F59E0B' },
    { name: 'At Risk',  value: predictData?.atRiskCount ?? 0, fill: '#EF4444' },
  ]

  // Timeline / completion trend (use groups list from timeline endpoint)
  const timelineGroups = (timelineData?.groups ?? []) as {
    groupId: string; completionPercent: number; status: string
  }[]
  const completionBuckets = [
    { label: '0–20%',   count: timelineGroups.filter(g => g.completionPercent <= 20).length },
    { label: '21–40%',  count: timelineGroups.filter(g => g.completionPercent > 20 && g.completionPercent <= 40).length },
    { label: '41–60%',  count: timelineGroups.filter(g => g.completionPercent > 40 && g.completionPercent <= 60).length },
    { label: '61–80%',  count: timelineGroups.filter(g => g.completionPercent > 60 && g.completionPercent <= 80).length },
    { label: '81–100%', count: timelineGroups.filter(g => g.completionPercent > 80).length },
  ]

  const tSummary = timelineData?.summary as { onTrack: number; atRisk: number; total: number; avgCompletion: number } | undefined
  const upcoming = (timelineData?.upcomingMilestones ?? []) as {
    id: string; name: string; dueDate: string
    group: { groupId: string; title: string; division: string }
  }[]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Analytics" description="Research portfolio insights & predictions" />
        <div className="flex gap-2 shrink-0 pt-1">
          <a
            href="/api/export/groups?format=csv"
            download="mca-groups.csv"
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Groups CSV
          </a>
          <a
            href="/api/export/faculty?format=csv"
            download="mca-faculty.csv"
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Faculty CSV
          </a>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Groups',  value: s.totalGroups ?? 0,  icon: BarChart3,     color: 'text-blue-600' },
          { label: 'Active',        value: s.activeGroups ?? 0, icon: TrendingUp,    color: 'text-green-600' },
          { label: 'Faculty',       value: s.totalFaculty ?? 0, icon: Users,         color: 'text-violet-600' },
          { label: 'Domains',       value: s.totalDomains ?? 0, icon: BookOpen,      color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-white p-4 flex items-center gap-3">
            <Icon className={cn('h-8 w-8 shrink-0', color)} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline health summary */}
      {tSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'On Track',     value: tSummary.onTrack,       icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'At Risk',      value: tSummary.atRisk,        icon: AlertTriangle,color: 'text-red-600',   bg: 'bg-red-50' },
            { label: 'Avg Completion', value: `${tSummary.avgCompletion}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Upcoming (14d)', value: upcoming.length,      icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn('rounded-xl border p-4 flex items-center gap-3', bg)}>
              <Icon className={cn('h-7 w-7 shrink-0', color)} />
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie */}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Groups by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Bar */}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Domains by Groups</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domainData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="groups" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Distribution */}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Completion Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionBuckets}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Groups" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Radial */}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Project Health Overview</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius="30%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" background cornerRadius={6} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {radialData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">{d.name}</span>
                      <span className="font-semibold text-gray-900">{d.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Workload */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Faculty Workload</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={facultyData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="groups" name="Groups" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="util" name="Utilization %" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At-Risk Groups Table */}
      {atRisk.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-gray-900">At-Risk Groups ({atRisk.length})</h3>
          </div>
          <div className="space-y-2">
            {atRisk.map(p => (
              <div key={p.groupId} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-gray-600">{p.groupLabel}</span>
                    <span className="text-xs text-gray-500 truncate">{p.title}</span>
                  </div>
                  {p.recommendations[0] && (
                    <p className="text-xs text-red-600 mt-0.5">{p.recommendations[0]}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-sm font-bold text-red-600">{p.successScore}</p>
                  </div>
                  <Link
                    href={`/groups/${p.groupId}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Milestones */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Upcoming Milestones (next 14 days)</h3>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 10).map(m => {
              const daysLeft = Math.ceil(
                (new Date(m.dueDate).getTime() - NOW_MS) / (1000 * 60 * 60 * 24)
              )
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">
                      {m.group.groupId} · {m.group.division}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    daysLeft <= 3
                      ? 'bg-red-100 text-red-700'
                      : daysLeft <= 7
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  )}>
                    {daysLeft}d
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
