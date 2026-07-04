'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Search, CheckCircle2, AlertTriangle, AlertCircle, 
  Send, RefreshCw, Loader2, Link as LinkIcon 
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { getIndexIssuesData, requestUrlIndexing, syncIndexingApi } from '@/app/actions/analytics';
import { toast } from 'sonner';

export default function IndexMonitorPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      const res = await getIndexIssuesData();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error('Failed to load indexing logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestIndexing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setSubmitting(true);
    toast.loading('Submitting URL indexing request to Google...', { id: 'request-index' });
    try {
      const res = await requestUrlIndexing(targetUrl);
      if (res.success) {
        toast.success(res.message || 'Request submitted successfully!', { id: 'request-index' });
        setTargetUrl('');
        await loadData();
      } else {
        toast.error(res.error || 'Failed to submit indexing request', { id: 'request-index' });
      }
    } catch (err) {
      toast.error('An unexpected error occurred during request', { id: 'request-index' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncApi = async () => {
    setSyncing(true);
    toast.loading('Synchronizing Google Indexing API signals...', { id: 'sync-index-api' });
    try {
      const res = await syncIndexingApi();
      if (res.success) {
        toast.success(res.message || 'Indexing data synchronized!', { id: 'sync-index-api' });
        await loadData();
      } else {
        toast.error(res.error || 'Failed to sync API records', { id: 'sync-index-api' });
      }
    } catch (err) {
      toast.error('An unexpected error occurred during API sync', { id: 'sync-index-api' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen p-8 flex flex-col items-center justify-center transition-colors duration-500",
        isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
          Syncing Google Indexing Registry...
        </p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Tracked', value: data?.stats?.total || 0, icon: LinkIcon, color: 'text-zinc-400' },
    { label: 'Indexed Pages', value: data?.stats?.indexed || 0, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Excluded / Draft', value: data?.stats?.excluded || 0, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Crawl Errors', value: data?.stats?.errors || 0, icon: AlertCircle, color: 'text-red-400' },
  ];

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      {/* Header */}
      <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r flex items-center gap-3",
            isDark ? "from-white to-white/60" : "from-black to-black/60"
          )}>
            Index Monitor <Globe className="w-6 h-6 text-[#00ffd0]" />
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>Track and submit search indexing requests via Google APIs.</p>
        </div>
        <button 
          onClick={handleSyncApi}
          disabled={syncing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium cursor-pointer shadow-md",
            isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-black/5 border-black/10 hover:bg-black/10 text-black",
            syncing && "opacity-50 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
          Sync Indexing
        </button>
      </div>

      {/* Stats Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
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
              <item.icon className={cn("w-4 h-4", item.color)} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Index Request Form */}
        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500 flex flex-col justify-between",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#ff003c]" /> Quick Index Request
            </h3>
            <p className={cn(
              "text-xs mb-6",
              isDark ? "text-zinc-500" : "text-zinc-400"
            )}>Push URLs directly to Google's Search Crawler Indexing API queue.</p>
          </div>
          
          <form onSubmit={handleRequestIndexing} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Relative Page URL</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="/products/cotton-summer-maxi-dress"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--primary)]",
                    isDark ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/5 text-black"
                  )}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitting || !targetUrl.trim()}
              className={cn(
                "w-full py-3.5 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                isDark 
                  ? "bg-white text-black hover:bg-white/90 disabled:bg-zinc-800 disabled:text-zinc-500" 
                  : "bg-black text-white hover:bg-black/90 disabled:bg-zinc-200 disabled:text-zinc-400"
              )}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit to Indexer
            </button>
          </form>
        </div>

        {/* Index Monitor Registry Table */}
        <div className={cn(
          "lg:col-span-2 border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00ffd0]" /> Index Issue Registry
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={cn(
                  "border-b uppercase tracking-wider text-[9px] font-black",
                  isDark ? "border-white/5 text-zinc-500" : "border-black/5 text-zinc-400"
                )}>
                  <th className="pb-3">URL</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3 text-right">Last Crawled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.issues?.map((item: any, idx: number) => (
                  <tr key={idx} className={cn(
                    "hover:bg-white/[0.02] transition-colors",
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  )}>
                    <td className="py-3 font-bold truncate max-w-[180px]" title={item.url}>{item.url}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded font-black text-[9px] uppercase",
                        item.status === 'indexed' ? "bg-emerald-500/10 text-emerald-400" :
                        item.status === 'excluded' ? "bg-amber-500/10 text-amber-400" :
                        item.status === 'noindex' ? "bg-zinc-500/10 text-zinc-400" :
                        "bg-red-500/10 text-red-400"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-[10px] text-zinc-500 max-w-[150px] truncate" title={item.reason}>{item.reason || '—'}</td>
                    <td className="py-3 text-right text-[10px] text-zinc-500">
                      {item.lastCrawled ? new Date(item.lastCrawled).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
