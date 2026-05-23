import Link from 'next/link';
import Image from 'next/image';
import { getPublicCategories } from '@/app/actions/storefront';

export default async function CategoryGrid() {
  const categories = await getPublicCategories('product');

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black italic text-[var(--foreground)] mb-2 uppercase tracking-tight bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/60 bg-clip-text text-transparent">
              Trending Categories
            </h2>
            <p className="text-[var(--foreground)] opacity-60 font-medium tracking-wide text-sm sm:text-base uppercase">
              Discover the latest in every niche
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              href={`/category/${category.slug}`}
              className="group relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-[16px] sm:rounded-[20px] border border-[var(--border)] bg-[var(--card)]"
            >
              <Image
                src={category.heroImage || category.image || '/placeholder.png'}
                alt={category.name}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 via-[var(--background)]/20 to-transparent dark:from-black/60 dark:to-transparent" />
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 flex items-end justify-between gap-2">
                <h3 className="text-[var(--foreground)] text-base sm:text-xl lg:text-2xl font-bold tracking-tight drop-shadow-sm leading-tight">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
