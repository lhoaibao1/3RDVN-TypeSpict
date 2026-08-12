"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createTeam(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const managerId = formData.get("managerId") ? Number(formData.get("managerId")) : null;

  if (!name) throw new Error("Tên team bắt buộc");

  const team = await prisma.crmTeam.create({
    data: {
      name,
      code: code || undefined,
      description,
      managerId: managerId || undefined,
      isActive: true,
    },
  });

  revalidatePath("/teams");
  return { id: team.id };
}

export async function updateTeam(id: number, formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const managerId = formData.get("managerId") ? Number(formData.get("managerId")) : null;
  const isActive = formData.get("isActive") !== "0";

  if (!name) throw new Error("Tên team bắt buộc");

  await prisma.crmTeam.update({
    where: { id },
    data: {
      name,
      code,
      description,
      managerId: managerId || null,
      isActive,
    },
  });

  revalidatePath("/teams");
  revalidatePath(`/teams/${id}`);
}
