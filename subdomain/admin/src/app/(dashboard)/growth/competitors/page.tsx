'use client';
import React from 'react';
import { Target, Activity, Zap, ExternalLink } from 'lucide-react';

export default function CompetitorWatchPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Competitor Intelligence
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Benchmark SEO visibility and performance against market rivals.</p>
      </div>

      <div className="space-y-4">
        {[
          { domain: 'luxuryfashion.com', visibility: '84.2', speed: '92', overlap: '14%' },
          { domain: 'minimalist-store.io', visibility: '42.1', speed: '78', overlap: '32%' },
          { domain: 'vogue-archive.net', visibility: '112.5', speed: '64', overlap: '8%' },
        ].map((c, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Globe className="w-5 h-5 text-zinc-500" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{c.domain}</h3>
                  <button className="text-[9px] font-black uppercase text-zinc-500 flex items-center gap-1 hover:text-white transition-colors">
                     View Public Profile <ExternalLink className="w-2.5 h-2.5" />
                  </button>
               </div>
            </div>
            <div className="flex items-center gap-12">
               <div className="text-center">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">SEO Vis.</div>
                  <div className="text-lg font-black">{c.visibility}</div>
               </div>
               <div className="text-center">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Perf.</div>
                  <div className="text-lg font-black text-[#00ffd0]">{c.speed}</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
