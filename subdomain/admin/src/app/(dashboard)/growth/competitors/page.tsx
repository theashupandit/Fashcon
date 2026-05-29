'use client';
import React from 'react';
import { Target, Activity, Zap, ExternalLink, Globe } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function CompetitorWatchPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10">
        <h1 className={cn(
          "text-3xl font-bold tracking-tight bg-clip-text text-transparent",
          isDark ? "bg-gradient-to-r from-white to-white/60" : "bg-gradient-to-r from-black to-black/60"
        )}>
          Competitor Intelligence
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Benchmark SEO visibility and performance against market rivals.</p>
      </div>

      <div className="space-y-4">
        {[
          { domain: 'luxuryfashion.com', visibility: '84.2', speed: '92', overlap: '14%' },
          { domain: 'minimalist-store.io', visibility: '42.1', speed: '78', overlap: '32%' },
          { domain: 'vogue-archive.net', visibility: '112.5', speed: '64', overlap: '8%' },
        ].map((c, i) => (
          <div key={i} className={cn(
            "rounded-2xl p-6 flex items-center justify-between border",
            isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
          )}>
            <div className="flex items-center gap-4">
               <div className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center border",
                 isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
               )}>
                  <Globe className="w-5 h-5 text-zinc-500" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{c.domain}</h3>
                  <button className={cn(
                    "text-[9px] font-black uppercase flex items-center gap-1 transition-colors",
                    isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-black"
                  )}>
                     View Public Profile <ExternalLink className="w-2.5 h-2.5" />
                  </button>
               </div>
            </div>
            <div className="flex items-center gap-12">
               <div className="text-center">
                  <div className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}>SEO Vis.</div>
                  <div className="text-lg font-black">{c.visibility}</div>
               </div>
               <div className="text-center">
                  <div className={cn(
                    "text-xs font-bold uppercase tracking-widest mb-1",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}>Perf.</div>
                  <div className="text-lg font-black text-[#00ffd0]">{c.speed}</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
