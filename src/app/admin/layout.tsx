'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import {
  LayoutDashboard, Users, DollarSign, TicketPercent, ShieldAlert,
  Gift, BarChart3, LogOut, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',           label: 'Command Center',   icon: LayoutDashboard },
  { href: '/admin/dashboard', label: 'Dashboard',         icon: BarChart3 },
  { href: '/admin/users',     label: 'Users',             icon: Users },
  { href: '/admin/transactions', label: 'Transactions',   icon: DollarSign },
  { href: '/admin/offers',    label: 'Offers',            icon: Gift },
  { href: '/admin/fraud',     label: 'Fraud Detection',   icon: ShieldAlert },
  { href: '/admin/multiplier', label: 'Multipliers',      icon: BarChart3 },
  { href: '/admin/promo-analytics', label: 'Promo Codes', icon: TicketPercent },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/withdrawals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsAdmin(true);
        else router.push('/');
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050816]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e6c3]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#080c1a] border-r border-white/5
          flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00e6c3] to-[#7C3DFF] flex items-center justify-center text-[10px] font-black text-white">
              TC
            </div>
            <span className="font-black text-sm">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active
                    ? 'bg-[#00e6c3]/10 text-[#00e6c3] border border-[#00e6c3]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Exit */}
        <div className="p-3 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#080c1a]">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-sm">Admin Panel</span>
        </div>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
