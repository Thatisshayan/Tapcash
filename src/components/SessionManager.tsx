"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SessionManager() {
  const { user, loading } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      const hasSession = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("session="));

      if (!hasSession && !initialized.current) {
        initialized.current = true;
        user.getIdToken().then((token) => {
          fetch("/api/auth/session/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          }).catch((err) => console.error("[SessionManager] create error:", err));
        });
      }
    } else {
      initialized.current = false;
      fetch("/api/auth/session/user", { method: "DELETE" }).catch(() => {});
    }
  }, [user, loading]);

  return null;
}
