'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MousePointer2,
  Eye,
  Target,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Globe,
  Smartphone,
  PieChart as PieChartIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Sector,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/StatsCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from '@/components/ThemeProvider';
import { getDashboardAnalytics } from '@/app/actions/analytics';
import { getPinterestAnalytics } from '@/app/actions/pinterest';
import PinterestOverallPerformance from '@/components/admin/PinterestOverallPerformance';

// ── Fallback bootstrap visual metrics in case database is empty on start ────────
const fallbackPerformanceData = [
  { name: 'Jan', views: 0, clicks: 0, ctr: 0, earnings: 0 },
  { name: 'Feb', views: 0, clicks: 0, ctr: 0, earnings: 0 },
  { name: 'Mar', views: 0, clicks: 0, ctr: 0, earnings: 0 },
  { name: 'Apr', views: 0, clicks: 0, ctr: 0, earnings: 0 },
  { name: 'May', views: 0, clicks: 0, ctr: 0, earnings: 0 },
  { name: 'Jun', views: 0, clicks: 0, ctr: 0, earnings: 0 },
];

const fallbackCategoryData = [
  { name: 'No Categories Map', value: 100, color: '#f43f5e', gradient: 'url(#pie-gradient-1)' }
];

const fallbackConversionData = [
  { name: 'Mon', rate: 0 },
  { name: 'Tue', rate: 0 },
  { name: 'Wed', rate: 0 },
  { name: 'Thu', rate: 0 },
  { name: 'Fri', rate: 0 },
  { name: 'Sat', rate: 0 },
  { name: 'Sun', rate: 0 },
];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState('Quarter');
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [pinterestAnalytics, setPinterestAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPinterest, setLoadingPinterest] = useState(true);
  const [refreshingPinterest, setRefreshingPinterest] = useState(false);

  const refreshPinterestData = async () => {
    setRefreshingPinterest(true);
    try {
      const res = await getPinterestAnalytics(true);
      setPinterestAnalytics(res);
      toast.success("Successfully synchronized live Pinterest metrics!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to refresh Pinterest data.");
    } finally {
      setRefreshingPinterest(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getDashboardAnalytics();
        if (res.success) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.error('Failed to load real intelligence analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPinterest = async () => {
      try {
        const res = await getPinterestAnalytics();
        setPinterestAnalytics(res);
      } catch (err) {
        console.error('Failed to load Pinterest analytics:', err);
      } finally {
        setLoadingPinterest(false);
      }
    };

    fetchAnalytics();
    fetchPinterest();
  }, []);

  const handleExport = () => {
    const dataToExport = analyticsData?.performanceData || fallbackPerformanceData;
    const headers = ['Month', 'Views', 'Clicks', 'CTR', 'Earnings'];
    const csvData = dataToExport.map((d: any) => [d.name, d.views, d.clicks, d.ctr, d.earnings].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fashcon_intelligence_${timeRange.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Intelligence Report Exported', {
      description: 'Your live database analytics have been successfully downloaded as a CSV.'
    });
  };

  const performanceData = analyticsData?.performanceData || fallbackPerformanceData;
  const categoryData = analyticsData?.categoryAffinity || fallbackCategoryData;
  const conversionData = analyticsData?.conversionData || fallbackConversionData;
  const deviceEcosystem = analyticsData?.deviceEcosystem || [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <PageHeader
        title="Intelligence Center"
        subtitle="Advanced metrics and conversion modeling"
        badge="Live"
        actions={
          <>
            <div className="flex bg-[var(--card)] border border-[var(--border)] p-1 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
              {['Month', 'Quarter', 'Year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                    timeRange === range ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="h-11 w-full sm:w-auto px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none transition-all active:scale-95"
            >
              <Download size={16} /> Export Intelligence
            </Button>
          </>
        }
      />

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 backdrop-blur-md p-1 h-12 flex items-center justify-start gap-1 overflow-x-auto no-scrollbar rounded-xl mb-8">
          <TabsTrigger value="store" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 text-xs px-6 py-2 text-zinc-600 dark:text-zinc-300 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300">
            Store Intelligence
          </TabsTrigger>
          <TabsTrigger value="pinterest" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 text-xs px-6 py-2 text-zinc-600 dark:text-zinc-300 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300">
            Pinterest Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-8 outline-none animate-in fade-in duration-500">
          {/* Main KPI Grid with Standardized StatsCards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard
              label="Conversion Rate"
              value={loading ? "..." : `${analyticsData?.stats?.conversionRate ?? 0}%`}
              change="+1.2%"
              trend="up"
              icon={Target}
              color="text-[var(--primary)]"
              variant="gradient"
            />
            <StatsCard
              label="Avg. Order Value"
              value={loading ? "..." : `$${(analyticsData?.stats?.avgOrderValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change="+15%"
              trend="up"
              icon={Zap}
              color="text-emerald-500"
              variant="default"
            />
            <StatsCard
              label="Traffic Growth"
              value={loading ? "..." : (analyticsData?.stats?.totalTraffic ?? 0).toLocaleString()}
              change="+8.4%"
              trend="up"
              icon={Globe}
              color="text-blue-500"
              variant="minimal"
            />
            <StatsCard
              label="Mobile Share"
              value={loading ? "..." : `${analyticsData?.stats?.mobileShare ?? 0}%`}
              change="-0.5%"
              trend="down"
              icon={Smartphone}
              color="text-orange-500"
              variant="default"
            />
          </div>

          {/* Charts Section with Glass/Glow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="relative bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm group">
              <CardHeader className="p-8 pb-0 relative z-10">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <MousePointer2 className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      Engagement Modeling
                    </div>
                    <CardDescription className="text-[11px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Interaction & Performance</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-10 h-[400px]">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
                    Synchronizing live views and commissions...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--foreground)', opacity: 0.3 }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" name="Impressions" />
                      <Area type="monotone" dataKey="earnings" stroke="var(--foreground)" strokeWidth={2} strokeOpacity={0.2} fillOpacity={1} fill="url(#colorEarnings)" name="Est Earnings" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black tracking-tight">CTR Velocity</CardTitle>
                <CardDescription className="text-[13px] font-medium opacity-40">Conversion rate percentage progression</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-10 h-[400px]">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
                    Calculating weekly progression...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--foreground)', opacity: 0.3 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px' }} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--primary)"
                        strokeWidth={6}
                        dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 4, stroke: 'var(--card)' }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--foreground)' }}
                        name="CTR %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden relative group shadow-sm transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--primary)]/10 transition-all duration-700" />
              <CardHeader className="p-8 pb-0 relative z-10">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 opacity-40" />
                  Category Affinity
                </CardTitle>
                <CardDescription className="text-[13px] font-medium opacity-40 italic">Category-wise market penetration</CardDescription>
              </CardHeader>
              <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
                    Analyzing catalog diversity...
                  </div>
                ) : (
                  <div className="relative w-full aspect-square max-h-[260px] mx-auto">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <AnimatePresence mode="wait">
                        {activeCategory ? (
                          <motion.div
                            key={activeCategory.name}
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="flex flex-col items-center animate-pulse"
                          >
                            <span className="text-[38px] font-black tracking-tighter leading-none" style={{ color: activeCategory.color }}>
                              {activeCategory.value}%
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-center opacity-70 mt-2 px-4 max-w-[140px] truncate">
                              {activeCategory.name}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center opacity-40"
                          >
                            <span className="text-[36px] font-black tracking-tighter text-[var(--foreground)]">100<span className="text-[14px] opacity-30">%</span></span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 -mt-1">Inventory</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter id="pie-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                          <linearGradient id="pie-gradient-1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#fb7185" />
                          </linearGradient>
                          <linearGradient id="pie-gradient-2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                          <linearGradient id="pie-gradient-3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                          <linearGradient id="pie-gradient-4" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                        </defs>
                        {/* Decorative background ring */}
                        <Pie
                          data={[{ value: 1 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius="72%"
                          outerRadius="73%"
                          fill="var(--foreground)"
                          opacity={0.05}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        />
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius="75%"
                          outerRadius="100%"
                          paddingAngle={8}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                          onMouseEnter={(_, index) => setActiveCategory(categoryData[index])}
                          onMouseLeave={() => setActiveCategory(null)}
                          onClick={(_, index) => setActiveCategory(categoryData[index])}
                          stroke="none"
                          activeShape={(props: any) => {
                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                            return (
                              <g>
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius}
                                  outerRadius={outerRadius + 8}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  className="transition-all duration-300"
                                  style={{ filter: `drop-shadow(0 0 15px ${fill}60)` }}
                                />
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius - 4}
                                  outerRadius={innerRadius}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  opacity={0.3}
                                />
                              </g>
                            );
                          }}
                        >
                          {categoryData.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.gradient || entry.color || '#f43f5e'}
                              className={cn(
                                "transition-all duration-300 cursor-pointer outline-none hover:opacity-100",
                                activeCategory?.name === entry.name ? "opacity-100" : "opacity-80"
                              )}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={() => null} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm relative group transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tl from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[var(--primary)]/10 transition-all duration-700" />
              <CardHeader className="p-8 pb-0 relative z-10">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Smartphone className="w-5 h-5 opacity-40" />
                  Device Ecosystem
                </CardTitle>
                <CardDescription className="text-[13px] font-medium opacity-40 italic">Hardware platform market penetration</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 h-[400px]">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
                    Mapping hardware endpoints...
                  </div>
                ) : deviceEcosystem.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
                    No Device Data Tracked
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={deviceEcosystem}>
                      <PolarGrid stroke="var(--foreground)" strokeOpacity={0.1} />
                      <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--foreground)', opacity: 0.4, fontSize: 10, fontWeight: 900 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          backdropFilter: 'blur(12px)',
                          color: 'var(--foreground)'
                        }}
                        itemStyle={{ color: 'var(--primary)', fontWeight: 900, fontSize: '10px' }}
                      />
                      <Radar
                        name="Devices"
                        dataKey="val"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.4}
                        strokeWidth={3}
                        animationBegin={0}
                        animationDuration={1500}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pinterest" className="space-y-6 outline-none animate-in fade-in duration-500">
          {loadingPinterest ? (
            <div className="h-96 w-full flex items-center justify-center font-bold uppercase tracking-widest text-[10px] opacity-40">
              Synchronizing live Pinterest metrics...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Pinterest Performance Workspace</h2>
                  <p className="text-xs text-muted-foreground">Comprehensive Pinterest growth, engagement, and click-through analysis.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshPinterestData} 
                    disabled={refreshingPinterest}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white text-[11px] font-bold uppercase tracking-wider rounded-xl h-9 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingPinterest ? "animate-spin" : ""}`} />
                    {refreshingPinterest ? "Syncing..." : "Sync Live API"}
                  </Button>
                  {pinterestAnalytics?.stats?.isSimulated ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full">
                      Simulated Sandbox Data
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full">
                      Live Pinterest Account
                    </Badge>
                  )}
                </div>
              </div>

              {/* Pinterest Overall Performance workspace */}
              <PinterestOverallPerformance
                stats={pinterestAnalytics?.stats}
                refreshing={refreshingPinterest}
              />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Weekly trends Area Chart */}
                <Card className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 p-5 lg:col-span-12 rounded-2xl shadow-sm">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">Growth Trends & Activity Flow</CardTitle>
                    <CardDescription className="text-xs">Weekly views, saves, and link clicks.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={pinterestAnalytics?.stats?.weeklyTrends || [
                          { name: 'Week 1', impressions: 400, saves: 12, clicks: 50 },
                          { name: 'Week 2', impressions: 700, saves: 18, clicks: 80 },
                          { name: 'Week 3', impressions: 600, saves: 15, clicks: 75 },
                          { name: 'Week 4', impressions: 1100, saves: 28, clicks: 120 },
                          { name: 'Week 5', impressions: 950, saves: 24, clicks: 110 },
                          { name: 'Week 6', impressions: 1420, saves: 42, clicks: 188 },
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-white/5" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderColor: '#e4e4e7',
                            color: '#18181b', 
                            borderRadius: '12px',
                            fontSize: '11px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                          itemStyle={{ color: '#18181b' }}
                          labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                        />
                        <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
                        <Area type="monotone" dataKey="saves" name="Saves" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSaves)" />
                        <Area type="monotone" dataKey="clicks" name="Link Clicks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Board stats Bar Chart */}
                <Card className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 p-5 lg:col-span-12 rounded-2xl shadow-sm">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">Board Performance</CardTitle>
                    <CardDescription className="text-xs">Impressions distribution by key Pinterest boards.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pinterestAnalytics?.stats?.boardStats || [
                          { name: 'Luxury Gowns', impressions: 650 },
                          { name: 'Bridal Couture', impressions: 420 },
                          { name: 'Ready-To-Wear', impressions: 280 },
                          { name: 'Accessories', impressions: 180 },
                        ]}
                        margin={{ top: 20, right: 10, left: -20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-white/5" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#888888" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderColor: '#e4e4e7',
                            color: '#18181b',
                            borderRadius: '12px',
                            fontSize: '11px'
                          }}
                          itemStyle={{ color: '#18181b' }}
                          labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                        />
                        <Bar dataKey="impressions" name="Impressions" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={50}>
                          <LabelList 
                            dataKey="impressions" 
                            position="top" 
                            fontSize={10} 
                            fontWeight="bold" 
                            fill={isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)"}
                            offset={10}
                          />
                        </Bar>
                      </BarChart>

                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
