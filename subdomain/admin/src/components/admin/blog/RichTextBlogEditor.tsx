'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Image as ImageIcon, Tag, Loader2, Globe, Eye,
  ShoppingBag, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Plus, X
} from 'lucide-react';
import { createBlog, updateBlog } from '@/app/actions/blogs';
import { getCategories, createCategory } from '@/app/actions/categories';
import { generateBlogTags, generateBlogExcerpt, generateBlogCardInfo } from '@/app/actions/ai';
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
  const [productPickerTarget, setProductPickerTarget] = useState<'content' | 'ads' | null>(null);
  const [showSEO, setShowSEO] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const draftIdRef = useRef<string | null>(blogId || null);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', cardInfo: '', category: 'Fashion', subCategory: [] as string[], author: 'Admin',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduledAt: '', metaDescription: '', keywords: [] as string[],
    tags: [] as string[],
    bottomBannerTitle: '',
    bottomBannerSubtitle: '',
    bottomBannerButtonText: '',
    bottomBannerButtonUrl: '',
  });
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [bottomBannerImage, setBottomBannerImage] = useState<string | null>(null);
  const [productCards, setProductCards] = useState<ProductCard[]>([]);
  const [adProducts, setAdProducts] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Category and Subcategory creation states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
  const [isGeneratingCardInfo, setIsGeneratingCardInfo] = useState(false);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '', slug: initialData.slug || '',
        excerpt: initialData.excerpt || '', cardInfo: initialData.cardInfo || '',
        category: initialData.category || 'Fashion',
        subCategory: initialData.subCategory || [],
        author: initialData.author || 'Admin', status: initialData.status || 'draft',
        scheduledAt: initialData.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
        metaDescription: initialData.metaDescription || '',
        keywords: initialData.keywords || [], tags: initialData.tags || [],
        bottomBannerTitle: initialData.bottomBannerTitle || '',
        bottomBannerSubtitle: initialData.bottomBannerSubtitle || '',
        bottomBannerButtonText: initialData.bottomBannerButtonText || '',
        bottomBannerButtonUrl: initialData.bottomBannerButtonUrl || '',
      });
      setContent(initialData.content || '');
      setCoverImage(initialData.image || initialData.coverImage || null);
      setThumbnailImage(initialData.thumbnailImage || null);
      setHeaderImage(initialData.headerImage || null);
      setBottomBannerImage(initialData.bottomBannerImage || null);
      setProductCards(initialData.productCards || []);
      setAdProducts(initialData.adProducts || []);
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
  }, [formData, content, coverImage, productCards, adProducts]);

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
    excerpt: formData.excerpt, cardInfo: formData.cardInfo, category: formData.category, subCategory: formData.subCategory, author: formData.author,
    status: status || formData.status,
    scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
    blogType: 'richtext', content,
    coverImage: coverImage || '', image: coverImage || '', 
    thumbnailImage: thumbnailImage || '', headerImage: headerImage || '',
    metaDescription: formData.metaDescription, keywords: formData.keywords,
    tags: formData.tags, productCards, adProducts,
    bottomBannerImage: bottomBannerImage || '',
    bottomBannerTitle: formData.bottomBannerTitle,
    bottomBannerSubtitle: formData.bottomBannerSubtitle,
    bottomBannerButtonText: formData.bottomBannerButtonText,
    bottomBannerButtonUrl: formData.bottomBannerButtonUrl,
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
    setProductPickerTarget(null);
    toast.success(`${product.title} added`);
  };

  const removeProductCard = (idx: number) => {
    setProductCards(prev => prev.filter((_, i) => i !== idx));
  };

  const convertSectionsToRichText = () => {
    if (!initialData?.sections || initialData.sections.length === 0) return;
    
    let html = '';
    initialData.sections.forEach((sec: any, idx: number) => {
      // Step Title
      html += `<h2>${sec.title || `Step ${idx + 1}`}</h2>`;
      
      // Step Image
      if (sec.image) {
        html += `<p><img src="${sec.image}" alt="${sec.title || 'Step Image'}" style="max-width:100%; height:auto; border-radius:16px; margin: 16px 0;" /></p>`;
      }
      
      // Step Description
      if (sec.description) {
        html += `<p>${sec.description.replace(/\n/g, '<br />')}</p>`;
      }
      
      // Step Quote
      if (sec.summary) {
        html += `<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; font-style: italic; margin: 16px 0;">${sec.summary}</blockquote>`;
      }
      
      // Attached Product block
      if (sec.product) {
        html += `<div data-product-card="${sec.product.productId || sec.productId || ''}" class="product-card-embed" contenteditable="false" style="border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin:24px 0;display:flex;gap:16px;align-items:center;background:#fafafa;">
          <img src="${sec.product.image || sec.image || ''}" alt="${sec.product.title}" style="width:80px;height:80px;object-fit:cover;border-radius:12px;" />
          <div style="flex:1;">
            <p style="font-size:10px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;margin:0;">${sec.product.brand || sec.ctaStore || ''}</p>
            <p style="font-weight:700;font-size:14px;margin:4px 0 2px;">${sec.product.title}</p>
            <p style="font-weight:900;color:#e53e3e;font-size:14px;margin:0;">₹${sec.product.price ? sec.product.price.toLocaleString() : ''}</p>
          </div>
          <a href="${sec.ctaUrl || sec.product.affiliateLink || '#'}" style="background:#000;color:#fff;padding:8px 16px;border-radius:99px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;">${sec.ctaLabel || 'Shop Now'}</a>
        </div>`;
      } else if (sec.ctaUrl && sec.ctaUrl !== '#') {
        // Just standard CTA link button
        html += `<p style="margin: 16px 0;"><a href="${sec.ctaUrl}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:99px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;">${sec.ctaLabel || 'Shop Now'} at ${sec.ctaStore || 'Store'}</a></p>`;
      }
      
      html += `<hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />`;
    });
    
    setContent(html);
    toast.success("Successfully converted infographic steps to Rich Text content!");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const newCat = await createCategory({
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        type: 'blog'
      });
      const cats = await getCategories('blog');
      setCategories(cats);
      setFormData(prev => ({ ...prev, category: newCat.name, subCategory: [] }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      toast.success('Category created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) return;
    setIsCreatingSubcategory(true);
    try {
      const newCat = await createCategory({
        name: newSubcategoryName.trim(),
        slug: newSubcategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        type: 'blog',
        parentCategory: formData.category
      });
      const cats = await getCategories('blog');
      setCategories(cats);
      setFormData(prev => ({
        ...prev,
        subCategory: [...(prev.subCategory || []), newCat.name]
      }));
      setIsAddingSubcategory(false);
      setNewSubcategoryName('');
      toast.success('Subcategory created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create subcategory');
    } finally {
      setIsCreatingSubcategory(false);
    }
  };

  const handleGenerateTags = async () => {
    setIsGeneratingTags(true);
    toast.loading("AI is generating taxonomy tags...", { id: "tags-ai" });
    try {
      const contentText = content.replace(/<[^>]*>/g, ' ');
      const generated = await generateBlogTags(formData.title, contentText);
      if (Array.isArray(generated) && generated.length > 0) {
        const newTags = generated.filter((t: string) => !formData.tags.includes(t));
        if (newTags.length > 0) {
          setFormData(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
          toast.success(`AI added ${newTags.length} tags!`, { id: "tags-ai" });
        } else {
          toast.info("AI suggested tags that already exist.", { id: "tags-ai" });
        }
      } else {
        toast.error("AI did not return any tags", { id: "tags-ai" });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate tags with AI", { id: "tags-ai" });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleGenerateExcerpt = async () => {
    if (!formData.title) {
      toast.error("Please enter a headline first to generate excerpt");
      return;
    }
    setIsGeneratingExcerpt(true);
    toast.loading("AI is generating excerpt...", { id: "excerpt-ai" });
    try {
      const contentText = content.replace(/<[^>]*>/g, ' ');
      const excerpt = await generateBlogExcerpt(formData.title, contentText);
      setFormData(prev => ({ ...prev, excerpt }));
      toast.success("Excerpt generated successfully!", { id: "excerpt-ai" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate excerpt with AI", { id: "excerpt-ai" });
    } finally {
      setIsGeneratingExcerpt(false);
    }
  };

  const handleGenerateCardInfo = async () => {
    if (!formData.title) {
      toast.error("Please enter a headline first to generate card content");
      return;
    }
    setIsGeneratingCardInfo(true);
    toast.loading("AI is generating card content...", { id: "card-ai" });
    try {
      const contentText = content.replace(/<[^>]*>/g, ' ');
      const cardInfo = await generateBlogCardInfo(formData.title, contentText);
      setFormData(prev => ({ ...prev, cardInfo }));
      toast.success("Card content generated successfully!", { id: "card-ai" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate card content with AI", { id: "card-ai" });
    } finally {
      setIsGeneratingCardInfo(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 pb-20">
      {/* Import / Conversion Alert for Infographic Data */}
      {initialData?.sections && initialData.sections.length > 0 && !content && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-bold text-purple-200">Convert Infographic to Rich Text</p>
              <p className="text-[10px] text-purple-300/70 mt-0.5">We found {initialData.sections.length} infographic steps in this blog. You can automatically convert them into formatted rich text paragraphs, images, and product widgets.</p>
            </div>
          </div>
          <Button 
            onClick={convertSectionsToRichText}
            className="bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl shrink-0 shadow-lg shadow-purple-600/20"
          >
            Convert Now
          </Button>
        </div>
      )}

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
                    <Button variant="ghost" size="sm" onClick={() => setProductPickerTarget('content')} className="h-7 px-2 text-[9px] font-black uppercase tracking-widest rounded-lg gap-1 opacity-60 hover:opacity-100 hover:bg-[var(--primary)]/10">
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

          {/* Ad Products (Below Blog) */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Product Ads Below Article</h3>
                <p className="text-[10px] opacity-40">Choose up to 6 custom product recommendations/ads to display at the bottom of this blog post.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setProductPickerTarget('ads')} 
                className="h-8 text-[10px] font-black uppercase tracking-widest gap-1.5 border-[var(--border)] hover:bg-[var(--primary)]/5 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ad Product
              </Button>
            </div>
            
            {adProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adProducts.map((pc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] group relative">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--muted)] relative shrink-0">
                      <SafeImage src={pc.image} alt={pc.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-[11px] font-bold truncate leading-snug">{pc.title}</p>
                      <p className="text-[9px] opacity-45 uppercase tracking-wider font-semibold">{pc.brand}</p>
                      {pc.price && (
                        <p className="text-[10px] font-black text-[var(--primary)]">₹{pc.price.toLocaleString()}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setAdProducts(prev => prev.filter((_, i) => i !== idx))} 
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded-lg transition-all"
                      title="Remove Ad"
                    >
                      <X className="w-3.5 h-3.5 animate-fade-in" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 border border-dashed border-[var(--border)] rounded-xl opacity-40">
                <ShoppingBag className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No custom ads added. Default trending products will be shown.</span>
              </div>
            )}
          </Card>

          {/* Bottom Banner Section */}
          <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Bottom Banner</h3>
              <p className="text-[10px] opacity-40">Customize the horizontal banner advertisement displayed at the bottom of the article.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Banner Subtitle (Spotlight)</Label>
                  <Input 
                    value={formData.bottomBannerSubtitle} 
                    onChange={(e) => setFormData(p => ({ ...p, bottomBannerSubtitle: e.target.value }))}
                    placeholder="e.g. Seasonal Spotlight" 
                    className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Banner Title</Label>
                  <Input 
                    value={formData.bottomBannerTitle} 
                    onChange={(e) => setFormData(p => ({ ...p, bottomBannerTitle: e.target.value }))}
                    placeholder="e.g. Curate Your 2026 Wardrobe" 
                    className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Button Label</Label>
                  <Input 
                    value={formData.bottomBannerButtonText} 
                    onChange={(e) => setFormData(p => ({ ...p, bottomBannerButtonText: e.target.value }))}
                    placeholder="e.g. View New Arrivals" 
                    className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Redirect Destination URL / Slug</Label>
                  <Input 
                    value={formData.bottomBannerButtonUrl} 
                    onChange={(e) => setFormData(p => ({ ...p, bottomBannerButtonUrl: e.target.value }))}
                    placeholder="e.g. /shop, https://amazon.com/... or a product slug" 
                    className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Banner Background Image</Label>
              {bottomBannerImage ? (
                <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden group border border-[var(--border)]">
                  <SafeImage src={bottomBannerImage} alt="Bottom Banner" fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button onClick={() => setShowMediaPicker({ open: true, field: 'bottomBanner' })} size="sm" variant="outline" className="bg-white/90 text-black text-[9px] font-black uppercase rounded-lg">Change Image</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowMediaPicker({ open: true, field: 'bottomBanner' })} className="w-full aspect-[21/9] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--primary)]/30 transition-all">
                  <ImageIcon className="w-5 h-5 opacity-10" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Add Banner Background Image</span>
                </button>
              )}
            </div>
          </Card>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 block">Category</Label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAddingCategory(!isAddingCategory);
                        if (isAddingCategory) setNewCategoryName('');
                      }}
                      className="text-[8px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline"
                    >
                      {isAddingCategory ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                  {isAddingCategory ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name..."
                        className="h-8 flex-1 rounded-lg bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                      />
                      <Button 
                        type="button"
                        disabled={!newCategoryName.trim() || isCreatingCategory}
                        onClick={handleCreateCategory}
                        className="h-8 px-3 rounded-lg bg-[var(--primary)] text-white font-black uppercase text-[8px] tracking-wider"
                      >
                        {isCreatingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                      </Button>
                    </div>
                  ) : (
                    <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v || p.category, subCategory: [] }))}>
                      <SelectTrigger className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => !cat.parentCategory).map(c => <SelectItem key={c._id || c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {formData.category && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 block">Sub Category</Label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsAddingSubcategory(!isAddingSubcategory);
                          if (isAddingSubcategory) setNewSubcategoryName('');
                        }}
                        className="text-[8px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline"
                      >
                        {isAddingSubcategory ? 'Cancel' : '+ New'}
                      </button>
                    </div>
                    {isAddingSubcategory ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          placeholder="Subcategory name..."
                          className="h-8 flex-1 rounded-lg bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSubcategory())}
                        />
                        <Button 
                          type="button"
                          disabled={!newSubcategoryName.trim() || isCreatingSubcategory}
                          onClick={handleCreateSubcategory}
                          className="h-8 px-3 rounded-lg bg-[var(--primary)] text-white font-black uppercase text-[8px] tracking-wider"
                        >
                          {isCreatingSubcategory ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {(formData.subCategory || []).map((sub: string) => (
                            <Badge key={sub} className="bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] px-1.5 py-0.5 rounded gap-1 group">
                              <span className="text-[8px] font-bold uppercase">{sub}</span>
                              <span className="cursor-pointer opacity-40 hover:opacity-100 font-bold" onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  subCategory: (prev.subCategory || []).filter(s => s !== sub)
                                }));
                              }}>×</span>
                            </Badge>
                          ))}
                        </div>
                        <Select 
                          value="" 
                          onValueChange={(val) => {
                            if (val && !(formData.subCategory || []).includes(val)) {
                                setFormData(prev => ({
                                  ...prev,
                                  subCategory: [...(prev.subCategory || []), val]
                                }));
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]">
                            <SelectValue placeholder="Add Sub Categories..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(cat => cat.parentCategory === formData.category).map(cat => {
                              if ((formData.subCategory || []).includes(cat.name)) return null;
                              return (
                                <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                              );
                            })}
                            {categories.filter(cat => cat.parentCategory === formData.category).length === 0 && (
                              <div className="p-3 text-xs text-center text-[var(--muted-foreground)]">No subcategories yet.</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
               <div>
                 <Label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Author</Label>
                 <Input value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                   className="h-9 rounded-xl border-[var(--border)] text-[11px] font-bold bg-[var(--background)]" />
               </div>
             </div>
           </Card>
 
           {/* Excerpt */}
            <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Excerpt</p>
                <button 
                  type="button" 
                  onClick={handleGenerateExcerpt}
                  disabled={isGeneratingExcerpt}
                  className="text-[8px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                >
                  {isGeneratingExcerpt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                  Generate
                </button>
              </div>
              <Textarea value={formData.excerpt} onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="Brief summary for listings..." rows={3} className="border-[var(--border)] rounded-xl text-[12px] font-medium bg-[var(--background)] resize-none" />
            </Card>
  
            {/* Blog Card Info (Pull Drawer Content) */}
            <Card className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Blog Card Drawer Content</p>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] tracking-widest shrink-0">Boutique Card</span>
                  <button 
                    type="button" 
                    onClick={handleGenerateCardInfo}
                    disabled={isGeneratingCardInfo}
                    className="text-[8px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                  >
                    {isGeneratingCardInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    Generate
                  </button>
                </div>
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
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Tags</p>
                <button 
                  type="button" 
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags}
                  className="text-[8px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                >
                  {isGeneratingTags ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                  AI Tags
                </button>
              </div>
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
               <Button variant="outline" onClick={() => setProductPickerTarget('content')} className="w-full h-9 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-widest gap-2 justify-start">
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
           else if (showMediaPicker.field === 'bottomBanner') setBottomBannerImage(asset.url);
           else if (showMediaPicker.field === 'inline') {
             setContent(prev => prev + `<img src="${asset.url}" alt="${asset.name}" style="width:100%;border-radius:16px;margin:24px 0;" />`);
           }
           setShowMediaPicker({ open: false, field: '' });
         }}
       />
       <ProductPickerModal 
         isOpen={productPickerTarget !== null} 
         onClose={() => setProductPickerTarget(null)} 
         onSelect={(product) => {
           if (productPickerTarget === 'ads') {
             setAdProducts(prev => [...prev, product]);
             toast.success(`${product.title} added to ads`);
             setProductPickerTarget(null);
           } else {
             insertProductCard(product);
           }
         }} 
       />
       <SEOPanel isOpen={showSEO} onClose={() => setShowSEO(false)}
         title={formData.title} slug={formData.slug} metaDescription={formData.metaDescription}
         keywords={formData.keywords} content={content} excerpt={formData.excerpt} coverImage={coverImage || ''}
         onMetaDescriptionChange={(v) => setFormData(p => ({ ...p, metaDescription: v }))}
         onKeywordsChange={(v) => setFormData(p => ({ ...p, keywords: v }))}
       />
      </motion.div>
   );
}
