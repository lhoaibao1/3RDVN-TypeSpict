import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateApplication } from "@/lib/actions/applications";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appId = Number(id);
  if (isNaN(appId)) notFound();

  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: {
      assignedSale: { select: { id: true, name: true, uid: true } },
      createdBy: { select: { name: true } },
      salesProject: { select: { id: true, name: true, code: true } },
      lead: { select: { id: true, leadCode: true, leadName: true } },
      team: { select: { name: true } },
    },
  });
  if (!app || app.deletedAt) notFound();

  const projects = await prisma.salesProject.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  const sales = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function saveAction(formData: FormData) {
    "use server";
    await updateApplication(appId, formData);
    redirect(`/applications/${appId}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.applicantName}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{app.applicationCode}</p>
        </div>
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {app.status}
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Dự án:</span>{" "}
          <span className="font-medium">{app.salesProject?.name || "—"}</span>
        </div>
        <div>
          <span className="text-gray-500">Sale:</span>{" "}
          <span className="font-medium">{app.assignedSale?.name || "—"}</span>
        </div>
        <div>
          <span className="text-gray-500">Team:</span>{" "}
          <span className="font-medium">{app.team?.name || "—"}</span>
        </div>
        {app.lead && (
          <div className="col-span-full">
            <span className="text-gray-500">Từ Lead:</span>{" "}
            <Link href={`/leads/${app.lead.id}`} className="text-blue-600 hover:underline font-mono text-xs">
              {app.lead.leadCode} — {app.lead.leadName}
            </Link>
          </div>
        )}
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nộp *</label>
          <Input name="applicantName" required defaultValue={app.applicantName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
            <Input name="phone" defaultValue={app.phone || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
            <Input name="identityNumber" defaultValue={app.identityNumber || ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
            <select
              name="salesProjectId"
              defaultValue={app.salesProjectId || ""}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="">--</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              name="status"
              defaultValue={app.status}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="Mới">Mới</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Chờ bổ sung">Chờ bổ sung</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale phụ trách</label>
          <select
            name="assignedSaleId"
            defaultValue={app.assignedSaleId || ""}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="">--</option>
            {sales.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea
            name="note"
            rows={3}
            defaultValue={app.note || ""}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="text-xs text-gray-400">
          Tạo bởi {app.createdBy?.name || "—"} · {formatDate(app.createdAt)}
        </div>
        <div className="flex gap-3">
          <Button type="submit">Lưu</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/applications">Quay lại</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
