'use client'

import { use } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLoader } from '@/components/common/LoadingSpinner'
import { GroupForm } from '@/components/groups/GroupForm'
import { useGroup } from '@/hooks/useApi'

interface EditGroupPageProps {
  params: Promise<{ id: string }>
}

export default function EditGroupPage({ params }: EditGroupPageProps) {
  const { id } = use(params)
  const { data: group, isLoading } = useGroup(id)

  if (isLoading) return <PageLoader />

  if (!group) {
    return (
      <div className="max-w-2xl">
        <p className="text-gray-500">Group not found.</p>
      </div>
    )
  }

  const defaultValues = {
    groupId:       group.groupId,
    title:         group.title,
    description:   group.description ?? '',
    division:      group.division as 'A' | 'B',
    type:          group.type as 'Respondent' | 'NonResp' | 'CrossDiv',
    facultyId:     group.faculty?.id ?? group.facultyId,
    domainId:      group.domain?.id ?? group.domainId,
    targetEndDate: group.targetEndDate
      ? new Date(group.targetEndDate).toISOString().split('T')[0]
      : '',
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={`Edit: ${group.groupId}`}
        description={group.title}
        back={`/groups/${id}`}
      />
      <div className="rounded-xl border bg-white p-6">
        <GroupForm mode="edit" groupId={id} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
