import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="text-sm text-gray-500">
            Xin chào, <span className="font-medium text-gray-900">{session.user.name}</span>
            {session.user.uid && (
              <span className="ml-2 text-xs text-gray-400">({session.user.uid})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {session.user.roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {r}
              </span>
            ))}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
