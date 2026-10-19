import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId: session.userId }, { userId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ userId: session.userId }, { userId: null }],
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const { id, all } = await req.json();

    if (all) {
      await prisma.notification.updateMany({
        where: {
          OR: [{ userId: session.userId }, { userId: null }],
          read: false,
        },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
