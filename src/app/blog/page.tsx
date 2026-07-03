import { getAllBlogs } from '@/app/actions/storefront';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import { getPublicCategories } from '@/app/actions/storefront';

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [blogs, blogCategories] = await Promise.all([
    getAllBlogs(),
    getPublicCategories('blog'),
  ]);

  const filteredBlogs = category
    ? blogs.filter((post: any) => {
        const postCat = (post.category || '').toLowerCase().replace(/\s+/g, '-');
        return postCat === category.toLowerCase();
      })
    : blogs;

  return (
    <div className="text-[var(--foreground)] min-h-screen">
      <section className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-black italic mb-2 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4">
              {category
                ? blogCategories.find((c: any) => c.slug === category)?.name || category.replace(/-/g, ' ')
                : 'All Editorial Posts'}
            </h2>
            <div className="w-12 h-1 bg-[var(--primary)] mx-auto rounded-full" />
          </div>

          {/* Category Filter Pills */}
          {blogCategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <Link
                href="/blog"
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                  !category
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent'
                    : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]'
                }`}
              >
                All
              </Link>
              {blogCategories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                    category === cat.slug
                      ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent'
                      : 'border-[var(--border)] text-[var(--foreground)]/60 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-8 justify-center">
            {filteredBlogs.map((post: any) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
          
          {filteredBlogs.length === 0 && (
             <div className="text-center py-20 opacity-50">
               <p className="text-lg font-bold uppercase tracking-widest">
                 {category ? 'No articles in this category yet.' : 'No articles published yet.'}
               </p>
               {category && (
                 <Link href="/blog" className="mt-4 inline-block text-sm text-[var(--primary)] font-bold hover:underline">
                   ← View All Posts
                 </Link>
               )}
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
