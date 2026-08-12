import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateTeam } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamId = Number(id);
  if (isNaN(teamId)) notFound();

  const team = await prisma.crmTeam.findUnique({
    where: { id: teamId },
    include: {
      manager: { select: { id: true, name: true } },
      members: { select: { id: true, name: true, uid: true, employmentStatus: true }, take: 50 },
      _count: { select: { members: true, leads: true } },
    },
  });
  if (!team) notFound();

  const users = await prisma.user.findMany({
    where: { employmentStatus: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  async function saveAction(formData: FormData) {
    "use server";
    await updateTeam(teamId, formData);
    redirect(`/teams/${teamId}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-sm text-gray-500 font-mono">{team.code} · {team._count.members} members · {team._count.leads} leads</p>
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-4">
        <Input name="name" required defaultValue={team.name} />
        <Input name="code" defaultValue={team.code || ""} placeholder="Mã" />
        <div>
          <label className="block text-sm font-medium mb-1">Manager</label>
          <select name="managerId" defaultValue={team.managerId || ""} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
            <option value="">--</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <textarea name="description" rows={2} defaultValue={team.description || ""} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <div>
          <label className="block text-sm font-medium mb-1">Active</label>
          <select name="isActive" defaultValue={team.isActive ? "1" : "0"} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Button type="submit">Lưu</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/teams">Quay lại</Link>
          </Button>
        </div>
      </form>

      {team.members.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Thành viên</h2>
          <ul className="space-y-1 text-sm">
            {team.members.map((m) => (
              <li key={m.id}>
                <Link href={`/users/${m.id}`} className="text-blue-600 hover:underline">
                  {m.name}
                </Link>
                <span className="text-gray-400 ml-2 font-mono text-xs">{m.uid}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
