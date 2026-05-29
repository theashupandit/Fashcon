'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sliders, Settings2 } from 'lucide-react';

import { useTheme } from '@/components/ThemeProvider';

const configItems = [
  { name: 'Site Identity', href: '/configuration/identity', color: '#60a5fa' },
  { name: 'API Connections', href: '/configuration/api', color: '#38bdf8' },
  { name: 'OAuth Manager', href: '/configuration/oauth', color: '#818cf8' },
  { name: 'Environment Variables', href: '/configuration/env', color: '#fb7185' },
  { name: 'Cron Jobs', href: '/configuration/cron', color: '#fbbf24' },
  { name: 'AI Providers', href: '/configuration/ai', color: '#a78bfa' },
  { name: 'Cloudinary', href: '/configuration/cloudinary', color: '#2dd4bf' },
  { name: 'Pinterest API', href: '/configuration/pinterest', color: '#e11d48' },
  { name: 'Google APIs', href: '/configuration/google', color: '#34d399' },
  { name: 'Security', href: '/configuration/security', color: '#94a3b8' },
];

export default function ConfigNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  const activeItem = configItems.find(item => pathname.startsWith(item.href)) || 
                     (pathname === '/configuration' ? configItems[0] : null);

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
                <Settings2 className="w-4 h-4 text-[#94a3b8] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em]",
                  isDark ? "text-zinc-500" : "text-zinc-400"
                )}>System Configuration Hub</span>
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
                  : (isDark ? "bg-white/10 border-white/30 hover:bg-white/20" : "bg-black/5 border-black/20 hover:bg-black/10")
              )}
            >
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-colors",
                isCollapsed ? (isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-500 group-hover:text-black") : (isDark ? "text-white" : "text-black")
              )}>
                {isCollapsed ? 'Expand Configuration' : 'Collapse View'}
              </span>
              {isCollapsed ? (
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isDark ? "text-zinc-500 group-hover:text-white" : "text-zinc-400 group-hover:text-black"
                )} />
              ) : (
                <ChevronUp className={cn("w-3.5 h-3.5", isDark ? "text-white" : "text-black")} />
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
                  {configItems.map((item, i) => {
                    const isActive = pathname.startsWith(item.href);
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
                              ? (isDark ? "text-white shadow-lg" : "text-black shadow-md")
                              : (isDark ? "text-zinc-500 hover:text-zinc-200" : "text-zinc-400 hover:text-zinc-800")
                          )}
                          style={{
                            borderColor: isActive ? `${item.color}40` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            backgroundColor: isActive ? `${item.color}20` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                            boxShadow: isActive ? `0 0 20px ${item.color}15` : 'none',
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
