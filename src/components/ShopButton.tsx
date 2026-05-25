'use client';

import React from 'react';
import { FaAmazon, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { recordClick } from '@/app/actions/storefront';
import { cn, getStoreBranding } from '@/lib/utils';

interface ShopButtonProps {
  productId: string;
  url: string;
  store: string;
}

export default function ShopButton({ productId, url, store }: ShopButtonProps) {
  const handleClick = async () => {
    try {
      await recordClick(productId);
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  };

  const branding = getStoreBranding(url, store);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center justify-center gap-3 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 active:scale-95 border",
        branding.bg,
        branding.text,
        branding.border,
        branding.shadow,
        branding.name === 'DEFAULT' 
          ? "dark:hover:bg-white dark:hover:text-black" 
          : branding.hover
      )}
    >
      {branding.iconType === 'amazon' && <FaAmazon size={20} />}
      {branding.iconType === 'shopping-cart' && <FaShoppingCart size={20} />}
      {branding.iconType === 'shopping-bag' && <FaShoppingBag size={20} />}
      Shop on {store || (branding.name === 'DEFAULT' ? 'Merchant' : branding.name)}
    </a>
  );
}
