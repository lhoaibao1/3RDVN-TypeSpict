import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateUser, deactivateUser } from "@/lib/actions/users";
import { ROLE_ORDER } from "@/lib/role-hierarchy";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      team: true,
      teamLeader: { select: { id: true, name: true, uid: true } },
      am: { select: { id: true, name: true, uid: true } },
      zd: { select: { id: true, name: true, uid: true } },
    },
  });
  if (!user) notFound();

  const teams = await prisma.crmTeam.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const managers = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  const currentRole = user.roles[0]?.role.name || "";

  async function saveAction(formData: FormData) {
    "use server";
    await updateUser(userId, formData);
    redirect(`/users/${userId}`);
  }

  async function deactivateAction() {
    "use server";
    await deactivateUser(userId);
    redirect("/users");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{user.uid} · {user.employeeCode}</p>
        </div>
        <div className="flex gap-2">
          {user.roles.map((r) => (
            <span key={r.roleId} className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {r.role.name}
            </span>
          ))}
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            user.employmentStatus === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}>
            {user.employmentStatus}
          </span>
        </div>
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <Input name="name" required defaultValue={user.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input name="email" type="email" required defaultValue={user.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
              <Input name="phone" defaultValue={user.phone || ""} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
            <Input name="password" type="password" placeholder="••••••••" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Giấy tờ</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại GT</label>
              <select name="documentType" defaultValue={user.documentType || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                <option value="CCCD">CCCD</option>
                <option value="CMND">CMND</option>
                <option value="Passport">Hộ chiếu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số GT</label>
              <Input name="identityNumber" defaultValue={user.identityNumber || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select name="gender" defaultValue={user.gender || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Công việc</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select name="role" defaultValue={currentRole} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                {ROLE_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select name="employmentStatus" defaultValue={user.employmentStatus} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="active">active</option>
                <option value="deactive">deactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <Input name="department" defaultValue={user.department || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
              <Input name="position" defaultValue={user.position || ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Văn phòng</label>
              <Input name="office" defaultValue={user.office || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hợp đồng</label>
              <select name="contractType" defaultValue={user.contractType || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="ctv">CTV</option>
                <option value="probation">Thử việc</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Cấp quản lý</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select name="teamId" defaultValue={user.teamId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
              <select name="teamLeaderId" defaultValue={user.teamLeaderId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AM</label>
              <select name="amId" defaultValue={user.amId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZD</label>
              <select name="zdId" defaultValue={user.zdId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">--</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Địa chỉ & Ngân hàng</h2>
          <Input name="addressLine" defaultValue={user.addressLine || ""} placeholder="Địa chỉ" />
          <div className="grid grid-cols-3 gap-4">
            <Input name="provinceName" defaultValue={user.provinceName || ""} placeholder="Tỉnh/TP" />
            <Input name="districtName" defaultValue={user.districtName || ""} placeholder="Quận/Huyện" />
            <Input name="wardName" defaultValue={user.wardName || ""} placeholder="Phường/Xã" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="bankName" defaultValue={user.bankName || ""} placeholder="Ngân hàng" />
            <Input name="bankBranch" defaultValue={user.bankBranch || ""} placeholder="Chi nhánh" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="bankAccountNumber" defaultValue={user.bankAccountNumber || ""} placeholder="Số TK" />
            <Input name="bankAccountName" defaultValue={user.bankAccountName || ""} placeholder="Tên chủ TK" />
          </div>
        </section>

        <div className="text-xs text-gray-400">Tạo lúc: {formatDate(user.createdAt)}</div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Lưu thay đổi</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/users">Quay lại</Link>
          </Button>
        </div>
      </form>

      {user.employmentStatus === "active" && (
        <form action={deactivateAction}>
          <Button type="submit" variant="destructive">Vô hiệu hoá tài khoản</Button>
        </form>
      )}
    </div>
  );
}
