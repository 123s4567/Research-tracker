# MCA Research Group Allocation Tracker

A production-grade research management system for MCA programme — managing 58 research groups, 137 students, and 10 faculty guides.

Built with **Next.js 16**, **Prisma 7**, **PostgreSQL 15**, and **TypeScript**.

---

## Features

| Tier | Feature |
|---|---|
| Core | Groups, Students, Faculty, Domains — full CRUD |
| Collaboration | Milestone tracking, Comment threads, Kanban board |
| Analytics | 6 chart types, Completion distribution, At-risk predictions |
| Intelligence | AI recommendations, Student-project matching, Domain gap analysis |
| UX | Full-text search, Kanban drag-drop, Dark mode, PWA / offline |
| Integration | CSV/iCal export, Webhooks (HMAC-signed), Email notifications |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### 1. Clone & install

```bash
git clone <repo-url>
cd mca-research-tracker
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL and JWT_SECRET
```

Minimum `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mca_tracker
JWT_SECRET=your-secret-here-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start database

```bash
docker-compose up -d postgres
```

### 4. Migrate + seed

```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed 58 groups, 137 students, 10 faculty
```

### 5. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

**Login:** `admin@nmiet.edu` / `admin123`

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run Jest test suite |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset DB + re-seed |
| `npm run lint` | ESLint |

---

## Docker

### Development (DB only)

```bash
docker-compose up -d postgres
```

### Full stack

```bash
docker-compose up --build
# App: http://localhost:3000
```

### Environment variables for Docker

```env
JWT_SECRET=change-this-in-production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SMTP_HOST=smtp.yourprovider.com      # optional
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM="MCA Research Tracker <noreply@nmiet.edu>"
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app pages
│   │   ├── analytics/  groups/  kanban/  recommendations/
│   │   ├── approvals/  faculty/ search/  settings/
│   │   └── domains/    students/
│   ├── api/            # 50+ API routes
│   │   ├── ai/  analytics/  approvals/  auth/
│   │   ├── calendar/  export/  faculty/  groups/
│   │   ├── health/  milestones/  notifications/
│   │   ├── recommendations/  search/  students/  webhooks/
│   └── login/  offline/
├── components/
│   ├── common/    # PageHeader, StatusBadge, EmptyState
│   ├── groups/    # GroupCard, GroupFilters, GroupForm
│   ├── layout/    # Header, Sidebar
│   └── ui/        # shadcn/ui components
├── hooks/
│   └── useApi.ts  # All React Query hooks
└── lib/
    ├── auth.ts     email.ts    logger.ts
    ├── prisma.ts   rateLimit.ts
    ├── utils.ts    webhooks.ts
prisma/
├── schema.prisma   # 11 models
└── seed.ts         # Demo data seeder
tests/
├── unit/           # Jest unit tests
└── integration/    # API integration tests
```

---

## API Overview

### Auth
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Login, sets JWT cookie |
| `/api/auth/register` | POST | Register user |
| `/api/auth/logout` | POST | Clear cookie |
| `/api/auth/me` | GET | Current user |

### Groups
| Endpoint | Method | Description |
|---|---|---|
| `/api/groups` | GET/POST | List / Create |
| `/api/groups/:id` | GET/PUT/DELETE | Read / Update / Delete |
| `/api/groups/:id/status` | POST | Change status |
| `/api/groups/:id/milestones` | GET/POST | Milestones |
| `/api/groups/:id/comments` | GET/POST | Comments |

### Analytics & Export
| Endpoint | Description |
|---|---|
| `/api/analytics/summary` | Dashboard stats |
| `/api/analytics/predictions` | At-risk scoring |
| `/api/export/groups?format=csv` | Groups CSV |
| `/api/export/students?format=csv` | Students CSV |
| `/api/export/faculty?format=csv` | Faculty CSV |
| `/api/calendar/ical` | Milestone iCal feed |

### Integrations
| Endpoint | Method | Description |
|---|---|---|
| `/api/webhooks` | GET/POST/PATCH/DELETE | Webhook CRUD |
| `/api/ai/match-students?domainId=` | GET | AI student matching |
| `/api/health` | GET | Health + DB stats |

---

## Testing

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main`/`develop`:

1. **Lint + TypeCheck** — ESLint + `tsc --noEmit`
2. **Tests** — Jest with PostgreSQL service container
3. **Build** — `next build`
4. **Deploy** — On `main` merge (add deploy hook to secrets)

---

## Email

Set `SMTP_HOST` to enable real sending. Without it, emails are logged to console.

Templates: Group created · Milestone alert · Status changed · Weekly digest

---

## Webhooks

Configure in **Settings → Integrations**. Payloads are HMAC-SHA256 signed:

```
X-MCA-Webhook-Signature: sha256=<hex>
X-MCA-Webhook-Event: group.created
```

Events: `group.created` · `group.updated` · `group.status_changed` · `milestone.completed` · `approval.changed`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Language | TypeScript 5 strict |
| Database | PostgreSQL 15 |
| ORM | Prisma 7 + adapter-pg |
| UI | shadcn/ui v4 + Base UI + Tailwind 4 |
| Charts | Recharts 3 |
| Drag & Drop | dnd-kit |
| State | Zustand + React Query v5 |
| Auth | JWT + bcryptjs |
| Email | Nodemailer |
| Testing | Jest + React Testing Library |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions |

---

## Deployment (Render.com)

1. Push to GitHub, create Web Service
2. Build: `npm ci && npx prisma generate && npm run build`
3. Start: `npx prisma migrate deploy && npm start`
4. Add PostgreSQL addon, set `DATABASE_URL` + `JWT_SECRET`

---

*MCA Research Tracker · NMIET Pune · Academic Year 2025–26*
