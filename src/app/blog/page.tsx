"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const VIOLET = "#6C5CE0";

const POSTS = [
  {
    slug: "welcome-to-tapcash",
    title: "Welcome to TapCash — Canada's Rewards Platform",
    excerpt: "We're building a transparent rewards platform where every offer is verified and every payout is tracked.",
    date: "May 22, 2026",
    category: "Company",
    readTime: "3 min",
  },
  {
    slug: "how-to-maximize-earnings",
    title: "How to Maximize Your Earnings on TapCash",
    excerpt: "Tips and strategies for completing offers efficiently and climbing the leaderboard faster.",
    date: "May 20, 2026",
    category: "Tips",
    readTime: "5 min",
  },
  {
    slug: "understanding-cashpath",
    title: "Understanding CashPath™ — Our Verification System",
    excerpt: "Every offer goes through CashPath — a transparent pipeline that shows you exactly where your rewards come from.",
    date: "May 18, 2026",
    category: "Features",
    readTime: "4 min",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
                Blog
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Latest from TapCash</h1>
              <p className="text-base text-[rgba(245,243,239,0.68)]">Product updates, earning tips, and platform announcements.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GOLD_BRIGHT }}>
              <Sparkles className="w-3.5 h-3.5" />
              {POSTS.length} articles
            </div>
          </div>
        </MotionWrap>

        <div>
          {POSTS.map((post, i) => (
            <MotionWrap key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-6"
                  style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: VIOLET }}>
                        {post.category}
                      </span>
                      <span className="text-[10px] text-[rgba(245,243,239,0.4)] flex items-center gap-1">
                        <Calendar size={10} />
                        {post.date}
                      </span>
                      <span className="text-[10px] text-[rgba(245,243,239,0.4)]">{post.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold">{post.title}</h3>
                    <p className="mt-1 text-sm text-[rgba(245,243,239,0.5)] leading-relaxed">{post.excerpt}</p>
                  </div>
                  <ArrowRight size={16} style={{ color: GOLD }} className="shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </MotionWrap>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
