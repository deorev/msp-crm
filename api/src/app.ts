import secureSession from "@fastify/secure-session";
import bcrypt from "bcryptjs";
import Fastify, { type FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { tenantData } from "./tenant-data.js";

interface AppOptions {
  prisma: PrismaClient;
  tenantId: string;
  sessionKey: Buffer;
  isProduction: boolean;
}

interface LoginBody {
  email: string;
  password: string;
}

function roleName(role: string): string {
  return role === "OpsManager" ? "Ops Manager" : role;
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: true });
  const users = tenantData(options.prisma, options.tenantId);

  app.register(secureSession, {
    key: options.sessionKey,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: options.isProduction,
      sameSite: "strict",
      maxAge: 60 * 60 * 8
    }
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post<{ Body: LoginBody }>("/api/auth/login", async (request, reply) => {
    const { email, password } = request.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    const user = await users.findUserByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    request.session.set("userId", user.userId);
    return {
      name: user.name,
      role: roleName(user.role)
    };
  });

  app.get("/api/me", async (request, reply) => {
    const userId = request.session.get("userId");
    if (typeof userId !== "string") {
      return reply.code(401).send({ error: "Authentication required" });
    }

    const user = await users.findUserById(userId);
    if (!user) {
      request.session.delete();
      return reply.code(401).send({ error: "Authentication required" });
    }

    return {
      name: user.name,
      role: roleName(user.role)
    };
  });

  return app;
}
