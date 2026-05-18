'use client';

import React, { useState } from 'react';
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

// Helper to extract plain text from ReactNode to determine length
function getTextContent(node: React.ReactNode): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return '';
}

// Helper to clone ReactNode and truncate its text leaf
function truncateReactNode(node: React.ReactNode, maxLen: number): { truncated: React.ReactNode; textLength: number } {
  let length = 0;

  function process(n: React.ReactNode): React.ReactNode {
    if (!n) return n;
    if (typeof n === 'string' || typeof n === 'number') {
      const str = String(n);
      const remaining = maxLen - length;
      if (remaining <= 0) {
        length += str.length;
        return '';
      }
      if (str.length > remaining) {
        length += str.length;
        return str.slice(0, remaining) + '...';
      }
      length += str.length;
      return str;
    }
    if (Array.isArray(n)) {
      return n.map((item, index) => {
        const processed = process(item);
        if (React.isValidElement(processed)) {
          return React.cloneElement(processed, { key: processed.key ?? index });
        }
        return processed;
      });
    }
    if (React.isValidElement<{ children?: React.ReactNode }>(n)) {
      return React.cloneElement(n, { key: n.key }, process(n.props.children));
    }
    return n;
  }

  const truncated = process(node);
  return { truncated, textLength: length };
}

export default function PageHeader({ title, subtitle, badge, actions, className, sticky }: PageHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const plainText = getTextContent(title);
  const isLong = plainText.length > 25;

  const { truncated } = truncateReactNode(title, 25);

  return (
    <div className={cn(
      "flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4",
      sticky && "sticky top-[56px] z-[40] bg-[var(--background)]/90 backdrop-blur-md py-2 border-b border-[var(--border)] -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8",
      className
    )}>
      <div className="max-w-2xl">
        <h1 className="text-lg sm:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[var(--foreground)]">
            {isExpanded ? title : (isLong ? truncated : title)}
          </span>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity focus:outline-none shrink-0"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              {isExpanded ? '[ Less ]' : '[ More ]'}
            </button>
          )}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
