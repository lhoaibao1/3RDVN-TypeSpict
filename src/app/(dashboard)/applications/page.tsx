import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ApplicationsPage() {
  const apps = await prisma.application.findMany({
    where: { deletedAt: null },
    include: {
      assignedSale: { select: { name: true } },
      salesProject: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{apps.length} đơn</p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="h-4 w-4" />
            Tạo đơn
          </Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Người nộp</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Dự án</th>
              <th className="px-4 py-3 font-medium">Sale</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  Chưa có đơn
                </td>
              </tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/applications/${a.id}`} className="text-blue-600 hover:underline">
                      {a.applicationCode || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{a.applicantName}</td>
                  <td className="px-4 py-3">{a.phone || "—"}</td>
                  <td className="px-4 py-3">{a.salesProject?.name || "—"}</td>
                  <td className="px-4 py-3">{a.assignedSale?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
