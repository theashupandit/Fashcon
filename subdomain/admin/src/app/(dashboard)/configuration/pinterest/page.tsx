'use client';
import React from 'react';
import { Pin, Share2, BarChart3 } from 'lucide-react';

export default function PinterestConfigPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Pinterest API Control
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Manage developer credentials and marketing platform access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Pin className="w-5 h-5 text-[#e11d48]" /> App Credentials</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">App ID</label>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-mono text-xs">1572665</div>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">App Secret</label>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-mono text-xs italic">••••••••••••••••••••••••••••••••</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Share2 className="w-5 h-5 text-emerald-400" /> Redirect URI</h3>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
            <code className="text-xs text-zinc-300">https://www.fashcon.store/api/pinterest/callback</code>
          </div>
          <button className="w-full py-3 bg-[#e11d48] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.3)]">
            Reconnect Business Account
          </button>
        </div>
      </div>
    </div>
  );
}
