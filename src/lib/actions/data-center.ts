"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

function generateReferralCode(id: number) {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  return `DC${ymd}${String(id).padStart(6, "0")}`;
}

export async function createDataCenterLead(formData: FormData) {
  const session = await requireSession();

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const provinceName = String(formData.get("provinceName") || "").trim() || null;
  const districtName = String(formData.get("districtName") || "").trim() || null;
  const wardName = String(formData.get("wardName") || "").trim() || null;
  const source = String(formData.get("source") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const callNote = String(formData.get("callNote") || "").trim() || null;
  const assignedUserId = formData.get("assignedUserId")
    ? Number(formData.get("assignedUserId"))
    : null;

  if (!customerName) throw new Error("Tên khách hàng bắt buộc");

  let teamId: number | null = null;
  let teamLeaderId: number | null = null;
  let amId: number | null = null;
  let zdId: number | null = null;

  if (assignedUserId) {
    const u = await prisma.user.findUnique({ where: { id: assignedUserId } });
    if (u) {
      teamId = u.teamId;
      teamLeaderId = u.teamLeaderId;
      amId = u.amId;
      zdId = u.zdId;
    }
  }

  const record = await prisma.dataCenterLead.create({
    data: {
      customerName, phone, email, identityNumber, address,
      provinceName, districtName, wardName, source, status, callNote,
      assignedUserId: assignedUserId || undefined,
      teamId: teamId || undefined,
      teamLeaderId: teamLeaderId || undefined,
      amId: amId || undefined,
      zdId: zdId || undefined,
      createdById: Number(session.user.id),
    },
  });

  // Set referral code after create (needs id)
  const code = generateReferralCode(record.id);
  await prisma.dataCenterLead.update({
    where: { id: record.id },
    data: { referralCode: code },
  });

  revalidatePath("/data-center");
  return { id: record.id, referralCode: code };
}

export async function updateDataCenterLead(id: number, formData: FormData) {
  await requireSession();

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const provinceName = String(formData.get("provinceName") || "").trim() || null;
  const districtName = String(formData.get("districtName") || "").trim() || null;
  const wardName = String(formData.get("wardName") || "").trim() || null;
  const source = String(formData.get("source") || "").trim() || null;
  const status = String(formData.get("status") || "Mới").trim();
  const callNote = String(formData.get("callNote") || "").trim() || null;
  const assignedUserId = formData.get("assignedUserId")
    ? Number(formData.get("assignedUserId"))
    : null;
  const markContacted = formData.get("markContacted") === "1";

  if (!customerName) throw new Error("Tên khách hàng bắt buộc");

  let hierarchy: any = {};
  if (assignedUserId) {
    const u = await prisma.user.findUnique({ where: { id: assignedUserId } });
    if (u) {
      hierarchy = {
        teamId: u.teamId,
        teamLeaderId: u.teamLeaderId,
        amId: u.amId,
        zdId: u.zdId,
      };
    }
  }

  await prisma.dataCenterLead.update({
    where: { id },
    data: {
      customerName, phone, email, identityNumber, address,
      provinceName, districtName, wardName, source, status, callNote,
      assignedUserId: assignedUserId || null,
      contactedAt: markContacted ? new Date() : undefined,
      ...hierarchy,
    },
  });

  revalidatePath("/data-center");
  revalidatePath(`/data-center/${id}`);
}

export async function convertDcToLead(dcId: number) {
  const session = await requireSession();
  const dc = await prisma.dataCenterLead.findUnique({ where: { id: dcId } });
  if (!dc) throw new Error("Không tìm thấy");

  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, "0");

  const lead = await prisma.lead.create({
    data: {
      leadCode: `LD${ymd}${rand}`,
      leadName: dc.customerName,
      phone: dc.phone,
      email: dc.email,
      source: dc.source || "Data Center",
      status: "Mới",
      note: dc.callNote,
      assignedSaleId: dc.assignedUserId,
      teamId: dc.teamId,
      teamLeaderId: dc.teamLeaderId,
      amId: dc.amId,
      zdId: dc.zdId,
      createdById: Number(session.user.id),
    },
  });

  await prisma.dataCenterLead.update({
    where: { id: dcId },
    data: { status: "Đã chuyển Lead" },
  });

  revalidatePath("/data-center");
  revalidatePath("/leads");
  return { id: lead.id };
}
