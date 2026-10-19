import webPush from "web-push";
import { prisma } from "./prisma";

// Get or ensure VAPID keys
export async function getVapidKeys() {
  // Check settings table first
  const setting = await prisma.setting.findUnique({
    where: { key: "vapid_keys" },
  });

  if (setting) {
    try {
      const keys = JSON.parse(setting.value);
      if (keys.publicKey && keys.privateKey) {
        return keys;
      }
    } catch {}
  }

  // Fallback to env or generate a persistent pair
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }

  // Generate new keys and store them in the Setting table
  const newKeys = webPush.generateVAPIDKeys();
  await prisma.setting.upsert({
    where: { key: "vapid_keys" },
    update: { value: JSON.stringify(newKeys) },
    create: { key: "vapid_keys", value: JSON.stringify(newKeys) },
  });

  return newKeys;
}

export async function sendNotification({
  userId,
  title,
  message,
  type = "info",
  link = "/dashboard",
}: {
  userId?: string | null;
  title: string;
  message: string;
  type?: "info" | "warning" | "success" | "alert";
  link?: string;
}) {
  // 1. Save In-App notification
  const notification = await prisma.notification.create({
    data: {
      userId: userId ?? null,
      title,
      message,
      type,
      link,
    },
  });

  // 2. Dispatch Web Push if configured
  try {
    const vapid = await getVapidKeys();
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@local.host";

    webPush.setVapidDetails(subject, vapid.publicKey, vapid.privateKey);

    // Find subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: userId ? { userId } : {},
    });

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: link,
        id: notification.id,
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (err: any) {
        // If subscription is expired or invalid (404/410), clean it up
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (err) {
    console.warn("Web Push dispatch notice:", err);
  }

  return notification;
}
