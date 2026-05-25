'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import MarketIntelNav from '@/components/admin/MarketIntelNav';
import ConfigNav from '@/components/admin/ConfigNav';
import ParticleWeb from '@/components/ParticleWeb';
import { cn } from '@/lib/utils';
import { MediaProvider, useMediaSync } from '@/lib/media-context';
import { Loader2, Lock, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, loginRequired, loginGateLoading, sessionTimeRemaining, extendSession, logout } = useAuth();
  const isAuthorized = ['super_admin', 'admin', 'manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile?.role || '');
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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0b] z-[999] overflow-hidden select-none">
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fc-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fc-spin-reverse {
            to { transform: rotate(-360deg); }
          }
          @keyframes fc-pulse-ring {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.25); opacity: 0; }
          }
          @keyframes fc-pulse-ring-delay {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.4); opacity: 0; }
          }
          @keyframes fc-logo-breathe {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.06); filter: brightness(1.2); }
          }
          @keyframes fc-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
          @keyframes fc-fade-up {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fc-letter-reveal {
            from { opacity: 0; transform: translateY(8px) scale(0.9); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          @keyframes fc-dot-pulse {
            0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
          @keyframes fc-particle-float {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            50% { transform: translateY(-80px) translateX(20px); }
          }
          @keyframes fc-glow-orbit {
            0% { transform: rotate(0deg) translateX(70px) rotate(0deg); opacity: 0.5; }
            50% { opacity: 1; }
            100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); opacity: 0.5; }
          }
        `}</style>

        {/* Ambient background glow */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(230,0,35,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 2 === 0 ? '3px' : '2px',
            height: i % 2 === 0 ? '3px' : '2px',
            borderRadius: '50%',
            background: i % 3 === 0 ? 'rgba(230,0,35,0.5)' : 'rgba(255,255,255,0.2)',
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 15}%`,
            animation: `fc-particle-float ${5 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Main loader assembly */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Outer pulse rings */}
          <div style={{
            position: 'absolute', inset: '-10px', borderRadius: '50%',
            border: '1px solid rgba(230,0,35,0.15)',
            animation: 'fc-pulse-ring 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '-10px', borderRadius: '50%',
            border: '1px solid rgba(230,0,35,0.08)',
            animation: 'fc-pulse-ring-delay 3s ease-in-out 0.8s infinite',
          }} />

          {/* Outer spinning ring (dashed) */}
          <div style={{
            position: 'absolute', inset: '0', borderRadius: '50%',
            border: '1.5px dashed rgba(255,255,255,0.06)',
            animation: 'fc-spin 20s linear infinite',
          }} />

          {/* Primary arc ring */}
          <div style={{
            position: 'absolute', inset: '12px', borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#e60023',
            borderRightColor: 'rgba(230,0,35,0.3)',
            animation: 'fc-spin 1.4s cubic-bezier(0.68, -0.15, 0.27, 1.15) infinite',
            filter: 'drop-shadow(0 0 8px rgba(230,0,35,0.4))',
          }} />

          {/* Secondary arc ring (counter) */}
          <div style={{
            position: 'absolute', inset: '24px', borderRadius: '50%',
            border: '1.5px solid transparent',
            borderBottomColor: 'rgba(255,255,255,0.15)',
            borderLeftColor: 'rgba(255,255,255,0.05)',
            animation: 'fc-spin-reverse 2s linear infinite',
          }} />

          {/* Inner subtle ring */}
          <div style={{
            position: 'absolute', inset: '34px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.04)',
          }} />

          {/* Orbiting dot */}
          <div style={{
            position: 'absolute', inset: '0',
            animation: 'fc-spin 3s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)',
              width: '4px', height: '4px', borderRadius: '50%',
              background: '#e60023',
              boxShadow: '0 0 12px 3px rgba(230,0,35,0.6)',
            }} />
          </div>

          {/* Logo center */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(230,0,35,0.12) 0%, rgba(20,20,22,0.9) 100%)',
            border: '1px solid rgba(230,0,35,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fc-logo-breathe 3s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(230,0,35,0.15), inset 0 0 20px rgba(0,0,0,0.5)',
            position: 'relative', zIndex: 2,
          }}>
            <img
              src="/android-chrome-192x192.png"
              alt="Fashcon"
              width={30}
              height={30}
              className="rounded-full"
              style={{ filter: 'drop-shadow(0 0 6px rgba(230,0,35,0.3))' }}
            />
          </div>
        </div>

        {/* Brand text with staggered letter reveal */}
        <div style={{
          marginTop: '36px',
          display: 'flex', gap: '5px', alignItems: 'center',
          animation: 'fc-fade-up 0.8s ease-out 0.3s both',
        }}>
          {'FASHCON'.split('').map((letter, i) => (
            <span key={i} style={{
              fontSize: '16px', fontWeight: 900, letterSpacing: '0.35em',
              color: i === 0 || i === 4 ? '#e60023' : 'rgba(255,255,255,0.7)',
              animation: `fc-letter-reveal 0.5s ease-out ${0.5 + i * 0.08}s both`,
              display: 'inline-block',
            }}>
              {letter}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p style={{
          marginTop: '10px',
          fontSize: '9px', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.2)',
          animation: 'fc-fade-up 0.8s ease-out 1.2s both',
        }}>
          Control System
        </p>

        {/* Progress bar */}
        <div style={{
          marginTop: '32px',
          width: '180px', height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px', overflow: 'hidden',
          animation: 'fc-fade-up 0.8s ease-out 1.5s both',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, #e60023 50%, transparent 100%)',
            animation: 'fc-shimmer 1.8s ease-in-out infinite',
            width: '40%',
          }} />
        </div>

        {/* Loading dots */}
        <div style={{
          marginTop: '20px', display: 'flex', gap: '6px',
          animation: 'fc-fade-up 0.8s ease-out 1.8s both',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: '#e60023',
              animation: `fc-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
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

      {/* Session Expiring Medium-Sized Centered Modal */}
      {sessionTimeRemaining > 0 && sessionTimeRemaining < 60 && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md text-white select-none animate-in fade-in duration-300">
          <div className="max-w-[420px] w-full mx-4 p-8 rounded-3xl border border-red-500/20 bg-neutral-900/90 backdrop-blur-xl text-center flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Glowing Shield/Lock Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
              <div className="w-14 h-14 rounded-2xl border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-500 animate-bounce">
                <Lock className="w-6 h-6" strokeWidth={2} />
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-1">
              <h2 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-xl font-black tracking-wide text-red-500 uppercase"
              >
                Security Timeout
              </h2>
              <p className="text-[9px] font-black tracking-[0.25em] text-white/40 uppercase">
                Active Protocol Shield
              </p>
            </div>

            {/* Ticking Monospace Timer */}
            <div className="py-2">
              <span className="text-5xl font-black tracking-tighter tabular-nums text-white/90 font-mono">
                00:{sessionTimeRemaining.toString().padStart(2, '0')}
              </span>
              <p className="text-[10px] text-white/50 font-medium tracking-wide mt-1.5 px-4">
                This administrative console will automatically terminate.
              </p>
            </div>

            {/* Premium Extend Button Options (+2m, +5m, +10m) */}
            <div className="flex flex-col gap-3 w-full mt-2">
              <div className="flex gap-2.5 w-full">
                <button
                  onClick={() => extendSession(120)} // +2 Min (120s)
                  className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 active:scale-95"
                >
                  +2 Min
                </button>
                <button
                  onClick={() => extendSession(300)} // +5 Min (300s)
                  className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 active:scale-95"
                >
                  +5 Min
                </button>
                <button
                  onClick={() => extendSession(600)} // +10 Min (600s)
                  className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white border border-red-500/30 shadow-[0_4px_16px_rgba(220,38,38,0.2)] hover:shadow-[0_4px_24px_rgba(220,38,38,0.35)] transition-all duration-200 active:scale-95"
                >
                  +10 Min
                </button>
              </div>

              {/* Terminate Session / Log Out Direct Option */}
              <button
                onClick={() => logout()}
                className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider bg-zinc-950 dark:bg-black hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminate Session & Logout
              </button>
            </div>
          </div>
        </div>
      )}
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
    if (['manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile.role)) {
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

        {pathname.startsWith('/growth') && <MarketIntelNav />}
        {pathname.startsWith('/configuration') && <ConfigNav />}

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
                    background: ['manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile?.role || '') && !permitted ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.02)',
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
