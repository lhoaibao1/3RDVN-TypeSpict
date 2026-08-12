import { redirect } from "next/navigation";
import { createProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewProjectPage() {
  async function action(formData: FormData) {
    "use server";
    const r = await createProject(formData);
    redirect(`/sales-projects/${r.id}`);
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Tạo dự án Sale</h1>
      <form action={action} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên dự án *</label>
          <Input name="name" required placeholder="Lotte Finance" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mã</label>
          <Input name="code" placeholder="LOTTE-FIN" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea name="description" rows={2} className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Channel đầu tiên (optional)</p>
          <Input name="channelName" placeholder="Tên channel" />
          <Input name="channelCode" placeholder="Mã channel" />
        </div>
        <div className="flex gap-3">
          <Button type="submit">Tạo</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/sales-projects">Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
