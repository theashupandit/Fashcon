'use client';

import React from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { ExternalLink, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinterestCardProps {
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  destinationUrl?: string;
  price?: number;
  className?: string;
}

/**
 * High-fidelity Pinterest Pin Preview component.
 * Mirrors the actual Pinterest UI for realistic moderation.
 */
export default function PinterestCard({
  title,
  description,
  imageUrl,
  altText,
  destinationUrl,
  price,
  className
}: PinterestCardProps) {
  return (
    <div className={cn("group relative w-full max-w-[236px] bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300", className)}>
      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {imageUrl ? (
          <SafeImage 
            src={imageUrl} 
            alt={altText || title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-400 text-xs font-medium">No Image Asset</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-full text-sm shadow-lg transform hover:scale-105 transition-all">
              Save
            </button>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            {destinationUrl && (
              <div className="bg-white/90 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-[140px] shadow-md cursor-pointer transition-colors">
                <ExternalLink className="w-3 h-3 text-black" />
                <span className="text-[11px] font-bold text-black truncate">{destinationUrl.replace('https://', '')}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
                <Share2 className="w-3.5 h-3.5 text-black" />
              </button>
              <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* Price Tag (Rich Pin simulation) */}
        {price && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/10 shadow-sm">
            <span className="text-[10px] font-black text-black dark:text-white">₹{price.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 px-1">
          {title || "Untitled Luxury Pin"}
        </h3>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 px-1 leading-normal">
            {description}
          </p>
        )}
        
        {/* User / Attribution simulation */}
        <div className="flex items-center gap-2 pt-2 px-1">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            F
          </div>
          <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Fashcon Luxury</span>
        </div>
      </div>
    </div>
  );
}
