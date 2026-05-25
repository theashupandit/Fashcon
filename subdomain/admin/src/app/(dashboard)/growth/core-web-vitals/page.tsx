'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, LayoutGrid, Clock, MonitorPlay, History } from 'lucide-react';

const vitals = [
  { name: 'Largest Contentful Paint', short: 'LCP', value: '1.2s', target: '< 2.5s', status: 'pass', icon: Clock, desc: 'Measures loading performance.' },
  { name: 'Cumulative Layout Shift', short: 'CLS', value: '0.01', target: '< 0.1', status: 'pass', icon: LayoutGrid, desc: 'Measures visual stability.' },
  { name: 'Interaction to Next Paint', short: 'INP', value: '85ms', target: '< 200ms', status: 'pass', icon: MonitorPlay, desc: 'Measures interactivity.' },
];

export default function CoreWebVitalsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
          Core Web Vitals <Activity className="w-6 h-6 text-[#00ffd0]" />
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Real user experience metrics (Field Data).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {vitals.map((vital, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0B0B0C] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">{vital.short}</h3>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{vital.name}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <vital.icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-4xl font-black text-emerald-400">{vital.value}</span>
              <span className="text-sm text-zinc-500 ml-2">Target: {vital.target}</span>
            </div>
            
            <p className="text-sm text-zinc-400 pt-4 border-t border-white/5">{vital.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#111214] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-white" /> Historical Performance
        </h3>
        <div className="h-64 border border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/[0.01]">
          <p className="text-zinc-500 text-sm font-medium">[ Core Web Vitals Trend Graph ]</p>
        </div>
      </div>
    </div>
  );
}
