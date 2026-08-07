"use client";

import { useEffect, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { MailCheck, RefreshCcw, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

type VerifiedAccessGateProps = {
  title: string;
  description: string;
  nextHref: string;
};

type MessageType = "success" | "error" | null;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function GateHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" style={{ color: GOLD }} />
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[rgba(245,243,239,0.4)] font-bold">Verification required</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#F5F3EF]">{title}</h2>
          <p className="text-sm md:text-base text-[rgba(245,243,239,0.5)] leading-relaxed max-w-2xl">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-3">
        {[
          "Verify your inbox",
          "Keep the platform bot-resistant",
          "Unlock offers, cashout, and referrals",
        ].map((item) => (
          <p key={item} className="text-sm text-[rgba(245,243,239,0.68)] font-medium leading-relaxed">{item}</p>
        ))}
      </div>
    </>
  );
}

function GateMessage({ message, messageType }: { message: string | null; messageType: MessageType }) {
  if (!message) return null;
  return (
    <div
      className="mt-5 py-3 text-sm flex items-start gap-2"
      style={{
        borderTop: "1px solid rgba(245,243,239,0.09)",
        color: messageType === "success" ? GOLD_BRIGHT : "#FF2F42",
      }}
    >
      {messageType === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      {messageType === "success" && <MailCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
}

export default function VerifiedAccessGate({ title, description, nextHref }: VerifiedAccessGateProps) {
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
    <div className="py-6" style={{ borderTop: "1px solid rgba(245,243,239,0.09)" }}>
      <GateHeader title={title} description={description} />
      <GateMessage message={message} messageType={messageType} />

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
        >
          <MailCheck className="w-4 h-4" />
          {sending ? "Resending..." : "Resend verification email"}
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors disabled:opacity-60"
          style={{ borderColor: "rgba(245,243,239,0.14)" }}
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "I verified my email"}
        </button>
      </div>
    </div>
  );
}
