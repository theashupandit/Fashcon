'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Eye, MousePointer2, Percent, 
  Trophy, AlertTriangle, FileWarning, Globe, Loader2
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { getGoogleSearchConsoleData } from '@/app/actions/analytics';

export default function SearchConsolePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getGoogleSearchConsoleData();
        setData(res);
      } catch (e) {
        console.error('Failed to load Search Console data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen p-8 flex flex-col items-center justify-center transition-colors duration-500",
        isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
          Fetching Search Analytics...
        </p>
      </div>
    );
  }

  const currentStats = data?.stats || {
    impressions: '1.2M',
    clicks: '45.2K',
    ctr: '3.8%',
    position: '12.4',
  };

  const metrics = [
    { label: 'Total Impressions', value: currentStats.impressions, icon: Eye },
    { label: 'Total Clicks', value: currentStats.clicks, icon: MousePointer2 },
    { label: 'Average CTR', value: currentStats.ctr, icon: Percent },
    { label: 'Avg Position', value: currentStats.position, icon: Trophy },
  ];

  const crawlErrors = data?.crawlErrors || [
    { issue: 'Crawled - currently not indexed', count: 24, status: 'warning' },
    { issue: 'Discovered - currently not indexed', count: 18, status: 'warning' },
    { issue: 'Soft 404', count: 3, status: 'error' },
    { issue: 'Duplicate without user-selected canonical', count: 5, status: 'error' },
  ];

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
        <div className="flex items-center gap-2">
          {data?.isSimulated ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Simulated Workspace</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffd0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ffd0]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00ffd0]">Live Sync Active</span>
            </>
          )}
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
                "text-[9px] font-black uppercase tracking-widest",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}>{item.label}</p>
              <item.icon className="w-4 h-4 text-[#ff003c]" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Globe className={cn("w-4 h-4", isDark ? "text-white" : "text-black")} /> Index Health Score
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
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Crawl Diagnostics
          </h3>
          <div className="space-y-3">
            {crawlErrors.map((err: any, i: number) => (
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
