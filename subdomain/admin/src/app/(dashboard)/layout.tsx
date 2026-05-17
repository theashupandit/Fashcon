'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeImage } from "@/components/ui/SafeImage";
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import ParticleWeb from '@/components/ParticleWeb';
import { cn } from '@/lib/utils';
import { MediaProvider, useMediaSync } from '@/lib/media-context';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isParticlesEnabled, setIsParticlesEnabled] = useState(true);
  const [animationMode, setAnimationMode] = useState<'network' | 'drift' | 'pulse'>('network');
  const [particleConfig, setParticleConfig] = useState({
    particleColor: "160,140,255",
    lineColor: "120,100,240"
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--background)] z-[999]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-2 border-[var(--primary)] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <SafeImage
              src="/android-chrome-192x192.png"
              alt="Fashcon"
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 animate-pulse">
          Initializing Control System
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MediaProvider>
      <DashboardContent isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} isParticlesEnabled={isParticlesEnabled} setIsParticlesEnabled={setIsParticlesEnabled} animationMode={animationMode} setAnimationMode={setAnimationMode} particleConfig={particleConfig} setParticleConfig={setParticleConfig}>
        {children}
      </DashboardContent>
    </MediaProvider>
  );
}

function DashboardContent({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isParticlesEnabled,
  setIsParticlesEnabled,
  animationMode,
  setAnimationMode,
  particleConfig,
  setParticleConfig
}: any) {
  const { uploadProgress, uploadSpeed, uploadStats } = useMediaSync();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/20 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={cn(
        "page-wrapper transition-all duration-500 ease-in-out flex-1 flex flex-col min-h-screen relative isolation-isolate",
        isSidebarCollapsed ? "md:pl-[64px]" : "md:pl-[200px]"
      )}
        style={{ ['--sidebar-w' as any]: isSidebarCollapsed ? '64px' : '200px' }}
      >
        {isParticlesEnabled && (
          <ParticleWeb
            mode={animationMode}
            particleCount={animationMode === 'drift' ? 40 : 80}
            connectionDistance={130}
            speed={animationMode === 'drift' ? 0.2 : 0.45}
            particleColor={particleConfig.particleColor}
            lineColor={particleConfig.lineColor}
            mouseRepelRadius={100}
            mouseRepelForce={2}
          />
        )}
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isParticlesEnabled={isParticlesEnabled}
          setIsParticlesEnabled={setIsParticlesEnabled}
          animationMode={animationMode}
          setAnimationMode={setAnimationMode}
          particleConfig={particleConfig}
          setParticleConfig={setParticleConfig}
        />

        <main className="flex-1 flex flex-col relative z-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>

          {/* Universal Background Pipeline Status (Compact Version) */}
          {uploadStats.isUploading && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[400px] max-w-[90vw] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 z-[9999]">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/90">Sync Pipeline</p>
                    {uploadStats.total > 1 && (
                      <span className="text-[8px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded border border-[var(--primary)]/20 uppercase">
                        {uploadStats.current}/{uploadStats.total}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-[var(--primary)] tabular-nums italic">{uploadSpeed}</p>
                </div>

                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--primary)] to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              <div className="h-6 w-px bg-white/10 mx-1" />

              <div className="text-right shrink-0">
                <p className="text-xl font-black text-white tracking-tighter tabular-nums leading-none">{uploadProgress}%</p>
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mt-1">Archive</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
