'use client';

import React from 'react';
import { Search, ListTree, Rss, Image as ImageIcon, Send } from 'lucide-react';

export default function SitemapManagerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Sitemap Infrastructure
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Manage dynamic XML sitemaps and indexing signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Products Sitemap', urls: 1204, lastCrawl: '2 hours ago', icon: Search },
          { name: 'Categories Sitemap', urls: 45, lastCrawl: '1 day ago', icon: ListTree },
          { name: 'Blog Sitemap', urls: 82, lastCrawl: '5 hours ago', icon: Rss },
          { name: 'Image Sitemap', urls: 3400, lastCrawl: '2 days ago', icon: ImageIcon },
        ].map((sitemap, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-xl">
                  <sitemap.icon className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <h3 className="font-bold">{sitemap.name}</h3>
                  <p className="text-xs text-zinc-500">/sitemap-{sitemap.name.split(' ')[0].toLowerCase()}.xml</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#00ffd0]">{sitemap.urls}</span>
                <span className="block text-[10px] uppercase text-zinc-500">URLs</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-xs text-zinc-400">Last Crawled: {sitemap.lastCrawl}</span>
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-white">
                <Send className="w-3 h-3" /> Ping Google
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
