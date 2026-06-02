import Link from 'next/link';
import { SafeImage } from './ui/SafeImage';

/** Returns 3 collage image URLs for a post card */
function getCollageImages(post: any) {
  const baseImage = post.image || '/placeholder.png';
  const images: string[] = [baseImage];

  if (post.sections && Array.isArray(post.sections)) {
    for (const section of post.sections) {
      if (section.image && section.image !== '/placeholder.png' && !images.includes(section.image)) {
        images.push(section.image);
      }
      if (images.length >= 3) break;
    }
  }

  while (images.length < 3) {
    images.push('/placeholder.png');
  }

  return images;
}

const categoryColors: Record<string, string> = {
  Beauty: '#c4004a',
  Fashion: '#000000',
  Nails: '#7c3aed',
  Skincare: '#059669',
  Home: '#d97706',
  Lifestyle: '#db2777',
  Default: '#c4004a',
};

function getCategoryColor(category: string) {
  return categoryColors[category] || categoryColors.Default;
}

export default function BlogRail({ posts }: { posts: any[] }) {
  const displayPosts = posts?.slice(0, 4) || [];

  if (displayPosts.length === 0) return null;

  return (
    <section
      className="py-10 sm:py-14 lg:py-18 bg-transparent"
    >
      {/* ── theme-aware CSS vars ── */}
      <style>{`
        :root {
          --blog-card-bg: transparent;
          --blog-card-title: #191919;
          --blog-wrapper-bg: transparent;
          --blog-wrapper-border: #ff2d6d;
          --blog-heading-color: #1b1b1b;
          --blog-collage-placeholder: #f8e2e8;
        }
        .dark {
          --blog-card-bg: transparent;
          --blog-card-title: #f0f0f0;
          --blog-wrapper-bg: transparent;
          --blog-wrapper-border: #ff2d6d;
          --blog-heading-color: #ffffff;
          --blog-collage-placeholder: #2a1a20;
        }
      `}</style>

      {/* ── Full-width heading with flanking lines — NO wrapper rectangle ── */}
      <div className="text-center mb-10 sm:mb-16 px-4">
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-black italic mb-4 uppercase tracking-tighter bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent pr-4"
        >
          Posts You Just CANNOT Miss!
        </h2>
        <div className="w-16 sm:w-20 h-1 bg-[var(--primary)] mx-auto rounded-full" />
      </div>

      {/* ── 4-column card grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
          {displayPosts.map((post) => {
            const collage = getCollageImages(post);
            const hasRealImage = collage[0] && collage[0] !== '/placeholder.png';

            return (
              <Link
                key={post._id}
                href={`/blog/${post.slug || post._id}`}
                className="group flex flex-col rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* ── Cover Image: Large, beautiful, tall aspect ratio ── */}
                <div className="relative overflow-hidden rounded-[16px] aspect-[4/3] bg-[var(--blog-collage-placeholder)]">
                  <SafeImage
                    src={collage[0] || '/placeholder.png'}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* ── Card body ── */}
                <div className="flex flex-col flex-1 pt-4 pb-2">
                  <span
                    className="inline-flex self-start rounded-[6px] px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-white mb-2"
                    style={{ background: getCategoryColor(post.category) }}
                  >
                    {post.category}
                  </span>
                  <h3
                    className="text-[14px] sm:text-[17px] font-black leading-[1.35] line-clamp-3"
                    style={{ color: 'var(--blog-card-title)' }}
                  >
                    {post.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── View all posts link ── */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              borderColor: 'var(--blog-wrapper-border)',
              color: 'var(--blog-wrapper-border)',
              background: 'transparent',
            }}
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
