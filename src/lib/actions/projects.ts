"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createProject(formData: FormData) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "project.manage");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;

  if (!name) throw new Error("Tên dự án bắt buộc");

  const project = await prisma.salesProject.create({
    data: { name, code: code || undefined, description, isActive: true },
  });

  // Optional first channel
  const channelName = String(formData.get("channelName") || "").trim();
  if (channelName) {
    await prisma.salesChannel.create({
      data: {
        name: channelName,
        code: String(formData.get("channelCode") || "").trim() || undefined,
        salesProjectId: project.id,
        isActive: true,
      },
    });
  }

  revalidatePath("/sales-projects");
  return { id: project.id };
}

export async function updateProject(id: number, formData: FormData) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "project.manage");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const isActive = formData.get("isActive") !== "0";

  if (!name) throw new Error("Tên dự án bắt buộc");

  await prisma.salesProject.update({
    where: { id },
    data: { name, code, description, isActive },
  });

  revalidatePath("/sales-projects");
  revalidatePath(`/sales-projects/${id}`);
}

export async function addChannel(projectId: number, formData: FormData) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "project.manage");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  if (!name) throw new Error("Tên channel bắt buộc");

  await prisma.salesChannel.create({
    data: {
      name,
      code: code || undefined,
      salesProjectId: projectId,
      isActive: true,
    },
  });

  revalidatePath(`/sales-projects/${projectId}`);
  revalidatePath("/sales-projects");
}
