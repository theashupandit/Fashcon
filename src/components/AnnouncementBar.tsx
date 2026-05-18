'use client';

import { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-[60] flex min-h-[44px] w-full items-center justify-center overflow-hidden bg-gradient-to-r from-[#1a052e] via-[#6b0f6c] to-[#be123c] px-3 sm:px-6 py-2.5 text-white shadow-md">
      {/* Subtle pulse glow effect behind text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay pointer-events-none">
        <div className="h-full w-[200px] animate-pulse bg-white blur-[20px]" />
      </div>

      <div className="relative flex w-full max-w-[1400px] items-center justify-center">
        <div className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 leading-snug">
          <span className="opacity-90 flex items-center gap-1.5">
            <FaStar className="text-yellow-400 mb-[1px]" size={10} /> The Glow Up Edit is Here
          </span>
          <span className="hidden sm:inline text-[#FF8FB1]">✦</span>
          <Link
            href="#newsletter"
            className="italic text-white underline decoration-white/40 underline-offset-4 hover:decoration-white transition-all hover:text-[#FF8FB1]"
          >
            Unlock 15% Off Your First Order
          </Link>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-all hover:bg-white/25 hover:text-white hover:scale-105 active:scale-95"
          aria-label="Dismiss announcement"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}
