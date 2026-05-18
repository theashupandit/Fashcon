'use client';

import Link from 'next/link';

interface CategoryMarqueeProps {
  items: string[];
  links: string[];
}

export default function CategoryMarquee({ items, links }: CategoryMarqueeProps) {
  if (!items?.length) return null;

  return (
    <div className="relative w-full overflow-hidden bg-[var(--glass)] backdrop-blur-md py-3.5 mb-12 border-y border-[var(--foreground)]/5 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300">
      {/* Premium Left Side Fade Out */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/75 to-transparent pointer-events-none z-10" />

      {/* Premium Right Side Fade Out */}
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/75 to-transparent pointer-events-none z-10" />

      <div className="marquee-track flex whitespace-nowrap w-max">
        {[...Array(10)].flatMap((_, repeatIndex) => items.map((item, index) => (
          <Link
            key={`${item}-${repeatIndex}-${index}`}
            href={links[index] || '#'}
            className="text-[12px] font-extrabold tracking-[0.18em] uppercase text-[var(--foreground)] px-6 italic flex items-center shrink-0"
          >
            {item} <span className="text-[var(--primary)] ml-5 not-italic">✦</span>
          </Link>
        )))}
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          gap: 0;
          width: max-content;
          min-width: 100%;
          animation: marquee 8s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-10%); }
        }
      `}</style>
    </div>
  );
}
