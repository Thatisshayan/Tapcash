// src/app/landing/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-lg">
            T
          </div>
          <span className="text-xl font-bold text-emerald-500">TapCash</span>
        </div>
        <Link
          href="/auth/signin"
          className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Earn Real Cash Doing What You Love
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Complete surveys, try apps, and watch videos. Get paid instantly.
        </p>
        <Link
          href="/"
          className="px-8 py-4 bg-emerald-500 text-black font-bold text-lg rounded-xl hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30"
        >
          Start Earning Free
        </Link>
        <p className="mt-4 text-sm text-gray-500">
          Join 10,000+ earners
        </p>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds' },
            { step: '2', title: 'Complete Offers', desc: 'Surveys, games, apps, videos' },
            { step: '3', title: 'Get Paid', desc: 'Withdraw to PayPal or gift cards' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-emerald-500 text-black font-bold text-xl rounded-full flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Offers */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Consumer Habits Survey', reward: '$1.50', type: 'Survey' },
            { title: 'Raid: Shadow Legends', reward: '$8.00', type: 'Game' },
            { title: 'Install Cash App', reward: '$2.00', type: 'App' },
          ].map((offer) => (
            <div key={offer.title} className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-emerald-500/50 transition">
              <span className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">{offer.type}</span>
              <h3 className="text-lg font-semibold mt-2 mb-1">{offer.title}</h3>
              <p className="text-2xl font-bold text-emerald-500">{offer.reward}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-12 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: '🔒', text: '256-bit encrypted' },
            { icon: '⚡', text: 'Instant payouts' },
            { icon: '🚫', text: 'No hidden fees' },
          ].map((item) => (
            <div key={item.text} className="flex items-center justify-center gap-2 text-gray-300">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-gray-500">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-4">
          <Link href="/terms" className="hover:text-emerald-500 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
          <Link href="/cookies" className="hover:text-emerald-500 transition">Cookies</Link>
          <Link href="/affiliate" className="hover:text-emerald-500 transition">Affiliate</Link>
          <Link href="/contact" className="hover:text-emerald-500 transition">Contact</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} TapCash. All rights reserved.</p>
      </footer>
    </div>
  );
}