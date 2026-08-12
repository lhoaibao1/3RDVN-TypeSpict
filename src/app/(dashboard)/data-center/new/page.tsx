import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createDataCenterLead } from "@/lib/actions/data-center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewDataCenterPage() {
  const users = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function action(formData: FormData) {
    "use server";
    const r = await createDataCenterLead(formData);
    redirect(`/data-center/${r.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm Data Center Lead</h1>
        <p className="text-sm text-gray-500 mt-1">Lead referral / data center</p>
      </div>
      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên KH *</label>
          <Input name="customerName" required placeholder="Nguyễn Văn A" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SĐT</label>
            <Input name="phone" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input name="email" type="email" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CMND/CCCD</label>
            <Input name="identityNumber" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nguồn</label>
            <Input name="source" placeholder="Referral / Hotline..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ</label>
          <Input name="address" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input name="provinceName" placeholder="Tỉnh/TP" />
          <Input name="districtName" placeholder="Quận/Huyện" />
          <Input name="wardName" placeholder="Phường/Xã" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phụ trách</label>
            <select name="assignedUserId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">--</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select name="status" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="Mới">Mới</option>
              <option value="Đã gọi">Đã gọi</option>
              <option value="Quan tâm">Quan tâm</option>
              <option value="Không quan tâm">Không quan tâm</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Call note</label>
          <textarea name="callNote" rows={3} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <Button type="submit">Tạo</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/data-center">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
