'use client'

import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useDomains, useGroups } from '@/hooks/useApi'

interface DomainItem {
  id: string; name: string; category?: string | null; description?: string | null;
  color?: string | null; groupCount: number; _count?: { groups: number }
}

export default function DomainsPage() {
  const { data: domains = [], isLoading } = useDomains()
  const list = domains as DomainItem[]

  // Group by category
  const categories = Array.from(new Set(list.map(d => d.category ?? 'Other'))).sort()

  return (
    <div className="space-y-6">
      <PageHeader title="Research Domains" description={`${list.length} domains across ${categories.length} categories`}>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" />Add Domain
        </Button>
      </PageHeader>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <EmptyState icon={BookOpen} title="No domains found" />
      )}

      {!isLoading && list.length > 0 && categories.map(cat => {
        const catDomains = list.filter(d => (d.category ?? 'Other') === cat)
        return (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {catDomains.map(d => (
                <Link key={d.id} href={`/groups?domainId=${d.id}`}>
                  <div className="group rounded-xl border bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: d.color ? `${d.color}20` : '#f1f5f9' }}
                      >
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: d.color ?? '#94a3b8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">{d.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{d._count?.groups ?? d.groupCount} groups</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
