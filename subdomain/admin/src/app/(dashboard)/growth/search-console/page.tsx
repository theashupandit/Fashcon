'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Eye, MousePointer2, Percent, 
  Trophy, AlertTriangle, FileWarning, Globe
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const metrics = [
  { label: 'Total Impressions', value: '1.2M', icon: Eye },
  { label: 'Total Clicks', value: '45.2K', icon: MousePointer2 },
  { label: 'Average CTR', value: '3.8%', icon: Percent },
  { label: 'Avg Position', value: '12.4', icon: Trophy },
];

export default function SearchConsolePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r flex items-center gap-3",
            isDark ? "from-white to-white/60" : "from-black to-black/60"
          )}>
            Search Console <Globe className="w-6 h-6 text-[#00ffd0]" />
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>Search visibility, indexing health, and crawl diagnostics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "border rounded-xl p-5 transition-all duration-500",
              isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isDark ? "text-zinc-400" : "text-zinc-500"
              )}>{item.label}</p>
              <item.icon className="w-4 h-4 text-[#ff003c]" />
            </div>
            <h3 className="text-2xl font-bold">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Globe className={cn("w-5 h-5", isDark ? "text-white" : "text-black")} /> Index Health Score
          </h3>
          <div className="flex items-center justify-center h-48">
            <div className={cn(
              "relative w-32 h-32 rounded-full border-8 flex items-center justify-center",
              isDark ? "border-white/10" : "border-black/5"
            )}>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500" strokeDasharray="350" strokeDashoffset="35" strokeLinecap="round"/>
              </svg>
              <div className="text-center">
                <span className="text-4xl font-black">90</span>
                <span className={cn(
                  "text-xs block uppercase",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>Score</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className={cn(
              "p-4 rounded-xl text-center",
              isDark ? "bg-white/5" : "bg-black/5"
            )}>
              <div className="text-2xl font-bold text-emerald-400 mb-1">1,402</div>
              <div className={cn(
                "text-xs uppercase tracking-wider",
                isDark ? "text-zinc-400" : "text-zinc-500"
              )}>Indexed</div>
            </div>
            <div className={cn(
              "p-4 rounded-xl text-center",
              isDark ? "bg-white/5" : "bg-black/5"
            )}>
              <div className="text-2xl font-bold text-amber-400 mb-1">45</div>
              <div className={cn(
                "text-xs uppercase tracking-wider",
                isDark ? "text-zinc-400" : "text-zinc-500"
              )}>Excluded</div>
            </div>
          </div>
        </div>

        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Crawl Diagnostics
          </h3>
          <div className="space-y-3">
            {[
              { issue: 'Crawled - currently not indexed', count: 24, status: 'warning' },
              { issue: 'Discovered - currently not indexed', count: 18, status: 'warning' },
              { issue: 'Soft 404', count: 3, status: 'error' },
              { issue: 'Duplicate without user-selected canonical', count: 5, status: 'error' },
            ].map((err, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
              )}>
                <div className="flex items-center gap-3">
                  <FileWarning className={`w-4 h-4 ${err.status === 'error' ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  )}>{err.issue}</span>
                </div>
                <span className={cn(
                  "font-bold px-2 py-0.5 rounded text-xs",
                  isDark ? "bg-white/10" : "bg-black/10"
                )}>{err.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
