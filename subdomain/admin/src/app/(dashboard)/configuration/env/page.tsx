'use client';
import React from 'react';
import { Eye, EyeOff, Save, Lock } from 'lucide-react';

export default function EnvVarsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Environment Control
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Runtime variables and system-wide secrets.</p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {[
          { key: 'NEXT_PUBLIC_SITE_URL', value: 'https://www.fashcon.store' },
          { key: 'MONGODB_URI', value: 'mongodb+srv://fashcon21:••••••••••••' },
          { key: 'PINTEREST_APP_ID', value: '1572665' },
          { key: 'GEMINI_API_KEY', value: 'AIzaSyAb3rjx4geihiP1xWcQ-••••••••' },
        ].map((env, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-xl p-4 flex items-center justify-between group">
            <div className="flex-1">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{env.key}</p>
              <p className="text-sm font-mono text-zinc-200">{env.value}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400"><Eye className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400"><Save className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
