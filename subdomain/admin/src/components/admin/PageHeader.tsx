'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export default function PageHeader({ title, subtitle, badge, actions, className, sticky }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8",
      sticky && "sticky top-[56px] z-[40] bg-[var(--background)]/90 backdrop-blur-md py-4 border-b border-[var(--border)] -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8",
      className
    )}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40">
          {title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {badge && (
            <Badge 
              variant="outline" 
              className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 px-2 py-0 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
            >
              {badge}
            </Badge>
          )}
          {subtitle && (
            <p className="text-[11px] sm:text-[13px] font-medium opacity-40 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {actions}
        </div>
      )}
    </div>
  );
}
