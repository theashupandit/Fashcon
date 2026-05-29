'use client';
import React from 'react';
import { Users, Globe, Smartphone, UserCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function AudienceInsightsPage() {
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
          Audience Intelligence
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Deep demographic and behavioral analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="font-bold mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-[#0ea5e9]" /> Geographic Distribution</h3>
          <div className="space-y-4">
            {[
              { country: 'United States', percentage: '45%', count: '18,400' },
              { country: 'United Kingdom', percentage: '12%', count: '5,200' },
              { country: 'India', percentage: '8%', count: '3,100' },
              { country: 'Canada', percentage: '6%', count: '2,800' },
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={cn(
                  "text-xs font-bold w-24",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}>{g.country}</span>
                <div className={cn(
                  "flex-1 h-2 rounded-full overflow-hidden",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}>
                  <div className="h-full bg-[#0ea5e9]" style={{ width: g.percentage }} />
                </div>
                <span className={cn(
                  "text-xs font-black",
                  isDark ? "text-white" : "text-black"
                )}>{g.percentage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={cn(
          "rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="font-bold mb-6 flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" /> Device Breakdown</h3>
          <div className="flex items-center justify-around h-32">
             <div className="text-center">
                <div className={cn(
                  "text-2xl font-black",
                  isDark ? "text-white" : "text-black"
                )}>74%</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>Mobile</div>
             </div>
             <div className="text-center">
                <div className={cn(
                  "text-2xl font-black",
                  isDark ? "text-white" : "text-black"
                )}>22%</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>Desktop</div>
             </div>
             <div className="text-center">
                <div className={cn(
                  "text-2xl font-black",
                  isDark ? "text-white" : "text-black"
                )}>4%</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>Tablet</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
