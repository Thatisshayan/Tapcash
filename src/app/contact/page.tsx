"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { Mail, MessageCircle, HelpCircle, Send } from "lucide-react";

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@tapcash.online",
    href: "mailto:support@tapcash.online",
  },
  {
    icon: MessageCircle,
    label: "Live chat",
    value: "Available 9am–5pm PST",
    href: "#",
  },
  {
    icon: HelpCircle,
    label: "FAQ",
    value: "Instant answers to common questions",
    href: "/faq",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Get in touch"
            title="Contact us"
            description="Have a question or need help? We're here for you."
          />
        </MotionWrap>

        <div className="grid gap-4 sm:grid-cols-3 mt-10">
          {CONTACT_METHODS.map((m) => (
            <MotionWrap key={m.label} delay={0.05}>
              <a href={m.href}>
                <Card variant="interactive" className="text-center">
                  <m.icon className="mx-auto w-5 h-5 text-[#18D9FF]" />
                  <h3 className="mt-2 text-sm font-bold text-white">{m.label}</h3>
                  <p className="mt-1 text-xs text-white/50">{m.value}</p>
                </Card>
              </a>
            </MotionWrap>
          ))}
        </div>

        {/* Contact form */}
        <MotionWrap className="mt-10">
          <Card variant="elevated" className="max-w-lg mx-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send size={16} className="text-[#18D9FF]" />
              Send us a message
            </h3>
            {sent ? (
              <div className="mt-4 p-4 rounded-xl bg-[#31F06F]/10 border border-[#31F06F]/20 text-center">
                <p className="text-sm font-bold text-[#31F06F]">Message sent!</p>
                <p className="text-xs text-white/50 mt-1">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#18D9FF]/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#18D9FF]/50 transition-colors"
                />
                <textarea
                  placeholder="Your message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#18D9FF]/50 transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="w-full text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#31F06F] to-[#18D9FF] text-black hover:opacity-90 transition-opacity"
                >
                  Send message
                </button>
              </form>
            )}
          </Card>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
