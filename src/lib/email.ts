import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// Transport — falls back to Ethereal (test SMTP) when SMTP_HOST is not set
// ---------------------------------------------------------------------------

let _transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (_transporter) return _transporter

  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Dev mode: log to console, do not actually send
    _transporter = nodemailer.createTransport({ jsonTransport: true })
  }

  return _transporter
}

const FROM = process.env.EMAIL_FROM ?? '"MCA Research Tracker" <noreply@nmiet.edu>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// HTML template helper
// ---------------------------------------------------------------------------

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <tr><td style="background:#2563eb;padding:24px 32px">
        <h1 style="margin:0;color:#fff;font-size:20px">MCA Research Tracker</h1>
        <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px">NMIET Pune</p>
      </td></tr>
      <tr><td style="padding:32px">${body}</td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center">
        MCA Research Tracker · NMIET Pune · Academic Year 2025–26
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

// ---------------------------------------------------------------------------
// Email senders
// ---------------------------------------------------------------------------

export async function sendGroupCreatedEmail(opts: {
  to: string
  groupId: string
  title: string
  facultyName: string
  division: string
}) {
  const t = getTransporter()
  const subject = `New Group Registered: ${opts.groupId}`
  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b">New Research Group</h2>
    <p style="color:#475569">A new research group has been registered and is pending review.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Group ID</td><td style="font-weight:600;color:#1e293b">${opts.groupId}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Title</td><td style="font-weight:600;color:#1e293b">${opts.title}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Faculty</td><td style="color:#1e293b">${opts.facultyName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Division</td><td style="color:#1e293b">${opts.division}</td></tr>
    </table>
    <a href="${BASE_URL}/groups" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">View Groups</a>
  `

  const transporter = await t
  const result = await transporter.sendMail({
    from: FROM, to: opts.to, subject,
    html: wrapHtml(subject, body),
  })

  if (!process.env.SMTP_HOST) {
    console.log('[email/dev] GroupCreated:', JSON.stringify(result, null, 2))
  }
}

export async function sendMilestoneAlertEmail(opts: {
  to: string
  milestoneName: string
  groupId: string
  groupTitle: string
  dueDate: Date
  daysLeft: number
}) {
  const t = getTransporter()
  const subject = `Milestone Due in ${opts.daysLeft} day${opts.daysLeft !== 1 ? 's' : ''}: ${opts.milestoneName}`
  const urgency = opts.daysLeft <= 1 ? '#dc2626' : opts.daysLeft <= 3 ? '#d97706' : '#16a34a'
  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b">Upcoming Milestone</h2>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0;font-weight:600;color:${urgency};font-size:18px">${opts.daysLeft} day${opts.daysLeft !== 1 ? 's' : ''} remaining</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Milestone</td><td style="font-weight:600;color:#1e293b">${opts.milestoneName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Group</td><td style="color:#1e293b">${opts.groupId} – ${opts.groupTitle}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Due Date</td><td style="color:#1e293b">${opts.dueDate.toLocaleDateString('en-IN')}</td></tr>
    </table>
    <a href="${BASE_URL}/groups" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">View Milestones</a>
  `

  const transporter = await t
  const result = await transporter.sendMail({
    from: FROM, to: opts.to, subject,
    html: wrapHtml(subject, body),
  })

  if (!process.env.SMTP_HOST) {
    console.log('[email/dev] MilestoneAlert:', JSON.stringify(result, null, 2))
  }
}

export async function sendStatusChangedEmail(opts: {
  to: string
  groupId: string
  groupTitle: string
  oldStatus: string
  newStatus: string
}) {
  const t = getTransporter()
  const subject = `Status Updated: ${opts.groupId} → ${opts.newStatus}`
  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b">Group Status Changed</h2>
    <p style="color:#475569">The status of <strong>${opts.groupId}</strong> has been updated.</p>
    <div style="display:flex;gap:12px;align-items:center;margin:20px 0">
      <span style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:6px 14px;color:#64748b">${opts.oldStatus}</span>
      <span style="color:#94a3b8">→</span>
      <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:6px 14px;color:#2563eb;font-weight:600">${opts.newStatus}</span>
    </div>
    <p style="color:#64748b;font-size:14px">${opts.groupTitle}</p>
    <a href="${BASE_URL}/groups" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">View Group</a>
  `

  const transporter = await t
  const result = await transporter.sendMail({
    from: FROM, to: opts.to, subject,
    html: wrapHtml(subject, body),
  })

  if (!process.env.SMTP_HOST) {
    console.log('[email/dev] StatusChanged:', JSON.stringify(result, null, 2))
  }
}

export async function sendWeeklyDigestEmail(opts: {
  to: string
  totalGroups: number
  activeGroups: number
  upcomingMilestones: number
  pendingApprovals: number
  weekOf: string
}) {
  const t = getTransporter()
  const subject = `Weekly Digest – MCA Research Tracker (${opts.weekOf})`
  const body = `
    <h2 style="margin:0 0 8px;color:#1e293b">Weekly Summary</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:14px">Week of ${opts.weekOf}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
      ${[
        { label: 'Total Groups',         value: opts.totalGroups,         color: '#2563eb' },
        { label: 'Active Groups',         value: opts.activeGroups,        color: '#16a34a' },
        { label: 'Upcoming Milestones',   value: opts.upcomingMilestones,  color: '#d97706' },
        { label: 'Pending Approvals',     value: opts.pendingApprovals,    color: '#9333ea' },
      ].map(s => `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
          <p style="margin:0;font-size:28px;font-weight:700;color:${s.color}">${s.value}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#94a3b8">${s.label}</p>
        </div>`).join('')}
    </div>
    <a href="${BASE_URL}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">Open Dashboard</a>
  `

  const transporter = await t
  const result = await transporter.sendMail({
    from: FROM, to: opts.to, subject,
    html: wrapHtml(subject, body),
  })

  if (!process.env.SMTP_HOST) {
    console.log('[email/dev] WeeklyDigest:', JSON.stringify(result, null, 2))
  }
}
