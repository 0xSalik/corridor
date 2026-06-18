// Auth utilities: JWT token creation and verification, cookie helpers.

import pkg from "jsonwebtoken";
const { sign, verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || "corridor-dev-secret-change-me";
const TOKEN_NAME = "corridor_token";
const MAX_AGE = 7 * 24 * 60 * 60;

export function createToken(user) {
  return sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId || null,
    },
    JWT_SECRET,
    { expiresIn: MAX_AGE }
  );
}

export function verifyToken(token) {
  try {
    return verify(token, JWT_SECRET);
  } catch {
    return null;
  }
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
