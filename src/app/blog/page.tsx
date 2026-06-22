"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Blog"
            title="Latest from TapCash"
            description="Product updates, earning tips, and platform announcements."
            kicker={
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                <Sparkles className="w-3.5 h-3.5" />
                {POSTS.length} articles
              </div>
            }
          />
        </MotionWrap>

        <div className="mt-10 space-y-4">
          {POSTS.map((post, i) => (
            <MotionWrap key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`}>
                <Card variant="interactive" className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="green">{post.category}</Badge>
                      <span className="text-[10px] text-white/30 flex items-center gap-1">
                        <Calendar size={10} />
                        {post.date}
                      </span>
                      <span className="text-[10px] text-white/30">{post.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{post.title}</h3>
                    <p className="mt-1 text-sm text-white/50 leading-relaxed">{post.excerpt}</p>
                  </div>
                  <ArrowRight size={16} className="text-white/30 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Card>
              </Link>
            </MotionWrap>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
