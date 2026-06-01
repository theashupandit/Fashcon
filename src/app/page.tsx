import React from 'react';
import Hero from '@/components/Hero';
import StyleFeed from '@/components/StyleFeed';
import CategorySlider from '@/components/CategorySlider';
import HomeStoreSection from '@/components/HomeStoreSection';
import BlogHighlights from '@/components/BlogHighlights';
import dynamic from 'next/dynamic';
const Newsletter = dynamic(() => import('@/components/Newsletter'));
import { getAllProducts, getLatestBlogs, getPublicCategories } from '@/app/actions/storefront';
import { getPinnedStoreProducts, getSiteContent } from '@/app/actions/site-content';

export const revalidate = 0;

export default async function Home() {
  const [siteContent, categories, pinnedProducts, allProducts, blogs] = await Promise.all([
    getSiteContent(),
    getPublicCategories('product'),
    getPinnedStoreProducts(),
    getAllProducts(),
    getLatestBlogs(),
  ]);
  
  if (!siteContent || !siteContent.content) {
    return <div>Loading...</div>;
  }

  const { row1: storeProductsRow1, row2: storeProductsRow2 } = pinnedProducts;

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

        <StyleFeed allPins={allPins} />
      </section>

      <BlogHighlights blogs={blogs} />
      <Newsletter />
    </div>
  );
}
