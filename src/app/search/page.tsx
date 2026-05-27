import React from 'react';
import Link from 'next/link';
import StyleFeed from '@/components/StyleFeed';
import { searchProducts } from '@/app/actions/storefront';
import PinterestEventTracker from '@/components/PinterestEventTracker';

export default async function SearchResults({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const params = await searchParams;
  const query = params.q || '';
  
  const results = query ? await searchProducts(query) : [];

  const mapToPin = (p: any) => ({
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

  const searchPins = results.map(mapToPin);

  return (
    <div className="text-[var(--foreground)] min-h-screen transition-colors">
      <PinterestEventTracker 
        event="search" 
        data={{ 
          search_query: query 
        }} 
      />
      <section className="pt-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-[var(--foreground)]/10 pb-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] mb-6">
            <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
            <span className="opacity-30">/</span>
            <span className="opacity-50">Search Results</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase leading-[1.1]">
              &quot;{query}&quot;
            </h1>
            <p className="text-sm sm:text-base text-[var(--foreground)] opacity-60 font-medium flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--primary)]" />
              {searchPins.length} styles found that match your search.
            </p>
          </div>
        </div>
        {searchPins.length > 0 ? (
          <StyleFeed allPins={searchPins} showAll={true} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-2xl text-[var(--foreground)] opacity-70 mb-8">No results found for your query. Try something else!</p>
            <Link href="/" className="text-[var(--primary)] font-black text-xl hover:underline">Return to Home</Link>
          </div>
        )}
      </section>
    </div>
  );
}
