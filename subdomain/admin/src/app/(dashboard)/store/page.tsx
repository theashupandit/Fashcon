'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Check, Sparkles, Store as StoreIcon } from 'lucide-react';
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
        emptyTitle: 'Products are coming soon',
        emptyMessage: 'Add products from the admin store to feature them here.',
        pinnedProductIds: [],
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
  const pinnedSet = useMemo(() => new Set(store.pinnedProductIds || []), [store.pinnedProductIds]);
  const pinnedProducts = products.filter((product) => pinnedSet.has(product._id));
  const availableProducts = products.filter((product) => !pinnedSet.has(product._id));

  const togglePinned = (productId: string) => {
    setSiteContent((current) => {
      const currentIds = current.content.home.store.pinnedProductIds || [];
      const exists = currentIds.includes(productId);
      return {
        ...current,
        content: {
          ...current.content,
          home: {
            ...current.content.home,
            store: {
              ...current.content.home.store,
              pinnedProductIds: exists
                ? currentIds.filter((id) => id !== productId)
                : [...currentIds, productId],
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
          <h1 className="text-4xl font-black tracking-tight">Store</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-2 max-w-2xl">
            Pin products from the catalog, add new ones, or leave the section empty and the public homepage will show the coming-soon state.
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
        <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Pinned Products</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {pinnedProducts.length > 0 ? (
              pinnedProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[var(--muted)] shrink-0">
                    <SafeImage src={product.media?.mainImage || '/placeholder.png'} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black uppercase tracking-tight truncate">{product.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{product.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest" onClick={() => togglePinned(product._id)}>
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-3">Products are coming soon</p>
                <p className="text-sm text-[var(--muted-foreground)]">{store.emptyMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

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
                  <button
                    key={product._id}
                    onClick={() => togglePinned(product._id)}
                    className="text-left rounded-3xl border border-[var(--border)] bg-[var(--background)] p-4 hover:border-[var(--primary)]/30 transition-all group"
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--muted)] relative mb-4">
                      <SafeImage src={product.media?.mainImage || '/placeholder.png'} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-tight line-clamp-2">{product.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{product.category}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                      Add to store
                    </span>
                  </button>
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
