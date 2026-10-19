import { NextResponse } from "next/server";
import { COOKIE_NAME, getSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  if (session) {
    await logAuditEvent({
      userId: session.userId,
      action: "LOGOUT",
      entityType: "USER",
      entityId: session.userId,
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
