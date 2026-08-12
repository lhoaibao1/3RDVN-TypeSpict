import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DataCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const leads = await prisma.dataCenterLead.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { customerName: { contains: q } },
              { phone: { contains: q } },
              { referralCode: { contains: q } },
            ],
          }
        : {}),
    },
    include: { assignedUser: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Data Center Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} records</p>
        </div>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm tên / SĐT / mã..."
              className="h-10 rounded-md border border-gray-300 px-3 text-sm w-48"
            />
            <Button type="submit" variant="outline">Tìm</Button>
          </form>
          <Button asChild>
            <Link href="/data-center/new"><Plus className="h-4 w-4" /> Thêm</Link>
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Nguồn</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Phụ trách</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Chưa có data</td></tr>
            ) : leads.map((l) => (
              <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/data-center/${l.id}`} className="text-blue-600 hover:underline">
                    {l.referralCode || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium">{l.customerName}</td>
                <td className="px-4 py-3">{l.phone || "—"}</td>
                <td className="px-4 py-3">{l.source || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{l.status}</span>
                </td>
                <td className="px-4 py-3">{l.assignedUser?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
