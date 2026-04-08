'use client'

import { use, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, TrendingUp, Edit, MoreVertical, CheckCircle2, MessageSquare, Milestone, ShieldCheck, Plus, Send, Trash2, Circle } from 'lucide-react'
import { useGroup, useUpdateGroupStatus, useAddMilestone, useUpdateMilestone, useDeleteMilestone, useAddComment } from '@/hooks/useApi'
import { StatusBadge, DivisionBadge, TypeBadge } from '@/components/common/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { GroupDetail } from '@/types'

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: group, isLoading } = useGroup(id)
  const statusMutation = useUpdateGroupStatus(id)
  const addMilestone = useAddMilestone(id)
  const updateMilestone = useUpdateMilestone(id)
  const deleteMilestone = useDeleteMilestone(id)
  const addComment = useAddComment(id)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', dueDate: '' })
  const [commentText, setCommentText] = useState('')
  const commentRef = useRef<HTMLTextAreaElement>(null)

  if (isLoading) return <PageLoader />
  if (!group) return (
    <div className="text-center py-16">
      <p className="text-gray-500">Group not found.</p>
      <Button variant="ghost" asChild className="mt-4"><Link href="/groups">← Back to groups</Link></Button>
    </div>
  )

  const g = group as GroupDetail

  async function changeStatus(status: string) {
    try {
      await statusMutation.mutateAsync(status)
      toast.success(`Status changed to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/groups" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Groups
        </Link>
        <span>/</span>
        <span className="font-mono text-gray-700">{g.groupId}</span>
      </div>

      {/* Header card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <DivisionBadge division={g.division} />
              <span className="font-mono text-sm font-semibold text-gray-500">{g.groupId}</span>
              <StatusBadge status={g.status} type="group" size="md" />
              <TypeBadge type={g.type} size="md" />
              <StatusBadge status={g.approvalStatus} type="approval" size="md" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{g.title}</h1>
            {g.description && <p className="text-sm text-gray-500">{g.description}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${id}/edit`}><Edit className="h-4 w-4 mr-1.5" />Edit</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeStatus('Active')}>Mark Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeStatus('Completed')}>Mark Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeStatus('OnHold')}>Put On Hold</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Delete Group</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Meta grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Faculty', value: g.faculty?.name ?? '—', icon: Users },
            { label: 'Domain', value: g.domain?.name ?? '—', icon: TrendingUp },
            { label: 'Members', value: g._count?.students ?? 0, icon: Users },
            { label: 'Start Date', value: formatDate(g.startDate), icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                <Icon className="h-3 w-3" />{label}
              </p>
              <p className="text-sm font-medium text-gray-900">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Completion Progress</span>
            <span className="font-medium text-gray-600">{g.completionPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${g.completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border rounded-xl p-1 h-auto gap-1">
          {[
            { value: 'overview', label: 'Overview', icon: TrendingUp },
            { value: 'members', label: `Members (${g._count?.students ?? 0})`, icon: Users },
            { value: 'milestones', label: `Milestones (${g.milestones?.length ?? 0})`, icon: CheckCircle2 },
            { value: 'comments', label: `Discussion (${g.comments?.length ?? 0})`, icon: MessageSquare },
            { value: 'approvals', label: 'Approvals', icon: ShieldCheck },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-3 py-1.5">
              <Icon className="h-3.5 w-3.5" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-400 mb-1">Success Score</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(g.successScore)}%</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-400 mb-1">Milestones Done</p>
              <p className="text-3xl font-bold text-gray-900">
                {g.milestones?.filter(m => m.status === 'Completed').length ?? 0}
                <span className="text-base font-normal text-gray-400"> / {g.milestones?.length ?? 0}</span>
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-400 mb-1">Domain</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: g.domain?.color ?? '#94a3b8' }} />
                <p className="text-sm font-semibold text-gray-900">{g.domain?.name}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-4">
          <div className="rounded-xl border bg-white overflow-hidden">
            {g.students?.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No students assigned</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PRN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Div / Roll</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Skills</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {g.students?.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{s.prn}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-2.5 hidden sm:table-cell text-gray-500 text-xs">{s.division} / {s.roll}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {s.skills?.slice(0, 3).map(sk => (
                            <span key={sk} className="px-1.5 py-0.5 rounded bg-gray-100 text-xs text-gray-600">{sk}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-gray-500 text-xs">{s.gpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-4">
          <div className="space-y-2">
            {/* Add milestone button */}
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="outline" onClick={() => setShowMilestoneForm(v => !v)}>
                <Plus className="h-4 w-4 mr-1.5" />{showMilestoneForm ? 'Cancel' : 'Add Milestone'}
              </Button>
            </div>

            {/* Inline add form */}
            {showMilestoneForm && (
              <div className="rounded-xl border bg-white p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800">New Milestone</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      placeholder="e.g. Literature Review"
                      value={milestoneForm.name}
                      onChange={e => setMilestoneForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Due Date *</Label>
                    <Input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="Optional description"
                      value={milestoneForm.description}
                      onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={addMilestone.isPending || !milestoneForm.name || !milestoneForm.dueDate}
                    onClick={async () => {
                      try {
                        await addMilestone.mutateAsync({
                          name: milestoneForm.name,
                          description: milestoneForm.description || undefined,
                          dueDate: new Date(milestoneForm.dueDate).toISOString(),
                        })
                        setMilestoneForm({ name: '', description: '', dueDate: '' })
                        setShowMilestoneForm(false)
                        toast.success('Milestone added')
                      } catch {
                        toast.error('Failed to add milestone')
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowMilestoneForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {g.milestones?.length === 0 && !showMilestoneForm ? (
              <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-400">No milestones added yet</div>
            ) : g.milestones?.map(m => (
              <div key={m.id} className="rounded-xl border bg-white p-4 flex items-center gap-4">
                {/* Click to toggle complete */}
                <button
                  onClick={async () => {
                    const newStatus = m.status === 'Completed' ? 'InProgress' : 'Completed'
                    try {
                      await updateMilestone.mutateAsync({ id: m.id, status: newStatus })
                      toast.success(newStatus === 'Completed' ? 'Marked complete' : 'Marked in progress')
                    } catch {
                      toast.error('Failed to update milestone')
                    }
                  }}
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80',
                    m.status === 'Completed' ? 'bg-green-100' : m.status === 'Overdue' ? 'bg-red-100' : 'bg-gray-100'
                  )}
                  title={m.status === 'Completed' ? 'Click to unmark' : 'Click to mark complete'}
                >
                  {m.status === 'Completed'
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : m.status === 'Overdue'
                    ? <CheckCircle2 className="h-5 w-5 text-red-400" />
                    : <Circle className="h-5 w-5 text-gray-300" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-sm', m.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900')}>{m.name}</p>
                  {m.description && <p className="text-xs text-gray-400 truncate">{m.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={m.status} type="milestone" />
                  <span className="text-xs text-gray-400 hidden sm:block">Due {formatDate(m.dueDate)}</span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this milestone?')) return
                      try {
                        await deleteMilestone.mutateAsync(m.id)
                        toast.success('Milestone deleted')
                      } catch {
                        toast.error('Failed to delete milestone')
                      }
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Comments */}
        <TabsContent value="comments" className="mt-4">
          <div className="space-y-3">
            {/* Comment composer */}
            <div className="rounded-xl border bg-white p-4">
              <Textarea
                ref={commentRef}
                placeholder="Write a comment…"
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="resize-none mb-2"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    document.getElementById('post-comment-btn')?.click()
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Ctrl+Enter to post</p>
                <Button
                  id="post-comment-btn"
                  size="sm"
                  disabled={addComment.isPending || !commentText.trim()}
                  onClick={async () => {
                    try {
                      await addComment.mutateAsync({ content: commentText.trim() })
                      setCommentText('')
                      commentRef.current?.focus()
                      toast.success('Comment posted')
                    } catch {
                      toast.error('Failed to post comment')
                    }
                  }}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Post
                </Button>
              </div>
            </div>

            {/* Comment list */}
            {g.comments?.length === 0 ? (
              <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-400">No comments yet — be the first!</div>
            ) : g.comments?.map(c => (
              <div key={c.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {(c.faculty?.name ?? c.student?.name ?? '?')[0]}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{c.faculty?.name ?? c.student?.name ?? 'Coordinator'}</p>
                  <p className="text-xs text-gray-400 ml-auto">{formatDate(c.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Approvals */}
        <TabsContent value="approvals" className="mt-4">
          <div className="space-y-2">
            {g.approvals?.length === 0 ? (
              <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-400">No approval records</div>
            ) : g.approvals?.map(a => (
              <div key={a.id} className="rounded-xl border bg-white p-4 flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 shrink-0">
                  {a.order}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.approverName}</p>
                  <p className="text-xs text-gray-400">{a.approverType}</p>
                  {a.comments && <p className="text-xs text-gray-500 mt-1 italic">"{a.comments}"</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={a.status} type="approval" />
                  {a.approvalDate && <span className="text-xs text-gray-400">{formatDate(a.approvalDate)}</span>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
