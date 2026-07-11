'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  Loader2,
  Plus,
  Sparkles,
  Type,
  Layout,
  Globe,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Monitor,
  CheckCircle2,
  ShoppingBag,
  Undo2,
  Redo2,
  Cloud
} from 'lucide-react';
import { createBlog } from '@/app/actions/blogs';
import { getCategories, createCategory } from '@/app/actions/categories';
import { generateBlogTags, generateBlogExcerpt, generateBlogCardInfo } from '@/app/actions/ai';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/text-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';

import { MediaPickerModal } from '@/components/admin';
import { Section } from '@/types';
import RichTextBlogEditor from '@/components/admin/blog/RichTextBlogEditor';
import ProductPickerModal from '@/components/admin/blog/ProductPickerModal';
import SEOPanel from '@/components/admin/blog/SEOPanel';

export default function NewBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [editorType, setEditorType] = useState<'infographic' | 'richtext'>('infographic');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'richtext' || type === 'infographic') {
      setEditorType(type);
    }
  }, [searchParams]);

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [bottomBannerImage, setBottomBannerImage] = useState<string | null>(null);
  const [adProducts, setAdProducts] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState<{ open: boolean, field: string, index?: number }>({ open: false, field: '' });
  const [showProductPicker, setShowProductPicker] = useState<{ open: boolean, index?: number }>({ open: false });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [showSEO, setShowSEO] = useState(false);

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
  
  // Blog Content State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cardInfo: '',
    metaDescription: '',
    keywords: [] as string[],
    category: 'Beauty',
    subCategory: [] as string[],
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    bottomBannerTitle: '',
    bottomBannerSubtitle: '',
    bottomBannerButtonText: '',
    bottomBannerButtonUrl: '',
    author: '',
  });

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
      const generated = await generateBlogTags(
        formData.title,
        sections.map(s => s.title + ' ' + s.description).join(' ')
      );
      if (Array.isArray(generated) && generated.length > 0) {
        const newTags = generated.filter((t: string) => !tags.includes(t));
        if (newTags.length > 0) {
          setTags(prev => [...prev, ...newTags]);
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
      const contentText = sections.map(s => s.title + ' ' + s.description).join(' ');
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
      const contentText = sections.map(s => s.title + ' ' + s.description).join(' ');
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

  const [sections, setSections] = useState<Section[]>([
    {
      title: 'Introduction',
      description: 'Write the introduction to your guide here...',
      summary: 'Keep it short and punchy for the pull-quote.',
      image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=1000&auto=format&fit=crop',
      ctaLabel: 'Shop Now',
      ctaStore: 'Sephora',
      ctaUrl: '#',
      prefix: 'INTRO'
    }
  ]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const fetchedCats = await getCategories('blog');
        if (fetchedCats.length > 0) setCategories(fetchedCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Undo/Redo history stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isUndoingRedoing = useRef(false);

  const saveToHistory = (state: any) => {
    if (isUndoingRedoing.current) return;
    setHistory((prevHistory) => {
      const nextHistory = prevHistory.slice(0, historyPointer + 1);
      if (nextHistory.length > 0) {
        const last = nextHistory[nextHistory.length - 1];
        if (JSON.stringify(last) === JSON.stringify(state)) {
          return prevHistory;
        }
      }
      const newHist = [...nextHistory, JSON.parse(JSON.stringify(state))];
      setHistoryPointer(newHist.length - 1);
      return newHist;
    });
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      isUndoingRedoing.current = true;
      const prevIdx = historyPointer - 1;
      const state = history[prevIdx];
      setHistoryPointer(prevIdx);
      setFormData(state.formData);
      setSections(state.sections);
      setFeaturedImage(state.featuredImage);
      setThumbnailImage(state.thumbnailImage);
      setHeaderImage(state.headerImage);
      setTags(state.tags);
      setTimeout(() => {
        isUndoingRedoing.current = false;
      }, 100);
    }
  };

  const handleRedo = () => {
    if (historyPointer < history.length - 1) {
      isUndoingRedoing.current = true;
      const nextIdx = historyPointer + 1;
      const state = history[nextIdx];
      setHistoryPointer(nextIdx);
      setFormData(state.formData);
      setSections(state.sections);
      setFeaturedImage(state.featuredImage);
      setThumbnailImage(state.thumbnailImage);
      setHeaderImage(state.headerImage);
      setTags(state.tags);
      setTimeout(() => {
        isUndoingRedoing.current = false;
      }, 100);
    }
  };

  // Keyboard shortcut listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyPointer, history]);

  // Save state to history on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToHistory({ formData, sections, featuredImage, thumbnailImage, headerImage, bottomBannerImage, tags });
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, sections, featuredImage, thumbnailImage, headerImage, bottomBannerImage, tags]);

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Autosave effect
  useEffect(() => {
    if (!formData.title.trim()) return;

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const draftData = {
          ...formData,
          slug,
          image: featuredImage || sections[0]?.image || '',
          thumbnailImage: thumbnailImage || '',
          headerImage: headerImage || '',
          bottomBannerImage: bottomBannerImage || '',
          sections,
          tags,
          adProducts,
          status: 'draft',
          author: formData.author || 'Fashcon Editors',
          readTime: `${sections.length * 2} min`,
        };

        const newBlog = await createBlog(draftData);
        setSaveStatus('saved');
        toast.success("Draft saved automatically");
        router.replace(`/blogs/edit/${newBlog._id}`);
      } catch (error) {
        console.error("Autosave error:", error);
        setSaveStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, sections, featuredImage, thumbnailImage, headerImage, bottomBannerImage, tags, router, adProducts]);

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title to save a draft");
      return;
    }
    setLoading(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const newBlog = await createBlog({
        ...formData,
        slug,
        image: featuredImage || sections[0]?.image || '',
        thumbnailImage: thumbnailImage || '',
        headerImage: headerImage || '',
        bottomBannerImage: bottomBannerImage || '',
        sections,
        tags,
        adProducts,
        status: 'draft',
        author: formData.author || 'Fashcon Editors',
        readTime: `${sections.length * 2} min`,
      });
      toast.success("Draft saved successfully");
      router.replace(`/blogs/edit/${newBlog._id}`);
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    let nextStepNum = 1;
    sections.forEach((sec) => {
      const p = (sec.prefix ?? 'STEP').toUpperCase();
      const isNumbered = p !== "" && !p.includes("TESTIMONIAL") && !p.includes("INTRO");
      if (isNumbered) nextStepNum++;
    });

    setSections([...sections, {
      title: `Step ${nextStepNum}: Title`,
      description: '',
      summary: '',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
      ctaLabel: 'Shop Now',
      ctaStore: '',
      ctaUrl: '#',
      prefix: 'STEP'
    }]);
    toast.success("New section added");
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      toast.error("At least one section is required");
      return;
    }
    setSections(sections.filter((_, i) => i !== index));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.excerpt) {
      toast.error("Please fill in the title and excerpt");
      return;
    }

    setLoading(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      await createBlog({
        ...formData,
        slug,
        image: featuredImage || sections[0]?.image || '',
        thumbnailImage: thumbnailImage || '',
        headerImage: headerImage || '',
        bottomBannerImage: bottomBannerImage || '',
        sections,
        tags,
        adProducts,
        status: 'published',
        author: formData.author || 'Fashcon Editors',
        readTime: `${sections.length * 2} min`,
      });

      toast.success("Article published successfully");
      router.push('/blogs');
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish article");
    } finally {
      setLoading(false);
    }
  };

  const liveBlogData = {
    title: formData.title,
    slug: formData.slug,
    excerpt: formData.excerpt,
    cardInfo: formData.cardInfo,
    metaDescription: formData.metaDescription,
    category: formData.category,
    subCategory: formData.subCategory,
    author: formData.author,
    image: featuredImage,
    thumbnailImage: thumbnailImage,
    headerImage: headerImage,
    bottomBannerImage: bottomBannerImage,
    sections: sections,
    tags: tags,
    adProducts: adProducts,
  };

  if (editorType === 'richtext') {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 pb-32">
        <div className="flex items-center gap-1 p-1 bg-[var(--muted)]/30 rounded-2xl border border-[var(--border)] w-fit mx-auto">
          <button onClick={() => setEditorType('infographic')} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5")}>
            <Layout className="w-3.5 h-3.5" /> Infographic
          </button>
          <button onClick={() => setEditorType('richtext')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--foreground)] text-[var(--background)] shadow-lg">
            <Type className="w-3.5 h-3.5" /> Rich Text
          </button>
        </div>
        <RichTextBlogEditor mode="new" initialData={liveBlogData} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32">
      {/* Editor Type Selector */}
      <div className="flex items-center gap-1 p-1 bg-[var(--muted)]/30 rounded-2xl border border-[var(--border)] w-fit mx-auto">
        <button onClick={() => setEditorType('infographic')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--foreground)] text-[var(--background)] shadow-lg">
          <Layout className="w-3.5 h-3.5" /> Infographic
        </button>
        <button onClick={() => setEditorType('richtext')} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5")}>
          <Type className="w-3.5 h-3.5" /> Rich Text
        </button>
      </div>

      <PageHeader
        title={<>Draft: <span className="text-neutral-400">{formData.title || 'Untitled Story'}</span></>}
        sticky
        transparent
        className="px-4"
        actions={
          <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 justify-end select-none w-full md:w-auto">
            <div className="flex items-center gap-0.5 bg-[var(--foreground)]/5 p-0.5 rounded-full border border-[var(--border)] mr-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleUndo}
                disabled={historyPointer <= 0}
                className="w-7 h-7 rounded-full text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRedo}
                disabled={historyPointer >= history.length - 1}
                className="w-7 h-7 rounded-full text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            {saveStatus !== 'idle' && (
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-500/5 px-2 py-1 border border-zinc-500/10 rounded-full mr-1 shrink-0">
                <Cloud className={cn("w-3 h-3", saveStatus === 'saving' && "animate-pulse text-amber-500", saveStatus === 'saved' && "text-emerald-400")} />
                {saveStatus === 'saving' ? 'Saving' : 'Saved'}
              </span>
            )}

            <Tabs value={activeTab} onValueChange={(val) => React.startTransition(() => setActiveTab(val))} className="mr-1 shrink-0">
              <TabsList className="bg-[var(--foreground)]/5 p-0.5 rounded-full border border-[var(--border)] h-8">
                <TabsTrigger value="compose" className="rounded-full px-3 text-[9px] h-7 font-black uppercase tracking-widest data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm">
                  <Type className="w-2.5 h-2.5 mr-1" /> Compose
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-full px-3 text-[9px] h-7 font-black uppercase tracking-widest data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm">
                  <Eye className="w-2.5 h-2.5 mr-1" /> Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              onClick={() => setShowSEO(true)}
              className="h-8 px-3 rounded-full border-[var(--border)] gap-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" /> SEO
            </Button>
            <Button 
              variant="outline"
              onClick={handleSaveDraft} 
              disabled={loading}
              className="h-8 px-3 rounded-full border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--primary)]/5 font-black uppercase tracking-widest text-[9px] gap-1.5 transition-all active:scale-95 shrink-0"
            >
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="h-8 px-4 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[9px] gap-1.5 shadow-lg transition-all active:scale-95 shrink-0"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Publish Article
            </Button>
          </div>
        }
      />

      {/* Media Picker */}
      <MediaPickerModal 
        isOpen={showMediaPicker.open} 
        onClose={() => setShowMediaPicker({ open: false, field: '' })} 
        onSelect={(assets) => {
          const asset = assets[0];
          const url = asset?.url || '';
          if (showMediaPicker.field === 'featured') setFeaturedImage(url);
          else if (showMediaPicker.field === 'thumbnail') setThumbnailImage(url);
          else if (showMediaPicker.field === 'header') setHeaderImage(url);
          else if (showMediaPicker.field === 'bottomBanner') setBottomBannerImage(url);
          else if (showMediaPicker.field === 'section' && typeof showMediaPicker.index === 'number') {
            updateSection(showMediaPicker.index, 'image', url);
          }
          setShowMediaPicker({ open: false, field: '' });
        }} 
      />

      <ProductPickerModal 
        isOpen={showProductPicker.open} 
        onClose={() => setShowProductPicker({ open: false })} 
        onSelect={(product) => {
          const idx = showProductPicker.index;
          if (idx === -1) {
            setAdProducts(prev => [...prev, product]);
            toast.success(`Product "${product.title}" added to ads`);
          } else if (idx !== undefined) {
            const updatedSections = [...sections];
            updatedSections[idx] = {
              ...updatedSections[idx],
              productId: product.productId,
              ctaUrl: product.affiliateLink,
              ctaStore: product.brand,
              ctaLabel: product.ctaText || 'Shop Now',
              image: product.image,
              rating: product.rating,
              reviewsCount: product.reviewsCount
            };
            setSections(updatedSections);
            toast.success(`Product "${product.title}" attached to Step ${idx + 1}`);
          }
          setShowProductPicker({ open: false });
        }}
      />

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="compose" className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
            {/* Left Column: Metadata (Sticky & Scrollable) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto pr-2 scrollbar-hide">
              <Card className="rounded-[32px] border-[var(--border)]/30 bg-[var(--card)]/20 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Basic Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Headline</Label>
                    <Input 
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        setFormData(prev => ({
                          ...prev,
                          title: newTitle,
                          slug: (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')) ? autoSlug : prev.slug
                        }));
                      }}
                      placeholder="e.g. 10 Tips for Glowing Skin" 
                      className="h-12 rounded-xl bg-[var(--background)] font-bold text-lg border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Slug (URL Path)</Label>
                    <Input 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})}
                      placeholder="e.g. 10-tips-for-glowing-skin" 
                      className="h-11 rounded-xl bg-[var(--background)] font-bold text-xs border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Editor Name</Label>
                    <Input 
                      value={formData.author || ''}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="e.g. Apurva" 
                      className="h-11 rounded-xl bg-[var(--background)] font-bold text-xs border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Excerpt / Deck</Label>
                      <button 
                        type="button" 
                        onClick={handleGenerateExcerpt}
                        disabled={isGeneratingExcerpt}
                        className="text-[9px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                      >
                        {isGeneratingExcerpt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                        Generate
                      </button>
                    </div>
                    <Textarea 
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="The hook that appears in lists..." 
                      className="min-h-[100px] rounded-xl bg-[var(--background)] border-[var(--border)] italic opacity-80 p-4 resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Blog Card Drawer Content</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] tracking-widest shrink-0">Boutique Card</span>
                        <button 
                          type="button" 
                          onClick={handleGenerateCardInfo}
                          disabled={isGeneratingCardInfo}
                          className="text-[9px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                        >
                          {isGeneratingCardInfo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                          Generate
                        </button>
                      </div>
                    </div>
                    <Textarea 
                      value={formData.cardInfo}
                      onChange={(e) => setFormData({...formData, cardInfo: e.target.value})}
                      placeholder="Detailed text to show in the sliding pull-out card drawer..." 
                      className="min-h-[100px] rounded-xl bg-[var(--background)] border-[var(--border)] p-4 resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Category</Label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsAddingCategory(!isAddingCategory);
                          if (isAddingCategory) setNewCategoryName('');
                        }}
                        className="text-[9px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline"
                      >
                        {isAddingCategory ? 'Cancel' : '+ New Category'}
                      </button>
                    </div>
                    {isAddingCategory ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name..."
                          className="h-11 flex-1 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                        />
                        <Button 
                          type="button"
                          disabled={!newCategoryName.trim() || isCreatingCategory}
                          onClick={handleCreateCategory}
                          className="h-11 px-4 rounded-xl bg-[var(--primary)] text-white font-black uppercase text-[9px] tracking-wider"
                        >
                          {isCreatingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
                        </Button>
                      </div>
                    ) : (
                      <Select value={formData.category || ''} onValueChange={(val) => React.startTransition(() => setFormData({...formData, category: val || '', subCategory: []}))}>
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {categories.filter(cat => !cat.parentCategory).map(cat => (
                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {formData.category && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Sub Category</Label>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsAddingSubcategory(!isAddingSubcategory);
                            if (isAddingSubcategory) setNewSubcategoryName('');
                          }}
                          className="text-[9px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline"
                        >
                          {isAddingSubcategory ? 'Cancel' : '+ New Subcategory'}
                        </button>
                      </div>
                      {isAddingSubcategory ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            placeholder="Subcategory name..."
                            className="h-11 flex-1 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSubcategory())}
                          />
                          <Button 
                            type="button"
                            disabled={!newSubcategoryName.trim() || isCreatingSubcategory}
                            onClick={handleCreateSubcategory}
                            className="h-11 px-4 rounded-xl bg-[var(--primary)] text-white font-black uppercase text-[9px] tracking-wider"
                          >
                            {isCreatingSubcategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {(formData.subCategory || []).map((sub: string) => (
                              <Badge key={sub} className="bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] px-2 py-0.5 rounded-lg gap-1.5 group">
                                <span className="text-[8px] font-black uppercase tracking-wider">{sub}</span>
                                <X size={10} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    subCategory: (prev.subCategory || []).filter(s => s !== sub)
                                  }));
                                }} />
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
                            <SelectTrigger className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold">
                              <SelectValue placeholder="Add Sub Categories..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
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

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Cover Image</Label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMediaPicker({ open: true, field: 'featured' })}
                      className="h-11 w-full rounded-xl border-dashed border-2 hover:border-[var(--primary)]/30 group"
                    >
                      {featuredImage ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                           <CheckCircle2 size={12} className="text-emerald-500" /> Image Selected
                        </div>
                      ) : <ImageIcon size={16} className="opacity-20 group-hover:scale-110 transition-transform" />}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Thumbnail Image (For Grids)</Label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMediaPicker({ open: true, field: 'thumbnail' })}
                      className="h-11 w-full rounded-xl border-dashed border-2 hover:border-[var(--primary)]/30 group relative overflow-hidden"
                    >
                      {thumbnailImage ? (
                        <>
                          <img src={thumbnailImage} alt="Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                          <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold">
                             <CheckCircle2 size={12} className="text-emerald-500" /> Image Selected
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="opacity-20 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold opacity-30">Add Thumbnail</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Header Background (Full Display)</Label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMediaPicker({ open: true, field: 'header' })}
                      className="h-14 w-full rounded-xl border-dashed border-2 hover:border-[var(--primary)]/30 group relative overflow-hidden"
                    >
                      {headerImage ? (
                        <>
                          <img src={headerImage} alt="Header Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                          <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold">
                             <CheckCircle2 size={12} className="text-emerald-500" /> Background Attached
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="opacity-20" />
                          <span className="text-[10px] font-bold">Choose Premium Background</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-[9px] opacity-40 font-medium italic">This image will appear behind the blog headline for a premium look.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Card */}
              <Card className="rounded-[32px] border-[var(--border)]/30 bg-[var(--card)]/20 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Taxonomy
                    </CardTitle>
                    <button 
                      type="button" 
                      onClick={handleGenerateTags}
                      disabled={isGeneratingTags}
                      className="text-[9px] text-[var(--primary)] uppercase tracking-wider font-black hover:underline flex items-center gap-1"
                    >
                      {isGeneratingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                      AI Tags
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                  <Input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Add tag and press Enter" 
                    className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} className="bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] px-3 py-1 rounded-lg gap-2 group">
                        <span className="text-[9px] font-black uppercase tracking-widest">{tag}</span>
                        <X size={10} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sections Builder */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Infographic Sections ({sections.length})</h2>
                <Button 
                  onClick={addSection} 
                  variant="outline" 
                  className="rounded-full h-10 px-5 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all font-black uppercase tracking-widest text-[9px] gap-2"
                >
                  <Plus size={14} /> Add New Step
                </Button>
              </div>

              <div className="space-y-6">
                {sections.map((section, idx) => (
                  <Card key={idx} className="rounded-[40px] border-[var(--border)] bg-[var(--card)] shadow-sm group/section overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Section Image Selector */}
                      <div className="w-full md:w-1/3 aspect-[4/5] bg-[var(--background)] relative group/img overflow-hidden">
                        <SafeImage 
                          src={section.image} 
                          alt="Step" 
                          fill
                          className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-full font-black text-[9px] uppercase tracking-widest h-10 px-6 shadow-2xl"
                            onClick={() => setShowMediaPicker({ open: true, field: 'section', index: idx })}
                          >
                            Change Image
                          </Button>
                        </div>
                        {(() => {
                          const prefix = (sections[idx]?.prefix ?? 'STEP').toUpperCase();
                          const isNumbered = prefix !== "" && !prefix.includes("TESTIMONIAL") && !prefix.includes("INTRO");
                          
                          if (!isNumbered) return null;

                          let stepCount = 0;
                          for (let i = 0; i <= idx; i++) {
                            const p = (sections[i]?.prefix ?? 'STEP').toUpperCase();
                            const pIsNumbered = p !== "" && !p.includes("TESTIMONIAL") && !p.includes("INTRO");
                            if (pIsNumbered) stepCount++;
                          }
                          return (
                            <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center font-black text-xs shadow-xl z-10 animate-in zoom-in duration-200">
                              {stepCount}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Section Content Editor */}
                      <div className="flex-1 p-5 space-y-4 relative">
                        <div className="absolute top-4 right-6 flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm" onClick={() => moveSection(idx, 'up')}><ArrowUp size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm" onClick={() => moveSection(idx, 'down')}><ArrowDown size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeSection(idx)}><Trash2 size={14} /></Button>
                        </div>

                        <div className="space-y-3">
                          {(() => {
                            const prefix = (section.prefix ?? 'STEP').toUpperCase();
                            const isNumbered = prefix !== "" && !prefix.includes("TESTIMONIAL") && !prefix.includes("INTRO");
                            
                            let stepCount = 0;
                            if (isNumbered) {
                              for (let i = 0; i <= idx; i++) {
                                const p = (sections[i]?.prefix ?? 'STEP').toUpperCase();
                                const pIsNumbered = p !== "" && !p.includes("TESTIMONIAL") && !p.includes("INTRO");
                                if (pIsNumbered) stepCount++;
                              }
                            }

                            return (
                              <div className="flex items-center gap-2 mb-0.5">
                                <Input 
                                  value={section.prefix !== undefined ? section.prefix : 'STEP'}
                                  onChange={(e) => updateSection(idx, 'prefix', e.target.value.toUpperCase())}
                                  placeholder="STEP" 
                                  className="w-24 border-none bg-transparent p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] focus-visible:ring-0 placeholder:opacity-20"
                                />
                                {isNumbered && (
                                  <>
                                    <div className="w-4 h-[1px] bg-[var(--primary)]/30"></div>
                                    <span className="text-[10px] font-black text-[var(--primary)]">{stepCount}</span>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                          <Input 
                            value={section.title}
                            onChange={(e) => updateSection(idx, 'title', e.target.value)}
                            placeholder="Step Title" 
                            className="border-none bg-transparent p-1 h-auto text-xl font-serif font-bold focus-visible:ring-0 placeholder:opacity-20 text-[var(--foreground)]"
                          />
                          <Textarea 
                            value={section.description}
                            onChange={(e) => updateSection(idx, 'description', e.target.value)}
                            placeholder="Describe this step in detail..." 
                            className="w-full bg-[var(--background)] border border-[var(--border)]/45 rounded-xl p-2.5 text-sm leading-relaxed resize-y focus-visible:ring-1 focus-visible:ring-[var(--primary)]/20 placeholder:opacity-20 text-[var(--foreground)] min-h-[70px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)]/40 relative group/product flex flex-col justify-center">
                             <div className="flex items-center justify-between mb-2">
                               <Label className="text-[9px] font-black uppercase tracking-widest opacity-35 block">Attached Product</Label>
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => React.startTransition(() => setShowProductPicker({ open: true, index: idx }))}
                                 className="h-6 px-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all gap-1"
                               >
                                 <ShoppingBag size={9} /> {section.productId ? 'Change Product' : 'Attach Product'}
                               </Button>
                             </div>

                             {section.productId ? (
                               <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                 <div className="w-12 h-12 rounded-lg border border-[var(--border)] overflow-hidden shrink-0 bg-[var(--muted)] relative shadow-sm">
                                   <SafeImage src={section.image} alt="Product" fill className="object-cover" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-[11px] font-black truncate text-[var(--foreground)] tracking-tight leading-snug">{section.ctaStore}</p>
                                   <p className="text-[9px] font-bold opacity-45 truncate uppercase tracking-widest leading-none mt-0.5">{section.ctaLabel}</p>
                                 </div>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => {
                                     const newSections = [...sections];
                                     newSections[idx] = { ...newSections[idx], productId: undefined };
                                     setSections(newSections);
                                   }}
                                   className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-white transition-all shadow-sm border border-red-500/20 flex items-center justify-center shrink-0 cursor-pointer"
                                 >
                                   <X size={12} />
                                 </Button>
                               </div>
                             ) : (
                               <div className="py-3 text-center border border-dashed border-[var(--border)]/40 rounded-lg opacity-25 group-hover/product:opacity-50 transition-all cursor-pointer" onClick={() => setShowProductPicker({ open: true, index: idx })}>
                                 <ShoppingBag size={14} className="mx-auto mb-1 opacity-20" />
                                 <p className="text-[8px] font-black uppercase tracking-widest italic">Click to Link Luxury Asset</p>
                                </div>
                             )}
                          </div>

                          <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)]/40">
                             <Label className="text-[9px] font-black uppercase tracking-widest opacity-35 mb-1.5 block">Pull Quote / Summary</Label>
                             <Textarea 
                              value={section.summary}
                              onChange={(e) => updateSection(idx, 'summary', e.target.value)}
                              placeholder="A punchy takeaway..." 
                              className="border-none bg-transparent p-0 min-h-[30px] text-sm font-serif italic focus-visible:ring-0 resize-y placeholder:opacity-20 leading-relaxed text-[var(--foreground)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[var(--border)]/30 items-center">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">CTA Label</Label>
                            <Input 
                              value={section.ctaLabel}
                              onChange={(e) => updateSection(idx, 'ctaLabel', e.target.value)}
                              className="h-9 rounded-lg bg-[var(--background)] text-[10px] font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Store Name</Label>
                            <Input 
                              value={section.ctaStore}
                              onChange={(e) => updateSection(idx, 'ctaStore', e.target.value)}
                              className="h-9 rounded-lg bg-[var(--background)] text-[10px] font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Affiliate URL</Label>
                            <Input 
                              value={section.ctaUrl}
                              onChange={(e) => updateSection(idx, 'ctaUrl', e.target.value)}
                              className="h-9 rounded-lg bg-[var(--background)] text-[10px] font-bold"
                            />
                          </div>
                          {!section.productId && (
                            <div className="col-span-3 flex items-center justify-between mt-2 p-3 bg-[var(--muted)]/20 rounded-xl border border-[var(--border)]/30">
                              <div className="space-y-0.5 text-left">
                                <Label htmlFor={`disable-cta-${idx}`} className="text-[10px] font-black uppercase tracking-widest opacity-70 cursor-pointer">Disable Shop Button</Label>
                                <p className="text-[8px] opacity-40 font-medium leading-normal">Toggle to hide or disable the CTA link for this step in the live preview.</p>
                              </div>
                              <input
                                type="checkbox"
                                id={`disable-cta-${idx}`}
                                checked={!!section.hideCta}
                                onChange={(e) => updateSection(idx, 'hideCta', e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]/20 accent-[var(--primary)] cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bottom Add Section Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={addSection} 
                  variant="outline" 
                  className="rounded-full h-12 px-8 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-[var(--primary)]/10"
                >
                  <Plus size={16} /> Append New Infographic Step
                </Button>
              </div>

              {/* Ad Products (Below Blog) */}
              <Card className="rounded-[32px] border-[var(--border)] bg-[var(--card)] p-8 space-y-6 shadow-sm mt-8">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Product Ads Below Article</h3>
                    <p className="text-[10px] opacity-40 mt-1">Choose up to 6 custom product recommendations/ads to display at the bottom of this blog post.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProductPicker({ open: true, index: -1 })} 
                    className="h-8 text-[10px] font-black uppercase tracking-widest gap-1.5 border-[var(--border)] hover:bg-[var(--primary)]/5 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ad Product
                  </Button>
                </div>
                
                {adProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {adProducts.map((pc, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] group relative">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--muted)] relative shrink-0">
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
                          className="absolute top-3 right-3 text-red-500 hover:bg-red-500/10 p-1.5 rounded-xl transition-all"
                          title="Remove Ad"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed border-[var(--border)] rounded-2xl opacity-40">
                    <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No custom ads added. Default trending products will be shown.</span>
                  </div>
                )}
              </Card>

              {/* Bottom Banner Section */}
              <Card className="rounded-[32px] border-[var(--border)] bg-[var(--card)] p-8 space-y-6 shadow-sm mt-8">
                <div className="border-b border-[var(--border)] pb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Bottom Banner</h3>
                  <p className="text-[10px] opacity-40 mt-1">Customize the horizontal banner advertisement displayed at the bottom of the article.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Banner Subtitle (Spotlight)</Label>
                      <Input 
                        value={formData.bottomBannerSubtitle} 
                        onChange={(e) => setFormData(p => ({ ...p, bottomBannerSubtitle: e.target.value }))}
                        placeholder="e.g. Seasonal Spotlight" 
                        className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Banner Title</Label>
                      <Input 
                        value={formData.bottomBannerTitle} 
                        onChange={(e) => setFormData(p => ({ ...p, bottomBannerTitle: e.target.value }))}
                        placeholder="e.g. Curate Your 2026 Wardrobe" 
                        className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Button Label</Label>
                      <Input 
                        value={formData.bottomBannerButtonText} 
                        onChange={(e) => setFormData(p => ({ ...p, bottomBannerButtonText: e.target.value }))}
                        placeholder="e.g. View New Arrivals" 
                        className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Redirect Destination URL / Slug</Label>
                      <Input 
                        value={formData.bottomBannerButtonUrl} 
                        onChange={(e) => setFormData(p => ({ ...p, bottomBannerButtonUrl: e.target.value }))}
                        placeholder="e.g. /shop, https://amazon.com/... or a product slug" 
                        className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Banner Background Image</Label>
                  {bottomBannerImage ? (
                    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden group border border-[var(--border)]">
                      <SafeImage src={bottomBannerImage} alt="Bottom Banner" fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <Button 
                          onClick={() => setShowMediaPicker({ open: true, field: 'bottomBanner' })} 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-full font-black text-[9px] uppercase tracking-widest h-10 px-6 shadow-2xl"
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowMediaPicker({ open: true, field: 'bottomBanner' })} 
                      className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--primary)]/30 transition-all opacity-40 hover:opacity-100"
                    >
                      <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Banner Background Image</span>
                    </button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="px-4">
          <div className="max-w-5xl mx-auto bg-[var(--background)] rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-[var(--border)]">
            <div className={cn(
              "p-20 text-center border-b border-[var(--border)]/10 relative overflow-hidden transition-all duration-500",
              headerImage ? "min-h-[500px] flex flex-col justify-center text-white" : "text-[var(--foreground)]"
            )}>
              {headerImage && (
                <>
                  <img src={headerImage} alt="Bg" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--background)]/10"></div>
                </>
              )}
              <div className="relative z-10">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.5em]",
                  headerImage ? "text-white" : "text-[var(--primary)]"
                )}>{formData.category}</span>
                <h1 className="text-5xl font-serif font-bold mt-6 mb-10 tracking-tight leading-tight">{formData.title || 'Your Article Title'}</h1>
                <div className={cn(
                  "flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest",
                  headerImage ? "text-white/70" : "opacity-30"
                )}>
                  <span>By Fashcon Editors</span>
                  <span>•</span>
                  <span>{formData.date}</span>
                </div>
              </div>
            </div>

            <div className="p-12 space-y-32">
              {(() => {
                let currentStep = 0;
                return sections.map((section, idx) => {
                  const prefixStr = (section.prefix !== undefined ? section.prefix : 'STEP');
                  const showLabel = prefixStr !== "";
                  const isNumbered = showLabel && !prefixStr.toUpperCase().includes("TESTIMONIAL");
                  if (isNumbered) currentStep++;

                  return (
                    <div key={idx} className={cn("flex flex-col md:flex-row gap-16 items-center text-[var(--foreground)]", idx % 2 === 1 && "md:flex-row-reverse")}>
                      <div className="relative w-full md:w-1/2 aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl bg-[var(--secondary)]">
                        <SafeImage 
                          src={section.image} 
                          alt={section.title} 
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="w-full md:w-1/2 space-y-6 text-left">
                        {showLabel && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">
                              {prefixStr}{isNumbered && ` ${currentStep}`}
                            </span>
                          </div>
                        )}
                        <h2 className="text-4xl font-serif font-bold leading-tight">{section.title}</h2>
                        <p className="text-lg opacity-70 leading-relaxed font-sans">{section.description}</p>
                        {section.summary && (
                          <div className="p-8 bg-[var(--muted)] rounded-[32px] border border-[var(--border)] italic font-serif text-base opacity-80">
                            &quot;{section.summary}&quot;
                          </div>
                        )}
                        {section.ctaLabel && !section.hideCta && (
                          <div className="pt-4">
                            <Button className="rounded-full bg-[var(--primary)] h-14 px-10 text-[11px] font-black uppercase tracking-widest shadow-xl">
                              {section.ctaLabel}
                            </Button>
                            {section.ctaStore && (
                              <p className="mt-3 text-[9px] font-black uppercase tracking-widest opacity-30 ml-4">Available at {section.ctaStore}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            <div className="p-20 text-center bg-[var(--muted)] border-t border-[var(--border)]/10">
              <p className="text-xs font-black uppercase tracking-widest opacity-30 mb-4 italic">The end of this story.</p>
              <Button variant="ghost" className="font-serif italic text-2xl opacity-60 text-[var(--foreground)]">Back to Journal</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SEOPanel
        isOpen={showSEO}
        onClose={() => setShowSEO(false)}
        title={formData.title}
        slug={formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}
        metaDescription={formData.metaDescription}
        keywords={formData.keywords}
        content={sections.map(s => s.title + ' ' + s.description + ' ' + s.summary).join(' ')}
        excerpt={formData.excerpt}
        coverImage={featuredImage || ''}
        onMetaDescriptionChange={(val) => setFormData(prev => ({ ...prev, metaDescription: val }))}
        onKeywordsChange={(val) => setFormData(prev => ({ ...prev, keywords: val }))}
      />
    </div>
  );
}
