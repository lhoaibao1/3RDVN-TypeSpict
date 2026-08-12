# CODEX HANDOFF — 3RD Fintech CRM (TypeScript)

## Bối cảnh

Đây là bản port **TypeScript + Next.js 15** từ Laravel + Filament CRM gốc:
https://github.com/lhoaibao1/3rdvn-crm

Bản này đã có skeleton + core modules (Auth, User, Lead, Team, SalesProject, SaleProfile, Application, DataCenter).

**Nhiệm vụ của bạn:** Hoàn thiện đến feature parity với Laravel production, **không được simplified / cắt business rule**.

---

## Stack hiện tại (không đổi)

- Next.js 15 App Router + TypeScript
- Prisma (SQLite dev → PostgreSQL prod)
- Auth.js (NextAuth v5) Credentials
- Tailwind + custom UI (button, input)
- Role hierarchy port từ `App\Support\RoleHierarchy.php`

Login demo: `UID25080001` / `Admin@123456`

---

## Đã có (Phase 1–2)

### Schema Prisma
- User (đầy đủ field: HR, hierarchy, bank, address, mail…)
- Role / Permission / UserRole / RolePermission
- CrmTeam
- Lead (+ lead_code)
- SalesProject / SalesChannel
- SaleProfile (approval + processing fields)
- Application
- DataCenterLead
- JobVacancy / CandidateApplication

### UI + Logic
- Login 2 bước (UID → Password)
- Dashboard (stats + recent leads)
- Users: list + create (basic)
- Leads: list + create (basic)
- Teams / SalesProjects / SaleProfiles / Applications / DataCenter: list
- Role hierarchy utility (`src/lib/role-hierarchy.ts`)
- Server actions: createUser, createLead

---

## CÒN THIẾU — Làm theo thứ tự này

### Phase 3 — User & Lead hoàn chỉnh
1. **User Create/Edit form đầy đủ field**
   - Identity: document_type, date_of_birth, gender, identity_number, issued date/place
   - Work: department, position, hire_date, office, contract_type, employment_status
   - Hierarchy: team_id, team_leader_id, am_id, zd_id, courier_manager_id
   - Address: province/district/ward + address_line
   - Bank: bank_code, bank_name, account_number, account_name, branch
   - Assign role theo hierarchy (chỉ cho phép role mà actor được assign)
2. **User detail page** + soft delete / deactive
3. **Lead detail page** + update status + assign sale
4. **Lead auto-fill hierarchy** khi assign sale (team_leader_id, am_id, zd_id từ user được assign)
5. Permission check trên action (user.create, lead.update…)

### Phase 4 — SaleProfile workflow
1. Create SaleProfile từ Lead (convert)
2. Approval flow: pending → approved / rejected
3. Processing status + completed_at
4. Policy: chỉ role được phép approve mới approve được

### Phase 5 — Application
1. Create Application (gắn SalesProject + Lead)
2. application_code auto generate
3. List filter theo project / status / sale
4. Payload JSON theo form schema của SalesProject

### Phase 6 — Data Center
1. Create / import DataCenterLead
2. referral_code auto
3. Assign + call note + contacted_at
4. Convert sang Lead / SaleProfile nếu cần

### Phase 7 — Teams & Projects CRUD
1. CRUD CrmTeam + gán manager
2. CRUD SalesProject + SalesChannel
3. form_schema cho project (JSON)

### Phase 8 — Permission & Audit
1. Middleware / server-side check permission theo role
2. UserChangeLog / RecordChangeLog UI
3. Không cho user sửa vượt hierarchy

### Phase 9 — Polish
1. Search / filter / pagination trên mọi list
2. Responsive mobile
3. Settings page (UiSetting)
4. Đổi Prisma sang PostgreSQL khi deploy
5. Seed data phong phú hơn

---

## Quy tắc bắt buộc khi code

1. **Không simplified** — giữ nguyên field và business rule gốc Laravel
2. **Giữ tiếng Việt** cho status, label UI (Mới, Đang liên hệ, Khách hàng thoả mãn điều kiện…)
3. **Giữ format code**: UID = `UID`+ym+#### , employee_code = `RD`+y+#### , lead_code = `LD`+ymd+####
4. **Role hierarchy** phải được enforce khi create/assign user
5. Mỗi phase xong phải:
   - Chạy được (`npm run build` không lỗi type)
   - Báo cáo rõ đã thêm gì
6. Tham chiếu code gốc Laravel khi cần:
   - `app/Models/*`
   - `app/Support/RoleHierarchy.php`
   - `app/Filament/Resources/*`
   - `database/migrations/*`

---

## File quan trọng cần đọc trước khi code

```
src/lib/role-hierarchy.ts      # Hierarchy logic
src/lib/auth.ts                # NextAuth
prisma/schema.prisma           # Toàn bộ model
src/lib/actions/users.ts       # Create user
src/lib/actions/leads.ts       # Create lead
CODEX_HANDOFF.md               # File này
```

Laravel gốc (tham chiếu):
```
app/Models/User.php
app/Models/Lead.php
app/Models/SaleProfile.php
app/Models/Application.php
app/Support/RoleHierarchy.php
app/Filament/Resources/*
```

---

## Lệnh kiểm tra trước khi commit

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run build          # Phải pass
npm run dev            # Login được bằng UID25080001 / Admin@123456
```

---

## Cách bắt đầu (prompt gợi ý cho Codex)

```
Đọc CODEX_HANDOFF.md và README.md trong repo này.

Bắt đầu Phase 3:
1. Hoàn thiện form Create/Edit User với đầy đủ field theo Prisma schema
2. Enforce role hierarchy khi gán role (dùng src/lib/role-hierarchy.ts)
3. Tạo User detail page
4. Không được bỏ field nào trong schema User

Làm xong Phase 3 thì báo cáo, chờ duyệt rồi mới sang Phase 4.
```
