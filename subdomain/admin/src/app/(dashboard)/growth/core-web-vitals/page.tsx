'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, LayoutGrid, Clock, MonitorPlay, History } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const vitals = [
  { name: 'Largest Contentful Paint', short: 'LCP', value: '1.2s', target: '< 2.5s', status: 'pass', icon: Clock, desc: 'Measures loading performance.' },
  { name: 'Cumulative Layout Shift', short: 'CLS', value: '0.01', target: '< 0.1', status: 'pass', icon: LayoutGrid, desc: 'Measures visual stability.' },
  { name: 'Interaction to Next Paint', short: 'INP', value: '85ms', target: '< 200ms', status: 'pass', icon: MonitorPlay, desc: 'Measures interactivity.' },
];

export default function CoreWebVitalsPage() {
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
          Core Web Vitals <Activity className="w-6 h-6 text-[#00ffd0]" />
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Real user experience metrics (Field Data).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {vitals.map((vital, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-2xl p-6 relative overflow-hidden border",
              isDark ? "bg-[#0B0B0C] border-emerald-500/20" : "bg-white border-emerald-500/20 shadow-sm"
            )}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">{vital.short}</h3>
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}>{vital.name}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <vital.icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-4xl font-black text-emerald-400">{vital.value}</span>
              <span className={cn(
                "text-sm ml-2",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}>Target: {vital.target}</span>
            </div>
            
            <p className={cn(
              "text-sm pt-4 border-t",
              isDark ? "text-zinc-400 border-white/5" : "text-zinc-500 border-black/5"
            )}>{vital.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className={cn(
        "rounded-2xl p-6 border",
        isDark ? "bg-[#111214] border-white/10" : "bg-white border-black/5 shadow-sm"
      )}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <History className={cn("w-5 h-5", isDark ? "text-white" : "text-black")} /> Historical Performance
        </h3>
        <div className={cn(
          "h-64 border border-dashed rounded-xl flex items-center justify-center",
          isDark ? "border-white/10 bg-white/[0.01]" : "border-black/10 bg-black/[0.01]"
        )}>
          <p className="text-zinc-500 text-sm font-medium">[ Core Web Vitals Trend Graph ]</p>
        </div>
      </div>
    </div>
  );
}
