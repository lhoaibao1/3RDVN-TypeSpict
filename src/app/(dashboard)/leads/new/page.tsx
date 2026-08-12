import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewLeadPage() {
  const projects = await prisma.salesProject.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sales = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function action(formData: FormData) {
    "use server";
    await createLead(formData);
    redirect("/leads");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm Lead mới</h1>
        <p className="text-sm text-gray-500 mt-1">Tạo lead khách hàng mới</p>
      </div>

      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
          <Input name="leadName" required placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <Input name="phone" placeholder="0901234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input name="email" type="email" placeholder="email@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
            <Input name="source" placeholder="Facebook / Zalo / Website..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select name="status" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="Mới">Mới</option>
              <option value="Đang liên hệ">Đang liên hệ</option>
              <option value="Quan tâm">Quan tâm</option>
              <option value="Không quan tâm">Không quan tâm</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dự án Sale</label>
            <select name="salesProjectId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">-- Chọn dự án --</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale phụ trách</label>
            <select name="assignedSaleId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">-- Chọn sale --</option>
              {sales.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea name="note" rows={3} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Ghi chú..." />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Tạo Lead</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/leads">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
