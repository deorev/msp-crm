import { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /health", () => {
  const app = buildApp({
    prisma: new PrismaClient(),
    tenantId: "00000000-0000-4000-8000-000000000001",
    sessionKey: Buffer.alloc(32, 1),
    isProduction: false
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns an ok status without requiring a database connection", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
