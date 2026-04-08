'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useFaculty, useDomains, useCreateGroup, useUpdateGroup } from '@/hooks/useApi'

const formSchema = z.object({
  groupId:       z.string().min(1, 'Required').max(20, 'Max 20 chars'),
  title:         z.string().min(3, 'Min 3 chars').max(300, 'Max 300 chars'),
  description:   z.string().optional(),
  division:      z.enum(['A', 'B'], { message: 'Select a division' }),
  type:          z.enum(['Respondent', 'NonResp', 'CrossDiv'], { message: 'Select a type' }),
  facultyId:     z.string().min(1, 'Select a faculty member'),
  domainId:      z.string().min(1, 'Select a domain'),
  targetEndDate: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface GroupFormProps {
  mode: 'create' | 'edit'
  groupId?: string
  defaultValues?: Partial<FormValues>
}

const TYPE_LABELS: Record<string, string> = {
  Respondent: 'Respondent',
  NonResp: 'Non-Respondent',
  CrossDiv: 'Cross-Division',
}

export function GroupForm({ mode, groupId, defaultValues }: GroupFormProps) {
  const router = useRouter()
  const { data: faculty = [] } = useFaculty()
  const { data: domains = [] } = useDomains()
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup(groupId ?? '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: '',
      title: '',
      description: '',
      division: undefined,
      type: undefined,
      facultyId: '',
      domainId: '',
      targetEndDate: '',
      ...defaultValues,
    },
  })

  // Re-populate when editing and defaultValues load
  useEffect(() => {
    if (defaultValues) reset({ ...defaultValues } as FormValues)
  }, [defaultValues, reset])

  // eslint-disable-next-line react-hooks/incompatible-library
  const divisionVal = watch('division')
  // eslint-disable-next-line react-hooks/incompatible-library
  const typeVal = watch('type')
  // eslint-disable-next-line react-hooks/incompatible-library
  const facultyVal = watch('facultyId')
  // eslint-disable-next-line react-hooks/incompatible-library
  const domainVal = watch('domainId')

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        targetEndDate: values.targetEndDate
          ? new Date(values.targetEndDate).toISOString()
          : undefined,
      }

      if (mode === 'create') {
        const group = await createGroup.mutateAsync(payload)
        toast.success('Group created successfully')
        router.push(`/groups/${group.id}`)
      } else {
        await updateGroup.mutateAsync(payload)
        toast.success('Group updated successfully')
        router.push(`/groups/${groupId}`)
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong'
      toast.error(msg)
    }
  }

  const facultyList = faculty as { id: string; name: string; title: string }[]
  const domainList = domains as { id: string; name: string; category: string }[]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Group ID + Division row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="groupId">Group ID <span className="text-red-500">*</span></Label>
          <Input
            id="groupId"
            placeholder="e.g. A-01"
            {...register('groupId')}
            disabled={mode === 'edit'}
            className={errors.groupId ? 'border-red-400' : ''}
          />
          {errors.groupId && <p className="text-xs text-red-500">{errors.groupId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Division <span className="text-red-500">*</span></Label>
          <Select
            value={divisionVal}
            onValueChange={v => setValue('division', (v ?? '') as 'A' | 'B', { shouldValidate: true })}
          >
            <SelectTrigger className={errors.division ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Division A</SelectItem>
              <SelectItem value="B">Division B</SelectItem>
            </SelectContent>
          </Select>
          {errors.division && <p className="text-xs text-red-500">{errors.division.message}</p>}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Project Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Full research project title"
          {...register('title')}
          className={errors.title ? 'border-red-400' : ''}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the research project…"
          rows={3}
          {...register('description')}
        />
      </div>

      {/* Type + Faculty row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Group Type <span className="text-red-500">*</span></Label>
          <Select
            value={typeVal}
            onValueChange={v =>
              setValue('type', (v ?? '') as 'Respondent' | 'NonResp' | 'CrossDiv', { shouldValidate: true })
            }
          >
            <SelectTrigger className={errors.type ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Faculty Supervisor <span className="text-red-500">*</span></Label>
          <Select
            value={facultyVal}
            onValueChange={v => setValue('facultyId', v ?? '', { shouldValidate: true })}
          >
            <SelectTrigger className={errors.facultyId ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {facultyList.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {f.title} {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.facultyId && <p className="text-xs text-red-500">{errors.facultyId.message}</p>}
        </div>
      </div>

      {/* Domain + Target Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Research Domain <span className="text-red-500">*</span></Label>
          <Select
            value={domainVal}
            onValueChange={v => setValue('domainId', v ?? '', { shouldValidate: true })}
          >
            <SelectTrigger className={errors.domainId ? 'border-red-400' : ''}>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {domainList.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.domainId && <p className="text-xs text-red-500">{errors.domainId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="targetEndDate">Target End Date</Label>
          <Input
            id="targetEndDate"
            type="date"
            {...register('targetEndDate')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Create Group' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
