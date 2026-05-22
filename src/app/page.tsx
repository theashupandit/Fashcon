import React from 'react';
import Hero from '@/components/Hero';
import PinCard from '@/components/PinCard';
import CategorySlider from '@/components/CategorySlider';
import HomeStoreSection from '@/components/HomeStoreSection';
import BlogHighlights from '@/components/BlogHighlights';
import dynamic from 'next/dynamic';
const Newsletter = dynamic(() => import('@/components/Newsletter'));
import { getAllProducts, getLatestBlogs, getPublicCategories } from '@/app/actions/storefront';
import { getPinnedStoreProducts, getSiteContent } from '@/app/actions/site-content';

export const revalidate = 0;

export default async function Home() {
  const siteContent = await getSiteContent();
  
  if (!siteContent || !siteContent.content) {
    return <div>Loading...</div>;
  }

  const categories = await getPublicCategories('product');
  const { row1: storeProductsRow1, row2: storeProductsRow2 } = await getPinnedStoreProducts();
  const allProducts = await getAllProducts();
  const blogs = await getLatestBlogs();

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

  const allPins = allProducts.map(mapToPin);

  return (
    <div className="text-[var(--foreground)] transition-colors">
      <Hero content={siteContent.content.home.hero} />

      <HomeStoreSection
        content={siteContent.content.home.store}
        products={storeProductsRow1}
        productsRow2={storeProductsRow2}
      />

      <CategorySlider
        categories={categories}
        title={siteContent.content.home.categories.title}
        subtitle={siteContent.content.home.categories.subtitle}
        marqueeItems={siteContent.content.home.categories.marqueeItems}
        marqueeLinks={siteContent.content.home.categories.marqueeLinks}
      />

      <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-4xl sm:text-6xl font-black italic text-[var(--foreground)] mb-4 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4">
            Full Style Feed
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[var(--primary)] mx-auto rounded-full" />
        </div>

        <div className="relative flex flex-col items-center">
          <div 
            className="masonry-grid w-full pb-20"
            style={{ 
              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
            }}
          >
            {allPins.slice(0, 15).map((product: any, idx: number) => (
              <PinCard key={idx} product={product} />
            ))}
          </div>

          <div className="absolute bottom-4 z-20">
            <button className="group relative flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] pl-10 pr-4 py-3 rounded-full font-black text-[11px] tracking-[0.25em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)] ring-4 ring-[var(--background)]/50">
              <span>Load More Inspo</span>
              <div className="w-10 h-10 rounded-full bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shadow-inner">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      <BlogHighlights blogs={blogs} />
      <Newsletter />
    </div>
  );
}
