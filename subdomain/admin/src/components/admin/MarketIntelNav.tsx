'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Radar } from 'lucide-react';

import { useTheme } from '@/components/ThemeProvider';

const intelItems = [
  { name: 'SEO Command Center', href: '/growth/seo-command', color: '#ff003c' },
  { name: 'Google Analytics', href: '/growth/analytics', color: '#f59e0b' },
  { name: 'Search Console', href: '/growth/search-console', color: '#3b82f6' },
  { name: 'Keyword Intelligence', href: '/growth/keywords', color: '#8b5cf6' },
  { name: 'Technical SEO', href: '/growth/technical-seo', color: '#10b981' },
  { name: 'Performance Lab', href: '/growth/performance', color: '#06b6d4' },
  { name: 'Core Web Vitals', href: '/growth/core-web-vitals', color: '#00ffd0' },
  { name: 'Index Monitor', href: '/growth/index-monitor', color: '#d946ef' },
  { name: 'Sitemap Manager', href: '/growth/sitemaps', color: '#2dd4bf' },
  { name: 'Rich Results', href: '/growth/rich-results', color: '#84cc16' },
  { name: 'Content Optimizer', href: '/growth/content-optimizer', color: '#f43f5e' },
  { name: 'Audience Insights', href: '/growth/audience', color: '#0ea5e9' },
  { name: 'Conversion Tracking', href: '/growth/conversions', color: '#f97316' },
  { name: 'Trend Radar', href: '/growth/trends', color: '#ec4899' },
  { name: 'Competitor Watch', href: '/growth/competitors', color: '#6366f1' },
  { name: 'AI Recommendations', href: '/growth/ai-recommendations', color: '#a855f7' },
];

export default function MarketIntelNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for clean look
  
  const activeItem = intelItems.find(item => item.href === pathname);

  return (
    <div 
      className={cn(
        "sticky z-40 w-full backdrop-blur-2xl border-b transition-all duration-500 ease-in-out",
        isDark ? "bg-[#050505]/95 border-white/5" : "bg-white/95 border-black/5 shadow-sm"
      )}
      style={{ top: 64 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-4">
          {/* Header Row with Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border",
                isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
              )}>
                <Radar className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em]",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>Market Intelligence Workspace</span>
                {isCollapsed && activeItem && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2",
                      isDark ? "text-white" : "text-black"
                    )}
                  >
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: activeItem.color }} />
                    {activeItem.name}
                  </motion.span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group border",
                isCollapsed 
                  ? (isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10")
                  : "bg-primary/10 border-primary/30 hover:bg-primary/20"
              )}
            >
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-colors",
                isCollapsed ? (isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-500 group-hover:text-black") : "text-primary"
              )}>
                {isCollapsed ? 'Expand Radar' : 'Collapse Navigation'}
              </span>
              {isCollapsed ? (
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-black"
                )} />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          </div>

          {/* Navigation Items - Only visible when NOT collapsed */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-start gap-2 pt-2 pb-1">
                  {intelItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border flex items-center gap-2",
                            isActive 
                              ? (isDark ? "text-white" : "text-black")
                              : (isDark ? "text-zinc-500 hover:text-zinc-200" : "text-zinc-400 hover:text-zinc-800")
                          )}
                          style={{
                            borderColor: isActive ? item.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                            backgroundColor: 'transparent',
                            boxShadow: isActive ? `0 0 15px ${item.color}20` : 'none',
                          }}
                        >
                          <div 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-300",
                              isActive ? "scale-125 shadow-[0_0_8px_currentColor]" : "opacity-40"
                            )}
                            style={{ 
                              backgroundColor: item.color,
                              color: item.color 
                            }} 
                          />
                          <span className="relative z-10">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
