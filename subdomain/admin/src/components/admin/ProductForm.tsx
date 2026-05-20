'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  Loader2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Undo2,
  Redo2
} from 'lucide-react';
import { toast } from 'sonner';
import { SafeImage } from "@/components/ui/SafeImage";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/text-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaPickerModal from './MediaPickerModal';
import { CropperModal } from './CropperModal';
import { productSchema, ProductFormValues } from '@/lib/validations/product';
import { getOptimizedUrl } from '@/lib/cloudinary';
import { compressImage } from '@/lib/compressImage';
import { createProductImageConfig, uploadImage, uploadImageFromUrl } from '@/lib/cloudinaryUpload';
import { uploadMultiple } from '@/lib/uploadMultiple';
import { cn } from '@/lib/utils';
import PageHeader from './PageHeader';

import { getCategories } from '@/app/actions/categories';
import { useAuth } from '@/lib/auth';
import { COLOR_MAP } from '@/lib/colorMap';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const SECTIONS = [
  { id: 'core', label: 'Core Details' },
  { id: 'pricing', label: 'Pricing & Affiliate' },
  { id: 'media', label: 'Media Gallery' },
  { id: 'variants', label: 'Variants' },
  { id: 'seo', label: 'SEO Config' }
];

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  title: string;
  isSubmitting: boolean;
  isDeleting?: boolean;
}

