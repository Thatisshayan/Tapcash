import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

type VerifiedUserResult =
  | {
      uid: string;
      email: string | null;
      userData: any;
    }
  | {
      response: NextResponse;
    };

export async function requireVerifiedUser(request: NextRequest): Promise<VerifiedUserResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      response: NextResponse.json({ error: "Unauthorized: Missing authorization header" }, { status: 401 }),
    };
  }

  const idToken = authHeader.slice("Bearer ".length);

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return {
        response: NextResponse.json(
          { error: "Email verification required. Please verify your inbox before using this feature." },
          { status: 403 }
        ),
      };
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email || null;
    const userSnap = await adminDb.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return {
        response: NextResponse.json({ error: "User profile not found in database." }, { status: 404 }),
      };
    }

    return { uid, email, userData: userSnap.data() || {} };
  } catch {
    return {
      response: NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 }),
    };
  }
}
