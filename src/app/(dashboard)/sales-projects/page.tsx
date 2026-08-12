import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function SalesProjectsPage() {
  const projects = await prisma.salesProject.findMany({
    include: {
      channels: true,
      _count: { select: { leads: true, applications: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dự án Sale</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} dự án</p>
        </div>
        <Button asChild>
          <Link href="/sales-projects/new"><Plus className="h-4 w-4" /> Tạo dự án</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">Chưa có dự án</div>
        ) : projects.map((p) => (
          <Link key={p.id} href={`/sales-projects/${p.id}`} className="bg-white rounded-xl border p-5 hover:border-blue-300 transition-colors block">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{p.code}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                {p.isActive ? "Active" : "Off"}
              </span>
            </div>
            {p.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span>{p._count.leads} leads</span>
              <span>{p._count.applications} apps</span>
              <span>{p.channels.length} channels</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
