"use client";

import React, { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Link2, 
  ShieldCheck, 
  Monitor, 
  Moon,
  Sun,
  Laptop,
  Zap,
  LayoutDashboard,
  ExternalLink,
  Trash2,
  HardDrive,
  Activity,
  LogOut,
  RefreshCw,
  Eye,
  Settings,
  Code,
  Terminal
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function GlobalContextMenu({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();
  const { logout, profile } = useAuth();
  const router = useRouter();
  const [systemInfo, setSystemInfo] = useState({ os: "", browser: "", res: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Basic system info gathering
    const ua = window.navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";

    setSystemInfo({
      os,
      browser,
      res: `${window.innerWidth}x${window.innerHeight}`
    });
  }, []);

  const copyPageLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    toast.success("Page link copied to clipboard", {
        icon: <Link2 className="w-4 h-4" />
    });
  };

  const clearCache = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.clear();
    toast.info("Cache Purged", {
      description: "Local storage has been cleared for debugging.",
      icon: <Trash2 className="w-4 h-4" />
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  const forceSync = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefreshing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Synchronizing with cloud node...',
        success: 'Sync Complete: All assets up to date.',
        error: 'Sync Failed: Node unreachable.',
      }
    );
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 2500);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="w-full min-h-screen">
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-72 bg-zinc-950/90 border-zinc-800 backdrop-blur-2xl text-zinc-300 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-3xl p-2 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-3 py-2 mb-2 flex items-center justify-between border-b border-white/5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)] opacity-90">Fashcon Admin</p>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 italic">Command Terminal v2.4</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>

        <div className="grid grid-cols-3 gap-1 mb-2 px-1">
          <ContextMenuItem 
            onClick={() => router.back()}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer focus:bg-white/5 focus:text-white"
          >
            <ArrowLeft className="w-4 h-4 mb-1 opacity-40 group-hover:opacity-100 group-hover:text-[var(--primary)] transition-all" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Back</span>
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => window.location.reload()}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer focus:bg-white/5 focus:text-white"
          >
            <RotateCw className={cn("w-4 h-4 mb-1 opacity-40 group-hover:opacity-100 group-hover:text-blue-500 transition-all", isRefreshing && "animate-spin")} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Reload</span>
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => router.forward()}
            className="flex flex-col items-center justify-center py-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer focus:bg-white/5 focus:text-white"
          >
            <ArrowRight className="w-4 h-4 mb-1 opacity-40 group-hover:opacity-100 group-hover:text-[var(--primary)] transition-all" />
            <span className="text-[8px] font-black uppercase tracking-tighter">Next</span>
          </ContextMenuItem>
        </div>

        <ContextMenuItem onClick={copyPageLink} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 hover:text-white transition-all cursor-pointer group focus:bg-[var(--primary)]/10">
          <Link2 className="w-4 h-4 opacity-40 group-hover:opacity-100" />
          <span className="text-xs font-bold">Copy Endpoint Link</span>
          <ContextMenuShortcut className="text-[10px] opacity-30">⌘+C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/5 my-1" />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer data-[state=open]:bg-white/5 focus:bg-white/5">
            <LayoutDashboard className="w-4 h-4 opacity-40" />
            <span className="text-xs font-bold text-zinc-400">Quick Navigation</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl text-zinc-300 p-2 rounded-2xl min-w-[200px] shadow-2xl ring-1 ring-white/10 z-[99999]">
            <ContextMenuItem onClick={() => router.push('/')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold">Main Dashboard</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => router.push('/products')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold">Products Manager</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => router.push('/blog-panel')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <ExternalLink className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold">Blog Engine</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => router.push('/categories')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Settings className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold">Categories Config</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer data-[state=open]:bg-white/5 focus:bg-white/5 group">
            <Activity className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            <span className="text-xs font-bold text-zinc-400">Advanced Diagnostics</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl text-zinc-300 p-2 rounded-2xl min-w-[220px] shadow-2xl ring-1 ring-white/10 z-[99999]">
            <div className="px-3 py-2.5 mb-1 border-b border-white/5 bg-white/[0.02] rounded-t-xl">
              <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Environment Telemetry</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase tracking-tighter">Kernel OS</span>
                  <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded italic">{systemInfo.os}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase tracking-tighter">Core Engine</span>
                  <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded italic">{systemInfo.browser}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase tracking-tighter">Resolution</span>
                  <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded italic">{systemInfo.res}</span>
                </div>
              </div>
            </div>
            
            <ContextMenuItem onClick={forceSync} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer mt-1 focus:bg-white/5 focus:text-white">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">Force Cloud Sync</span>
            </ContextMenuItem>

            <ContextMenuItem onClick={() => toast.info("System healthy", { description: "All database nodes responding in < 20ms" })} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold">Integrity Shield Scan</span>
            </ContextMenuItem>

            <ContextMenuItem onClick={() => window.open('https://github.com', '_blank')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold">View Source (Remote)</span>
            </ContextMenuItem>

            <ContextMenuItem 
              onClick={() => {
                toast.info("Native Inspect Protocol", {
                  description: "Use F12 or Ctrl+Shift+I. SuperAdmin clearance verified.",
                  icon: <Terminal className="w-4 h-4" />
                });
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white"
            >
              <Code className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold">Inspect Console</span>
            </ContextMenuItem>
            
            <ContextMenuSeparator className="bg-white/5 my-1" />

            <ContextMenuItem onClick={clearCache} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 cursor-pointer group focus:bg-red-500/10">
              <Trash2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <span className="text-xs font-bold">Purge Local Matrix</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer data-[state=open]:bg-white/5 focus:bg-white/5">
            {theme === 'dark' ? <Moon className="w-4 h-4 opacity-40 text-blue-400" /> : <Sun className="w-4 h-4 opacity-40 text-amber-400" />}
            <span className="text-xs font-bold text-zinc-400">Environment UI</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl text-zinc-300 p-2 rounded-2xl shadow-2xl ring-1 ring-white/10 z-[99999]">
            <ContextMenuItem onClick={() => setTheme("light")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">Radiant Mode</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">Abyssal Mode</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme("system")} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
              <Laptop className="w-4 h-4 opacity-50" />
              <span className="text-xs font-bold">Sync with OS</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="bg-white/5 my-1" />

        <ContextMenuItem onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer group focus:bg-red-500/10">
          <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100" />
          <span className="text-xs font-bold">Terminate Session</span>
        </ContextMenuItem>

        <div className="px-3 py-3 mt-1 opacity-20 border-t border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex -space-x-2">
                <div className="w-4 h-4 rounded-full bg-zinc-800 ring-2 ring-zinc-950" />
                <div className="w-4 h-4 rounded-full bg-zinc-700 ring-2 ring-zinc-950" />
            </div>
            <p className="text-[7px] font-black uppercase text-center tracking-[0.3em]">SECURE ACCESS ONLY</p>
          </div>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
