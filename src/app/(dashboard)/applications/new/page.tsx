import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createApplication } from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const sp = await searchParams;
  const prefillLeadId = sp.leadId ? Number(sp.leadId) : null;

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
  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    select: { id: true, leadCode: true, leadName: true, phone: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let prefillName = "";
  let prefillPhone = "";
  let prefillProjectId = "";
  if (prefillLeadId) {
    const lead = await prisma.lead.findUnique({ where: { id: prefillLeadId } });
    if (lead) {
      prefillName = lead.leadName;
      prefillPhone = lead.phone || "";
      prefillProjectId = lead.salesProjectId ? String(lead.salesProjectId) : "";
    }
  }

  async function action(formData: FormData) {
    "use server";
    const result = await createApplication(formData);
    redirect(`/applications/${result.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo Application</h1>
        <p className="text-sm text-gray-500 mt-1">Đơn đăng ký sản phẩm tài chính</p>
      </div>

      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nộp *</label>
          <Input name="applicantName" required defaultValue={prefillName} placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
            <Input name="phone" defaultValue={prefillPhone} placeholder="0901234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
            <Input name="identityNumber" placeholder="001234567890" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dự án *</label>
            <select
              name="salesProjectId"
              defaultValue={prefillProjectId}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="">-- Chọn dự án --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select name="status" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="Mới">Mới</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Chờ bổ sung">Chờ bổ sung</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ Lead</label>
            <select
              name="leadId"
              defaultValue={prefillLeadId || ""}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="">-- Không gắn lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.leadCode} — {l.leadName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale phụ trách</label>
            <select name="assignedSaleId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">-- Mặc định: bạn --</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea
            name="note"
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            placeholder="Ghi chú đơn..."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Tạo đơn</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/applications">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
