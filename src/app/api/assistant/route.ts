import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { askAiAssistant } from "@/lib/gemini";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (sessionId) {
      const messages = await prisma.aIChatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    }

    const sessions = await prisma.aIChatSession.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { message, sessionId: incomingSessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let sessionId = incomingSessionId;
    if (!sessionId) {
      const newSession = await prisma.aIChatSession.create({
        data: {
          userId: session.userId,
          title: message.slice(0, 35) + "...",
        },
      });
      sessionId = newSession.id;
    }

    // Save user message
    await prisma.aIChatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: message,
      },
    });

    // Fetch conversation history
    const history = await prisma.aIChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    // Run AI grounding engine
    const aiResponse = await askAiAssistant({
      message,
      userId: session.userId,
      history: history.map((h) => ({ role: h.role, content: h.content })),
    });

    // Check for proposed action
    let actionData: any = null;
    const actionMatch = aiResponse.content.match(/```action([\s\S]*?)```/);
    if (actionMatch && actionMatch[1]) {
      try {
        actionData = JSON.parse(actionMatch[1].trim());
      } catch {}
    }

    // Save assistant message
    const assistantMessage = await prisma.aIChatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: aiResponse.content,
        actionData: actionData ? JSON.stringify(actionData) : null,
      },
    });

    await prisma.aIChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "AI_QUERY",
      entityType: "ASSISTANT",
      entityId: sessionId,
      details: { queryPreview: message.slice(0, 50) },
    });

    return NextResponse.json({
      sessionId,
      message: assistantMessage,
      groundedData: aiResponse.groundedData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
