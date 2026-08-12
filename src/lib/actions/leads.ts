"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateLeadCode } from "@/lib/utils";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createLead(formData: FormData) {
  const session = await requireSession();

  const leadName = String(formData.get("leadName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const source = String(formData.get("source") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const note = String(formData.get("note") || "").trim() || null;
  const salesProjectId = formData.get("salesProjectId") ? Number(formData.get("salesProjectId")) : null;
  const assignedSaleId = formData.get("assignedSaleId") ? Number(formData.get("assignedSaleId")) : null;

  if (!leadName) throw new Error("Tên lead bắt buộc");

  let teamId: number | null = null;
  let teamLeaderId: number | null = null;
  let amId: number | null = null;
  let zdId: number | null = null;

  // Auto-fill hierarchy from assigned sale
  if (assignedSaleId) {
    const sale = await prisma.user.findUnique({ where: { id: assignedSaleId } });
    if (sale) {
      teamId = sale.teamId;
      teamLeaderId = sale.teamLeaderId;
      amId = sale.amId;
      zdId = sale.zdId;
    }
  }

  const lead = await prisma.lead.create({
    data: {
      leadCode: generateLeadCode(),
      leadName, phone, email, source, status, note,
      salesProjectId: salesProjectId || undefined,
      assignedSaleId: assignedSaleId || undefined,
      teamId: teamId || undefined,
      teamLeaderId: teamLeaderId || undefined,
      amId: amId || undefined,
      zdId: zdId || undefined,
      createdById: Number(session.user.id),
    },
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { id: lead.id, leadCode: lead.leadCode };
}

export async function updateLead(id: number, formData: FormData) {
  const session = await requireSession();

  const leadName = String(formData.get("leadName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const source = String(formData.get("source") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const note = String(formData.get("note") || "").trim() || null;
  const salesProjectId = formData.get("salesProjectId") ? Number(formData.get("salesProjectId")) : null;
  const assignedSaleId = formData.get("assignedSaleId") ? Number(formData.get("assignedSaleId")) : null;

  if (!leadName) throw new Error("Tên lead bắt buộc");

  let hierarchy: any = {};
  if (assignedSaleId) {
    const sale = await prisma.user.findUnique({ where: { id: assignedSaleId } });
    if (sale) {
      hierarchy = {
        teamId: sale.teamId,
        teamLeaderId: sale.teamLeaderId,
        amId: sale.amId,
        zdId: sale.zdId,
      };
    }
  }

  await prisma.lead.update({
    where: { id },
    data: {
      leadName, phone, email, source, status, note,
      salesProjectId: salesProjectId || null,
      assignedSaleId: assignedSaleId || null,
      ...hierarchy,
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function updateLeadStatus(id: number, status: string) {
  await requireSession();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function convertLeadToSaleProfile(leadId: number) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead không tồn tại");

  const profile = await prisma.saleProfile.create({
    data: {
      customerName: lead.leadName,
      phone: lead.phone,
      email: lead.email,
      saleOwnerId: lead.assignedSaleId,
      teamId: lead.teamId,
      sourceLeadId: lead.id,
      status: "Mới",
      approvalStatus: "pending",
      note: lead.note,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      convertedSaleProfileId: profile.id,
      convertedAt: new Date(),
      convertedById: Number(session.user.id),
      status: "Khách hàng thoả mãn điều kiện",
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/sale-profiles");
  return { id: profile.id };
}
