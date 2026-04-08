'use client'

import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { useApprovals } from '@/hooks/useApi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import axios from 'axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

interface ApprovalItem {
  id: string; order: number; approverType: string; approverName: string;
  status: string; comments?: string | null; approvalDate?: string | null;
  group: { id: string; groupId: string; title: string; division: string }
  faculty?: { name: string } | null
}

export default function ApprovalsPage() {
  const qc = useQueryClient()
  const { data: pending = [], isLoading } = useApprovals('Pending')
  const { data: approved = [] } = useApprovals('Approved')
  const { data: rejected = [] } = useApprovals('Rejected')

  async function handleApprove(id: string) {
    try {
      await axios.post(`/api/approvals/${id}/approve`, { comments: 'Approved by coordinator' })
      toast.success('Approved successfully')
      qc.invalidateQueries({ queryKey: ['approvals'] })
    } catch { toast.error('Failed to approve') }
  }

  async function handleReject(id: string) {
    const reason = window.prompt('Rejection reason:')
    if (!reason) return
    try {
      await axios.post(`/api/approvals/${id}/reject`, { comments: reason })
      toast.success('Rejected')
      qc.invalidateQueries({ queryKey: ['approvals'] })
    } catch { toast.error('Failed to reject') }
  }

  function ApprovalRow({ a, showActions }: { a: ApprovalItem; showActions?: boolean }) {
    return (
      <div className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 shrink-0">{a.order}</div>
        <div className="flex-1 min-w-0">
          <Link href={`/groups/${a.group.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-700">
            <span className="font-mono text-xs text-gray-400 mr-2">{a.group.groupId}</span>{a.group.title}
          </Link>
          <p className="text-xs text-gray-400">{a.approverType} · {a.approverName}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={a.status} type="approval" />
          {showActions && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleApprove(a.id)}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleReject(a.id)}>
                <XCircle className="h-3.5 w-3.5 mr-1" />Reject
              </Button>
            </>
          )}
          {a.approvalDate && <span className="text-xs text-gray-400 hidden sm:block">{formatDate(a.approvalDate)}</span>}
        </div>
      </div>
    )
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <PageHeader title="Approvals" description="Multi-level group approval workflow">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-700">{(pending as ApprovalItem[]).length} pending</span>
        </div>
      </PageHeader>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />Pending ({(pending as ApprovalItem[]).length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Approved ({(approved as ApprovalItem[]).length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-3.5 w-3.5 mr-1.5" />Rejected ({(rejected as ApprovalItem[]).length})
          </TabsTrigger>
        </TabsList>

        {[
          { value: 'pending', data: pending as ApprovalItem[], showActions: true },
          { value: 'approved', data: approved as ApprovalItem[], showActions: false },
          { value: 'rejected', data: rejected as ApprovalItem[], showActions: false },
        ].map(({ value, data, showActions }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <div className="rounded-xl border bg-white overflow-hidden">
              {data.length === 0 ? (
                <EmptyState icon={ShieldCheck} title={`No ${value} approvals`} className="py-12" />
              ) : (
                <div className="divide-y">
                  {data.map(a => <ApprovalRow key={a.id} a={a} showActions={showActions} />)}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
