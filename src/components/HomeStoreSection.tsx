'use client';

import React, { useRef, useState, useEffect } from 'react';
import PinCard from '@/components/PinCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

type StoreContent = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyMessage: string;
};

type StoreProduct = {
  title: string;
  slug: string;
  category: string;
  description?: string;
  media?: { 
    mainImage?: string;
    gallery?: string[];
  };
  rating?: number;
  reviewsCount?: number;
  badge?: string;
};

function normalizeInlineHtml(html: string) {
  const value = (html || '').trim();
  if (!value) return '';
  return value
    .replace(/^<p[^>]*>([\s\S]*)<\/p>$/i, '$1')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br/>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '');
}

function RichText({ html }: { html: string }) {
  const safeHtml = normalizeInlineHtml(html);
  const hasTag = /<[a-z0-9][\s\S]*>/i.test(safeHtml);
  if (hasTag) {
    return <span className="inline-block" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  return <span suppressHydrationWarning>{safeHtml}</span>;
}

export default function HomeStoreSection({
  content,
  products,
  productsRow2 = [],
}: {
  content: StoreContent;
  products: StoreProduct[];
  productsRow2?: StoreProduct[];
}) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Intro hint animation state
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Intersection Observer to trigger hint animation when section comes into view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        // Wait a tiny bit after it appears, then nudge it to show it's scrollable
        setTimeout(() => {
          if (row1Ref.current) {
            row1Ref.current.scrollBy({ left: 120, behavior: 'smooth' });
            setTimeout(() => {
              row1Ref.current?.scrollBy({ left: -120, behavior: 'smooth' });
            }, 600);
          }
          // stagger row 2
          setTimeout(() => {
            if (row2Ref.current) {
              row2Ref.current.scrollBy({ left: 120, behavior: 'smooth' });
              setTimeout(() => {
                row2Ref.current?.scrollBy({ left: -120, behavior: 'smooth' });
              }, 600);
            }
          }, 300);
        }, 800);
      }
    }, { threshold: 0.3 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = window.innerWidth < 640 ? 300 : 380;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const startDragging = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const stopDragging = () => setIsDragging(false);

  const onDrag = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll multiplier
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const mapProduct = (product: StoreProduct) => ({
    title: product.title,
    image: product.media?.mainImage || '',
    gallery: product.media?.gallery || [],
    category: product.category,
    description: product.description,
    blogUrl: `/products/${product.slug}`,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    badge: product.badge,
    prices: (product as any).prices,
    ctaText: (product as any).ctaText
  });

  const mappedRow1 = products.map(mapProduct);
  const mappedRow2 = productsRow2.map(mapProduct);

  const hasProducts = mappedRow1.length > 0 || mappedRow2.length > 0;

  return (
    <section ref={containerRef} className="py-12 sm:py-16 lg:py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="text-center mb-10 sm:mb-16">
        <h2
          suppressHydrationWarning
          className="text-4xl sm:text-5xl md:text-6xl font-black italic text-[var(--foreground)] mb-4 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4"
        >
          <RichText html={content.title} />
        </h2>
        <div className="w-16 sm:w-20 h-1 bg-[var(--primary)] mx-auto rounded-full mb-6" />
        <div suppressHydrationWarning className="text-[var(--foreground)] opacity-60 font-medium tracking-wide text-xs sm:text-sm uppercase">
          <RichText html={content.subtitle} />
        </div>
      </div>

      {hasProducts ? (
        <div className="flex flex-col gap-8 md:gap-12 relative">
          {/* Row 1 Slider */}
          {mappedRow1.length > 0 && (
            <div className="w-full relative group">
              <motion.button 
                onClick={() => scroll(row1Ref, 'left')} 
                animate={{ x: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-2 lg:-left-4 top-[40%] -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 text-black dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg hover:bg-white/80 dark:hover:bg-black/60"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
              </motion.button>
              
              <div 
                ref={row1Ref} 
                className={`flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-hide snap-x snap-mandatory pl-4 md:pl-8 pr-4 md:pr-8 ${isDragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={(e) => startDragging(e, row1Ref)}
                onMouseLeave={stopDragging}
                onMouseUp={stopDragging}
                onMouseMove={(e) => onDrag(e, row1Ref)}
              >
                {mappedRow1.map((product, idx) => (
                  <div 
                    key={`r1-${product.title}-${idx}`} 
                    className={`shrink-0 w-[180px] sm:w-[220px] lg:w-[260px] snap-start ${isDragging ? 'pointer-events-none' : ''}`}
                  >
                    <PinCard product={product} />
                  </div>
                ))}
              </div>

              <motion.button 
                onClick={() => scroll(row1Ref, 'right')} 
                animate={{ x: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute right-2 lg:-right-4 top-[40%] -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 text-black dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg hover:bg-white/80 dark:hover:bg-black/60"
                aria-label="Scroll right"
              >
                <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5" />
              </motion.button>
            </div>
          )}

          {/* Row 2 Slider */}
          {mappedRow2.length > 0 && (
            <div className="w-full relative group">
              <motion.button 
                onClick={() => scroll(row2Ref, 'left')} 
                animate={{ x: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-2 lg:-left-4 top-[40%] -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 text-black dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg hover:bg-white/80 dark:hover:bg-black/60"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
              </motion.button>

              <div 
                ref={row2Ref} 
                className={`flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-hide snap-x snap-mandatory pl-4 md:pl-8 pr-4 md:pr-8 ${isDragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={(e) => startDragging(e, row2Ref)}
                onMouseLeave={stopDragging}
                onMouseUp={stopDragging}
                onMouseMove={(e) => onDrag(e, row2Ref)}
              >
                {mappedRow2.map((product, idx) => (
                  <div 
                    key={`r2-${product.title}-${idx}`} 
                    className={`shrink-0 w-[180px] sm:w-[220px] lg:w-[260px] snap-start ${isDragging ? 'pointer-events-none' : ''}`}
                  >
                    <PinCard product={product} />
                  </div>
                ))}
              </div>

              <motion.button 
                onClick={() => scroll(row2Ref, 'right')} 
                animate={{ x: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute right-2 lg:-right-4 top-[40%] -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 text-black dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg hover:bg-white/80 dark:hover:bg-black/60"
                aria-label="Scroll right"
              >
                <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5" />
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div suppressHydrationWarning className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-4">
            <RichText html={content.emptyTitle} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-3">
            Products are coming soon
          </h3>
          <div suppressHydrationWarning className="text-[var(--foreground)]/70 max-w-2xl mx-auto">
            <RichText html={content.emptyMessage} />
          </div>
        </div>
      )}
    </section>
  );
}
