'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';

type HeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageUrl: string;
};

const fallbackHero: HeroContent = {
  eyebrow: 'Premium Fashion Finds • 2026 Edition',
  title: 'Elevate Your Everyday Aesthetic',
  subtitle: 'Discover hand-picked fashion edits, insider styling tips, and the season\'s most coveted looks.',
  primaryCtaLabel: 'Steal the Look',
  primaryCtaHref: '/categories',
  secondaryCtaLabel: 'Read the Latest',
  secondaryCtaHref: '/blog',
  imageUrl: 'https://picsum.photos/seed/fashion-hero/1920/1080',
};

export default function Hero({ content = fallbackHero }: { content?: HeroContent }) {
  return (
    <section className="select-none relative w-full overflow-hidden bg-[var(--background)] -mt-16">
      <SafeImage
        src={content.imageUrl}
        alt="Hero Fashion"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />

      <div className="absolute inset-0 pt-16">
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-3">
              {content.eyebrow}
            </p>

            <h1 className="text-[36px] sm:text-[52px] lg:text-[68px] leading-[1.05] font-black italic text-white mb-4 sm:mb-6 tracking-tight">
              {content.title}
            </h1>

            <p className="text-sm sm:text-base text-white/75 max-w-sm sm:max-w-md mb-6 sm:mb-10 leading-relaxed">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={content.primaryCtaHref}
                className="bg-[var(--primary)] text-white px-6 sm:px-8 py-3 rounded-[16px] font-bold text-sm hover:scale-105 transition-all shadow-[0_8px_24px_rgba(230,0,35,0.4)]"
              >
                {content.primaryCtaLabel}
              </Link>
              <Link
                href={content.secondaryCtaHref}
                className="bg-white/15 backdrop-blur-sm text-white border border-white/25 px-6 sm:px-8 py-3 rounded-[16px] font-bold text-sm hover:bg-white/25 transition-all"
              >
                {content.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
