'use client';
import React from 'react';
import { KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';

export default function OAuthManagerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          OAuth Token Manager
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Secure lifecycle management for external service authorizations.</p>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Expires In</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { service: 'Google Analytics', status: 'Active', expiry: '24 days', color: '#34d399' },
              { service: 'Pinterest Engine', status: 'Expiring', expiry: '2 hours', color: '#fbbf24' },
              { service: 'Search Console', status: 'Active', expiry: 'Permanent', color: '#34d399' },
            ].map((token, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                  {token.service}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    token.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {token.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 font-medium">{token.expiry}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
