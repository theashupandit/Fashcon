'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ToggleTheme } from '@/components/ToggleTheme';
import { useTheme } from '@/components/ThemeProvider';
import ParticleWeb from '@/components/ParticleWeb';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaEnvelope, FaTimes, FaShieldAlt } from 'react-icons/fa';

const containerVariants: any = {
  hidden: { opacity: 0, scale: 0.96, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Custom easeOutExpo
      when: "beforeChildren",
      staggerChildren: 0.08
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 }
  }
};

function LoginPageContent() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading, signIn, loginRequired, loginGateLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* ── Flashlight / spotlight effect ──────────────────────── */
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y, opacity: 1 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setSpotlight((s) => ({ ...s, opacity: 0 }));
  }, [])

  const particleColor = isDark ? "160,100,255" : "120,60,220";
  const lineColor = isDark ? "100,60,200" : "160,80,255";

  useEffect(() => {
    setMounted(true);
  }, []);

  // When login gate is disabled, auto-redirect to dashboard
  useEffect(() => {
    if (mounted && !loginGateLoading && !loginRequired) {
      window.location.href = redirectTo;
    }
  }, [mounted, loginRequired, loginGateLoading, redirectTo]);

  useEffect(() => {
    if (mounted && user && profile) {
      if (['admin', 'super_admin', 'manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile.role)) {
        window.location.href = redirectTo;
      } else {
        window.location.href = 'https://www.fashcon.store';
      }
    }
  }, [mounted, user, profile, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { user: signedInUser, error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden z-[999]"
        style={{
          background: isDark
            ? [
                'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(139,92,246,0.30) 0%, transparent 60%)',
                'radial-gradient(ellipse 60% 55% at 88% 8%,  rgba(244,63,94,0.22)  0%, transparent 55%)',
                'radial-gradient(ellipse 65% 55% at 72% 88%, rgba(59,130,246,0.18)  0%, transparent 60%)',
                'radial-gradient(ellipse 50% 45% at 18% 82%, rgba(16,185,129,0.12)  0%, transparent 55%)',
                '#000000',
              ].join(',')
            : [
                'radial-gradient(ellipse 80% 65% at 8%  12%,  rgba(167,139,250,0.45) 0%, transparent 60%)',
                'radial-gradient(ellipse 65% 55% at 90% 6%,   rgba(244,63,94,0.32)  0%, transparent 55%)',
                'radial-gradient(ellipse 65% 55% at 75% 92%,  rgba(96,165,250,0.30)  0%, transparent 60%)',
                'radial-gradient(ellipse 55% 50% at 12% 88%,  rgba(52,211,153,0.25)  0%, transparent 55%)',
                'radial-gradient(ellipse 40% 35% at 50% 50%,  rgba(251,191,36,0.10)  0%, transparent 60%)',
                '#ede9fe',
              ].join(','),
        }}
      >
        {mounted && (
          <ParticleWeb
            mode="network"
            particleCount={85}
            connectionDistance={135}
            speed={0.4}
            particleColor={particleColor}
            lineColor={lineColor}
            mouseRepelRadius={120}
            mouseRepelForce={2.5}
            className="!z-0 opacity-100"
          />
        )}
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full border-[4px] border-[var(--primary)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-700"
      style={{
        background: isDark
          ? [
              'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(139,92,246,0.30) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 55% at 88% 8%,  rgba(244,63,94,0.22)  0%, transparent 55%)',
              'radial-gradient(ellipse 65% 55% at 72% 88%, rgba(59,130,246,0.18)  0%, transparent 60%)',
              'radial-gradient(ellipse 50% 45% at 18% 82%, rgba(16,185,129,0.12)  0%, transparent 55%)',
              '#000000',
            ].join(',')
          : [
              'radial-gradient(ellipse 80% 65% at 8%  12%,  rgba(167,139,250,0.45) 0%, transparent 60%)',
              'radial-gradient(ellipse 65% 55% at 90% 6%,   rgba(244,63,94,0.32)  0%, transparent 55%)',
              'radial-gradient(ellipse 65% 55% at 75% 92%,  rgba(96,165,250,0.30)  0%, transparent 60%)',
              'radial-gradient(ellipse 55% 50% at 12% 88%,  rgba(52,211,153,0.25)  0%, transparent 55%)',
              'radial-gradient(ellipse 40% 35% at 50% 50%,  rgba(251,191,36,0.10)  0%, transparent 60%)',
              '#ede9fe',
            ].join(','),
      }}
    >
      {/* Dynamic, theme-aware particle network background */}
      <ParticleWeb
        mode="network"
        particleCount={85}
        connectionDistance={135}
        speed={0.4}
        particleColor={particleColor}
        lineColor={lineColor}
        mouseRepelRadius={120}
        mouseRepelForce={2.5}
        className="!z-0 opacity-100"
      />

      {/* Absolute adaptive theme toggle */}
      <div className="absolute top-6 right-6 z-20 animate-in fade-in zoom-in duration-700">
        <ToggleTheme className="w-11 h-11 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all shadow-sm flex items-center justify-center" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[380px] relative z-10"
      >
        <motion.div
          ref={cardRef}
          variants={itemVariants}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{
            scale: 1.01,
            boxShadow: isDark
              ? '0 16px 32px -8px rgba(244,63,94,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 16px 32px -8px rgba(244,63,94,0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-[var(--card)]/80 dark:bg-[var(--card)]/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-300"
        >

          {/* ── Flashlight spotlight overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300 z-0"
            style={{
              opacity: spotlight.opacity,
              background: `radial-gradient(160px circle at ${spotlight.x}% ${spotlight.y}%,
                rgba(244,63,94,0.15) 0%,
                rgba(244,63,94,0.04) 40%,
                transparent 80%)`,
            }}
          />

          {/* ── Glass inner sheen (top edge highlight) ── */}
          <div
            className="absolute top-0 inset-x-0 h-px pointer-events-none z-0"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.06) 60%, transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.6) 60%, transparent)',
            }}
          />

          <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-[var(--primary)]/10 blur-[70px] pointer-events-none z-0" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-violet-500/8 blur-[70px] pointer-events-none z-0" />

          <div className="relative z-10">
            <div className="mb-8 relative">
              <motion.div
                initial={{ scale: 0.8, rotate: -3 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                className="flex items-center gap-2 mb-5"
              >
                <img
                  src="/Admin favicon_io/android-chrome-192x192.png"
                  alt="Fashcon Logo"
                  className="h-11 w-11 object-contain"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
                />
                <span className="font-black tracking-tighter italic flex items-baseline gap-0.5 text-[var(--primary)]">
                  <span className="text-xl">
                    FASHCON
                  </span>
                  <span className="font-bold lowercase tracking-normal text-[10.5px] text-[var(--primary)]/65">
                    fashion
                  </span>
                </span>
                <span className="text-[9px] font-black tracking-widest uppercase bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--primary)]/20 ml-auto">
                  PORTAL
                </span>
              </motion.div>
              <h2 className="text-lg font-black tracking-tight mb-2">Control System</h2>
              <p className="text-[12px] font-medium opacity-40 leading-relaxed">
                Enter your account credentials to access the backend infrastructure.
              </p>
            </div>
 
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Account Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-[var(--primary)] transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="account@fashcon.store"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12 rounded-xl bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/10 transition-all text-[14px] font-bold placeholder:opacity-20 hover:border-[var(--primary)]/10"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Key</Label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-[var(--primary)] transition-colors duration-300" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 pr-11 h-12 rounded-xl bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/10 transition-all text-[14px] font-bold placeholder:opacity-20 hover:border-[var(--primary)]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-[var(--foreground)]/30 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-bold overflow-hidden mb-4"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-black uppercase tracking-wider text-[11px] shadow-[0_4px_20px_rgba(244,63,94,0.25)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 border-none relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Authenticate
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-wider text-[11px] shadow-[0_4px_20px_rgba(15,23,42,0.15)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-none relative overflow-hidden"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Reset Password
                  </span>
                </Button>
              </motion.div>

            <motion.div variants={itemVariants} className="pt-4 text-center">
              <a
                href="https://www.fashcon.store"
                className="text-[12px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-all hover:text-[var(--primary)] duration-500"
              >
                Iconic Fashion
              </a>
            </motion.div>
          </form>
          </div>{/* end z-10 content wrapper */}
        </motion.div>
      </motion.div>

      {/* Password Reset Support Modal — glassmorphism matched to login card */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            {/* Backdrop — same mesh gradient as page bg, heavily blurred */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 backdrop-blur-xl"
              style={{
                background: isDark
                  ? 'rgba(0,0,0,0.75)'
                  : [
                      'radial-gradient(ellipse 80% 65% at 8%  12%,  rgba(167,139,250,0.25) 0%, transparent 60%)',
                      'radial-gradient(ellipse 65% 55% at 90% 6%,   rgba(244,63,94,0.18)  0%, transparent 55%)',
                      'radial-gradient(ellipse 65% 55% at 75% 92%,  rgba(96,165,250,0.18)  0%, transparent 60%)',
                      'rgba(0,0,0,0.55)',
                    ].join(','),
              }}
            />

            {/* Panel — same glass style as login card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.style.setProperty('--mx', `${x}%`);
                e.currentTarget.style.setProperty('--my', `${y}%`);
                (e.currentTarget.querySelector('.modal-spotlight') as HTMLElement | null)
                  ?.style.setProperty('opacity', '1');
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.querySelector('.modal-spotlight') as HTMLElement | null)
                  ?.style.setProperty('opacity', '0');
              }}
              className="relative w-full max-w-[380px] rounded-3xl shadow-2xl overflow-hidden p-8"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(244,63,94,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.60) 50%, rgba(244,63,94,0.04) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: 'none',
                boxShadow: isDark
                  ? '0 32px 72px -12px rgba(244,63,94,0.18), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 32px 72px -12px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Flashlight spotlight */}
              <div
                className="modal-spotlight absolute inset-0 pointer-events-none rounded-3xl z-0 transition-opacity duration-300"
                style={{
                  opacity: 0,
                  background: 'radial-gradient(280px circle at var(--mx,50%) var(--my,50%), rgba(244,63,94,0.13) 0%, rgba(244,63,94,0.05) 35%, transparent 65%)',
                }}
              />

              {/* Top-edge sheen */}
              <div
                className="absolute top-0 inset-x-0 h-px pointer-events-none z-0"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.06) 60%, transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.7) 60%, transparent)',
                }}
              />

              {/* Ambient glows */}
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--primary)]/10 blur-[60px] pointer-events-none z-0" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none z-0" />

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResetModal(false);
                }}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl z-50 transition-colors cursor-pointer"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  color: isDark ? 'white' : 'black',
                }}
              >
                <FaTimes size={13} />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center space-y-5">
                <div
                  className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                  style={{
                    background: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)',
                    border: '1px solid rgba(244,63,94,0.2)',
                  }}
                >
                  <FaShieldAlt className="text-[var(--primary)] text-xl" />
                </div>

                <div>
                  <h3
                    className="text-xl font-black tracking-tighter uppercase italic mb-1.5"
                    style={{ color: isDark ? 'white' : 'black' }}
                  >
                    Access Recovery
                  </h3>
                  <p
                    className="text-[12px] font-medium leading-relaxed max-w-[260px] mx-auto"
                    style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                  >
                    For security reasons, please contact our administrative support to reset your access key.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => window.open('https://wa.me/919135158961', '_blank')}
                    className="w-full h-12 rounded-2xl flex items-center justify-between px-5 group transition-all active:scale-[0.98] cursor-pointer"
                    style={{
                      background: 'rgba(37,211,102,0.10)',
                      border: '1px solid rgba(37,211,102,0.22)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                        <FaWhatsapp className="text-white text-sm" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[10px]" style={{ color: isDark ? 'white' : 'black' }}>WhatsApp Direct</span>
                    </div>
                    <ArrowRight size={13} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: isDark ? 'white' : 'black' }} />
                  </button>

                  <button
                    onClick={() => window.open('https://www.instagram.com/fashconfashion/', '_blank')}
                    className="w-full h-12 rounded-2xl flex items-center justify-between px-5 group transition-all active:scale-[0.98] cursor-pointer"
                    style={{
                      background: 'rgba(228,64,95,0.10)',
                      border: '1px solid rgba(228,64,95,0.22)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-lg">
                        <FaInstagram className="text-white text-sm" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[10px]" style={{ color: isDark ? 'white' : 'black' }}>Instagram DM</span>
                    </div>
                    <ArrowRight size={13} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: isDark ? 'white' : 'black' }} />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=officialfashcon@gmail.com&su=${encodeURIComponent('Admin Password Reset')}`, '_blank')}
                      className="h-12 rounded-2xl flex items-center justify-center gap-2.5 group transition-all active:scale-[0.98] cursor-pointer"
                      style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}
                    >
                      <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow">
                        <i className="fa-solid fa-envelope text-[#EA4335] text-[9px]"></i>
                      </div>
                      <span className="font-black uppercase tracking-widest text-[9px]" style={{ color: isDark ? 'white' : 'black' }}>Gmail</span>
                    </button>
                    <button
                      onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=support@fashcon.store&su=${encodeURIComponent('Admin Password Reset')}`, '_blank')}
                      className="h-12 rounded-2xl flex items-center justify-center gap-2.5 group transition-all active:scale-[0.98] cursor-pointer"
                      style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}
                    >
                      <div className="w-6 h-6 rounded-md bg-[var(--primary)] flex items-center justify-center shadow">
                        <FaEnvelope className="text-white text-[9px]" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[9px]" style={{ color: isDark ? 'white' : 'black' }}>Support</span>
                    </button>
                  </div>
                </div>

                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-60 pt-1">
                  24/7 Security Protocol
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-16 h-16 rounded-full border-[4px] border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
