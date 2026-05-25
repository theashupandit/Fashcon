'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import CategoryMarquee from './CategoryMarquee';

type SliderCategory = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  heroImage?: string;
  bannerImage?: string;
  color: string;
};

interface CategorySliderProps {
  categories: SliderCategory[];
  title?: string;
  subtitle?: string;
  marqueeItems?: string[];
  marqueeLinks?: string[];
  hideHeader?: boolean;
  hideMarquee?: boolean;
}

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

const FALLBACK_CATEGORIES: SliderCategory[] = [
  { _id: 'dresses', name: 'Dresses', slug: 'dresses', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', color: '#ff2d64' },
  { _id: 'jewelry', name: 'Jewelry', slug: 'jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop', color: '#d15e7a' },
  { _id: 'accessories', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop', color: '#f7c5c5' },
  { _id: 'shoes', name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', color: '#fbe4e4' },
];

function useDragScroll(onDragStateChange?: (dragging: boolean) => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let animationId: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      if (onDragStateChange) onDragStateChange(true);
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
      lastX = e.clientX;
      lastTime = Date.now();
      velocity = 0;
      cancelAnimationFrame(animationId);

      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };

    const onMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      if (onDragStateChange) onDragStateChange(false);
      el.style.cursor = 'grab';
      el.style.userSelect = '';
      el.style.scrollBehavior = '';
      applyMomentum();
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      if (onDragStateChange) onDragStateChange(false);
      el.style.cursor = 'grab';
      el.style.userSelect = '';
      el.style.scrollBehavior = '';
      applyMomentum();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = x - startX;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const dx = x - lastX;
        velocity = (dx / dt) * 15;
      }

      el.scrollLeft = scrollLeft - walk;

      lastX = x;
      lastTime = now;
    };

    const applyMomentum = () => {
      if (Math.abs(velocity) < 0.1) {
        el.style.scrollSnapType = 'x mandatory';
        return;
      }

      const step = () => {
        el.scrollLeft -= velocity;
        velocity *= 0.95; // Friction

        if (Math.abs(velocity) > 0.1 && !isDown) {
          animationId = requestAnimationFrame(step);
        } else {
          el.style.scrollSnapType = 'x mandatory';
        }
      };

      animationId = requestAnimationFrame(step);
    };

    const onClick = (e: MouseEvent) => {
      if (Math.abs(lastX - startX) > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('click', onClick, true); // Capture phase to prevent accidental link clicking

    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('click', onClick, true);
      cancelAnimationFrame(animationId);
    };
  }, [onDragStateChange]);

  return ref;
}

