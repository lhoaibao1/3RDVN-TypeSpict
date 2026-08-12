import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";

const PAGE_SIZE = 20;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const requestedPage = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { applicationCode: { contains: q } },
            { applicantName: { contains: q } },
            { phone: { contains: q } },
            { identityNumber: { contains: q } },
          ],
        }
      : {}),
  };
  const total = await prisma.application.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const apps = await prisma.application.findMany({
    where,
    include: {
      assignedSale: { select: { name: true } },
      salesProject: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{total} đơn</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm mã / tên / SĐT..."
              className="h-10 rounded-md border border-gray-300 px-3 text-sm w-52"
            />
            <Button type="submit" variant="outline">Tìm</Button>
          </form>
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="h-4 w-4" />
              Tạo đơn
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
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
                  {q ? "Không tìm thấy đơn phù hợp" : "Chưa có đơn"}
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
      <Pagination basePath="/applications" page={page} totalPages={totalPages} query={{ q }} />
    </div>
  );
}
