import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSaleProfile } from "@/lib/actions/sale-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewSaleProfilePage() {
  const sales = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });
  const teams = await prisma.crmTeam.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  async function action(formData: FormData) {
    "use server";
    const result = await createSaleProfile(formData);
    redirect(`/sale-profiles/${result.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo Sale Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Hồ sơ khách hàng đưa vào quy trình duyệt</p>
      </div>

      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
          <Input name="customerName" required placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
            <Input name="phone" placeholder="0901234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input name="email" type="email" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
            <Input name="identityNumber" placeholder="001234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm quan tâm</label>
            <Input name="productInterest" placeholder="Vay tiêu dùng / Thẻ tín dụng..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <Input name="address" placeholder="Địa chỉ khách hàng" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale owner</label>
            <select name="saleOwnerId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">-- Mặc định: bạn --</option>
              {sales.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select name="teamId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">--</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea name="note" rows={3} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <Button type="submit">Tạo hồ sơ</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/sale-profiles">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
