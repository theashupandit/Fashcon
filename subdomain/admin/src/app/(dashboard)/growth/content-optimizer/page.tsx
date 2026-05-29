'use client';

import React from 'react';
import { Sparkles, Edit3, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function ContentOptimizerPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10">
        <h1 className={cn(
          "text-3xl font-bold tracking-tight bg-clip-text text-transparent flex items-center gap-3",
          isDark ? "bg-gradient-to-r from-white to-white/60" : "bg-gradient-to-r from-black to-black/60"
        )}>
          AI Content Optimizer <Sparkles className="w-6 h-6 text-[#ff003c]" />
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Generative AI assistant for semantic SEO.</p>
      </div>

      <div className={cn(
        "rounded-2xl p-8 border",
        isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <label className={cn(
              "text-xs font-bold uppercase tracking-wider mb-2 block",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>Target Keyword</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="e.g. Vintage Leather Jackets" 
                className={cn(
                  "flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff003c]/50 transition-colors",
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"
                )} 
              />
              <button className="bg-[#ff003c] text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ff003c]/90 transition-colors">
                <Zap className="w-4 h-4 fill-current" /> Analyze
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className={cn(
                "text-sm font-bold mb-3 flex items-center gap-2",
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}><Edit3 className="w-4 h-4" /> AI Generated Titles</h3>
              <div className="space-y-2">
                {['Vintage Leather Jackets: The Ultimate 2026 Style Guide', 'Authentic Vintage Leather Jackets for Men & Women | Fashcon', 'Why Vintage Leather Jackets are the Investment of the Year'].map((t, i) => (
                  <div key={i} className={cn(
                    "p-3 border rounded-lg text-sm cursor-pointer transition-colors flex justify-between items-center group",
                    isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-black/5 border-black/5 hover:bg-black/10"
                  )}>
                    {t}
                    <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            "p-6 rounded-xl border",
            isDark ? "bg-[#111214] border-white/5" : "bg-black/5 border-black/5"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn(
                "text-sm font-bold",
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>Live SEO Score</h3>
              <div className="text-3xl font-black text-emerald-400">82<span className="text-sm text-zinc-500">/100</span></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium"><span className="text-zinc-400">Readability</span><span className="text-emerald-400">Optimal</span></div>
                <div className={cn(
                  "h-1.5 w-full rounded-full overflow-hidden",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}><div className="h-full bg-emerald-400 w-[90%]" /></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium"><span className="text-zinc-400">Semantic Density</span><span className="text-amber-400">Needs Work</span></div>
                <div className={cn(
                  "h-1.5 w-full rounded-full overflow-hidden",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}><div className="h-full bg-amber-400 w-[60%]" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
