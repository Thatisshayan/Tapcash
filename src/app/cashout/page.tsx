"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Coins, Loader2, Sparkles, Wallet, ArrowRight, AlertCircle, CheckCircle, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { accentClass, formatCoins, formatCadFromCoins } from "@shared/tapcash-content";
import { CTAButton, MotionWrap, PageShell, StatCard } from "@/components/PremiumUi";

type LedgerSummaryResponse = {
  balanceCoins?: number;
  pendingCoins?: number;
};

type PayoutMethod = {
  id: string;
  label: string;
  subtitle: string;
  minCoins: number;
  eta: string;
  accent: "teal" | "blue" | "gold";
  audience: string;
};

const ALL_METHODS: PayoutMethod[] = [
  { id: "paypal", label: "PayPal", subtitle: "Fastest mainstream cashout", minCoins: 5000, eta: "Usually under 24h", accent: "teal", audience: "Most users" },
  { id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", minCoins: 5000, eta: "Manual review window", accent: "blue", audience: "Canadian users" },
  { id: "bitcoin", label: "Bitcoin", subtitle: "Direct crypto payout", minCoins: 10000, eta: "Queue based", accent: "gold", audience: "Crypto users" },
  { id: "litecoin", label: "Litecoin", subtitle: "Lower-fee crypto option", minCoins: 10000, eta: "Queue based", accent: "gold", audience: "Crypto users" },
  { id: "tremendous", label: "Gift Cards", subtitle: "Steam, Tim Hortons, and more", minCoins: 5000, eta: "Processed manually", accent: "teal", audience: "Light redeemers" },
  { id: "visa", label: "Visa Gift Card", subtitle: "Prepaid virtual Visa card", minCoins: 5000, eta: "Processed manually", accent: "teal", audience: "Gift card users" },
  { id: "steam", label: "Steam Gift Card", subtitle: "For your gaming library", minCoins: 5000, eta: "Processed manually", accent: "blue", audience: "Gamers" },
  { id: "roblox", label: "Roblox", subtitle: "Robux gift card delivery", minCoins: 5000, eta: "Processed manually", accent: "blue", audience: "Gamers" },
  { id: "tim_hortons", label: "Tim Hortons", subtitle: "Coffee & donuts on us", minCoins: 5000, eta: "Processed manually", accent: "gold", audience: "Canadians" },
  { id: "canadian_tire", label: "Canadian Tire", subtitle: "Shop Canadian Tire rewards", minCoins: 5000, eta: "Processed manually", accent: "gold", audience: "Shoppers" },
  { id: "cineplex", label: "Cineplex", subtitle: "Movie night on TapCash", minCoins: 5000, eta: "Processed manually", accent: "teal", audience: "Movie lovers" },
  { id: "shoppers", label: "Shoppers Drug Mart", subtitle: "Pharmacy & beauty rewards", minCoins: 5000, eta: "Processed manually", accent: "teal", audience: "Canadians" },
];

type ApiError = {
  status: number;
  message: string;
};

function getDestinationConfig(methodId: string): { label: string; type: string; placeholder: string; validate?: (v: string) => string | null } {
  switch (methodId) {
    case "paypal":
    case "interac":
      return { label: "Email address", type: "email", placeholder: "your@email.com", validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address" };
    case "tremendous":
    case "visa":
    case "steam":
    case "roblox":
    case "tim_hortons":
    case "canadian_tire":
    case "cineplex":
    case "shoppers":
      return { label: "Email to receive code", type: "email", placeholder: "your@email.com", validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address" };
    case "bitcoin":
      return { label: "Bitcoin wallet address", type: "text", placeholder: "bc1... or 1...", validate: (v) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v) ? null : "Enter a valid Bitcoin address" };
    case "litecoin":
      return { label: "Litecoin wallet address", type: "text", placeholder: "L... or M...", validate: (v) => /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(v) ? null : "Enter a valid Litecoin address" };
    default:
      return { label: "Destination", type: "text", placeholder: "Enter destination" };
  }
}

function generateFingerprint(): string {
  const parts: string[] = [];
  if (typeof navigator !== "undefined") {
    parts.push(navigator.userAgent || "");
    parts.push(navigator.language || "");
    parts.push(String(screen.width));
    parts.push(String(screen.height));
    parts.push(String(screen.colorDepth));
    parts.push(navigator.platform || "");
  }
  if (typeof window !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("tapcash-fp", 2, 15);
      parts.push(canvas.toDataURL());
    }
  }
  const raw = parts.join("|||");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return "fp_" + Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
}

export default function CashoutPage() {
  const { user, loading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [summary, setSummary] = useState<LedgerSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [interacQuestion, setInteracQuestion] = useState("");
  const [interacAnswer, setInteracAnswer] = useState("");
  const [interacQuestionError, setInteracQuestionError] = useState<string | null>(null);
  const [interacAnswerError, setInteracAnswerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");

  const motionProps = useMemo(
    () => ({
      initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [reduceMotion]
  );

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    let cancelled = false;

    async function loadSummary() {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/debug/ledger-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = (await response.json()) as LedgerSummaryResponse;
          if (!cancelled) setSummary(data);
        }
      } catch {
        console.error("Failed to load cashout summary:");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    setDeviceFingerprint(generateFingerprint());
  }, []);

  const balanceCoins = summary?.balanceCoins ?? 0;
  const pendingCoins = summary?.pendingCoins ?? 0;
  const selectedMethodData = ALL_METHODS.find((m) => m.id === selectedMethod);
  const destConfig = selectedMethod ? getDestinationConfig(selectedMethod) : null;
  const minAmount = selectedMethodData?.minCoins ?? 2000;
  const maxAmount = balanceCoins;
  const numAmount = amountStr ? parseInt(amountStr, 10) : 0;
  const amountValid = numAmount >= minAmount && numAmount <= maxAmount;
  const cadValue = amountValid ? (numAmount / 1000).toFixed(2) : "0.00";

  const validateField = useCallback((field: string, value: string): string | null => {
    if (field === "destination" && destConfig?.validate) {
      return destConfig.validate(value);
    }
    if (field === "interacQuestion") {
      if (value.trim().length < 10) return "Security question must be at least 10 characters.";
      if (value.trim().length > 100) return "Security question must not exceed 100 characters.";
      return null;
    }
    if (field === "interacAnswer") {
      const clean = value.trim();
      if (clean.length < 6) return "Security answer must be at least 6 characters.";
      if (clean.length > 25) return "Security answer must not exceed 25 characters.";
      if (clean.includes(" ")) return "Security answer cannot contain spaces.";
      if (!/^[a-zA-Z0-9]+$/.test(clean)) return "Security answer must be alphanumeric only.";
      return null;
    }
    return null;
  }, [destConfig]);

  const handleAmountChange = (v: string) => {
    setAmountStr(v);
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 0) {
      setAmountError("Enter a valid number");
    } else if (n < minAmount) {
      setAmountError(`Minimum is ${formatCoins(minAmount)}`);
    } else if (n > maxAmount) {
      setAmountError(`Maximum is ${formatCoins(maxAmount)}`);
    } else {
      setAmountError(null);
    }
  };

  const handleQuickSelect = (percent: number) => {
    const val = Math.floor((maxAmount * percent) / 100);
    setAmountStr(String(val));
    setAmountError(null);
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setDestination("");
    setDestinationError(null);
    setInteracQuestion("");
    setInteracAnswer("");
    setInteracQuestionError(null);
    setInteracAnswerError(null);
    setSubmitError(null);
  };

  const canSubmit =
    selectedMethod &&
    destination.trim() &&
    !destinationError &&
    amountValid &&
    !amountError &&
    (selectedMethod !== "interac" || (interacQuestion.trim() && interacAnswer.trim() && !interacQuestionError && !interacAnswerError));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !user || submitting) return;

    const destErr = destConfig?.validate ? destConfig.validate(destination) : null;
    if (destErr) { setDestinationError(destErr); return; }

    if (selectedMethod === "interac") {
      const qErr = validateField("interacQuestion", interacQuestion);
      const aErr = validateField("interacAnswer", interacAnswer);
      if (qErr) { setInteracQuestionError(qErr); return; }
      if (aErr) { setInteracAnswerError(aErr); return; }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = await user.getIdToken();
      const body: Record<string, unknown> = {
        amountCoins: numAmount,
        method: selectedMethod,
        destination: destination.trim().toLowerCase(),
        deviceFingerprint,
      };
      if (selectedMethod === "interac") {
        body.interacSecurityQuestion = interacQuestion.trim();
        body.interacSecurityAnswer = interacAnswer.trim();
      }

      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError({ status: res.status, message: data.error || "Request failed" });
        setSubmitting(false);
        return;
      }

      window.location.href = "/cashout/status";
    } catch {
      setSubmitError({ status: 0, message: "Network error. Please check your connection and try again." });
      setSubmitting(false);
    }
  }

  const errorMessage = submitError
    ? submitError.status === 400
      ? submitError.message
      : submitError.status === 403
        ? submitError.message
        : submitError.status === 429
          ? "Too many requests. Please wait 60 seconds before trying again."
          : submitError.status === 500
            ? "Server error. Please try again later."
            : submitError.message
    : null;

  if (authLoading || (user && loading && !summary)) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#00e6c3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#040913] text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <MotionWrap>
            <PageShell eyebrow="Payout store" title="Sign in to review cashout options" description="The payout store is private because the balance and withdrawal queue are user-specific.">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <CTAButton href="/auth/signin" label="Sign in" />
                <CTAButton href="/" label="Back home" variant="secondary" />
              </div>
            </PageShell>
          </MotionWrap>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040913] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <MotionWrap>
          <PageShell
            eyebrow="Payout store"
            title="Request a payout"
            description="Select a method, enter your details, and submit your withdrawal request."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Balance" value={formatCoins(balanceCoins)} detail={formatCadFromCoins(balanceCoins)} />
              <StatCard label="Pending" value={formatCoins(pendingCoins)} detail="Queued for review" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/cashout/status" label="Check payout status" />
              <CTAButton href="/dashboard" label="Back to dashboard" variant="secondary" />
            </div>
          </PageShell>
        </MotionWrap>

        <form onSubmit={handleSubmit}>
          <div className="mt-8">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8cf8e9] mb-4">Select payout method</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_METHODS.map((method, index) => {
                const classes = accentClass(method.accent);
                const isSelected = selectedMethod === method.id;
                return (
                  <MotionWrap key={method.id} delay={index * 0.02}>
                    <button
                      type="button"
                      onClick={() => handleMethodSelect(method.id)}
                      className={`w-full text-left rounded-[1.75rem] border p-5 transition-all duration-200 ${
                        isSelected
                          ? `${classes.ring} bg-white/[0.06] ${classes.glow} ring-2 ring-[#00e6c3]`
                          : `${classes.ring} bg-white/[0.03] hover:bg-white/[0.05]`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${classes.badge}`}>
                            {method.audience}
                          </div>
                          <h2 className="mt-4 text-lg font-black text-white">{method.label}</h2>
                        </div>
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-[#00e6c3]" />
                        ) : (
                          <BadgeCheck className="h-5 w-5 text-[#8cf8e9]" />
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{method.subtitle}</p>
                      <div className="mt-4 space-y-2 border-t border-white/6 pt-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Minimum</span>
                          <span className="font-semibold text-white">{formatCoins(method.minCoins)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Timing</span>
                          <span className="font-semibold text-white">{method.eta}</span>
                        </div>
                      </div>
                    </button>
                  </MotionWrap>
                );
              })}
            </div>
          </div>

          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Destination</p>
                <input
                  type={destConfig?.type || "text"}
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setDestinationError(null);
                  }}
                  onBlur={() => {
                    if (destination.trim() && destConfig?.validate) {
                      setDestinationError(destConfig.validate(destination));
                    }
                  }}
                  placeholder={destConfig?.placeholder || ""}
                  className="mt-3 w-full rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 transition-colors"
                />
                {destinationError && (
                  <p className="mt-2 text-xs text-red-400">{destinationError}</p>
                )}
              </div>

              {selectedMethod === "interac" && (
                <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Interac Security Details</p>
                  <div>
                    <input
                      type="text"
                      value={interacQuestion}
                      onChange={(e) => { setInteracQuestion(e.target.value); setInteracQuestionError(null); }}
                      onBlur={() => { if (interacQuestion.trim()) setInteracQuestionError(validateField("interacQuestion", interacQuestion)); }}
                      placeholder="Security question (min 10 chars)"
                      className="w-full rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 transition-colors"
                    />
                    {interacQuestionError && <p className="mt-1 text-xs text-red-400">{interacQuestionError}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={interacAnswer}
                      onChange={(e) => { setInteracAnswer(e.target.value); setInteracAnswerError(null); }}
                      onBlur={() => { if (interacAnswer.trim()) setInteracAnswerError(validateField("interacAnswer", interacAnswer)); }}
                      placeholder="Security answer (alphanumeric, no spaces, 6-25 chars)"
                      className="w-full rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 transition-colors"
                    />
                    {interacAnswerError && <p className="mt-1 text-xs text-red-400">{interacAnswerError}</p>}
                  </div>
                </div>
              )}

              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Amount</p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter coins"
                    min={minAmount}
                    max={maxAmount}
                    className="flex-1 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00e6c3]/40 transition-colors"
                  />
                  <span className="text-sm font-semibold text-zinc-400">coins</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-zinc-500">Value:</span>
                  <span className="font-black text-[#00e6c3]">${cadValue} CAD</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickSelect(pct)}
                      className="flex-1 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      {pct === 100 ? "All" : `${pct}%`}
                    </button>
                  ))}
                </div>
                {amountError && <p className="mt-2 text-xs text-red-400">{amountError}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Min: {formatCoins(minAmount)}</span>
                  <span>Max: {formatCoins(maxAmount)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-4"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div className="flex-1">
                <p className="text-sm text-red-200">{errorMessage}</p>
                {submitError?.status === 429 && (
                  <button
                    type="button"
                    onClick={() => handleSubmit}
                    className="mt-2 text-xs font-bold text-[#00e6c3] hover:underline"
                  >
                    Retry
                  </button>
                )}
                {submitError?.status === 500 && (
                  <button
                    type="button"
                    onClick={() => { setSubmitError(null); handleSubmit; }}
                    className="mt-2 text-xs font-bold text-[#00e6c3] hover:underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-black transition-all ${
                canSubmit && !submitting
                  ? "bg-gradient-to-r from-[#00e6c3] to-[#3a7bff] text-[#050816] hover:shadow-[0_18px_50px_rgba(0,230,195,0.25)] hover:-translate-y-0.5"
                  : "bg-white/[0.04] text-zinc-500 cursor-not-allowed border border-white/8"
              }`}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><ArrowRight className="h-4 w-4" /> Request Payout</>
              )}
            </button>
            <CTAButton href="/cashout/status" label="View payout history" variant="secondary" />
          </div>
        </form>

        <MotionWrap>
          <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Verification model</p>
                <h2 className="mt-2 text-2xl font-black text-white">Server-approved, not client-pretend.</h2>
              </div>
              <Coins className="h-6 w-6 text-[#f5c842]" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["Sensitive actions stay ledger-backed.", "The queue is visible before you request a payout.", "Users can review the status flow from one place."].map((point) => (
                <div key={point} className="rounded-2xl border border-white/6 bg-black/15 px-4 py-3 text-sm text-zinc-300">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
