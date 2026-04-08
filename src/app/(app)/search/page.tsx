'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, FlaskConical, GraduationCap, Users, X, Clock } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useSearch } from '@/hooks/useApi'
import { cn } from '@/lib/utils'

const TYPE_ICONS = { group: FlaskConical, student: GraduationCap, faculty: Users }
const TYPE_COLORS = {
  group:   'text-blue-600 bg-blue-50',
  student: 'text-indigo-600 bg-indigo-50',
  faculty: 'text-violet-600 bg-violet-50',
}
type ResultType = 'all' | 'group' | 'student' | 'faculty'

const RECENT_KEY = 'mca-recent-searches'
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function addRecent(q: string) {
  try {
    const prev = getRecent().filter(x => x !== q)
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 5)))
  } catch { /* ignore */ }
}
function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY) } catch { /* ignore */ }
}

type SearchResult = {
  type: 'group' | 'student' | 'faculty'
  id: string
  title: string
  subtitle?: string
  url: string
  badge?: string | null
}

export default function SearchPage() {
  const [query, setQuery]           = useState('')
  const [typeFilter, setTypeFilter] = useState<ResultType>('all')
  const [recent, setRecent]         = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isFetching } = useSearch(query)
  const allResults: SearchResult[] = data?.results ?? []

  const filtered = typeFilter === 'all'
    ? allResults
    : allResults.filter(r => r.type === typeFilter)

  const counts = {
    all:     allResults.length,
    group:   allResults.filter(r => r.type === 'group').length,
    student: allResults.filter(r => r.type === 'student').length,
    faculty: allResults.filter(r => r.type === 'faculty').length,
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRecent(getRecent()) }, [])

  // Keyboard shortcut '/' focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function commitSearch(q: string) {
    if (q.trim().length >= 2) {
      addRecent(q.trim())
      setRecent(getRecent())
    }
  }

  const TABS: { id: ResultType; label: string }[] = [
    { id: 'all',     label: 'All' },
    { id: 'group',   label: 'Groups' },
    { id: 'student', label: 'Students' },
    { id: 'faculty', label: 'Faculty' },
  ]

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PageHeader title="Search" description="Find groups, students, and faculty" />

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          autoFocus
          className="pl-12 pr-10 h-12 text-base rounded-xl"
          placeholder="Search groups, students, faculty… (press / to focus)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commitSearch(query) }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setTypeFilter('all'); inputRef.current?.focus() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isFetching && query && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
        )}
      </div>

      {/* Type filter tabs — shown when there are results */}
      {query.length >= 2 && allResults.length > 0 && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                typeFilter === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                  typeFilter === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                )}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {query.length >= 2 && filtered.length === 0 && !isLoading && (
        <p className="text-center text-sm text-gray-400 py-8">
          No {typeFilter !== 'all' ? typeFilter + 's' : 'results'} found for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Results list */}
      {filtered.length > 0 && (
        <div className="rounded-xl border bg-white divide-y overflow-hidden">
          {filtered.map(r => {
            const Icon = TYPE_ICONS[r.type]
            return (
              <Link
                key={`${r.type}-${r.id}`}
                href={r.url}
                onClick={() => commitSearch(query)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                  TYPE_COLORS[r.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  {r.subtitle && (
                    <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                  )}
                </div>
                {r.badge && <StatusBadge status={r.badge} type="group" />}
              </Link>
            )
          })}
        </div>
      )}

      {/* Empty state + recent searches */}
      {query.length < 2 && (
        <div className="space-y-5">
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent</p>
                <button
                  onClick={() => { clearRecent(); setRecent([]) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map(r => (
                  <button
                    key={r}
                    onClick={() => { setQuery(r); inputRef.current?.focus() }}
                    className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="text-center py-10 text-gray-400">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Type at least 2 characters to search</p>
            <p className="text-xs mt-1 text-gray-300">Press / anywhere to focus</p>
          </div>
        </div>
      )}
    </div>
  )
}
