import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure SQLite is writable on Vercel serverless functions by using /tmp
if (process.env.VERCEL) {
  const currentUrl = process.env.DATABASE_URL || "";
  if (!currentUrl.startsWith("postgres://") && !currentUrl.startsWith("postgresql://")) {
    const tmpPath = "/tmp/dev.db";
    process.env.DATABASE_URL = `file:${tmpPath}`;

    const candidates = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(__dirname, "..", "..", "prisma", "dev.db"),
      path.join(__dirname, "..", "prisma", "dev.db"),
      "/var/task/prisma/dev.db",
    ];

    for (const bundledPath of candidates) {
      if (fs.existsSync(bundledPath)) {
        try {
          if (!fs.existsSync(tmpPath)) {
            fs.copyFileSync(bundledPath, tmpPath);
          }
          break;
        } catch (err) {
          console.warn("Failed to copy bundled dev.db to /tmp:", err);
        }
      }
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
