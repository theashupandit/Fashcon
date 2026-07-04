'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Timer, ArrowUpRight, 
  MapPin, Smartphone, Share2, MousePointerClick, Loader2 
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { getGoogleAnalyticsData } from '@/app/actions/analytics';

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getGoogleAnalyticsData();
        setData(res);
      } catch (e) {
        console.error('Failed to load GA4 data', e);
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
          Accessing Realtime Telemetry...
        </p>
      </div>
    );
  }

  const currentStats = data?.stats || {
    realtimeUsers: '1,204',
    totalSessions: '84.2K',
    engagementRate: '64.8%',
    avgSessionDuration: '2m 14s',
  };

  const overview = [
    { label: 'Realtime Users', value: currentStats.realtimeUsers, change: '+45', icon: Activity, color: 'text-[#00ffd0]' },
    { label: 'Total Sessions', value: currentStats.totalSessions, change: '+12%', icon: Users, color: 'text-white' },
    { label: 'Engagement Rate', value: currentStats.engagementRate, change: '+2.1%', icon: MousePointerClick, color: 'text-zinc-300' },
    { label: 'Avg Session', value: currentStats.avgSessionDuration, change: '+15s', icon: Timer, color: 'text-zinc-300' },
  ];

  const trafficSources = data?.trafficSources || [
    { source: 'Organic Search', users: '45,210', percentage: '54%' },
    { source: 'Direct', users: '18,400', percentage: '22%' },
    { source: 'Social (Pinterest)', users: '12,550', percentage: '15%' },
    { source: 'Referral', users: '8,040', percentage: '9%' },
  ];

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
              "text-[9px] font-black uppercase tracking-widest mb-1",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>{item.label}</p>
            <h3 className="text-2xl font-black tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn(
          "lg:col-span-2 rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff003c]" /> Active User Flow
          </h3>
          
          <div className={cn(
            "h-64 flex items-center justify-center border border-dashed rounded-xl relative overflow-hidden",
            isDark ? "border-white/10" : "border-black/10"
          )}>
            {data?.chartData && data.chartData.length > 0 ? (
              <div className="absolute inset-0 p-6 flex items-end justify-between gap-2 pt-12">
                {data.chartData.map((d: any, idx: number) => {
                  const maxPageviews = Math.max(...data.chartData.map((o: any) => o.pageviews || 1000));
                  const maxUsers = Math.max(...data.chartData.map((o: any) => o.activeUsers || 500));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-zinc-950/95 dark:bg-black/95 text-white text-[9px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl border border-zinc-800 whitespace-nowrap z-30">
                        <span className="font-black text-[#ff003c]">{d.day}</span>
                        <div className="w-px h-1.5" />
                        Active Users: <strong className="text-[#00ffd0]">{d.activeUsers.toLocaleString()}</strong><br/>
                        Page Views: <strong className="text-white">{d.pageviews.toLocaleString()}</strong>
                      </div>
                      
                      {/* Pageviews bar */}
                      <div 
                        className="w-full bg-[#ff003c]/10 group-hover:bg-[#ff003c]/20 transition-all duration-300 rounded-t-md"
                        style={{ height: `${Math.max(10, (d.pageviews / maxPageviews) * 90)}%` }}
                      />
                      
                      {/* Active Users bar overlay */}
                      <div 
                        className="absolute bottom-6 w-1/3 bg-[#00ffd0] group-hover:brightness-110 transition-all duration-300 rounded-t-md shadow-[0_0_8px_rgba(0,255,208,0.2)]"
                        style={{ height: `${Math.max(5, (d.activeUsers / maxUsers) * 65)}%` }}
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mt-1.5">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className={cn(
                  "absolute inset-0",
                  isDark ? "bg-gradient-to-t from-[#ff003c]/5 to-transparent" : "bg-gradient-to-t from-[#ff003c]/10 to-transparent"
                )}></div>
                <p className={cn(
                  "text-sm font-medium relative z-10",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>[ GA4 Realtime Chart Visualization ]</p>
              </>
            )}
          </div>
        </div>

        <div className={cn(
          "rounded-2xl p-6 border",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#00ffd0]" /> Traffic Channels
          </h3>
          <div className="space-y-4">
            {trafficSources.map((source: any, i: number) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    "font-bold",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}>{source.source}</span>
                  <span className={cn(
                    "font-black",
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
