import { NextResponse } from "next/server";
import { getVapidKeys } from "@/lib/notifications";

export async function GET() {
  try {
    const keys = await getVapidKeys();
    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
