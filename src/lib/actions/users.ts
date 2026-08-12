"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateUid, generateEmployeeCode } from "@/lib/utils";
import { assignableRoles, type RoleName } from "@/lib/role-hierarchy";
import { assertCan } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createUser(formData: FormData) {
  const session = await requireSession();
  const actorRoles = session.user.roles || [];
  assertCan(actorRoles, "user.create");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const password = String(formData.get("password") || "").trim();
  const roleName = String(formData.get("role") || "").trim();
  const department = String(formData.get("department") || "").trim() || null;
  const position = String(formData.get("position") || "").trim() || null;
  const gender = String(formData.get("gender") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const documentType = String(formData.get("documentType") || "").trim() || null;
  const office = String(formData.get("office") || "").trim() || null;
  const contractType = String(formData.get("contractType") || "").trim() || null;
  const teamId = formData.get("teamId") ? Number(formData.get("teamId")) : null;
  const teamLeaderId = formData.get("teamLeaderId") ? Number(formData.get("teamLeaderId")) : null;
  const amId = formData.get("amId") ? Number(formData.get("amId")) : null;
  const zdId = formData.get("zdId") ? Number(formData.get("zdId")) : null;
  const addressLine = String(formData.get("addressLine") || "").trim() || null;
  const provinceName = String(formData.get("provinceName") || "").trim() || null;
  const districtName = String(formData.get("districtName") || "").trim() || null;
  const wardName = String(formData.get("wardName") || "").trim() || null;
  const bankName = String(formData.get("bankName") || "").trim() || null;
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim() || null;
  const bankAccountName = String(formData.get("bankAccountName") || "").trim() || null;
  const bankBranch = String(formData.get("bankBranch") || "").trim() || null;

  if (!name || !email || !password) throw new Error("Thiếu họ tên / email / mật khẩu");

  if (roleName) {
    const allowed = assignableRoles(actorRoles);
    if (allowed.length > 0 && !allowed.includes(roleName as RoleName)) {
      throw new Error(`Bạn không được gán role "${roleName}"`);
    }
  }

  const maxId = await prisma.user.aggregate({ _max: { id: true } });
  const nextSeq = (maxId._max.id || 0) + 1;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      uid: generateUid(nextSeq),
      employeeCode: generateEmployeeCode(nextSeq),
      name, email, phone, password: hashed,
      department, position, gender, identityNumber, documentType,
      office, contractType,
      teamId: teamId || undefined,
      teamLeaderId: teamLeaderId || undefined,
      amId: amId || undefined,
      zdId: zdId || undefined,
      addressLine, provinceName, districtName, wardName,
      bankName, bankAccountNumber, bankAccountName, bankBranch,
      employmentStatus: "active",
      createdById: Number(session.user.id),
    },
  });

  if (roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    }
  }

  revalidatePath("/users");
  return { id: user.id, uid: user.uid };
}

export async function updateUser(id: number, formData: FormData) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "user.update");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const department = String(formData.get("department") || "").trim() || null;
  const position = String(formData.get("position") || "").trim() || null;
  const gender = String(formData.get("gender") || "").trim() || null;
  const identityNumber = String(formData.get("identityNumber") || "").trim() || null;
  const documentType = String(formData.get("documentType") || "").trim() || null;
  const office = String(formData.get("office") || "").trim() || null;
  const contractType = String(formData.get("contractType") || "").trim() || null;
  const employmentStatus = String(formData.get("employmentStatus") || "active").trim();
  const teamId = formData.get("teamId") ? Number(formData.get("teamId")) : null;
  const teamLeaderId = formData.get("teamLeaderId") ? Number(formData.get("teamLeaderId")) : null;
  const amId = formData.get("amId") ? Number(formData.get("amId")) : null;
  const zdId = formData.get("zdId") ? Number(formData.get("zdId")) : null;
  const addressLine = String(formData.get("addressLine") || "").trim() || null;
  const provinceName = String(formData.get("provinceName") || "").trim() || null;
  const districtName = String(formData.get("districtName") || "").trim() || null;
  const wardName = String(formData.get("wardName") || "").trim() || null;
  const bankName = String(formData.get("bankName") || "").trim() || null;
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim() || null;
  const bankAccountName = String(formData.get("bankAccountName") || "").trim() || null;
  const bankBranch = String(formData.get("bankBranch") || "").trim() || null;
  const roleName = String(formData.get("role") || "").trim();
  const newPassword = String(formData.get("password") || "").trim();

  if (!name || !email) throw new Error("Thiếu họ tên / email");

  const data: Prisma.UserUncheckedUpdateInput = {
    name, email, phone, department, position, gender, identityNumber, documentType,
    office, contractType, employmentStatus,
    teamId: teamId || null,
    teamLeaderId: teamLeaderId || null,
    amId: amId || null,
    zdId: zdId || null,
    addressLine, provinceName, districtName, wardName,
    bankName, bankAccountNumber, bankAccountName, bankBranch,
  };

  if (newPassword) {
    data.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({ where: { id }, data });

  if (roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({ data: { userId: id, roleId: role.id } });
    }
  }

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return { id };
}

export async function deactivateUser(id: number) {
  const session = await requireSession();
  const roles = session.user.roles || [];
  assertCan(roles, "user.delete");
  await prisma.user.update({
    where: { id },
    data: { employmentStatus: "deactive" },
  });
  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
}
