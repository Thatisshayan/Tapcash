'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, Mail, Share2, Globe, Users, ExternalLink, Shield } from 'lucide-react';

const LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
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
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const SOCIALS = [
  { icon: Globe, href: 'https://twitter.com/tapcash', label: 'Twitter' },
  { icon: Users, href: 'https://github.com/tapcash', label: 'GitHub' },
  { icon: ExternalLink, href: 'https://linkedin.com/company/tapcash', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@tapcash.online', label: 'Email' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Logo() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center font-black text-white text-sm">
        TC
      </div>
      <span className="text-xl font-black">
        <span className="text-white">TAP</span>
        <span className="text-[#31F06F]">CASH</span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-[rgba(150,190,255,0.1)] mt-20 bg-gradient-to-b from-[rgba(5,8,19,0)] to-[rgba(5,8,19,0.5)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
            <Logo />
            <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
              Canada&apos;s premium gaming rewards platform. Vancouver, BC.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(150,190,255,0.1)] flex items-center justify-center text-white/40 hover:text-[#18D9FF] hover:border-[#18D9FF] transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link sections */}
          {Object.entries(LINKS).map(([section, items]) => (
            <motion.div
              key={section}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/40 hover:text-[#18D9FF] transition-colors relative group"
                    >
                      {label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#18D9FF] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Gradient divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-[rgba(150,190,255,0.2)] to-transparent mb-8 origin-left"
        />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-white/30">
            &copy; 2024 TapCash. Vancouver, BC, Canada.
          </p>
          <div className="flex items-center gap-4 flex-wrap text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              SSL Secure
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#31F06F]" />
              Verified Offers
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#18D9FF]" />
              Secure Payouts
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;
