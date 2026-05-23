'use client';

import React, { useState, useEffect, useRef } from 'react';
import PinCard from './PinCard';

interface StyleFeedProps {
  allPins: any[];
}

const StyleFeed: React.FC<StyleFeedProps> = ({ allPins }) => {
  const [visibleRows, setVisibleRows] = useState(2);
  const [cutoffHeight, setCutoffHeight] = useState<number | null>(null);
  const [maskTop, setMaskTop] = useState<number | null>(null);
  const [showButton, setShowButton] = useState(true);
  
  const outerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const updateCutoffHeight = () => {
    if (!gridRef.current) return;

    const cards = Array.from(gridRef.current.querySelectorAll('.masonry-item')) as HTMLElement[];
    if (cards.length === 0) {
      setCutoffHeight(null);
      setMaskTop(null);
      setShowButton(false);
      return;
    }

    // Group cards by their offsetTop to identify rows
    // We cluster offsetTop values with a tolerance of 10px to handle zoom levels/subpixel coordinates
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
    rows.sort((a, b) => a - b);

    // If we have fewer or equal rows than visibleRows, show everything
    if (rows.length <= visibleRows) {
      setCutoffHeight(gridRef.current.offsetHeight);
      setMaskTop(null);
      setShowButton(false);
    } else {
      // Find the row at index `visibleRows` (which represents the first hidden/partially hidden row)
      // e.g. if visibleRows = 2, rows[2] is the 3rd row (0-indexed)
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

    // Observe the inner grid container.
    // Since the height cutoff is applied to the outer wrapper, observing the inner grid container
    // will never trigger an infinite resize loop.
    const observer = new ResizeObserver(() => {
      updateCutoffHeight();
    });

    observer.observe(gridRef.current);

    // Initial check
    updateCutoffHeight();

    // Listen to images loading within the feed to update cutoff height when layout stabilizes
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
  }, [visibleRows, allPins]);

  const handleLoadMore = () => {
    setVisibleRows(prev => prev + 2);
  };

  // Build the inline styling for the outer height-constrained wrapper
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
          {allPins.map((product, idx) => (
            <PinCard key={idx} product={product} />
          ))}
        </div>
      </div>

      {/* See More Button */}
      {showButton && (
        <div className="absolute bottom-2 z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 translate-y-1/2">
          <button
            onClick={handleLoadMore}
            className="group relative flex items-center justify-center gap-4 bg-[var(--foreground)] text-[var(--background)] pl-10 pr-2 py-2 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-none outline-none"
          >
            <span className="opacity-90 group-hover:opacity-100 transition-opacity">See More</span>
            <div className="w-12 h-12 rounded-full bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-[0_0_20px_rgba(230,0,35,0.4)]">
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
