'use client';

import React from 'react';
import { Sparkles, Edit3, ArrowRight, Zap } from 'lucide-react';

export default function ContentOptimizerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
          AI Content Optimizer <Sparkles className="w-6 h-6 text-[#ff003c]" />
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Generative AI assistant for semantic SEO.</p>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Target Keyword</label>
            <div className="flex gap-4">
              <input type="text" placeholder="e.g. Vintage Leather Jackets" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff003c]/50 transition-colors" />
              <button className="bg-[#ff003c] text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ff003c]/90 transition-colors">
                <Zap className="w-4 h-4 fill-current" /> Analyze
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4" /> AI Generated Titles</h3>
              <div className="space-y-2">
                {['Vintage Leather Jackets: The Ultimate 2026 Style Guide', 'Authentic Vintage Leather Jackets for Men & Women | Fashcon', 'Why Vintage Leather Jackets are the Investment of the Year'].map((t, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg text-sm hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center group">
                    {t}
                    <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111214] p-6 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-300">Live SEO Score</h3>
              <div className="text-3xl font-black text-emerald-400">82<span className="text-sm text-zinc-500">/100</span></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium"><span className="text-zinc-400">Readability</span><span className="text-emerald-400">Optimal</span></div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[90%]" /></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium"><span className="text-zinc-400">Semantic Density</span><span className="text-amber-400">Needs Work</span></div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-amber-400 w-[60%]" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
