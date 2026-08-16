"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionWrap } from "@/components/PremiumUi";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const GOLD = "#D9B678";
const GOLD_BRIGHT = "#F0CE97";
const VIOLET = "#6C5CE0";

const OPENINGS = [
  {
    title: "Full-Stack Developer",
    type: "Remote",
    location: "Canada",
    team: "Engineering",
    description: "Build and maintain the TapCash platform — Next.js, Firebase, and TypeScript across web and mobile.",
  },
  {
    title: "Community Manager",
    type: "Part-Time",
    location: "Vancouver, BC",
    team: "Growth",
    description: "Engage with our community, manage social channels, and help shape the user experience.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F3EF] flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <MotionWrap>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD_BRIGHT }}>
            Join the team
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Careers at TapCash</h1>
          <p className="text-base md:text-lg text-[rgba(245,243,239,0.68)]">
            Help us build Canada&apos;s most transparent rewards platform.
          </p>
        </MotionWrap>

        <div className="mt-14">
          {OPENINGS.length === 0 && (
            <MotionWrap>
              <p className="text-sm text-[rgba(245,243,239,0.5)] text-center py-8">No open positions right now. Check back later.</p>
            </MotionWrap>
          )}
          {OPENINGS.map((role, i) => (
            <MotionWrap key={role.title} delay={i * 0.08}>
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 py-6"
                style={{ borderBottom: "1px solid rgba(245,243,239,0.09)" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: VIOLET }}>
                      {role.team}
                    </span>
                    <span className="text-[10px] text-[rgba(245,243,239,0.4)] flex items-center gap-1">
                      <MapPin size={10} />
                      {role.location}
                    </span>
                    <span className="text-[10px] text-[rgba(245,243,239,0.4)] flex items-center gap-1">
                      <Clock size={10} />
                      {role.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold">{role.title}</h3>
                  <p className="mt-1 text-sm text-[rgba(245,243,239,0.5)]">{role.description}</p>
                </div>
                <Link
                  href="mailto:careers@tapcash.online"
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                  style={{ color: GOLD }}
                >
                  Apply <ArrowRight size={14} />
                </Link>
              </div>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-14 text-center">
          <p className="text-sm text-[rgba(245,243,239,0.4)] mb-4">Don&apos;t see a role that fits? We&apos;re always looking for talent.</p>
          <Link
            href="mailto:careers@tapcash.online"
            className="inline-flex items-center justify-center gap-2 rounded-full border px-8 py-3.5 text-sm font-bold text-[rgba(245,243,239,0.68)] hover:text-white transition-colors"
            style={{ borderColor: "rgba(245,243,239,0.18)" }}
          >
            Send your resume
          </Link>
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
