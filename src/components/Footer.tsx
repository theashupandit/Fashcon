'use client';

import { Instagram, Twitter, Facebook, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative bg-[var(--background)] text-[var(--foreground)] pt-14 pb-8 sm:pt-20 sm:pb-10 w-full transition-colors duration-500">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 sm:gap-12 mb-10 sm:mb-20">
          <div className="col-span-2 lg:col-span-1 max-w-sm">
            <Link
              href="/"
              className="mb-4 sm:mb-5 block text-3xl font-black italic text-[var(--primary)]"
            >
              FASHCON
            </Link>
            <p className="mb-5 text-sm leading-relaxed opacity-70">
              Your ultimate premium style guide. Curating the best in fashion, beauty, and lifestyle findings for the modern aesthetic.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a href="https://www.instagram.com/fashcon.in/" target="_blank" rel="noopener noreferrer" className="opacity-70 transition-all sm:hover:opacity-100 sm:hover:text-[#E4405F] sm:hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="#" className="opacity-70 transition-all sm:hover:opacity-100 sm:hover:text-[var(--primary)] sm:hover:scale-110">
                <Globe size={20} />
              </a>
              {/* <a href="#" className="opacity-70 transition-all sm:hover:opacity-100 sm:hover:text-[#1DA1F2] sm:hover:scale-110"><Twitter size={20} /></a> */}
              <a href="https://www.facebook.com/fashcon.in" target="_blank" rel="noopener noreferrer" className="opacity-70 transition-all sm:hover:opacity-100 sm:hover:text-[#1877F2] sm:hover:scale-110">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="mb-4 sm:mb-5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)]">Explore</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li><Link href="/category/dresses" className="transition-all sm:hover:text-[var(--primary)]">Dresses</Link></li>
              <li><Link href="/category/beauty" className="transition-all sm:hover:text-[var(--primary)]">Beauty</Link></li>
              <li><Link href="/category/home-decor" className="transition-all sm:hover:text-[var(--primary)]">Home Decor</Link></li>
              <li><Link href="/category/accessories" className="transition-all sm:hover:text-[var(--primary)]">Accessories</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="mb-4 sm:mb-5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)]">Company</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li><Link href="/blog" className="transition-all sm:hover:text-[var(--primary)]">Style Blog</Link></li>
              <li><Link href="/about" className="transition-all sm:hover:text-[var(--primary)]">Our Story</Link></li>
              <li><Link href="/contact" className="transition-all sm:hover:text-[var(--primary)]">Contact Us</Link></li>
              <li><Link href="/affiliate" className="transition-all sm:hover:text-[var(--primary)]">Affiliates</Link></li>
              <li><Link href="/disclaimer" className="transition-all sm:hover:text-[var(--primary)]">Disclaimer</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h4 className="mb-4 sm:mb-5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)]">Contact</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li>
                <a href="mailto:business@fashcon.store" className="sm:hover:text-[var(--primary)] transition-colors">
                  business@fashcon.store
                </a>
              </li>
              <li>Mumbai, India</li>
              <li>Global Shipping Findings</li>
            </ul>
            <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] grayscale hover:grayscale-0 transition-all duration-700 h-32 opacity-60 hover:opacity-100 shadow-xl shadow-[var(--primary)]/10 dark:shadow-black/60">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714234567890!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 border-t border-[var(--border)] pt-8 text-[9px] uppercase tracking-widest opacity-70 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-10 sm:text-[10px]">
          <p>© {new Date().getFullYear()} FASHCON STORES. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px]">
            <Link href="/privacy-policy" className="sm:hover:text-[var(--primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-use" className="sm:hover:text-[var(--primary)] transition-colors">Terms of Use</Link>
            <Link href="/disclaimer" className="sm:hover:text-[var(--primary)] transition-colors">Disclaimer</Link>
            <Link href="/affiliate" className="sm:hover:text-[var(--primary)] transition-colors">Affiliate Disclosure</Link>
            <a href="#" className="sm:hover:text-[var(--primary)] transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
