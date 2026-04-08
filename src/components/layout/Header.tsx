'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, Search, LogOut, User, Menu, CheckCheck, AlertCircle, GitBranch, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/useApi'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  onMenuClick?: () => void
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  group?: { id: string; groupId: string; title: string } | null
}

const NOTIF_ICONS: Record<string, React.ElementType> = {
  GROUP_CREATED:    GitBranch,
  STATUS_CHANGED:   GitBranch,
  MILESTONE_ALERT:  Clock,
  APPROVAL_NEEDED:  AlertCircle,
  APPROVAL_DONE:    CheckCheck,
}

function getNotifIcon(type: string) {
  return NOTIF_ICONS[type] ?? Bell
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const { data: notifData } = useNotifications()
  const notifications: Notification[] = notifData?.notifications ?? []
  const unreadCount: number = notifData?.unreadCount ?? 0

  async function handleLogout() {
    try {
      await axios.post('/api/auth/logout')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout failed')
    }
  }

  async function markRead(id: string) {
    try {
      await axios.post(`/api/notifications/${id}/read`)
      qc.invalidateQueries({ queryKey: ['notifications'] })
    } catch {
      /* silent */
    }
  }

  async function markAllRead() {
    try {
      // Mark each unread notification
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(unread.map(n => axios.post(`/api/notifications/${n.id}/read`)))
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark notifications as read')
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-900 dark:border-gray-800 px-4 gap-4">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search shortcut */}
      <Link
        href="/search"
        className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-100 transition-colors min-w-[220px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search groups, faculty…</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center rounded border bg-white px-1 font-mono text-[10px] text-gray-400">⌘K</kbd>
      </Link>

      <div className="flex items-center gap-1 ml-auto">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
        >
          {mounted && resolvedTheme === 'dark'
            ? <Sun className="h-4 w-4 text-gray-500" />
            : <Moon className="h-4 w-4 text-gray-500" />
          }
        </Button>

        {/* Notification Bell Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 15).map(n => {
                  const Icon = getNotifIcon(n.type)
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 border-b last:border-0',
                        !n.isRead && 'bg-blue-50/60'
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5',
                        !n.isRead ? 'bg-blue-100' : 'bg-gray-100'
                      )}>
                        <Icon className={cn('h-4 w-4', !n.isRead ? 'text-blue-600' : 'text-gray-400')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium truncate', !n.isRead ? 'text-gray-900' : 'text-gray-600')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t px-4 py-2">
                <Link
                  href="/approvals"
                  className="text-xs text-blue-600 hover:text-blue-800 block text-center"
                >
                  View all approvals →
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium text-sm">My Account</p>
              <p className="text-xs text-gray-500 font-normal">NMIET Coordinator</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
