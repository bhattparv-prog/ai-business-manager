import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const session = await requireOwner();
    const rules = await prisma.automationRule.findMany({
      where: {
        userId: session.userId,
      },
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
        userId: session.userId,
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

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Rule not found in your workspace" }, { status: 404 });
    }

    const updated = await prisma.automationRule.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ rule: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireOwner();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Rule not found in your workspace" }, { status: 404 });
    }

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
