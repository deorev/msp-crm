import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loadSeedConfig } from "../src/config.js";
import { tenantData } from "../src/tenant-data.js";

const config = loadSeedConfig();
const prisma = new PrismaClient();

try {
  await prisma.tenant.upsert({
    where: { tenantId: config.tenantId },
    create: { tenantId: config.tenantId, name: config.tenantName },
    update: { name: config.tenantName }
  });

  const passwordHash = await bcrypt.hash(config.adminPassword, 12);
  await tenantData(prisma, config.tenantId).createAdmin({
    email: config.adminEmail,
    name: config.adminName,
    passwordHash
  });

  console.log(`Seeded Admin account ${config.adminEmail} for tenant ${config.tenantId}`);
} finally {
  await prisma.$disconnect();
}
