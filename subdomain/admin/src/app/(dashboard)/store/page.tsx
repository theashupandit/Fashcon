'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

type Product = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  media?: {
    mainImage?: string;
  };
};

type SiteContentState = {
  content: {
    home: {
      store: {
        title: string;
        subtitle: string;
        emptyTitle: string;
        emptyMessage: string;
        pinnedProductIds: string[];
        pinnedProductIdsRow2: string[];
      };
    };
  };
};

const fallbackState: SiteContentState = {
  content: {
    home: {
      store: {
        title: 'Shop the Trends',
        subtitle: 'The most loved pieces this week',
        emptyTitle: 'Coming Soon',
        emptyMessage: 'Our latest collection is currently being curated.',
        pinnedProductIds: [],
        pinnedProductIdsRow2: [],
      },
    },
  },
};

export default function StorePage() {
  const [siteContent, setSiteContent] = useState<SiteContentState>(fallbackState);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, productsRes] = await Promise.all([
          fetch('/api/site-content'),
          fetch('/api/products?status=published'),
        ]);

        const contentData = await contentRes.json();
        const productData = await productsRes.json();

        setSiteContent(contentData?.content ? contentData : fallbackState);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        toast.error('Failed to load store data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const store = siteContent.content.home.store;
  
  // Ensure array
  const row1Ids = store.pinnedProductIds || [];
  const row2Ids = store.pinnedProductIdsRow2 || [];

  const pinnedSetRow1 = useMemo(() => new Set(row1Ids), [row1Ids]);
  const pinnedSetRow2 = useMemo(() => new Set(row2Ids), [row2Ids]);

  const pinnedProductsRow1 = products.filter((product) => pinnedSetRow1.has(product._id));
  const pinnedProductsRow2 = products.filter((product) => pinnedSetRow2.has(product._id));
  
  const availableProducts = products.filter(
    (product) => !pinnedSetRow1.has(product._id) && !pinnedSetRow2.has(product._id)
  );

  const togglePinned = (productId: string, row: 1 | 2) => {
    setSiteContent((current) => {
      const currentStore = current.content.home.store;
      let r1 = currentStore.pinnedProductIds || [];
      let r2 = currentStore.pinnedProductIdsRow2 || [];

      // If adding to row 1, remove from row 2 (and vice versa) to prevent duplicates
      if (row === 1) {
        if (r1.includes(productId)) {
          r1 = r1.filter(id => id !== productId);
        } else {
          r1 = [...r1, productId];
          r2 = r2.filter(id => id !== productId);
        }
      } else {
        if (r2.includes(productId)) {
          r2 = r2.filter(id => id !== productId);
        } else {
          r2 = [...r2, productId];
          r1 = r1.filter(id => id !== productId);
        }
      }

      return {
        ...current,
        content: {
          ...current.content,
          home: {
            ...current.content.home,
            store: {
              ...currentStore,
              pinnedProductIds: r1,
              pinnedProductIdsRow2: r2,
            },
          },
        },
      };
    });
  };

  const saveStore = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { home: { store } } }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save store settings');
      }

      toast.success('Store settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Store Sliders</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-2 max-w-2xl">
            Pin products from the catalog into two separate sliding rows. Leave both empty and the public homepage will show the coming-soon state.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest">
            <Link href="/products/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button onClick={saveStore} disabled={saving} className="h-11 px-6 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Store
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Upper Line (Row 1)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {pinnedProductsRow1.length > 0 ? (
                pinnedProductsRow1.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[var(--muted)] shrink-0">
                      <SafeImage src={product.media?.mainImage || '/placeholder.png'} alt={product.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black uppercase tracking-tight truncate">{product.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{product.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600" onClick={() => togglePinned(product._id, 1)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-3">No Products Pinned</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Add products to this upper slider.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Bottom Line (Row 2)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {pinnedProductsRow2.length > 0 ? (
                pinnedProductsRow2.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[var(--muted)] shrink-0">
                      <SafeImage src={product.media?.mainImage || '/placeholder.png'} alt={product.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black uppercase tracking-tight truncate">{product.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{product.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600" onClick={() => togglePinned(product._id, 2)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-3">No Products Pinned</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Add products to this bottom slider.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Add From List</CardTitle>
              <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Choose published products to feature on the homepage.</p>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
              {availableProducts.length} Available
            </Badge>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {availableProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--background)] p-4 hover:border-[var(--primary)]/30 transition-all group"
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--muted)] relative mb-4">
                      <SafeImage src={product.media?.mainImage || '/placeholder.png'} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-tight line-clamp-2">{product.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1 mb-4 flex-1">{product.category}</p>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => togglePinned(product._id, 1)} variant="secondary" size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-8 px-0">
                        <ArrowUp className="w-3 h-3 mr-1" /> Upper
                      </Button>
                      <Button onClick={() => togglePinned(product._id, 2)} variant="secondary" size="sm" className="flex-1 text-[9px] font-black uppercase tracking-widest h-8 px-0">
                        <ArrowDown className="w-3 h-3 mr-1" /> Bottom
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-lg font-black uppercase tracking-tight mb-2">No published products yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-5">Create a product first, then pin it here for the home store section.</p>
                <Button asChild className="rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px]">
                  <Link href="/products/add">Add Product</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
