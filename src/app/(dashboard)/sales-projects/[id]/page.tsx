import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateProject, addChannel } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (isNaN(projectId)) notFound();

  const project = await prisma.salesProject.findUnique({
    where: { id: projectId },
    include: {
      channels: true,
      _count: { select: { leads: true, applications: true } },
    },
  });
  if (!project) notFound();

  async function saveAction(formData: FormData) {
    "use server";
    await updateProject(projectId, formData);
    redirect(`/sales-projects/${projectId}`);
  }

  async function channelAction(formData: FormData) {
    "use server";
    await addChannel(projectId, formData);
    redirect(`/sales-projects/${projectId}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-gray-500 font-mono">
          {project.code} · {project._count.leads} leads · {project._count.applications} apps
        </p>
      </div>

      <form action={saveAction} className="bg-white rounded-xl border p-6 space-y-4">
        <Input name="name" required defaultValue={project.name} />
        <Input name="code" defaultValue={project.code || ""} placeholder="Mã" />
        <textarea name="description" rows={2} defaultValue={project.description || ""} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <select name="isActive" defaultValue={project.isActive ? "1" : "0"} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <div className="flex gap-3">
          <Button type="submit">Lưu</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/sales-projects">Quay lại</Link>
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold">Channels ({project.channels.length})</h2>
        <ul className="space-y-1 text-sm">
          {project.channels.map((c) => (
            <li key={c.id} className="flex justify-between">
              <span>{c.name}</span>
              <span className="font-mono text-xs text-gray-400">{c.code}</span>
            </li>
          ))}
          {project.channels.length === 0 && (
            <li className="text-gray-400">Chưa có channel</li>
          )}
        </ul>
        <form action={channelAction} className="flex gap-2 pt-2 border-t">
          <Input name="name" placeholder="Tên channel" required className="flex-1" />
          <Input name="code" placeholder="Mã" className="w-28" />
          <Button type="submit" size="sm">Thêm</Button>
        </form>
      </div>
    </div>
  );
}
