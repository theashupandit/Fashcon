'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type HeroContent = {
  eyebrow: string
  title: string
  subtitle: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  imageUrl: string
  mobileImageUrl?: string
  titleFont?: string
  titleColor?: string
  contentAlignment?: 'top' | 'middle' | 'bottom'
  titleShadowColor?: string
  titleShadowX?: number
  titleShadowY?: number
  titleShadowBlur?: number
}

const fallbackHero: HeroContent = {
  eyebrow: 'Premium Fashion • 2026 Edition',
  title: 'Elevate The way of life',
  subtitle: 'Discover hand-picked fashion edits, insider styling tips, and the season\u2019s most coveted looks.',
  primaryCtaLabel: 'Steal the Style',
  primaryCtaHref: '/shop',
  secondaryCtaLabel: 'Read the Blog',
  secondaryCtaHref: '/blog',
  imageUrl: '/placeholder.png',
  contentAlignment: 'middle',
  titleShadowColor: 'rgba(0,0,0,0.4)',
  titleShadowX: 0,
  titleShadowY: 4,
  titleShadowBlur: 12,
}

function normalizeInlineHtml(html: string) {
  const value = (html || '').trim();
  if (!value) return '';
  return value
    .replace(/^<p[^>]*>([\s\S]*)<\/p>$/i, '$1')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br/>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '');
}

// Render HTML content — if it contains tags use dangerouslySetInnerHTML,
// otherwise render as plain text. This preserves Tiptap formatting.
function RichText({ html, className }: { html: string; className?: string }) {
  const safeHtml = normalizeInlineHtml(html)
  const hasTag = /<[a-z0-9][\s\S]*>/i.test(safeHtml ?? '')
  if (hasTag) {
    return (
      <span
        className={className}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }
  return <span className={className} suppressHydrationWarning>{safeHtml}</span>
}

export default function Hero({ content }: { content?: Partial<HeroContent> }) {
  const data = { ...fallbackHero, ...content }
  const currentAlignment = data.contentAlignment || 'middle'

  const [imgSrc, setImgSrc] = useState(data.imageUrl)
  const [mobileImgSrc, setMobileImgSrc] = useState(data.mobileImageUrl)

  useEffect(() => {
    setImgSrc(data.imageUrl)
  }, [data.imageUrl])

  useEffect(() => {
    setMobileImgSrc(data.mobileImageUrl)
  }, [data.mobileImageUrl])

  const alignmentClasses = {
    top: 'items-start pt-10 sm:pt-20',
    middle: 'items-center',
    bottom: 'items-end pb-10 sm:pb-24',
  }

  const gradient =
    currentAlignment === 'top'
      ? 'bg-gradient-to-b from-black/80 via-black/20 to-transparent'
      : currentAlignment === 'middle'
        ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'
        : 'bg-gradient-to-t from-black/80 via-transparent to-transparent'

  const handleImageError = () => {
    // If the image fails to load, fall back to a high-quality fashion backdrop
    const fallback = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop'
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
  };

  const handleMobileImageError = () => {
    const fallback = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop'
    if (mobileImgSrc !== fallback) {
      setMobileImgSrc(fallback)
    }
  };

  return (
    <section className="select-none relative w-full h-[72dvh] sm:h-[calc(100dvh+1px)] min-h-[480px] sm:min-h-[600px] overflow-hidden bg-black -mt-[57px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10">
      <div className="absolute inset-0 w-full h-full">
        {mobileImgSrc ? (
          <>
            {/* Desktop Hero Image */}
            <div className="hidden sm:block absolute inset-0 w-full h-full">
              <Image
                src={imgSrc}
                alt="Hero Fashion"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
                onError={handleImageError}
              />
            </div>
            {/* Mobile Hero Image */}
            <div className="block sm:hidden absolute inset-0 w-full h-full">
              <Image
                src={mobileImgSrc}
                alt="Hero Fashion"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
                onError={handleMobileImageError}
              />
            </div>
          </>
        ) : (
          <Image
            src={imgSrc}
            alt="Hero Fashion"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            onError={handleImageError}
          />
        )}
      </div>

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-10 ${gradient}`} />

      <div className="relative z-20 h-full">
        <div className={`max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-full pt-10 sm:pt-14 flex ${alignmentClasses[currentAlignment]}`}>
          <div className="max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-2xl">

            {/* Eyebrow — supports Tiptap HTML */}
            <div className="text-[9px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-2 sm:mb-3">
              <RichText html={data.eyebrow} />
            </div>

            {/* Title — supports Tiptap HTML */}
            {(() => {
              const shadowStyle = data.titleShadowColor
                ? `${data.titleShadowX ?? 0}px ${data.titleShadowY ?? 4}px ${data.titleShadowBlur ?? 12}px ${data.titleShadowColor}`
                : '0px 4px 12px rgba(0,0,0,0.4)';
              return (
                <h1 
                  className="text-[28px] sm:text-[52px] lg:text-[68px] leading-[1.1] sm:leading-[1.05] font-black italic mb-3 sm:mb-6 tracking-tighter uppercase text-white pr-2"
                  style={{ textShadow: shadowStyle }}
                >
                  <RichText html={data.title} />
                </h1>
              );
            })()}

            {/* Subtitle — always rich HTML */}
            <div
              className="text-xs sm:text-base text-white/80 max-w-sm sm:max-w-md mb-5 sm:mb-10 leading-relaxed prose prose-invert prose-sm opacity-90 pr-2"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />

            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {data.primaryCtaLabel && data.primaryCtaHref && (
                <Link
                  href={data.primaryCtaHref}
                  className="bg-[var(--primary)] text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-[12px] sm:rounded-[16px] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 transition-all shadow-[0_6px_20px_rgba(230,0,35,0.4)] hover:shadow-[0_8px_28px_rgba(230,0,35,0.6)]"
                >
                  <RichText html={data.primaryCtaLabel} />
                </Link>
              )}
              {data.secondaryCtaLabel && data.secondaryCtaHref && (
                <Link
                  href={data.secondaryCtaHref}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-[12px] sm:rounded-[16px] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 transition-all"
                >
                  <RichText html={data.secondaryCtaLabel} />
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
