"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "tapcash_cookie_consent";
const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem(CONSENT_KEY);
    if (!consented) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-lg"
      style={{ background: "rgba(10,10,13,0.92)", borderTop: "1px solid rgba(245,243,239,0.09)" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs text-[rgba(245,243,239,0.5)] leading-relaxed flex-1">
          TapCash uses cookies and local storage for sign-in, offer attribution, and anti-fraud.
          By continuing, you consent to our{" "}
          <Link href="/cookies" className="underline hover:no-underline" style={{ color: GOLD }}>Cookie Policy</Link>.
        </p>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-full border text-[rgba(245,243,239,0.68)] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            style={{ borderColor: "rgba(245,243,239,0.14)" }}
          >
            Privacy
          </Link>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
