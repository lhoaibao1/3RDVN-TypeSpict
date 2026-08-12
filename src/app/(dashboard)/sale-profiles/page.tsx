import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function SaleProfilesPage() {
  const profiles = await prisma.saleProfile.findMany({
    where: { deletedAt: null },
    include: {
      saleOwner: { select: { name: true } },
      team: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles.length} hồ sơ</p>
        </div>
        <Button asChild>
          <Link href="/sale-profiles/new">
            <Plus className="h-4 w-4" />
            Tạo hồ sơ
          </Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">Sale</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Duyệt</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Chưa có hồ sơ</td></tr>
            ) : profiles.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/sale-profiles/${p.id}`} className="font-medium text-blue-600 hover:underline">
                    {p.customerName}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.phone || "—"}</td>
                <td className="px-4 py-3">{p.productInterest || "—"}</td>
                <td className="px-4 py-3">{p.saleOwner?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700" :
                    p.approvalStatus === "rejected" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>{p.approvalStatus || "pending"}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
