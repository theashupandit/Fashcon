'use client';

import React from 'react';
import { Wrench, ShieldAlert, CheckCircle2, Play } from 'lucide-react';

import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function TechnicalSeoPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-[#050505] text-white" : "bg-[#f8f9fa] text-black"
    )}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
            isDark ? "from-white to-white/60" : "from-black to-black/60"
          )}>
            Technical SEO Lab
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>Automated site audits and infrastructure validation.</p>
        </div>
        <button className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all border",
          isDark 
            ? "bg-white text-black hover:bg-white/90 border-white" 
            : "bg-black text-white hover:bg-black/90 border-black"
        )}>
          <Play className="w-4 h-4" /> Run Deep Scan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" /> Critical Issues (3)
          </h3>
          <div className="space-y-4">
            <div className={cn(
              "p-4 border rounded-xl",
              isDark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
            )}>
              <h4 className={cn(
                "font-bold mb-1",
                isDark ? "text-red-200" : "text-red-900"
              )}>Missing H1 Tags on Category Pages</h4>
              <p className={cn(
                "text-xs mb-3",
                isDark ? "text-red-200/60" : "text-red-700/70"
              )}>Found 12 pages under /category/ lacking primary headings.</p>
              <button className={cn(
                "text-xs px-3 py-1.5 rounded font-medium transition-colors",
                isDark ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : "bg-red-100 text-red-800 hover:bg-red-200"
              )}>Auto-Fix with AI</button>
            </div>
            <div className={cn(
              "p-4 border rounded-xl",
              isDark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"
            )}>
              <h4 className={cn(
                "font-bold mb-1",
                isDark ? "text-amber-200" : "text-amber-900"
              )}>Duplicate Meta Descriptions</h4>
              <p className={cn(
                "text-xs mb-3",
                isDark ? "text-amber-200/60" : "text-amber-700/70"
              )}>8 products share identical descriptions.</p>
              <button className={cn(
                "text-xs px-3 py-1.5 rounded font-medium transition-colors",
                isDark ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
              )}>Review Pages</button>
            </div>
          </div>
        </div>

        <div className={cn(
          "border rounded-2xl p-6 transition-all duration-500",
          isDark ? "bg-[#111214] border-white/5" : "bg-white border-black/5 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" /> Passed Checks (142)
          </h3>
          <div className="space-y-3">
            {['Robots.txt is valid', 'Sitemap.xml is accessible', 'No broken internal links', 'Images have ALT text (98%)', 'Valid HTTPS connection'].map((check, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 text-sm p-2 rounded-lg transition-colors",
                isDark ? "text-zinc-300 bg-white/[0.02]" : "text-zinc-600 bg-black/[0.02]"
              )}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                {check}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
