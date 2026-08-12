import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function TeamsPage() {
  const teams = await prisma.crmTeam.findMany({
    include: {
      manager: { select: { name: true, uid: true } },
      _count: { select: { members: true, leads: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">{teams.length} teams</p>
        </div>
        <Button asChild>
          <Link href="/teams/new"><Plus className="h-4 w-4" /> Tạo team</Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="px-4 py-3 font-medium">Tên team</th>
              <th className="px-4 py-3 font-medium">Manager</th>
              <th className="px-4 py-3 font-medium">Thành viên</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Chưa có team</td></tr>
            ) : teams.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{t.code || "—"}</td>
                <td className="px-4 py-3">
                  <Link href={`/teams/${t.id}`} className="font-medium text-blue-600 hover:underline">{t.name}</Link>
                </td>
                <td className="px-4 py-3">{t.manager?.name || "—"}</td>
                <td className="px-4 py-3">{t._count.members}</td>
                <td className="px-4 py-3">{t._count.leads}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
