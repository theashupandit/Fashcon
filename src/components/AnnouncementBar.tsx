'use client';

import { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import Link from 'next/link';

interface AnnouncementBarProps {
  announcement?: {
    text: string;
    linkText: string;
    linkHref: string;
    isActive: boolean;
    gradientStart?: string;
    gradientVia?: string;
    gradientEnd?: string;
    textColor?: string;
    accentColor?: string;
  } | null;
}

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  const isActive = announcement?.isActive ?? true;
  if (!isActive || !isVisible) return null;

  const text = announcement?.text || "The Glow Up Edit is Here";
  const linkText = announcement?.linkText || "Unlock 15% Off Your First Order";
  const linkHref = announcement?.linkHref || "#newsletter";

  // Dynamic colors with standard fallback
  const gradientStart = announcement?.gradientStart || '#1a052e';
  const gradientVia = announcement?.gradientVia || '#6b0f6c';
  const gradientEnd = announcement?.gradientEnd || '#be123c';
  const textColor = announcement?.textColor || '#ffffff';
  const accentColor = announcement?.accentColor || '#FF8FB1';

  return (
    <div 
      style={{ 
        background: `linear-gradient(to right, ${gradientStart}, ${gradientVia}, ${gradientEnd})`,
        color: textColor 
      }}
      className="relative z-[60] flex min-h-[44px] w-full items-center justify-center overflow-hidden px-3 sm:px-6 py-2.5 shadow-md transition-all duration-300"
    >
      {/* Subtle pulse glow effect behind text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay pointer-events-none">
        <div className="h-full w-[200px] animate-pulse bg-white blur-[20px]" />
      </div>

      <div className="relative flex w-full max-w-[1400px] items-center justify-center">
        <div className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 leading-snug">
          <span className="opacity-90 flex items-center gap-1.5">
            <FaStar className="text-yellow-400 mb-[1px]" size={10} /> {text}
          </span>
          <span className="hidden sm:inline" style={{ color: accentColor }}>✦</span>
          <Link
            href={linkHref}
            onMouseEnter={() => setIsLinkHovered(true)}
            onMouseLeave={() => setIsLinkHovered(false)}
            style={{ 
              color: isLinkHovered ? accentColor : textColor,
              textDecorationColor: isLinkHovered ? accentColor : `${textColor}66`
            }}
            className="italic underline underline-offset-4 transition-all duration-200"
          >
            {linkText}
          </Link>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          style={{ 
            backgroundColor: `${textColor}1a`, 
            color: textColor 
          }}
          className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all hover:scale-105 active:scale-95 opacity-80 hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}

