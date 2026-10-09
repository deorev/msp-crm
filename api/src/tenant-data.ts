import type { PrismaClient } from "@prisma/client";

export function tenantData(prisma: PrismaClient, tenantId: string) {
  return {
    findUserByEmail(email: string) {
      return prisma.user.findUnique({
        where: { tenantId_email: { tenantId, email } }
      });
    },
    findUserById(userId: string) {
      return prisma.user.findFirst({ where: { tenantId, userId } });
    },
    createAdmin(input: { email: string; name: string; passwordHash: string }) {
      return prisma.user.upsert({
        where: { tenantId_email: { tenantId, email: input.email } },
        create: { ...input, tenantId, role: "Admin" },
        update: {
          name: input.name,
          passwordHash: input.passwordHash,
          role: "Admin"
        }
      });
    }
  };
}
