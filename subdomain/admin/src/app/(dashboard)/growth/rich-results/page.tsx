'use client';
import React from 'react';
import { Search, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export default function RichResultsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen p-8 transition-colors duration-500",
      isDark ? "bg-transparent text-white" : "bg-transparent text-black"
    )}>
      <div className="mb-10">
        <h1 className={cn(
          "text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
          isDark ? "from-white to-white/60" : "from-black to-black/60"
        )}>
          Structured Data & Rich Results
        </h1>
        <p className={cn(
          "mt-2 text-sm",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>JSON-LD schema validation and SERP preview engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { name: 'Product Schema', count: 1204, status: 'valid', color: '#34d399' },
          { name: 'Article Schema', count: 82, status: 'valid', color: '#34d399' },
          { name: 'Breadcrumb Schema', count: 1450, status: 'warnings', color: '#fbbf24' },
        ].map((schema, i) => (
          <div key={i} className={cn(
            "border rounded-2xl p-6 transition-all duration-500 backdrop-blur-md",
            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5 shadow-sm"
          )}>
            <div className="flex justify-between items-center mb-4">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}>{schema.name}</span>
              {schema.status === 'valid' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-3xl font-black">{schema.count}</div>
            <div className={cn(
              "mt-4 text-xs font-medium",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}>Instances detected</div>
          </div>
        ))}
      </div>
    </div>
  );
}
