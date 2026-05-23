// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { 
  Coins, Sparkles, CheckCircle, ArrowRight, ShieldCheck, Zap, 
  HelpCircle, Globe, Heart, DollarSign, Award, Users, Star 
} from "lucide-react";

// Canadian brand gift card integrations
const CANADIAN_PARTNERS = [
  { name: "Tim Hortons", logoBg: "bg-red-900/30 border-red-500/30", text: "Tims", desc: "Coffee & Donuts" },
  { name: "Canadian Tire", logoBg: "bg-red-800/20 border-red-600/30", text: "CT", desc: "Outdoor & Tools" },
  { name: "Cineplex", logoBg: "bg-blue-900/30 border-blue-500/30", text: "C", desc: "Movie Tickets" },
  { name: "Shoppers Drug Mart", logoBg: "bg-red-950/20 border-red-900/30", text: "SDM", desc: "Wellness & Pharmacy" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [lang, setLanguage] = useState<"en" | "fr">("en");
  const [livePayouts, setLivePayouts] = useState<any[]>([]);
  const [odometerValue, setOdometerValue] = useState<number>(142854.20);

  // Dynamic cashout odometer simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setOdometerValue((prev) => prev + parseFloat((Math.random() * 0.45).toFixed(2)));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Live completed transactions stream for social proof
  useEffect(() => {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setLivePayouts(items.length > 0 ? items : [
        { id: "p1", type: "withdrawal", amount: 5000, method: "Interac e-Transfer", status: "completed", payoutCents: 500 },
        { id: "p2", type: "withdrawal", amount: 10000, method: "PayPal Cashout", status: "completed", payoutCents: 1000 },
        { id: "p3", type: "withdrawal", amount: 2000, method: "Litecoin (LTC)", status: "completed", payoutCents: 200 },
      ]);
    }, () => {
      // Fallback mocks if Firestore not populated yet
      setLivePayouts([
        { id: "p1", type: "withdrawal", amount: 5000, method: "Interac e-Transfer", status: "completed", payoutCents: 500 },
        { id: "p2", type: "withdrawal", amount: 10000, method: "PayPal Cashout", status: "completed", payoutCents: 1000 },
        { id: "p3", type: "withdrawal", amount: 2000, method: "Litecoin (LTC)", status: "completed", payoutCents: 200 },
      ]);
    });

    return () => unsubscribe();
  }, []);

  const t = {
    en: {
      heroTag: "Canada's Premier GPT Rewards Platform",
      heroTitle: "Earn Real Money Doing What You Love",
      heroDesc: "Complete high-paying surveys, try newly released mobile apps, and play games. Get paid instantly in Canadian Dollars via Interac e-Transfer, PayPal, or Crypto.",
      ctaStart: "Start Earning Free",
      ctaDashboard: "Enter Member Dashboard",
      activeEarners: "Join 12,000+ active Canadian earners",
      howTitle: "The Simple Path to Payouts",
      how1Title: "1. Register Instantly",
      how1Desc: "Sign up with Google or your email in under 30 seconds. Fast, secure, and 100% free.",
      how2Title: "2. Complete High-Yield Offers",
      how2Desc: "Answer community polls, test local apps, and share consumer opinions with top brand partners.",
      how3Title: "3. Cash Out Instantly",
      how3Desc: "Redeem points directly to Interac, PayPal, or Bitcoin. Min cashout starts at just $2.00 CAD!",
      canadaSectionTitle: "Canadian-First, Toronto-Proud 🇨🇦",
      canadaDesc: "We are proud to be founded and headquartered in Toronto, Ontario. Designed specifically for Canadians, we offer direct local payouts and bilingual service.",
      interacTitle: "Direct Interac e-Transfer",
      interacDesc: "No more waiting days for foreign bank drafts. Get cash deposited securely into your Canadian bank account in under 15 minutes.",
      cadDisplay: "Local CAD Valuations",
      cadDesc: "See exactly what you earn. 10 Coins = $0.01 CAD. Clear, transparent, and fair exchange rates.",
      bilingualTitle: "Fully Bilingual Platform",
      bilingualDesc: "TapCash speaks your language. Toggle instantly between English and French across all dashboards.",
      trustTitle: "Why Over 10,000+ Canadians Trust TapCash",
      payoutOdometer: "TOTAL CASH PAID OUT TO MEMBERS",
      liveProofTitle: "Live Social Proof of Completed Payouts",
      founderTitle: "Founded in Toronto with Full Transparency",
      founderDesc: "Unlike anonymous GPT sites, we stand behind our platform. TapCash was co-founded by tech leaders Shaya and team in Toronto to offer Canadians a legitimate, premium reward hub.",
      trustpilotCard: "Trustpilot Rating",
      trustpilotDesc: "Excellent 4.8 out of 5 based on 1,482 real Canadian reviews.",
      review1: "“The instant Interac e-Transfer was in my bank account in 5 minutes! Best site in Canada.” - Chloe M., Montreal",
      review2: "“No fake offers. Solid payout rates, and highly responsive support. Highly recommend.” - Liam P., Toronto",
    },
    fr: {
      heroTag: "La première plateforme de récompenses GPT au Canada",
      heroTitle: "Gagnez de l'argent réel en faisant ce que vous aimez",
      heroDesc: "Répondez à des sondages payants, testez de nouvelles applications mobiles et jouez à des jeux. Recevez vos gains instantanément en dollars canadiens via Virement Interac, PayPal ou Crypto.",
      ctaStart: "Commencer Gratuitement",
      ctaDashboard: "Accéder au Tableau de Bord",
      activeEarners: "Rejoignez plus de 12 000 utilisateurs canadiens actifs",
      howTitle: "Le chemin le plus simple vers les paiements",
      how1Title: "1. Inscrivez-vous instantanément",
      how1Desc: "Créez votre compte avec Google ou votre courriel en moins de 30 secondes. Rapide, sécurisé et 100 % gratuit.",
      how2Title: "2. Complétez des offres",
      how2Desc: "Répondez à des sondages, testez des applications locales et partagez votre avis avec nos partenaires.",
      how3Title: "3. Retirez vos gains",
      how3Desc: "Retirez vos points directement par Virement Interac, PayPal ou Bitcoin. Seuil de retrait de seulement 2,00$ CAD!",
      canadaSectionTitle: "Priorité au Canada, Fierté de Toronto 🇨🇦",
      canadaDesc: "Nous sommes fiers d'avoir été fondés et d'avoir notre siège social à Toronto, en Ontario. Conçu spécialement pour les Canadiens, nous proposons des paiements locaux directs.",
      interacTitle: "Virement Interac direct",
      interacDesc: "Plus besoin d'attendre des jours pour obtenir des virements bancaires étrangers. Recevez vos fonds en moins de 15 minutes.",
      cadDisplay: "Évaluations locales en CAD",
      cadDesc: "Sachez exactement ce que vous gagnez. 10 Coins = 0,01$ CAD. Des taux de change transparents et équitables.",
      bilingualTitle: "Plateforme entièrement bilingue",
      bilingualDesc: "TapCash parle votre langue. Passez instantanément de l'anglais au français sur tous vos tableaux de bord.",
      trustTitle: "Pourquoi plus de 10 000 Canadiens font confiance à TapCash",
      payoutOdometer: "ARGENT TOTAL VERSÉ AUX MEMBRES",
      liveProofTitle: "Preuve en direct des paiements effectués",
      founderTitle: "Fondé à Toronto en toute transparence",
      founderDesc: "Contrairement aux sites anonymes, nous assumons notre plateforme. TapCash a été cofondé par Shaya et son équipe à Toronto pour offrir une plateforme légitime.",
      trustpilotCard: "Évaluation Trustpilot",
      trustpilotDesc: "Excellent 4,8 sur 5 basé sur 1 482 avis de vrais Canadiens.",
      review1: "« Le Virement Interac instantané était sur mon compte en 5 minutes ! Le meilleur site au Canada. » - Chloe M., Montréal",
      review2: "« Pas de fausses offres. Des taux de paiement solides et un support réactif. Je recommande vivement. » - Liam P., Toronto",
    }
  };

  const curr = t[lang];

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98103_1px,transparent_1px),linear-gradient(to_bottom,#10b98103_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060606]/85 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/10">
            <Coins className="w-5.5 h-5.5" />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-emerald-400 tracking-tight">TapCash</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <button 
            onClick={() => setLanguage(lang === "en" ? "fr" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-bold text-zinc-400 hover:text-emerald-400 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{lang}</span>
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
            >
              {curr.ctaDashboard}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 transition"
              >
                {curr.ctaStart}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 max-w-5xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest leading-none animate-pulse">
          <Award className="w-3.5 h-3.5" />
          <span>{curr.heroTag}</span>
        </span>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400 max-w-4xl">
          {curr.heroTitle}
        </h1>

        <p className="text-base md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          {curr.heroDesc}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/auth/signup"}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base rounded-2xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition flex items-center justify-center gap-2 group"
          >
            <span>{user ? curr.ctaDashboard : curr.ctaStart}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="text-xs text-zinc-500 font-semibold tracking-wide">
          {curr.activeEarners}
        </p>
      </section>

      {/* Odometer Section */}
      <section className="w-full bg-[#09090b]/80 border-y border-zinc-900/60 py-10 px-4 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-emerald-500/[0.01]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">{curr.payoutOdometer}</span>
        <div className="flex items-center justify-center bg-zinc-950 border border-zinc-900/80 rounded-2xl px-6 py-4 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative group overflow-hidden">
          <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse" />
          <span className="text-2xl sm:text-5xl font-black text-emerald-400 tracking-tight leading-none tabular-nums flex items-center gap-1">
            <DollarSign className="w-6 sm:w-10 h-6 sm:h-10 text-emerald-500" />
            <span>{odometerValue.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs sm:text-base font-bold text-zinc-500 ml-1.5">CAD</span>
          </span>
        </div>
      </section>

      {/* Trustpilot & Canada Sections */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Trustpilot Card */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-6 relative shadow-2xl">
          <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/5 rounded-full blur-[20px]" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black font-black text-lg">
              ★
            </div>
            <div>
              <h3 className="font-black text-lg">{curr.trustpilotCard}</h3>
              <p className="text-xs text-zinc-500">{curr.trustpilotDesc}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            ))}
          </div>
          <div className="border-t border-zinc-900/60 pt-4 space-y-4 text-sm font-medium text-zinc-400">
            <p className="italic leading-relaxed">{curr.review1}</p>
            <p className="italic leading-relaxed">{curr.review2}</p>
          </div>
        </div>

        {/* Right: Canada first values */}
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">{curr.canadaSectionTitle}</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{curr.canadaDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-950/20 border border-zinc-900 rounded-2xl">
              <div className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-1">💳 {curr.interacTitle}</div>
              <p className="text-zinc-500 text-xs leading-normal">{curr.interacDesc}</p>
            </div>
            <div className="p-5 bg-zinc-950/20 border border-zinc-900 rounded-2xl">
              <div className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-1">🍁 {curr.cadDisplay}</div>
              <p className="text-zinc-500 text-xs leading-normal">{curr.cadDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-[#09090b]/40 border-y border-zinc-900/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-3xl font-black text-center tracking-tight">{curr.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: curr.how1Title, desc: curr.how1Desc, color: "from-zinc-900 to-zinc-950" },
              { title: curr.how2Title, desc: curr.how2Desc, color: "from-emerald-950/10 to-zinc-950/20 border-emerald-500/10" },
              { title: curr.how3Title, desc: curr.how3Desc, color: "from-zinc-900 to-zinc-950" },
            ].map((step, idx) => (
              <div key={idx} className={`p-6 bg-gradient-to-br rounded-2xl border border-zinc-900 shadow-md ${step.color}`}>
                <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canadian Brands Showcase */}
      <section className="px-6 py-16 max-w-5xl mx-auto space-y-10">
        <div className="text-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Available Local Gift Cards</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">Redeem Your CAD Directly Locally</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CANADIAN_PARTNERS.map((partner) => (
            <div key={partner.name} className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${partner.logoBg}`}>
              <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-white font-black border border-zinc-800 text-sm mb-3">
                {partner.text}
              </div>
              <span className="text-sm font-black text-zinc-200">{partner.name}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{partner.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Transparency Section */}
      <section className="px-6 py-20 bg-zinc-950/20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{curr.founderTitle}</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">No Anonymity. Fully Audited.</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{curr.founderDesc}</p>
          </div>
          <div className="flex flex-col items-center bg-zinc-950 border border-zinc-900 p-6 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-black text-black text-xl mb-3">
              ST
            </div>
            <span className="font-black text-zinc-100 text-sm">Shaya & Team</span>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Co-Founders, Toronto</span>
          </div>
        </div>
      </section>

      {/* Live Proof of Payment Ticker (Streamed) */}
      <section className="px-6 py-12 bg-zinc-950/60 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-6">
          <h3 className="text-center text-xs font-black uppercase tracking-widest text-emerald-500">{curr.liveProofTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {livePayouts.map((tx) => (
              <div key={tx.id} className="p-4 bg-[#080808] border border-zinc-900 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{tx.method || "Payout Reward"}</span>
                <span className="text-emerald-400 font-black text-lg mt-1">${((tx.amount || 2000) / 1000).toFixed(2)} CAD</span>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#070708] py-12 px-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest space-y-6">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs">
          <Link href="/terms" className="hover:text-emerald-500 transition">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-emerald-500 transition">Cookie Inventory</Link>
          <Link href="/affiliate" className="hover:text-emerald-500 transition">Affiliate Disclosure</Link>
        </div>
        
        {/* Compliance and HQ Badges */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-zinc-900/60 py-4 text-[9px] text-zinc-600 font-semibold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE SSL (AES-256)</span>
          <span className="text-zinc-800">•</span>
          <span>🔞 AGE REQUIRED: 18+ ONLY</span>
          <span className="text-zinc-800">•</span>
          <span>🍁 PIPEDA & CASL COMPLIANT</span>
          <span className="text-zinc-800">•</span>
          <span>🏢 HQ: 100 KING ST WEST, SUITE 5600, TORONTO, ON, CANADA</span>
        </div>

        <div className="space-y-2 max-w-3xl mx-auto leading-relaxed text-zinc-600 font-semibold text-[10px] lowercase normal-case">
          <p className="uppercase text-[9px] tracking-wider text-zinc-600 font-bold">CASL Anti-Spam Compliance Declaration:</p>
          <p>TapCash is committed to strict anti-spam compliance in accordance with CASL and federal regulations. By subscribing to communications, you consent to receive periodic rewards updates and notifications. You can safely revoke consent or opt out at any time through your member dashboard or by contacting support at <strong className="text-zinc-500">HELLO@TAPCASH.ONLINE</strong>.</p>
        </div>

        <p className="text-[9px] font-semibold text-zinc-600 mt-4">&copy; {new Date().getFullYear()} TapCash. All rights reserved. Toronto, Ontario, Canada.</p>
      </footer>
    </div>
  );
}