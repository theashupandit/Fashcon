'use client';

import React from 'react';
import { Wrench, ShieldAlert, CheckCircle2, Play } from 'lucide-react';

export default function TechnicalSeoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Technical SEO Lab
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Automated site audits and infrastructure validation.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-bold transition-all">
          <Play className="w-4 h-4" /> Run Deep Scan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111214] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5" /> Critical Issues (3)
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl">
              <h4 className="font-bold text-red-200 mb-1">Missing H1 Tags on Category Pages</h4>
              <p className="text-xs text-red-200/60 mb-3">Found 12 pages under /category/ lacking primary headings.</p>
              <button className="text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded font-medium hover:bg-red-500/30">Auto-Fix with AI</button>
            </div>
            <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl">
              <h4 className="font-bold text-amber-200 mb-1">Duplicate Meta Descriptions</h4>
              <p className="text-xs text-amber-200/60 mb-3">8 products share identical descriptions.</p>
              <button className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded font-medium hover:bg-amber-500/30">Review Pages</button>
            </div>
          </div>
        </div>

        <div className="bg-[#111214] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" /> Passed Checks (142)
          </h3>
          <div className="space-y-3">
            {['Robots.txt is valid', 'Sitemap.xml is accessible', 'No broken internal links', 'Images have ALT text (98%)', 'Valid HTTPS connection'].map((check, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300 p-2 bg-white/[0.02] rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                {check}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
