import StyleFeed from '@/components/StyleFeed';
import SortDropdown from '@/components/SortDropdown';
import { getProductsByCategory, getPublicCategories } from '@/app/actions/storefront';
import { cn } from '@/lib/utils';
import PinterestEventTracker from '@/components/PinterestEventTracker';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const searchParamsValue = await searchParams;
  const subCategoryFilter = searchParamsValue.sub as string | undefined;

  const allCategories = await getPublicCategories('product', true);
  const category = allCategories.find((c: any) => c.slug === slug);
  const subCategories = allCategories.filter((c: any) => c.parentCategory === category?.name);

  const products = await getProductsByCategory(slug);
  
  let filteredProducts = products;
  if (subCategoryFilter) {
    filteredProducts = products.filter((p: any) => p.subCategory === subCategoryFilter);
  }

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

  const categoryPins = filteredProducts.map(mapToPin);

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
      <PinterestEventTracker 
        event="viewcategory" 
        data={{ 
          product_category: category.name 
        }} 
      />
      <section className="relative h-[300px] sm:h-[350px] overflow-hidden bg-zinc-900 flex items-center -mt-[57px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{filteredProducts.length} Products</h2>
          <div className="flex gap-4">
            <SortDropdown />
          </div>
        </div>

        {subCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-6 mb-12 border-b border-zinc-200/60 dark:border-white/5 pb-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500 select-none">
            <a 
              href={`/category/${slug}`} 
              className={cn(
                "pb-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 border-b-2 -mb-[12px] hover:scale-105 active:scale-95",
                !subCategoryFilter 
                  ? "border-[var(--primary)] text-[var(--primary)]" 
                  : "border-transparent text-[var(--foreground)] opacity-50 hover:opacity-100"
              )}
            >
              All Collection
            </a>
            {subCategories.map((sc: any) => (
              <a 
                key={sc._id} 
                href={`/category/${slug}?sub=${encodeURIComponent(sc.name)}`} 
                className={cn(
                  "pb-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 border-b-2 -mb-[12px] hover:scale-105 active:scale-95",
                  subCategoryFilter === sc.name 
                    ? "border-[var(--primary)] text-[var(--primary)]" 
                    : "border-transparent text-[var(--foreground)] opacity-50 hover:opacity-100"
                )}
              >
                {sc.name}
              </a>
            ))}
          </div>
        )}

        {categoryPins.length > 0 ? (
          <StyleFeed allPins={categoryPins} showAll={true} />
        ) : (
          <div className="py-20 text-center text-[var(--foreground)] opacity-70">
            No products found for this selection.
          </div>
        )}
      </section>
    </div>
  );
}
