'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, Mail, Share2, Github, Linkedin, Twitter } from 'lucide-react';

export default function PremiumFooter() {
  const footerSections = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
      ]
    },
    {
      title: 'Product',
      links: [
        { label: 'Earn', href: '/earn' },
        { label: 'Cash Out', href: '/cashout' },
        { label: 'Leaderboard', href: '/leaderboard' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/tapcash', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/tapcash', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tapcash', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@tapcash.online', label: 'Email' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-[rgba(150,190,255,0.1)] mt-20 py-16 bg-gradient-to-b from-[rgba(5,8,19,0)] to-[rgba(5,8,19,0.5)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#31F06F] to-[#18D9FF] flex items-center justify-center font-black text-white text-sm">
                TC
              </div>
              <span className="text-xl font-black">
                <span className="text-white">TAP</span>
                <span className="text-[#31F06F]">CASH</span>
              </span>
            </div>
            <p className="text-sm text-[#9AA8C6] mb-4">
              Earn real rewards. Cash out with confidence.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(150,190,255,0.1)] flex items-center justify-center text-[#9AA8C6] hover:text-[#18D9FF] hover:border-[#18D9FF] transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link Sections */}
          {footerSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="font-black text-white text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIdx * 0.1 + linkIdx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-[#9AA8C6] hover:text-[#18D9FF] transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#18D9FF] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-[rgba(150,190,255,0.2)] to-transparent mb-8 origin-left"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#9AA8C6]"
        >
          <p>
            © 2024 TapCash. All rights reserved. | Ledger-backed rewards platform.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#31F06F]" />
              Verified Offers
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#18D9FF]" />
              Secure Payouts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7C3DFF]" />
              No Spam
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
