import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseConfig } from "./db-config";

// The MariaDB driver talks to both MySQL and MariaDB (Hostinger, Aiven).
function createClient() {
  return new PrismaClient({ adapter: new PrismaMariaDb(databaseConfig()) });
}

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
