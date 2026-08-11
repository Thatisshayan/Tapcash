"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Coins, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { formatCoins, formatCadFromCoins } from "@shared/tapcash-content";
import { MotionWrap } from "@/components/PremiumUi";

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
  audience: string;
};

// NOTE: "interac" is intentionally kept in this list (data + validation +
// submit path all still work) but filtered out of what actually renders,
// via VISIBLE_METHODS below. Interac e-Transfer is under a standing product
// freeze -- see docs/governance/DEFERRED_WORK.md -- so it must not be
// selectable in the UI, but the code path stays intact rather than deleted.
const ALL_METHODS: PayoutMethod[] = [
  { id: "paypal", label: "PayPal", subtitle: "Fastest mainstream cashout", minCoins: 5000, eta: "Usually under 24h", audience: "Most users" },
  { id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", minCoins: 5000, eta: "Manual review window", audience: "Canadian users" },
  { id: "bitcoin", label: "Bitcoin", subtitle: "Direct crypto payout", minCoins: 10000, eta: "Queue based", audience: "Crypto users" },
  { id: "litecoin", label: "Litecoin", subtitle: "Lower-fee crypto option", minCoins: 10000, eta: "Queue based", audience: "Crypto users" },
  { id: "tremendous", label: "Gift Cards", subtitle: "Steam, Tim Hortons, and more", minCoins: 5000, eta: "Processed manually", audience: "Light redeemers" },
  { id: "visa", label: "Visa Gift Card", subtitle: "Prepaid virtual Visa card", minCoins: 5000, eta: "Processed manually", audience: "Gift card users" },
  { id: "steam", label: "Steam Gift Card", subtitle: "For your gaming library", minCoins: 5000, eta: "Processed manually", audience: "Gamers" },
  { id: "roblox", label: "Roblox", subtitle: "Robux gift card delivery", minCoins: 5000, eta: "Processed manually", audience: "Gamers" },
  { id: "tim_hortons", label: "Tim Hortons", subtitle: "Coffee & donuts on us", minCoins: 5000, eta: "Processed manually", audience: "Canadians" },
  { id: "canadian_tire", label: "Canadian Tire", subtitle: "Shop Canadian Tire rewards", minCoins: 5000, eta: "Processed manually", audience: "Shoppers" },
  { id: "cineplex", label: "Cineplex", subtitle: "Movie night on TapCash", minCoins: 5000, eta: "Processed manually", audience: "Movie lovers" },
  { id: "shoppers", label: "Shoppers Drug Mart", subtitle: "Pharmacy & beauty rewards", minCoins: 5000, eta: "Processed manually", audience: "Canadians" },
];

const VISIBLE_METHODS = ALL_METHODS.filter((m) => m.id !== "interac");

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
  // Stable idempotency key per submit attempt. Reused across retries of the
  // SAME attempt so the payout API dedupes (prevents double-payout on Retry).
  const idempotencyKeyRef = useRef<string>("");
  // 429 cooldown: disables Retry for 60s after a rate-limit, matching the
  // error message and the API's 3-requests-per-60s limit.
  const [retryDisabledUntil, setRetryDisabledUntil] = useState(0);
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0);

  useEffect(() => {
    if (retryDisabledUntil <= Date.now()) {
      setRetrySecondsLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((retryDisabledUntil - Date.now()) / 1000));
      setRetrySecondsLeft(left);
      if (left <= 0) clearInterval(id);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [retryDisabledUntil]);

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
        const response = await fetch("/api/ledger/summary", {
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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit || !user || submitting) return;

    // Generate a fresh idempotency key for this user-initiated attempt.
    // It stays stable across Retry clicks (see idempotencyKeyRef) so the
    // payout API treats repeats of the same attempt as duplicates instead
    // of charging twice.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `${user.uid}_${crypto.randomUUID()}`;
    }

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
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Respect the 60s rate-limit window before allowing another attempt.
          setRetryDisabledUntil(Date.now() + 60_000);
        }
        setSubmitError({ status: res.status, message: data.error || "Request failed" });
        setSubmitting(false);
        return;
      }

      // Success: clear the key so the next submit is a genuinely new attempt.
      idempotencyKeyRef.current = "";

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
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#D9B678]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
        <Navbar />
        <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <MotionWrap className="w-full text-center space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Payout store</p>
            <h1 className="text-3xl font-black tracking-tight text-[#F5F3EF] md:text-4xl">Sign in to review cashout options</h1>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)] md:text-base">
              The payout store is private because the balance and withdrawal queue are user-specific.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black text-[#0A0A0D] transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #F0CE97, #D9B678)", boxShadow: "0 10px 30px rgba(217,182,120,0.28)" }}
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="text-sm font-bold text-[rgba(245,243,239,0.68)] transition-colors hover:text-[#F5F3EF]">
                Back home
              </Link>
            </div>
          </MotionWrap>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Hero -- de-boxed: spacing + typography hierarchy, no card chrome */}
        <MotionWrap>
          <div
            className="relative pb-8"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 0%, rgba(217,182,120,0.07), transparent 45%)",
            }}
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D9B678]">Payout store</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-[#F5F3EF] sm:text-4xl">
              Request a payout
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[rgba(245,243,239,0.68)] sm:text-base">
              Select a method, enter your details, and submit your withdrawal request.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-x-12 gap-y-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Balance</p>
                <p className="mt-2 font-mono text-3xl font-black tabular-nums text-[#F5F3EF] sm:text-4xl">{formatCoins(balanceCoins)}</p>
                <p className="mt-1 font-mono text-sm tabular-nums text-[rgba(245,243,239,0.45)]">{formatCadFromCoins(balanceCoins)}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Pending</p>
                <p className="mt-2 font-mono text-3xl font-black tabular-nums text-[rgba(245,243,239,0.68)] sm:text-4xl">{formatCoins(pendingCoins)}</p>
                <p className="mt-1 text-sm text-[rgba(245,243,239,0.45)]">Queued for review</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link href="/cashout/status" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D9B678] transition-colors hover:text-[#F0CE97]">
                Check payout status <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/dashboard" className="text-sm font-bold text-[rgba(245,243,239,0.45)] transition-colors hover:text-[#F5F3EF]">
                Back to dashboard
              </Link>
            </div>
          </div>
        </MotionWrap>

        <form onSubmit={handleSubmit}>
          <div className="mt-10">
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.26em] text-[rgba(245,243,239,0.45)]">Select payout method</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VISIBLE_METHODS.map((method, index) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <MotionWrap key={method.id} delay={index * 0.02}>
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect(method.id)}
                      whileHover={{ scale: reduceMotion ? 1 : 1.015 }}
                      whileTap={{ scale: reduceMotion ? 1 : 0.985 }}
                      animate={{ scale: isSelected && !reduceMotion ? 1.02 : 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-full rounded-2xl p-5 text-left transition-colors duration-200"
                      style={{
                        background: isSelected ? "rgba(217,182,120,0.06)" : "rgba(245,243,239,0.025)",
                        boxShadow: isSelected ? "0 0 0 1px rgba(217,182,120,0.35), 0 12px 30px rgba(217,182,120,0.16)" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#6C5CE0]">{method.audience}</p>
                          <h2 className="mt-3 text-lg font-black text-[#F5F3EF]">{method.label}</h2>
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 shrink-0 text-[#D9B678]" />}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[rgba(245,243,239,0.45)]">{method.subtitle}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-[rgba(245,243,239,0.09)] pt-3 text-sm">
                        <span className="text-[rgba(245,243,239,0.45)]">Min</span>
                        <span className="font-mono font-semibold tabular-nums text-[#F5F3EF]">{formatCoins(method.minCoins)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-sm">
                        <span className="text-[rgba(245,243,239,0.45)]">Timing</span>
                        <span className="font-semibold text-[#F5F3EF]">{method.eta}</span>
                      </div>
                    </motion.button>
                  </MotionWrap>
                );
              })}
            </div>
          </div>

          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-8"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Destination</p>
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
                  className="mt-3 w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                />
                {destinationError && (
                  <p className="mt-2 text-xs text-[#FF2F42]">{destinationError}</p>
                )}
              </div>

              {selectedMethod === "interac" && (
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Interac Security Details</p>
                  <div>
                    <input
                      type="text"
                      value={interacQuestion}
                      onChange={(e) => { setInteracQuestion(e.target.value); setInteracQuestionError(null); }}
                      onBlur={() => { if (interacQuestion.trim()) setInteracQuestionError(validateField("interacQuestion", interacQuestion)); }}
                      placeholder="Security question (min 10 chars)"
                      className="w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                    />
                    {interacQuestionError && <p className="mt-1 text-xs text-[#FF2F42]">{interacQuestionError}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={interacAnswer}
                      onChange={(e) => { setInteracAnswer(e.target.value); setInteracAnswerError(null); }}
                      onBlur={() => { if (interacAnswer.trim()) setInteracAnswerError(validateField("interacAnswer", interacAnswer)); }}
                      placeholder="Security answer (alphanumeric, no spaces, 6-25 chars)"
                      className="w-full border-b border-[rgba(245,243,239,0.14)] bg-transparent px-1 py-3 text-sm text-[#F5F3EF] placeholder:text-[rgba(245,243,239,0.28)] focus:border-[#D9B678] focus:outline-none transition-colors"
                    />
                    {interacAnswerError && <p className="mt-1 text-xs text-[#FF2F42]">{interacAnswerError}</p>}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Amount</p>
                <div className="mt-3 flex items-center gap-3 border-b border-[rgba(245,243,239,0.14)] focus-within:border-[#D9B678] transition-colors">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter coins"
                    min={minAmount}
                    max={maxAmount}
                    className="flex-1 bg-transparent px-1 py-3 font-mono text-sm tabular-nums text-[#F5F3EF] placeholder:font-sans placeholder:text-[rgba(245,243,239,0.28)] focus:outline-none"
                  />
                  <span className="pb-3 text-sm font-semibold text-[rgba(245,243,239,0.45)]">coins</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-[rgba(245,243,239,0.45)]">Value:</span>
                  <span className="font-mono font-black tabular-nums text-[#D9B678]">${cadValue} CAD</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickSelect(pct)}
                      className="flex-1 rounded-full px-3 py-2 text-xs font-bold text-[rgba(245,243,239,0.68)] transition-colors hover:bg-[rgba(217,182,120,0.08)] hover:text-[#F0CE97]"
                    >
                      {pct === 100 ? "All" : `${pct}%`}
                    </button>
                  ))}
                </div>
                {amountError && <p className="mt-2 text-xs text-[#FF2F42]">{amountError}</p>}
                <div className="mt-3 flex items-center justify-between font-mono text-xs tabular-nums text-[rgba(245,243,239,0.45)]">
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
              className="mt-8 flex items-start gap-3 rounded-2xl p-4"
              style={{ background: "rgba(255,47,66,0.08)" }}
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-[#FF2F42]" />
              <div className="flex-1">
                <p className="text-sm text-[#ffb3ba]">{errorMessage}</p>
                {submitError?.status === 429 && (
                  <button
                    type="button"
                    disabled={retrySecondsLeft > 0}
                    onClick={() => { setSubmitError(null); void handleSubmit(); }}
                    className="mt-2 text-xs font-bold text-[#D9B678] hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                  >
                    {retrySecondsLeft > 0 ? `Retry available in ${retrySecondsLeft}s` : "Retry"}
                  </button>
                )}
                {submitError?.status === 500 && (
                  <button
                    type="button"
                    onClick={() => { setSubmitError(null); void handleSubmit(); }}
                    className="mt-2 text-xs font-bold text-[#D9B678] hover:underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="submit"
              disabled={!canSubmit || submitting}
              whileHover={canSubmit && !submitting ? { scale: 1.02 } : undefined}
              whileTap={canSubmit && !submitting ? { scale: 0.98 } : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-black transition-all duration-200"
              style={
                canSubmit && !submitting
                  ? { background: "linear-gradient(135deg, #F0CE97, #D9B678)", color: "#0A0A0D", boxShadow: "0 12px 30px rgba(217,182,120,0.4)" }
                  : { background: "rgba(245,243,239,0.04)", color: "rgba(245,243,239,0.3)" }
              }
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><ArrowRight className="h-4 w-4" /> Request Payout</>
              )}
            </motion.button>
            <a
              href="/cashout/status"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-black text-[#F5F3EF] transition-colors hover:text-[#D9B678]"
            >
              View payout history <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </form>

        <MotionWrap>
          <div className="mt-14 border-t border-[rgba(245,243,239,0.09)] pt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[rgba(245,243,239,0.45)]">Verification model</p>
                <h2 className="mt-2 text-2xl font-black text-[#F5F3EF]">Server-approved, not client-pretend.</h2>
              </div>
              <Coins className="h-6 w-6 shrink-0 text-[#D9B678]" />
            </div>
            <div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-3">
              {["Sensitive actions stay ledger-backed.", "The queue is visible before you request a payout.", "Users can review the status flow from one place."].map((point) => (
                <p key={point} className="text-sm leading-relaxed text-[rgba(245,243,239,0.68)]">
                  {point}
                </p>
              ))}
            </div>
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
