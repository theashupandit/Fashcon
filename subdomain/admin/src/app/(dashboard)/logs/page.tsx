'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Shield, 
  Clock, 
  Info, 
  AlertCircle,
  Loader2,
  Trash2,
  MoreVertical,
  Activity,
  ShieldAlert,
  Users,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { getLogs } from '@/app/actions/logs';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";

interface ActivityLog {
  _id: string;
  action: string;
  user: string;
  userRole: string;
  details: string;
  timestamp: any;
  type: 'info' | 'warning' | 'critical';
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  const stats = useMemo(() => {
    const total = logs.length;
    const critical = logs.filter(l => l.type === 'critical' || l.type === 'warning').length;
    const uniqueUsers = new Set(logs.map(l => l.user)).size;
    const infoRate = total > 0 ? Math.round((logs.filter(l => l.type === 'info').length / total) * 100) : 100;

    return [
      { label: 'Total Events', value: total.toString(), icon: Activity, color: 'text-blue-500' },
      { label: 'Security Alerts', value: critical.toString(), icon: ShieldAlert, color: 'text-red-500' },
      { label: 'Active Actors', value: uniqueUsers.toString(), icon: Users, color: 'text-amber-500' },
      { label: 'System Health', value: `${infoRate}%`, icon: Zap, color: 'text-emerald-500' },
    ];
  }, [logs]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* High Impact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40">
            Audit Stream
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0 text-[10px] font-black uppercase tracking-widest">Live</Badge>
            <p className="text-[13px] font-medium opacity-40 uppercase tracking-[0.2em]">Immutable record of system operations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all">
            Purge Archives
          </Button>
          <Button onClick={fetchLogs} className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap size={16} />} 
            Sync Stream
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
            <Input 
              placeholder="Filter audit logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-[var(--background)] border-transparent rounded-2xl text-[13px] font-bold focus:bg-[var(--background)] focus:border-[var(--primary)]/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 px-5 border-[var(--border)] rounded-2xl gap-2 text-[11px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
              <Filter className="w-4 h-4" />
              Event Scope
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--muted)]/20">
              <TableRow className="border-[var(--border)] hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Temporal Mark</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Operation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] pr-8">Criticality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-[var(--primary)]/20 animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Decrypting audit trail...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                      <History className="w-12 h-12" />
                      <p className="text-[13px] font-black uppercase tracking-widest">No activity matches your query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log._id} className="border-[var(--border)] hover:bg-[var(--foreground)]/[0.02] transition-colors group">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-3 text-[12px] font-bold">
                         <div className="w-2 h-2 rounded-full bg-[var(--primary)]/20 group-hover:scale-125 transition-transform" />
                         {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 
                          log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="w-9 h-9 border border-[var(--border)] group-hover:border-[var(--primary)]/30 transition-colors">
                           <AvatarFallback className="text-[10px] font-black bg-[var(--primary)]/5 text-[var(--primary)]">
                             {log.user?.charAt(0) || 'U'}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="text-[13px] font-black leading-tight tracking-tight">{log.user}</p>
                           <p className="text-[9px] font-black uppercase tracking-tighter opacity-30 mt-0.5">{log.userRole}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--primary)]/20 transition-colors">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium text-[var(--muted-foreground)] line-clamp-1 max-w-[300px]">{log.details}</p>
                    </TableCell>
                    <TableCell className="pr-8">
                       <Badge className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-3 py-1 border shadow-sm",
                         log.type === 'critical' ? "bg-red-500 text-white border-red-600" : 
                         log.type === 'warning' ? "bg-amber-500 text-white border-amber-600" : 
                         "bg-blue-500/10 text-blue-500 border-blue-500/20"
                       )}>
                         {log.type}
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
  );
}
