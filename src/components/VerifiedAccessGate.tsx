"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sendEmailVerification } from "firebase/auth";
import { MailCheck, RefreshCcw, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

type VerifiedAccessGateProps = {
  title: string;
  description: string;
  nextHref: string;
  nextLabel: string;
};

type MessageType = "success" | "error" | null;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function VerifiedAccessGate({ title, description, nextHref, nextLabel }: VerifiedAccessGateProps) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>(null);
  const userUid = user?.uid;

  useEffect(() => {
    if (userUid) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        void currentUser.reload().catch(() => {});
      }
    }
  }, [userUid]);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setSending(true);
    setMessage(null);
    try {
      await sendEmailVerification(currentUser);
      setMessage("Verification email resent. Check your inbox and spam folder.");
      setMessageType("success");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "We could not resend the verification email right now."));
      setMessageType("error");
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setRefreshing(true);
    setMessage(null);
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        window.location.href = nextHref;
      } else {
        setMessage("Your email still looks unverified. Click the link in your inbox, then try again.");
        setMessageType("error");
      }
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Unable to refresh your verification status."));
      setMessageType("error");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00e6c3] to-[#3a7bff] flex items-center justify-center text-[#050816] shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-black">Verification required</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h2>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Verify your inbox",
          "Keep the platform bot-resistant",
          "Unlock offers, cashout, and referrals",
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <p className="text-sm text-zinc-200 font-medium leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {message && (
        <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm flex items-start gap-2 ${
          messageType === "success"
            ? "border-[#00e6c3]/20 bg-[#00e6c3]/10 text-[#b9fff3]"
            : "border-red-500/20 bg-red-500/10 text-red-300"
        }`}>
          {messageType === "error" && (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          {messageType === "success" && (
            <MailCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] px-5 py-3.5 text-sm font-black text-[#050816] shadow-[0_12px_30px_rgba(58,123,255,0.18)] disabled:opacity-60"
        >
          <MailCheck className="w-4 h-4" />
          {sending ? "Resending..." : "Resend verification email"}
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-white hover:bg-white/[0.07] transition-colors disabled:opacity-60"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "I verified my email"}
        </button>
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-zinc-200 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          {nextLabel}
        </Link>
      </div>
    </div>
  );
}
