// Me route: returns the currently logged-in user from the JWT cookie.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, TOKEN_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
