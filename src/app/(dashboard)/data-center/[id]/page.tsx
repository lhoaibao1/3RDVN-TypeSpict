import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateDataCenterLead, convertDcToLead } from "@/lib/actions/data-center";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function DataCenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dcId = Number(id);
  if (isNaN(dcId)) notFound();

  const dc = await prisma.dataCenterLead.findUnique({
    where: { id: dcId },
    include: {
      assignedUser: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      team: { select: { name: true } },
    },
  });
  if (!dc || dc.deletedAt) notFound();

  const users = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function saveAction(formData: FormData) {
    "use server";
    await updateDataCenterLead(dcId, formData);
    redirect(`/data-center/${dcId}`);
  }

  async function convertAction() {
    "use server";
    const r = await convertDcToLead(dcId);
    redirect(`/leads/${r.id}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dc.customerName}</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">{dc.referralCode}</p>
        </div>
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {dc.status}
        </span>
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên KH *</label>
          <Input name="customerName" required defaultValue={dc.customerName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input name="phone" defaultValue={dc.phone || ""} placeholder="SĐT" />
          <Input name="email" defaultValue={dc.email || ""} placeholder="Email" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input name="identityNumber" defaultValue={dc.identityNumber || ""} placeholder="CMND/CCCD" />
          <Input name="source" defaultValue={dc.source || ""} placeholder="Nguồn" />
        </div>
        <Input name="address" defaultValue={dc.address || ""} placeholder="Địa chỉ" />
        <div className="grid grid-cols-3 gap-4">
          <Input name="provinceName" defaultValue={dc.provinceName || ""} placeholder="Tỉnh/TP" />
          <Input name="districtName" defaultValue={dc.districtName || ""} placeholder="Quận/Huyện" />
          <Input name="wardName" defaultValue={dc.wardName || ""} placeholder="Phường/Xã" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phụ trách</label>
            <select name="assignedUserId" defaultValue={dc.assignedUserId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">--</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select name="status" defaultValue={dc.status} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="Mới">Mới</option>
              <option value="Đã gọi">Đã gọi</option>
              <option value="Quan tâm">Quan tâm</option>
              <option value="Không quan tâm">Không quan tâm</option>
              <option value="Đã chuyển Lead">Đã chuyển Lead</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Call note</label>
          <textarea name="callNote" rows={3} defaultValue={dc.callNote || ""} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="markContacted" value="1" className="rounded" />
          Đánh dấu đã liên hệ (set contacted_at)
        </label>
        <div className="text-xs text-gray-400">
          Tạo: {formatDate(dc.createdAt)}
          {dc.contactedAt && ` · Liên hệ: ${formatDate(dc.contactedAt)}`}
        </div>
        <div className="flex gap-3">
          <Button type="submit">Lưu</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/data-center">Quay lại</Link>
          </Button>
        </div>
      </form>

      {dc.status !== "Đã chuyển Lead" && (
        <form action={convertAction} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 mb-3">Chuyển Data Center Lead thành Lead CRM.</p>
          <Button type="submit">Convert → Lead</Button>
        </form>
      )}
    </div>
  );
}
