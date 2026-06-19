import Link from 'next/link';
import { ExternalLink, Code2, Rss, Mail, Shield } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const LINKS = {
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  Product: [
    { label: 'Earn', href: '/games' },
    { label: 'Cash Out', href: '/cashout' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const SOCIALS = [
  { icon: ExternalLink, label: 'X / Twitter', href: '#' },
  { icon: Code2, label: 'GitHub', href: '#' },
  { icon: Rss, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@tapcash.online' },
];

export function Footer() {
  return (
    <footer
      className="border-t border-white/[0.05]"
      style={{ backgroundColor: '#0a0f0d' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Logo size="md" />
            <p className="text-[13px] text-white/40 leading-relaxed max-w-[200px]">
              Canada's premium rewards platform.
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white/40 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link grid */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">{section}</p>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13px] text-white/40 hover:text-white/80 transition-colors focus-visible:ring-2 focus-visible:ring-[#00C97F] rounded outline-none"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/30">
            © 2024 TapCash. Vancouver, BC, Canada.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {['SSL Secure', 'PIPEDA Compliant', 'CASL Compliant'].map((badge, i) => (
              <span key={badge} className="flex items-center gap-1.5 text-[12px] text-white/40">
                {i > 0 && <span className="text-white/20">·</span>}
                <Shield size={11} className="text-white/30" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
