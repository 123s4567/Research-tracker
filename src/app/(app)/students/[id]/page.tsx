'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  GraduationCap, Mail, Phone, BookOpen, FlaskConical,
  Users, Star, Calendar, ArrowLeft,
} from 'lucide-react'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { DivisionBadge, StatusBadge } from '@/components/common/StatusBadge'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { cn } from '@/lib/utils'

interface StudentDetail {
  id: string; prn: string; name: string; email?: string | null; phone?: string | null;
  division: 'A' | 'B'; roll: number; semester: string; academicYear: string;
  skills: string[]; interests: string[]; gpa: number; status: string;
  assignedDate: string;
  group: {
    id: string; groupId: string; title: string; status: string;
    completionPercent: number;
    faculty: { id: string; name: string };
    domain: { id: string; name: string };
  };
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading, error } = useQuery<StudentDetail>({
    queryKey: ['students', id],
    queryFn: () => axios.get(`/api/students/${id}`).then(r => r.data.data),
    enabled: !!id,
  })

  if (isLoading) return <PageLoader />
  if (error || !data) {
    return (
      <div className="text-center py-20 text-gray-400">
        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Student not found</p>
        <Link href="/students" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          ← Back to Students
        </Link>
      </div>
    )
  }

  const s = data

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/students" className="flex items-center gap-1 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Students
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{s.name}</span>
      </div>

      {/* Header card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 shrink-0">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{s.name}</h1>
              <DivisionBadge division={s.division} />
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium border',
                s.status === 'Active'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              )}>
                {s.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 font-mono">{s.prn}</p>
          </div>
        </div>

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Roll',          value: s.roll,          icon: Users },
            { label: 'Semester',      value: s.semester,      icon: Calendar },
            { label: 'Academic Year', value: s.academicYear,  icon: Calendar },
            { label: 'GPA',           value: s.gpa.toFixed(2),icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg bg-gray-50 border p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        {(s.email || s.phone) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {s.email && (
              <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                <Mail className="h-4 w-4" />
                {s.email}
              </a>
            )}
            {s.phone && (
              <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                <Phone className="h-4 w-4" />
                {s.phone}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Skills + Interests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Skills',    items: s.skills,    color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Interests', items: s.interests, color: 'bg-violet-50 text-violet-700 border-violet-200' },
        ].map(({ label, items, color }) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{label}</h3>
            {items.length === 0 ? (
              <p className="text-xs text-gray-400">None listed</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {items.map(item => (
                  <span key={item} className={cn('px-2 py-0.5 rounded-full border text-xs font-medium', color)}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Research Group */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-blue-500" />
          Research Group
        </h3>
        <Link href={`/groups/${s.group.id}`}>
          <div className="rounded-lg border hover:border-blue-200 hover:bg-blue-50/30 p-4 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600">{s.group.groupId}</span>
                  <StatusBadge status={s.group.status} type="group" />
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">{s.group.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {s.group.faculty.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {s.group.domain.name}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Completion</p>
                <p className="text-lg font-bold text-gray-900">{s.group.completionPercent}%</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${s.group.completionPercent}%` }}
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
