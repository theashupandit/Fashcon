'use client';

import { ChevronRight } from 'lucide-react';

export default function ScrollButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 text-white/50 hover:text-white transition-all group animate-bounce"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll Down</span>
      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
        <ChevronRight size={20} className="rotate-90" />
      </div>
    </button>
  );
}
