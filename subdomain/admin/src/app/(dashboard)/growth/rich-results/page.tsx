'use client';
import React from 'react';
import { Search, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function RichResultsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Structured Data & Rich Results
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">JSON-LD schema validation and SERP preview engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { name: 'Product Schema', count: 1204, status: 'valid', color: '#34d399' },
          { name: 'Article Schema', count: 82, status: 'valid', color: '#34d399' },
          { name: 'Breadcrumb Schema', count: 1450, status: 'warnings', color: '#fbbf24' },
        ].map((schema, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{schema.name}</span>
              {schema.status === 'valid' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-3xl font-black">{schema.count}</div>
            <div className="mt-4 text-xs font-medium text-zinc-400">Instances detected</div>
          </div>
        ))}
      </div>
    </div>
  );
}
