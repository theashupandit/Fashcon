import { getBlogBySlug, getLatestBlogs, getFeaturedProducts, getCategories, getProductById, getAllProducts } from '@/app/actions/storefront';
import Link from 'next/link';
import { ExternalLink, ArrowRight, ChevronRight, Star } from 'lucide-react';
import { FaAmazon, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import { cn, getStoreBranding, optimizeCloudinaryUrl } from '@/lib/utils';
import BlogProductSection from '@/components/BlogProductSection';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  const description = post.metaDescription || post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');

  return {
    title: `${post.title} | Fashcon`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const latestBlogs = await getLatestBlogs();
  const relatedPosts = latestBlogs.filter((p: any) => p.slug !== slug).slice(0, 4);
  const featured = await getFeaturedProducts();
  const trendingProducts = (featured.length > 0 ? featured : await getAllProducts()).slice(0, 6);
  const displayAds = (post.adProducts && post.adProducts.length > 0) ? post.adProducts : trendingProducts;
  const productCategories = await getCategories('product');

  // Fetch product data for sections that have a productId attached
  const sectionsWithProducts = post.sections ? await Promise.all(
    post.sections.map(async (section: any) => {
      if (section.productId) {
        const product = await getProductById(section.productId);
        return { ...section, product };
      }
      return section;
    })
  ) : [];

  return (
    <main className="min-h-screen">
      {/* Header Section - Premium & Immersive */}
      <header className={cn(
        "relative overflow-hidden transition-all duration-700 z-10",
        post.headerImage
          ? "min-h-[70vh] md:min-h-[85vh] flex flex-col justify-center py-32 -mt-[56px]"
          : "pt-24 pb-16 md:pt-32 md:pb-24"
      )}>
        {post.headerImage && (
          <>
            <img
              src={optimizeCloudinaryUrl(post.headerImage)}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            {/* Premium Dark Overlay for white text contrast */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
            {/* Soft, seamless transition gradient to page background */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none z-10"></div>
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

          {/* —— Main Content (Zig-Zag Sections) —— */}
          <div className="lg:col-span-9 space-y-20">
            {sectionsWithProducts && sectionsWithProducts.length > 0 ? (
              (() => {
                let currentStep = 0;
                return sectionsWithProducts.map((section: any, index: number) => {
                  const prefixStr = (section.prefix !== undefined ? section.prefix : 'STEP');
                  const showLabel = prefixStr !== "";
                  const isNumbered = showLabel && !prefixStr.toUpperCase().includes("TESTIMONIAL");
                  if (isNumbered) currentStep++;

                  if (section.product) {
                    return (
                      <BlogProductSection
                        key={index}
                        product={section.product}
                        section={section}
                        index={index}
                        stepNumber={isNumbered ? currentStep : undefined}
                      />
                    );
                  }

                  return (
                    <div key={index} className="flex flex-col md:flex-row gap-12 md:items-start animate-fade-in group" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                      {/* Step Image */}
                      <div className={`w-full md:w-1/2 aspect-[4/5] overflow-hidden rounded-[40px] bg-black/5 shadow-2xl transition-all duration-700 group-hover:shadow-[var(--primary)]/10 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <img
                          src={optimizeCloudinaryUrl(section.image)}
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
                          <div className="py-4 px-6 bg-gradient-to-r from-[var(--primary)]/[0.03] to-transparent border-l-2 border-[var(--primary)] rounded-r-xl">
                            <p className="text-[14px] font-sans font-medium italic leading-relaxed text-[var(--foreground)]/80">
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

            {/* The Fashcon Insider - Optimized for Small Screens (Mobile/Tablet) */}
            <div className="lg:hidden w-full bg-[var(--primary)] text-white p-6 sm:p-8 rounded-[24px] text-center sm:text-left shadow-xl shadow-[var(--primary)]/20 mb-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <h4 className="font-serif font-bold text-xl sm:text-2xl italic leading-none text-left">The Fashcon Insider</h4>
                  <p className="text-[10px] sm:text-xs opacity-90 leading-relaxed text-left">Get the latest style updates and trends delivered straight to your inbox weekly.</p>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5 shrink-0 min-w-[280px]">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full sm:w-56 text-xs bg-white/10 text-white placeholder-white/50 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white/20 transition-all text-center sm:text-left"
                  />
                  <button className="w-full sm:w-auto bg-white text-[var(--primary)] font-black text-[9px] uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-black hover:text-white transition-all active:scale-[0.98] whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* —— Bottom Section —— */}
            <div className="pt-4 text-center px-4">

              {/* Bottom Horizontal Banner Ad */}
              <div className="relative w-full rounded-[32px] md:rounded-[40px] overflow-hidden bg-black aspect-[16/10] sm:aspect-[21/9] md:aspect-[3/1] mb-16 group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                <img
                  src={post.bottomBannerImage || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1500&auto=format&fit=crop"}
                  alt="Bottom Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 p-6 sm:p-10 md:p-16 flex flex-col justify-center items-start text-left max-w-2xl">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-2 md:mb-4">
                    {post.bottomBannerSubtitle || "Seasonal Spotlight"}
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-white mb-4 md:mb-8 italic leading-tight">
                    {post.bottomBannerTitle || "Curate Your 2026 Wardrobe"}
                  </h3>
                  {(() => {
                    const bannerUrl = post.bottomBannerButtonUrl || "#";
                    const branding = getStoreBranding(bannerUrl, 'DEFAULT', post.bottomBannerButtonText || "View New Arrivals");
                    return (
                      <Link 
                        href={bannerUrl}
                        target={bannerUrl.startsWith('http') ? "_blank" : undefined}
                        rel={bannerUrl.startsWith('http') ? "noopener noreferrer" : undefined}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 px-8 py-3.5 md:px-10 md:py-5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 shadow-xl border cursor-pointer",
                          branding.bg,
                          branding.text,
                          branding.border,
                          branding.shadow,
                          branding.name === 'DEFAULT' 
                            ? "hover:bg-white hover:text-black" 
                            : branding.hover
                        )}
                      >
                        {branding.iconType === 'amazon' && <FaAmazon size={12} />}
                        {branding.iconType === 'shopping-cart' && <FaShoppingCart size={12} />}
                        {branding.iconType === 'shopping-bag' && <FaShoppingBag size={12} />}
                        <span>{post.bottomBannerButtonText || "View New Arrivals"}</span>
                      </Link>
                    );
                  })()}
                </div>
              </div>

              {/* Trending Products Grid (Compact Pins) */}
              <div className="text-left mb-16">
                <div className="flex items-center justify-between mb-10 border-b border-[var(--foreground)]/5 pb-6">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em]">Trending Now</h4>
                  <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline">
                    Shop All
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {displayAds.map((item: any, idx: number) => (
                    <Link href={`/products/${item.slug || item.productId}`} key={idx} className="group cursor-pointer flex flex-col">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-black/5 shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:-translate-y-0.5">
                        <img src={optimizeCloudinaryUrl(item.media?.mainImage || item.image, 250)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <h5 className="text-[10px] font-bold mb-1 opacity-80 line-clamp-1 leading-tight">{item.title}</h5>
                      <div className="flex items-center gap-1 mb-1 mt-auto">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={7}
                              className={i < Math.floor(item.rating || 4.5) ? "fill-[#FFB800] text-[#FFB800]" : "fill-zinc-200 text-zinc-200"}
                            />
                          ))}
                        </div>
                        <span className="text-[7px] font-bold opacity-30">({item.reviewsCount || 0})</span>
                      </div>
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
                        src={optimizeCloudinaryUrl(relatedPost.image)}
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
