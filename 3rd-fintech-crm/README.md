# 3RD Fintech CRM — TypeScript

Port từ Laravel + Filament CRM sang **TypeScript + Next.js 15 + Prisma + Auth.js**.

> Repo gốc Laravel: https://github.com/lhoaibao1/3rdvn-crm

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) |
| Auth | Auth.js (NextAuth v5) — Credentials, login 2 bước |
| UI | Tailwind CSS + custom components |
| Icons | lucide-react |

## Modules hiện có

| Module | List | Create | Schema | Ghi chú |
|--------|:----:|:------:|:------:|---------|
| Auth (2-step UID → Password) | ✅ | — | ✅ | Giống Laravel `/authen/login` |
| Role Hierarchy | ✅ | — | ✅ | Port từ `RoleHierarchy.php` |
| User + Role + Permission | ✅ | ✅ | ✅ | Full form + detail + hierarchy enforce |
| Lead | ✅ | ✅ | ✅ | Auto `lead_code` |
| CrmTeam | ✅ | — | ✅ | |
| SalesProject / SalesChannel | ✅ | — | ✅ | |
| SaleProfile | ✅ | — | ✅ | Approval fields sẵn |
| Application | ✅ | — | ✅ | Lotte / CBP ready |
| DataCenterLead | ✅ | — | ✅ | |
| JobVacancy / CandidateApplication | — | — | ✅ | Schema only |
| Dashboard | ✅ | — | — | Stats + recent leads |

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Mở http://localhost:3000

**Demo login**
- UID: `UID25080001`
- Password: `Admin@123456`

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:setup     # generate + push + seed
npm run db:seed      # Seed only
```

## Production (PostgreSQL)

1. Đổi trong `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/3rd_fintech_crm"
   ```
2. Đổi `provider = "postgresql"` trong `prisma/schema.prisma`
3. Chạy `npx prisma db push` (hoặc migrate)

## Cấu trúc thư mục

```
src/
  app/
    (auth)/login/              # Login 2 bước
    (dashboard)/
      dashboard/               # Tổng quan
      users/  users/new/       # User list + create
      leads/  leads/new/       # Lead list + create
      teams/
      sales-projects/
      sale-profiles/
      applications/
      data-center/
    api/auth/[...nextauth]/
  components/layout/  ui/
  lib/
    auth.ts                    # NextAuth config
    prisma.ts
    role-hierarchy.ts          # Port RoleHierarchy.php
    actions/leads.ts  users.ts
    utils.ts
  types/next-auth.d.ts
prisma/
  schema.prisma
  seed.ts
```

## Role Hierarchy (giống gốc)

```
Admin
└── Sales Admin
    └── ZD
        └── AM
            ├── Team Leader → Direct Sale / Telesale / CTV
            └── Courier Manager → Courier
```

## Còn thiếu so với Laravel production

Xem file **CODEX_HANDOFF.md** để tiếp tục phát triển với Codex / AI agent.
