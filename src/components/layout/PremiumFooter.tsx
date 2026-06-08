'use client';

import Link from 'next/link';
import { MessageCircle, Mail, Share2 } from 'lucide-react';

export default function PremiumFooter() {
  return (
    <footer className="border-t border-[var(--model-u-line)] mt-16 py-12">
      <div className="model-u-page">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-black text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-black text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/earn" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Earn
                </Link>
              </li>
              <li>
                <Link href="/cashout" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Cash Out
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-black text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-black text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[var(--model-u-line)]">
          <p className="text-[#9AA8C6] text-sm mb-4 md:mb-0">
            © 2024 TapCash. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://twitter.com/tapcash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors"
              aria-label="Twitter"
            >
              <MessageCircle size={20} />
            </a>
            <a
              href="mailto:support@tapcash.online"
              className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a
              href="#share"
              className="text-[#9AA8C6] hover:text-[#18D9FF] transition-colors"
              aria-label="Share"
            >
              <Share2 size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Made with Bob
