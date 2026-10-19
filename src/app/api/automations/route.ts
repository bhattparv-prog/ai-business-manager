import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    await requireOwner();
    const rules = await prisma.automationRule.findMany({
      include: {
        logs: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    const { name, triggerType, triggerConfig = {}, conditionConfig = {}, actionType, actionConfig = {} } = await req.json();

    if (!name || !triggerType || !actionType) {
      return NextResponse.json({ error: "Name, trigger type, and action type are required" }, { status: 400 });
    }

    const rule = await prisma.automationRule.create({
      data: {
        name,
        triggerType,
        triggerConfig: JSON.stringify(triggerConfig),
        conditionConfig: JSON.stringify(conditionConfig),
        actionType,
        actionConfig: JSON.stringify(actionConfig),
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CREATE_AUTOMATION_RULE",
      entityType: "AUTOMATION",
      entityId: rule.id,
      details: { name, triggerType, actionType },
    });

    return NextResponse.json({ rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireOwner();
    const { id, isActive } = await req.json();

    const rule = await prisma.automationRule.update({
      where: { id },
      data: { isActive },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "TOGGLE_AUTOMATION_RULE",
      entityType: "AUTOMATION",
      entityId: id,
      details: { isActive },
    });

    return NextResponse.json({ rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireOwner();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Rule ID required" }, { status: 400 });

    await prisma.automationRule.delete({ where: { id } });

    await logAuditEvent({
      userId: session.userId,
      action: "DELETE_AUTOMATION_RULE",
      entityType: "AUTOMATION",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
