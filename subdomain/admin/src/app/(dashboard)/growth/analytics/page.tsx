'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Timer, ArrowUpRight, 
  MapPin, Smartphone, Share2, MousePointerClick 
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const overview = [
  { label: 'Realtime Users', value: '1,204', change: '+45', icon: Activity, color: 'text-[#00ffd0]' },
  { label: 'Total Sessions', value: '84.2K', change: '+12%', icon: Users, color: 'text-white' },
  { label: 'Engagement Rate', value: '64.8%', change: '+2.1%', icon: MousePointerClick, color: 'text-zinc-300' },
  { label: 'Avg Session', value: '2m 14s', change: '+15s', icon: Timer, color: 'text-zinc-300' },
];

const trafficSources = [
  { source: 'Organic Search', users: '45,210', percentage: '54%' },
  { source: 'Direct', users: '18,400', percentage: '22%' },
  { source: 'Social (Pinterest)', users: '12,550', percentage: '15%' },
  { source: 'Referral', users: '8,040', percentage: '9%' },
];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight bg-clip-text text-transparent",
            isDark ? "bg-gradient-to-r from-white to-white/60" : "bg-gradient-to-r from-black to-black/60"
          )}>
            Google Analytics 4
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>Realtime user intelligence and traffic attribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffd0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ffd0]"></span>
          </span>
          <span className="text-sm font-medium text-[#00ffd0]">Live Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overview.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-2xl p-6 border",
              isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-2 rounded-lg border",
                isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
              )}>
                <item.icon className={cn(
                  "w-4 h-4",
                  item.color === 'text-white' ? (isDark ? 'text-white' : 'text-black') : 
                  item.color === 'text-zinc-300' ? (isDark ? 'text-zinc-300' : 'text-zinc-600') :
                  item.color
                )} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded">
                <ArrowUpRight className="w-3 h-3" /> {item.change}
              </div>
            </div>
            <p className={cn(
              "text-xs uppercase tracking-widest font-semibold mb-1",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}>{item.label}</p>
            <h3 className="text-3xl font-bold">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn(
          "lg:col-span-2 rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ff003c]" /> Active User Flow
          </h3>
          {/* Placeholder for Recharts / Chart.js */}
          <div className={cn(
            "h-64 flex items-center justify-center border border-dashed rounded-xl relative overflow-hidden",
            isDark ? "border-white/10" : "border-black/10"
          )}>
            <div className={cn(
              "absolute inset-0",
              isDark ? "bg-gradient-to-t from-[#ff003c]/5 to-transparent" : "bg-gradient-to-t from-[#ff003c]/10 to-transparent"
            )}></div>
            <p className={cn(
              "text-sm font-medium relative z-10",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>[ GA4 Realtime Chart Visualization ]</p>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#00ffd0]" /> Traffic Channels
          </h3>
          <div className="space-y-4">
            {trafficSources.map((source, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className={cn(
                    "font-medium",
                    isDark ? "text-zinc-300" : "text-zinc-600"
                  )}>{source.source}</span>
                  <span className={cn(
                    "font-bold",
                    isDark ? "text-white" : "text-black"
                  )}>{source.users}</span>
                </div>
                <div className={cn(
                  "w-full rounded-full h-1.5 overflow-hidden",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: source.percentage }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className={cn(
                      "h-full rounded-full",
                      isDark ? "bg-white" : "bg-black"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
