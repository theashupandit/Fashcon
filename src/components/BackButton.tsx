'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on the home page
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "group flex items-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-[var(--primary)]",
        className
      )}
    >
      <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-[var(--primary)]/10 group-hover:-translate-x-0.5 transition-all">
        <ChevronLeft size={14} />
      </div>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
