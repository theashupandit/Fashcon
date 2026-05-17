'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  { _id: 'shoes', name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291027030-5e4d5b8c0b7a?q=80&w=1000&auto=format&fit=crop', color: '#fbe4e4' },
];

export default function CategorySlider({
  categories,
  title = "What's In Store?",
  subtitle = 'Discover the latest in every category',
  marqueeItems,
  marqueeLinks,
  hideHeader = false,
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const visibleCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const tickerItems = marqueeItems?.length ? marqueeItems : visibleCategories.map((c) => c.name);
  const tickerLinks = marqueeLinks?.length ? marqueeLinks : visibleCategories.map((c) => `/category/${c.slug}`);

  // 3x for infinite loop padding
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
    const itemCenter = index * (itemWidth + gap) + itemWidth / 2;
    const scrollTarget = itemCenter - containerWidth / 2;
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = getItemWidth();
    const gap = getGap();
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;
    const setWidth = visibleCategories.length * (itemWidth + gap);

    // Seamless Jump Logic
    if (scrollLeft <= 10) {
      container.scrollLeft = setWidth;
    } else if (scrollLeft >= container.scrollWidth - containerWidth - 10) {
      container.scrollLeft = container.scrollWidth - containerWidth - setWidth;
    }

    const centerX = container.scrollLeft + containerWidth / 2;
    const newActive = Math.round((centerX - itemWidth / 2) / (itemWidth + gap));
    setActiveIndex(newActive);
  }, [visibleCategories.length]);

  // Initial position in the middle set
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const itemWidth = getItemWidth();
    const gap = getGap();
    const midStart = visibleCategories.length * (itemWidth + gap);
    container.scrollLeft = midStart;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, visibleCategories.length]);

  // Fixed Auto-Scroll
  useEffect(() => {
    if (isPaused) return;
    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const itemWidth = getItemWidth();
      const gap = getGap();
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
    <section className="category-slider-section" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="w-full overflow-hidden bg-[var(--glass)] backdrop-blur-md py-3 mb-12 border-y border-[var(--foreground)]/5">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[...Array(10)].flatMap((_, repeatIndex) => tickerItems.map((item, index) => (
            <Link
              key={`${item}-${repeatIndex}-${index}`}
              href={tickerLinks[index] || '#'}
              className="text-[12px] font-extrabold tracking-[0.18em] uppercase text-[var(--foreground)] px-6 italic flex items-center shrink-0"
            >
              {item} <span className="text-[var(--primary)] ml-5 not-italic">✦</span>
            </Link>
          )))}
        </div>
      </div>

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
          <ChevronLeft size={22} />
        </button>

        <div ref={scrollRef} className="scroll-container">
          {extendedCategories.map((category, i) => {
            const isActive = i === activeIndex;
            const isAdjacent = Math.abs(i - activeIndex) === 1;
            return (
              <div
                key={`${category._id}-${i}`}
                className={`slide-item ${isActive ? 'slide-item--active' : ''} ${isAdjacent ? 'slide-item--adjacent' : ''}`}
                onClick={() => scrollToIndex(i)}
              >
                <Link href={`/category/${category.slug}`} className="slide-link">
                  <div className="slide-image-wrap">
                    <img src={category.bannerImage || category.heroImage || category.image} alt={category.name} className="slide-img" referrerPolicy="no-referrer" />
                    <div className="slide-overlay" />
                    <div className="take-me-badge" style={{ backgroundColor: category.color || '#FF8FB1' }}>
                      <span>TAKE ME TO</span>
                    </div>
                  </div>
                  <h3 className="slide-name">{category.name}</h3>
                </Link>
              </div>
            );
          })}
        </div>

        <button onClick={() => scroll('right')} className="nav-btn nav-btn--right" aria-label="Scroll right">
          <ChevronRight size={22} />
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
        .marquee-track {
          display: flex;
          gap: 0;
          width: max-content;
          min-width: 100%;
          animation: marquee 8s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-10%); }
        }
        .section-header {
          text-align: center;
          margin-bottom: 64px;
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
          background: var(--background, #fff);
          color: var(--foreground, #111);
          box-shadow: 0 4px 24px rgba(0,0,0,0.14);
          transition: transform 0.2s, opacity 0.3s, box-shadow 0.2s;
        }
        .nav-btn:hover {
          transform: translateY(-50%) scale(1.12);
          box-shadow: 0 6px 32px rgba(0,0,0,0.22);
        }
        .nav-btn--left { left: 12px; }
        .nav-btn--right { right: 12px; }
        .nav-btn--hidden { opacity: 0; pointer-events: none; }
        .scroll-container {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 24px 80px;
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
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
          opacity: 0.65;
          transform: scale(0.88);
        }
        @media (max-width: 639px) { .slide-item { width: 180px; } }
        @media (min-width: 640px) and (max-width: 1023px) { .slide-item { width: 220px; } }
        .slide-item--adjacent { opacity: 0.82; transform: scale(0.94); }
        .slide-item--active { opacity: 1; transform: scale(1.08); z-index: 2; }
        .slide-link { display: flex; flex-direction: column; align-items: center; text-decoration: none; }
        .slide-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 16px;
          margin-bottom: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transition: box-shadow 0.35s;
        }
        .slide-item--active .slide-image-wrap {
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
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 88%;
          padding: 8px 6px;
          text-align: center;
          border-radius: 0 0 12px 12px;
        }
        .take-me-badge span {
          font-size: 10px;
          font-weight: 900;
          font-style: italic;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
        }
        .slide-item--active .take-me-badge span { font-size: 11px; }
        .slide-name {
          font-size: clamp(1rem, 2.5vw, 1.35rem);
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: var(--foreground, #111);
          text-align: center;
          margin: 0;
          transition: font-size 0.3s;
        }
        .slide-item--active .slide-name { font-size: clamp(1.1rem, 2.8vw, 1.55rem); }
        .dot-row { display: flex; justify-content: center; gap: 8px; margin-top: 28px; }
        .dot {
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
        .dot--active {
          opacity: 1;
          width: 24px;
          border-radius: 4px;
          background: #FF8FB1;
        }
        :global(.dark) .nav-btn { background: var(--card); color: var(--foreground); }
        :global(.dark) .dot { background: var(--foreground); }
        :global(.dark) .category-slider-section { background: transparent; }
        :global(.dark) .slide-image-wrap { box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        :global(.dark) .slide-item--active .slide-image-wrap { box-shadow: 0 16px 56px rgba(0,0,0,0.6); }
      `}</style>
    </section>
  );
}
