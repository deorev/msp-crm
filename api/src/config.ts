import { config as loadDotEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

loadDotEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

export interface ApiConfig {
  databaseUrl: string;
  tenantId: string;
  sessionKey: Buffer;
  port: number;
  isProduction: boolean;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function loadApiConfig(): ApiConfig {
  const sessionKey = requiredEnv("SESSION_KEY");
  if (!/^[0-9a-fA-F]{64}$/.test(sessionKey)) {
    throw new Error("SESSION_KEY must be a 32-byte hexadecimal value");
  }

  const portValue = process.env.API_PORT ?? "3001";
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535");
  }

  const tenantId = requiredEnv("TENANT_ID");
  if (!isUuid(tenantId)) {
    throw new Error("TENANT_ID must be a UUID");
  }

  return {
    databaseUrl: requiredEnv("DATABASE_URL"),
    tenantId,
    sessionKey: Buffer.from(sessionKey, "hex"),
    port,
    isProduction: process.env.NODE_ENV === "production"
  };
}

export function loadSeedConfig() {
  const tenantId = requiredEnv("TENANT_ID");
  if (!isUuid(tenantId)) {
    throw new Error("TENANT_ID must be a UUID");
  }

  const email = requiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const password = requiredEnv("SEED_ADMIN_PASSWORD");
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
  }

  return {
    databaseUrl: requiredEnv("DATABASE_URL"),
    tenantId,
    tenantName: process.env.TENANT_NAME?.trim() || "Local MSP",
    adminEmail: email,
    adminPassword: password,
    adminName: process.env.SEED_ADMIN_NAME?.trim() || "Local Admin"
  };
}
