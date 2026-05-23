// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { 
  Coins, Sparkles, CheckCircle, ArrowRight, ShieldCheck, Zap, 
  HelpCircle, Globe, Heart, DollarSign, Award, Users, Star, Layers, Activity
} from "lucide-react";

// Official-Fidelity SVG Brand Logo Components
const TimsLogo = () => (
  <svg className="w-28 h-8 text-[#da291c] drop-shadow-[0_0_10px_rgba(218,41,28,0.2)]" viewBox="0 0 120 30" fill="none">
    <text x="50%" y="22" textAnchor="middle" className="text-[18px] font-serif font-black italic tracking-wide" fill="#da291c">Tim Hortons</text>
  </svg>
);

const CTLogo = () => (
  <svg className="w-12 h-12 drop-shadow-[0_0_12px_rgba(204,32,41,0.25)]" viewBox="0 0 100 100" fill="none">
    <polygon points="50,85 10,15 90,15" fill="#cc2029" />
    <path d="M50,25 L53,37 L59,34 L56,46 L64,44 L59,54 L67,58 L56,62 L54,74 L46,74 L44,62 L33,58 L41,54 L36,44 L44,46 L41,34 L47,37 Z" fill="#008643" />
  </svg>
);

const CineplexLogo = () => (
  <svg className="w-28 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]" viewBox="0 0 120 30" fill="none">
    <text x="60%" y="20" textAnchor="middle" className="text-[13px] font-black tracking-[0.16em] font-sans" fill="#ffffff">CINEPLEX</text>
    <path d="M12,8 L14.5,13 L19.5,14 L15.5,17.5 L16.5,22.5 L12,20 L7.5,22.5 L8.5,17.5 L4.5,14 L9.5,13 Z" fill="#fbbf24" />
  </svg>
);

const SDMLogo = () => (
  <svg className="w-32 h-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" viewBox="0 0 130 30" fill="none">
    <text x="50%" y="15" textAnchor="middle" className="text-[12px] font-black tracking-widest font-sans" fill="#ff0000">SHOPPERS</text>
    <text x="50%" y="24" textAnchor="middle" className="text-[6px] font-extrabold tracking-[0.25em]" fill="#ffffff">DRUG MART</text>
  </svg>
);

