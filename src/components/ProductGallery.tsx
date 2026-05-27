'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-switch to first image when gallery content changes (e.g. variant selection)
  React.useEffect(() => {
    setActiveIndex(0);
  }, [images[0]]);

  if (!images || images.length === 0) return null;

  const optimizedImages = React.useMemo(() => images.map(optimizeCloudinaryUrl), [images]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-white dark:bg-black/20 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            src={optimizedImages[activeIndex]}
            alt={`Product image ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Navigation Overlays (Desktop Hover) */}
        <div className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize" onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : optimizedImages.length - 1))} />
        <div className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize" onClick={() => setActiveIndex((prev) => (prev < optimizedImages.length - 1 ? prev + 1 : 0))} />
      </div>

      {/* Thumbnails */}
      {optimizedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {optimizedImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                idx === activeIndex 
                  ? 'ring-2 ring-[var(--primary)] ring-offset-2 scale-95 opacity-100' 
                  : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
