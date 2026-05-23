'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export function SafeImage({ src, alt, className, ...props }: any) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const safeSrc =
    typeof src === 'string' && (src.includes('res.cloudinary.com') || src.includes('picsum.photos') || src.startsWith('/') || src.startsWith('blob:'))
      ? src
      : '/placeholder.png';

  // Reset states when image source changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/60">
      {/* CSS Animation style block */}
      <style>{`
        @keyframes fc-image-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .fc-animate-shimmer {
          animation: fc-image-shimmer 1.4s infinite linear;
        }
      `}</style>

      {/* Beautiful Shimmer Loading Skeleton */}
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100 dark:bg-[#121212] select-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.08] to-transparent fc-animate-shimmer"
            style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            }}
          />
          {/* Pulsing Placeholder Icon */}
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      <Image 
        src={error ? '/placeholder.png' : safeSrc} 
        alt={alt || ""} 
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        className={`${className || ''} transition-all duration-500 ${isLoading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}
        {...props} 
      />
    </div>
  );
}
