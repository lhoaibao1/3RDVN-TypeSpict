import { auth } from "@/lib/auth";
import { ROLE_ORDER } from "@/lib/role-hierarchy";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-gray-500 mt-1">Thông tin hệ thống & tài khoản</p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold border-b pb-2">Tài khoản đang đăng nhập</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-gray-500">Tên</dt>
          <dd className="font-medium">{session?.user?.name}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd>{session?.user?.email}</dd>
          <dt className="text-gray-500">UID</dt>
          <dd className="font-mono text-xs">{(session?.user as any)?.uid || "—"}</dd>
          <dt className="text-gray-500">Roles</dt>
          <dd className="flex flex-wrap gap-1">
            {((session?.user as any)?.roles || []).map((r: string) => (
              <span key={r} className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{r}</span>
            ))}
          </dd>
        </dl>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold border-b pb-2">Role Hierarchy</h2>
        <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
          {ROLE_ORDER.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-2 text-sm text-gray-600">
        <h2 className="font-semibold text-gray-900 border-b pb-2 mb-3">Hệ thống</h2>
        <p><strong>App:</strong> 3RD Fintech CRM — TypeScript</p>
        <p><strong>Stack:</strong> Next.js 15 · Prisma · Auth.js · Tailwind</p>
        <p><strong>DB:</strong> SQLite (dev) — đổi PostgreSQL khi production</p>
      </div>
    </div>
  );
}
