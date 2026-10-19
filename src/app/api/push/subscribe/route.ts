import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: session.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
