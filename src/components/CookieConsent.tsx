"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "tapcash_cookie_consent";

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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/8 bg-[#0a0f0d]/95 backdrop-blur-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <p className="text-xs text-zinc-400 leading-relaxed flex-1">
          TapCash uses cookies and local storage for sign-in, offer attribution, and anti-fraud.
          By continuing, you consent to our{" "}
          <Link href="/cookies" className="text-[#00e6c3] underline hover:no-underline">Cookie Policy</Link>.
        </p>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-xl border border-white/8 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Privacy
          </Link>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl bg-[#00e6c3] text-[#050816] text-xs font-black uppercase tracking-widest hover:bg-[#26edd1] transition-all active:scale-95"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
