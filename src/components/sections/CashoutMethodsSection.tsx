import { MotionWrap } from "@/components/PremiumUi";
import { Wallet, Gift, Coffee, Gamepad2, CreditCard, Bitcoin, Coins } from "lucide-react";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const VIOLET = "#6C5CE0";

// Real icons, not emoji -- emoji-as-UI-iconography is banned per
// packages/tokens/tokens.json meta.antiPatterns.
const METHODS = [
  { name: "PayPal", icon: Wallet, detail: "Instant transfer", badge: "Most popular" },
  { name: "Amazon Gift Card", icon: Gift, detail: "+2% bonus", badge: "Bonus" },
  { name: "Tim Hortons", icon: Coffee, detail: "+3% bonus", badge: "Bonus" },
  { name: "Steam", icon: Gamepad2, detail: "+1% bonus", badge: "Bonus" },
  { name: "Visa Prepaid", icon: CreditCard, detail: "+1% bonus", badge: "Bonus" },
  { name: "Bitcoin", icon: Bitcoin, detail: "Crypto wallet", badge: null },
  { name: "Litecoin", icon: Coins, detail: "Crypto wallet", badge: null },
];

export function CashoutMethodsSection() {
  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: "#0A0A0D" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MotionWrap>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: GOLD_BRIGHT }}>Payout Methods</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5F3EF] sm:text-4xl">
              Cash out your way
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-[rgba(245,243,239,0.5)]">
              Choose from 7+ payout methods. Gift cards earn bonus coins.
            </p>
          </div>
        </MotionWrap>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {METHODS.map((method, i) => {
            const Icon = method.icon;
            return (
              <MotionWrap key={method.name} delay={i * 0.05}>
                <div className="group relative text-center">
                  {method.badge && (
                    <span
                      className="absolute -top-2 right-1/2 translate-x-8 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: method.badge === "Bonus" ? `${GOLD}26` : `${VIOLET}26`,
                        color: method.badge === "Bonus" ? GOLD_BRIGHT : VIOLET,
                      }}
                    >
                      {method.badge}
                    </span>
                  )}
                  <Icon className="mx-auto w-7 h-7 transition-transform group-hover:-translate-y-0.5" style={{ color: GOLD }} />
                  <p className="mt-3 text-sm font-bold text-[#F5F3EF]">{method.name}</p>
                  <p className="mt-0.5 text-xs text-[rgba(245,243,239,0.4)]">{method.detail}</p>
                </div>
              </MotionWrap>
            );
          })}
        </div>

        <MotionWrap delay={0.3}>
          <div className="mt-10 flex items-center justify-center gap-3 py-4" style={{ borderTop: "1px solid rgba(245,243,239,0.09)", borderBottom: "1px solid rgba(245,243,239,0.09)" }}>
            <span className="text-sm font-bold text-[rgba(245,243,239,0.68)]">Minimum $5</span>
            <span className="h-4 w-px" style={{ background: "rgba(245,243,239,0.14)" }} />
            <span className="text-sm font-bold text-[rgba(245,243,239,0.68)]">Paid within 24hrs</span>
            <span className="h-4 w-px" style={{ background: "rgba(245,243,239,0.14)" }} />
            <span className="text-sm font-bold" style={{ color: GOLD_BRIGHT }}>Zero fees</span>
          </div>
        </MotionWrap>
      </div>
    </section>
  );
}
