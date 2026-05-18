import React from 'react';
import { getSiteContent } from '@/app/actions/site-content';

function normalizeInlineHtml(html: string) {
  const value = (html || '').trim();
  if (!value) return '';
  return value
    .replace(/^<p[^>]*>([\s\S]*)<\/p>$/i, '$1')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br/>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '');
}

function RichText({ html }: { html: string }) {
  const safeHtml = normalizeInlineHtml(html);
  const hasTag = /<[a-z0-9][\s\S]*>/i.test(safeHtml);
  if (hasTag) {
    return <span className="inline-block" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  return <span suppressHydrationWarning>{safeHtml}</span>;
}

export default async function AboutPage() {
  const siteContent = await getSiteContent();
  const data = siteContent.content.about;

  return (
    <div className="text-[var(--foreground)] py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto transition-colors relative z-10">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">
          <RichText html={data.title} />
        </h1>
        <div className="w-16 sm:w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full" />
      </div>

      <div className="space-y-12">
        {/* Main Content */}
        <section className="prose prose-lg max-w-none text-[var(--foreground)]/80 leading-relaxed">
          <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-tight mb-8">
            <RichText html={data.tagline} />
          </p>
          
          <div>
            <RichText html={data.intro} />
          </div>

          <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-8 border-white dark:border-zinc-900 bg-[var(--card)]">
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20 italic">No image set</div>
              )}
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <RichText html={data.mainText1} />
              </div>
              <div>
                <RichText html={data.mainText2} />
              </div>
            </div>
          </div>
        </section>

        {/* Beliefs Section */}
        {data.beliefs && data.beliefs.length > 0 && (
          <section className="bg-[var(--card)] p-8 md:p-12 rounded-[40px] border border-[var(--border)] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-4xl sm:text-5xl opacity-10 font-black italic select-none">BELIEF</div>
            <h2 className="text-2xl sm:text-3xl font-black italic mb-10 tracking-tight uppercase flex items-center gap-3">
              <span className="w-8 h-1 bg-[var(--primary)] rounded-full" />
              What We Believe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {data.beliefs.map((belief: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 group/item">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold transition-colors group-hover/item:bg-[var(--primary)] group-hover/item:text-white">
                    {idx + 1}
                  </span>
                  <p className="font-bold text-base sm:text-lg leading-snug">{belief}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[32px] bg-gradient-to-br from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/20">
            <h2 className="text-xl sm:text-2xl font-black italic mb-4 uppercase tracking-tight">Our Mission</h2>
            <p className="text-base sm:text-lg font-medium leading-relaxed">
              <RichText html={data.mission} />
            </p>
          </div>
          <div className="p-10 rounded-[32px] bg-gradient-to-br from-[var(--foreground)]/5 to-transparent border border-[var(--foreground)]/10">
            <h2 className="text-xl sm:text-2xl font-black italic mb-4 uppercase tracking-tight">Our Vision</h2>
            <p className="text-base sm:text-lg font-medium leading-relaxed">
              <RichText html={data.vision} />
            </p>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="pt-16 pb-8 text-center border-t border-[var(--border)]">
          <div className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">
            <RichText html={data.footerTitle} />
          </div>
          <p className="text-[var(--primary)] font-bold tracking-[0.3em] uppercase text-xs">
            <RichText html={data.footerTagline} />
          </p>
        </div>
      </div>
    </div>
  );
}
