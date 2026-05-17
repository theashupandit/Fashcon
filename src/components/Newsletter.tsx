'use client';

import { Send } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-14 sm:py-20 bg-[var(--primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4">
          Stay in the Loop
        </h2>
        <div className="w-16 h-1 bg-white mx-auto rounded-full mb-8" />
        <p className="text-[var(--primary-foreground)]/80 mb-8 sm:mb-10 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          Get exclusive styling tips, trend alerts, and secret deals delivered to your inbox weekly.
        </p>

        <form
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-grow px-5 py-3.5 sm:px-6 sm:py-4 rounded-[14px] bg-[var(--background)] border-2 border-transparent outline-none text-[var(--foreground)] font-medium focus:border-white/40 text-sm"
          />
          <button className="bg-[var(--foreground)] text-[var(--background)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-sm shrink-0">
            Subscribe <Send size={16} />
          </button>
        </form>

        <p className="text-[var(--primary-foreground)]/55 text-[11px] mt-5">
          By subscribing, you agree to our Privacy Policy and Terms of Service.
        </p>
      </div>
    </section>
  );
}
