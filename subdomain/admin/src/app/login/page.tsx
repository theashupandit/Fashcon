'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, Loader2, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ToggleTheme } from '@/components/ToggleTheme';
import { useTheme } from '@/components/ThemeProvider';
import ParticleWeb from '@/components/ParticleWeb';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading, signIn } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const particleColor = "160,140,255";
  const lineColor = "120,100,240";

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        router.push('/');
      } else {
        window.location.href = 'https://www.fashcon.store';
      }
    }
  }, [user, profile, router]);

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

  if (loading) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'} z-[999] transition-colors duration-500`}>
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
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 mb-8 transition-all group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Fashcon
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-[var(--card)]/80 dark:bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-10 shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(244,63,94,0.06), 0 0 40px 0 rgba(0,0,0,0.5)'
              : '0 25px 50px -12px rgba(244,63,94,0.04), 0 0 40px 0 rgba(0,0,0,0.02)'
          }}
        >
          {/* Ambient glow decoration */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[var(--primary)]/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-[80px] pointer-events-none" />

          <div className="mb-10 relative">
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="flex items-center gap-3 mb-6"
            >
              <h1 className="text-3xl font-black italic tracking-tighter text-[var(--primary)] relative">
                FASHCON
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--primary)] to-pink-500 animate-pulse" />
              </h1>
              <span className="text-[10px] font-black tracking-widest uppercase bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">
                ADMIN
              </span>
            </motion.div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Control System</h2>
            <p className="text-[13px] font-medium opacity-40 leading-relaxed">
              Enter your administrative credentials to access the backend infrastructure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Admin Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-[var(--primary)] transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="admin@fashcon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 rounded-2xl bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/10 transition-all text-[15px] font-bold placeholder:opacity-20 hover:border-[var(--primary)]/10"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Key</Label>
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-[var(--primary)] transition-colors duration-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-14 rounded-2xl bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)]/30 focus:ring-1 focus:ring-[var(--primary)]/10 transition-all text-[15px] font-bold placeholder:opacity-20 hover:border-[var(--primary)]/10"
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

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-[var(--primary)] hover:opacity-95 text-white font-black uppercase tracking-widest text-[13px] shadow-[0_4px_20px_rgba(244,63,94,0.25)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 border-none relative overflow-hidden"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span className="flex items-center gap-2">
                    Authenticate Access <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            variants={itemVariants}
            className="mt-8 pt-8 border-t border-[var(--border)] text-center"
          >
            <p className="text-[11px] font-bold opacity-30 uppercase tracking-tighter">
              Internal Tool. Unauthorized access is monitored and logged.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
