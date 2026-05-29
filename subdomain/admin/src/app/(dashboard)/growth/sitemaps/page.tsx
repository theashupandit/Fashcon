'use client';

import React, { useState, useEffect } from 'react';
import { Search, ListTree, Rss, Image as ImageIcon, Send, Loader2, Globe } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function SitemapManagerPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pining, setPinged] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sitemap')
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePing = (name: string) => {
    setPinged(name);
    setTimeout(() => setPinged(null), 2000);
  };

  const sitemaps = [
    { name: 'Products Sitemap', urls: data?.counts?.products ?? '...', icon: Search, id: 'products' },
    { name: 'Categories Sitemap', urls: data?.counts?.categories ?? '...', icon: ListTree, id: 'categories' },
    { name: 'Blog Sitemap', urls: data?.counts?.blogs ?? '...', icon: Rss, id: 'blogs' },
    { name: 'Total Sitemap', urls: data?.counts?.total ?? '...', icon: Globe, id: 'total' },
  ];

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10">
        <h1 className={cn(
          "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
          isDark ? "from-white to-white/60" : "from-black to-black/60"
        )}>
          Sitemap Infrastructure
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>Manage dynamic XML sitemaps and indexing signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sitemaps.map((sitemap, i) => (
          <div key={i} className={cn(
            "border rounded-2xl p-6 relative overflow-hidden transition-all duration-500",
            isDark ? "bg-[#0B0B0C] border-white/10" : "bg-white border-black/5 shadow-sm"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl",
                  isDark ? "bg-white/5" : "bg-black/5"
                )}>
                  <sitemap.icon className={cn("w-5 h-5", isDark ? "text-white/70" : "text-black/70")} />
                </div>
                <div>
                  <h3 className="font-bold">{sitemap.name}</h3>
                  <p className={cn(
                    "text-xs",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}>/sitemap-{sitemap.id}.xml</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#00ffd0]">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-500" /> : sitemap.urls}
                </span>
                <span className={cn(
                  "block text-[10px] uppercase",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>URLs Found</span>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center justify-between mt-6 pt-4 border-t",
              isDark ? "border-white/5" : "border-black/5"
            )}>
              <span className={cn(
                "text-xs",
                isDark ? "text-zinc-400" : "text-zinc-500"
              )}>Indexing Status: <span className="text-emerald-500 font-bold">Active</span></span>
              <button 
                onClick={() => handlePing(sitemap.name)}
                disabled={pining === sitemap.name}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded transition-colors",
                  pining === sitemap.name 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : (isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black")
                )}
              >
                {pining === sitemap.name ? (
                  <>Pinged ✅</>
                ) : (
                  <><Send className="w-3 h-3" /> Ping Google</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
