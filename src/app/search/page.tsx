import React from 'react';
import Link from 'next/link';
import PinCard from '@/components/PinCard';
import { searchProducts } from '@/app/actions/storefront';

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
    category: p.category,
    description: p.description,
    blogUrl: `/products/${p.slug}`,
    rating: p.rating,
    reviewsCount: p.reviewsCount
  });

  const searchPins = results.map(mapToPin);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen transition-colors">
      <section className="py-20 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-4">Search Results for</p>
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">&quot;{query}&quot;</h1>
          <div className="w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full mb-10" />
          <p className="text-xl text-[var(--foreground)] opacity-70 font-medium">
            {searchPins.length} styles found that match your search.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {searchPins.length > 0 ? (
          <div className="masonry-grid">
            {searchPins.map((product: any, idx: number) => (
              <PinCard key={idx} product={product} />
            ))}
          </div>
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
