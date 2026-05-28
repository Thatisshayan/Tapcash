import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "").split(",").map((u) => u.trim()).filter(Boolean);

async function isAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7));
    return ADMIN_UIDS.includes(decoded.uid);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snap = await adminDb.collection("multiplier_events").orderBy("startsAt", "desc").limit(20).get();
  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { label, multiplier, startsAt, endsAt } = body;
  if (!label || !multiplier || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const ref = await adminDb.collection("multiplier_events").add({
    label,
    multiplier: Number(multiplier),
    startsAt: Timestamp.fromDate(new Date(startsAt)),
    endsAt: Timestamp.fromDate(new Date(endsAt)),
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, active } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await adminDb.collection("multiplier_events").doc(id).update({ active: Boolean(active) });
  return NextResponse.json({ ok: true });
}
