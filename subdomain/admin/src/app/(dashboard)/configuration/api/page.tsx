'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, BarChart, Search, Link2, 
  Image as ImageIcon, Zap, CheckCircle2, 
  AlertCircle, RefreshCw, Key
} from 'lucide-react';

const connections = [
  { 
    name: 'Google Analytics 4', 
    provider: 'Google', 
    icon: BarChart, 
    status: 'connected',
    tokenHealth: 'Healthy',
    lastSync: '10 minutes ago',
    refreshToken: 'Active'
  },
  { 
    name: 'Google Search Console', 
    provider: 'Google', 
    icon: Search, 
    status: 'connected',
    tokenHealth: 'Healthy',
    lastSync: '1 hour ago',
    refreshToken: 'Active'
  },
  { 
    name: 'Pinterest API', 
    provider: 'Pinterest', 
    icon: Link2, 
    status: 'warning',
    tokenHealth: 'Expiring Soon',
    lastSync: '5 hours ago',
    refreshToken: 'Needs Refresh'
  },
  { 
    name: 'Cloudinary', 
    provider: 'Cloudinary', 
    icon: ImageIcon, 
    status: 'connected',
    tokenHealth: 'Static API Key',
    lastSync: 'Live',
    refreshToken: 'N/A'
  },
  { 
    name: 'MongoDB', 
    provider: 'Database', 
    icon: Database, 
    status: 'connected',
    tokenHealth: 'URI Connected',
    lastSync: 'Live',
    refreshToken: 'N/A'
  },
  { 
    name: 'PageSpeed Insights', 
    provider: 'Google', 
    icon: Zap, 
    status: 'connected',
    tokenHealth: 'Healthy',
    lastSync: 'Recently',
    refreshToken: 'N/A'
  }
];

export default function ApiConnectionsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          API Management System
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Centralized OAuth and token health configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((conn, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border transition-all duration-500 group ${
              conn.status === 'connected' ? 'bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/30' :
              conn.status === 'warning' ? 'bg-amber-500/[0.02] border-amber-500/10 hover:border-amber-500/30' :
              'bg-red-500/[0.02] border-red-500/10 hover:border-red-500/30'
            }`}
          >
            {/* Dynamic Status Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[100px] opacity-20 transition-colors duration-500 ${
              conn.status === 'connected' ? 'bg-emerald-500' :
              conn.status === 'warning' ? 'bg-amber-500' :
              'bg-red-500'
            }`} />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border transition-colors duration-500 ${
                  conn.status === 'connected' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' :
                  conn.status === 'warning' ? 'bg-amber-500/10 border-amber-500/10 text-amber-400' :
                  'bg-red-500/10 border-red-500/10 text-red-400'
                }`}>
                  <conn.icon className="w-5 h-5" />
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  conn.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  conn.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {conn.status === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {conn.status.toUpperCase()}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{conn.name}</h3>
              <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider font-semibold">{conn.provider}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 flex items-center gap-2"><Key className="w-4 h-4" /> Token Health</span>
                  <span className="font-medium text-white">{conn.tokenHealth}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Last Sync</span>
                  <span className="font-medium text-white">{conn.lastSync}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5">
              <button 
                onClick={() => {
                  if (conn.provider === 'Google') {
                    window.location.href = '/api/google/auth';
                  } else if (conn.provider === 'Pinterest') {
                    window.location.href = '/api/pinterest/auth';
                  }
                }}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                conn.status === 'connected' ? 'bg-white/5 hover:bg-white/10 text-white' :
                'bg-[#ff003c] hover:bg-[#ff003c]/90 text-white shadow-[0_0_15px_rgba(255,0,60,0.3)]'
              }`}>
                {conn.status === 'connected' ? 'Manage Connection' : 'Connect API'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
