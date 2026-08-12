"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

function generateApplicationCode() {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `APP${ymd}${rand}`;
}

export async function createApplication(formData: FormData) {
  const session = await requireSession();

  const applicantName = String(formData.get("applicantName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const note = String(formData.get("note") || "").trim() || null;
  const salesProjectId = formData.get("salesProjectId") ? Number(formData.get("salesProjectId")) : null;
  const leadId = formData.get("leadId") ? Number(formData.get("leadId")) : null;
  const assignedSaleId = formData.get("assignedSaleId") ? Number(formData.get("assignedSaleId")) : null;

  if (!applicantName) throw new Error("Tên người nộp đơn bắt buộc");

  let teamId: number | null = null;
  let teamLeaderId: number | null = null;
  let amId: number | null = null;
  let zdId: number | null = null;

  const saleId = assignedSaleId || Number(session.user.id);
  const sale = await prisma.user.findUnique({ where: { id: saleId } });
  if (sale) {
    teamId = sale.teamId;
    teamLeaderId = sale.teamLeaderId;
    amId = sale.amId;
    zdId = sale.zdId;
  }

  // If from lead, pull extra info
  let finalName = applicantName;
  let finalPhone = phone;
  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead) {
      if (!finalPhone) finalPhone = lead.phone;
      if (!salesProjectId && lead.salesProjectId) {
        // keep salesProjectId from form primarily
      }
    }
  }

  const app = await prisma.application.create({
    data: {
      applicationCode: generateApplicationCode(),
      applicantName: finalName,
      phone: finalPhone,
      identityNumber,
      status,
      note,
      salesProjectId: salesProjectId || undefined,
      leadId: leadId || undefined,
      assignedSaleId: saleId,
      teamId: teamId || undefined,
      teamLeaderId: teamLeaderId || undefined,
      amId: amId || undefined,
      zdId: zdId || undefined,
      createdById: Number(session.user.id),
    },
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { id: app.id, applicationCode: app.applicationCode };
}

export async function updateApplication(id: number, formData: FormData) {
  await requireSession();

  const applicantName = String(formData.get("applicantName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const note = String(formData.get("note") || "").trim() || null;
  const salesProjectId = formData.get("salesProjectId") ? Number(formData.get("salesProjectId")) : null;
  const assignedSaleId = formData.get("assignedSaleId") ? Number(formData.get("assignedSaleId")) : null;

  if (!applicantName) throw new Error("Tên người nộp đơn bắt buộc");

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

  await prisma.application.update({
    where: { id },
    data: {
      applicantName,
      phone,
      identityNumber,
      status,
      note,
      salesProjectId: salesProjectId || null,
      assignedSaleId: assignedSaleId || null,
      ...hierarchy,
    },
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function updateApplicationStatus(id: number, status: string) {
  await requireSession();
  await prisma.application.update({ where: { id }, data: { status } });
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}
