'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Clock, 
  Info, 
  Loader2,
  Trash2,
  Activity,
  Zap,
  Tag,
  Mail,
  FileJson
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

export default function VisitorLogsPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [purging, setPurging] = useState(false);

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
      fetchLogs();
    } catch (error) {
      console.error("Failed to purge logs:", error);
      toast.error("Failed to purge visitor logs.");
    } finally {
      setPurging(false);
      setIsConfirmOpen(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.externalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueUsers = new Set(logs.map(l => l.externalId)).size;
    const leads = logs.filter(l => l.event === 'lead').length;
    const searches = logs.filter(l => l.event === 'search').length;

    return [
      { label: 'Logged Hits', value: total.toString(), icon: Activity, color: 'text-[var(--primary)]' },
      { label: 'Unique Visitor IDs', value: uniqueUsers.toString(), icon: Users, color: 'text-purple-500' },
      { label: 'Affiliate Leads', value: leads.toString(), icon: Zap, color: 'text-amber-500' },
      { label: 'Search Queries', value: searches.toString(), icon: Tag, color: 'text-blue-500' },
    ];
  }, [logs]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40 uppercase italic">
            Visitor Click IDs
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0 text-[10px] font-black uppercase tracking-widest animate-pulse">Active</Badge>
            <p className="text-[13px] font-medium opacity-40 uppercase tracking-[0.2em]">Real-time Pinterest Attribution & Visitor logs</p>
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
            Refresh Stream
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table List */}
        <Card className={selectedLog ? "lg:col-span-8 bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm" : "lg:col-span-12 bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm"}>
          <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
              <Input 
                placeholder="Search Visitor IDs, Emails, or Events..." 
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
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Visitor/External ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Event</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Hashed Email</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] pr-8"></TableHead>
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
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Decrypting Visitor stream...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                        <Users className="w-12 h-12" />
                        <p className="text-[13px] font-black uppercase tracking-widest">No visitor hits matched</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow 
                      key={log._id} 
                      onClick={() => setSelectedLog(log)}
                      className={`border-[var(--border)] hover:bg-[var(--foreground)]/[0.02] cursor-pointer transition-colors group ${selectedLog?._id === log._id ? 'bg-[var(--foreground)]/[0.03]' : ''}`}
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3 text-[12px] font-bold">
                           <div className="w-2 h-2 rounded-full bg-[var(--primary)]/20 group-hover:scale-125 transition-transform" />
                           {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs opacity-80">{log.externalId}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--primary)]/20 transition-colors">
                          {log.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.email ? (
                          <div className="flex items-center gap-1.5 opacity-60">
                            <Mail size={12} className="text-zinc-500" />
                            <span className="font-mono text-[10px] truncate max-w-[120px]" title={log.email}>{log.email}</span>
                          </div>
                        ) : (
                          <span className="opacity-25">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                          View
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Detail Panel */}
        {selectedLog && (
          <Card className="lg:col-span-4 bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] p-6 space-y-6 shadow-sm animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2 className="text-lg font-black uppercase tracking-tight italic">Details</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedLog(null)} 
                className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-1">Visitor / External ID</span>
                <span className="font-mono text-xs break-all bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] block">
                  {selectedLog.externalId}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-1">Event Type</span>
                <Badge variant="outline" className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-[var(--background)]">
                  {selectedLog.event}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-1">Captured Timestamp</span>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Clock size={14} className="opacity-40" />
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </div>
              </div>

              {selectedLog.email && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-1">Hashed Email (SHA-256)</span>
                  <div className="font-mono text-[10px] break-all bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] flex items-start gap-2">
                    <Mail size={12} className="mt-0.5 text-zinc-500 shrink-0" />
                    <span>{selectedLog.email}</span>
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block mb-1">Metadata</span>
                  <div className="font-mono text-[10.5px] whitespace-pre-wrap break-all bg-zinc-950 text-emerald-400 p-4 rounded-2xl border border-zinc-900 overflow-x-auto max-h-[250px] custom-scrollbar">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedLog.details);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return selectedLog.details;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

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
