'use client';

import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

export function SafeImage({ src, alt, width, height, fill, className, ...props }: any) {
  const [error, setError] = useState(false);
  const isVideo = typeof src === 'string' && src.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i);
  
  const safeSrc =
    typeof src === 'string' && (src.includes('res.cloudinary.com') || src.includes('picsum.photos') || src.startsWith('/') || src.startsWith('blob:'))
      ? src
      : '/placeholder.png';

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || (isVideo && !src.includes('so_auto'))) {
    return (
      <div className={`flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-md ${fill ? 'absolute inset-0' : ''} ${className}`}>
        <Video size={width ? width / 3 : 24} className="text-black/20 dark:text-white/20" />
      </div>
    );
  }

  // If neither width/height nor fill is provided, default to fill to prevent layout issues
  const shouldFill = fill || (!width && !height);

  return (
    <div className={`relative w-full h-full bg-black/5 dark:bg-white/5 rounded-md overflow-hidden animate-pulse shrink-0 ${fill ? 'absolute inset-0' : ''}`}>
      <img 
        src={safeSrc} 
        alt={alt || ""} 
        width={!shouldFill ? width : undefined}
        height={!shouldFill ? height : undefined}
        onError={() => setError(true)}
        className={`${className || ''} opacity-0 transition-opacity duration-300`}
        style={shouldFill ? { position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0 } : undefined}
        onLoad={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.classList.remove('opacity-0');
          img.parentElement?.classList.remove('animate-pulse', 'bg-black/5', 'dark:bg-white/5');
        }}
        loading="lazy"
        {...props} 
      />
    </div>
  );
}