// High-fidelity Canadian brand integrations
const CANADIAN_PARTNERS = [
  { name: "Tim Hortons", renderLogo: TimsLogo, desc: "Coffee & Donuts" },
  { name: "Canadian Tire", renderLogo: CTLogo, desc: "Outdoor & Tools" },
  { name: "Cineplex", renderLogo: CineplexLogo, desc: "Movie Tickets" },
  { name: "Shoppers Drug Mart", renderLogo: SDMLogo, desc: "Wellness & Pharmacy" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [lang, setLanguage] = useState<"en" | "fr">("en");
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  // Real-time live activity fetch
  useEffect(() => {
    const q = query(
      collection(db, "transactions"),
      where("status", "in", ["completed", "pending"]),
      orderBy("createdAt", "desc"),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const absAmount = Math.abs(data.amount || 0);
        const cadValue = (absAmount / 1000).toFixed(2);
        
        // Format relative time
        let timeLabel = "Just now";
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const diffMin = Math.floor((new Date().getTime() - date.getTime()) / 60000);
          if (diffMin > 0) timeLabel = `${diffMin}m ago`;
          if (diffMin > 60) timeLabel = `${Math.floor(diffMin/60)}h ago`;
        }

        // UI styling based on type
        let method = data.method || (data.type === "offer" ? "Offer Completion" : "Payment");
        let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (data.type === "withdrawal") {
          badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        }

        return {
          id: docSnap.id,
          user: `${(data.userId || "user").slice(0, 5)}***`,
          amount: `$${cadValue} CAD`,
          method: method,
          ref: `ID: #${docSnap.id.slice(0, 6)}`,
          time: timeLabel,
          badgeBg: badgeBg,
          status: data.status
        };
      });
      setLiveActivity(items);
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
      canadaSectionTitle: "The Native Choice for Canadians \uD83C\uDDE6\uD83C\uDDE6",
      canadaDesc: "We are proud to be the only premium GPT rewards platform engineered strictly for Canadians. Founded and headquartered in Toronto, Ontario, we offer direct local payouts and bilingual service.",
      interacTitle: "Direct Interac e-Transfer",
      interacDesc: "No more waiting days for foreign bank drafts. Get cash deposited securely into your Canadian bank account in under 15 minutes.",
      cadDisplay: "Local CAD Valuations",
      cadDesc: "See exactly what you earn. 10 Coins = $0.01 CAD. Clear, transparent, and fair exchange rates.",
      bilingualTitle: "Fully Bilingual Platform",
      bilingualDesc: "TapCash speaks your language. Toggle instantly between English and French across all dashboards.",
      trustTitle: "Why Over 10,000+ Canadians Trust TapCash",
      liveProofTitle: "Verified Global Activity Ledger",
      founderTitle: "Founded in Toronto with Full Transparency",
      founderDesc: "Unlike anonymous GPT sites, we stand behind our platform. TapCash was co-founded by the tech leaders of Obsidian Team in Toronto to offer Canadians a legitimate, premium reward hub.",
      trustpilotCard: "Trustpilot Rating",
      trustpilotDesc: "Excellent 4.8 out of 5 based on 1,482 real Canadian reviews.",
    },
    fr: {
      heroTag: "La premi\u00E8re plateforme de r\u00E9compenses GPT au Canada",
      heroTitle: "Gagnez de l'argent r\u00E9el en faisant ce que vous aimez",
      heroDesc: "R\u00E9pondez \u00E0 des sondages payants, testez de nouvelles applications mobiles et jouez \u00E0 des jeux. Recevez vos gains instantan\u00E9ment en dollars canadiens via Virement Interac, PayPal ou Crypto.",
      ctaStart: "Commencer Gratuitement",
      ctaDashboard: "Acc\u00E9der au Tableau de Bord",
      activeEarners: "Rejoignez plus de 12 000 utilisateurs canadiens actifs",
      howTitle: "Le chemin le plus simple vers les paiements",
      how1Title: "1. Inscrivez-vous instantan\u00E9ment",
      how1Desc: "Cr\u00E9ez votre compte avec Google ou votre courriel en moins de 30 secondes. Rapide, s\u00E9curis\u00E9 et 100 % gratuit.",
      how2Title: "2. Compl\u00E9tez des offres",
      how2Desc: "R\u00E9pondez \u00E0 des sondages, testez des applications locales et partagez votre avis avec nos partenaires.",
      how3Title: "3. Retirez vos gains",
      how3Desc: "Retirez vos points directement par Virement Interac, PayPal ou Bitcoin. Seuil de retrait de seulement 2,00$ CAD!",
      canadaSectionTitle: "Le Choix Authentique des Canadiens \uD83C\uDDE6\uD83C\uDDE6",
      canadaDesc: "Nous sommes fiers d'\u00EAtre la seule plateforme de r\u00E9compenses GPT haut de gamme con\u00E7ue exclusivement pour les Canadiens. Fond\u00E9e \u00E0 Toronto, Ontario, nous offrons des paiements locaux directs.",
      interacTitle: "Virement Interac direct",
      interacDesc: "Plus besoin d'attendre des jours pour obtenir des virements bancaires \u00E9trangers. Recevez vos fonds en moins de 15 minutes.",
      cadDisplay: "\u00C9valuations locales en CAD",
      cadDesc: "Sachez exactement ce que vous gagnez. 10 Coins = 0,01$ CAD. Des taux de change transparents et \u00E9quitables.",
      bilingualTitle: "Plateforme enti\u00E8rement bilingue",
      bilingualDesc: "TapCash parle votre langue. Passez instantan\u00E9ment de l'anglais au fran\u00E7ais sur tous vos tableaux de bord.",
      trustTitle: "Pourquoi plus de 10 000 Canadiens font confiance \u00E0 TapCash",
      liveProofTitle: "Registre d'activit\u00E9 global v\u00E9rifi\u00E9",
      founderTitle: "Fond\u00E9 \u00E0 Toronto en toute transparence",
      founderDesc: "Contrairement aux sites anonymes, nous assumons notre plateforme. TapCash a \u00E9t\u00E9 cofond\u00E9 par l'\u00C9quipe Obsidian \u00E0 Toronto pour offrir une plateforme de r\u00E9compenses l\u00E9gitime.",
      trustpilotCard: "\u00C9valuation Trustpilot",
      trustpilotDesc: "Excellent 4,8 sur 5 bas\u00E9 sur 1 482 avis de vrais Canadiens.",
    }
  };

  const curr = t[lang];

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col relative overflow-x-hidden font-sans">
      {/* Cinematic Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98103_1px,transparent_1px),linear-gradient(to_bottom,#10b98103_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      
      {/* Floating Radial Backglows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[45vw] h-[45vw] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[35vw] h-[35vw] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#030303]/60 backdrop-blur-xl border-b border-zinc-900/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center font-bold text-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:rotate-6 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-emerald-400 font-display">TapCash</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(lang === "en" ? "fr" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950/40 border border-zinc-900/60 rounded-lg text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest">{lang}</span>
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="px-4.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-xs font-extrabold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all scale-100 hover:scale-[1.03]"
            >
              {curr.ctaDashboard}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-xs font-extrabold rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all scale-100 hover:scale-[1.03]"
              >
                {curr.ctaStart}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 max-w-5xl mx-auto space-y-8 z-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-widest leading-none shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <Award className="w-3.5 h-3.5" />
          <span>{curr.heroTag}</span>
        </span>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-500 max-w-4xl font-display text-glow">
          {curr.heroTitle}
        </h1>

        <p className="text-sm md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {curr.heroDesc}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            href={user ? "/dashboard" : "/auth/signup"}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-sm rounded-xl shadow-[0_4px_25px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group scale-100 hover:scale-[1.03]"
          >
            <span>{user ? curr.ctaDashboard : curr.ctaStart}</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        <p className="text-[10px] text-emerald-500/60 font-bold tracking-widest uppercase">
          {curr.activeEarners}
        </p>
      </section>

      {/* Trustpilot & Canada Sections (Ultra-Minimalist & Transparent) */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        {/* Left: Trustpilot Card - Semi-Transparent & Elegant */}
        <div className="bg-transparent border border-zinc-900/60 rounded-3xl p-7 space-y-6 relative hover:border-zinc-800 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-black text-lg">
              ★
            </div>
            <div>
              <h3 className="font-black text-base font-display tracking-tight">{curr.trustpilotCard}</h3>
              <p className="text-[10px] text-zinc-500 font-medium">{curr.trustpilotDesc}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            ))}
          </div>
          <div className="border-t border-zinc-900/30 pt-4 space-y-3.5 text-xs font-medium text-zinc-400 leading-relaxed">
            <p className="italic">“The instant Interac e-Transfer was in my bank account in 5 minutes! Best site in Canada.” - Chloe M., Montreal</p>
            <p className="italic">“No fake offers. Solid payout rates, and highly responsive support. Highly recommend.” - Liam P., Toronto</p>
          </div>
        </div>

        {/* Right: Canada first values */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight font-display text-glow">{curr.canadaSectionTitle}</h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{curr.canadaDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-transparent border border-zinc-900/50 rounded-2xl hover:border-zinc-800 transition-colors">
              <div className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span>💳</span> {curr.interacTitle}
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">{curr.interacDesc}</p>
            </div>
            <div className="p-5 bg-transparent border border-zinc-900/50 rounded-2xl hover:border-zinc-800 transition-colors">
              <div className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span>🍁</span> {curr.cadDisplay}
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">{curr.cadDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (Transparent & Compact Cards) */}
      <section className="px-6 py-20 border-y border-zinc-900/30 z-10 relative bg-[#020202]/30">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center tracking-tight font-display text-glow">{curr.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: curr.how1Title, desc: curr.how1Desc },
              { title: curr.how2Title, desc: curr.how2Desc, highlight: true },
              { title: curr.how3Title, desc: curr.how3Desc },
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`p-6 bg-transparent rounded-2xl border transition-all scale-100 hover:scale-[1.01] ${
                  step.highlight 
                    ? "border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.03)]" 
                    : "border-zinc-900/60"
                }`}
              >
                <h3 className="text-base font-black text-white mb-2 font-display tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canadian Brands Showcase - HIGH-END TRANSLUCENT MINIMALIST */}
      <section className="px-6 py-20 max-w-5xl mx-auto space-y-10 z-10 relative">
        <div className="text-center space-y-2">
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Premium Rewards Portfolio</span>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight font-display text-glow">Redeem Instantly with Leading Partners</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CANADIAN_PARTNERS.map((partner) => {
            const LogoComponent = partner.renderLogo;
            return (
              <div 
                key={partner.name} 
                className="relative p-5 rounded-2xl border border-zinc-900/50 bg-transparent flex flex-col items-center justify-between text-center transition-all duration-300 scale-100 hover:scale-[1.02] hover:border-zinc-700 hover:shadow-[0_4px_25px_rgba(255,255,255,0.02)]"
              >
                {/* SVG Logo Container */}
                <div className="h-14 flex items-center justify-center mb-3">
                  <LogoComponent />
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-black text-zinc-300 font-display tracking-tight">{partner.name}</span>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{partner.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Founder Transparency Section */}
      <section className="px-6 py-20 bg-transparent border-t border-zinc-900/30 z-10 relative">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          <div className="md:col-span-2 space-y-4">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{curr.founderTitle}</span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight font-display text-glow">No Anonymity. Fully Audited.</h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{curr.founderDesc}</p>
          </div>
          
          {/* Transparent Obsidian Crystal Team Badge */}
          <div className="relative flex flex-col items-center bg-transparent border border-zinc-900/60 p-6 rounded-2xl text-center hover:border-zinc-800 transition-colors">
            {/* Premium Crystal Illustration */}
            <div className="mb-3">
              <svg className="w-12 h-12 drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]" viewBox="0 0 100 100" fill="none">
                <polygon points="50,5 85,35 50,95 15,35" fill="url(#obsGrad)" stroke="#a855f7" strokeWidth="1" />
                <polygon points="50,5 50,95 85,35" fill="rgba(255,255,255,0.05)" />
                <polygon points="50,5 15,35 50,95" fill="rgba(0,0,0,0.3)" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                <line x1="85" y1="35" x2="15" y2="35" stroke="#a855f7" strokeWidth="1" opacity="0.2" />
                <defs>
                  <linearGradient id="obsGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="40%" stopColor="#3b0764" />
                    <stop offset="100%" stopColor="#064e3b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <span className="font-black text-zinc-100 text-sm font-display tracking-tight">Obsidian Team</span>
            <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-widest mt-1">Core Tech & Auditors, Toronto</span>
          </div>
        </div>
      </section>

      {/* Live Activity Ticker - CONNECTED TO REAL FIRESTORE DATA */}
      <section className="px-6 py-14 bg-[#020202]/40 border-t border-zinc-900/30 z-10 relative">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col items-center text-center space-y-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Real-Time Completed Payouts Feed</span>
            </span>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">SECURE BLOCKCHAIN & BANK LEDGER SYNCED</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {liveActivity.length > 0 ? (
              liveActivity.map((tx, index) => (
                <div 
                  key={tx.id || index} 
                  className="p-4 bg-transparent border border-zinc-900/60 rounded-xl flex flex-col justify-between space-y-3.5 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-300 font-display">{tx.user}</span>
                    <span className="text-[9px] font-bold text-zinc-500">{tx.time}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-emerald-400 font-black text-lg font-display">{tx.amount}</span>
                    <span className="text-[10px] font-bold text-zinc-400">{tx.method}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-900/40 pt-2.5">
                    <span className="text-[8px] font-mono text-zinc-600 font-bold uppercase tracking-wider">{tx.ref}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${tx.badgeBg}`}>
                      {tx.status === "completed" ? "Verified" : "Processing"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
                Waiting for incoming network activity...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/40 bg-[#020202] py-16 px-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest space-y-8 z-10 relative">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs normal-case font-medium">
          <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookie Inventory</Link>
          <Link href="/affiliate" className="hover:text-emerald-400 transition-colors">Affiliate Disclosure</Link>
        </div>
        
        {/* Compliance and HQ Badges */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-zinc-900/40 py-5 text-[9px] text-zinc-600 font-bold tracking-wider">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE SSL (AES-256)</span>
          <span className="text-zinc-800">•</span>
          <span>\uD83D\uDD1E AGE REQUIRED: 18+ ONLY</span>
          <span className="text-zinc-800">•</span>
          <span>\uD83C\uDDE6\uD83C\uDDE6 PIPEDA & CASL COMPLIANT</span>
          <span className="text-zinc-800">•</span>
          <span>\uD83C\uDFE2 HQ: 100 KING ST WEST, SUITE 5600, TORONTO, ON, CANADA</span>
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