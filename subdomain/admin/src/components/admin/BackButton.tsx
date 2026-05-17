'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BackButton({ className, style }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on the dashboard home
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/home') return null;

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "group flex items-center justify-center transition-all hover:scale-105 active:scale-95",
        className
      )}
      style={{
        width: 36, height: 36,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: '#ccc',
        cursor: 'pointer',
        ...style
      }}
      title="Go Back"
    >
      <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
    </button>
  );
}
