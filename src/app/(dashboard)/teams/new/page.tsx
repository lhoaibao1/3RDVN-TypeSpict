import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createTeam } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function NewTeamPage() {
  const users = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true, uid: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function action(formData: FormData) {
    "use server";
    const r = await createTeam(formData);
    redirect(`/teams/${r.id}`);
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Tạo Team</h1>
      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên team *</label>
          <Input name="name" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mã</label>
          <Input name="code" placeholder="TEAM-02" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Manager</label>
          <select name="managerId" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
            <option value="">--</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea name="description" rows={2} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <Button type="submit">Tạo</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/teams">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
