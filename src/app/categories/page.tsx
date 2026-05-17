import CategorySlider from '@/components/CategorySlider';
import { getPublicCategories } from '@/app/actions/storefront';

export default async function CategoriesPage() {
  const categories = await getPublicCategories('product');

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-4">
            Browse the archive
          </p>
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">
            Categories
          </h1>
          <div className="w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full mb-10" />
          <p className="text-xl text-[var(--foreground)] opacity-70 max-w-2xl mx-auto font-medium leading-relaxed">
            Jump straight into the style lanes you want to explore, from dresses and accessories to beauty and home decor.
          </p>
        </div>
      </section>

      <CategorySlider categories={categories} hideHeader={true} />
    </div>
  );
}
