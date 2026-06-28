'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const hasPanningMoved = useRef(false);
  
  // Image Loading States
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Set mounted state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const handleMainImageRef = (node: HTMLImageElement | null) => {
    mainImageRef.current = node;
    if (node && node.complete) {
      setIsMainImageLoading(false);
    }
  };

  const lightboxImageRef = useRef<HTMLImageElement | null>(null);
  const handleLightboxImageRef = (node: HTMLImageElement | null) => {
    lightboxImageRef.current = node;
    if (node && node.complete) {
      setIsLightboxImageLoading(false);
    }
  };

  // Reset loading states when index or images change
  React.useEffect(() => {
    setIsMainImageLoading(true);
    if (mainImageRef.current && mainImageRef.current.complete) {
      setIsMainImageLoading(false);
    }
  }, [activeIndex, images]);

  React.useEffect(() => {
    setIsLightboxImageLoading(true);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
    if (lightboxImageRef.current && lightboxImageRef.current.complete) {
      setIsLightboxImageLoading(false);
    }
  }, [activeIndex, isLightboxOpen]);

  React.useEffect(() => {
    if (zoomLevel === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Auto-switch to first image when gallery content changes (e.g. variant selection)
  React.useEffect(() => {
    setActiveIndex(0);
  }, [images[0]]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  // Scroll check listener
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      // Use a small timeout to let images render and update scrollWidth
      const timer = setTimeout(checkScroll, 100);
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [images]);

  // Scroll active thumbnail into view — scoped ONLY to the thumbnail strip,
  // NOT the whole page. scrollIntoView() with block:'nearest' can scroll the
  // entire page when the element is near the bottom of the viewport, causing
  // the page to jump to the last ProductGallery on mount.
  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container || !container.children[activeIndex]) return;

    const activeEl = container.children[activeIndex] as HTMLElement;
    // Manually scroll only the thumbnail container, not the page
    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;
    const elLeft = activeEl.offsetLeft;
    const elRight = elLeft + activeEl.offsetWidth;

    if (elLeft < containerLeft) {
      // Thumbnail is to the left of view — scroll left
      container.scrollTo({ left: elLeft - 8, behavior: 'smooth' });
    } else if (elRight > containerRight) {
      // Thumbnail is to the right of view — scroll right
      container.scrollTo({ left: elRight - container.clientWidth + 8, behavior: 'smooth' });
    }
    // If already in view, do nothing — no page scroll triggered

    setTimeout(checkScroll, 300);
  }, [activeIndex]);

  // Handle body scroll locking when lightbox is open
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  if (!images || images.length === 0) return null;

  const optimizedImages = React.useMemo(() => images.map((img) => optimizeCloudinaryUrl(img)), [images]);

  // Drag Scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const dist = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.current.x, 2) +
      Math.pow(e.clientY - dragStartPos.current.y, 2)
    );
    if (dist > 5) {
      setHasMoved(true);
    }
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Scroll multiplier
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleScrollClick = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 140; // Approx width of 1.5 thumbnails + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const lightboxTouchStartX = useRef<number | null>(null);

  const touchPanStart = useRef({ x: 0, y: 0 });

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      hasPanningMoved.current = false;
      touchPanStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    } else {
      lightboxTouchStartX.current = e.touches[0].clientX;
    }
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (isPanning && zoomLevel > 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - touchPanStart.current.x;
      const newY = touch.clientY - touchPanStart.current.y;
      if (Math.abs(newX - pan.x) > 2 || Math.abs(newY - pan.y) > 2) {
        hasPanningMoved.current = true;
      }
      setPan({ x: newX, y: newY });
    }
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (isPanning && zoomLevel > 1) {
      setIsPanning(false);
    } else if (lightboxTouchStartX.current !== null) {
      const diffX = lightboxTouchStartX.current - e.changedTouches[0].clientX;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        } else {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        }
      }
      lightboxTouchStartX.current = null;
    }
  };

  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    hasPanningMoved.current = false;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomLevel <= 1) return;
    const newX = e.clientX - panStart.current.x;
    const newY = e.clientY - panStart.current.y;
    if (Math.abs(newX - pan.x) > 2 || Math.abs(newY - pan.y) > 2) {
      hasPanningMoved.current = true;
    }
    setPan({ x: newX, y: newY });
  };

  const handleLightboxMouseUp = () => {
    setIsPanning(false);
  };

  const lightboxElement = (
    <AnimatePresence>
      {isLightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleLightboxTouchStart}
          onTouchMove={handleLightboxTouchMove}
          onTouchEnd={handleLightboxTouchEnd}
        >
          {/* Zoom Slider Control */}
          <div 
            className="absolute top-6 right-24 z-[10000] flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md select-none text-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={() => setZoomLevel(1)}
              className="hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <FaSearchMinus size={14} />
            </button>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.05" 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] outline-none"
            />
            <button 
              type="button" 
              onClick={() => setZoomLevel(3)}
              className="hover:text-white transition-colors"
              title="Max Zoom"
            >
              <FaSearchPlus size={14} />
            </button>
            <span className="text-[10px] font-mono font-bold tracking-wider w-10 text-right">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[10000] cursor-pointer"
          >
            <FaTimes size={20} />
          </button>

          {/* Modal Image Wrapper */}
          <div 
            className={`relative w-[90vw] h-[85vh] overflow-hidden flex items-center justify-center select-none ${
              zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (zoomLevel > 1 && hasPanningMoved.current) {
                return;
              }
              setZoomLevel(prev => prev > 1 ? 1 : 2);
            }}
            onMouseDown={handleLightboxMouseDown}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleLightboxMouseUp}
            onMouseLeave={handleLightboxMouseUp}
          >
            {/* Lightbox Loading Indicator */}
            {isLightboxImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
                />
              </div>
            )}

            <motion.img
              ref={handleLightboxImageRef}
              key={activeIndex}
              initial={{ scale: 0.95, x: 0, y: 0, opacity: 0 }}
              animate={{ 
                scale: isLightboxImageLoading ? 0.95 : zoomLevel, 
                x: pan.x,
                y: pan.y,
                opacity: isLightboxImageLoading ? 0 : 1 
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={isPanning ? {
                type: "tween",
                ease: "linear",
                duration: 0
              } : {
                type: "tween",
                ease: "easeOut",
                duration: 0.15
              }}
              src={images[activeIndex]} // View original unoptimized image for maximum resolution
              onLoad={() => setIsLightboxImageLoading(false)}
              onError={() => setIsLightboxImageLoading(false)}
              alt={`Fullscreen product image ${activeIndex + 1}`}
              style={{
                transformOrigin: 'center center'
              }}
              className="max-w-full max-h-[85vh] object-contain rounded-lg select-none pointer-events-none"
            />

            {/* Lightbox Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 sm:-left-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/5 transition-all active:scale-95 cursor-pointer z-10"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:-right-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/5 transition-all active:scale-95 cursor-pointer z-10"
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}

            {/* Lightbox Index Counter */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-semibold uppercase tracking-widest">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="relative group/main aspect-[4/5] overflow-hidden rounded-[24px] bg-white dark:bg-black/20 shadow-2xl">
        <div 
          className="w-full h-full cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          {/* Main Image Loading Indicator */}
          {isMainImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/10 dark:bg-black/40 z-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 border-2 border-zinc-500/20 border-t-zinc-600 dark:border-white/20 dark:border-t-white rounded-full"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              ref={handleMainImageRef}
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: isMainImageLoading ? 0 : 1, scale: isMainImageLoading ? 1.05 : 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              src={optimizedImages[activeIndex]}
              onLoad={() => setIsMainImageLoading(false)}
              onError={() => setIsMainImageLoading(false)}
              alt={`Product image ${activeIndex + 1}`}
              className="w-full h-full object-cover object-top pointer-events-none select-none"
            />
          </AnimatePresence>
        </div>
        
        {/* Minimal Left Arrow (Main Image Navigation) */}
        {optimizedImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : optimizedImages.length - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover/main:opacity-100 active:scale-90 cursor-pointer border border-white/5"
            aria-label="Previous Image"
          >
            <FaChevronLeft size={12} />
          </button>
        )}

        {/* Minimal Right Arrow (Main Image Navigation) */}
        {optimizedImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev < optimizedImages.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover/main:opacity-100 active:scale-90 cursor-pointer border border-white/5"
            aria-label="Next Image"
          >
            <FaChevronRight size={12} />
          </button>
        )}

        {/* Fullscreen Expand Icon (Bottom Right of Main Image) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover/main:opacity-100 active:scale-90 cursor-pointer border border-white/5"
          aria-label="Zoom Image"
        >
          <FaExpand size={11} />
        </button>
      </div>

      {/* Thumbnails Row with Buttons & Drag Scroll */}
      {optimizedImages.length > 1 && (
        <div className="relative group/thumbs w-full flex items-center px-1">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollClick('left')}
            className={`absolute left-0 z-10 w-8 h-10 text-white flex items-center justify-center transition-all duration-300 active:scale-75 cursor-pointer ${
              canScrollLeft ? 'opacity-70 hover:opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            aria-label="Scroll Left"
          >
            <FaChevronLeft size={16} />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`w-full flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
          >
            {optimizedImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!hasMoved) {
                    setActiveIndex(idx);
                  }
                }}
                className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden transition-all duration-300 pointer-events-auto cursor-pointer ${
                  idx === activeIndex 
                    ? 'ring-2 ring-[var(--primary)] ring-offset-2 scale-95 opacity-100' 
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumb ${idx + 1}`} 
                  className="w-full h-full object-cover object-top pointer-events-none select-none" 
                />
              </button>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollClick('right')}
            className={`absolute right-0 z-10 w-8 h-10 text-white flex items-center justify-center transition-all duration-300 active:scale-75 cursor-pointer ${
              canScrollRight ? 'opacity-70 hover:opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            aria-label="Scroll Right"
          >
            <FaChevronRight size={16} />
          </button>

        </div>
      )}

      {/* Portal Lightbox */}
      {mounted && createPortal(lightboxElement, document.body)}
    </div>
  );
}
