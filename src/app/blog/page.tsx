import { getLatestBlogs } from '@/app/actions/storefront';
import BlogHighlights from '@/components/BlogHighlights';

export default async function BlogPage() {
  const blogs = await getLatestBlogs();

  return (
    <div className="text-[var(--foreground)] min-h-screen">
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">THE FASHCON FEED</h1>
          <div className="w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full mb-10" />
          <p className="text-xl text-[var(--foreground)] opacity-70 max-w-2xl mx-auto font-medium">
            Your daily dose of aesthetic inspiration, trend reports, and lifestyle guides.
          </p>
        </div>
      </section>

      <BlogHighlights blogs={blogs} />
    </div>
  );
}
