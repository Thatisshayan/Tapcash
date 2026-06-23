"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const POSTS: Record<string, { title: string; date: string; content: string }> = {
  "welcome-to-tapcash": {
    title: "Welcome to TapCash — Canada's Rewards Platform",
    date: "May 22, 2026",
    content: `
TapCash is a Canadian rewards platform built on transparency. Every offer completion is verified server-side, every ledger entry is auditable, and every payout goes through manual review before funds move.

Our goal is simple: create a rewards loop that users can trust. Unlike traditional GPT sites where payouts can feel opaque, TapCash exposes the full pipeline — from offer click to cashout approval.

## What makes TapCash different?

- **Server-verified actions** — Every offer completion is validated before coins hit your ledger
- **Transparent payouts** — The cashout queue shows you exactly where your request stands
- **Canadian-first** — Interac e-Transfer support, CAD-based rewards, and local gift card options

Start by completing offers on the RapidoReach offerwall, build your coin balance, and request a payout when you're ready.
    `,
  },
  "how-to-maximize-earnings": {
    title: "How to Maximize Your Earnings on TapCash",
    date: "May 20, 2026",
    content: `
Maximizing your earnings on TapCash is about choosing the right offers and staying consistent. Here are the key strategies:

## 1. Start with surveys

RapidoReach surveys offer the fastest path to coins. They take 5-15 minutes and credit almost instantly after completion. Look for surveys with high payout-to-time ratios.

## 2. Stack streaks and missions

Daily logins build your streak multiplier. After 7 consecutive days, you unlock bonus coin opportunities. Combine streaks with missions for maximum earnings.

## 3. Refer friends

Each referral earns you 20% of their coin earnings forever. Share your referral link on social media, forums, or with friends who are looking for extra income.

## 4. Cash out strategically

Withdrawals have a minimum of 2,000 coins ($2.00 CAD). Wait until you reach higher thresholds to reduce the relative impact of any processing times.
    `,
  },
  "understanding-cashpath": {
    title: "Understanding CashPath™ — Our Verification System",
    date: "May 18, 2026",
    content: `
CashPath™ is TapCash's verification pipeline. Every offer completion and payout request flows through CashPath before the ledger is updated.

## How CashPath works

1. **Offer Submission** — You complete an offer on the RapidoReach or Lootably offerwall
2. **Postback Verification** — The provider sends a postback to TapCash confirming your completion
3. **Ledger Credit** — After verification, coins are credited to your ledger with a full audit trail
4. **Payout Request** — You request a cashout, which enters the manual review queue
5. **Admin Review** — Admin reviews the request, approves or rejects, and processes the payout

## Why CashPath matters

CashPath ensures that every coin in your ledger is backed by a verified action. This prevents fraud, protects legitimate users, and maintains the integrity of the rewards system.

The status page at /cashout/status shows you exactly where your request is in the pipeline.
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050813] text-white flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-black text-white">Post not found</h1>
          <p className="mt-4 text-zinc-400">The blog post you are looking for does not exist.</p>
          <Link href="/blog" className="mt-6 inline-flex items-center gap-2 text-[#00e6c3] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-zinc-500">{post.date}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white leading-tight">{post.title}</h1>
        <div className="mt-8 prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </main>
      <Footer />
    </div>
  );
}
