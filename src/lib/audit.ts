import { prisma } from "./prisma";

export async function logAuditEvent({
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
