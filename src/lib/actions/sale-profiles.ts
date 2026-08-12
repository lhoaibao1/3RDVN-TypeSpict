"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createSaleProfile(formData: FormData) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "sale_profile.create");

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const productInterest = String(formData.get("productInterest") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  const saleOwnerId = formData.get("saleOwnerId") ? Number(formData.get("saleOwnerId")) : Number(session.user.id);
  const teamId = formData.get("teamId") ? Number(formData.get("teamId")) : null;
  const sourceLeadId = formData.get("sourceLeadId") ? Number(formData.get("sourceLeadId")) : null;

  if (!customerName) throw new Error("Tên khách hàng bắt buộc");

  const profile = await prisma.saleProfile.create({
    data: {
      customerName, phone, email, identityNumber, address, productInterest, note,
      saleOwnerId,
      teamId: teamId || undefined,
      sourceLeadId: sourceLeadId || undefined,
      status: "Mới",
      approvalStatus: "pending",
    },
  });

  revalidatePath("/sale-profiles");
  return { id: profile.id };
}

export async function approveSaleProfile(id: number) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "sale_profile.approve");

  await prisma.saleProfile.update({
    where: { id },
    data: {
      approvalStatus: "approved",
      approvedById: Number(session.user.id),
      approvedAt: new Date(),
      status: "Đã duyệt",
    },
  });

  revalidatePath("/sale-profiles");
  revalidatePath(`/sale-profiles/${id}`);
}

export async function rejectSaleProfile(id: number, reason: string) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "sale_profile.approve");

  await prisma.saleProfile.update({
    where: { id },
    data: {
      approvalStatus: "rejected",
      rejectionReason: reason || "Không đủ điều kiện",
      approvedById: Number(session.user.id),
      approvedAt: new Date(),
      status: "Từ chối",
    },
  });

  revalidatePath("/sale-profiles");
  revalidatePath(`/sale-profiles/${id}`);
}

export async function updateSaleProfileStatus(id: number, status: string, processingStatus?: string) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "sale_profile.approve");
  const data: Prisma.SaleProfileUpdateInput = { status };
  if (processingStatus) data.processingStatus = processingStatus;
  if (status === "Hoàn thành") data.completedAt = new Date();

  await prisma.saleProfile.update({ where: { id }, data });
  revalidatePath("/sale-profiles");
  revalidatePath(`/sale-profiles/${id}`);
}
