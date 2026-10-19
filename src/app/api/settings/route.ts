import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    const settings = await prisma.setting.findMany();
    const map: Record<string, any> = {};

    for (const s of settings) {
      if (s.key === "gemini_api_key") {
        // Obfuscate key for display
        try {
          const val = JSON.parse(s.value);
          map[s.key] = val ? `${val.slice(0, 4)}...${val.slice(-4)}` : "";
        } catch {
          map[s.key] = s.value ? "configured" : "";
        }
      } else {
        try {
          map[s.key] = JSON.parse(s.value);
        } catch {
          map[s.key] = s.value;
        }
      }
    }

    return NextResponse.json({ settings: map });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireOwner();
    const body = await req.json();

    for (const [key, val] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(val) },
        create: { key, value: JSON.stringify(val) },
      });
    }

    await logAuditEvent({
      userId: session.userId,
      action: "UPDATE_SETTINGS",
      entityType: "SETTING",
      details: { keys: Object.keys(body) },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
