'use client';
import React from 'react';
import { Users, Globe, Smartphone, UserCheck } from 'lucide-react';

export default function AudienceInsightsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Audience Intelligence
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Deep demographic and behavioral analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-[#0ea5e9]" /> Geographic Distribution</h3>
          <div className="space-y-4">
            {[
              { country: 'United States', percentage: '45%', count: '18,400' },
              { country: 'United Kingdom', percentage: '12%', count: '5,200' },
              { country: 'India', percentage: '8%', count: '3,100' },
              { country: 'Canada', percentage: '6%', count: '2,800' },
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-300 w-24">{g.country}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0ea5e9]" style={{ width: g.percentage }} />
                </div>
                <span className="text-xs font-black text-white">{g.percentage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" /> Device Breakdown</h3>
          <div className="flex items-center justify-around h-32">
             <div className="text-center">
                <div className="text-2xl font-black text-white">74%</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mobile</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-white">22%</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Desktop</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-white">4%</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tablet</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
