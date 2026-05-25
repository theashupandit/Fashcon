'use client';
import React from 'react';
import { Sparkles, MessageSquare, ArrowRight, Zap } from 'lucide-react';

export default function AiRecommendationsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
          AI Growth Engine <Sparkles className="w-6 h-6 text-[#a855f7]" />
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Neural insights and automated growth strategies.</p>
      </div>

      <div className="space-y-4">
        {[
          { type: 'SEO Fix', title: 'Internal Linking Opportunity', desc: 'Category "Vintage" has 14 orphan products. Suggested links ready.', severity: 'high' },
          { type: 'Pinterest', title: 'Viral Aesthetic Alert', desc: '"Soft Luxury" pins are seeing 3x engagement. Increase pipeline volume.', severity: 'medium' },
          { type: 'Content', title: 'Keyword Gap Detected', desc: 'Competitors ranking for "Vegan Leather Boots". Suggest drafting collection guide.', severity: 'low' },
        ].map((rec, i) => (
          <div key={i} className="bg-[#111214] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-start justify-between">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-zinc-400 group-hover:text-white transition-colors">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] mb-1 block">{rec.type}</span>
                     <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
                     <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">{rec.desc}</p>
                  </div>
               </div>
               <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-lg hover:scale-105 transition-all">
                  Execute <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
