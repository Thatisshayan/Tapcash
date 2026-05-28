import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export interface MultiplierEvent {
  id: string;
  label: string;
  multiplier: number;
  startsAt: Timestamp;
  endsAt: Timestamp;
  active: boolean;
}

let _cache: { events: MultiplierEvent[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60_000;

export async function getActiveMultiplier(): Promise<number> {
  const now = Date.now();
  if (_cache && now - _cache.fetchedAt < CACHE_TTL) {
    return resolveMultiplier(_cache.events);
  }

  const snap = await adminDb
    .collection("multiplier_events")
    .where("active", "==", true)
    .get();

  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MultiplierEvent));
  _cache = { events, fetchedAt: now };
  return resolveMultiplier(events);
}

function resolveMultiplier(events: MultiplierEvent[]): number {
  const nowTs = Timestamp.now();
  let max = 1;
  for (const e of events) {
    if (e.startsAt.toMillis() <= nowTs.toMillis() && e.endsAt.toMillis() >= nowTs.toMillis()) {
      if (e.multiplier > max) max = e.multiplier;
    }
  }
  return max;
}
