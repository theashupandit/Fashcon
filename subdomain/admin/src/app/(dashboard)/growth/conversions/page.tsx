'use client';
import React from 'react';
import { Target, TrendingUp, DollarSign, MousePointer2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function ConversionTrackingPage() {
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
          Growth Conversions
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Revenue attribution and conversion funnel tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
         {[
           { label: 'Conv. Rate', value: '3.42%', icon: Target },
           { label: 'Total Revenue', value: '$84,200', icon: DollarSign },
           { label: 'AOV', value: '$124', icon: TrendingUp },
           { label: 'ROAS', value: '4.2x', icon: MousePointer2 },
         ].map((m, i) => (
           <div key={i} className={cn(
             "rounded-xl p-5 border",
             isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
           )}>
             <div className="flex justify-between items-center mb-3">
               <span className={cn(
                 "text-[10px] font-black uppercase tracking-widest",
                 isDark ? "text-zinc-500" : "text-zinc-400"
               )}>{m.label}</span>
               <m.icon className="w-4 h-4 text-[#f97316]" />
             </div>
             <div className="text-2xl font-black">{m.value}</div>
           </div>
         ))}
      </div>
    </div>
  );
}
