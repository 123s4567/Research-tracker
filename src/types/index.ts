import type {
  ResearchGroup,
  Student,
  Faculty,
  Domain,
  Milestone,
  Approval,
  Comment,
  Notification,
  ChangeLog,
  User,
  Division,
  GroupType,
  GroupStatus,
  ApprovalStatus,
  MilestoneStatus,
  StudentStatus,
  NotificationType,
  UserRole,
} from '@prisma/client'

// ─── Re-export Prisma types ───────────────────────────────────────────────────
export type {
  ResearchGroup,
  Student,
  Faculty,
  Domain,
  Milestone,
  Approval,
  Comment,
  Notification,
  ChangeLog,
  User,
  Division,
  GroupType,
  GroupStatus,
  ApprovalStatus,
  MilestoneStatus,
  StudentStatus,
  NotificationType,
  UserRole,
}

// ─── Extended / Enriched Types ────────────────────────────────────────────────

export type GroupWithRelations = ResearchGroup & {
  faculty: Pick<Faculty, 'id' | 'name' | 'email' | 'title'>
  domain: Pick<Domain, 'id' | 'name' | 'color'>
  _count: { students: number; milestones: number; comments: number }
}

export type GroupDetail = ResearchGroup & {
  faculty: Faculty
  domain: Domain
  students: Student[]
  milestones: Milestone[]
  comments: (Comment & {
    student: Pick<Student, 'id' | 'name' | 'prn'> | null
    faculty: Pick<Faculty, 'id' | 'name'> | null
  })[]
  approvals: (Approval & {
    faculty: Pick<Faculty, 'id' | 'name'> | null
  })[]
  _count: { students: number }
}

export type FacultyWithGroups = Faculty & {
  _count: { groups: number }
  groups: Pick<ResearchGroup, 'id' | 'groupId' | 'title' | 'status' | 'division'>[]
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiResponse<T> {
  success: true
  data: T
  pagination?: PaginationMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// ─── Dashboard / Analytics Types ─────────────────────────────────────────────

export interface DashboardStats {
  totalGroups: number
  totalStudents: number
  totalFaculty: number
  totalDomains: number
  activeGroups: number
  completedGroups: number
  pendingApprovals: number
  avgSuccessScore: number
  groupsByStatus: Record<GroupStatus, number>
  groupsByDivision: Record<Division, number>
}

export interface FacultyWorkload {
  facultyId: string
  facultyName: string
  groupCount: number
  maxGroups: number
  utilizationPercent: number
  studentCount: number
  isOverloaded: boolean
}

export interface DomainStats {
  domainId: string
  domainName: string
  color: string | null
  groupCount: number
  studentCount: number
  avgSuccessScore: number
}

// ─── Filter / Search Types ────────────────────────────────────────────────────

export interface GroupFilters {
  division?: Division
  status?: GroupStatus
  facultyId?: string
  domainId?: string
  search?: string
  page?: number
  limit?: number
  sort?: 'created' | 'title' | 'faculty' | 'domain'
  order?: 'asc' | 'desc'
}

export interface SearchResult {
  type: 'group' | 'student' | 'faculty'
  id: string
  title: string
  subtitle?: string
  snippet?: string
  url: string
}
