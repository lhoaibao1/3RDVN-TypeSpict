# CODEX HANDOFF — 3RD Fintech CRM (TypeScript)

## Status: Phase 1–9 skeleton COMPLETE

Port từ Laravel: https://github.com/lhoaibao1/3rdvn-crm

Stack: Next.js 15 · TypeScript · Prisma · Auth.js · Tailwind

Login: `UID25080001` / `Admin@123456`

---

## Đã hoàn thành

| Phase | Nội dung |
|-------|----------|
| 1–2 | Auth 2-step, Role hierarchy, Schema, Dashboard, Lists |
| 3 | User full form + detail, Lead create/edit, hierarchy auto-fill |
| 4 | SaleProfile create/detail, approve/reject workflow |
| 5 | Application create/detail, code auto, link từ Lead |
| 6 | DataCenter create/detail, referral_code, convert→Lead, search |
| 7 | Teams CRUD, SalesProjects CRUD + channels |
| 8 | `src/lib/permissions.ts` — role→action matrix + assertCan |
| 9 | Settings page, search Data Center, polish structure |

---

## File quan trọng

```
src/lib/role-hierarchy.ts
src/lib/permissions.ts
src/lib/auth.ts
src/lib/actions/*   (users, leads, sale-profiles, applications, data-center, teams, projects)
prisma/schema.prisma
```

---

## Còn có thể nâng cấp (optional)

1. Gắn `assertCan()` vào mọi server action
2. Pagination thật (skip/take + page UI)
3. Search trên Users / Leads / Applications
4. RecordChangeLog / UserChangeLog model + UI
5. Payload JSON dynamic theo SalesProject.formSchema
6. PostgreSQL + migrate production
7. Unit tests

## Prompt tiếp (nếu cần)

```
Đọc CODEX_HANDOFF.md. Phase 1–9 đã xong skeleton.

Ưu tiên:
1. Gắn assertCan() vào tất cả server actions theo permissions.ts
2. Thêm search + pagination cho Users và Leads
3. Đảm bảo npm run build pass

Không simplified business rule.
```
