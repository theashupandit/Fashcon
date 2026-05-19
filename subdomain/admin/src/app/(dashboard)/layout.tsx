'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SafeImage } from "@/components/ui/SafeImage";
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import ParticleWeb from '@/components/ParticleWeb';
import { cn } from '@/lib/utils';
import { MediaProvider, useMediaSync } from '@/lib/media-context';
import { Loader2, Lock } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, loginRequired, loginGateLoading } = useAuth();
  const isAuthorized = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'manager';
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isParticlesEnabled, setIsParticlesEnabled] = useState(true);
  const [animationMode, setAnimationMode] = useState<'network' | 'drift' | 'pulse'>('network');
  const [particleConfig, setParticleConfig] = useState({
    particleColor: "160,140,255",
    lineColor: "120,100,240"
  });

  // Only enforce auth redirect when login gate is enabled
  useEffect(() => {
    if (!loading && !loginGateLoading && loginRequired && !isAuthorized) {
      router.push('/login');
    }
  }, [isAuthorized, loading, loginRequired, loginGateLoading, router]);

  if (loading || loginGateLoading) {
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

  // Block access only when login is required and user is not authorized
  if (loginRequired && !isAuthorized) {
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
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hasAccess = () => {
    if (!profile) return true; // Let initial loading state handle it
    if (profile.role === 'super_admin' || profile.role === 'admin') return true;
    if (profile.role === 'manager') {
      const perms = profile.permissions || {
        dashboard: true,
        analytics: false,
        store: false,
        products: false,
        media: false,
        inbox: false,
        blogs: false,
        marketing: false,
        pinterest: false,
        settings: false
      };
      if (pathname === '/') return !!perms.dashboard;
      if (pathname.startsWith('/analytics')) return !!perms.analytics;
      if (pathname.startsWith('/store') || pathname.startsWith('/home')) return !!perms.store;
      if (pathname.startsWith('/products')) return !!perms.products;
      if (pathname.startsWith('/media')) return !!perms.media;
      if (pathname.startsWith('/inbox')) return !!perms.inbox;
      if (pathname.startsWith('/blog-panel') || pathname.startsWith('/blogs')) return !!perms.blogs;
      if (pathname.startsWith('/affiliate') || pathname.startsWith('/intelligence')) return !!perms.marketing;
      if (pathname.startsWith('/pinterest')) return !!perms.pinterest;
      if (pathname.startsWith('/operators') || pathname.startsWith('/configuration')) return !!perms.settings;
      return false;
    }
    return false;
  };

  const permitted = hasAccess();

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
              {permitted ? (
                children
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '80px 20px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out'
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 24,
                    background: 'rgba(244,63,94,0.1)', border: '2px solid rgba(244,63,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f43f5e', marginBottom: 24, animation: 'bounce 2s infinite'
                  }}>
                    <Lock className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                    Access Shield
                  </h2>
                  <p style={{
                    fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em',
                    color: '#f43f5e', background: 'rgba(244,63,94,0.08)', padding: '6px 14px',
                    borderRadius: 10, border: '1px solid rgba(244,63,94,0.15)', margin: '0 0 24px', display: 'inline-block'
                  }}>
                    Route Restricted Protocol
                  </p>
                  
                  <div style={{
                    width: '100%', maxWidth: 420,
                    background: profile?.role === 'manager' && !permitted ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                    padding: 20, marginBottom: 28, textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4 }}>Attempted Route</span>
                      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', opacity: 0.8 }}>{pathname}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4 }}>Required Action</span>
                      <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fb7185' }}>Super Admin Authorization</span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.6, maxWidth: 360, margin: '0 0 28px', textTransform: 'uppercase', letterSpacing: '0.02em'
                  }}>
                    Your credentials hold insufficient clearance to view this pipeline. Please contact your Super Administrator.
                  </p>
                  
                  <button
                    onClick={() => router.push('/')}
                    style={{
                      height: 44, padding: '0 28px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      border: 'none', color: '#fff', fontSize: 11, fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(244,63,94,0.3)', transition: 'all 0.15s'
                    }}
                  >
                    Return to Command
                  </button>
                </div>
              )}
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
