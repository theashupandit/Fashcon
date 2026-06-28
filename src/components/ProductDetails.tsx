'use client';

import React, { useState } from 'react';
import { Share2, Heart, ShieldCheck, RotateCcw, ShoppingBag, Check, Star, Sparkles, Flame, Crown } from 'lucide-react';
import { FaAmazon, FaShoppingCart, FaShoppingBag, FaInstagram, FaExternalLinkAlt } from 'react-icons/fa';
import ProductGallery from './ProductGallery';
import { recordClick } from '@/app/actions/storefront';
import { logVisitorEvent } from '@/app/actions/visitor';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn, getStoreBranding } from '@/lib/utils';

interface Variant {
  colorName: string;
  colorCode: string;
  variantImage: string;
  variantLink?: string;
  priceOverride?: number;
}

interface ProductDetailsProps {
  product: any;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPrice = selectedVariant !== null && product.variants[selectedVariant]?.priceOverride
    ? product.variants[selectedVariant].priceOverride
    : product.prices.offer;

  const currencySymbol = product.prices.currency === 'USD' ? '$' : '₹';

  const sanitizePrice = (val: any) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const currentLink = selectedVariant !== null && product.variants[selectedVariant]?.variantLink
    ? product.variants[selectedVariant].variantLink
    : product.affiliate.mainLink;

  const currentImage = selectedVariant !== null && product.variants[selectedVariant]?.variantImage
    ? product.variants[selectedVariant].variantImage
    : null;

  const allImages = [
    ...(currentImage ? [currentImage] : [product.media.mainImage]),
    ...(product.media.gallery || []),
    ...(currentImage ? [product.media.mainImage] : [])
  ];

