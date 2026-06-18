// Auth utilities: JWT token creation and verification, cookie helpers.

import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const EFFECTIVE_SECRET = JWT_SECRET || "corridor-dev-secret-change-me";

const TOKEN_NAME = "corridor_token";
const MAX_AGE = 7 * 24 * 60 * 60;

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createToken(user) {
  return sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId || null,
    },
    EFFECTIVE_SECRET,
    { expiresIn: MAX_AGE }
  );
}

export function verifyToken(token) {
  try {
    return verify(token, EFFECTIVE_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenCookieOptions() {
  return {
    name: TOKEN_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  };
}

export { TOKEN_NAME };
