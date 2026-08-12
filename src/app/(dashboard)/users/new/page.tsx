import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/actions/users";
import { ROLE_ORDER } from "@/lib/role-hierarchy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewUserPage() {
  const teams = await prisma.crmTeam.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const managers = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function action(formData: FormData) {
    "use server";
    await createUser(formData);
    redirect("/users");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng</h1>
        <p className="text-sm text-gray-500 mt-1">Tạo tài khoản nhân sự / sale — đầy đủ hồ sơ</p>
      </div>

      <form action={action} className="bg-white rounded-xl border p-6 space-y-6">
        {/* Basic */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <Input name="name" required placeholder="Nguyễn Văn B" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input name="email" type="email" required placeholder="user@3rd.local" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <Input name="phone" placeholder="0901234567" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>
        </section>

        {/* Identity */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Giấy tờ tùy thân</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại giấy tờ</label>
              <select name="documentType" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn --</option>
                <option value="CCCD">CCCD</option>
                <option value="CMND">CMND</option>
                <option value="Passport">Hộ chiếu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số giấy tờ</label>
              <Input name="identityNumber" placeholder="001234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select name="gender" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </section>

        {/* Work */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Công việc</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select name="role" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn vai trò --</option>
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <Input name="department" placeholder="Sale / IT / HR..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
              <Input name="position" placeholder="Nhân viên Sale..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Văn phòng</label>
              <Input name="office" placeholder="Hà Nội / HCM..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng</label>
            <select name="contractType" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="">-- Chọn --</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="ctv">CTV</option>
              <option value="probation">Thử việc</option>
            </select>
          </div>
        </section>

        {/* Hierarchy */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Cấp quản lý</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select name="teamId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn team --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
              <select name="teamLeaderId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.uid})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AM</label>
              <select name="amId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.uid})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZD</label>
              <select name="zdId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                <option value="">-- Chọn --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.uid})</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Địa chỉ</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <Input name="addressLine" placeholder="Số nhà, đường..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/TP</label>
              <Input name="provinceName" placeholder="Hà Nội" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <Input name="districtName" placeholder="Cầu Giấy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <Input name="wardName" placeholder="Dịch Vọng" />
            </div>
          </div>
        </section>

        {/* Bank */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Ngân hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
              <Input name="bankName" placeholder="Vietcombank / Techcombank..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
              <Input name="bankBranch" placeholder="CN Hà Nội" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <Input name="bankAccountNumber" placeholder="0123456789" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ TK</label>
              <Input name="bankAccountName" placeholder="NGUYEN VAN B" />
            </div>
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Tạo người dùng</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/users">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
