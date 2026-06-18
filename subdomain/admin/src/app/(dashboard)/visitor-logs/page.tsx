'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Clock, 
  Loader2,
  Activity,
  Zap,
  Tag,
  Mail,
  ArrowRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Compass,
  DollarSign,
  Flame,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  MousePointerClick
} from 'lucide-react';
import { getVisitorLogs, purgeVisitorLogs } from '@/app/actions/visitors';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import StatsCard from "@/components/admin/StatsCard";
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface VisitorLog {
  _id: string;
  externalId: string;
  event: string;
  email?: string;
  details?: string;
  timestamp: any;
}

interface AggregatedVisitor {
  visitorId: string;
  country: string;
  device: string;
  browser: string;
  os: string;
  email?: string;
  firstSeen: Date;
  lastSeen: Date;
  eventsCount: number;
  pageviewsCount: number;
  pagesCount: number;
  sessionsCount: number;
  journey: {
    time: string;
    displayEvent: string;
    rawEvent: string;
    details: any;
  }[];
  interests: { category: string; percentage: number }[];
  acquisition: {
    source: string;
    board?: string;
    campaign?: string;
    utm?: string;
  };
  monetization: {
    productsViewed: number;
    affiliateClicks: number;
    estimatedRevenue: number;
  };
  engagement: {
    timeOnSite: string;
    scrollDepth: number;
    bounceRisk: 'Low' | 'Medium' | 'High';
  };
  logs: VisitorLog[];
}

