import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();

    const notif = await sendNotification({
      userId: session.userId,
      title: "⚡ Mobile Alert Test",
      message: `Test notification sent at ${new Date().toLocaleTimeString()} for ${session.name}. Web Push & In-App delivery verified!`,
      type: "success",
      link: "/notifications",
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
