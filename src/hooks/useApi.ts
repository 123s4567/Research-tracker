'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ─── Groups ───────────────────────────────────────────────────────────────────

export interface GroupFilters {
  division?: string
  status?: string
  facultyId?: string
  domainId?: string
  search?: string
  page?: number
  limit?: number
}

export function useGroups(filters: GroupFilters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: () => api.get(`/groups?${params}`).then(r => r.data.data),
    placeholderData: [],
  })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => api.get(`/groups/${id}`).then(r => r.data.data),
    enabled: !!id,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/groups', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useUpdateGroup(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.put(`/groups/${id}`, data).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }) },
  })
}

export function useUpdateGroupStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: string) => api.post(`/groups/${id}/status`, { status }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useAddMilestone(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post(`/groups/${groupId}/milestones`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

export function useUpdateMilestone(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) =>
      api.patch(`/milestones/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

export function useDeleteMilestone(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/milestones/${id}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useAddComment(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post(`/groups/${groupId}/comments`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations/optimal-groups').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export function useFaculty() {
  return useQuery({
    queryKey: ['faculty'],
    queryFn: () => api.get('/faculty').then(r => r.data.data),
    placeholderData: [],
  })
}

export function useFacultyMember(id: string) {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: () => api.get(`/faculty/${id}`).then(r => r.data.data),
    enabled: !!id,
  })
}

export function useFacultyWorkload(id: string) {
  return useQuery({
    queryKey: ['faculty', id, 'workload'],
    queryFn: () => api.get(`/faculty/${id}/workload`).then(r => r.data.data),
    enabled: !!id,
  })
}

// ─── Students ─────────────────────────────────────────────────────────────────

export function useStudents(filters: { groupId?: string; division?: string; search?: string } = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => api.get(`/students?${params}`).then(r => r.data.data),
    placeholderData: [],
  })
}

// ─── Domains ──────────────────────────────────────────────────────────────────

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: () => api.get('/domains').then(r => r.data.data),
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => api.get('/analytics/summary').then(r => r.data.data),
  })
}

export function useDomainAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'domains'],
    queryFn: () => api.get('/analytics/domains').then(r => r.data.data),
    placeholderData: [],
  })
}

export function useFacultyAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'faculty'],
    queryFn: () => api.get('/analytics/faculty').then(r => r.data.data),
    placeholderData: [],
  })
}

export function usePredictions() {
  return useQuery({
    queryKey: ['analytics', 'predictions'],
    queryFn: () => api.get('/analytics/predictions').then(r => r.data.data),
  })
}

export function useTimeline() {
  return useQuery({
    queryKey: ['analytics', 'timeline'],
    queryFn: () => api.get('/analytics/timeline').then(r => r.data.data),
  })
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function useMatchStudents(domainId: string, limit = 10) {
  return useQuery({
    queryKey: ['ai', 'match-students', domainId, limit],
    queryFn: () =>
      api.get(`/ai/match-students?domainId=${domainId}&limit=${limit}`).then(r => r.data.data),
    enabled: !!domainId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(q)}`).then(r => r.data.data),
    enabled: q.length >= 2,
    staleTime: 30 * 1000,
  })
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    refetchInterval: 30 * 1000, // Poll every 30s
  })
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export function useApprovals(status = 'Pending') {
  return useQuery({
    queryKey: ['approvals', status],
    queryFn: () => api.get(`/approvals?status=${status}`).then(r => r.data.data),
    placeholderData: [],
  })
}
