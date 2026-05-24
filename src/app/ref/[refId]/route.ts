import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { refId: string } }) {
  const refId = params.refId;

  // Create a response that redirects to the signup page
  const response = NextResponse.redirect(new URL("/auth/signup", request.url));

  // Set the referral cookie, valid for 30 days
  response.cookies.set("tapcash_ref", refId, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: false, // Allow client side to read it during signup if needed, though we can read it via server action or API
  });

  return response;
}
