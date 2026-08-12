import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, UserPlus, Briefcase, FolderKanban } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [userCount, leadCount, teamCount, projectCount] = await Promise.all([
    prisma.user.count({ where: { employmentStatus: "active" } }),
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.crmTeam.count({ where: { isActive: true } }),
    prisma.salesProject.count({ where: { isActive: true } }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { assignedSale: { select: { name: true } } },
  });

  const cards = [
    { label: "Người dùng", value: userCount, icon: Users, color: "bg-blue-500" },
    { label: "Leads", value: leadCount, icon: UserPlus, color: "bg-emerald-500" },
    { label: "Teams", value: teamCount, icon: FolderKanban, color: "bg-violet-500" },
    { label: "Dự án Sale", value: projectCount, icon: Briefcase, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tổng quan hệ thống 3RD Fintech CRM
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-xl border p-5 flex items-center gap-4"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Leads gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Mã Lead</th>
                <th className="px-5 py-3 font-medium">Tên</th>
                <th className="px-5 py-3 font-medium">SĐT</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Sale phụ trách</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    Chưa có lead nào
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">{lead.leadCode}</td>
                    <td className="px-5 py-3 font-medium">{lead.leadName}</td>
                    <td className="px-5 py-3">{lead.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">{lead.assignedSale?.name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
