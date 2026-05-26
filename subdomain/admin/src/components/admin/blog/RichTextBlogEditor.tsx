'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Image as ImageIcon, Tag, Loader2, Globe, Eye,
  ShoppingBag, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { createBlog, updateBlog } from '@/app/actions/blogs';
import { getCategories } from '@/app/actions/categories';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/text-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MediaPickerModal, LexicalEditor } from '@/components/admin';
import ProductPickerModal from './ProductPickerModal';
import SEOPanel from './SEOPanel';
import { motion, AnimatePresence } from 'framer-motion';
import slugify from 'slugify';

interface ProductCard {
  productId: string; title: string; brand: string; image: string;
  price: number; originalPrice: number; affiliateLink: string;
  ctaText: string; variantName?: string; variantColor?: string; clicks: number;
}

interface RichTextBlogEditorProps {
  mode: 'new' | 'edit';
  blogId?: string;
  initialData?: any;
}

export default function RichTextBlogEditor({ mode, blogId, initialData }: RichTextBlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState<{ open: boolean; field: string }>({ open: false, field: '' });
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const draftIdRef = useRef<string | null>(blogId || null);

  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', cardInfo: '', category: 'Fashion', author: 'Admin',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduledAt: '', metaDescription: '', keywords: [] as string[],
    tags: [] as string[],
  });
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [productCards, setProductCards] = useState<ProductCard[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '', slug: initialData.slug || '',
        excerpt: initialData.excerpt || '', cardInfo: initialData.cardInfo || '',
        category: initialData.category || 'Fashion',
        author: initialData.author || 'Admin', status: initialData.status || 'draft',
        scheduledAt: initialData.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
        metaDescription: initialData.metaDescription || '',
        keywords: initialData.keywords || [], tags: initialData.tags || [],
      });
      setContent(initialData.content || '');
      setCoverImage(initialData.image || initialData.coverImage || null);
      setThumbnailImage(initialData.thumbnailImage || null);
      setHeaderImage(initialData.headerImage || null);
      setProductCards(initialData.productCards || []);
      setAutoSlug(false);
    }
  }, [initialData]);

  useEffect(() => {
    getCategories('blog').then(setCategories).catch(() => { });
  }, []);

  // Auto-slug
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title, { lower: true, strict: true }) }));
    }
  }, [formData.title, autoSlug]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (formData.title && content) handleAutoSave();
    }, 30000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, content, coverImage, productCards]);

  const handleAutoSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = buildPayload('draft');
      if (draftIdRef.current) {
        await fetch(`/api/blogs/${draftIdRef.current}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        const res = await fetch('/api/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data._id) draftIdRef.current = data._id;
      }
      setLastSaved(new Date());
    } catch { /* silent */ } finally { setIsSaving(false); }
  };

  const buildPayload = (status?: string) => ({
    title: formData.title,
    slug: formData.slug || slugify(formData.title, { lower: true, strict: true }),
    excerpt: formData.excerpt, cardInfo: formData.cardInfo, category: formData.category, author: formData.author,
    status: status || formData.status,
    scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
    blogType: 'richtext', content,
    coverImage: coverImage || '', image: coverImage || '', 
    thumbnailImage: thumbnailImage || '', headerImage: headerImage || '',
    metaDescription: formData.metaDescription, keywords: formData.keywords,
    tags: formData.tags, productCards,
  });

  const handleSubmit = async (publishStatus: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title) { toast.error('Title is required'); return; }
    if (publishStatus === 'scheduled' && !formData.scheduledAt) { toast.error('Set a scheduled date'); return; }
    setLoading(true);
    try {
      const payload = buildPayload(publishStatus);
      if (mode === 'edit' && blogId) {
        await updateBlog(blogId, payload);
        toast.success('Article updated');
      } else if (draftIdRef.current && mode === 'new') {
        await fetch(`/api/blogs/${draftIdRef.current}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        toast.success('Article saved');
      } else {
        const blog = await createBlog(payload);
        draftIdRef.current = blog._id;
        toast.success('Article created');
      }
      router.push('/blogs');
    } catch { toast.error('Failed to save'); } finally { setLoading(false); }
  };

  const insertProductCard = (product: ProductCard) => {
    setProductCards(prev => [...prev, product]);
    const cardHtml = `<div data-product-card="${product.productId}" class="product-card-embed" contenteditable="false" style="border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin:24px 0;display:flex;gap:16px;align-items:center;background:#fafafa;">
      <img src="${product.image}" alt="${product.title}" style="width:80px;height:80px;object-fit:cover;border-radius:12px;" />
      <div style="flex:1;">
        <p style="font-size:10px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;margin:0;">${product.brand}</p>
        <p style="font-weight:700;font-size:14px;margin:4px 0 2px;">${product.title}${product.variantName ? ` — ${product.variantName}` : ''}</p>
        <p style="font-weight:900;color:#e53e3e;font-size:14px;margin:0;">₹${product.price.toLocaleString()} <span style="text-decoration:line-through;opacity:0.3;color:#000;">₹${product.originalPrice.toLocaleString()}</span></p>
      </div>
      <a href="${product.affiliateLink}" style="background:#000;color:#fff;padding:8px 16px;border-radius:99px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;">${product.ctaText}</a>
    </div>`;
    setContent(prev => prev + cardHtml);
    setShowProductPicker(false);
    toast.success(`${product.title} added`);
  };

  const removeProductCard = (idx: number) => {
    setProductCards(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild><Link href="/blogs"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">{mode === 'edit' ? 'Edit' : 'New'} <span className="opacity-40">Article</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-1.5 py-0 text-[9px]">Rich Text</Badge>
              {lastSaved && (<span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Auto-saved {lastSaved.toLocaleTimeString()}</span>)}
              {isSaving && (<span className="flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...</span>)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSEO(true)} className="h-10 px-4 rounded-xl border-[var(--border)] gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all">
            <Globe className="w-4 h-4 text-emerald-500" /> SEO
          </Button>
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={loading} className="h-10 px-5 rounded-xl border-[var(--border)] gap-2 text-[10px] font-black uppercase tracking-widest">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button onClick={() => handleSubmit(formData.scheduledAt ? 'scheduled' : 'published')} disabled={loading} className="h-10 px-6 rounded-xl bg-[var(--foreground)] text-[var(--background)] gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {formData.scheduledAt ? 'Schedule' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-4">
            <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Your article headline..." className="text-2xl font-black border-none bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:opacity-20 tracking-tight" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30 shrink-0">SLUG</span>
              <Input value={formData.slug} onChange={(e) => { setAutoSlug(false); setFormData(p => ({ ...p, slug: e.target.value })); }}
                spellCheck={false}
                className="flex-1 h-7 text-[11px] font-mono border-[var(--border)] rounded-lg bg-[var(--background)] px-2" />
              <Button variant="ghost" size="sm" onClick={() => { setAutoSlug(true); setFormData(p => ({ ...p, slug: slugify(p.title, { lower: true, strict: true }) })); }}
                className={cn("h-7 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg", autoSlug ? "text-[var(--primary)]" : "opacity-40")}>Auto</Button>
            </div>
          </Card>

          {/* Cover Image */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl overflow-hidden">
            {coverImage ? (
              <div className="relative aspect-[21/9] group">
                <SafeImage src={coverImage} alt="Cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button onClick={() => setShowMediaPicker({ open: true, field: 'cover' })} variant="outline" className="bg-white/90 text-black font-black text-[10px] uppercase tracking-widest rounded-xl">Change Cover</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowMediaPicker({ open: true, field: 'cover' })} className="w-full aspect-[21/9] flex flex-col items-center justify-center gap-3 bg-[var(--muted)]/30 hover:bg-[var(--primary)]/5 transition-all border-b border-[var(--border)]">
                <ImageIcon className="w-8 h-8 opacity-10" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Add Cover Image</span>
              </button>
            )}
          </Card>

          {/* Lexical Editor */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-sm relative z-[10]">
            <div className="min-h-[600px]">
              <LexicalEditor 
                content={content} 
                onChange={setContent} 
                placeholder="Start writing your high-fidelity article here..." 
                customActions={
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setShowMediaPicker({ open: true, field: 'inline' })} className="h-7 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg gap-1 opacity-60 hover:opacity-100 hover:bg-[var(--primary)]/10">
                      <ImageIcon className="w-3.5 h-3.5" /> Image
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowProductPicker(true)} className="h-7 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg gap-1 opacity-60 hover:opacity-100 hover:bg-[var(--primary)]/10">
                      <ShoppingBag className="w-3.5 h-3.5" /> Product
                    </Button>
                  </>
                }
              />
            </div>
          </Card>

          {/* Embedded Products */}
          {productCards.length > 0 && (
            <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3">Embedded Products ({productCards.length})</p>
              <div className="space-y-2">
                {productCards.map((pc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--muted)] relative shrink-0">
                      <SafeImage src={pc.image} alt={pc.title} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate">{pc.title}</p>
                      <p className="text-[9px] opacity-40">{pc.brand} · ₹{pc.price.toLocaleString()} · {pc.clicks} clicks</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeProductCard(idx)} className="h-6 px-2 text-[9px] text-red-500 hover:bg-red-500/10 rounded-lg">Remove</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish Settings */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Publishing</p>
            <div className="space-y-3">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent>
                </Select>
              </div>
              {(formData.status === 'scheduled' || formData.scheduledAt) && (
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Schedule Date</Label>
                  <Input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData(p => ({ ...p, scheduledAt: e.target.value, status: 'scheduled' }))}
                    className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]" />
                </div>
              )}
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v || p.category }))}>
                  <SelectTrigger className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Fashion', 'Beauty', 'Lifestyle', 'Luxury Guides', 'Streetwear'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    {categories.map(c => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Author</Label>
                <Input value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                  className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]" />
              </div>
            </div>
          </Card>

          {/* Excerpt */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Excerpt</p>
            <Textarea value={formData.excerpt} onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="Brief summary for listings..." rows={3} className="border-[var(--border)] rounded-xl text-[12px] font-medium bg-[var(--background)] resize-none" />
          </Card>

          {/* Blog Card Info (Pull Drawer Content) */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Blog Card Drawer Content</p>
              <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] tracking-widest shrink-0">Boutique Card</span>
            </div>
            <Textarea value={formData.cardInfo} onChange={(e) => setFormData(p => ({ ...p, cardInfo: e.target.value }))}
              placeholder="Detailed spec description to show in the sliding pull-out card drawer..." rows={4} className="border-[var(--border)] rounded-xl text-[12px] font-medium bg-[var(--background)] resize-none" />
          </Card>

          {/* Thumbnail Image */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Thumbnail Image</p>
            {thumbnailImage ? (
              <div className="relative aspect-square w-24 rounded-xl overflow-hidden group">
                <SafeImage src={thumbnailImage} alt="Thumbnail" fill className="object-cover" sizes="100px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button onClick={() => setShowMediaPicker({ open: true, field: 'thumbnail' })} size="sm" variant="outline" className="bg-white/90 text-black text-[9px] font-black uppercase rounded-lg">Change</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowMediaPicker({ open: true, field: 'thumbnail' })} className="w-full aspect-video rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--primary)]/30 transition-all">
                <ImageIcon className="w-5 h-5 opacity-10" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Add Thumbnail</span>
              </button>
            )}
          </Card>

          {/* Header Image */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Header Background</p>
            {headerImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden group">
                <SafeImage src={headerImage} alt="Header" fill className="object-cover" sizes="300px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button onClick={() => setShowMediaPicker({ open: true, field: 'header' })} size="sm" variant="outline" className="bg-white/90 text-black text-[9px] font-black uppercase rounded-lg">Change</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowMediaPicker({ open: true, field: 'header' })} className="w-full aspect-video rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--primary)]/30 transition-all">
                <ImageIcon className="w-5 h-5 opacity-10" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Add Header</span>
              </button>
            )}
          </Card>

          {/* Tags */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Tags</p>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const t = tagInput.trim(); if (t && !formData.tags.includes(t)) setFormData(p => ({ ...p, tags: [...p.tags, t] })); setTagInput(''); } }}
                placeholder="Add tag..." className="flex-1 h-8 rounded-lg border-[var(--border)] text-[11px] font-bold bg-[var(--background)]" />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map(t => (
                  <Badge key={t} variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-[var(--border)] gap-1">
                    {t}
                    <button onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="opacity-40 hover:opacity-100">×</button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Quick Actions</p>
            <div className="space-y-2">
              <Button variant="outline" onClick={() => setShowProductPicker(true)} className="w-full h-9 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-widest gap-2 justify-start">
                <ShoppingBag className="w-3.5 h-3.5 text-[var(--primary)]" /> Insert Product Card
              </Button>
              <Button variant="outline" onClick={() => setShowMediaPicker({ open: true, field: 'inline' })} className="w-full h-9 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-widest gap-2 justify-start">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Add Lookbook Image
              </Button>
              <Button variant="outline" onClick={() => setShowSEO(true)} className="w-full h-9 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-widest gap-2 justify-start">
                <Globe className="w-3.5 h-3.5 text-emerald-500" /> SEO Health Check
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <MediaPickerModal isOpen={showMediaPicker.open} onClose={() => setShowMediaPicker({ open: false, field: '' })}
        onSelect={(assets) => {
          const asset = assets[0];
          if (!asset) return;
          
          if (showMediaPicker.field === 'cover') setCoverImage(asset.url);
          else if (showMediaPicker.field === 'thumbnail') setThumbnailImage(asset.url);
          else if (showMediaPicker.field === 'header') setHeaderImage(asset.url);
          else if (showMediaPicker.field === 'inline') {
            setContent(prev => prev + `<img src="${asset.url}" alt="${asset.name}" style="width:100%;border-radius:16px;margin:24px 0;" />`);
          }
          setShowMediaPicker({ open: false, field: '' });
        }}
      />
      <ProductPickerModal isOpen={showProductPicker} onClose={() => setShowProductPicker(false)} onSelect={insertProductCard} />
      <SEOPanel isOpen={showSEO} onClose={() => setShowSEO(false)}
        title={formData.title} slug={formData.slug} metaDescription={formData.metaDescription}
        keywords={formData.keywords} content={content} excerpt={formData.excerpt} coverImage={coverImage || ''}
        onMetaDescriptionChange={(v) => setFormData(p => ({ ...p, metaDescription: v }))}
        onKeywordsChange={(v) => setFormData(p => ({ ...p, keywords: v }))}
      />
    </motion.div>
  );
}
