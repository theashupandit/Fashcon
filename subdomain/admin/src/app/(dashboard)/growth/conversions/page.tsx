'use client';
import React from 'react';
import { Target, TrendingUp, DollarSign, MousePointer2 } from 'lucide-react';

export default function ConversionTrackingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Growth Conversions
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Revenue attribution and conversion funnel tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
         {[
           { label: 'Conv. Rate', value: '3.42%', icon: Target },
           { label: 'Total Revenue', value: '$84,200', icon: DollarSign },
           { label: 'AOV', value: '$124', icon: TrendingUp },
           { label: 'ROAS', value: '4.2x', icon: MousePointer2 },
         ].map((m, i) => (
           <div key={i} className="bg-[#111214] border border-white/5 rounded-xl p-5">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{m.label}</span>
               <m.icon className="w-4 h-4 text-[#f97316]" />
             </div>
             <div className="text-2xl font-black">{m.value}</div>
           </div>
         ))}
      </div>
    </div>
  );
}