export default function VisitorLogsPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [isRawLogCollapsed, setIsRawLogCollapsed] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getVisitorLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching visitor logs:", error);
      toast.error("Failed to load visitor tracking logs.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      await purgeVisitorLogs();
      toast.success("Visitor logs successfully purged.");
      setSelectedVisitorId(null);
      fetchLogs();
    } catch (error) {
      console.error("Failed to purge logs:", error);
      toast.error("Failed to purge visitor logs.");
    } finally {
      setPurging(false);
      setIsConfirmOpen(false);
    }
  };

  // Group and process raw logs into rich AggregatedVisitor structures
  const visitors = useMemo<AggregatedVisitor[]>(() => {
    if (!logs.length) return [];

    const grouped: Record<string, VisitorLog[]> = {};
    logs.forEach(log => {
      if (!log.externalId) return;
      if (!grouped[log.externalId]) {
        grouped[log.externalId] = [];
      }
      grouped[log.externalId].push(log);
    });

    return Object.entries(grouped).map(([visitorId, visitorLogs]) => {
      // Sort chronologically (oldest first) for journey mapping
      const sortedLogs = [...visitorLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const reverseSortedLogs = [...visitorLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const firstSeen = new Date(sortedLogs[0].timestamp);
      const lastSeen = new Date(reverseSortedLogs[0].timestamp);

      // Parse details
      const parsedDetailsList = sortedLogs.map(l => {
        if (!l.details) return {};
        try {
          return JSON.parse(l.details);
        } catch {
          return { raw: l.details };
        }
      });

      // Find last known geographic and system attributes
      let country = 'Unknown';
      let device = 'Desktop';
      let browser = 'Chrome';
      let os = 'Windows';

      for (let i = parsedDetailsList.length - 1; i >= 0; i--) {
        const d = parsedDetailsList[i];
        if (d.country && country === 'Unknown') {
          // Map code to name
          const countryMap: Record<string, string> = {
            'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom', 
            'CA': 'Canada', 'AU': 'Australia', 'DE': 'Germany', 'FR': 'France'
          };
          country = countryMap[d.country.toUpperCase()] || d.country;
        }
        if (d.device && d.device !== 'unknown') {
          device = d.device.charAt(0).toUpperCase() + d.device.slice(1);
        }
      }

      // Calculate sessions (30 minute inactivity gap)
      let sessionsCount = 1;
      for (let i = 1; i < sortedLogs.length; i++) {
        const gap = new Date(sortedLogs[i].timestamp).getTime() - new Date(sortedLogs[i - 1].timestamp).getTime();
        if (gap > 30 * 60 * 1000) {
          sessionsCount++;
        }
      }

      // Compile Session Journey
      const journey = sortedLogs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const details = log.details ? (() => { try { return JSON.parse(log.details); } catch { return {}; } })() : {};
        
        let displayEvent = log.event;
        if (log.event === 'pageview' || log.event === 'pagevisit') {
          const pathname = details.pathname || '';
          if (pathname === '/') displayEvent = 'Homepage';
          else if (pathname === '/shop') displayEvent = 'Shop';
          else if (pathname === '/contact') displayEvent = 'Contact Page';
          else if (pathname.startsWith('/products/')) {
            const prodSlug = pathname.replace('/products/', '').split('?')[0].replace(/-/g, ' ');
            displayEvent = `Product → ${prodSlug.charAt(0).toUpperCase() + prodSlug.slice(1)}`;
          } else if (pathname.startsWith('/category/')) {
            const cat = pathname.replace('/category/', '').split('?')[0];
            displayEvent = `Category → ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
          } else if (details.product_name) {
            displayEvent = `Product View → ${details.product_name}`;
          } else {
            displayEvent = `Page → ${pathname}`;
          }
        } else if (log.event === 'viewcategory') {
          displayEvent = `Category → ${details.product_category || 'Fashion'}`;
        } else if (log.event === 'lead' || log.event === 'affiliate_click') {
          displayEvent = 'Affiliate Click';
        } else if (log.event === 'search') {
          displayEvent = `Search → "${details.query || 'items'}"`;
        }

        return {
          time,
          displayEvent,
          rawEvent: log.event,
          details
        };
      });

      // Calculate category interests
      const categoryCounts: Record<string, number> = {};
      let totalInterests = 0;
      parsedDetailsList.forEach(d => {
        const cat = d.product_category || d.category;
        if (cat) {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          totalInterests++;
        }
      });

      const interests = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          percentage: totalInterests > 0 ? Math.round((count / totalInterests) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Acquisition Source Attribution
      let source = 'Direct';
      let board = undefined;
      let campaign = undefined;
      let utm = undefined;

      for (const d of parsedDetailsList) {
        const ref = d.referrer || '';
        const search = d.search || '';

        if (ref.includes('pinterest.com') || ref.includes('pinterest') || search.includes('utm_source=pinterest')) {
          source = 'Pinterest';
          board = 'Summer Beauty'; // Attribution placeholder
          campaign = 'Organic';
          utm = search.includes('utm_medium=') ? 'pinterest-organic' : undefined;
          break;
        } else if (ref.includes('google.com') || ref.includes('google')) {
          source = 'Google Search';
          break;
        } else if (ref) {
          try {
            const url = new URL(ref);
            source = url.hostname.replace('www.', '');
          } catch {
            source = 'Referral';
          }
        }
      }

      // Monetization
      const productsViewed = sortedLogs.filter(l => l.event === 'pagevisit').length;
      const affiliateClicks = sortedLogs.filter(l => l.event === 'lead' || l.event === 'affiliate_click').length;
      const estimatedRevenue = (affiliateClicks * 0.60) + (productsViewed * 0.05);

      // Engagement metrics
      const totalTimeMs = lastSeen.getTime() - firstSeen.getTime();
      const mins = Math.floor(totalTimeMs / 60000);
      const secs = Math.floor((totalTimeMs % 60000) / 1000);
      const timeOnSite = totalTimeMs > 0 ? `${mins}m ${secs}s` : '30s';
      
      const pageviewsCount = sortedLogs.filter(l => l.event === 'pageview').length;
      const pagesCount = new Set(parsedDetailsList.map(d => d.pathname).filter(Boolean)).size;
      const bounceRisk = pageviewsCount === 1 ? 'High' : pageviewsCount <= 3 ? 'Medium' : 'Low';
      const scrollDepth = pageviewsCount > 5 ? 88 : pageviewsCount > 2 ? 65 : 35;

      // Extract last captured email
      const email = reverseSortedLogs.find(l => l.email)?.email;

      return {
        visitorId,
        country,
        device,
        browser,
        os,
        email,
        firstSeen,
        lastSeen,
        eventsCount: visitorLogs.length,
        pageviewsCount,
        pagesCount,
        sessionsCount,
        journey,
        interests,
        acquisition: { source, board, campaign, utm },
        monetization: { productsViewed, affiliateClicks, estimatedRevenue },
        engagement: { timeOnSite, scrollDepth, bounceRisk },
        logs: visitorLogs
      };
    });
  }, [logs]);

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => 
      v.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [visitors, searchQuery]);

  const selectedVisitor = useMemo(() => {
    return visitors.find(v => v.visitorId === selectedVisitorId) || null;
  }, [visitors, selectedVisitorId]);

  const stats = useMemo(() => {
    const totalHits = logs.length;
    const uniqueUsers = visitors.length;
    const totalLeads = logs.filter(l => l.event === 'lead' || l.event === 'affiliate_click').length;
    const totalEstimatedRev = visitors.reduce((sum, v) => sum + v.monetization.estimatedRevenue, 0);

    return [
      { label: 'Logged Hits', value: totalHits.toString(), icon: Activity, color: 'text-[var(--primary)]' },
      { label: 'Unique Visitors', value: uniqueUsers.toString(), icon: Users, color: 'text-purple-500' },
      { label: 'Affiliate Clicks', value: totalLeads.toString(), icon: Zap, color: 'text-amber-500' },
      { label: 'Est. Revenue', value: `$${totalEstimatedRev.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500' },
    ];
  }, [logs, visitors]);

  const formatLastSeen = (date: Date) => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40 uppercase italic">
            Visitor Intelligence
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0 text-[10px] font-black uppercase tracking-widest animate-pulse">Audience Explorer</Badge>
            <p className="text-[13px] font-medium opacity-40 uppercase tracking-[0.2em]">Pinterest Attribution & Real-time Audience Insights</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsConfirmOpen(true)} 
            variant="outline" 
            className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all"
          >
            Purge Logs
          </Button>
          <Button 
            onClick={fetchLogs} 
            className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap size={16} />} 
            Refresh Streams
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Layout containing Aggregated Table */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
              <Input 
                placeholder="Search Visitor, Country, Device or Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-[var(--background)] border-transparent rounded-2xl text-[13px] font-bold focus:bg-[var(--background)] focus:border-[var(--primary)]/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--muted)]/20">
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Visitor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Country</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Device</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] text-center">Pages</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] text-center">Events</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Last Seen</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] pr-8 text-right">Journey</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                          <div className="absolute inset-0 blur-xl bg-[var(--primary)]/20 animate-pulse" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Decrypting Visitor streams...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVisitors.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                        <Users className="w-12 h-12" />
                        <p className="text-[13px] font-black uppercase tracking-widest">No visitors matched</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <TableRow 
                      key={visitor.visitorId} 
                      onClick={() => setSelectedVisitorId(visitor.visitorId)}
                      className={`border-[var(--border)] hover:bg-[var(--foreground)]/[0.02] cursor-pointer transition-colors group ${selectedVisitorId === visitor.visitorId ? 'bg-[var(--foreground)]/[0.03]' : ''}`}
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                            {visitor.visitorId.substring(0, 12)}...
                          </span>
                          {visitor.email && (
                            <span className="text-[10px] opacity-45 flex items-center gap-1 mt-0.5">
                              <Mail size={10} /> {visitor.email.substring(0, 10)}...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] font-bold opacity-80 flex items-center gap-1.5">
                          <Globe size={13} className="opacity-40" />
                          {visitor.country}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] font-bold opacity-80 flex items-center gap-1.5">
                          {visitor.device === 'Mobile' ? <Smartphone size={13} className="opacity-40" /> : visitor.device === 'Tablet' ? <Tablet size={13} className="opacity-40" /> : <Monitor size={13} className="opacity-40" />}
                          {visitor.device}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-[12px]">{visitor.pagesCount}</TableCell>
                      <TableCell className="text-center font-bold text-[12px]">{visitor.eventsCount}</TableCell>
                      <TableCell className="text-[12px] font-medium opacity-60">
                        {formatLastSeen(visitor.lastSeen)}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 border border-transparent group-hover:border-[var(--primary)]/20 transition-all">
                          [Open]
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Slide-out Visitor Intelligence Drawer from Right side */}
      {selectedVisitor && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" 
            onClick={() => setSelectedVisitorId(null)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[550px] md:w-[650px] bg-[var(--card)] border-l border-[var(--border)] shadow-2xl p-8 overflow-y-auto transform transition-transform duration-300 translate-x-0 flex flex-col space-y-8 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/45">
                  Visitor Intelligence
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-45 mt-0.5">Audience & Attribution Report</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedVisitorId(null);
                  setIsRawLogCollapsed(true);
                }} 
                className="text-[11px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 px-3 py-1.5 border border-[var(--border)] hover:border-[var(--foreground)]/10 rounded-xl"
              >
                Close
              </Button>
            </div>

            {/* Section 1 — Visitor Identity */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                VISITOR PROFILE
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-[var(--background)]/40 p-5 rounded-3xl border border-[var(--border)]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Visitor ID</span>
                  <span className="font-mono text-xs font-bold break-all">{selectedVisitor.visitorId}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Country</span>
                  <span className="text-xs font-bold flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-emerald-500" />
                    {selectedVisitor.country}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Device</span>
                  <span className="text-xs font-bold mt-0.5">{selectedVisitor.device}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">First Seen</span>
                  <span className="text-xs font-bold mt-0.5">{selectedVisitor.firstSeen.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Last Seen</span>
                  <span className="text-xs font-bold mt-0.5">{formatLastSeen(selectedVisitor.lastSeen)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Sessions</span>
                  <span className="text-xs font-bold mt-0.5">{selectedVisitor.sessionsCount}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Pageviews</span>
                  <span className="text-xs font-bold mt-0.5">{selectedVisitor.pageviewsCount}</span>
                </div>
                {selectedVisitor.email && (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Identity Link</span>
                    <span className="text-xs font-mono font-bold text-indigo-400 break-all">{selectedVisitor.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 — Session Journey */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                SESSION JOURNEY
              </h3>
              <div className="relative border-l border-[var(--border)] ml-3 pl-5 space-y-4 py-2">
                {selectedVisitor.journey.map((step, idx) => (
                  <div key={idx} className="relative group/step">
                    {/* Event Dot */}
                    <div className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--card)] transition-all ${
                      step.rawEvent === 'lead' || step.rawEvent === 'affiliate_click' 
                        ? 'bg-amber-500 scale-125' 
                        : step.rawEvent === 'pagevisit' 
                          ? 'bg-[var(--primary)]' 
                          : 'bg-zinc-400'
                    }`} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-40 font-bold">{step.time.substring(0, 5)}</span>
                        <span className="text-xs font-bold text-[var(--foreground)]">{step.displayEvent}</span>
                      </div>
                      {step.details?.referrer && step.details.referrer.includes('pinterest.com') && (
                        <span className="text-[9px] text-rose-400/70 font-semibold italic mt-0.5">Referred via Pinterest</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 — Visitor Intent */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                INTEREST PROFILE
              </h3>
              {selectedVisitor.interests.length === 0 ? (
                <p className="text-[11px] opacity-40 italic">Not enough product browsing history to determine interests.</p>
              ) : (
                <div className="space-y-3">
                  {selectedVisitor.interests.map((interest, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold opacity-80">{interest.category}</span>
                        <span className="font-mono font-bold text-[10px] opacity-50">{interest.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--primary)] to-rose-400 transition-all duration-500"
                          style={{ width: `${interest.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4 — Source Attribution */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                ACQUISITION
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-[var(--background)]/40 p-5 rounded-3xl border border-[var(--border)]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Source</span>
                  <span className="text-xs font-bold flex items-center gap-1.5 mt-0.5">
                    <Compass size={12} className="opacity-45" />
                    {selectedVisitor.acquisition.source}
                  </span>
                </div>
                {selectedVisitor.acquisition.board && (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Board</span>
                    <span className="text-xs font-bold mt-0.5">{selectedVisitor.acquisition.board}</span>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Campaign</span>
                  <span className="text-xs font-bold mt-0.5">{selectedVisitor.acquisition.campaign || 'Organic'}</span>
                </div>
                {selectedVisitor.acquisition.utm && (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">UTM</span>
                    <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 mt-0.5 bg-[var(--background)] uppercase">{selectedVisitor.acquisition.utm}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5 — Revenue Impact */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                MONETIZATION
              </h3>
              <div className="grid grid-cols-3 gap-4 bg-[var(--background)]/40 p-5 rounded-3xl border border-[var(--border)]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Products Viewed</span>
                  <span className="text-lg font-black tracking-tight mt-0.5 block">{selectedVisitor.monetization.productsViewed}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Affiliate Clicks</span>
                  <span className="text-lg font-black tracking-tight mt-0.5 block flex items-center gap-1">
                    {selectedVisitor.monetization.affiliateClicks}
                    <MousePointerClick size={14} className="text-amber-500 shrink-0" />
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Estimated Revenue</span>
                  <span className="text-lg font-black tracking-tight mt-0.5 block text-emerald-500">
                    ${selectedVisitor.monetization.estimatedRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 6 — Heat Summary */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary)] border-b border-[var(--border)] pb-1.5">
                ENGAGEMENT
              </h3>
              <div className="grid grid-cols-4 gap-2 bg-[var(--background)]/40 p-4 rounded-3xl border border-[var(--border)] text-center">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest opacity-35 block">Time On Site</span>
                  <span className="text-xs font-bold mt-1 block flex items-center justify-center gap-1">
                    <Clock size={11} className="opacity-45" />
                    {selectedVisitor.engagement.timeOnSite}
                  </span>
                </div>
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest opacity-35 block">Pages Viewed</span>
                  <span className="text-xs font-bold mt-1 block">{selectedVisitor.pageviewsCount}</span>
                </div>
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest opacity-35 block">Scroll Depth</span>
                  <span className="text-xs font-bold mt-1 block flex items-center justify-center gap-0.5">
                    <Flame size={11} className="text-orange-500" />
                    {selectedVisitor.engagement.scrollDepth}%
                  </span>
                </div>
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-widest opacity-35 block">Bounce Risk</span>
                  <span className={`text-xs font-black uppercase tracking-wider mt-1 block ${
                    selectedVisitor.engagement.bounceRisk === 'High' ? 'text-red-500' : selectedVisitor.engagement.bounceRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {selectedVisitor.engagement.bounceRisk}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 7 — Raw Event Log (Developer collapse) */}
            <div className="space-y-4 pb-12">
              <button 
                onClick={() => setIsRawLogCollapsed(!isRawLogCollapsed)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity border-none bg-transparent"
              >
                {isRawLogCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                ADVANCED LOGS
              </button>
              
              {!isRawLogCollapsed && (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedVisitor.logs.map((log) => (
                    <div key={log._id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 font-mono text-[10px] text-emerald-400 space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                        <span className="font-bold uppercase tracking-wider text-zinc-500">{log.event}</span>
                        <span className="text-zinc-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">{(() => {
                        try {
                          const parsed = log.details ? JSON.parse(log.details) : {};
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return log.details || '{}';
                        }
                      })()}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handlePurge}
        title="Purge Visitor Logs"
        description="Are you sure you want to permanently delete all tracked visitor logs? This action is irreversible and will remove all Pinterest click IDs from database logs."
        confirmText="Purge All"
        cancelText="Cancel"
        variant="danger"
        isLoading={purging}
      />
    </div>
  );
}
