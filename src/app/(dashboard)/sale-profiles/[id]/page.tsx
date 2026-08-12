import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { approveSaleProfile, rejectSaleProfile, updateSaleProfileStatus } from "@/lib/actions/sale-profiles";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SaleProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = Number(id);
  if (isNaN(profileId)) notFound();

  const profile = await prisma.saleProfile.findUnique({
    where: { id: profileId },
    include: {
      saleOwner: { select: { name: true, uid: true } },
      approvedBy: { select: { name: true } },
      team: { select: { name: true } },
      sourceLead: { select: { id: true, leadCode: true, leadName: true } },
    },
  });
  if (!profile || profile.deletedAt) notFound();

  async function approveAction() {
    "use server";
    await approveSaleProfile(profileId);
    redirect(`/sale-profiles/${profileId}`);
  }

  async function rejectAction(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    await rejectSaleProfile(profileId, reason);
    redirect(`/sale-profiles/${profileId}`);
  }

  async function statusAction(formData: FormData) {
    "use server";
    const status = String(formData.get("status") || "");
    const processingStatus = String(formData.get("processingStatus") || "") || undefined;
    await updateSaleProfileStatus(profileId, status, processingStatus);
    redirect(`/sale-profiles/${profileId}`);
  }

  const approvalColor =
    profile.approvalStatus === "approved" ? "bg-emerald-50 text-emerald-700" :
    profile.approvalStatus === "rejected" ? "bg-red-50 text-red-700" :
    "bg-amber-50 text-amber-700";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.customerName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sale: {profile.saleOwner?.name || "—"} · Team: {profile.team?.name || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${approvalColor}`}>
            {profile.approvalStatus || "pending"}
          </span>
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {profile.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-gray-500">SĐT:</span> {profile.phone || "—"}</div>
          <div><span className="text-gray-500">Email:</span> {profile.email || "—"}</div>
          <div><span className="text-gray-500">CMND/CCCD:</span> {profile.identityNumber || "—"}</div>
          <div><span className="text-gray-500">Sản phẩm:</span> {profile.productInterest || "—"}</div>
          <div className="col-span-2"><span className="text-gray-500">Địa chỉ:</span> {profile.address || "—"}</div>
          <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span> {profile.note || "—"}</div>
        </div>
        {profile.sourceLead && (
          <div className="pt-2 border-t">
            <span className="text-gray-500">Từ Lead: </span>
            <Link href={`/leads/${profile.sourceLead.id}`} className="text-blue-600 hover:underline font-mono text-xs">
              {profile.sourceLead.leadCode} — {profile.sourceLead.leadName}
            </Link>
          </div>
        )}
        {profile.approvedAt && (
          <div className="pt-2 border-t text-xs text-gray-400">
            Duyệt bởi {profile.approvedBy?.name || "—"} · {formatDate(profile.approvedAt)}
            {profile.rejectionReason && <span className="text-red-600"> · Lý do: {profile.rejectionReason}</span>}
          </div>
        )}
        <div className="text-xs text-gray-400">Tạo: {formatDate(profile.createdAt)}</div>
      </div>

      {/* Approval actions */}
      {profile.approvalStatus === "pending" && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Duyệt hồ sơ</h2>
          <div className="flex gap-3">
            <form action={approveAction}>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Duyệt</Button>
            </form>
            <form action={rejectAction} className="flex gap-2 flex-1">
              <Input name="reason" placeholder="Lý do từ chối..." className="flex-1" />
              <Button type="submit" variant="destructive">Từ chối</Button>
            </form>
          </div>
        </div>
      )}

      {/* Status update after approved */}
      {profile.approvalStatus === "approved" && (
        <form action={statusAction} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Cập nhật tiến độ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select name="status" defaultValue={profile.status} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Huỷ">Huỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processing</label>
              <Input name="processingStatus" defaultValue={profile.processingStatus || ""} placeholder="Đang thẩm định..." />
            </div>
          </div>
          <Button type="submit">Cập nhật</Button>
        </form>
      )}

      <Button variant="outline" asChild>
        <Link href="/sale-profiles">← Quay lại danh sách</Link>
      </Button>
    </div>
  );
}
