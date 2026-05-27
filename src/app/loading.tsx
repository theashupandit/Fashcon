'use client';

import React from 'react';
import { FaPinterest, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function Loading() {

  return (
    <div className="fixed inset-0 z-[99999] bg-[var(--background)] flex flex-col items-center justify-center select-none pointer-events-auto touch-none">
      {/* Editorial Top Loading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100000] overflow-hidden">
        <div className="h-full bg-primary animate-[top-loading_2s_ease-in-out_infinite] shadow-[0_0_8px_var(--primary)]" />
      </div>

      <div className="flex flex-col items-center justify-center text-center max-w-sm px-6">
        {/* Brand Logo (Pulsing) */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-ping opacity-60" />
          <img 
            src="/favicon.png" 
            alt="Fashcon Logo" 
            className="w-20 h-20 object-contain relative z-10 animate-[pulse_1.5s_infinite_ease-in-out]" 
          />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-black italic tracking-tighter text-primary select-none flex items-baseline gap-0.5">
            <span>FASHCON</span>
            <span className="text-xs font-bold lowercase tracking-normal opacity-60">.store</span>
          </span>
          <div className="h-[1px] w-8 bg-primary/30 my-4 animate-[width-expand_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Social Presence / Find Us On */}
        <div className="flex items-center gap-4 text-primary/60 pt-4 mt-1 border-t border-[var(--foreground)]/5 w-full justify-center">
          <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-[var(--foreground)] opacity-40">Available on</span>
          <div className="flex items-center gap-3">
            <a 
              href="https://pinterest.com/fashcon" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors duration-300"
              aria-label="Pinterest"
            >
              <FaPinterest size={15} />
            </a>
            <a 
              href="https://instagram.com/fashcon.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors duration-300"
              aria-label="Instagram"
            >
              <FaInstagram size={15} />
            </a>
            <a 
              href="https://facebook.com/fashcon.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebook size={15} />
            </a>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes top-loading {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(0%) scaleX(0.8); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
        @keyframes width-expand {
          0%, 100% { width: 0px; opacity: 0.2; }
          50% { width: 32px; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
