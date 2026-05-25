'use client';
import React from 'react';
import { Clock, Play, AlertCircle } from 'lucide-react';

export default function CronJobsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Automated Tasks
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Scheduled data synchronization and system maintenance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'GA4 Data Sync', interval: 'Every 6 hours', lastRun: '22 mins ago', status: 'healthy' },
          { name: 'Pinterest Auto-Publisher', interval: 'Every 1 hour', lastRun: '5 mins ago', status: 'healthy' },
          { name: 'SEO Health Audit', interval: 'Daily', lastRun: '14 hours ago', status: 'healthy' },
          { name: 'Sitemap Regeneration', interval: 'Daily', lastRun: 'Failed', status: 'error' },
        ].map((job, i) => (
          <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{job.name}</h3>
                <p className="text-xs text-zinc-500 font-medium">{job.interval}</p>
              </div>
              <div className={`p-2 rounded-full ${job.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {job.status === 'healthy' ? <Clock className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-xs text-zinc-400">Last Run: {job.lastRun}</span>
              <button className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                <Play className="w-3 h-3 fill-current" /> Run Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
