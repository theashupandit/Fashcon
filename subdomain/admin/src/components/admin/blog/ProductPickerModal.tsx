'use client';

import React, { useState, useEffect } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { 
  X, Search, Loader2, Check, ShoppingBag, ChevronRight, Package
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { getProducts } from '@/app/actions/products';

interface ProductVariant {
  colorName: string;
  colorCode: string;
  variantImage: string;
  variantLink?: string;
  priceOverride?: number;
}

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  prices: { original: number; offer: number; discountPercentage: number };
  affiliate: { mainLink: string; platform: string };
  ctaText: string;
  media: { mainImage: string; gallery: string[] };
  variants: ProductVariant[];
  rating?: number;
  reviewsCount?: number;
}

interface SelectedProduct {
  productId: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  affiliateLink: string;
  ctaText: string;
  variantName?: string;
  variantColor?: string;
  clicks: number;
  rating?: number;
  reviewsCount?: number;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: SelectedProduct) => void;
}

export default function ProductPickerModal({ isOpen, onClose, onSelect }: ProductPickerModalProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProductId(null);
    setSelectedVariantIdx(null);
    setExpandedProduct(null);
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadProducts = async (search?: string) => {
    setLoading(true);
    try {
      const data = await getProducts({ limit: 50, search: search || searchQuery });
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    loadProducts(q);
  };

  const handleConfirm = () => {
    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    let image = product.media.mainImage;
    let price = product.prices.offer;
    let affiliateLink = product.affiliate.mainLink;
    let variantName: string | undefined;
    let variantColor: string | undefined;

    if (selectedVariantIdx !== null && product.variants[selectedVariantIdx]) {
      const v = product.variants[selectedVariantIdx];
      image = v.variantImage || image;
      price = v.priceOverride || price;
      affiliateLink = v.variantLink || affiliateLink;
      variantName = v.colorName;
      variantColor = v.colorCode;
    }

    onSelect({
      productId: product._id,
      title: product.title,
      brand: product.brand,
      image,
      price,
      originalPrice: product.prices.original,
      affiliateLink,
      ctaText: product.ctaText || 'Shop Now',
      variantName,
      variantColor,
      clicks: 0,
      rating: product.rating,
      reviewsCount: product.reviewsCount
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl">
        <DialogHeader className="p-4 border-b border-[var(--border)] shrink-0 bg-[var(--foreground)]/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight uppercase text-[var(--foreground)]">Insert Product Card</DialogTitle>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Select a product to embed</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-8 w-8 bg-[var(--foreground)]/5 border border-[var(--border)] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--primary)]/30" />
            <input 
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-[var(--background)] border border-[var(--border)] rounded-xl font-bold text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:border-[var(--primary)]/50 transition-all outline-none"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Loading product catalogue...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {products.map((product) => (
                <div key={product._id}>
                  <button
                    onClick={() => {
                      setSelectedProductId(product._id);
                      setSelectedVariantIdx(null);
                      setExpandedProduct(expandedProduct === product._id ? null : product._id);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-[var(--foreground)]/5",
                      selectedProductId === product._id && "bg-[var(--primary)]/5"
                    )}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--muted)]">
                      <SafeImage src={product.media.mainImage} alt={product.title} fill className="object-cover" sizes="56px" />
                      {selectedProductId === product._id && selectedVariantIdx === null && (
                        <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-[var(--primary)]" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate">{product.title}</p>
                      <p className="text-[10px] opacity-50 font-medium">{product.brand} · {product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] font-black text-[var(--primary)]">₹{product.prices.offer?.toLocaleString()}</span>
                        {product.prices.original > product.prices.offer && (
                          <span className="text-[10px] opacity-30 line-through">₹{product.prices.original?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {product.variants.length > 0 && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex -space-x-1">
                          {product.variants.slice(0, 4).map((v, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border-2 border-[var(--card)]" style={{ backgroundColor: v.colorCode }} />
                          ))}
                        </div>
                        <ChevronRight className={cn("w-3.5 h-3.5 opacity-30 transition-transform", expandedProduct === product._id && "rotate-90")} />
                      </div>
                    )}
                  </button>

                  {/* Variant Selection */}
                  {expandedProduct === product._id && product.variants.length > 0 && (
                    <div className="px-4 pb-4 pl-20 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="col-span-full text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Select Variant</p>
                      {product.variants.map((variant, vIdx) => (
                        <button
                          key={vIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductId(product._id);
                            setSelectedVariantIdx(vIdx);
                          }}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-xl border transition-all text-left",
                            selectedVariantIdx === vIdx
                              ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/20"
                              : "border-[var(--border)] hover:border-[var(--primary)]/30"
                          )}
                        >
                          <div className="w-5 h-5 rounded-full border border-[var(--border)] shrink-0" style={{ backgroundColor: variant.colorCode }} />
                          <span className="text-[10px] font-bold truncate">{variant.colorName}</span>
                          {selectedVariantIdx === vIdx && <Check className="w-3 h-3 text-[var(--primary)] ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Package className="w-8 h-8 opacity-10" />
              <p className="text-[9px] font-black uppercase tracking-widest opacity-30">No products found</p>
            </div>
          )}
        </div>

        <DialogFooter className="m-0 p-4 border-t border-[var(--border)] bg-[var(--foreground)]/[0.03] flex justify-between gap-2 shrink-0">
          <div className="text-[10px] opacity-40 font-medium self-center">
            {products.length} products available
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="font-bold text-[10px] h-8 px-4 uppercase tracking-widest rounded-lg">Cancel</Button>
            <Button 
              disabled={!selectedProductId}
              onClick={handleConfirm}
              className="h-8 px-6 bg-[var(--primary)] text-white hover:opacity-90 font-black uppercase tracking-widest text-[10px] rounded-lg shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-95 disabled:opacity-30"
            >
              Insert Product
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
