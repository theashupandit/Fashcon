'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  };
}

const PinCard: React.FC<PinCardProps> = ({ product }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ratingExpanded, setRatingExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const encodedUrl = encodeURIComponent(product.blogUrl || '');
  const encodedText = encodeURIComponent(product.title);

  // Close when clicking outside
  useEffect(() => {
    if (!isShareOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

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
              if (isShareOpen) { e.preventDefault(); }
            }}
          >
            <div className="relative overflow-hidden aspect-[3/4]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="block h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                />
              </AnimatePresence>

              {/* ── Rating Badge ─────────────────────────────────────── */}
              <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
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
                    px-2 py-0.5 rounded-full shadow-md backdrop-blur-md
                    bg-black/40 border border-white/10
                    flex items-center gap-1.5 transition-colors
                  `}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className="fa-solid fa-star text-[#FFB800] text-[8px] flex-shrink-0"></i>
                  <span className="text-[10px] font-bold text-white">
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
                        className="text-[9px] font-medium text-white opacity-70 overflow-hidden"
                      >
                        ({reviewsCount.toLocaleString()})
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {product.prices?.discountPercentage && product.prices.discountPercentage > 0 && (
                  <div className="bg-[var(--primary)] text-white text-[9px] font-black px-2 py-0.5 rounded-full w-fit shadow-md uppercase tracking-wider">
                    {product.prices.discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* ── Gallery Navigation ──────────────────────────────────── */}
          {hasMultipleImages && (
            <>
              {/* Navigation Arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover/img:opacity-100 transition-all duration-300 z-40 pointer-events-none">
                <button
                  onClick={prevImage}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] text-[#111] hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={nextImage}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] text-[#111] hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
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
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Toggle Button */}
          <AnimatePresence>
            {!isShareOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 pointer-events-auto"
              >
                <button
                  onClick={toggleShare}
                  className="w-8 h-8 flex items-center justify-center rounded-full shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/10 text-slate-800 dark:text-white hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-share-nodes text-[13px]"></i>
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
                className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/20 backdrop-blur-sm rounded-[24px]"
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
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
                            navigator.clipboard.writeText(product.blogUrl || '');
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
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center border-2 border-white/20 shadow-2xl z-10 hover:scale-110 transition-transform"
                  >
                    <i className="fa-solid fa-xmark text-white text-[15px] sm:text-[18px]"></i>
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
          <h3 className="text-[14px] sm:text-[15px] font-semibold leading-tight text-[var(--foreground)] opacity-70 line-clamp-2 group-hover/title:text-[var(--primary)] group-hover/title:opacity-100 transition-all">
            {product.title}
          </h3>
        </Link>

        {product.prices && (
          <div className="flex items-center justify-center gap-2">
            {product.prices.offer && (
              <span className="text-[15px] font-black text-[var(--foreground)]">
                {product.prices.offer}
              </span>
            )}
            {product.prices.original && product.prices.original !== product.prices.offer && (
              <span className="text-[12px] font-medium text-[var(--foreground)]/40 line-through">
                {product.prices.original}
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-center pt-1">
          <Link
            href={product.blogUrl || '#'}
            className="bg-[var(--foreground)] text-[var(--background)] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white hover:scale-105 transition-all shadow-sm"
          >
            {product.ctaText || 'Buy Now'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PinCard;
