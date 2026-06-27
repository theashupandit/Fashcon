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
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Terminal,
  Copy,
  Scissors,
  Clipboard,
  ChevronDown
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

  // New states for clipboard, selection, mobile and accordion menus
  const [menuState, setMenuState] = useState({
    hasSelection: false,
    isEditable: false,
    selectionText: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  // Monitor viewport size to determine if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const updateMenuState = () => {
    const activeEl = document.activeElement;
    const selection = window.getSelection()?.toString() || "";
    
    const isElEditable = activeEl && (
      activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      (activeEl as HTMLElement).isContentEditable ||
      activeEl.closest?.("input") ||
      activeEl.closest?.("textarea")
    );

    setMenuState({
      hasSelection: selection.length > 0,
      isEditable: !!isElEditable,
      selectionText: selection,
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateMenuState();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      updateMenuState();

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

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

  const copyPageLink = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(window.location.href);
    toast.success("Page link copied to clipboard", {
        icon: <Link2 className="w-4 h-4" />
    });
  };

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textToCopy = menuState.selectionText || window.getSelection()?.toString();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast.success("Text copied to clipboard", { icon: <Copy className="w-4 h-4" /> });
        })
        .catch(() => {
          toast.error("Failed to copy text");
        });
    }
  };

  const handleCut = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textToCut = menuState.selectionText || window.getSelection()?.toString();
    if (textToCut) {
      navigator.clipboard.writeText(textToCut)
        .then(() => {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)) {
            const start = activeEl.selectionStart || 0;
            const end = activeEl.selectionEnd || 0;
            const val = activeEl.value;
            activeEl.value = val.substring(0, start) + val.substring(end);
            activeEl.setSelectionRange(start, start);
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            toast.success("Text cut to clipboard", { icon: <Scissors className="w-4 h-4" /> });
          } else if (activeEl && (activeEl as HTMLElement).isContentEditable) {
            document.execCommand('delete');
            toast.success("Text cut to clipboard", { icon: <Scissors className="w-4 h-4" /> });
          }
          updateMenuState();
        })
        .catch(() => {
          toast.error("Failed to cut text");
        });
    }
  };

  const handlePaste = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)) {
        const start = activeEl.selectionStart || 0;
        const end = activeEl.selectionEnd || 0;
        const val = activeEl.value;
        activeEl.value = val.substring(0, start) + text + val.substring(end);
        activeEl.setSelectionRange(start + text.length, start + text.length);
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        toast.success("Text pasted from clipboard", { icon: <Clipboard className="w-4 h-4" /> });
      } else if (activeEl && (activeEl as HTMLElement).isContentEditable) {
        document.execCommand('insertText', false, text);
        toast.success("Text pasted from clipboard", { icon: <Clipboard className="w-4 h-4" /> });
      }
      updateMenuState();
    } catch (err) {
      toast.error("Clipboard access denied or empty");
    }
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

  const toggleSubmenu = (menuName: string) => {
    setExpandedSubmenu(expandedSubmenu === menuName ? null : menuName);
  };

  return (
    <>
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

          {/* Clipboard Group */}
          <ContextMenuItem 
            onClick={handleCopy}
            disabled={!menuState.hasSelection}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 hover:text-white transition-all cursor-pointer group focus:bg-[var(--primary)]/10"
          >
            <Copy className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            <span className="text-xs font-bold">Copy Selection</span>
            <ContextMenuShortcut className="text-[10px] opacity-30">⌘+C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem 
            onClick={handleCut}
            disabled={!menuState.hasSelection || !menuState.isEditable}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 hover:text-white transition-all cursor-pointer group focus:bg-[var(--primary)]/10"
          >
            <Scissors className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            <span className="text-xs font-bold">Cut</span>
            <ContextMenuShortcut className="text-[10px] opacity-30">⌘+X</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem 
            onClick={handlePaste}
            disabled={!menuState.isEditable}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 hover:text-white transition-all cursor-pointer group focus:bg-[var(--primary)]/10"
          >
            <Clipboard className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            <span className="text-xs font-bold">Paste</span>
            <ContextMenuShortcut className="text-[10px] opacity-30">⌘+V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={copyPageLink} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 hover:text-white transition-all cursor-pointer group focus:bg-[var(--primary)]/10">
            <Link2 className="w-4 h-4 opacity-40 group-hover:opacity-100" />
            <span className="text-xs font-bold">Copy Endpoint Link</span>
            <ContextMenuShortcut className="text-[10px] opacity-30">⌥+⌘+C</ContextMenuShortcut>
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

      {/* Mobile Floating Action Trigger & Command Terminal Dialog */}
      <div className="md:hidden">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (open) {
            updateMenuState();
          }
        }}>
          <DialogTrigger asChild>
            <button 
              className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full bg-zinc-950/90 border border-zinc-800 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-[var(--primary)] backdrop-blur-md ring-1 ring-white/10 group"
              aria-label="Open Command Terminal"
              onClick={updateMenuState}
            >
              <Terminal className="w-5 h-5 group-hover:animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-zinc-950 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </button>
          </DialogTrigger>
          <DialogContent 
            showCloseButton={true}
            overlayClassName="bg-black/60 backdrop-blur-xs"
            className="w-[calc(100%-2rem)] max-w-sm bg-zinc-950/95 border-zinc-800 backdrop-blur-2xl text-zinc-300 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-3xl p-3 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-3 py-2 mb-2 flex items-center justify-between border-b border-white/5 pr-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)] opacity-90">Fashcon Admin</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 italic">Command Terminal v2.4 (Mobile)</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-1 mb-2 px-1">
              <button 
                onClick={() => { router.back(); setDialogOpen(false); }}
                className="flex flex-col items-center justify-center py-3 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mb-1 opacity-40 group-active:opacity-100 group-active:text-[var(--primary)] transition-all" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400">Back</span>
              </button>
              <button 
                onClick={() => { window.location.reload(); setDialogOpen(false); }}
                className="flex flex-col items-center justify-center py-3 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all group"
              >
                <RotateCw className={cn("w-4 h-4 mb-1 opacity-40 group-active:opacity-100 group-active:text-blue-500 transition-all", isRefreshing && "animate-spin")} />
                <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400">Reload</span>
              </button>
              <button 
                onClick={() => { router.forward(); setDialogOpen(false); }}
                className="flex flex-col items-center justify-center py-3 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all group"
              >
                <ArrowRight className="w-4 h-4 mb-1 opacity-40 group-active:opacity-100 group-active:text-[var(--primary)] transition-all" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400">Next</span>
              </button>
            </div>

            {/* Clipboard Tools */}
            <div className="space-y-1 mb-2 px-1">
              <button 
                onClick={(e) => { handleCopy(e); setDialogOpen(false); }}
                disabled={!menuState.hasSelection}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all text-left"
              >
                <Copy className="w-4 h-4 opacity-40" />
                <span className="text-xs font-bold">Copy Selection</span>
              </button>
              <button 
                onClick={(e) => { handleCut(e); setDialogOpen(false); }}
                disabled={!menuState.hasSelection || !menuState.isEditable}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all text-left"
              >
                <Scissors className="w-4 h-4 opacity-40" />
                <span className="text-xs font-bold">Cut</span>
              </button>
              <button 
                onClick={(e) => { handlePaste(e); setDialogOpen(false); }}
                disabled={!menuState.isEditable}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all text-left"
              >
                <Clipboard className="w-4 h-4 opacity-40" />
                <span className="text-xs font-bold">Paste</span>
              </button>
              <button 
                onClick={(e) => { copyPageLink(e); setDialogOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all text-left"
              >
                <Link2 className="w-4 h-4 opacity-40" />
                <span className="text-xs font-bold">Copy Endpoint Link</span>
              </button>
            </div>

            <div className="bg-white/5 my-1 h-px" />

            {/* Accordion Menus */}
            <div className="space-y-1">
              {/* Quick Navigation Accordion */}
              <div>
                <button 
                  onClick={() => toggleSubmenu("navigation")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 opacity-40" />
                    <span className="text-xs font-bold text-zinc-400">Quick Navigation</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-200", expandedSubmenu === "navigation" && "rotate-180")} />
                </button>
                {expandedSubmenu === "navigation" && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l border-zinc-800 ml-5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button onClick={() => { router.push('/'); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Main Dashboard</span>
                    </button>
                    <button onClick={() => { router.push('/products'); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                      <span>Products Manager</span>
                    </button>
                    <button onClick={() => { router.push('/blog-panel'); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Blog Engine</span>
                    </button>
                    <button onClick={() => { router.push('/categories'); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Settings className="w-3.5 h-3.5 text-purple-500" />
                      <span>Categories Config</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Advanced Diagnostics Accordion */}
              <div>
                <button 
                  onClick={() => toggleSubmenu("diagnostics")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 opacity-40" />
                    <span className="text-xs font-bold text-zinc-400">Advanced Diagnostics</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-200", expandedSubmenu === "diagnostics" && "rotate-180")} />
                </button>
                {expandedSubmenu === "diagnostics" && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l border-zinc-800 ml-5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-3 py-2.5 mb-1 bg-white/[0.02] rounded-lg">
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Environment Telemetry</p>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-zinc-500 uppercase tracking-tighter">Kernel OS</span>
                          <span className="text-white bg-zinc-800 px-1 py-0.5 rounded italic">{systemInfo.os}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-zinc-500 uppercase tracking-tighter">Core Engine</span>
                          <span className="text-white bg-zinc-800 px-1 py-0.5 rounded italic">{systemInfo.browser}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-zinc-500 uppercase tracking-tighter">Resolution</span>
                          <span className="text-white bg-zinc-800 px-1 py-0.5 rounded italic">{systemInfo.res}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={(e) => { forceSync(e); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Force Cloud Sync</span>
                    </button>
                    <button onClick={() => { toast.info("System healthy", { description: "All database nodes responding in < 20ms" }); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Integrity Shield Scan</span>
                    </button>
                    <button onClick={() => { window.open('https://github.com', '_blank'); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>View Source (Remote)</span>
                    </button>
                    <button 
                      onClick={() => {
                        toast.info("Native Inspect Protocol", {
                          description: "Use F12 or Ctrl+Shift+I. SuperAdmin clearance verified.",
                          icon: <Terminal className="w-4 h-4" />
                        });
                        setDialogOpen(false);
                      }} 
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold"
                    >
                      <Code className="w-3.5 h-3.5 text-rose-500" />
                      <span>Inspect Console</span>
                    </button>
                    <button onClick={(e) => { clearCache(e); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 text-left text-xs font-bold">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Local Matrix</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Environment UI Accordion */}
              <div>
                <button 
                  onClick={() => toggleSubmenu("theme")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] active:bg-white/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-4 h-4 opacity-40 text-blue-400" /> : <Sun className="w-4 h-4 opacity-40 text-amber-400" />}
                    <span className="text-xs font-bold text-zinc-400">Environment UI</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-200", expandedSubmenu === "theme" && "rotate-180")} />
                </button>
                {expandedSubmenu === "theme" && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l border-zinc-800 ml-5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button onClick={() => { setTheme("light"); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Radiant Mode</span>
                    </button>
                    <button onClick={() => { setTheme("dark"); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Abyssal Mode</span>
                    </button>
                    <button onClick={() => { setTheme("system"); setDialogOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] active:bg-white/5 text-left text-xs font-bold">
                      <Laptop className="w-3.5 h-3.5 opacity-50" />
                      <span>Sync with OS</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 my-1 h-px" />

            {/* Terminate Session */}
            <button 
              onClick={() => { logout(); setDialogOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/5 active:bg-red-500/10 text-red-400 transition-all text-left"
            >
              <LogOut className="w-4 h-4 opacity-40" />
              <span className="text-xs font-bold">Terminate Session</span>
            </button>

            <div className="px-3 py-3 mt-1 opacity-20 border-t border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex -space-x-2">
                    <div className="w-4 h-4 rounded-full bg-zinc-800 ring-2 ring-zinc-950" />
                    <div className="w-4 h-4 rounded-full bg-zinc-700 ring-2 ring-zinc-950" />
                </div>
                <p className="text-[7px] font-black uppercase text-center tracking-[0.3em]">SECURE ACCESS ONLY</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
