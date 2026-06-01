import StyleFeed from '@/components/StyleFeed';
import SortDropdown from '@/components/SortDropdown';
import { getProductsByCategory, getPublicCategories } from '@/app/actions/storefront';
import { cn } from '@/lib/utils';
import PinterestEventTracker from '@/components/PinterestEventTracker';
import CategoryFilterBar from '@/components/CategoryFilterBar';

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
      <section className="relative h-[360px] sm:h-[400px] overflow-hidden bg-zinc-900 flex items-center -mt-[57px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10">
        {category.heroImage ? (
          <>
            {category.heroImageMobile && (
              <img
                src={category.heroImageMobile}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover sm:hidden"
                referrerPolicy="no-referrer"
              />
            )}
            {category.heroImageTablet && (
              <img
                src={category.heroImageTablet}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover hidden sm:block lg:hidden"
                referrerPolicy="no-referrer"
              />
            )}
            <img
              src={category.heroImage}
              alt={category.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                category.heroImageMobile && !category.heroImageTablet && "hidden sm:block",
                category.heroImageTablet && "hidden lg:block"
              )}
              referrerPolicy="no-referrer"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center opacity-20">
            <h1 className="text-8xl font-black">{category.name}</h1>
          </div>
        )}
        
        <div className={cn("absolute inset-0 z-10", gradient)} />

        <div className={cn(
          "relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3 pt-[57px]",
          alignmentClasses[alignment as keyof typeof alignmentClasses]
        )}>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Exclusive Selection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[1.1] text-white italic uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            {category.heroTitle || category.name}
          </h1>
          <p className="font-medium text-white/80 leading-relaxed max-w-md text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {category.heroSubtitle || `Explore the latest curation in ${category.name}`}
          </p>
          <div className="mt-4">
            <a
              href={category.heroButtonLink || "#products-feed"}
              className="inline-block border border-white/90 text-white font-bold uppercase text-[10px] sm:text-xs tracking-[0.25em] bg-black/40 backdrop-blur-md hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all duration-300 px-8 py-3.5 sm:px-9 sm:py-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              {category.heroButtonText || `Discover ${category.name}`}
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
          <CategoryFilterBar 
            subCategories={subCategories} 
            slug={slug} 
            subCategoryFilter={subCategoryFilter} 
          />
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
