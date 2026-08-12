import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateLead, convertLeadToSaleProfile } from "@/lib/actions/leads";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leadId = Number(id);
  if (isNaN(leadId)) notFound();

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      assignedSale: { select: { id: true, name: true, uid: true } },
      createdBy: { select: { name: true } },
      salesProject: { select: { id: true, name: true } },
      team: { select: { name: true } },
      teamLeader: { select: { name: true } },
      am: { select: { name: true } },
      zd: { select: { name: true } },
    },
  });
  if (!lead || lead.deletedAt) notFound();

  const projects = await prisma.salesProject.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sales = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function saveAction(formData: FormData) {
    "use server";
    await updateLead(leadId, formData);
    redirect(`/leads/${leadId}`);
  }

  async function convertAction() {
    "use server";
    const result = await convertLeadToSaleProfile(leadId);
    redirect(`/sale-profiles/${result.id}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.leadName}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{lead.leadCode}</p>
        </div>
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {lead.status}
        </span>
      </div>

      {/* Hierarchy info */}
      <div className="bg-slate-50 rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div><span className="text-gray-500">Sale:</span> <span className="font-medium">{lead.assignedSale?.name || "—"}</span></div>
        <div><span className="text-gray-500">Team:</span> <span className="font-medium">{lead.team?.name || "—"}</span></div>
        <div><span className="text-gray-500">TL:</span> <span className="font-medium">{lead.teamLeader?.name || "—"}</span></div>
        <div><span className="text-gray-500">AM / ZD:</span> <span className="font-medium">{lead.am?.name || "—"} / {lead.zd?.name || "—"}</span></div>
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên KH *</label>
          <Input name="leadName" required defaultValue={lead.leadName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
            <Input name="phone" defaultValue={lead.phone || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input name="email" type="email" defaultValue={lead.email || ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
            <Input name="source" defaultValue={lead.source || ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select name="status" defaultValue={lead.status} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="Mới">Mới</option>
              <option value="Đang liên hệ">Đang liên hệ</option>
              <option value="Quan tâm">Quan tâm</option>
              <option value="Không quan tâm">Không quan tâm</option>
              <option value="Khách hàng thoả mãn điều kiện">Khách hàng thoả mãn điều kiện</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dự án</label>
            <select name="salesProjectId" defaultValue={lead.salesProjectId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">--</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale phụ trách</label>
            <select name="assignedSaleId" defaultValue={lead.assignedSaleId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">--</option>
              {sales.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea name="note" rows={3} defaultValue={lead.note || ""} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="text-xs text-gray-400">
          Tạo bởi {lead.createdBy?.name || "—"} · {formatDate(lead.createdAt)}
          {lead.convertedAt && ` · Đã convert ${formatDate(lead.convertedAt)}`}
        </div>
        <div className="flex gap-3">
          <Button type="submit">Lưu</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/leads">Quay lại</Link>
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        {!lead.convertedSaleProfileId && (
          <form action={convertAction} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-1 min-w-[240px]">
            <p className="text-sm text-amber-800 mb-3">Convert lead thành Sale Profile để đưa vào quy trình duyệt.</p>
            <Button type="submit" variant="default">Convert → Sale Profile</Button>
          </form>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-1 min-w-[240px]">
          <p className="text-sm text-blue-800 mb-3">Tạo Application (đơn sản phẩm) từ lead này.</p>
          <Button asChild>
            <Link href={`/applications/new?leadId=${lead.id}`}>Tạo Application</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
