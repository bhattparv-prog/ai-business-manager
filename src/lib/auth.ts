import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-development-mode-1234";
const COOKIE_NAME = "ai_manager_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "OWNER" | "EMPLOYEE";
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "EMPLOYEE",
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "OWNER") {
    throw new Error("FORBIDDEN: Requires OWNER role");
  }
  return session;
}

export { COOKIE_NAME };
