import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/app/actions/storefront';
import ProductDetails from '@/components/ProductDetails';
import PinCard from '@/components/PinCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.seo?.metaTitle || `${product.title} | Fashcon`,
    description: product.seo?.metaDesc || product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.media.mainImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug);
  const mapToPin = (p: any) => ({
    title: p.title,
    image: p.media?.mainImage || '',
    category: p.category,
    description: p.description,
    blogUrl: `/products/${p.slug}`,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    badge: p.badge
  });

  return (
    <main className="min-h-screen text-[var(--foreground)] transition-colors">
      {/* ── Breadcrumbs ── */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ol className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] opacity-40">
          <li><Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link></li>
          <ChevronRight size={10} />
          <li><Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-[var(--primary)] transition-colors">{product.category}</Link></li>
          <ChevronRight size={10} />
          <li className="truncate max-w-[150px] sm:max-w-none text-[var(--foreground)] opacity-100">{product.title}</li>
        </ol>
      </nav>

      {/* ── Product Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <ProductDetails product={product} />
      </section>


      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="py-20 border-t border-[var(--foreground)]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4">
                You Might Also Love
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-[var(--primary)] mx-auto mt-4 rounded-full" />
            </div>
            
            <div className="masonry-grid">
              {related.map((item: any, idx: number) => (
                <PinCard key={idx} product={mapToPin(item)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
