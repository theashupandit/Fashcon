'use client';

import React, { useState, useEffect } from 'react';
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
  ShoppingBag
} from 'lucide-react';
import { createBlog } from '@/app/actions/blogs';
import { getCategories } from '@/app/actions/categories';
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
  const [showMediaPicker, setShowMediaPicker] = useState<{ open: boolean, field: string, index?: number }>({ open: false, field: '' });
  const [showProductPicker, setShowProductPicker] = useState<{ open: boolean, index?: number }>({ open: false });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [showSEO, setShowSEO] = useState(false);
  
  // Blog Content State
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    cardInfo: '',
    metaDescription: '',
    keywords: [] as string[],
    category: 'Beauty',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  });

  const [sections, setSections] = useState<Section[]>([
    {
      title: 'Step 1: Introduction',
      description: 'Explain the first step of your guide here...',
      summary: 'Keep it short and punchy for the pull-quote.',
      image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=1000&auto=format&fit=crop',
      ctaLabel: 'Shop Now',
      ctaStore: 'Sephora',
      ctaUrl: '#',
      prefix: 'STEP'
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

  const addSection = () => {
    setSections([...sections, {
      title: `Step ${sections.length + 1}: Title`,
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
      const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      await createBlog({
        ...formData,
        slug,
        image: featuredImage || sections[0]?.image || '',
        thumbnailImage: thumbnailImage || '',
        headerImage: headerImage || '',
        sections,
        tags,
        status: 'published',
        author: 'Fashcon Editors',
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
        <RichTextBlogEditor mode="new" />
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
        className="px-4"
        actions={
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-4">
              <TabsList className="bg-[var(--foreground)]/5 p-1 rounded-full border border-[var(--border)] h-10">
                <TabsTrigger value="compose" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm">
                  <Type className="w-3 h-3 mr-2" /> Compose
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm">
                  <Eye className="w-3 h-3 mr-2" /> Live Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              onClick={() => setShowSEO(true)}
              className="h-10 px-4 rounded-full border-[var(--border)] gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-500" /> SEO
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="h-10 px-6 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg active:scale-95 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
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
          if (typeof showProductPicker.index === 'number') {
            const idx = showProductPicker.index;
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
            <div className="lg:col-span-4 space-y-6 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-thumb]:rounded-full">
              <Card className="rounded-[32px] border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
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
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. 10 Tips for Glowing Skin" 
                      className="h-12 rounded-xl bg-[var(--background)] font-bold text-lg border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Excerpt / Deck</Label>
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
                      <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] tracking-widest shrink-0">Boutique Card</span>
                    </div>
                    <Textarea 
                      value={formData.cardInfo}
                      onChange={(e) => setFormData({...formData, cardInfo: e.target.value})}
                      placeholder="Detailed text to show in the sliding pull-out card drawer..." 
                      className="min-h-[100px] rounded-xl bg-[var(--background)] border-[var(--border)] p-4 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Category</Label>
                      <Select value={formData.category || ''} onValueChange={(val) => setFormData({...formData, category: val || ''})}>
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--background)] border-[var(--border)] font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {categories.map(cat => (
                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
              <Card className="rounded-[32px] border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Taxonomy
                  </CardTitle>
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
                          const isNumbered = prefix !== "" && !prefix.includes("TESTIMONIAL");
                          
                          if (!isNumbered) return null;

                          let stepCount = 0;
                          for (let i = 0; i <= idx; i++) {
                            const p = (sections[i]?.prefix ?? 'STEP').toUpperCase();
                            if (p !== "" && !p.includes("TESTIMONIAL")) stepCount++;
                          }
                          return (
                            <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-xs shadow-xl z-10">
                              {stepCount}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Section Content Editor */}
                      <div className="flex-1 p-8 space-y-6 relative">
                        <div className="absolute top-4 right-6 flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm" onClick={() => moveSection(idx, 'up')}><ArrowUp size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm" onClick={() => moveSection(idx, 'down')}><ArrowDown size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[var(--background)]/50 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeSection(idx)}><Trash2 size={14} /></Button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Input 
                              value={section.prefix !== undefined ? section.prefix : 'STEP'}
                              onChange={(e) => updateSection(idx, 'prefix', e.target.value.toUpperCase())}
                              placeholder="STEP" 
                              className="w-20 border-none bg-transparent p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] focus-visible:ring-0 placeholder:opacity-20"
                            />
                            <div className="w-4 h-[1px] bg-[var(--primary)]/30"></div>
                            <span className="text-[10px] font-black text-[var(--primary)]">{idx + 1}</span>
                          </div>
                          <Input 
                            value={section.title}
                            onChange={(e) => updateSection(idx, 'title', e.target.value)}
                            placeholder="Step Title" 
                            className="border-none bg-transparent p-1 h-auto text-2xl font-serif font-bold focus-visible:ring-0 placeholder:opacity-20 text-[var(--foreground)]"
                          />
                          <Textarea 
                            value={section.description}
                            onChange={(e) => updateSection(idx, 'description', e.target.value)}
                            placeholder="Describe this step in detail..." 
                            className="border-none bg-transparent p-1 min-h-[80px] text-sm leading-relaxed resize-none focus-visible:ring-0 placeholder:opacity-20 text-[var(--foreground)]"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)]/50 relative group/product">
                             <div className="flex items-center justify-between mb-4">
                               <Label className="text-[9px] font-black uppercase tracking-widest opacity-30 block">Attached Product</Label>
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => setShowProductPicker({ open: true, index: idx })}
                                 className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all gap-1.5"
                               >
                                 <ShoppingBag size={10} /> {section.productId ? 'Change Product' : 'Attach Product'}
                               </Button>
                             </div>

                             {section.productId ? (
                               <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                 <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden shrink-0 bg-[var(--muted)]">
                                   <SafeImage src={section.image} alt="Product" fill className="object-cover" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-[11px] font-bold truncate">{section.ctaStore}</p>
                                   <p className="text-[10px] opacity-50 truncate">{section.ctaLabel} at {section.ctaStore}</p>
                                 </div>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => {
                                     const newSections = [...sections];
                                     newSections[idx] = { ...newSections[idx], productId: undefined };
                                     setSections(newSections);
                                   }}
                                   className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover/product:opacity-100 transition-opacity"
                                 >
                                   <X size={14} />
                                 </Button>
                               </div>
                             ) : (
                               <div className="py-4 text-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-20">
                                 <p className="text-[10px] font-bold uppercase tracking-widest italic">No product linked to this step</p>
                               </div>
                             )}
                          </div>

                          <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)]/50">
                             <Label className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 block">Pull Quote / Summary</Label>
                             <Textarea 
                              value={section.summary}
                              onChange={(e) => updateSection(idx, 'summary', e.target.value)}
                              placeholder="A punchy takeaway..." 
                              className="border-none bg-transparent p-0 min-h-[40px] text-sm font-serif italic focus-visible:ring-0 resize-none placeholder:opacity-20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]/50">
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
                        {section.ctaLabel && (
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
