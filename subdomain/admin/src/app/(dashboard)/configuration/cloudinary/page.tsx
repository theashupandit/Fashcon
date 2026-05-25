'use client';
import React from 'react';
import { Cloud, Image as ImageIcon, Database } from 'lucide-react';

export default function CloudinaryPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Cloudinary Media Hub
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Digital asset management and CDN configuration.</p>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Cloud Name</label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-zinc-300">fashconcloud</div>
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">API Key</label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-zinc-300">258296816519429</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Automatic Optimization</span>
            </div>
            <div className="w-10 h-5 bg-emerald-500/20 rounded-full flex items-center px-1 border border-emerald-500/30">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
