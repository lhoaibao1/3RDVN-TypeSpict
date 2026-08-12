import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const leads = await prisma.lead.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { leadName: { contains: q } },
              { phone: { contains: q } },
              { leadCode: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      assignedSale: { select: { name: true, uid: true } },
      createdBy: { select: { name: true } },
      salesProject: { select: { name: true } },
      team: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Tìm tên / SĐT / mã..." className="h-10 rounded-md border border-gray-300 px-3 text-sm w-48" />
            <Button type="submit" variant="outline">Tìm</Button>
          </form>
          <Button asChild>
            <Link href="/leads/new">
              <Plus className="h-4 w-4" />
              Thêm Lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Mã Lead</th>
                <th className="px-4 py-3 font-medium">Tên KH</th>
                <th className="px-4 py-3 font-medium">SĐT</th>
                <th className="px-4 py-3 font-medium">Nguồn</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Sale</th>
                <th className="px-4 py-3 font-medium">Dự án</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Chưa có lead nào
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline">
                        {lead.leadCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{lead.leadName}</td>
                    <td className="px-4 py-3">{lead.phone || "—"}</td>
                    <td className="px-4 py-3">{lead.source || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{lead.assignedSale?.name || "—"}</td>
                    <td className="px-4 py-3">{lead.salesProject?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
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
