import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { SignJWT } from "jose";

const SESSION_SECRET = process.env.SESSION_SECRET;

function getSecret() {
  if (!SESSION_SECRET) return null;
  return new TextEncoder().encode(SESSION_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const secret = getSecret();
    if (!secret) {
      return NextResponse.json({ error: "Session secret not configured" }, { status: 500 });
    }

    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const { uid, email, admin: isAdmin } = decoded;

    const jwt = await new SignJWT({ uid, email: email || "", admin: !!isAdmin })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
      name: "session",
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[SESSION_USER]", error);
    return NextResponse.json({ error: "Session creation failed" }, { status: 401 });
  }
}

export async function DELETE(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
