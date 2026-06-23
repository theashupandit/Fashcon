'use client';

import React, { useState, useEffect, useRef } from 'react';
import PinCard from './PinCard';

interface StyleFeedProps {
  allPins: any[];
  showAll?: boolean;
  initialRows?: number;
}

let isInitialTabLoad = true;

const StyleFeed: React.FC<StyleFeedProps> = ({ allPins, showAll = false, initialRows = 2 }) => {
  const [visibleRows, setVisibleRows] = useState(initialRows);
  const [cutoffHeight, setCutoffHeight] = useState<number | null>(null);
  const [maskTop, setMaskTop] = useState<number | null>(null);
  const [showButton, setShowButton] = useState(!showAll);
  const [cols, setCols] = useState(4);
  
  const outerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isRestored = useRef(false);
  const [scrollRestored, setScrollRestored] = useState(false);
  const prevPins = useRef(allPins);

  // Restore visibleRows from sessionStorage on mount
  useEffect(() => {
    console.log('[StyleFeed] Mount - isInitialTabLoad:', isInitialTabLoad);

    if (isInitialTabLoad) {
      console.log('[StyleFeed] Mount - Fresh load/refresh detected. Clearing cache.');
      isInitialTabLoad = false;
      sessionStorage.removeItem('fashcon_home_rows');
      sessionStorage.removeItem('fashcon_home_scroll');
      return;
    }

    const cachedRows = sessionStorage.getItem('fashcon_home_rows');
    console.log('[StyleFeed] Mount - Cached rows:', cachedRows);
    if (cachedRows) {
      const parsed = parseInt(cachedRows, 10);
      if (!isNaN(parsed) && parsed > initialRows) {
        console.log('[StyleFeed] Mount - Restoring rows to:', parsed);
        setVisibleRows(parsed);
        isRestored.current = true;
      }
    }
  }, [initialRows]);

  // Handle allPins / initialRows changes, but skip if we just restored state on mount
  useEffect(() => {
    console.log('[StyleFeed] Pins Effect - isRestored:', isRestored.current, 'allPins length:', allPins.length);
    if (isRestored.current) {
      console.log('[StyleFeed] Pins Effect - Skipping reset because we just restored state.');
      isRestored.current = false;
      prevPins.current = allPins;
      return;
    }
    
    // Only reset if the pins content actually changed (avoid reference-only changes on parent re-renders)
    const pinsChanged = 
      prevPins.current.length !== allPins.length ||
      (allPins.length > 0 && prevPins.current.length > 0 && 
        (prevPins.current[0]?.id !== allPins[0]?.id || prevPins.current[0]?._id !== allPins[0]?._id));

    console.log('[StyleFeed] Pins Effect - pinsChanged:', pinsChanged);
    if (pinsChanged) {
      console.log('[StyleFeed] Pins Effect - Resetting rows to default:', initialRows);
      setVisibleRows(initialRows);
      prevPins.current = allPins;
    }
  }, [initialRows, allPins]);

  // Save rows and scroll position when the user clicks a card in the feed
  useEffect(() => {
    const handleGridClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.masonry-item');
      if (target) {
        sessionStorage.setItem('fashcon_home_rows', visibleRows.toString());
        sessionStorage.setItem('fashcon_home_scroll', window.scrollY.toString());
        console.log('[StyleFeed] Click - saved rows:', visibleRows, 'scroll:', window.scrollY);
      }
    };

    const el = gridRef.current;
    if (el) {
      el.addEventListener('click', handleGridClick);
    }
    return () => {
      if (el) {
        el.removeEventListener('click', handleGridClick);
      }
    };
  }, [visibleRows]);

  // Clear cached feed state when intentionally navigating to the home page via links
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target) {
        const href = target.getAttribute('href');
        if (href === '/' || href === '/#' || href === '') {
          sessionStorage.removeItem('fashcon_home_rows');
          sessionStorage.removeItem('fashcon_home_scroll');
        }
      }
    };
    window.addEventListener('click', handleLinkClick);
    return () => window.removeEventListener('click', handleLinkClick);
  }, []);

  // Restore scroll position after grid height is updated
  useEffect(() => {
    if (cutoffHeight !== null && !scrollRestored) {
      const cachedScroll = sessionStorage.getItem('fashcon_home_scroll');
      if (cachedScroll) {
        const parsedScroll = parseFloat(cachedScroll);
        if (!isNaN(parsedScroll) && parsedScroll > 0) {
          const timer = setTimeout(() => {
            window.scrollTo(0, parsedScroll);
            setScrollRestored(true);
          }, 100);
          return () => clearTimeout(timer);
        }
      }
      setScrollRestored(true);
    }
  }, [cutoffHeight, scrollRestored]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCols(2);
      } else if (width < 1024) {
        setCols(3);
      } else if (width < 1280) {
        setCols(4);
      } else {
        setCols(5);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render only the visible rows plus one extra row to display the fade mask gradient
  const renderLimit = showAll ? allPins.length : Math.min(allPins.length, (visibleRows + 1) * cols);

  const updateCutoffHeight = () => {
    if (!gridRef.current || showAll) {
      setCutoffHeight(null);
      setMaskTop(null);
      setShowButton(false);
      return;
    }

    const cards = Array.from(gridRef.current.querySelectorAll('.masonry-item')) as HTMLElement[];
    if (cards.length === 0) {
      setCutoffHeight(null);
      setMaskTop(null);
      setShowButton(false);
      return;
    }

    // Group cards by their offsetTop to identify rows
    const rows: { top: number; heights: number[] }[] = [];
    cards.forEach(card => {
      const top = card.offsetTop;
      const height = card.offsetHeight;
      const existingRow = rows.find(r => Math.abs(r.top - top) < 10);
      if (existingRow) {
        existingRow.heights.push(height);
      } else {
        rows.push({ top, heights: [height] });
      }
    });

    // Sort rows by their top position
    rows.sort((a, b) => a.top - b.top);

    // If we have rendered all available pins or rows are fewer than visible, show everything
    if (renderLimit >= allPins.length || rows.length <= visibleRows) {
      setCutoffHeight(gridRef.current.offsetHeight);
      setMaskTop(null);
      setShowButton(renderLimit < allPins.length);
    } else {
      // Find the row at index `visibleRows` (the first hidden/partially hidden row)
      const targetRow = rows[visibleRows];
      const Y_top = targetRow.top;
      const H_row = Math.max(...targetRow.heights);
      
      // Cut off exactly in the middle of the target row
      const H_cutoff = Y_top + H_row / 2;

      setCutoffHeight(H_cutoff);
      setMaskTop(Y_top);
      setShowButton(true);
    }
  };

  // Recalculate heights on mount, resize, and whenever visibleRows changes
  useEffect(() => {
    if (!gridRef.current) return;

    const observer = new ResizeObserver(() => {
      updateCutoffHeight();
    });

    observer.observe(gridRef.current);
    updateCutoffHeight();

    const handleImageLoad = () => {
      updateCutoffHeight();
    };

    const images = gridRef.current.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete) {
        // Already loaded
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    return () => {
      observer.disconnect();
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [visibleRows, allPins, renderLimit]);

  const handleLoadMore = () => {
    setVisibleRows(prev => {
      const next = prev + 3;
      sessionStorage.setItem('fashcon_home_rows', next.toString());
      return next;
    });
  };

  const wrapperStyle: React.CSSProperties = {
    maxHeight: cutoffHeight !== null ? `${cutoffHeight}px` : 'none',
    transition: 'max-height 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
    WebkitMaskImage: cutoffHeight !== null && maskTop !== null && showButton
      ? `linear-gradient(to bottom, black ${maskTop}px, transparent ${cutoffHeight}px)`
      : 'none',
    maskImage: cutoffHeight !== null && maskTop !== null && showButton
      ? `linear-gradient(to bottom, black ${maskTop}px, transparent ${cutoffHeight}px)`
      : 'none',
    transitionProperty: 'max-height, mask-image, -webkit-mask-image',
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Height-constrained wrapper */}
      <div
        ref={outerRef}
        className="w-full overflow-hidden"
        style={wrapperStyle}
      >
        {/* Inner Grid Container (unconstrained) */}
        <div ref={gridRef} className="masonry-grid w-full pb-28">
          {allPins.slice(0, renderLimit).map((product, idx) => (
            <PinCard key={idx} product={product} />
          ))}
        </div>
      </div>

      {/* See More Button */}
      {showButton && (
        <div className="absolute bottom-2 z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 translate-y-1/2">
          <button
            onClick={handleLoadMore}
            className="group relative flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] pl-8 pr-1.5 py-1.5 rounded-full font-black text-[9px] tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-none outline-none"
          >
            <span className="opacity-90 group-hover:opacity-100 transition-opacity">See More</span>
            <div className="w-9 h-9 rounded-full bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-[0_0_15px_rgba(230,0,35,0.3)]">
              <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default StyleFeed;