export function ProductForm({ initialData, onSubmit, onDelete, title, isSubmitting, isDeleting }: ProductFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('core');
  const [isSlugLocked, setIsSlugLocked] = useState(!!initialData?.slug);
  const [categories, setCategories] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState<{ open: boolean; target: 'main' | 'gallery' }>({
    open: false,
    target: 'main',
  });
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const [cropperState, setCropperState] = useState<{
    open: boolean;
    image: string;
    fieldName: string;
    config: any;
  }>({
    open: false,
    image: '',
    fieldName: '',
    config: null,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories('product');
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    }
    loadCategories();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      brand: initialData?.brand || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      collections: initialData?.collections || [],
      badge: initialData?.badge || 'None',
      status: initialData?.status || 'published',
      prices: initialData?.prices || { original: '', offer: '', currency: 'INR', showPricing: true, priceLabel: '' },
      affiliate: initialData?.affiliate || { mainLink: '', platform: 'Amazon', trackingId: '' },
      ctaText: initialData?.ctaText || '',
      media: initialData?.media || { mainImage: '', gallery: [], blurDataURL: '' },
      variants: initialData?.variants || [],
      seo: initialData?.seo || { metaTitle: '', metaDesc: '', keywords: [], canonicalUrl: '' },
      isFeatured: initialData?.isFeatured || false,
      rating: initialData?.rating || 4.5,
      reviewsCount: initialData?.reviewsCount || 0,
    },
  });

  // Undo/Redo State
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryAction, setIsHistoryAction] = useState(false);

  const watchAllFields = watch();

  // Initialize history
  useEffect(() => {
    if (initialData && history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(initialData))]);
      setHistoryIndex(0);
    } else if (!initialData && history.length === 0) {
      // For new products, set initial empty state
      setHistory([JSON.parse(JSON.stringify(watchAllFields))]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Track changes for Undo/Redo (Debounced)
  useEffect(() => {
    if (isHistoryAction) {
      setIsHistoryAction(false);
      return;
    }

    const timer = setTimeout(() => {
      const currentValues = watchAllFields;
      const lastValues = history[historyIndex];

      if (JSON.stringify(currentValues) !== JSON.stringify(lastValues)) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(currentValues)));

        if (newHistory.length > 50) {
          newHistory.shift();
          setHistoryIndex(newHistory.length - 1);
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        setHistory(newHistory);
      }
    }, 1200); // 1.2s debounce for performance

    return () => clearTimeout(timer);
  }, [watchAllFields, history, historyIndex, isHistoryAction]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setIsHistoryAction(true);
      setHistoryIndex(prevIndex);
      reset(history[prevIndex]);
      toast.info("Action undone");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setIsHistoryAction(true);
      setHistoryIndex(nextIndex);
      reset(history[nextIndex]);
      toast.info("Action redone");
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  const watchTitle = watch('title');
  const watchOriginalPrice = watch('prices.original');
  const watchOfferPrice = watch('prices.offer');
  const watchBadge = watch('badge');
  const watchStatus = watch('status');
  const watchPlatform = watch('affiliate.platform');
  const watchCta = watch('ctaText');
  const watchBrand = watch('brand');
  const watchDesc = watch('description');
  const watchMainImage = watch('media.mainImage');
  const watchGallery = watch('media.gallery');
  const watchCurrency = watch('prices.currency');
  const watchShowPricing = watch('prices.showPricing');
  const watchPriceLabel = watch('prices.priceLabel');

  // Auto-slugify title
  useEffect(() => {
    if (!isSlugLocked && watchTitle && !initialData?.slug) {
      setValue('slug', slugify(watchTitle), { shouldValidate: true });
    }
  }, [watchTitle, isSlugLocked, setValue, initialData]);

  // Smart CTA Generation
  useEffect(() => {
    if (!initialData?.ctaText) {
      const platform = watchPlatform || 'Amazon';
      if (platform === 'Other' || !platform) {
        setValue('ctaText', 'Check Latest Price', { shouldDirty: true });
      } else {
        setValue('ctaText', `Shop on ${platform}`, { shouldDirty: true });
      }
    }
  }, [watchPlatform, setValue, initialData]);

  // Scroll Spy for sticky navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace('section-', ''));
          }
        });
      },
      { rootMargin: '-20% 0px -75% 0px' }
    );

    SECTIONS.forEach(sec => {
      const el = document.getElementById(`section-${sec.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const parsePrice = (val: any) => {
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const discountPercentage = watchOriginalPrice && watchOfferPrice
    ? Math.round(((parsePrice(watchOriginalPrice) - parsePrice(watchOfferPrice)) / parsePrice(watchOriginalPrice)) * 100)
    : 0;

  const getProductSlug = () => watch('slug') || slugify(watchTitle || 'product');

  const handleSingleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } },
    fieldName: any,
    uploadConfig: {
      type: 'main' | 'variants';
      index?: number;
      variant?: string;
    }
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCropperState({
        open: true,
        image: reader.result as string,
        fieldName,
        config: uploadConfig
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (blob: Blob) => {
    const { fieldName, config } = cropperState;
    if (!fieldName || !config) return;

    try {
      toast.loading('Uploading cropped image...', { id: 'upload' });

      // Convert blob to file for Cloudinary upload
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const url = await uploadImage(
        file,
        createProductImageConfig(getProductSlug(), config.type, config),
        (pct) => {
          toast.loading(`Uploading cropped image: ${pct}%`, { id: 'upload' });
        }
      );

      setValue(fieldName as any, url, { shouldValidate: true });
      toast.success('Uploaded successfully', { id: 'upload' });
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed', { id: 'upload' });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      toast.loading('Compressing gallery...', { id: 'upload-gallery' });
      const currentGallery = watch('media.gallery') || [];
      const newUrls = await uploadMultiple(
        Array.from(files),
        createProductImageConfig(getProductSlug(), 'gallery', { index: currentGallery.length + 1 }),
        (pct) => {
          toast.loading(`Batch Ingesting: ${pct}%`, { id: 'upload-gallery' });
        }
      );
      setValue('media.gallery', [...currentGallery, ...newUrls], { shouldValidate: true });
      toast.success(`Uploaded ${newUrls.length} images`, { id: 'upload-gallery' });
    } catch (error: any) {
      toast.error(error?.message || 'Gallery upload failed', { id: 'upload-gallery' });
    }
  };

  const handleUrlUpload = async (
    url: string,
    fieldName: any,
    config: {
      type: 'main' | 'variants' | 'gallery';
      index?: number;
      variant?: string;
    }
  ) => {
    if (!url) return;

    try {
      toast.loading('Uploading from URL...', { id: 'url-upload' });

      const uploadedUrl = await uploadImageFromUrl(
        url,
        createProductImageConfig(getProductSlug(), config.type, config)
      );

      if (config.type === 'gallery') {
        const current = watch('media.gallery') || [];
        setValue('media.gallery', [...current, uploadedUrl], { shouldValidate: true });
      } else {
        setValue(fieldName, uploadedUrl, { shouldValidate: true });
      }

      toast.success('Uploaded successfully', { id: 'url-upload' });
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed', { id: 'url-upload' });
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentGallery = watch('media.gallery');
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setValue('media.gallery', newGallery);
  };

  const handleDrop = async (e: React.DragEvent, fieldName: string, config: any) => {
    e.preventDefault();
    setDragOverField(null);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (config.type === 'gallery') {
      await handleGalleryUpload({ target: { files } } as any);
    } else {
      await handleSingleImageUpload({ target: { files } } as any, fieldName, config);
    }
  };

  const onDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    setDragOverField(fieldId);
  };

  const onDragLeave = () => {
    setDragOverField(null);
  };

  const openMediaPicker = (target: 'main' | 'gallery') => {
    setShowMediaPicker({ open: true, target });
  };

  const handleMediaSelect = (assets: any | any[]) => {
    const assetList = Array.isArray(assets) ? assets : [assets];

    if (showMediaPicker.target === 'main') {
      const url = assetList[0]?.url || '';
      setValue('media.mainImage', url, { shouldValidate: true });
    } else {
      const currentGallery = watch('media.gallery') || [];
      const newUrls = assetList.map(a => a.url).filter(url => !currentGallery.includes(url));
      setValue('media.gallery', [...currentGallery, ...newUrls], { shouldValidate: true });
    }

    setShowMediaPicker(prev => ({ ...prev, open: false }));
    toast.success(`Library assets integrated successfully`);
  };

  return (
    <div className="w-full pb-24">
      <div className="w-full">
        <MediaPickerModal
          isOpen={showMediaPicker.open}
          onClose={() => setShowMediaPicker({ open: false, target: 'main' })}
          onSelect={handleMediaSelect}
        />

        <PageHeader
          title={title}
          subtitle={initialData ? 'Update existing catalog entry' : 'Create a new catalog entry'}
          badge="Inventory"
          className="mb-8"
          actions={
            onDelete && (
              <Button
                variant="outline"
                type="button"
                disabled={isDeleting}
                className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={onDelete}
              >
                {isDeleting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Entry
              </Button>
            )
          }
        />

        {/* STICKY NAV */}
        <div className="sticky top-[56px] z-[30] bg-[var(--background)] pt-3 pb-0 mb-10 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar w-full">
            <div className="flex items-center gap-6 flex-1">
              {SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={cn(
                    "pb-3 text-[11px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                    activeSection === sec.id
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {sec.label}
                  {activeSection === sec.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary)]"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex items-center gap-2 mb-3">
              <div className="flex items-center bg-[var(--muted)] border border-[var(--border)] rounded-full p-0.5 gap-0.5 mr-2">
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  disabled={historyIndex <= 0}
                  onClick={handleUndo}
                  className="h-7 w-7 rounded-full text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  disabled={historyIndex >= history.length - 1}
                  onClick={handleRedo}
                  className="h-7 w-7 rounded-full text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/products')}
                className="h-8 px-4 rounded-full border-[var(--border)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Discard
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                variant="outline"
                onClick={async () => {
                  setValue('status', 'draft', { shouldValidate: true });
                  const data = watch();
                  await onSubmit(data as any);
                }}
                className="h-8 px-4 rounded-full border-[var(--border)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all"
              >
                Draft
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={isSubmitting}
                onClick={() => setValue('status', 'published', { shouldValidate: true })}
                className="h-8 px-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 shadow-md shadow-[var(--primary)]/20 transition-all flex-shrink-0"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-3 h-3" /> : null}
                {isSubmitting ? "Saving..." : (initialData ? "Update" : "Publish")}
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: FORM SIDE */}
          <div className="lg:col-span-7 space-y-10">
            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">

              {/* SECTION: CORE */}
              <section id="section-core" className="bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] scroll-mt-28">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[var(--foreground)] tracking-tight">Core Details</h3>
                  <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Fundamental product information and categorization.</p>
                </div>
                <div className="h-px w-full bg-[var(--border)] mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="md:col-span-2">
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Product Title</Label>
                    <Input
                      {...register('title')}
                      placeholder="e.g. Silk Satin Evening Dress"
                      className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] px-4 transition-colors"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title.message}</p>}
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">SEO Slug</Label>
                    <div className="relative group">
                      <Input
                        {...register('slug')}
                        readOnly={isSlugLocked}
                        className={cn(
                          "h-12 rounded-xl border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[13px] text-[var(--foreground)] px-4 pr-14 transition-colors",
                          isSlugLocked ? "bg-[var(--muted)]/70 text-[var(--muted-foreground)]" : "bg-[var(--muted)]"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setIsSlugLocked(!isSlugLocked)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                      >
                        {isSlugLocked ? 'Edit' : 'Lock'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Brand Name (Optional)</Label>
                    <Input
                      {...register('brand')}
                      placeholder="e.g. Prada"
                      className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] px-4 transition-colors"
                    />
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Category</Label>
                    <Select
                      onValueChange={(val: any) => setValue('category', val)}
                      value={watch('category')}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none px-4 text-[14px] text-[var(--foreground)] transition-colors">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[var(--border)] shadow-xl bg-[var(--card)]">
                        {categories.map(cat => (
                          <SelectItem key={cat._id} value={cat.name} className="py-2.5 text-[13px] cursor-pointer rounded-md text-[var(--foreground)]">
                            {cat.name}
                          </SelectItem>
                        ))}
                        {categories.length === 0 && (
                          <div className="p-2 text-xs text-[var(--muted-foreground)]">No categories found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Badge</Label>
                    <Select onValueChange={(val: any) => setValue('badge', val)} value={watchBadge}>
                      <SelectTrigger className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none px-4 text-[14px] text-[var(--foreground)] transition-colors">
                        <SelectValue placeholder="Select Badge" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[var(--border)] shadow-xl bg-[var(--card)]">
                        {["None", "Luxury", "Hot Sale", "New Arrival"].map(b => (
                          <SelectItem key={b} value={b} className="py-2.5 text-[13px] cursor-pointer rounded-md text-[var(--foreground)]">{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Description</Label>
                    <Textarea
                      {...register('description')}
                      placeholder="Exquisite craftsmanship meets modern silhouette..."
                      className="min-h-[140px] rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] p-4 resize-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]/50">
                    <div>
                      <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block uppercase tracking-widest opacity-60">Manual Rating (0 - 5)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...register('rating', { valueAsNumber: true })}
                          placeholder="4.5"
                          className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none text-[14px] text-[var(--foreground)] px-4 transition-colors"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)] font-bold text-xs pointer-events-none">
                          STARS
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block uppercase tracking-widest opacity-60">Total Reviews</Label>
                      <Input
                        type="number"
                        {...register('reviewsCount', { valueAsNumber: true })}
                        placeholder="120"
                        className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none text-[14px] text-[var(--foreground)] px-4 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: PRICING */}
              <section id="section-pricing" className="bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] scroll-mt-28">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[var(--foreground)] tracking-tight">Pricing & Affiliate</h3>
                  <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Configure retail pricing and affiliate routing.</p>
                </div>
                <div className="h-px w-full bg-[var(--border)] mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Currency</Label>
                    <Select
                      onValueChange={(val: any) => setValue('prices.currency', val)}
                      value={watchCurrency}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none px-4 text-[14px] text-[var(--foreground)] transition-colors">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[var(--border)] shadow-xl bg-[var(--card)]">
                        <SelectItem value="INR" className="py-2.5 text-[13px] cursor-pointer rounded-md text-[var(--foreground)]">INR (₹)</SelectItem>
                        <SelectItem value="USD" className="py-2.5 text-[13px] cursor-pointer rounded-md text-[var(--foreground)]">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Original Price (Optional)</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-bold text-xs pointer-events-none">
                        {watchCurrency === 'USD' ? '$' : '₹'}
                      </div>
                      <Input
                        {...register('prices.original')}
                        placeholder="e.g. 1999"
                        className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] pl-10 transition-colors"
                      />
                    </div>
                    {errors.prices?.original && <p className="text-xs text-red-500 mt-1.5">{errors.prices.original.message}</p>}
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Offer Price (Optional)</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-bold text-xs pointer-events-none">
                        {watchCurrency === 'USD' ? '$' : '₹'}
                      </div>
                      <Input
                        {...register('prices.offer')}
                        placeholder="e.g. 1499"
                        className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] pl-10 transition-colors"
                      />
                    </div>
                    {errors.prices?.offer && <p className="text-xs text-red-500 mt-1.5">{errors.prices.offer.message}</p>}
                  </div>

                  <div>
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Discount</Label>
                    <div className={cn(
                      "h-12 rounded-xl flex items-center justify-center border border-[var(--border)] transition-opacity",
                      !watchShowPricing && "opacity-30 grayscale"
                    )}>
                      <span className="text-[var(--foreground)] text-[14px] font-medium">{discountPercentage}% OFF</span>
                    </div>
                  </div>

                  <div className="md:col-span-3 py-6 border-y border-[var(--border)]/50 flex flex-wrap items-center gap-10">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setValue('prices.showPricing', !watchShowPricing)}
                        className={cn(
                          "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                          watchShowPricing ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]/20"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                          watchShowPricing ? "left-7" : "left-1"
                        )} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Show Pricing & Discount</p>
                        <p className="text-[9px] font-bold text-[var(--muted-foreground)] opacity-50 uppercase tracking-tighter">Toggle visibility on storefront</p>
                      </div>
                    </div>

                    {!watchShowPricing && (
                      <div className="flex-1 min-w-[280px] animate-in slide-in-from-left-2 duration-300">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50 mb-2 block">Price Display Label (Custom Text)</Label>
                        <Input
                          {...register('prices.priceLabel')}
                          placeholder="e.g. Check Price on Platform, Starting from ₹999..."
                          className="h-12 rounded-xl bg-[var(--background)] border-[var(--border)] focus:border-[var(--primary)] text-[13px] font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">Platform (Optional)</Label>
                    <Select onValueChange={(val: any) => setValue('affiliate.platform', val)} value={watchPlatform}>
                      <SelectTrigger className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] shadow-none px-4 text-[14px] text-[var(--foreground)] transition-colors">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[var(--border)] shadow-xl bg-[var(--card)]">
                        {["Amazon", "Flipkart", "Myntra", "Ajio", "Other"].map(p => (
                          <SelectItem key={p} value={p} className="py-2.5 text-[13px] cursor-pointer rounded-md text-[var(--foreground)]">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[12px] font-medium text-[var(--muted-foreground)] block">Affiliate Link (Optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[var(--primary)]/5 text-[var(--primary)] border-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white transition-all gap-1.5"
                        onClick={() => {
                          toast.info("Smart Intel Engine is being synchronized...");
                        }}
                      >
                        <Sparkles className="w-3 h-3" /> Fetch Smart Intel
                      </Button>
                    </div>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                      <Input
                        {...register('affiliate.mainLink')}
                        placeholder="https://platform.com/p/..."
                        className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] pl-10 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-[12px] font-medium text-[var(--muted-foreground)] mb-2 block">CTA Button Text</Label>
                    <Input
                      {...register('ctaText')}
                      placeholder="e.g. Shop on Amazon"
                      className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] px-4 transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION: MEDIA */}
              <section id="section-media" className="bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] scroll-mt-28 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)]/5 to-transparent -mr-32 -mt-32 blur-3xl pointer-events-none" />

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                        <ImageIcon size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase italic">Media Manifest</h3>
                    </div>
                    <p className="text-[12px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest opacity-60">Visual storytelling & inventory assets</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openMediaPicker('gallery')}
                      className="h-10 px-5 rounded-xl border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all shadow-sm"
                    >
                      Archive Vault
                    </Button>
                    <label className="h-10 px-5 flex items-center gap-2 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20">
                      <Plus size={16} strokeWidth={3} /> Quick Upload
                      <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                  {/* PRIMARY SLOT */}
                  <div className="md:col-span-5 lg:col-span-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-3 block opacity-50">Main Masterpiece</Label>
                    <div
                      onDragOver={(e) => onDragOver(e, 'main')}
                      onDragLeave={onDragLeave}
                      onDrop={(e) => handleDrop(e, 'media.mainImage', { type: 'main' })}
                      className={cn(
                        "relative group aspect-[4/5] bg-[var(--muted)] border-2 border-dashed rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer shadow-inner",
                        dragOverField === 'main' ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]" : "border-[var(--border)] hover:border-[var(--primary)]/50"
                      )}
                    >
                      {watchMainImage ? (
                        <>
                          <SafeImage src={getOptimizedUrl(watchMainImage)} alt="Main" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[4px]">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => openMediaPicker('main')} className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform">
                                <ImageIcon size={18} strokeWidth={2.5} />
                              </button>
                              <button type="button" onClick={() => setValue('media.mainImage', '')} className="p-3 bg-red-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform">
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8 space-y-4">
                          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/5 flex items-center justify-center mx-auto mb-2 border border-[var(--primary)]/10 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-[var(--primary)]" strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">Select Main Image</p>
                            <p className="text-[9px] font-medium text-[var(--muted-foreground)] uppercase tracking-tighter mt-1">PNG, JPG or WebP</p>
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, 'media.mainImage', { type: 'main' })} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GALLERY & URL FLOW */}
                  <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Gallery Manifest ({watchGallery?.length || 0})</Label>
                        <button type="button" onClick={() => setValue('media.gallery', [])} className="text-[9px] font-black uppercase text-red-500 hover:underline tracking-widest">Clear All</button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {watchGallery?.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-[var(--border)] bg-[var(--muted)] shadow-sm hover:shadow-md transition-all">
                            <SafeImage src={getOptimizedUrl(url)} alt={`Gallery ${index}`} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                              <button type="button" onClick={() => removeGalleryImage(index)} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform shadow-xl">
                                <Trash2 size={12} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* COMPACT ADD SLOTS */}
                        <div className="flex gap-3">
                          <label
                            onDragOver={(e) => onDragOver(e, 'gallery-add')}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => handleDrop(e, 'media.gallery', { type: 'gallery' })}
                            className={cn(
                              "relative aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group",
                              dragOverField === 'gallery-add' ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.05]" : "border-[var(--border)] bg-[var(--muted)]/30 hover:border-[var(--primary)]/50"
                            )}
                          >
                            <Plus className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mt-1 group-hover:text-[var(--primary)]">Upload</span>
                            <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                          </label>

                          <button
                            type="button"
                            onClick={() => openMediaPicker('gallery')}
                            className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/[0.03] transition-all group"
                          >
                            <ImageIcon className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mt-1 group-hover:text-[var(--primary)]">Inventory</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* URL INPUT INTEGRATION */}
                    <div className="p-5 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-60">Universal Asset Linker</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]/40" />
                          <input
                            id="global-media-url"
                            type="url"
                            placeholder="Enter Cloudinary or External URL..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[12px] font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:border-[var(--primary)]/40 transition-all outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value;
                                if (val) {
                                  handleUrlUpload(val, 'media.gallery', { type: 'gallery' });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          className="h-11 px-6 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-lg active:scale-95"
                          onClick={() => {
                            const input = document.getElementById('global-media-url') as HTMLInputElement;
                            if (input?.value) {
                              handleUrlUpload(input.value, 'media.gallery', { type: 'gallery' });
                              input.value = '';
                            }
                          }}
                        >
                          Push to Manifest
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: VARIANTS */}
              <section id="section-variants" className="bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] scroll-mt-28">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-[var(--foreground)] tracking-tight">Variant Manager</h3>
                    <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Manage color options and specific variant links.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                      colorName: '',
                      colorCode: '#000000',
                      variantImage: '',
                      inventory: 0,
                      isOutOfStock: false
                    })}
                    className="rounded-lg border-[var(--border)] text-[12px] font-medium h-9 px-4 hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors"
                  >
                    <Plus size={14} className="mr-1.5" /> Add Variant
                  </Button>
                </div>
                <div className="h-px w-full bg-[var(--border)] mb-8" />

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[var(--muted)]/50 p-6 rounded-2xl border border-[var(--border)] relative group"
                    >
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-red-500 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
                        <div>
                          <Label className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2 block">Color Name</Label>
                          <Input
                            {...register(`variants.${index}.colorName` as const)}
                            list="color-suggestions"
                            onChange={(e) => {
                              register(`variants.${index}.colorName` as const).onChange(e);
                              const name = e.target.value;
                              const matchedHex = Object.entries(COLOR_MAP).find(
                                ([key]) => key.toLowerCase() === name.toLowerCase()
                              )?.[1];
                              if (matchedHex) {
                                setValue(`variants.${index}.colorCode` as const, matchedHex, { shouldValidate: true, shouldDirty: true });
                              }
                            }}
                            placeholder="e.g. Midnight Blue"
                            className="h-10 rounded-lg bg-[var(--card)] border-[var(--border)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] transition-colors"
                          />
                          <datalist id="color-suggestions">
                            {Object.keys(COLOR_MAP).map(c => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                        <div>
                          <Label className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2 block">Color Code</Label>
                          <div className="flex gap-2">
                            <Input
                              {...register(`variants.${index}.colorCode` as const)}
                              type="color"
                              value={watch(`variants.${index}.colorCode`)}
                              className="w-10 h-10 p-1 border-[var(--border)] bg-[var(--card)] rounded-lg cursor-pointer"
                            />
                            <Input
                              {...register(`variants.${index}.colorCode` as const)}
                              value={watch(`variants.${index}.colorCode`)}
                              className="flex-1 h-10 rounded-lg bg-[var(--card)] border-[var(--border)] font-mono text-[13px] text-[var(--foreground)] focus:border-[var(--primary)] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2 block">Variant Image (Optional)</Label>
                          <div className="flex items-center gap-4">
                            <div
                              onDragOver={(e) => onDragOver(e, `variant-${index}`)}
                              onDragLeave={onDragLeave}
                              onDrop={(e) => handleDrop(e, `variants.${index}.variantImage` as const, {
                                type: 'variants',
                                variant: watch(`variants.${index}.colorName`) || `variant-${index + 1}`,
                              })}
                              className={cn(
                                "w-16 h-16 rounded-xl border border-dashed overflow-hidden relative flex items-center justify-center cursor-pointer transition-all flex-shrink-0",
                                dragOverField === `variant-${index}` ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-110" : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"
                              )}
                            >
                              {watch(`variants.${index}.variantImage`) ? (
                                <>
                                  <SafeImage
                                    src={getOptimizedUrl(watch(`variants.${index}.variantImage`))}
                                    alt="Variant"
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setValue(`variants.${index}.variantImage` as const, '')}
                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <Upload size={16} className="text-[var(--muted-foreground)]" />
                              )}
                              {!watch(`variants.${index}.variantImage`) && (
                                <input
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) =>
                                    handleSingleImageUpload(e, `variants.${index}.variantImage` as const, {
                                      type: 'variants',
                                      variant: watch(`variants.${index}.colorName`) || `variant-${index + 1}`,
                                    })
                                  }
                                />
                              )}
                            </div>

                            <div className="flex-1 space-y-2 max-w-[280px]">
                              <p className="text-[12px] text-[var(--muted-foreground)]">Upload or via URL.</p>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted-foreground)]" />
                                  <input
                                    id={`variant-url-${index}`}
                                    type="url"
                                    placeholder="Paste Image URL"
                                    className="w-full h-8 pl-7 pr-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[11px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  className="h-8 px-2.5 rounded-lg bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--primary)]/90 transition-all flex items-center flex-shrink-0"
                                  onClick={() => {
                                    const input = document.getElementById(`variant-url-${index}`) as HTMLInputElement;
                                    if (input?.value) {
                                      handleUrlUpload(input.value, `variants.${index}.variantImage`, {
                                        type: 'variants',
                                        variant: watch(`variants.${index}.colorName`) || `variant-${index + 1}`
                                      });
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2 block">Variant Affiliate Link (Optional)</Label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                            <Input
                              {...register(`variants.${index}.variantLink` as const)}
                              placeholder="https://platform.com/p/..."
                              className="h-10 rounded-lg bg-[var(--card)] border-[var(--border)] focus:border-[var(--primary)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] pl-9 transition-colors"
                            />
                          </div>
                          {errors.variants?.[index]?.variantLink && (
                            <p className="text-[10px] text-red-500 mt-1">{errors.variants[index]?.variantLink?.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-1">
                          <Label className="text-[11px] font-medium text-[var(--muted-foreground)] mb-2 block">Stock Level</Label>
                          <Input
                            type="number"
                            {...register(`variants.${index}.inventory` as const, { valueAsNumber: true })}
                            className="h-10 rounded-lg bg-[var(--card)] border-[var(--border)] text-[13px] text-[var(--foreground)] focus:border-[var(--primary)] transition-colors"
                          />
                        </div>

                        <div className="md:col-span-1 flex flex-col justify-end">
                          <div className="flex items-center gap-3 h-10 px-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                            <span className={cn(
                              "text-[11px] font-bold uppercase tracking-widest",
                              watch(`variants.${index}.isOutOfStock`) ? "text-red-500" : "text-emerald-500"
                            )}>
                              {watch(`variants.${index}.isOutOfStock`) ? "Out of Stock" : "In Stock"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setValue(`variants.${index}.isOutOfStock`, !watch(`variants.${index}.isOutOfStock`))}
                              className={cn(
                                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                watch(`variants.${index}.isOutOfStock`) ? "bg-red-500" : "bg-emerald-500"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                  watch(`variants.${index}.isOutOfStock`) ? "translate-x-5" : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {fields.length === 0 && (
                    <div className="p-10 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/50">
                      <p className="text-[13px] text-[var(--muted-foreground)]">No variants added yet.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION: SEO */}
              <section id="section-seo" className="bg-[var(--card)] rounded-2xl p-8 shadow-sm border border-[var(--border)] scroll-mt-28">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[var(--foreground)] tracking-tight">SEO Configuration</h3>
                  <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Optimize how this product appears in search engines.</p>
                </div>
                <div className="h-px w-full bg-neutral-100 mb-8" />

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-[12px] font-medium text-[var(--muted-foreground)]">Meta Title</Label>
                      <span className={cn("text-[11px] font-medium", (watch('seo.metaTitle')?.length || 0) > 60 ? "text-red-500" : "text-[var(--muted-foreground)]")}>
                        {watch('seo.metaTitle')?.length || 0}/60
                      </span>
                    </div>
                    <Input
                      {...register('seo.metaTitle')}
                      placeholder="Fashcon | Premium Curated Evening Gown"
                      className="h-12 rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] px-4 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-[12px] font-medium text-[var(--muted-foreground)]">Meta Description</Label>
                      <span className={cn("text-[11px] font-medium", (watch('seo.metaDesc')?.length || 0) > 160 ? "text-red-500" : "text-[var(--muted-foreground)]")}>
                        {watch('seo.metaDesc')?.length || 0}/160
                      </span>
                    </div>
                    <Textarea
                      {...register('seo.metaDesc')}
                      placeholder="Discover the elegance of our hand-picked evening gowns..."
                      className="min-h-[100px] rounded-xl bg-[var(--muted)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 shadow-none text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] p-4 resize-none transition-colors"
                    />
                  </div>

                  {/* SERP PREVIEW */}
                  <div className="p-6 bg-[var(--muted)] border border-[var(--border)] rounded-2xl space-y-3 mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Search Preview</p>
                    <div className="space-y-1">
                      <p className="text-[15px] text-[#1a0dab] truncate font-medium hover:underline cursor-pointer">
                        {watch('seo.metaTitle') || watchTitle || 'Product Title Page - Fashcon'}
                      </p>
                      <p className="text-[13px] text-[#006621] truncate">https://www.fashcon.store/product/{watch('slug') || 'product-slug'}</p>
                      <p className="text-[13px] text-[#4d5156] line-clamp-2 leading-snug">
                        {watch('seo.metaDesc') || watchDesc || 'Add a description to see how it looks in search results.'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW SIDE (FIXED) */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="sticky top-28 h-fit flex flex-col gap-4">

              {/* HEADER ROW */}
              <div className="flex items-center justify-between px-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Real-time Preview</p>
                </div>
              </div>

              {/* PREVIEW CARD — Adaptive Height */}
              <div className="rounded-[2.5rem] border border-[var(--border)] shadow-2xl overflow-hidden bg-[var(--card)] flex flex-col transition-all duration-500 hover:shadow-[var(--primary)]/5">
                {/* IMAGE — Adaptive Height */}
                <div className="relative w-full bg-[var(--muted)] overflow-hidden group">
                  {watchMainImage ? (
                    <SafeImage
                      src={getOptimizedUrl(watchMainImage)}
                      alt="Preview"
                      width={800}
                      height={1000}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[4/5] flex flex-col items-center justify-center text-[var(--muted-foreground)]/20">
                      <ImageIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Visuals</p>
                    </div>
                  )}
                  {watchBadge !== 'None' && (
                    <div className="absolute top-6 left-6">
                      <div className="bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-[0.2em] text-[9px] py-1.5 px-4 rounded-full shadow-2xl backdrop-blur-md">
                        {watchBadge}
                      </div>
                    </div>
                  )}
                </div>

                {/* PRODUCT INFO */}
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-60">
                      {watchBrand || 'Unbranded'}
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] leading-tight">
                      {watchTitle || 'Product Manifesto Title'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-[var(--foreground)] tracking-tighter">
                      {watchOfferPrice ? (
                        /^\d+$/.test(String(watchOfferPrice)) ? `₹${watchOfferPrice}` : watchOfferPrice
                      ) : '₹0'}
                    </span>
                    {watchOriginalPrice && watchOriginalPrice !== watchOfferPrice && (
                      <span className="text-[14px] text-[var(--muted-foreground)] line-through opacity-40 font-bold">
                        {/^\d+$/.test(String(watchOriginalPrice)) ? `₹${watchOriginalPrice}` : watchOriginalPrice}
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {discountPercentage}% OFF
                      </div>
                    )}
                  </div>

                  <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)] opacity-60 font-medium">
                    {watchDesc || 'Craft a compelling narrative for this product to see the preview manifest here.'}
                  </p>

                  {fields.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-3">Available Palette</p>
                      <div className="flex flex-wrap gap-3">
                        {fields.map((f, i) => (
                          <div
                            key={f.id}
                            className="w-8 h-8 rounded-2xl border-2 border-[var(--background)] shadow-lg ring-1 ring-[var(--border)] transition-transform hover:scale-110 cursor-help"
                            style={{ backgroundColor: watch(`variants.${i}.colorCode`) }}
                            title={watch(`variants.${i}.colorName`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                    <Button type="button" className="w-full h-14 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black text-[12px] uppercase tracking-[0.2em] group transition-all shadow-xl">
                      {watchCta || 'Buy Now'}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-40">
                      Dispatched via {watchPlatform || 'Official Channels'}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS CARD */}
              <div className="bg-[var(--card)] p-6 rounded-[2rem] border border-[var(--border)] flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-1.5">Visibility Status</p>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", watchStatus === 'published' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]")} />
                    <span className="text-[12px] font-black uppercase tracking-widest text-[var(--foreground)]">{watchStatus}</span>
                  </div>
                </div>
                <Select onValueChange={(val: any) => setValue('status', val)} value={watchStatus}>
                  <SelectTrigger className="w-32 h-10 rounded-xl bg-[var(--muted)] border-[var(--border)] font-black text-[10px] uppercase tracking-widest shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[var(--border)] shadow-2xl bg-[var(--card)] p-1">
                    <SelectItem value="draft" className="text-[11px] font-bold uppercase tracking-widest py-2.5 cursor-pointer rounded-xl">Draft</SelectItem>
                    <SelectItem value="published" className="text-[11px] font-bold uppercase tracking-widest py-2.5 cursor-pointer rounded-xl text-emerald-600 focus:text-emerald-700">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

        </div>
      </div>
      <CropperModal
        open={cropperState.open}
        onOpenChange={(open: boolean) => setCropperState(prev => ({ ...prev, open }))}
        image={cropperState.image}
        onCropComplete={handleCroppedImage}
        aspectRatio={cropperState.config?.type === 'main' ? 4 / 5 : 1 / 1}
      />
    </div>
  );
}
