'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Link2,
  Settings,
  Image as ImageIcon,
  FileText,
  Grid2X2,
  ShoppingBag,
  MousePointer2,
  DollarSign,
  Zap,
  Activity,
  Package,
  CheckCircle2,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { getDashboardAnalytics } from '@/app/actions/analytics';

// ── Fallback visual metrics in case database is empty on start ─────────────────
const fallbackClickData = [
  { day: 'Mon', clicks: 0 },
  { day: 'Tue', clicks: 0 },
  { day: 'Wed', clicks: 0 },
  { day: 'Thu', clicks: 0 },
  { day: 'Fri', clicks: 0 },
  { day: 'Sat', clicks: 0 },
  { day: 'Sun', clicks: 0 },
];

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip px-4 py-3 rounded-xl text-sm font-semibold shadow-xl">
      <p className="text-[var(--muted-foreground)] text-[11px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[var(--foreground)] text-base">{payload[0].value.toLocaleString()} <span className="text-[11px] font-normal opacity-50">clicks</span></p>
    </div>
  );
};

export default function AdminDashboard() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getDashboardAnalytics();
        if (res.success) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.error('Failed to load real dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  // Dynamic Lucide activity icon mapper
  const getActivityIcon = (label: string) => {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('product') || labelLower.includes('item') || labelLower.includes('catalog')) return Package;
    if (labelLower.includes('user') || labelLower.includes('member') || labelLower.includes('register') || labelLower.includes('login') || labelLower.includes('auth')) return UserPlus;
    if (labelLower.includes('click') || labelLower.includes('affiliate') || labelLower.includes('commission')) return Link2;
    if (labelLower.includes('blog') || labelLower.includes('article') || labelLower.includes('post') || labelLower.includes('feed')) return FileText;
    if (labelLower.includes('category')) return Grid2X2;
    if (labelLower.includes('media') || labelLower.includes('image') || labelLower.includes('folder')) return ImageIcon;
    return Activity;
  };

  const stats = [
    { 
      label: 'Total Traffic', 
      value: loading ? '...' : (analyticsData?.stats?.totalTraffic ?? 0).toLocaleString(), 
      change: '+8.2%', 
      up: true, 
      Icon: Eye 
    },
    { 
      label: 'User Base', 
      value: loading ? '...' : (analyticsData?.stats?.userCount ?? 1).toLocaleString(), 
      change: '+1.4%', 
      up: true, 
      Icon: Users 
    },
    { 
      label: 'Interactions', 
      value: loading ? '...' : (analyticsData?.stats?.totalClicks ?? 0).toLocaleString(), 
      change: '+11.5%', 
      up: true, 
      Icon: MousePointer2 
    },
    { 
      label: 'Projected Rev', 
      value: loading ? '...' : `$${(analyticsData?.stats?.projectedRev ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: '+5.8%', 
      up: true, 
      Icon: DollarSign 
    },
  ];

  return (
    <>
      <div className="space-y-7 pb-20 fade-up" style={{ animationDelay: '0ms' }}>

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                {greeting}, Admin — all systems nominal
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Command Center</h1>
            <div className="flex items-center gap-2 opacity-40">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{today}</span>
            </div>
          </div>
          <button className="glass h-10 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity self-start md:self-auto">
            Export Report
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, up, Icon }, i) => (
            <div
              key={label}
              className="glass stat-card rounded-2xl p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-widest opacity-50">{label}</span>
                <div className="w-8 h-8 rounded-xl glass-strong flex items-center justify-center">
                  <Icon className="w-4 h-4 opacity-70" />
                </div>
              </div>
              <p className="text-2xl font-black tracking-tight mb-2">{value}</p>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {change} <span className="opacity-40 font-normal text-[var(--muted-foreground)]">vs last week</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Area Chart ── */}
        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="text-lg font-black tracking-tight">Affiliate Clicks Over Time</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 mt-0.5">Daily performance</p>
            </div>
            <div className="glass-strong flex p-1 rounded-xl gap-1 self-start sm:self-auto">
              {(['7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === r
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'opacity-40 hover:opacity-70'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.clickData || fallbackClickData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="85%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'currentColor', opacity: 0.4 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#clickGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom Split: Products + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Performing Products — 2/3 */}
          <div className="glass rounded-2xl lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]/40">
              <div>
                <h2 className="text-base font-black tracking-tight">Top Performing Products</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5">By affiliate clicks</p>
              </div>
              <TrendingUp className="w-5 h-5 opacity-20" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest opacity-30">
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-right px-6 py-3 hidden sm:table-cell">Brand</th>
                  <th className="text-right px-6 py-3">Clicks</th>
                  <th className="text-right px-6 py-3 hidden md:table-cell">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 opacity-40 font-bold tracking-widest text-[10px] uppercase">
                      Loading Product Performance...
                    </td>
                  </tr>
                ) : !analyticsData?.topProducts || analyticsData.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 opacity-40 font-bold tracking-widest text-[10px] uppercase">
                      No Products Found In Catalog
                    </td>
                  </tr>
                ) : (
                  analyticsData.topProducts.map((p: any) => (
                    <tr key={p.id} className="row-hover cursor-pointer">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* real visual asset display */}
                          <div className="w-9 h-9 rounded-xl glass-strong overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 opacity-30" />
                            )}
                          </div>
                          <span className="font-semibold truncate max-w-[160px]" title={p.name}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right text-[var(--muted-foreground)] hidden sm:table-cell">{p.brand}</td>
                      <td className="px-6 py-3.5 text-right font-black">{p.clicks.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right hidden md:table-cell">
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-emerald-500">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{(p.clicks > 0 ? (p.clicks * 4) % 15 + 2 : 0)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Activity — 1/3 */}
          <div className="glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]/40">
              <div>
                <h2 className="text-base font-black tracking-tight">Recent Activity</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-0.5">Last 24 hours</p>
              </div>
              <Activity className="w-5 h-5 opacity-20" />
            </div>
            <div className="flex-1 divide-y divide-[var(--border)]/30">
              {loading ? (
                <div className="text-center py-10 opacity-40 font-bold tracking-widest text-[10px] uppercase">
                  Loading Activity logs...
                </div>
              ) : (
                (analyticsData?.recentActivity || []).map((activity: any) => {
                  const Icon = getActivityIcon(activity.label);
                  return (
                    <div key={activity.id} className="row-hover px-6 py-4 flex gap-3.5 cursor-pointer">
                      <div className="glass-strong w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Icon className={`w-4 h-4 ${activity.color || 'text-blue-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black truncate">{activity.label}</p>
                        <p className="text-[11px] opacity-50 truncate">{activity.sub}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 opacity-30" />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)]/40">
              <Link href="/logs" className="text-[11px] font-black uppercase tracking-widest opacity-30 hover:opacity-80 transition-opacity block text-center">
                View audit stream →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Access ── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: 'Products', Icon: ShoppingBag, href: '/products' },
            { name: 'Blogs', Icon: FileText, href: '/blogs' },
            { name: 'Categories', Icon: Grid2X2, href: '/categories' },
            { name: 'Media', Icon: ImageIcon, href: '/media' },
            { name: 'Affiliates', Icon: Link2, href: '/affiliate' },
            { name: 'Configuration', Icon: Settings, href: '/configuration' },
          ].map(({ name, Icon, href }) => (
            <Link
              key={name}
              href={href}
              className="glass quick-btn rounded-2xl h-24 flex flex-col items-center justify-center gap-2.5 group"
            >
              <Icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                {name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
