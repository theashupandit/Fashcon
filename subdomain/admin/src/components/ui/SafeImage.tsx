'use client';

import Image from 'next/image';
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

  // If neither width/height nor fill is provided, default to fill to prevent Next.js runtime error
  const shouldFill = fill || (!width && !height);

  return (
    <Image 
      src={safeSrc} 
      alt={alt || ""} 
      width={!shouldFill ? width : undefined}
      height={!shouldFill ? height : undefined}
      fill={shouldFill}
      onError={() => setError(true)}
      className={className}
      {...props} 
    />
  );
}
