'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { ChevronRight, ChevronLeft, Info } from 'lucide-react';

interface BlogCardProps {
  post: any;
}

export default function BlogCard({ post }: BlogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayImage = (post.thumbnailImage || post.image || '').trim();
  const hasRealImage = displayImage && displayImage !== '/placeholder.png';

  // Real-time synchronization with global dark/light theme shifts
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Professional click-outside and touch-outside detection to collapse the drawer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const cardBg = isDark ? "#141414" : "#faf9f7";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.45)";
  const excerptColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";

  const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div ref={cardRef} className="group relative rounded-[28px] bg-transparent transition-all duration-500 break-inside-avoid mb-10 overflow-visible select-none w-full">

      {/* ── 1. Main Portrait Image Card (100% Uncut, Same size as PinCard, Rounded) ── */}
      <div className="relative w-full aspect-[3/4] rounded-[28px] overflow-hidden bg-[var(--muted)] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--foreground)]/5 dark:border-white/5 transition-all duration-500 z-20">
        <Link href={`/blog/${post.slug || post._id}`} className="block w-full h-full relative">

          {/* Main Cover Image - 100% Complete, No cropped or flat edges */}
          {hasRealImage ? (
            <SafeImage
              src={displayImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--muted)]" />
          )}

          {/* Top Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex rounded-full px-3.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 border border-red-500/20 shadow-[0_4px_12px_rgba(230,0,35,0.3)]">
              {post.category}
            </span>
          </div>

          {/* Bottom Title & CTA Text Overlay (Directly on Image) */}
          <div className="absolute inset-x-0 bottom-0 pt-32 pb-6 px-6 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end text-white z-15">
            <h3 className="text-sm sm:text-base font-black leading-[1.25] text-white transition-colors line-clamp-2 mb-2.5 uppercase tracking-wide drop-shadow-md">
              {post.title}
            </h3>
            <span className="inline-flex items-center text-[8px] font-black uppercase tracking-[0.25em] text-[var(--primary)] group-hover:opacity-85 transition-opacity">
              [ Read Story &gt; ]
            </span>
          </div>
        </Link>
      </div>

      {/* ── 2. BACK LAYER: Collapsible Info Card Tucked Behind (Slides Out Horizontally to Right) ── */}
      <motion.div
        animate={{
          width: isExpanded ? 240 : 16,
          paddingLeft: isExpanded ? 36 : 0,
          paddingRight: isExpanded ? 16 : 0
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="absolute top-4 bottom-4 left-[98%] z-10 flex flex-col justify-between rounded-r-[24px] border border-l-0 shadow-[15px_0_35px_rgba(0,0,0,0.03)] dark:shadow-[15px_0_35px_rgba(0,0,0,0.25)] overflow-hidden transition-colors duration-500"
        style={{
          background: cardBg,
          borderColor: border,
          paddingTop: "24px",
          paddingBottom: "24px"
        }}
      >
        {/* Artistic Fashion Watermark Doodles in Background */}
        {isExpanded && (
          <>
            {/* 1. Mannequin Dress Form Sketch (Bottom Right) */}
            <svg className="absolute -right-3 -bottom-5 w-30 h-40 pointer-events-none opacity-[0.24] dark:opacity-[0.14] text-[var(--foreground)] transition-opacity duration-500 z-0 rotate-[-3deg]" viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50,15 C45,15 45,22 45,25 C45,27 48,27 50,27 C52,27 55,27 55,25 C55,22 55,15 50,15 Z" />
              <path d="M43,30 L57,30 C58,35 56,45 50,45 C44,45 42,35 43,30 Z" fill="currentColor" opacity="0.1" />
              <path d="M50,32 C38,32 35,42 35,48 C35,53 38,58 42,65 C45,70 45,80 43,92 C42,98 42,105 50,105 C58,105 58,98 57,92 C55,80 55,70 58,65 C62,58 65,53 65,48 C65,42 62,32 50,32 Z" />
              <path d="M44,40 C44,52 47,68 47,85 C47,93 46,99 47,105" strokeDasharray="2,2" />
              <path d="M56,40 C56,52 53,68 53,85 C53,93 54,99 53,105" strokeDasharray="2,2" />
              <path d="M37,48 C43,50 57,50 63,48" strokeDasharray="2,2" />
              <path d="M39,60 C44,61 56,61 61,60" strokeDasharray="2,2" />
              <path d="M40,75 C45,77 55,77 60,75" strokeDasharray="2,2" />
              <path d="M50,105 L50,140" strokeWidth="1.5" />
              <path d="M50,140 L42,147 L58,147 Z" />
              <path d="M25,120 C38,115 45,130 65,122 C75,119 72,110 82,115" strokeWidth="1" strokeDasharray="1.5,1.5" />
            </svg>

            {/* 2. Coat Hanger Sketch (Top Right) */}
            <svg className="absolute -right-2 top-2 w-14 h-14 pointer-events-none opacity-[0.18] dark:opacity-[0.1] text-[var(--foreground)] transition-opacity duration-500 z-0" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40,15 C42,10 47,10 47,14 C47,19 40,22 40,24" />
              <path d="M40,24 C30,28 15,35 12,38 C10,40 12,41 15,41 L65,41 C68,41 70,40 68,38 C65,35 50,28 40,24 Z" />
              <path d="M22,41 L22,46 C22,48 24,50 26,50 L54,50 C56,50 58,48 58,46 L58,41" strokeDasharray="2,2" />
            </svg>

            {/* 3. Designer Tailor Shears/Scissors (Bottom Left) */}
            <svg className="absolute left-4 bottom-14 w-11 h-11 pointer-events-none opacity-[0.16] dark:opacity-[0.09] text-[var(--foreground)] transition-opacity duration-500 z-0 rotate-[35deg]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="20" cy="22" r="5" />
              <circle cx="20" cy="42" r="5" />
              <path d="M25,24 L48,34" />
              <path d="M25,40 L48,30" />
              <path d="M20,27 L20,37" strokeDasharray="2,2" strokeWidth="0.8" />
            </svg>

            {/* 4. Luxury Perfume Bottle Sketch (Middle Right) */}
            <svg className="absolute right-4 top-20 w-11 h-11 pointer-events-none opacity-[0.15] dark:opacity-[0.08] text-[var(--foreground)] transition-opacity duration-500 z-0 rotate-[-10deg]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="24" y="10" width="16" height="8" rx="1" />
              <rect x="28" y="18" width="8" height="4" />
              <rect x="16" y="22" width="32" height="32" rx="4" />
              <rect x="22" y="30" width="20" height="16" rx="1" strokeDasharray="2,2" strokeWidth="0.8" />
              <path d="M32,34 L32,42 M28,38 L36,38" strokeWidth="0.8" />
            </svg>

            {/* 5. Tailor's Measuring Tape Ribbon Swirl (Top Left / Center) */}
            <svg className="absolute left-2 top-8 w-24 h-16 pointer-events-none opacity-[0.14] dark:opacity-[0.08] text-[var(--foreground)] transition-opacity duration-500 z-0" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
              <path d="M10,25 C30,10 50,45 70,20 C85,5 92,30 95,25" />
              <path d="M10,25 C30,10 50,45 70,20 C85,5 92,30 95,25" strokeDasharray="1,3" strokeWidth="2.5" />
            </svg>
          </>
        )}

        {/* Hidden Area Content - smoothly revealed as width expands */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between h-full w-[188px] space-y-4 overflow-hidden"
            >
              {/* Info Header */}
              <div className="flex flex-col">
                <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary)] mb-1.5">
                  Journal Details
                </span>
                <span className="font-serif italic font-bold text-lg text-[var(--foreground)] tracking-wide">
                  {post.category}
                </span>
              </div>

              {/* Excerpt/Card Info Details - falls back to excerpt if dedicated cardInfo is empty */}
              <div className="pt-4 border-t border-[var(--foreground)]/5 dark:border-white/5 flex-1 overflow-y-auto max-h-[165px] pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--primary)]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                <p className="font-serif italic text-[14.5px] leading-[1.75] tracking-wide" style={{ color: excerptColor }}>
                  {post.cardInfo || post.excerpt}
                </p>
              </div>

              {/* Luxury Info Meta Footer */}
              <div
                className="pt-3 flex flex-row items-center justify-between text-[8px] font-black uppercase tracking-wide shrink-0"
                style={{ borderTop: `1px solid ${border}`, color: muted }}
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-[var(--primary)] shrink-0 animate-pulse" />
                  <span className="whitespace-nowrap">By Fashcon Editors</span>
                </div>
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* ── 3. INTERACTIVE VERTICAL CLOTHING STICKER / PULL TAB (Floats In Front of Card, Attached to Drawer Edge) ── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 -translate-y-1/2 z-30 select-none cursor-pointer active:scale-90 transition-transform"
        style={{
          left: "calc(98% - 2px)" // Positions it perfectly floating over the right edge boundary of the blog card!
        }}
      >
        {/* Authentic physical vertical clothing label tag */}
        <motion.div
          style={{
            background: 'rgb(220, 38, 38)', // Bold Brand Red
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)'
          }}
          whileHover={{ width: 28 }}
          className="flex items-center justify-center w-6 h-9 rounded-r-[8px] rounded-l-[3px] text-white transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center shrink-0"
          >
            <ChevronRight size={13} strokeWidth={3} />
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}
