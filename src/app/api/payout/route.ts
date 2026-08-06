import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { createPayPalPayout } from "@/lib/paypal";
import { createInteracTransfer } from "@/lib/interac";
import { createTremendousOrder } from "@/lib/tremendous";
import { logAdminAction } from "@/lib/audit";
import console from 'console'; // <--- added this line
