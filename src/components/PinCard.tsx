'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { FaShareAlt, FaStar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PinCardProps {
  product: {
    id?: string;
    title: string;
    image: string;
    gallery?: string[];
    category?: string;
    description?: string;
    blogUrl?: string;
    rating?: number;
    reviewsCount?: number;
    prices?: {
      original?: string;
      offer?: string;
      discountPercentage?: number;
    };
    ctaText?: string;
    badge?: string;
  };
}

const PinCard: React.FC<PinCardProps> = ({ product }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ratingExpanded, setRatingExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Deterministic mock data to avoid hydration mismatch
  const getMockData = (title: string) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = 4.5 + (Math.abs(hash % 5) / 10);
    const c = 50 + Math.abs(hash % 450);
    return { rating: r.toFixed(1), count: c };
  };

  const { rating, count: reviewsCount } = {
    rating: (product.rating !== undefined && product.rating !== null) ? product.rating.toFixed(1) : getMockData(product.title).rating,
    count: (product.reviewsCount !== undefined && product.reviewsCount !== null) ? product.reviewsCount : getMockData(product.title).count,
  };

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const rawUrl = product.blogUrl || '';
    if (rawUrl.startsWith('http')) {
      setShareUrl(rawUrl);
    } else {
      setShareUrl(`${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`);
    }
  }, [product.blogUrl]);

  const encodedUrl = encodeURIComponent(shareUrl || product.blogUrl || '');
  const encodedText = encodeURIComponent(product.title);

  // Close when clicking outside
  useEffect(() => {
    if (!isShareOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

  const touchStartX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isShareOpen) return;
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX.current - currentX;
    if (Math.abs(diffX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 45;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  const shareLinks = [
    { id: 'pinterest', icon: 'fa-brands fa-pinterest', color: '#E60023', url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}` },
    { id: 'whatsapp', icon: 'fa-brands fa-whatsapp', color: '#25D366', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { id: 'facebook', icon: 'fa-brands fa-facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: 'twitter', icon: 'fa-brands fa-x-twitter', color: '#000000', url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
    { id: 'copy', icon: 'fa-solid fa-link', color: '#6366f1', url: '#' },
  ];

  const toggleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsShareOpen(prev => !prev);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const premiumFadeVariants = {
    enter: {
      opacity: 0
    },
    center: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  };

  return (
    <div ref={cardRef} className="group/card masonry-item relative break-inside-avoid mb-8">
      <div className="relative overflow-visible rounded-[24px] bg-[var(--card)] shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all duration-300">

        {/* Clickable Image Area */}
        <div
          className="block relative overflow-hidden rounded-[24px] group/img"
        >
          <Link
            href={product.blogUrl || '#'}
            onClick={(e) => {
              if (isShareOpen || isSwiping.current) { e.preventDefault(); }
            }}
          >
            <div 
              className="relative overflow-hidden aspect-[3/4]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <SafeImage
                src={images[currentImageIndex]}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                className="block h-full w-full object-cover transition-all duration-500 group-hover/img:scale-105"
              />

              {/* ── Product Badges (Sticky to Corner Wrapper) ─────────────────────────────────────── */}
              <div className="absolute top-0 left-0 z-40 flex flex-col gap-1 items-start">
                {product.badge && product.badge !== 'None' && (
                  <div className={`text-[7.5px] font-bold uppercase tracking-[0.14em] py-0.5 pl-3.5 pr-3.5 rounded-tr-full rounded-br-full rounded-bl-none rounded-tl-[24px] shadow-[1px_2px_8px_rgba(0,0,0,0.12)] border-y border-r border-white/15 backdrop-blur-sm select-none ${
                    product.badge === 'Luxury'
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] text-stone-900 border-[#ffe680]/20 shadow-[0_2px_8px_rgba(212,175,55,0.25)]'
                      : product.badge === 'Hot Sale'
                        ? 'bg-gradient-to-r from-[#ff0844] to-[#ff4e50] text-white border-red-400/10 shadow-[0_2px_8px_rgba(255,8,68,0.25)]'
                        : 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white border-fuchsia-400/10 shadow-[0_2px_8px_rgba(168,85,247,0.25)]'
                  }`}>
                    {product.badge}
                  </div>
                )}
              </div>

              {/* ── Rating Star Badge (Sticky to Corner Wrapper) ─────────────────────────────────────── */}
              <div className="absolute bottom-3 left-0 z-40">
                <motion.div
                  layout
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault();
                      setRatingExpanded(prev => !prev);
                    }
                  }}
                  onHoverStart={() => !isMobile && setRatingExpanded(true)}
                  onHoverEnd={() => !isMobile && setRatingExpanded(false)}
                  className={`
                    cursor-pointer overflow-hidden
                    pl-2.5 pr-3 py-[2px] rounded-r-full rounded-l-none shadow-[1px_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-md
                    bg-black/50 border-y border-r border-white/5
                    flex items-center gap-1 transition-colors
                  `}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <FaStar className="text-[#FFB800] animate-pulse" size={9} />
                  <span className="text-[8.5px] font-bold text-white tracking-wide">
                    {rating}
                  </span>
                  <AnimatePresence>
                    {ratingExpanded && (
                      <motion.span
                        key="count"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[8px] font-medium text-white opacity-75 overflow-hidden"
                      >
                        ({reviewsCount.toLocaleString()})
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </Link>

          {/* ── Gallery Navigation ──────────────────────────────────── */}
          {hasMultipleImages && !isShareOpen && (
            <>
              {/* Navigation Arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 opacity-45 sm:opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-40 pointer-events-none">
                <button
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="w-6 h-6 flex items-center justify-center bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-90 transition-all pointer-events-auto"
                >
                  <FaChevronLeft className="w-2.5 h-2.5 stroke-[2]" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Next image"
                  className="w-6 h-6 flex items-center justify-center bg-transparent text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-90 transition-all pointer-events-auto"
                >
                  <FaChevronRight className="w-2.5 h-2.5 stroke-[2]" />
                </button>
              </div>

              {/* Scroll Dots */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-40 pointer-events-none">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full shadow-sm transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'bg-white w-3 scale-110' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Share Interface ───────────────────────────────────────── */}
        <div ref={shareMenuRef} className="absolute inset-0 z-30 pointer-events-none">
          {/* Toggle Button */}
          <AnimatePresence>
            {!isShareOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-3 right-3 pointer-events-auto"
              >
                <button
                  onClick={toggleShare}
                  aria-label="Share product"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 shadow-sm hover:bg-black/40 hover:scale-110 active:scale-95 transition-all"
                >
                  <FaShareAlt size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Radial Menu */}
          <AnimatePresence>
            {isShareOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsShareOpen(false)}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/20 backdrop-blur-sm rounded-[24px]"
              >
                <div 
                  className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {shareLinks.map((link, index) => {
                    const angle = (index * (360 / shareLinks.length)) - 90;
                    const radius = isMobile ? 48 : 65;
                    return (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: Math.cos(angle * (Math.PI / 180)) * radius,
                          y: Math.sin(angle * (Math.PI / 180)) * radius
                        }}
                        exit={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          if (link.id === 'copy') {
                            e.preventDefault();
                            navigator.clipboard.writeText(shareUrl || product.blogUrl || '');
                            setIsShareOpen(false);
                          }
                        }}
                        className="absolute w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white shadow-xl"
                        style={{ backgroundColor: link.color }}
                      >
                        <i className={`${link.icon} text-[15px] sm:text-[18px]`}></i>
                      </motion.a>
                    );
                  })}

                  {/* Central Close Button */}
                  <motion.button
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    onClick={() => setIsShareOpen(false)}
                    aria-label="Close share menu"
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center border-2 border-white/20 shadow-2xl z-10 hover:scale-110 transition-transform"
                  >
                    <FaTimes size={16} className="text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="mt-4 px-2 space-y-3 text-center">
        <Link href={product.blogUrl || '#'} className="block group/title">
          <h3 className="text-[12px] sm:text-[13px] font-medium leading-snug text-[var(--foreground)] opacity-80 line-clamp-2 group-hover/title:text-[var(--primary)] group-hover/title:opacity-100 transition-all">
            {product.title}
          </h3>
        </Link>

      </div>
    </div>
  );
};

export default PinCard;
