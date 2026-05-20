import PinCard from '@/components/PinCard';

type StoreContent = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyMessage: string;
};

type StoreProduct = {
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
};

function normalizeInlineHtml(html: string) {
  const value = (html || '').trim();

  if (!value) return '';

  return value
    .replace(/^<p[^>]*>([\s\S]*)<\/p>$/i, '$1')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br/>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '');
}

function RichText({ html }: { html: string }) {
  const safeHtml = normalizeInlineHtml(html);
  const hasTag = /<[a-z0-9][\s\S]*>/i.test(safeHtml);
  if (hasTag) {
    return <span className="inline-block" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }

  return <span suppressHydrationWarning>{safeHtml}</span>;
}

export default function HomeStoreSection({
  content,
  products,
}: {
  content: StoreContent;
  products: StoreProduct[];
}) {
  const mapped = products.map((product) => ({
    title: product.title,
    image: product.media?.mainImage || '',
    gallery: product.media?.gallery || [],
    category: product.category,
    description: product.description,
    blogUrl: `/products/${product.slug}`,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    badge: product.badge,
    prices: product.prices,
    ctaText: product.ctaText
  }));

  return (
    <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <h2
          suppressHydrationWarning
          className="text-4xl sm:text-5xl md:text-6xl font-black italic text-[var(--foreground)] mb-4 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4"
        >
          <RichText html={content.title} />
        </h2>
        <div className="w-16 sm:w-20 h-1 bg-[var(--primary)] mx-auto rounded-full mb-6" />
        <div suppressHydrationWarning className="text-[var(--foreground)] opacity-60 font-medium tracking-wide text-xs sm:text-sm uppercase">
          <RichText html={content.subtitle} />
        </div>
      </div>

      {mapped.length > 0 ? (
        <div className="masonry-grid">
          {mapped.map((product, idx) => (
            <PinCard
              key={`${product.title}-${idx}`}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div suppressHydrationWarning className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-4">
            <RichText html={content.emptyTitle} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-3">
            Products are coming soon
          </h3>
          <div suppressHydrationWarning className="text-[var(--foreground)]/70 max-w-2xl mx-auto">
            <RichText html={content.emptyMessage} />
          </div>
        </div>
      )}
    </section>
  );
}
