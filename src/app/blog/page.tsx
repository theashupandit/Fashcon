import { getAllBlogs } from '@/app/actions/storefront';
import BlogCard from '@/components/BlogCard';

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="text-[var(--foreground)] min-h-screen">
      <section className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-black italic mb-2 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4">
              All Editorial Posts
            </h2>
            <div className="w-12 h-1 bg-[var(--primary)] mx-auto rounded-full" />
          </div>

          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
            {blogs.map((post: any) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
          
          {blogs.length === 0 && (
             <div className="text-center py-20 opacity-50">
               <p className="text-lg font-bold uppercase tracking-widest">No articles published yet.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
