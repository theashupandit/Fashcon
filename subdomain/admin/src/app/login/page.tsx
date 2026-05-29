'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

  const particleColor = "160,140,255";
  const lineColor = "120,100,240";

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
      <div className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-[999]`}>
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
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-slate-50'} flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500`}>
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
          variants={itemVariants}
          whileHover={{ 
            scale: 1.01,
            boxShadow: isDark
              ? '0 30px 60px -10px rgba(244,63,94,0.12), 0 0 50px 0 rgba(244,63,94,0.08)'
              : '0 30px 60px -10px rgba(244,63,94,0.08), 0 0 50px 0 rgba(244,63,94,0.04)'
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-[var(--card)]/80 dark:bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] hover:border-[var(--primary)]/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-300"
        >
          {/* Ambient glow decoration */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[var(--primary)]/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-[80px] pointer-events-none" />

          <div className="mb-8 relative">
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="flex items-center gap-2 mb-5"
            >
              <img
                src="/logo.png"
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
                ADMIN
              </span>
            </motion.div>
            <h2 className="text-lg font-black tracking-tight mb-2">Control System</h2>
            <p className="text-[12px] font-medium opacity-40 leading-relaxed">
              Enter your administrative credentials to access the backend infrastructure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Admin Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-[var(--primary)] transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="admin@fashcon.com"
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
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-bold overflow-hidden"
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
        </motion.div>
      </motion.div>

      {/* Luxury Password Reset Support Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative w-full max-w-[420px] bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--primary)]/5 blur-[60px] pointer-events-none" />
              
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white cursor-pointer z-10"
              >
                <FaTimes size={14} />
              </button>

              <div className="relative z-10 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-2 shadow-inner">
                  <FaShieldAlt className="text-[var(--primary)] text-2xl" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-2">
                    Access Recovery
                  </h3>
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                    For security reasons, please contact our administrative support to reset your access key.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => window.open('https://wa.me/919135158961', '_blank')}
                    className="w-full h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-between px-6 group hover:bg-[#25D366]/20 transition-all active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                        <FaWhatsapp className="text-white text-lg" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[11px] text-white">WhatsApp Direct</span>
                    </div>
                    <ArrowRight size={14} className="text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button 
                    onClick={() => window.open('https://www.instagram.com/fashconfashion/', '_blank')}
                    className="w-full h-14 rounded-2xl bg-[#E4405F]/10 border border-[#E4405F]/20 flex items-center justify-between px-6 group hover:bg-[#E4405F]/20 transition-all active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-lg shadow-[#E4405F]/20">
                        <FaInstagram className="text-white text-lg" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[11px] text-white">Instagram DM</span>
                    </div>
                    <ArrowRight size={14} className="text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=officialfashcon@gmail.com&su=${encodeURIComponent('Admin Password Reset')}`, '_blank')}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 group hover:bg-white/10 transition-all active:scale-98 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-envelope text-[#EA4335] text-[10px]"></i>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black uppercase tracking-widest text-[9px] text-white">Gmail</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=support@fashcon.store&su=${encodeURIComponent('Admin Password Reset')}`, '_blank')}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 group hover:bg-white/10 transition-all active:scale-98 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-lg">
                        <FaEnvelope className="text-white text-[10px]" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black uppercase tracking-widest text-[9px] text-white">Support</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-60">
                    24/7 Security Protocol
                  </p>
                </div>
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
