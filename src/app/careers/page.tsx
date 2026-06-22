"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTAButton, MotionWrap, PageShell } from "@/components/PremiumUi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#050813] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <MotionWrap>
          <PageShell
            eyebrow="Join the team"
            title="Careers at TapCash"
            description="Help us build Canada's most transparent rewards platform."
          />
        </MotionWrap>

        <div className="mt-10 space-y-4">
          {OPENINGS.length === 0 && (
            <MotionWrap>
              <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-white/50">No open positions right now. Check back later.</p>
              </div>
            </MotionWrap>
          )}
          {OPENINGS.map((role, i) => (
            <MotionWrap key={role.title} delay={i * 0.08}>
              <Card variant="interactive" className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="purple">{role.team}</Badge>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <MapPin size={10} />
                      {role.location}
                    </span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <Clock size={10} />
                      {role.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{role.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{role.description}</p>
                </div>
                <Link
                  href="mailto:careers@tapcash.online"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#18D9FF] hover:text-[#31F06F] transition-colors"
                >
                  Apply <ArrowRight size={12} />
                </Link>
              </Card>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap className="mt-12 text-center">
          <p className="text-sm text-white/30 mb-3">Don&apos;t see a role that fits? We&apos;re always looking for talent.</p>
          <CTAButton href="mailto:careers@tapcash.online" label="Send your resume" variant="secondary" />
        </MotionWrap>
      </main>
      <Footer />
    </div>
  );
}
