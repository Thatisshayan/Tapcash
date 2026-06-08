import { NextResponse } from "next/server";
import { adminDb, firebaseAdminReady, firebaseAdminMode } from "@/lib/firebaseAdmin";

async function checkFirestore(): Promise<{ status: string; latencyMs: number }> {
  if (!firebaseAdminReady) {
    return { status: "unavailable", latencyMs: 0 };
  }
  const start = Date.now();
  try {
    await adminDb.collection("_healthcheck").limit(1).get();
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (error) {
    return { status: "unhealthy", latencyMs: Date.now() - start };
  }
}

async function checkEnvironmentVariables(): Promise<{ status: string; missing: string[] }> {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);
  return { status: missing.length === 0 ? "healthy" : "degraded", missing };
}

export async function GET() {
  const [firestore, env] = await Promise.all([
    checkFirestore(),
    checkEnvironmentVariables(),
  ]);

  const isHealthy = firestore.status === "healthy" && env.status === "healthy";
  const isDegraded = firestore.status === "healthy" && env.status === "degraded";
  const isAdminFallback = firebaseAdminMode === "fallback";

  const status = isAdminFallback ? "degraded" : isHealthy ? "healthy" : isDegraded ? "degraded" : "unhealthy";
  const httpStatus = isAdminFallback || isDegraded ? 200 : isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status,
      service: "TapCash",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      mode: firebaseAdminMode,
      checks: {
        firestore,
        environment: env,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    { status: httpStatus }
  );
}