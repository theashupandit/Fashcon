'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubCategory {
  _id: string;
  name: string;
}

interface CategoryFilterBarProps {
  subCategories: SubCategory[];
  slug: string;
  subCategoryFilter?: string;
}

export default function CategoryFilterBar({ subCategories, slug, subCategoryFilter }: CategoryFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const LIMIT = 5;
  const visibleCategories = subCategories.slice(0, LIMIT);
  const overflowCategories = subCategories.slice(LIMIT);
  
  // Check if active subcategory is in the overflow list
  const isOverflowActive = overflowCategories.some(sc => sc.name === subCategoryFilter);

  return (
    <div className="relative flex flex-row items-center gap-4 sm:gap-6 mb-12 border-b border-zinc-200/60 dark:border-white/5 pb-2.5 select-none w-full">
      {/* Scrollable Container for subcategories */}
      <div className="flex flex-row items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
        {/* All Collection */}
        <a 
          href={`/category/${slug}`} 
          className={cn(
            "pb-2 text-[12px] font-black capitalize tracking-[0.12em] transition-all duration-300 border-b-2 -mb-[12px] hover:scale-105 active:scale-95 shrink-0",
            !subCategoryFilter 
              ? "border-[var(--primary)] text-[var(--primary)]" 
              : "border-transparent text-[var(--foreground)] opacity-50 hover:opacity-100"
          )}
        >
          all collection
        </a>

        {/* Visible Subcategories */}
        {visibleCategories.map((sc) => (
          <a 
            key={sc._id} 
            href={`/category/${slug}?sub=${encodeURIComponent(sc.name)}`} 
            className={cn(
              "pb-2 text-[12px] font-black capitalize tracking-[0.12em] transition-all duration-300 border-b-2 -mb-[12px] hover:scale-105 active:scale-95 shrink-0",
              subCategoryFilter === sc.name 
                ? "border-[var(--primary)] text-[var(--primary)]" 
                : "border-transparent text-[var(--foreground)] opacity-50 hover:opacity-100"
            )}
          >
            {sc.name.toLowerCase()}
          </a>
        ))}
      </div>

      {/* Dropdown Menu for Overflow Subcategories */}
      {overflowCategories.length > 0 && (
        <div className="relative shrink-0 ml-auto" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "pb-2 flex items-center gap-1.5 text-[12px] font-black capitalize tracking-[0.12em] transition-all duration-300 border-b-2 -mb-[12px] hover:scale-105 active:scale-95 cursor-pointer outline-none",
              isOverflowActive
                ? "border-[var(--primary)] text-[var(--primary)]" 
                : "border-transparent text-[var(--foreground)] opacity-50 hover:opacity-100"
            )}
          >
            {isOverflowActive ? subCategoryFilter?.toLowerCase() : 'more'}
            <ChevronDown size={12} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
          </button>

          {/* Dropdown List */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-4 z-50 min-w-[160px] rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-white/5 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                {overflowCategories.map((sc) => (
                  <a 
                    key={sc._id} 
                    href={`/category/${slug}?sub=${encodeURIComponent(sc.name)}`} 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-[12px] font-bold capitalize tracking-wider rounded-xl transition-all duration-200 text-left",
                      subCategoryFilter === sc.name 
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-black" 
                        : "text-[var(--foreground)] opacity-60 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-white/5"
                    )}
                  >
                    {sc.name.toLowerCase()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
