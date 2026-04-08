import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiCreated<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function apiError(message: string, status = 400, code?: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code: code ?? 'ERROR', message, details } },
    { status }
  )
}

export function apiNotFound(resource = 'Resource') {
  return apiError(`${resource} not found`, 404, 'NOT_FOUND')
}

export function apiUnauthorized() {
  return apiError('Authentication required', 401, 'UNAUTHORIZED')
}

export function apiForbidden() {
  return apiError('You do not have permission to perform this action', 403, 'FORBIDDEN')
}

export function apiServerError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error'
  console.error('[API Error]', error)
  return apiError(message, 500, 'SERVER_ERROR')
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return { page, limit, total, pages: Math.ceil(total / limit) }
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Status Colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS = {
  Proposed:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  InReview:  'bg-blue-100 text-blue-800 border-blue-200',
  Active:    'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  OnHold:    'bg-red-100 text-red-800 border-red-200',
} as const

export const APPROVAL_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
} as const

export const MILESTONE_COLORS = {
  NotStarted: 'bg-gray-100 text-gray-600',
  InProgress: 'bg-blue-100 text-blue-700',
  Completed:  'bg-green-100 text-green-700',
  Overdue:    'bg-red-100 text-red-700',
} as const
