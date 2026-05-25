'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Key, TrendingUp, Search, Hash } from 'lucide-react';

export default function KeywordIntelligencePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Keyword Intelligence
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Track ranking keywords, aesthetics, and seasonal trends.</p>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500 border-b border-white/10">
              <tr>
                <th className="pb-3 font-medium">Keyword / Aesthetic</th>
                <th className="pb-3 font-medium">Intent</th>
                <th className="pb-3 font-medium">Volume</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { kw: 'Old Money Fashion', intent: 'Commercial', vol: '110K', diff: '68', rank: '4', change: '+2' },
                { kw: 'Coquette Aesthetic', intent: 'Informational', vol: '450K', diff: '42', rank: '1', change: '0' },
                { kw: 'Soft Luxury Bags', intent: 'Transactional', vol: '22K', diff: '55', rank: '8', change: '+5' },
                { kw: 'Minimalist Winter Coats', intent: 'Commercial', vol: '80K', diff: '71', rank: '12', change: '-1' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-semibold text-white flex items-center gap-2">
                    <Hash className="w-3 h-3 text-[#ff003c]" /> {item.kw}
                  </td>
                  <td className="py-4"><span className="bg-white/5 px-2 py-1 rounded text-xs text-zinc-300">{item.intent}</span></td>
                  <td className="py-4 text-zinc-300">{item.vol}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${item.diff}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500">{item.diff}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold flex items-center gap-2">
                    #{item.rank}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 
                      item.change.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-zinc-500'
                    }`}>{item.change}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