function normalizeHex(hex: string) {
  if (!hex) return '#FF8FB1';
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function getContrastColor(hexcolor: string) {
  const hex = normalizeHex(hexcolor);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000' : '#fff';
}

export default function CategorySlider({
  categories,
  title = "What's In Store?",
  subtitle = 'Discover the latest in every category',
  marqueeItems,
  marqueeLinks,
  hideHeader = false,
  hideMarquee = false,
}: CategorySliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useDragScroll(setIsDragging);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [extractedColors, setExtractedColors] = useState<Record<string, string>>({});
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionTime = useRef<number>(0);

  const visibleCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  useEffect(() => {
    visibleCategories.forEach((cat) => {
      const imgUrl = cat.bannerImage || cat.heroImage || cat.image;
      if (imgUrl && !extractedColors[cat._id]) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = imgUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = 1;
          canvas.height = 1;
          ctx.drawImage(img, 0, 0, 1, 1);
          const data = ctx.getImageData(0, 0, 1, 1).data;
          const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
          setExtractedColors((prev) => ({ ...prev, [cat._id]: hex }));
        };
      }
    });
  }, [visibleCategories]);

  const activeCategory = visibleCategories[activeIndex % visibleCategories.length];
  const activeColor = normalizeHex(extractedColors[activeCategory?._id] || activeCategory?.color || '#FF8FB1');

  const registerUserInteraction = useCallback(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  const tickerItems = marqueeItems?.length ? marqueeItems : visibleCategories.map((c) => c.name);
  const tickerLinks = marqueeLinks?.length ? marqueeLinks : visibleCategories.map((c) => `/category/${c.slug}`);

  // 3x array for seamless infinite looping
  const extendedCategories = [...visibleCategories, ...visibleCategories, ...visibleCategories];

  const getItemWidth = () => {
    if (typeof window === 'undefined') return 260;
    if (window.innerWidth < 640) return 180;
    if (window.innerWidth < 1024) return 220;
    return 260;
  };

  const getGap = () => {
    if (typeof window === 'undefined') return 24;
    if (window.innerWidth < 640) return 12;
    return 24;
  };

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const itemWidth = getItemWidth();
    const gap = getGap();
    const container = scrollRef.current;
    const containerWidth = container.offsetWidth;
    const paddingLeft = typeof window !== 'undefined' && window.innerWidth < 640 ? 48 : 80;
    
    // Calculate the precise center including the container's starting padding
    const itemCenter = paddingLeft + index * (itemWidth + gap) + itemWidth / 2;
    const scrollTarget = itemCenter - containerWidth / 2;
    
    container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = getItemWidth();
    const gap = getGap();
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const setWidth = visibleCategories.length * (itemWidth + gap);

    // Seamless Jump Logic synchronously to prevent visual flickering
    if (scrollLeft <= 10) {
      const snap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = scrollLeft + setWidth;
      container.style.scrollSnapType = snap;
    } else if (scrollLeft >= container.scrollWidth - containerWidth - 10) {
      const snap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = scrollLeft - setWidth;
      container.style.scrollSnapType = snap;
    }

    const paddingLeft = typeof window !== 'undefined' && window.innerWidth < 640 ? 48 : 80;
    const centerX = container.scrollLeft + containerWidth / 2;
    // Calculate new active index accounting for the left padding
    const newActive = Math.round((centerX - paddingLeft - itemWidth / 2) / (itemWidth + gap));
    setActiveIndex(newActive);
  }, [visibleCategories.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Initial position in the middle set perfectly centered
    const itemWidth = getItemWidth();
    const gap = getGap();
    const paddingLeft = typeof window !== 'undefined' && window.innerWidth < 640 ? 48 : 80;
    
    // Exact center position for the first item in the middle set
    const firstMiddleItemIndex = visibleCategories.length;
    const itemCenter = paddingLeft + firstMiddleItemIndex * (itemWidth + gap) + itemWidth / 2;
    const midStart = itemCenter - container.offsetWidth / 2;
    
    container.style.scrollSnapType = 'none';
    container.scrollLeft = Math.max(0, midStart);
    container.style.scrollSnapType = 'x mandatory';

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fixed Auto-Scroll - ticks if the user has been inactive for at least 6 seconds
  useEffect(() => {
    if (isPaused) return;
    autoScrollRef.current = setInterval(() => {
      if (Date.now() - lastInteractionTime.current < 6000) return;
      if (!scrollRef.current) return;

      const itemWidth = getItemWidth();
      const gap = getGap();

      // Infinite Auto-Scroll
      scrollRef.current.scrollBy({ left: itemWidth + gap, behavior: 'smooth' });
    }, 4000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const itemWidth = getItemWidth();
    const gap = getGap();
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -(itemWidth + gap) : itemWidth + gap,
      behavior: 'smooth',
    });
  };

  return (
    <section 
      className="category-slider-section" 
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)}
      style={{ 
        '--active-color': activeColor,
        background: `linear-gradient(to bottom, ${activeColor}08, transparent)` 
      } as React.CSSProperties}
    >
      {!hideMarquee && <CategoryMarquee items={tickerItems} links={tickerLinks} />}

      {!hideHeader && (
        <div className="section-header">
          <h2 className="section-title">
            <RichText html={title} />
          </h2>
          <div className="section-line" />
          <div className="section-sub">
            <RichText html={subtitle} />
          </div>
        </div>
      )}

      <div className="slider-wrapper">
        <button onClick={() => scroll('left')} className="nav-btn nav-btn--left" aria-label="Scroll left">
          <FaChevronLeft size={16} className="nav-icon" />
        </button>

        <div
          ref={scrollRef}
          className="scroll-container flex items-center overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-6 px-12 sm:px-20 scrollbar-hide"
          onTouchStart={() => {
            registerUserInteraction();
            setIsPaused(true);
          }}
          onTouchEnd={() => setIsPaused(false)}
          onScroll={registerUserInteraction}
        >
          {extendedCategories.map((category, i) => {
            const isActive = i === activeIndex;
            const isAdjacent = Math.abs(i - activeIndex) === 1;
            const rawColor = extractedColors[category._id] || category.color || '#FF8FB1';
            const catColor = normalizeHex(rawColor);
            const contrastColor = getContrastColor(catColor);
            
            return (
              <div
                key={`${category._id}-${i}`}
                className={`slide-item shrink-0 w-[180px] sm:w-[220px] lg:w-[260px] snap-center cursor-pointer transition-opacity duration-300 ${isActive ? 'slide-item--active' : ''} ${isAdjacent ? 'slide-item--adjacent' : ''}`}
                onClick={() => scrollToIndex(i)}
              >
                <Link href={`/category/${category.slug}`} className="slide-link w-full flex flex-col items-center">
                  <div className="slide-image-wrap relative w-full aspect-[3/4] overflow-hidden rounded-2xl mb-3.5">
                    <Image
                      src={category.bannerImage || category.heroImage || category.image || '/placeholder.png'}
                      alt={category.name}
                      fill
                      sizes="(max-width: 639px) 180px, (max-width: 1023px) 220px, 260px"
                      className="slide-img w-full h-full object-cover block"
                    />
                    <div className="slide-overlay" />
                    <div className="take-me-badge" style={{ 
                      backgroundColor: catColor,
                      boxShadow: `0 8px 24px ${catColor}66`
                    }}>
                      <span style={{ color: contrastColor }}>TAKE ME TO</span>
                      <FaArrowRight size={10} className="take-me-icon" style={{ color: contrastColor }} />
                    </div>
                  </div>
                  <div className="slide-name">{category.name}</div>
                </Link>
              </div>
            );
          })}
        </div>

        <button onClick={() => scroll('right')} className="nav-btn nav-btn--right" aria-label="Scroll right">
          <FaChevronRight size={16} className="nav-icon" />
        </button>
      </div>

      <div className="dot-row">
        {visibleCategories.map((_, i) => (
          <button
            key={i}
            className={`dot ${(activeIndex % visibleCategories.length) === i ? 'dot--active' : ''}`}
            onClick={() => scrollToIndex(visibleCategories.length + i)}
            aria-label={`Go to category ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .category-slider-section {
          padding: 0 0 64px;
          overflow: hidden;
          background: transparent;
          transition: background 0.3s;
        }
        .section-header {
          text-align: center;
          margin-bottom: 24px;
          padding: 0 16px;
        }
        .section-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          background: linear-gradient(to bottom, var(--foreground), rgba(var(--foreground-rgb, 0, 0, 0), 0.4));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.05;
          margin: 0 0 16px;
          padding-right: 0.1em;
        }
        .section-line {
          width: 80px;
          height: 4px;
          background: var(--primary);
          margin: 0 auto 24px;
          border-radius: 99px;
        }
        .section-sub {
          font-size: 0.9rem;
          color: var(--foreground, #111);
          opacity: 0.5;
          letter-spacing: 0.05em;
        }
        .slider-wrapper {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
        }
        .nav-btn {
          position: absolute;
          top: 38%;
          transform: translateY(-50%);
          z-index: 20;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: white;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.85));
          transition: transform 0.2s, opacity 0.3s, filter 0.2s;
        }
        .nav-btn:hover {
          transform: translateY(-50%) scale(1.15);
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.95));
        }
        .nav-btn--left { left: 12px; }
        .nav-btn--right { right: 12px; }
        .nav-btn--hidden { opacity: 0; pointer-events: none; }
        .scroll-container {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 8px 80px 24px;
          -ms-overflow-style: none;
          scrollbar-width: none;
          align-items: center;
        }
        .scroll-container::-webkit-scrollbar { display: none; }
        @media (max-width: 639px) {
          .scroll-container { gap: 12px; padding: 16px 48px; }
          .nav-btn { width: 36px; height: 36px; }
          .nav-btn--left { left: 4px; }
          .nav-btn--right { right: 4px; }
        }
        .slide-item {
          flex-shrink: 0;
          width: 260px;
          scroll-snap-align: center;
          cursor: pointer;
          transition: opacity 0.35s ease;
          opacity: 0.65;
          transform: none; /* Keep parent layout box completely static */
        }
        @media (max-width: 639px) { .slide-item { width: 180px; } }
        @media (min-width: 640px) and (max-width: 1023px) { .slide-item { width: 220px; } }
        .slide-item--adjacent { opacity: 0.82; }
        .slide-item--active { opacity: 1; z-index: 2; }
        .slide-link { display: flex; flex-direction: column; align-items: center; text-decoration: none; width: 100%; }
        .slide-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 16px;
          margin-bottom: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s, border-radius 0.35s;
          transform: scale(0.92);
          will-change: transform;
        }
        .slide-item--active .slide-image-wrap {
          transform: scale(1.05);
          box-shadow: 0 16px 56px rgba(0,0,0,0.22);
          border-radius: 20px;
        }
        .slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
          display: block;
        }
        .slide-link:hover .slide-img { transform: scale(1.08); }
        .slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 55%);
          pointer-events: none;
        }
        .take-me-badge {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          width: auto;
          min-width: 120px;
          padding: 8px 16px;
          text-align: center;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
        }
        .slide-item--active .take-me-badge {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        .take-me-badge span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
        }
        .take-me-icon {
          color: #000;
          transition: transform 0.3s ease;
        }
        .slide-link:hover .take-me-icon {
          transform: translateX(3px);
        }
        .slide-name {
          font-size: clamp(1rem, 2.5vw, 1.35rem);
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: var(--foreground, #111);
          text-align: center;
          margin: 0;
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
          transform: scale(0.92);
          will-change: transform;
        }
        .slide-item--active .slide-name {
          transform: scale(1.05);
        }
        .dot-row { display: flex; justify-content: center; gap: 8px; margin-top: 28px; }
        .dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: var(--foreground, #111);
          opacity: 0.2;
          padding: 0;
          transition: opacity 0.3s, width 0.3s, border-radius 0.3s;
        }
        .dot::after {
          content: "";
          position: absolute;
          top: -20px;
          bottom: -20px;
          left: -20px;
          right: -20px;
        }
        .dot--active {
          opacity: 1;
          width: 24px;
          border-radius: 4px;
          background: var(--active-color, #FF8FB1);
        }
        :global(.dark) .dot { background: var(--foreground); }
        :global(.dark) .category-slider-section { background: transparent; }
        :global(.dark) .slide-image-wrap { box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        :global(.dark) .slide-item--active .slide-image-wrap { box-shadow: 0 16px 56px rgba(0,0,0,0.6); }
      `}</style>
    </section>
  );
}
