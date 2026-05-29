'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowUpRight, TrendingUp, Zap, ServerCrash, 
  Search, ShieldAlert, Sparkles, LineChart, Globe,
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const stats = [
  { name: 'Organic Traffic', value: '45.2K', change: '+12.5%', trend: 'up', icon: Activity },
  { name: 'Ranking Velocity', value: '+14', change: 'Top 10s', trend: 'up', icon: TrendingUp },
  { name: 'Index Health', value: '98%', change: '-2 errors', trend: 'up', icon: Globe },
  { name: 'Core Web Vitals', value: 'Passed', change: 'LCP 1.2s', trend: 'up', icon: Zap },
  { name: 'AI SEO Score', value: '92/100', change: '+5 points', trend: 'up', icon: Sparkles },
  { name: 'Revenue Attribution', value: '$12.4K', change: '+18.2%', trend: 'up', icon: LineChart },
];

const insights = [
  { title: 'Category pages gaining traction', desc: 'Old Money aesthetics seeing 34% increase in organic CTR.', type: 'positive' },
  { title: 'LCP degrading on mobile', desc: 'Product pages have dropped by 0.4s. Image optimization recommended.', type: 'warning' },
  { title: 'Pinterest traffic increased 18%', desc: 'Soft Luxury pins are converting at a higher rate.', type: 'positive' },
  { title: 'Keyword opportunity', desc: '"Minimalist Winter Coats" is a rising trend with low difficulty.', type: 'neutral' },
];

const issues = [
  { issue: 'Missing meta descriptions on 14 product pages', severity: 'high', icon: ShieldAlert },
  { issue: 'Duplicate title tags in /blog/category', severity: 'medium', icon: AlertTriangle },
  { issue: 'Orphan pages detected in Sitemap', severity: 'low', icon: AlertCircle },
];

export default function SeoCommandCenter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
            isDark ? "from-white to-white/60" : "from-black to-black/60"
          )}>
            Growth Intelligence
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>Mission Control for Fashcon Growth</p>
        </div>
        <button className={cn(
          "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium",
          isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-black/5 border-black/10 hover:bg-black/10 text-black"
        )}>
          <RefreshCw className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      {/* Top Section: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "border rounded-2xl p-6 relative overflow-hidden group transition-all duration-500",
              isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
              isDark ? "from-white/5 to-transparent" : "from-black/5 to-transparent"
            )} />
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-3 rounded-xl",
                isDark ? "bg-white/5" : "bg-black/5"
              )}>
                <stat.icon className={cn("w-5 h-5", isDark ? "text-white/70" : "text-black/70")} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className={cn(
                "text-sm font-medium mb-1",
                isDark ? "text-zinc-400" : "text-zinc-500"
              )}>{stat.name}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: AI Insights */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#ff003c]" />
          <h2 className="text-xl font-semibold">AI Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={cn(
                "border rounded-xl p-5 flex items-start gap-4 transition-all duration-500",
                isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
              )}
            >
              <div className={cn(
                "p-2 rounded-full mt-1",
                insight.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              )}>
                {insight.type === 'positive' ? <TrendingUp className="w-4 h-4" /> :
                 insight.type === 'warning' ? <ServerCrash className="w-4 h-4" /> :
                 <Search className="w-4 h-4" />}
              </div>
              <div>
                <h4 className={cn(
                  "font-medium mb-1",
                  isDark ? "text-zinc-100" : "text-zinc-900"
                )}>{insight.title}</h4>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}>{insight.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Issue Monitoring */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#00ffd0]" />
          Active Monitor
        </h2>
        <div className={cn(
          "border rounded-2xl overflow-hidden transition-all duration-500",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          {issues.map((issue, i) => (
            <div key={i} className={cn(
              "border-b last:border-0 p-5 flex items-center justify-between transition-colors",
              isDark ? "border-white/5 hover:bg-white/[0.02]" : "border-black/5 hover:bg-black/[0.02]"
            )}>
              <div className="flex items-center gap-4">
                <issue.icon className={`w-5 h-5 ${
                  issue.severity === 'high' ? 'text-red-400' :
                  issue.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                }`} />
                <span className={cn(
                  "text-sm font-medium",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}>{issue.issue}</span>
              </div>
              <button className={cn(
                "text-xs px-3 py-1.5 rounded-md transition-colors",
                isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black"
              )}>
                Investigate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
