import { getBlogBySlug, getLatestBlogs, getFeaturedProducts, getCategories } from '@/app/actions/storefront';
import Link from 'next/link';
import { ExternalLink, ArrowRight, ChevronRight, Star } from 'lucide-react';
import { FaAmazon, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import { cn, getStoreBranding } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const latestBlogs = await getLatestBlogs();
  const relatedPosts = latestBlogs.filter((p: any) => p.slug !== slug).slice(0, 4);
  const trendingProducts = (await getFeaturedProducts()).slice(0, 4);
  const productCategories = await getCategories('product');

  return (
    <main className="min-h-screen">
      {/* Header Section - Premium & Immersive */}
      <header className={cn(
        "relative overflow-hidden transition-all duration-700 z-10",
        post.headerImage
          ? "min-h-[70vh] md:min-h-[85vh] flex flex-col justify-center py-32 -mt-[56px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
          : "pt-24 pb-16 md:pt-32 md:pb-24"
      )}>
        {post.headerImage && (
          <>
            <img
              src={post.headerImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            {/* Premium Dark Overlay for white text contrast */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--background)]"></div>
          </>
        )}

        <div className={cn(
          "relative z-10 text-center max-w-4xl mx-auto px-4",
          post.headerImage && "text-white"
        )}>
          <div className="mb-10 animate-fade-in">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em] opacity-90",
              post.headerImage ? "text-white" : "text-[var(--primary)]"
            )}>
              {post.category}
            </span>
            <div className={cn(
              "w-12 h-[2px] mx-auto mt-4 opacity-30",
              post.headerImage ? "bg-white" : "bg-[var(--primary)]"
            )}></div>
          </div>

          <h1 className={cn(
            "text-4xl md:text-7xl font-serif font-bold tracking-tight mb-10 leading-[1.05] animate-fade-in",
            post.headerImage && "drop-shadow-2xl"
          )} style={{ animationDelay: '0.1s' }}>
            {post.title}
          </h1>

          <div className={cn(
            "flex items-center justify-center gap-6 text-[11px] font-bold uppercase tracking-widest animate-fade-in",
            post.headerImage ? "text-white/80" : "opacity-40"
          )} style={{ animationDelay: '0.2s' }}>
            <span>By Fashcon Editors</span>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {/* Content Grid - 3-6-3 Layout - Added more top padding for breathable transition */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* â”€â”€ Main Content (Zig-Zag Sections) â”€â”€ */}
          <div className="lg:col-span-9 space-y-20">
            {post.sections && post.sections.length > 0 ? (
              (() => {
                let currentStep = 0;
                return post.sections.map((section, index) => {
                  const prefixStr = (section.prefix !== undefined ? section.prefix : 'STEP');
                  const showLabel = prefixStr !== "";
                  const isNumbered = showLabel && !prefixStr.toUpperCase().includes("TESTIMONIAL");
                  if (isNumbered) currentStep++;

                  return (
                    <div key={index} className="flex flex-col md:flex-row gap-12 md:items-center animate-fade-in group" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                      {/* Step Image */}
                      <div className={`w-full md:w-1/2 aspect-[4/5] overflow-hidden rounded-[40px] bg-black/5 shadow-2xl transition-all duration-700 group-hover:shadow-[var(--primary)]/10 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      </div>

                      {/* Step Text */}
                      <div className={`w-full md:w-1/2 space-y-6 px-4 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        {/* Step Badge - Left Aligned */}
                        {showLabel && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">
                              {prefixStr}{isNumbered && ` ${currentStep}`}
                            </span>
                          </div>
                        )}

                        <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.1] text-[var(--foreground)]">
                          {section.title}
                        </h2>

                        {/* Product Rating if attached */}
                        {section.productId && (
                          <div className="flex items-center gap-2 -mt-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < Math.floor(section.rating || 4.5) ? "fill-[#FFB800] text-[#FFB800]" : "fill-[var(--foreground)]/10 text-[var(--foreground)]/10"}
                                />
                              ))}
                            </div>
                            {((section.reviewsCount ?? 0) > 0 || !section.reviewsCount) && (
                              <span className="text-[9px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">
                                ({(section.reviewsCount ?? 0).toLocaleString()} Reviews)
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-lg font-sans leading-relaxed text-[var(--foreground)]/70">
                          {section.description}
                        </p>

                        {section.summary && (
                          <div className="py-8 px-10 bg-black/5 dark:bg-white/5 rounded-[32px] border border-[var(--foreground)]/5 transition-all group-hover:border-[var(--primary)]/20">
                            <p className="text-base font-serif font-bold italic leading-relaxed opacity-90 italic">
                              "{section.summary}"
                            </p>
                          </div>
                        )}

                        {section.ctaLabel && (
                          <div className="pt-6">
                            {(() => {
                              const branding = getStoreBranding(section.ctaUrl, section.ctaStore, section.ctaLabel);
                              
                              return (
                                <Link
                                  href={section.ctaUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.1em] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-xl border",
                                    branding.bg,
                                    branding.text,
                                    branding.border,
                                    branding.shadow,
                                    branding.name === 'DEFAULT' 
                                      ? "dark:hover:bg-white dark:hover:text-black" 
                                      : branding.hover
                                  )}
                                >
                                  {branding.iconType === 'amazon' && <FaAmazon size={16} />}
                                  {branding.iconType === 'shopping-cart' && <FaShoppingCart size={16} />}
                                  {branding.iconType === 'shopping-bag' && <FaShoppingBag size={16} />}
                                  {section.ctaLabel}
                                </Link>
                              );
                            })()}
                            {section.ctaStore && (
                              <p className="mt-3 text-[9px] uppercase tracking-[0.2em] opacity-30 font-black ml-6">
                                Available at {section.ctaStore}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-lg leading-relaxed opacity-80 py-12 px-4 max-w-2xl">
                <p className="mb-12 text-2xl font-serif italic leading-snug">
                  {post.excerpt}
                </p>
                <div className="prose prose-lg dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
              </div>
            )}

            {/* â”€â”€ Bottom Section â”€â”€ */}
            <div className="pt-4 text-center px-4">

              {/* Bottom Horizontal Banner Ad */}
              <div className="relative w-full rounded-[40px] overflow-hidden bg-black aspect-[21/9] md:aspect-[3/1] mb-16 group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1500&auto=format&fit=crop"
                  alt="Bottom Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 p-8 md:p-16 flex flex-col justify-center items-start text-left max-w-2xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-4">Seasonal Spotlight</span>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 italic">Curate Your 2026 Wardrobe</h3>
                  <button className="bg-[var(--primary)] text-white font-black text-[11px] uppercase tracking-widest py-5 px-10 rounded-full hover:bg-white hover:text-black transition-all shadow-xl">
                    View New Arrivals
                  </button>
                </div>
              </div>

              {/* Trending Products Grid */}
              <div className="text-left mb-16">
                <div className="flex items-center justify-between mb-10 border-b border-[var(--foreground)]/5 pb-6">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em]">Trending Now</h4>
                  <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline">
                    Shop All
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {trendingProducts.map((item: any, idx: number) => (
                    <Link href={`/products/${item.slug}`} key={idx} className="group cursor-pointer">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-black/5 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                        <img src={item.media?.mainImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <h5 className="text-[11px] font-bold mb-1 opacity-80 line-clamp-1">{item.title}</h5>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={8}
                              className={i < Math.floor(item.rating || 4.5) ? "fill-[#FFB800] text-[#FFB800]" : "fill-zinc-200 text-zinc-200"}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-bold opacity-30">({item.reviewsCount || 0})</span>
                      </div>
                      <p className="text-[10px] font-black text-[var(--primary)]">₹{item.prices?.offer?.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Matches Reference Image */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-12 sticky top-32 animate-fade-in" style={{ animationDelay: '0.4s' }}>

            {/* More to Read */}
            <div>
              <h3 className="font-black tracking-widest uppercase text-sm mb-6 pb-2 border-b border-[var(--foreground)]/10">
                More to Read
              </h3>
              <div className="flex flex-col gap-6">
                {relatedPosts.map((relatedPost: any) => (
                  <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.slug} className="group flex gap-4 items-start">
                    <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-black/5 shadow-sm">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] block mb-1">
                        {relatedPost.category}
                      </span>
                      <h4 className="text-xs font-bold leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>


            {/* Explore Categories */}
            <div>
              <h3 className="font-black tracking-widest uppercase text-[11px] mb-6 pb-3 border-b border-[var(--foreground)]/10">
                Explore Categories
              </h3>
              <div className="flex flex-col">
                {productCategories.slice(0, 8).map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between py-3.5 border-b border-[var(--foreground)]/5 text-[11px] font-bold uppercase tracking-widest hover:text-[var(--primary)] transition-colors group"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* The Fashcon Insider Newsletter */}
            <div className="bg-[var(--primary)] text-white p-8 rounded-[32px] text-center shadow-2xl shadow-[var(--primary)]/30">
              <h4 className="font-serif font-bold text-2xl mb-2 italic">The Fashcon Insider</h4>
              <p className="text-[11px] opacity-90 mb-8 leading-relaxed">Get the latest trends delivered weekly.</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full text-xs bg-white/10 text-white placeholder-white/50 border border-white/10 rounded-xl px-5 py-4 outline-none focus:bg-white/20 transition-all text-center"
                />
                <button className="w-full bg-white text-[var(--primary)] font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-black hover:text-white transition-all shadow-xl active:scale-[0.98]">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>

        </div>

        {/* â”€â”€ Footer Link â”€â”€ */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-[var(--primary)] transition-all group"
          >
            <ArrowRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>
        </div>
      </div>
    </main>
  );
}
