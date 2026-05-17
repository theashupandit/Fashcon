'use client';

import React, { useState } from 'react';
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
  PieChart as PieChartIcon
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Sector,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from '@/components/admin/PageHeader';


const performanceData = [
  { name: 'Jan', views: 4000, clicks: 2400, ctr: 0.60, earnings: 1200 },
  { name: 'Feb', views: 3000, clicks: 1398, ctr: 0.46, earnings: 800 },
  { name: 'Mar', views: 2000, clicks: 9800, ctr: 4.90, earnings: 3400 },
  { name: 'Apr', views: 2780, clicks: 3908, ctr: 1.40, earnings: 1900 },
  { name: 'May', views: 1890, clicks: 4800, ctr: 2.54, earnings: 2100 },
  { name: 'Jun', views: 2390, clicks: 3800, ctr: 1.59, earnings: 1700 },
  { name: 'Jul', views: 3490, clicks: 4300, ctr: 1.23, earnings: 2200 },
];

const categoryData = [
  { name: 'Streetwear', value: 45, color: '#f43f5e', gradient: 'url(#pie-gradient-1)' },
  { name: 'Luxury', value: 30, color: '#8b5cf6', gradient: 'url(#pie-gradient-2)' },
  { name: 'Vintage', value: 15, color: '#10b981', gradient: 'url(#pie-gradient-3)' },
  { name: 'Accessories', value: 10, color: '#f59e0b', gradient: 'url(#pie-gradient-4)' },
];

const conversionData = [
  { name: 'Mon', rate: 2.1 },
  { name: 'Tue', rate: 2.5 },
  { name: 'Wed', rate: 3.2 },
  { name: 'Thu', rate: 2.8 },
  { name: 'Fri', rate: 4.1 },
  { name: 'Sat', rate: 4.5 },
  { name: 'Sun', rate: 3.8 },
];

import StatsCard from '@/components/admin/StatsCard';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Quarter');
  const [activeCategory, setActiveCategory] = useState<any>(null);

  const handleExport = () => {
    const headers = ['Month', 'Views', 'Clicks', 'CTR', 'Earnings'];
    const csvData = performanceData.map(d => [d.name, d.views, d.clicks, d.ctr, d.earnings].join(','));
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
      description: 'Your analytics data has been downloaded as a CSV.'
    });
  };

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
              className="h-11 w-full sm:w-auto px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none transition-all active:scale-95"
            >
              <Download size={16} /> Export Intelligence
            </Button>
          </>
        }
      />

      {/* Main KPI Grid with Standardized StatsCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard
          label="Conversion Rate"
          value="4.8%"
          change="+1.2%"
          trend="up"
          icon={Target}
          color="text-[var(--primary)]"
          variant="gradient"
        />
        <StatsCard
          label="Avg. Order Value"
          value="$124.50"
          change="+15%"
          trend="up"
          icon={Zap}
          color="text-emerald-500"
          variant="default"
        />
        <StatsCard
          label="Traffic Growth"
          value="84200"
          change="+22.1%"
          trend="up"
          icon={Globe}
          color="text-blue-500"
          variant="minimal"
        />
        <StatsCard
          label="Mobile Share"
          value="72.5%"
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
                <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="earnings" stroke="var(--foreground)" strokeWidth={2} strokeOpacity={0.2} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black tracking-tight">CTR Velocity</CardTitle>
            <CardDescription className="text-[13px] font-medium opacity-40">Conversion rate percentage progression</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-10 h-[400px]">
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
                />
              </LineChart>
            </ResponsiveContainer>
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
                      className="flex flex-col items-center"
                    >
                      <span className="text-[42px] font-black tracking-tighter leading-none" style={{ color: activeCategory.color }}>
                        {activeCategory.value}%
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">
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
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.gradient}
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
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { name: 'iPhone', val: 4500, fullMark: 5000 },
                { name: 'Android', val: 3200, fullMark: 5000 },
                { name: 'Mac', val: 1800, fullMark: 5000 },
                { name: 'Windows', val: 1200, fullMark: 5000 },
                { name: 'Other', val: 400, fullMark: 5000 },
              ]}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
