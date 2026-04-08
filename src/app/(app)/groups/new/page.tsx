'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { GroupForm } from '@/components/groups/GroupForm'

export default function NewGroupPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="New Research Group"
        description="Register a new research project group"
        back="/groups"
      />
      <div className="rounded-xl border bg-white p-6">
        <GroupForm mode="create" />
      </div>
    </div>
  )
}
