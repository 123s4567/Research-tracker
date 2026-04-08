'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, BarChart3,
  Kanban, Bell, Settings, Search, FlaskConical, ChevronRight, Lightbulb,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',        href: '/',               icon: LayoutDashboard },
  { label: 'Groups',           href: '/groups',          icon: FlaskConical },
  { label: 'Kanban',           href: '/kanban',          icon: Kanban },
  { label: 'Faculty',          href: '/faculty',         icon: Users },
  { label: 'Students',         href: '/students',        icon: GraduationCap },
  { label: 'Domains',          href: '/domains',         icon: BookOpen },
  { label: 'Analytics',        href: '/analytics',       icon: BarChart3 },
  { label: 'Recommendations',  href: '/recommendations', icon: Lightbulb },
  { label: 'Search',           href: '/search',          icon: Search },
  { label: 'Approvals',        href: '/approvals',       icon: Bell },
  { label: 'Settings',         href: '/settings',        icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">MCA Research</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">NMIET Pune</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">MCA 2025–26</p>
          <p className="text-xs text-blue-500 dark:text-blue-500">58 Groups · 137 Students</p>
        </div>
      </div>
    </aside>
  )
}
