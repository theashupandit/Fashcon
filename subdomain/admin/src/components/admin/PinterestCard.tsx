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
 * No boxy containers — just image, hover overlay, and clean text below.
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
    <div className={cn("group relative w-full flex flex-col space-y-2.5", className)}>
      {/* Image Container — no outer box, just a rounded image */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-lg transition-all duration-300">
        {imageUrl ? (
          <SafeImage 
            src={imageUrl} 
            alt={altText || title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold">No Image Asset</span>
          </div>
        )}
 
        {/* Authentic Pinterest Hover Overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
          <div className="flex justify-end">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full text-xs shadow-lg transform hover:scale-105 transition-all">
              Save
            </button>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            {destinationUrl && (
              <div className="bg-white/90 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-[150px] shadow-md cursor-pointer transition-colors">
                <ExternalLink className="w-3 h-3 text-black shrink-0" />
                <span className="text-[10px] font-bold text-black truncate">{destinationUrl.replace('https://', '').replace('http://', '').split('/')[0]}</span>
              </div>
            )}
            <div className="flex gap-1.5">
              <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
                <Share2 className="w-3.5 h-3.5 text-black" />
              </button>
              <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
 
      </div>
 
      {/* Content — clean text below the image, no background card */}
      <div className="space-y-1 px-0.5">
        <h3 className="text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {title || "Untitled Pin"}
        </h3>
        {description && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* User / Attribution row — Pinterest style */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0">
            F
          </div>
          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">Fashcon</span>
        </div>
      </div>
    </div>
  );
}
