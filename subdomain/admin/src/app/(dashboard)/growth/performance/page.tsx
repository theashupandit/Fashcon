'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Smartphone, Monitor, Gauge, 
  Activity, ArrowRight, Play, CheckCircle2 
} from 'lucide-react';

export default function PerformanceLabPage() {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
            Performance Lab <Zap className="w-6 h-6 text-[#ff003c]" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Real-time PageSpeed Insights analysis.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setDevice('mobile')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" /> Mobile
            </button>
            <button 
              onClick={() => setDevice('desktop')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" /> Desktop
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#ff003c] hover:bg-[#ff003c]/90 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(255,0,60,0.3)] transition-all">
            <Play className="w-4 h-4 fill-current" /> Run Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-[#0B0B0C] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00ffd0] bg-[#00ffd0]/10 px-2 py-1 rounded">Live Data</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-6">Performance Score</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-emerald-500/20" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-emerald-500" strokeDasharray="550" strokeDashoffset="55" strokeLinecap="round"/>
            </svg>
            <div className="text-center">
              <span className="text-6xl font-black">92</span>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'First Contentful Paint', value: '0.8s', status: 'good' },
            { label: 'Largest Contentful Paint', value: '1.2s', status: 'good' },
            { label: 'Total Blocking Time', value: '150ms', status: 'average' },
            { label: 'Cumulative Layout Shift', value: '0.01', status: 'good' },
            { label: 'Speed Index', value: '1.1s', status: 'good' },
            { label: 'Interaction to Next Paint', value: '80ms', status: 'good' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111214] border border-white/5 rounded-xl p-5 flex flex-col justify-between"
            >
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{metric.label}</p>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className={`w-2 h-2 rounded-full ${
                  metric.status === 'good' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
                  'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-white" /> Optimization Opportunities
        </h3>
        <div className="space-y-2">
          {[
            { msg: 'Serve images in next-gen formats', save: '0.45s', icon: ImageIcon },
            { msg: 'Reduce unused JavaScript', save: '0.30s', icon: Zap },
            { msg: 'Eliminate render-blocking resources', save: '0.15s', icon: Gauge },
          ].map((opp, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-zinc-300">
                  <opp.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{opp.msg}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">Save {opp.save}</span>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
