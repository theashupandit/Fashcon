'use client';

import React, { useState, useEffect, useRef } from 'react';
import PinCard from './PinCard';

interface StyleFeedProps {
  allPins: any[];
  showAll?: boolean;
  initialRows?: number;
}

const StyleFeed: React.FC<StyleFeedProps> = ({ allPins, showAll = false, initialRows = 2 }) => {
  const [visibleRows, setVisibleRows] = useState(initialRows);
  const [cutoffHeight, setCutoffHeight] = useState<number | null>(null);
  const [maskTop, setMaskTop] = useState<number | null>(null);
  const [showButton, setShowButton] = useState(!showAll);
  const [cols, setCols] = useState(4);
  
  const outerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleRows(initialRows);
  }, [initialRows, allPins]);

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
    setVisibleRows(prev => prev + 3);
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
