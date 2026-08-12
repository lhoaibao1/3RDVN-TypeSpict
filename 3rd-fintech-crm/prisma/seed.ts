import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES = [
  "Admin", "Sales Admin", "ZD", "AM", "Team Leader",
  "Courier Manager", "Courier", "Direct Sale", "Telesale", "CTV",
];

const PERMISSIONS = [
  "user.view", "user.create", "user.update", "user.delete",
  "lead.view", "lead.create", "lead.update", "lead.delete", "lead.assign",
  "team.view", "team.manage", "project.view", "project.manage",
  "sale_profile.view", "sale_profile.create", "sale_profile.approve",
  "application.view", "application.create",
  "datacenter.view", "datacenter.manage",
];

async function main() {
  console.log("Seeding 3RD Fintech CRM...");

  for (const name of ROLES) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of PERMISSIONS) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const allPerms = await prisma.permission.findMany();
  if (adminRole) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      });
    }
  }

  const hashed = await bcrypt.hash("Admin@123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@3rdvn.local" },
    update: {},
    create: {
      uid: "UID25080001",
      username: "admin",
      name: "System Admin",
      email: "admin@3rdvn.local",
      employeeCode: "RD250001",
      password: hashed,
      employmentStatus: "active",
      department: "IT",
      position: "Administrator",
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });
  }

  await prisma.crmTeam.upsert({
    where: { code: "TEAM-01" },
    update: {},
    create: { name: "Team Sale Hà Nội", code: "TEAM-01", description: "Team sale khu vực Hà Nội", isActive: true },
  });

  await prisma.salesProject.upsert({
    where: { code: "LOTTE-FIN" },
    update: {},
    create: { name: "Lotte Finance", code: "LOTTE-FIN", description: "Dự án tài chính Lotte", isActive: true },
  });

  await prisma.salesProject.upsert({
    where: { code: "CBP" },
    update: {},
    create: { name: "CBP", code: "CBP", description: "Consumer Business Product", isActive: true },
  });

  const existingLead = await prisma.lead.findFirst({ where: { leadCode: "LD2508080001" } });
  if (!existingLead) {
    await prisma.lead.create({
      data: {
        leadCode: "LD2508080001",
        leadName: "Nguyễn Văn A",
        phone: "0901234567",
        email: "nguyenvana@example.com",
        source: "Facebook",
        status: "Mới",
        note: "Lead mẫu từ seed",
        createdById: admin.id,
      },
    });
  }

  console.log("✅ Seed done!");
  console.log("Login: UID25080001 / Admin@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
