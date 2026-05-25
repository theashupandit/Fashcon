'use client';
import React from 'react';
import { Globe, BarChart, Search, Zap } from 'lucide-react';

export default function GoogleApisPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Google Cloud Infrastructure
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Centralized management for Google Cloud projects and service accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Analytics Data API', desc: 'Real-time GA4 metrics fetching.', status: 'enabled', icon: BarChart },
          { name: 'Search Console API', desc: 'Sitemap and keyword index tracking.', status: 'enabled', icon: Search },
          { name: 'PageSpeed Insights', desc: 'Core Web Vitals automated audits.', status: 'enabled', icon: Zap },
          { name: 'Indexing API', desc: 'Manual page index requests.', status: 'disabled', icon: Globe },
        ].map((api, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <api.icon className="w-5 h-5 text-zinc-300" />
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                api.status === 'enabled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {api.status}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1">{api.name}</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">{api.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
