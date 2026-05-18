'use client';

import React, { useState } from 'react';
import { FaPaperPlane, FaCheckCircle, FaSpinner, FaStar } from 'react-icons/fa';
import { toast } from 'sonner';
import { subscribeToNewsletter } from '@/app/actions/storefront';
import Link from 'next/link';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        setSubscribed(true);
        setEmail('');
        toast.success(res.message || 'Subscribed successfully!');
      } else {
        toast.error(res.error || 'Failed to subscribe.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-r from-[#1a052e] via-[#6b0f6c] to-[#be123c] relative overflow-hidden select-none border-t border-b border-white/10">
      {/* Ambient luxury light effect */}
      <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay pointer-events-none" />
      
      {/* Editorial Hand-Drawn Background Doodles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Doodle 1: Solid Hand-drawn Sparkle (Top Left) - Filled */}
        <svg className="absolute top-10 left-[8%] w-16 h-16 text-white opacity-[0.11] animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M50 10 C50 35, 35 50, 10 50 C35 50, 50 65, 50 90 C50 65, 65 50, 90 50 C65 50, 50 35, 50 10 Z" />
        </svg>

        {/* Doodle 2: Hand-drawn Loopy Heart (Bottom Left-ish) */}
        <svg className="absolute bottom-[28%] left-[12%] w-12 h-12 text-white opacity-[0.10] -rotate-12 animate-[pulse_6s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M50 30 C60 10, 85 15, 85 40 C85 65, 55 80, 50 85 C45 80, 15 65, 15 40 C15 15, 40 10, 50 30 Z" />
          <path d="M32 82 C45 78, 55 80, 68 82" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Doodle 3: Designer Leather Handbag Sketch (Bottom Left) */}
        <svg className="absolute bottom-8 left-[6%] w-16 h-16 text-white opacity-[0.12] rotate-6 animate-[pulse_5s_ease-in-out_infinite_1s]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 45 L75 45 C80 45, 82 48, 80 55 L75 80 C74 83, 70 85, 65 85 L35 85 C30 85, 26 83, 25 80 L20 55 C18 48, 20 45, 25 45 Z" />
          <path d="M38 45 C38 25, 62 25, 62 45" />
          <path d="M42 45 L58 45 L54 60 C54 62, 46 62, 46 60 Z" fill="currentColor" strokeWidth="0" />
        </svg>

        {/* Doodle 4: Cat-Eye Editorial Sunglasses (Center Left-ish) */}
        <svg className="absolute top-[40%] left-[22%] w-16 h-16 text-white opacity-[0.10] -rotate-12 animate-[pulse_4s_ease-in-out_infinite_1.5s]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 45 C15 45, 20 30, 42 38 C42 38, 48 55, 30 55 C12 55, 15 45, 15 45 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M85 45 C85 45, 80 30, 58 38 C58 38, 52 55, 70 55 C88 55, 85 45, 85 45 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M42 41 Q50 36, 58 41" />
          <path d="M15 45 Q5 40, 10 30" strokeWidth="1.5" />
          <path d="M85 45 Q95 40, 90 30" strokeWidth="1.5" />
        </svg>

        {/* Doodle 5: Cozy Sparkles Trio (Top Right) */}
        <svg className="absolute top-10 right-[25%] w-14 h-14 text-white opacity-[0.12] animate-[pulse_5s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M30 20 L30 40 M20 30 L40 30" />
          <path d="M68 32 C68 37, 65 40, 60 40 C65 40, 68 43, 68 48 C68 43, 71 40, 76 40 C71 40, 68 37, 68 32 Z" fill="currentColor" strokeWidth="0" />
          <path d="M50 70 L50 80 M45 75 L55 75" strokeWidth="2" />
        </svg>

        {/* Doodle 6: Classic Perfume Bottle (Top Right-ish) */}
        <svg className="absolute top-8 right-[8%] w-14 h-18 text-white opacity-[0.13] rotate-12 animate-[pulse_5s_ease-in-out_infinite_0.5s]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="25" y="40" width="50" height="48" rx="8" />
          <rect x="37" y="52" width="26" height="22" rx="2" strokeWidth="1.5" />
          <rect x="42" y="32" width="16" height="8" rx="1" fill="currentColor" strokeWidth="0" />
          <circle cx="50" cy="24" r="10" />
          <path d="M28 72 C40 70, 60 74, 72 72" strokeWidth="1.5" />
        </svg>

        {/* Doodle 7: Elegant Stiletto High Heel (Bottom Right) */}
        <svg className="absolute bottom-8 right-[6%] w-16 h-16 text-white opacity-[0.12] -rotate-[12deg] animate-[pulse_6s_ease-in-out_infinite_2s]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 75 L30 75 Q42 75 52 65 L75 42 C82 35, 85 30, 80 25 C75 22, 70 25, 65 32 L48 55 Q38 68, 25 68 L20 68" />
          <path d="M22 68 L22 85" strokeWidth="3" />
          <path d="M68 34 Q80 48, 65 52" strokeWidth="1.5" />
        </svg>

        {/* Doodle 8: Mini Solid Sparkle (Center Right-ish) */}
        <svg className="absolute top-[45%] right-[20%] w-8 h-8 text-white opacity-[0.11] animate-[pulse_3s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 20 C50 35, 40 45, 25 45 C40 45, 50 55, 50 70 C50 55, 60 45, 75 45 C60 45, 50 35, 50 20 Z" />
        </svg>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70 block mb-2">
          FASHCON PRIVÉ
        </span>
        <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-white mb-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          The Glow Up Edit
        </h2>
        <p className="flex items-center justify-center gap-2 text-rose-200 text-xs font-black uppercase tracking-widest mb-6">
          <FaStar className="text-yellow-400" size={12} /> Claim 15% Off Your First Curation <FaStar className="text-yellow-400" size={12} />
        </p>



        {subscribed ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 px-6 bg-white/10 backdrop-blur-md rounded-2xl max-w-sm mx-auto border border-white/20 shadow-lg animate-in fade-in zoom-in duration-300">
            <FaCheckCircle className="text-emerald-400 w-8 h-8 animate-bounce" />
            <h3 className="text-white text-sm font-bold">You are subscribed!</h3>
            <p className="text-white/80 text-[10px] font-medium">Check your inbox for styling updates.</p>
          </div>
        ) : (
          <form
            className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
              className="flex-grow px-5 py-3 rounded-[12px] bg-white/10 border border-white/20 outline-none text-white placeholder-white/50 font-medium focus:border-white focus:bg-white/20 text-xs transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-white text-zinc-950 hover:bg-zinc-100 px-6 py-3 rounded-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 text-xs shrink-0 disabled:opacity-75 cursor-pointer shadow-lg border-none"
            >
              {loading ? (
                <>
                  Sending <FaSpinner size={14} className="animate-spin" />
                </>
              ) : (
                <>
                  Subscribe <FaPaperPlane size={13} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-white/70 text-[9px] font-medium mt-4">
          By subscribing, you agree to our{' '}
          <Link href="/privacy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="underline hover:text-white transition-colors">
            Terms of Service
          </Link>.
        </p>
      </div>
    </section>
  );
}
