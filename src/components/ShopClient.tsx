'use client';

import React, { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import StyleFeed from './StyleFeed';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  media?: {
    mainImage?: string;
    gallery?: string[];
  };
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  prices?: {
    original?: string;
    offer?: string;
    discountPercentage?: number;
  };
  ctaText?: string;
}

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ShopClient({ initialProducts, categories }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  const handleCategorySelect = (categorySlug: string) => {
    startTransition(() => {
      setSelectedCategory(categorySlug);
    });
  };

  // Map products to PinCard shape
  const mapToPin = (p: Product) => ({
    id: p._id,
    title: p.title,
    image: p.media?.mainImage || '',
    gallery: p.media?.gallery || [],
    category: p.category,
    description: p.description,
    blogUrl: `/products/${p.slug}`,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    badge: p.badge,
    prices: p.prices,
    ctaText: p.ctaText
  });

  const filteredProducts = selectedCategory === 'All'
    ? initialProducts
    : initialProducts.filter(p => {
        const productCat = (p.category || '').toLowerCase().trim();
        const targetCat = selectedCategory.toLowerCase().trim();
        // Match exact category slug or replace hyphens for flexibility
        return productCat === targetCat || productCat.replace(/[-\s]+/g, ' ') === targetCat.replace(/[-\s]+/g, ' ');
      });

  const mappedPins = filteredProducts.map(mapToPin);

  return (
    <div className="w-full">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-[var(--border)]/40 pb-6 max-w-4xl mx-auto">
        <button
          onClick={() => handleCategorySelect('All')}
          className={cn(
            "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 outline-none border-none",
            selectedCategory === 'All'
              ? "bg-[var(--primary)] text-white shadow-[0_6px_20px_rgba(230,0,35,0.3)]"
              : "bg-[var(--foreground)]/5 text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
          )}
        >
          All Styles
        </button>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 outline-none border-none",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-[0_6px_20px_rgba(230,0,35,0.3)]"
                  : "bg-[var(--foreground)]/5 text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className={cn(
        "transition-all duration-500",
        isPending ? "opacity-50 scale-98 blur-[2px]" : "opacity-100 scale-100 blur-0"
      )}>
        {mappedPins.length > 0 ? (
          <StyleFeed allPins={mappedPins} />
        ) : (
          <div className="max-w-md mx-auto rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-4">
              Oops
            </div>
            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">
              No products found
            </h3>
            <p className="text-[var(--foreground)]/70 text-xs sm:text-sm">
              We couldn't find any products in this category. Check back later or explore other styles!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