  // If a variant is selected, we might want to prioritize its image in the gallery
  // For simplicity, we'll just keep the gallery as is but update the current link/price

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
          logVisitorEvent({
            externalId: extId,
            event: 'lead',
            details: JSON.stringify(eventData)
          }).catch(err => console.error('Failed to log click to DB:', err));
        }

        (window as any).pintrk('track', 'lead', eventData);
      }
      await recordClick(product._id, selectedVariant !== null ? selectedVariant : undefined);
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // Share failed silently
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderPremiumBadge = () => {
    if (!product.badge || product.badge === 'None') return null;

    let badgeClass = "";
    let Icon = Sparkles;
    let iconClass = "";
    let iconAnimation: any = {};
    let iconTransition: any = {};

    switch (product.badge) {
      case 'Luxury':
        badgeClass = "bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] dark:from-[#e5c158] dark:via-[#ffd700] dark:to-[#b8860b] text-stone-900 shadow-[0_4px_25px_rgba(212,175,55,0.4)]";
        Icon = Crown;
        iconClass = "fill-stone-900/10";
        iconAnimation = { y: [0, -2, 0] };
        iconTransition = { repeat: Infinity, duration: 2.5, ease: "easeInOut" };
        break;
      case 'Hot Sale':
        badgeClass = "bg-gradient-to-r from-[#ff0844] via-[#ff4e50] to-[#f9d423] text-white shadow-[0_4px_25px_rgba(255,8,68,0.45)]";
        Icon = Flame;
        iconClass = "fill-white/10";
        iconAnimation = { scale: [1, 1.15, 1], y: [0, -1, 0] };
        iconTransition = { repeat: Infinity, duration: 1.5, ease: "easeInOut" };
        break;
      case 'New Arrival':
      default:
        badgeClass = "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-[0_4px_25px_rgba(168,85,247,0.45)]";
        Icon = Sparkles;
        iconClass = "fill-white/10";
        iconAnimation = { rotate: 360 };
        iconTransition = { repeat: Infinity, duration: 5, ease: "linear" };
        break;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.06, y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] py-2 px-5 rounded-full cursor-pointer transition-all duration-300 ${badgeClass}`}
      >
        <motion.div animate={iconAnimation} transition={iconTransition} className="flex items-center justify-center shrink-0">
          <Icon size={13} className={iconClass} />
        </motion.div>
        <span>{product.badge}</span>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left: Gallery */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
        <ProductGallery images={allImages} />
      </div>

      {/* Right: Content */}
      <div className="lg:col-span-8 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between min-h-[32px]">
            {renderPremiumBadge()}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight leading-tight max-w-xl">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 -mt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating ?? 4.5) ? "fill-[#FFB800] text-[#FFB800]" : "fill-zinc-200 text-zinc-200"}
                />
              ))}
            </div>
            {((product.reviewsCount ?? 0) > 0 || !product.reviewsCount) && (
              <span className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">
                ({(product.reviewsCount ?? 0).toLocaleString()} Reviews)
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            {product.prices.showPricing ? (
              <>
                <span className="text-3xl font-black italic tracking-tighter text-[var(--primary)]">
                  {currencySymbol}{currentPrice.toLocaleString()}
                </span>
                {sanitizePrice(product.prices.original) > sanitizePrice(currentPrice) && (
                  <>
                    <span className="text-lg text-[var(--foreground)]/40 line-through font-bold">
                      {currencySymbol}{Number(sanitizePrice(product.prices.original)).toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-green-500 uppercase tracking-widest">
                      {Math.round(((sanitizePrice(product.prices.original) - sanitizePrice(currentPrice)) / sanitizePrice(product.prices.original)) * 100)}% OFF
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-2xl font-black uppercase tracking-tight text-[var(--primary)]">
                {product.prices.priceLabel || 'Price on Request'}
              </span>
            )}
          </div>

          <div className="relative">
            <div className={`prose prose-sm dark:prose-invert max-w-none text-[var(--foreground)]/70 font-medium leading-relaxed whitespace-pre-line ${!isExpanded && 'line-clamp-4'}`}>
              {product.description}
            </div>
            {product.description && product.description.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                {isExpanded ? 'See Less' : 'See More'}
              </button>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag: string, i: number) => (
                <Link
                  key={i}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:text-[var(--primary)] text-[10px] font-black uppercase tracking-widest rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="py-6 border-y border-[var(--foreground)]/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-40">Select Variation</h3>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((v: Variant, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i === selectedVariant ? null : i)}
                    className={`group relative flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all ${i === selectedVariant
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--foreground)]/10 hover:border-[var(--foreground)]/30'
                      }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: v.colorCode }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{v.colorName}</span>
                    {i === selectedVariant && <Check size={12} className="text-[var(--primary)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {(() => {
              const branding = getStoreBranding(currentLink, product.affiliate?.platform, product.ctaText);
              
              return (
                <a
                  href={currentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleShopClick}
                  className={cn(
                    "group w-full sm:w-fit px-12 flex items-center justify-center gap-3 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-xl border",
                    branding.bg,
                    branding.text,
                    branding.border,
                    branding.shadow,
                    branding.name === 'DEFAULT' 
                      ? "dark:hover:bg-white dark:hover:text-black" 
                      : branding.hover
                  )}
                >
                  {branding.iconType === 'amazon' && <FaAmazon size={18} className="group-hover:rotate-12 transition-transform duration-300" />}
                  {branding.iconType === 'shopping-cart' && <FaShoppingCart size={18} className="group-hover:rotate-12 transition-transform duration-300" />}
                  {branding.iconType === 'shopping-bag' && <FaShoppingBag size={18} className="group-hover:rotate-12 transition-transform duration-300" />}
                  {branding.iconType === 'instagram' && <FaInstagram size={18} className="group-hover:rotate-12 transition-transform duration-300" />}
                  {branding.iconType === 'link' && <FaExternalLinkAlt size={16} className="group-hover:rotate-12 transition-transform duration-300" />}
                  {product.ctaText || `Shop on ${branding.name === 'DEFAULT' ? (product.affiliate?.platform || 'Store') : branding.name}`}
                </a>
              );
            })()}

            <button
              onClick={handleShare}
              className="group w-full sm:w-fit px-10 border border-[var(--foreground)]/15 hover:border-[var(--foreground)]/30 flex items-center justify-center gap-3 py-4 rounded-full bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.08] backdrop-blur-md transition-all text-xs font-black uppercase tracking-[0.2em] hover:shadow-xl hover:-translate-y-1 active:scale-95 dark:border-white/10 dark:hover:border-white/20 dark:bg-white/[0.02] dark:hover:bg-white/[0.07]"
            >
              <Share2 size={15} className="opacity-80 group-hover:scale-110 transition-transform" />
              <span>Share Style</span>
            </button>
          </div>
        </div>

        {/* Trust Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-[var(--foreground)]/10">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--foreground)]/[0.02]">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider">Verified Listing</div>
              <div className="text-[9px] opacity-40 uppercase font-bold tracking-tight">Authenticity Guaranteed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--foreground)]/[0.02]">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <RotateCcw size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider">Direct Access</div>
              <div className="text-[9px] opacity-40 uppercase font-bold tracking-tight">Official Partner Links</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
