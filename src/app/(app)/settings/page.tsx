'use client'

import { useState } from 'react'
import {
  User, Bell, Database, Shield, Info,
  Download, Webhook, Check, Copy, Trash2, Plus,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'export',        label: 'Export',         icon: Download },
  { id: 'integrations',  label: 'Integrations',   icon: Webhook },
  { id: 'system',        label: 'System',         icon: Database },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'about',         label: 'About',          icon: Info },
] as const

type Section = typeof SECTIONS[number]['id']

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('profile')
  const [saved, setSaved]   = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your account and application preferences" />

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  active === id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content panel */}
        <div className="flex-1 rounded-xl border bg-white p-6 space-y-6 min-h-[400px]">
          {active === 'profile'       && <ProfileSection onSave={handleSave} saved={saved} />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'export'        && <ExportSection />}
          {active === 'integrations'  && <IntegrationsSection />}
          {active === 'system'        && <SystemSection />}
          {active === 'security'      && <SecuritySection onSave={handleSave} saved={saved} />}
          {active === 'about'         && <AboutSection />}
        </div>
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────

function ProfileSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input defaultValue="Admin Coordinator" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input defaultValue="coordinator@nmiet.edu" type="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input defaultValue="Coordinator" disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Input defaultValue="MCA Department" />
        </div>
      </div>
      <Button size="sm" onClick={onSave}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </Button>
    </div>
  )
}

