"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Menu, X, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userCount, setUserCount] = useState<number>(0);

  // Fetch real user count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/users/count');
        const data = await response.json();
        setUserCount(data.cashedOut24h || 0);
      } catch (error) {
        console.error('Error fetching user count:', error);
        setUserCount(0);
      }
    };

    fetchUserCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUserCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/games", label: "Games" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/cashpath", label: "CashPath" },
    { href: "/rewards", label: "Rewards" },
    { href: "/blog", label: "Blog" }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0A0E1A]/95 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/tapcash-icon.svg"
            alt="TapCash"
            className="h-10 w-10 transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <div className="hidden sm:block">
            <p className="font-display text-xl font-black tracking-tight tap-gradient-text">TapCash</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
              Play. Earn. Cash Out.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {/* User Activity Badge */}
          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex -space-x-2">
              <Image
                src="/images/avatars/user-1.svg"
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full border-2 border-[#0A0E1A]"
              />
              <Image
                src="/images/avatars/user-2.svg"
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full border-2 border-[#0A0E1A]"
              />
              <Image
                src="/images/avatars/user-3.svg"
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full border-2 border-[#0A0E1A]"
              />
            </div>
            <p className="text-sm font-semibold text-zinc-400">
              {userCount > 0 ? (
                <>
                  <span className="text-white">{userCount.toLocaleString()}+</span> users cashed out in last 24h
                </>
              ) : (
                <>
                  <span className="text-white">Join</span> thousands earning daily
                </>
              )}
            </p>
          </div>

          {/* Auth Buttons */}
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/8"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:text-white sm:inline-block"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-gradient-to-r from-[#18D9FF] to-[#7C3DFF] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(124,61,255,0.3)] transition-transform hover:-translate-y-0.5"
              >
                Sign Up Free
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/6 bg-[#0A0E1A]/96 px-4 py-4 backdrop-blur-2xl lg:hidden sm:px-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
