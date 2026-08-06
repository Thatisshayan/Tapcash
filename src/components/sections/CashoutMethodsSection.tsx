import { MotionWrap } from "@/components/PremiumUi";

const METHODS = [
  { name: "PayPal", icon: "💰", detail: "Instant transfer", badge: "Most popular" },
  { name: "Amazon Gift Card", icon: "🎁", detail: "+2% bonus", badge: "Bonus" },
  { name: "Tim Hortons", icon: "☕", detail: "+3% bonus", badge: "Bonus" },
  { name: "Steam", icon: "🎮", detail: "+1% bonus", badge: "Bonus" },
  { name: "Visa Prepaid", icon: "💳", detail: "+1% bonus", badge: "Bonus" },
  { name: "Bitcoin", icon: "₿", detail: "Crypto wallet", badge: null },
  { name: "Litecoin", icon: "Ł", detail: "Crypto wallet", badge: null },
];

export function CashoutMethodsSection() {
  return (
    <section className="relative overflow-hidden bg-[#040913] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MotionWrap>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#00e6c3]">Payout Methods</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Cash out your way
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-zinc-400">
              Choose from 8+ payout methods. Gift cards earn bonus coins.
            </p>
          </div>
        </MotionWrap>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METHODS.map((method, i) => (
            <MotionWrap key={method.name} delay={i * 0.05}>
              <div className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center transition-all hover:border-[#00e6c3]/30 hover:bg-white/[0.06]">
                {method.badge && (
                  <span className={`absolute -top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    method.badge === "Bonus"
                      ? "bg-amber-400/20 text-amber-300"
                      : method.badge === "Canada"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-[#00e6c3]/20 text-[#00e6c3]"
                  }`}>
                    {method.badge}
                  </span>
                )}
                <span className="text-3xl">{method.icon}</span>
                <p className="mt-2 text-sm font-bold text-white">{method.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{method.detail}</p>
              </div>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap delay={0.3}>
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-white/6 bg-white/[0.02] px-6 py-4">
            <span className="text-sm font-bold text-zinc-300">Minimum $5</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-sm font-bold text-zinc-300">Paid within 24hrs</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-sm font-bold text-[#00e6c3]">Zero fees</span>
          </div>
        </MotionWrap>
      </div>
    </section>
  );
}