// ── Notifications ──────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    groupCreated:     true,
    statusChange:     true,
    milestoneAlert:   true,
    approvalRequired: true,
    weeklyReport:     false,
  })
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  const items: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'groupCreated',     label: 'New group created',     desc: 'When a new research group is registered' },
    { key: 'statusChange',     label: 'Status changes',        desc: 'When a group status is updated' },
    { key: 'milestoneAlert',   label: 'Milestone alerts',      desc: 'Upcoming milestone due dates (3 days)' },
    { key: 'approvalRequired', label: 'Approval required',     desc: 'When groups need coordinator approval' },
    { key: 'weeklyReport',     label: 'Weekly digest email',   desc: 'Summary of activity every Monday' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Choose what you want to be notified about</p>
      </div>
      <div className="divide-y">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                prefs[key] ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                prefs[key] ? 'translate-x-4.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────

const EXPORT_ITEMS = [
  {
    label: 'Research Groups',
    desc:  'All 58 groups with faculty, domain, status and completion',
    href:  '/api/export/groups?format=csv',
    file:  'mca-groups.csv',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Students (All)',
    desc:  'All 137 students with PRN, skills, group assignment',
    href:  '/api/export/students?format=csv',
    file:  'mca-students.csv',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    label: 'Students – Division A',
    desc:  'Division A students only',
    href:  '/api/export/students?format=csv&division=A',
    file:  'mca-students-divA.csv',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    label: 'Students – Division B',
    desc:  'Division B students only',
    href:  '/api/export/students?format=csv&division=B',
    file:  'mca-students-divB.csv',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    label: 'Faculty Workload',
    desc:  'All 10 faculty with group load, utilisation and performance',
    href:  '/api/export/faculty?format=csv',
    file:  'mca-faculty.csv',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    label: 'Milestone Calendar (.ics)',
    desc:  'Import all research milestones into Google Calendar / Outlook',
    href:  '/api/calendar/ical',
    file:  'mca-milestones.ics',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
] as const

function ExportSection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Export Data</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download CSV reports or calendar feeds</p>
      </div>
      <div className="space-y-2">
        {EXPORT_ITEMS.map(item => (
          <div key={item.file} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <a
              href={item.href}
              download={item.file}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80',
                item.color
              )}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Integrations ───────────────────────────────────────────────────────────

const ALL_EVENTS = [
  { id: 'group.created',       label: 'Group created' },
  { id: 'group.updated',       label: 'Group updated' },
  { id: 'group.status_changed',label: 'Status changed' },
  { id: 'milestone.completed', label: 'Milestone completed' },
  { id: 'approval.changed',    label: 'Approval changed' },
] as const

type WebhookEvent = typeof ALL_EVENTS[number]['id']

interface WebhookDraft {
  url:    string
  secret: string
  events: WebhookEvent[]
}

function IntegrationsSection() {
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const icalUrl = `${base}/api/calendar/ical`

  const [copied, setCopied] = useState(false)
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; active: boolean }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<WebhookDraft>({ url: '', secret: '', events: [] })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    if (loaded) return
    try {
      const res = await fetch('/api/webhooks')
      const json = await res.json()
      if (json.success) setWebhooks(json.data.webhooks)
    } catch { /* ignore */ }
    setLoaded(true)
  }

  // Load on mount
  useState(() => { load() })

  function copyIcal() {
    navigator.clipboard.writeText(icalUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function toggleEvent(ev: WebhookEvent) {
    setDraft(d => ({
      ...d,
      events: d.events.includes(ev) ? d.events.filter(e => e !== ev) : [...d.events, ev],
    }))
  }

  async function saveWebhook() {
    if (!draft.url || draft.events.length === 0 || draft.secret.length < 8) return
    setSaving(true)
    try {
      const res  = await fetch('/api/webhooks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...draft, active: true }),
      })
      const json = await res.json()
      if (json.success) {
        setWebhooks(prev => [...prev, json.data])
        setDraft({ url: '', secret: '', events: [] })
        setShowForm(false)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  async function removeWebhook(id: string) {
    await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' })
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Calendar feed */}
      <div>
        <h2 className="text-base font-semibold text-gray-900">Calendar Feed</h2>
        <p className="text-sm text-gray-500 mt-0.5">Subscribe to all research milestones in your calendar app</p>
        <div className="mt-3 flex gap-2">
          <code className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-xs text-gray-600 truncate select-all">
            {icalUrl}
          </code>
          <button
            onClick={copyIcal}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href="/api/calendar/ical"
            download="mca-milestones.ics"
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Webhooks */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Webhooks</h2>
            <p className="text-sm text-gray-500 mt-0.5">Receive HTTP POST notifications when events occur</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowForm(s => !s)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mt-3 rounded-xl border bg-gray-50 p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Endpoint URL</Label>
              <Input
                placeholder="https://your-server.com/webhook"
                value={draft.url}
                onChange={e => setDraft(d => ({ ...d, url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Secret (min 8 chars)</Label>
              <Input
                placeholder="••••••••••••"
                value={draft.secret}
                onChange={e => setDraft(d => ({ ...d, secret: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Events</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_EVENTS.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      draft.events.includes(ev.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 hover:border-blue-300'
                    )}
                  >
                    {ev.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveWebhook} disabled={saving}>
                {saving ? 'Saving…' : 'Save Webhook'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Webhook list */}
        <div className="mt-3 space-y-2">
          {webhooks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No webhooks configured</p>
          ) : (
            webhooks.map(wh => (
              <div key={wh.id} className="flex items-start justify-between rounded-lg border bg-white p-3">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-gray-700 truncate">{wh.url}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{wh.events.join(' · ')}</p>
                </div>
                <button
                  onClick={() => removeWebhook(wh.id)}
                  className="ml-3 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── System ─────────────────────────────────────────────────────────────────

function SystemSection() {
  const stats = [
    { label: 'Total Research Groups', value: '58' },
    { label: 'Total Students',        value: '137' },
    { label: 'Total Faculty',         value: '10' },
    { label: 'Research Domains',      value: '36' },
    { label: 'Academic Year',         value: '2025–26' },
    { label: 'Institution',           value: 'NMIET Pune' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">System Information</h2>
        <p className="text-sm text-gray-500 mt-0.5">Application and database statistics</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">Database</p>
        <p className="text-xs text-amber-600 mt-0.5">PostgreSQL 15 · Connected via Prisma 7</p>
      </div>
    </div>
  )
}

// ── Security ───────────────────────────────────────────────────────────────

function SecuritySection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Security</h2>
        <p className="text-sm text-gray-500 mt-0.5">Change your password and security settings</p>
      </div>
      <div className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <Label>Current Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm New Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
      </div>
      <Button size="sm" onClick={onSave}>
        {saved ? '✓ Password Updated' : 'Update Password'}
      </Button>
    </div>
  )
}

// ── About ──────────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">About</h2>
        <p className="text-sm text-gray-500 mt-0.5">Application information and version details</p>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Application', value: 'MCA Research Group Allocation Tracker' },
          { label: 'Version',     value: '1.0.0' },
          { label: 'Framework',   value: 'Next.js 16.2.2' },
          { label: 'UI Library',  value: 'shadcn/ui v4 + Base UI' },
          { label: 'ORM',         value: 'Prisma 7 + PostgreSQL 15' },
          { label: 'Institution', value: 'NMIET Pune — MCA Department' },
          { label: 'Academic Year', value: '2025–26' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm border-b pb-2 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
