'use client';

import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { FaAmazon, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import ProductGallery from './ProductGallery';
import { getStoreBranding, cn } from '@/lib/utils';
import { recordClick } from '@/app/actions/storefront';

interface Variant {
  colorName: string;
  colorCode: string;
  variantImage: string;
  variantLink?: string;
  priceOverride?: number;
}

interface BlogProductSectionProps {
  product: any;
  section: any;
  index: number;
  stepNumber?: number;
}

export default function BlogProductSection({ product, section, index, stepNumber }: BlogProductSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const currentPrice = selectedVariant !== null && product.variants[selectedVariant]?.priceOverride
    ? product.variants[selectedVariant].priceOverride
    : product.prices?.offer;

  const currencySymbol = product.prices?.currency === 'USD' ? '$' : '₹';

  const currentLink = selectedVariant !== null && product.variants[selectedVariant]?.variantLink
    ? product.variants[selectedVariant].variantLink
    : product.affiliate?.mainLink || section.ctaUrl;

  const currentImage = selectedVariant !== null && product.variants[selectedVariant]?.variantImage
    ? product.variants[selectedVariant].variantImage
    : null;

  const allImages = [
    ...(currentImage ? [currentImage] : [product.media?.mainImage || section.image]),
    ...(product.media?.gallery || []),
    ...(currentImage ? [product.media?.mainImage || section.image] : [])
  ].filter(Boolean);

  const handleShopClick = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).pintrk) {
        let extId = null;
        try {
          extId = localStorage.getItem('fashcon_p_ext_id');
        } catch (e) {}

        const eventData: Record<string, any> = {
          value: currentPrice,
          currency: product.prices?.currency || 'INR',
          product_name: product.title,
          product_id: product._id
        };

        if (extId) {
          eventData.external_id = extId;
          const { logVisitorEvent } = require('@/app/actions/visitor');
          logVisitorEvent({
            externalId: extId,
            event: 'lead',
            details: JSON.stringify(eventData)
          }).catch((err: any) => console.error('Failed to log click to DB:', err));
        }

        (window as any).pintrk('track', 'lead', eventData);
      }
      await recordClick(product._id, selectedVariant !== null ? selectedVariant : undefined);
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  };

  const branding = getStoreBranding(currentLink, product.affiliate?.platform || section.ctaStore, section.ctaLabel || product.ctaText);

  return (
    <div className="flex flex-col md:flex-row gap-12 md:items-start animate-fade-in group">
      {/* Right Column: Dynamic Gallery */}
      <div className={`w-full md:w-1/2 overflow-hidden ${index % 2 === 1 ? 'md:order-2' : ''} space-y-6`}>
        <ProductGallery images={allImages} />

        {/* Variant Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="py-4 border-t border-[var(--foreground)]/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">Choose Shade / Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v: Variant, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(i === selectedVariant ? null : i)}
                  className={`group/var relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${i === selectedVariant
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
                      : 'border-[var(--foreground)]/10 text-[var(--foreground)]/65 hover:border-[var(--foreground)]/35'
                    }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: v.colorCode }}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{v.colorName}</span>
                  {i === selectedVariant && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Left Column: Product Details */}
      <div className={`w-full md:w-1/2 space-y-6 px-4 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
        {/* Step Badge */}
        {section.prefix !== "" && (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">
              {section.prefix || 'PRODUCT'}{stepNumber ? ` ${stepNumber}` : ''}
            </span>
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.1] text-[var(--foreground)]">
          {product.title}
        </h2>

        {/* Rating */}
        <div className="flex items-center gap-2 -mt-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating || 4.5) ? "fill-[#FFB800] text-[#FFB800]" : "fill-[var(--foreground)]/10 text-[var(--foreground)]/10"}
              />
            ))}
          </div>
          {((product.reviewsCount ?? 0) > 0 || !product.reviewsCount) && (
            <span className="text-[9px] font-black text-[var(--foreground)]/30 uppercase tracking-[0.2em]">
              ({(product.reviewsCount ?? 0).toLocaleString()} Reviews)
            </span>
          )}
        </div>

        {/* Pricing */}
        {product.prices?.showPricing && (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black italic tracking-tighter text-[var(--primary)]">
              {currencySymbol}{Number(currentPrice).toLocaleString()}
            </span>
            {product.prices?.original && Number(product.prices.original) > Number(currentPrice) && (
              <span className="text-sm text-[var(--foreground)]/40 line-through font-bold">
                {currencySymbol}{Number(product.prices.original).toLocaleString()}
              </span>
            )}
          </div>
        )}

        <p className="text-lg font-sans leading-relaxed text-[var(--foreground)]/70">
          {section.description || product.description}
        </p>

        {section.summary && (
          <div className="py-4 px-6 bg-gradient-to-r from-[var(--primary)]/[0.03] to-transparent border-l-2 border-[var(--primary)] rounded-r-xl">
            <p className="text-[14px] font-sans font-medium italic leading-relaxed text-[var(--foreground)]/80">
              "{section.summary}"
            </p>
          </div>
        )}

        {/* Branded CTA button */}
        <div className="pt-2">
          <button
            onClick={handleShopClick}
            className={cn(
              "inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.1em] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-xl border cursor-pointer",
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
            <span>{section.ctaLabel || product.ctaText || `Shop on ${branding.name}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
