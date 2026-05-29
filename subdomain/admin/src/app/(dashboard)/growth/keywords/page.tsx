'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Key, TrendingUp, Search, Hash } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function KeywordIntelligencePage() {
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
          Keyword Intelligence
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Track ranking keywords, aesthetics, and seasonal trends.</p>
      </div>

      <div className={cn(
        "rounded-2xl p-6 border",
        isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={cn(
              "border-b",
              isDark ? "text-zinc-500 border-white/10" : "text-zinc-400 border-black/10"
            )}>
              <tr>
                <th className="pb-3 font-medium">Keyword / Aesthetic</th>
                <th className="pb-3 font-medium">Intent</th>
                <th className="pb-3 font-medium">Volume</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Rank</th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              isDark ? "divide-white/5" : "divide-black/5"
            )}>
              {[
                { kw: 'Old Money Fashion', intent: 'Commercial', vol: '110K', diff: '68', rank: '4', change: '+2' },
                { kw: 'Coquette Aesthetic', intent: 'Informational', vol: '450K', diff: '42', rank: '1', change: '0' },
                { kw: 'Soft Luxury Bags', intent: 'Transactional', vol: '22K', diff: '55', rank: '8', change: '+5' },
                { kw: 'Minimalist Winter Coats', intent: 'Commercial', vol: '80K', diff: '71', rank: '12', change: '-1' },
              ].map((item, i) => (
                <tr key={i} className={cn(
                  "transition-colors",
                  isDark ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.02]"
                )}>
                  <td className={cn(
                    "py-4 font-semibold flex items-center gap-2",
                    isDark ? "text-white" : "text-black"
                  )}>
                    <Hash className="w-3 h-3 text-[#ff003c]" /> {item.kw}
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      isDark ? "bg-white/5 text-zinc-300" : "bg-black/5 text-zinc-600"
                    )}>{item.intent}</span>
                  </td>
                  <td className={cn(
                    "py-4",
                    isDark ? "text-zinc-300" : "text-zinc-600"
                  )}>{item.vol}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-16 h-1.5 rounded-full overflow-hidden",
                        isDark ? "bg-white/10" : "bg-black/10"
                      )}>
                        <div className="h-full bg-amber-400" style={{ width: `${item.diff}%` }} />
                      </div>
                      <span className={cn(
                        "text-xs",
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      )}>{item.diff}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold flex items-center gap-2">
                    #{item.rank}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      item.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 
                      item.change.startsWith('-') ? 'bg-red-500/20 text-red-400' : 
                      (isDark ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-zinc-400')
                    )}>{item.change}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
