import React from 'react';
import CategorySlider from '@/components/CategorySlider';
import { getPublicCategories } from '@/app/actions/storefront';
import { getSiteContent } from '@/app/actions/site-content';

export const revalidate = 0;

export default async function CategoriesPage() {
  const [categories, siteContent] = await Promise.all([
    getPublicCategories('product'),
    getSiteContent(),
  ]);

  if (!categories || categories.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">No categories found</h1>
      </div>
    );
  }

  return (
    <div className="text-[var(--foreground)] min-h-[80vh] transition-colors">
      {/* Title Header */}
      <section className="pt-14 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-2">
            Exploration
          </p>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-3">
            Curated Collections
          </h1>
          <div className="w-12 h-0.5 bg-[var(--primary)] mx-auto rounded-full mb-3" />
          <p className="text-[11px] sm:text-xs text-[var(--foreground)]/60 max-w-md mx-auto font-medium uppercase tracking-wider leading-relaxed">
            Discover our carefully curated categories, designed for every aesthetic and occasion.
          </p>
        </div>
      </section>

      {/* Categories Slider */}
      <section className="pb-16">
        <CategorySlider
          categories={categories}
          title={siteContent?.content?.home?.categories?.title || "Explore Styles"}
          subtitle={siteContent?.content?.home?.categories?.subtitle || "Find your next favorite outfit through our specialized selections."}
          marqueeItems={siteContent?.content?.home?.categories?.marqueeItems}
          marqueeLinks={siteContent?.content?.home?.categories?.marqueeLinks}
          hideHeader={true} 
          hideMarquee={true} 
        />
      </section>
    </div>
  );
}
