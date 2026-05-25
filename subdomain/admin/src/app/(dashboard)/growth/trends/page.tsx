'use client';
import React from 'react';
import { Zap, TrendingUp, Instagram, Hash } from 'lucide-react';

export default function TrendRadarPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
            Trend Radar <Zap className="w-6 h-6 text-[#ec4899]" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Predictive trend analysis and viral aesthetics tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { trend: 'Coquette Core', growth: '+142%', category: 'Aesthetic', source: 'Pinterest' },
          { trend: 'Old Money Luxury', growth: '+84%', category: 'Lifestyle', source: 'Google' },
          { trend: 'Eco-Minimalism', growth: '+56%', category: 'Fashion', source: 'Instagram' },
        ].map((t, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#ec4899]/40 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
               <TrendingUp className="w-8 h-8 text-[#ec4899]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ec4899] mb-4 block">{t.source} Intelligence</span>
            <h3 className="text-xl font-black mb-2">{t.trend}</h3>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-black text-emerald-400">{t.growth}</span>
               <span className="text-xs font-bold text-zinc-500 uppercase">{t.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
