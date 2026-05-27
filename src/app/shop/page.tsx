import ShopClient from '@/components/ShopClient';
import { getPublicCategories, getAllProducts } from '@/app/actions/storefront';

export const revalidate = 0;

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    getPublicCategories('product'),
    getAllProducts(),
  ]);

  return (
    <div className="text-[var(--foreground)] transition-colors min-h-[80vh]">
      {/* Title Header */}
      <section className="pt-16 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-3">
            Browse the collections
          </p>
          <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">
            Shop the Looks
          </h1>
          <div className="w-16 h-1 bg-[var(--primary)] mx-auto rounded-full mb-4" />
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60 max-w-md mx-auto font-medium uppercase tracking-wider">
            Explore curated fashion trends, premium styles, and handpicked accessories.
          </p>
        </div>
      </section>

      {/* Interactive Products Grid with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ShopClient initialProducts={products} categories={categories} />
      </section>
    </div>
  );
}
