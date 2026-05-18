import PinCard from '@/components/PinCard';
import SortDropdown from '@/components/SortDropdown';
import { getProductsByCategory, getCategories } from '@/app/actions/storefront';
import { cn } from '@/lib/utils';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const allCategories = await getCategories('product');
  const category = allCategories.find((c: any) => c.slug === slug);
  const products = await getProductsByCategory(slug);

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

  const categoryPins = products.map(mapToPin);

  if (!category) {
    return <div className="py-20 text-center text-[var(--foreground)]">Category not found</div>;
  }

  const alignment = category.heroAlignment || 'left';
  
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center mx-auto',
    right: 'items-end text-right ml-auto',
  };

  const gradient = 
    alignment === 'left' ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent' :
    alignment === 'center' ? 'bg-gradient-to-b from-black/40 via-transparent to-black/80' :
    'bg-gradient-to-l from-black/80 via-black/40 to-transparent';

  return (
    <div className="text-[var(--foreground)]">
      <section className="relative h-[457px] sm:h-[557px] overflow-hidden bg-zinc-900 flex items-center -mt-[57px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10">
        {category.heroImage ? (
          <img
            src={category.heroImage}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center opacity-20">
            <h1 className="text-8xl font-black">{category.name}</h1>
          </div>
        )}
        
        <div className={cn("absolute inset-0 z-10", gradient)} />

        <div className={cn(
          "relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 pt-[57px]",
          alignmentClasses[alignment as keyof typeof alignmentClasses]
        )}>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
            Exclusive Selection
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.05] text-white italic uppercase">
            {category.heroTitle || category.name}
          </h1>
          <p className="font-medium text-white/70 leading-relaxed max-w-lg text-sm sm:text-base">
            {category.heroSubtitle || `Explore the latest curation in ${category.name}`}
          </p>
          <div className="mt-6">
            <a
              href="#products-feed"
              className="inline-block rounded-full px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            >
              Discover {category.name}
            </a>
          </div>
        </div>
      </section>

      <section id="products-feed" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{products.length} Results</h2>
          <div className="flex gap-4">
            <SortDropdown />
          </div>
        </div>

        {categoryPins.length > 0 ? (
          <div className="masonry-grid">
            {categoryPins.map((product: any, idx: number) => (
              <PinCard key={idx} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[var(--foreground)] opacity-70">
            No products found in this category yet.
          </div>
        )}
      </section>
    </div>
  );
}
