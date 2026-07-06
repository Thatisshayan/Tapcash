export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.FIREBASE_MEASUREMENT_ID) {
    try {
      const { getFirebaseApp } = await import("./src/lib/firebaseAdmin");
      const app = getFirebaseApp?.();
      if (app) {
        console.log("[Firebase Performance] Monitoring enabled for project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      }
    } catch {
      // Firebase Performance Monitoring is optional
    }
  }
}