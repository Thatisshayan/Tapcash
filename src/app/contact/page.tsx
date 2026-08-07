"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { Mail, MessageCircle, HelpCircle, Send } from "lucide-react";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";

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

const inputClass =
  "w-full border-b bg-transparent px-1 py-3 text-sm outline-none transition-colors placeholder:text-[rgba(245,243,239,0.3)]";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            Get in touch
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Contact us</h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
            Have a question or need help? We&apos;re here for you.
          </p>
        </MotionWrap>

        <div className="grid gap-8 sm:grid-cols-3 mt-14">
          {CONTACT_METHODS.map((m) => (
            <MotionWrap key={m.label} delay={0.05}>
              <a href={m.href} className="block text-center">
                <m.icon className="mx-auto w-5 h-5" style={{ color: GOLD }} />
                <h3 className="mt-2 text-sm font-bold">{m.label}</h3>
                <p className="mt-1 text-xs text-[rgba(245,243,239,0.5)]">{m.value}</p>
              </a>
            </MotionWrap>
          ))}
        </div>

        {/* Contact form */}
        <MotionWrap className="mt-16">
          <div className="max-w-lg mx-auto">
            <h3 className="text-base font-bold flex items-center gap-2 mb-5">
              <Send size={16} style={{ color: GOLD }} />
              Send us a message
            </h3>
            {sent ? (
              <div className="py-8 text-center">
                <p className="text-sm font-bold" style={{ color: GOLD_BRIGHT }}>Message sent!</p>
                <p className="text-xs text-[rgba(245,243,239,0.5)] mt-1">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className={inputClass}
                  style={{ borderColor: "rgba(245,243,239,0.18)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(245,243,239,0.18)")}
                />
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  className={inputClass}
                  style={{ borderColor: "rgba(245,243,239,0.18)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(245,243,239,0.18)")}
                />
                <textarea
                  placeholder="Your message"
                  required
                  rows={4}
                  className={`${inputClass} resize-none`}
                  style={{ borderColor: "rgba(245,243,239,0.18)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(245,243,239,0.18)")}
                />
                <button
                  type="submit"
                  className="w-full text-sm font-bold px-5 py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`, color: "#1a1408" }}
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
