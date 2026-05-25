'use client';
import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

export default function AiProvidersPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          AI Intelligence Providers
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Neural engine configuration for SEO and Content generation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Google Gemini Pro', model: 'gemini-1.5-pro', status: 'active', icon: Brain },
          { name: 'OpenAI GPT-4', model: 'gpt-4o-latest', status: 'standby', icon: Cpu },
          { name: 'Anthropic Claude', model: 'claude-3-5-sonnet', status: 'standby', icon: Sparkles },
        ].map((ai, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="p-3 bg-white/5 rounded-xl w-fit mb-4">
                <ai.icon className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">{ai.name}</h3>
              <p className="text-xs font-mono text-zinc-500 mb-6">{ai.model}</p>
            </div>
            <button className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              ai.status === 'active' ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(255,0,60,0.2)]' : 'bg-white/5 border-white/10 text-zinc-500'
            }`}>
              {ai.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
