import { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";
import { loadApiConfig } from "./config.js";

const config = loadApiConfig();
const prisma = new PrismaClient({ datasourceUrl: config.databaseUrl });
const app = buildApp({
  prisma,
  tenantId: config.tenantId,
  sessionKey: config.sessionKey,
  isProduction: config.isProduction
});

try {
  await app.listen({ host: "0.0.0.0", port: config.port });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void app.close().then(() => prisma.$disconnect());
  });
}
