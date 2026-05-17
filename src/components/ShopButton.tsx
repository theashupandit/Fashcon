'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { recordClick } from '@/app/actions/storefront';

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

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center gap-3 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95"
    >
      <ShoppingBag size={20} />
      Shop on {store || 'Merchant'}
    </a>
  );
}
