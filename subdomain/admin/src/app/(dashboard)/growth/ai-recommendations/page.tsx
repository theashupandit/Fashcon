'use client';
import React from 'react';
import { Sparkles, MessageSquare, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function AiRecommendationsPage() {
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
          AI Growth Engine <Sparkles className="w-6 h-6 text-[#a855f7]" />
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Neural insights and automated growth strategies.</p>
      </div>

      <div className="space-y-4">
        {[
          { type: 'SEO Fix', title: 'Internal Linking Opportunity', desc: 'Category "Vintage" has 14 orphan products. Suggested links ready.', severity: 'high' },
          { type: 'Pinterest', title: 'Viral Aesthetic Alert', desc: '"Soft Luxury" pins are seeing 3x engagement. Increase pipeline volume.', severity: 'medium' },
          { type: 'Content', title: 'Keyword Gap Detected', desc: 'Competitors ranking for "Vegan Leather Boots". Suggest drafting collection guide.', severity: 'low' },
        ].map((rec, i) => (
          <div key={i} className={cn(
            "rounded-2xl p-6 relative overflow-hidden group border",
            isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
          )}>
            <div className="flex items-start justify-between">
               <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    isDark ? "bg-white/5 text-zinc-400 group-hover:text-white" : "bg-black/5 text-zinc-500 group-hover:text-black"
                  )}>
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] mb-1 block">{rec.type}</span>
                     <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
                     <p className={cn(
                       "text-sm leading-relaxed max-w-xl",
                       isDark ? "text-zinc-500" : "text-zinc-600"
                     )}>{rec.desc}</p>
                  </div>
               </div>
               <button className={cn(
                 "flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:scale-105 transition-all",
                 isDark ? "bg-white text-black" : "bg-black text-white"
               )}>
                  Execute <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
