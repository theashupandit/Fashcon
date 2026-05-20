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

export default async function Home() {
  const siteContent = await getSiteContent();
  
  if (!siteContent || !siteContent.content) {
    return <div>Loading...</div>;
  }

  const categories = await getPublicCategories('product');
  const storeProducts = await getPinnedStoreProducts();
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
    badge: p.badge
  });

  const allPins = allProducts.map(mapToPin);

  return (
    <div className="text-[var(--foreground)] transition-colors">
      <Hero content={siteContent.content.home.hero} />

      <HomeStoreSection
        content={siteContent.content.home.store}
        products={storeProducts}
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

        <div className="masonry-grid">
          {allPins.map((product: any, idx: number) => (
            <PinCard key={idx} product={product} />
          ))}
        </div>

        <div className="mt-12 sm:mt-20 text-center">
          <button className="bg-[var(--foreground)] text-[var(--background)] px-8 sm:px-12 py-3.5 sm:py-4 rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-all">
            LOAD MORE INSPO
          </button>
        </div>
      </section>

      <BlogHighlights blogs={blogs} />
      <Newsletter />
    </div>
  );
}
