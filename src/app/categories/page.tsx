import CategorySlider from '@/components/CategorySlider';
import { getPublicCategories } from '@/app/actions/storefront';

export default async function CategoriesPage() {
  const categories = await getPublicCategories('product');

  return (
    <div className="text-[var(--foreground)] transition-colors">
      <section className="pt-12 pb-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-3">
            Browse the archive
          </p>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-3">
            Categories
          </h1>
          <div className="w-12 h-1 bg-[var(--primary)] mx-auto rounded-full" />
        </div>
      </section>

      <CategorySlider categories={categories} hideHeader={true} hideMarquee={true} />
    </div>
  );
}
