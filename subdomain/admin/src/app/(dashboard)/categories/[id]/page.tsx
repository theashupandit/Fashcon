'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Image as ImageIcon, Layout, Type, AlignLeft, AlignCenter, AlignRight, Loader2, Monitor, Smartphone, Check, Plus, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/text-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";

import { toast } from "sonner";
import { updateCategory, getCategories } from '@/app/actions/categories';
import { getProducts, updateProduct } from '@/app/actions/products';
import { MediaPickerModal } from '@/components/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { Search, RefreshCw, X } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'product' | 'blog';
  description?: string;
  heroImage?: string;
  bannerImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroAlignment?: 'left' | 'center' | 'right';
  parentCategory?: string;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

export default function CategoryEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isBannerMediaOpen, setIsBannerMediaOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const all = await getCategories();
        setAllCategories(all);
        const match = all.find((c: any) => c._id === id);
        if (match) {
          console.log("Loaded Category:", JSON.stringify(match, null, 2));
          console.log("All Categories:", JSON.stringify(all.map((c: any) => ({ _id: c._id, name: c.name, parentCategory: c.parentCategory })), null, 2));
          setCategory(match);
        } else {
          toast.error("Category not found");
          router.push('/categories');
        }
      } catch (error) {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, router]);

  useEffect(() => {
    if (category) {
      const fetchCategoryProducts = async () => {
        setProductsLoading(true);
        try {
          const res = await getProducts({ category: category.name, limit: 100 });
          setProducts(res.products);
        } catch (error) {
          console.error("Failed to fetch category products:", error);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchCategoryProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.name]);  const fetchGlobalProducts = async () => {
    setAssignLoading(true);
    try {
      const res = await getProducts({ limit: 500 });
      setAllProducts(res.products);
    } catch (e) {
      toast.error("Failed to fetch products");
    } finally {
      setAssignLoadingAction(false); // Wait, I used assignLoading in state
    }
  };

  // Helper for state name alignment
  const setAssignLoadingAction = (val: boolean) => setAssignLoading(val);

  const handleToggleProduct = async (product: any) => {
    if (!category) return;
    const isCurrentlyAssigned = product.category === category.name;
    const newCategory = isCurrentlyAssigned ? 'Uncategorized' : category.name;
    
    try {
      // Optimistic Update global list
      setAllProducts(prev => prev.map(p => p._id === product._id ? { ...p, category: newCategory } : p));
      
      await updateProduct(product._id, { category: newCategory });
      
      // Update local products list
      if (!isCurrentlyAssigned) {
        setProducts(prev => [...prev, { ...product, category: newCategory }].sort((a, b) => a.title.localeCompare(b.title)));
      } else {
        setProducts(prev => prev.filter(p => p._id !== product._id));
      }
      
      toast.success(isCurrentlyAssigned ? "Product removed" : "Product assigned");
    } catch (e) {
      toast.error("Update failed");
      setAllProducts(prev => prev.map(p => p._id === product._id ? { ...p, category: product.category } : p));
    }
  };

  const handleSave = async () => {
    if (!category) return;
    setIsSaving(true);
    try {
      await updateCategory(category._id, category);
      toast.success("Category updated successfully");
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Initializing Control Center...</p>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      <PageHeader
        title={toTitleCase(category.name)}
        subtitle="Landing Page Configuration"
        badge="Taxonomy"
        className="pb-6"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--foreground)]/5 rounded-2xl p-1 border border-[var(--border)] mr-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("w-10 h-10 rounded-xl transition-all", previewMode === 'desktop' ? "bg-[var(--background)] text-[var(--primary)] shadow-sm" : "opacity-40 hover:opacity-100")}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("w-10 h-10 rounded-xl transition-all", previewMode === 'mobile' ? "bg-[var(--background)] text-[var(--primary)] shadow-sm" : "opacity-40 hover:opacity-100")}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone size={18} />
              </Button>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="h-10 px-6 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-medium text-sm gap-2 shadow-md active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
        {/* Left Side: Editor */}
        <div className="w-[450px] flex flex-col gap-8 overflow-y-auto pr-4 scrollbar-hide">
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid grid-cols-3 h-12 bg-zinc-100 dark:bg-black/40 rounded-xl p-1 border border-zinc-200 dark:border-white/5 mb-8">
              <TabsTrigger value="hero" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                <ImageIcon size={14} className="mr-2" /> Hero Scene
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                <Type size={14} className="mr-2" /> Content
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                <Layout size={14} className="mr-2" /> Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Landing Hero Image</Label>
                <div 
                  className={cn(
                    "group relative w-full aspect-video rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)]/40 transition-all",
                    category.heroImage && "border-solid"
                  )}
                  onClick={() => setIsMediaOpen(true)}
                >
                  {category.heroImage ? (
                    <>
                      <img src={category.heroImage} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-white/10">Replace Visual</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
                        <Plus size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Select High-Res Image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Slider Banner Image (Home Slider)</Label>
                <div 
                  className={cn(
                    "group relative w-48 aspect-[3/4] mx-auto rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400/40 transition-all",
                    category.bannerImage && "border-solid"
                  )}
                  onClick={() => setIsBannerMediaOpen(true)}
                >
                  {category.bannerImage ? (
                    <>
                      <img src={category.bannerImage} alt="" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-white/10">Change Banner</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Homepage Slider Visual</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Hero Alignment</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'left', icon: AlignLeft, label: 'Align Left' },
                    { id: 'center', icon: AlignCenter, label: 'Center' },
                    { id: 'right', icon: AlignRight, label: 'Align Right' },
                  ].map((align) => (
                    <button
                      key={align.id}
                      onClick={() => setCategory({ ...category, heroAlignment: align.id as any })}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 transition-all",
                        category.heroAlignment === align.id ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]" : "border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-white/40 opacity-40 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-white/5"
                      )}
                    >
                      <align.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{align.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Landing Page Slug (Root URL)</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-white/20 font-bold text-[15px]">/</span>
                  <Input 
                    value={category.slug}
                    onChange={(e) => setCategory({ ...category, slug: e.target.value })}
                    className="h-16 rounded-[1.25rem] bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[18px] font-bold pl-10 pr-8"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Display Name</Label>
                <Input 
                  placeholder="e.g. Dresses"
                  value={category.name || ''}
                  onChange={(e) => setCategory({ ...category, name: e.target.value })}
                  className="h-16 rounded-[1.25rem] bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[18px] font-bold px-8"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Parent Category</Label>
                <Select value={category.parentCategory || ''} onValueChange={(value) => setCategory({ ...category, parentCategory: value || undefined })}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 focus:border-[var(--primary)]/30 text-sm font-medium px-4 outline-none">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/10">
                    <SelectItem value="" className="text-sm font-medium py-2 px-3 focus:bg-zinc-100 dark:focus:bg-white/5 cursor-pointer rounded-lg">None (Top Level)</SelectItem>
                    {allCategories.filter(c => !c.parentCategory && c._id !== category._id).map(c => (
                      <SelectItem key={c._id} value={c.name} className="text-sm font-medium py-2 px-3 focus:bg-zinc-100 dark:focus:bg-white/5 cursor-pointer rounded-lg">{toTitleCase(c.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Hero Headline</Label>
                <Input 
                  placeholder="Enter a powerful title..."
                  value={category.heroTitle || ''}
                  onChange={(e) => setCategory({ ...category, heroTitle: e.target.value })}
                  className="h-16 rounded-[1.25rem] bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[18px] font-bold px-8"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Hero Sub-Headline</Label>
                <Textarea 
                  placeholder="Describe this category's unique value..."
                  value={category.heroSubtitle || ''}
                  onChange={(e) => setCategory({ ...category, heroSubtitle: e.target.value })}
                  className="min-h-[120px] rounded-[1.5rem] bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[15px] font-medium p-8 resize-none"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Footer / SEO Description</Label>
                <Textarea 
                  placeholder="Additional context for search engines..."
                  value={category.description || ''}
                  onChange={(e) => setCategory({ ...category, description: e.target.value })}
                  className="min-h-[120px] rounded-[1.5rem] bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[14px] font-medium p-8 resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-10">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Assigned Products ({products.length})</Label>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-emerald-400" onClick={() => {
                    setIsAssignModalOpen(true);
                    fetchGlobalProducts();
                  }}>
                    <Plus size={12} className="mr-1" /> Select Existing
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-blue-400" onClick={() => router.push('/products/add')}>
                    <Plus size={12} className="mr-1" /> Add New
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center opacity-20">
                  <Loader2 className="animate-spin mb-4" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fetching inventory...</span>
                </div>
              ) : products.length > 0 ? (
                <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-zinc-100 dark:bg-white/5">
                      <TableRow className="hover:bg-transparent border-zinc-200 dark:border-white/5">
                        <TableHead className="w-[60px] text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/40 h-10">Item</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/40 h-10">Product</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/40 h-10 text-right">Price</TableHead>
                        <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/40 h-10 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow 
                          key={p._id} 
                          className="hover:bg-zinc-50 dark:hover:bg-white/5 border-zinc-200 dark:border-white/5 cursor-pointer group transition-colors"
                          onClick={() => router.push(`/products/${p._id}/edit`)}
                        >
                          <TableCell className="py-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 relative">
                              <SafeImage src={p.media?.mainImage} alt={p.title} className="w-full h-full object-cover" fill />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-zinc-800 dark:text-white truncate max-w-[150px]">{p.title}</span>
                              <span className="text-[10px] text-zinc-400 dark:text-white/30 font-medium uppercase tracking-wider">{p.brand}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-emerald-500">₹{p.prices?.offer?.toLocaleString()}</span>
                              {p.prices?.original > p.prices?.offer && (
                                <span className="text-[10px] text-zinc-400 dark:text-white/20 line-through">₹{p.prices?.original?.toLocaleString()}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={p.status === 'published' ? 'secondary' : 'outline'} className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5",
                              p.status === 'published' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "opacity-40"
                            )}>
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] opacity-30">
                  <Layout size={40} className="mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-center">
                    No products in this category.<br/>
                    <span className="text-[9px] font-medium opacity-50 lowercase tracking-normal">assigned items will appear here in tabular form.</span>
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: High-Fidelity Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-100 dark:bg-[#050505] rounded-[3rem] border border-zinc-200 dark:border-white/[0.05] p-12 relative overflow-hidden">
          <div className="absolute top-8 left-12 flex items-center gap-3 opacity-30">
            <Layout size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Real-Time Visualization</span>
          </div>

          <div className={cn(
            "relative bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden",
            previewMode === 'desktop' ? "w-full aspect-[16/9] rounded-2xl" : "w-[320px] h-[568px] rounded-[3rem] border-[8px] border-[#1a1a1a]"
          )}>
            <CategoryHeroPreview data={category} mode={previewMode} />
          </div>

          <div className="mt-8 flex items-center gap-6 opacity-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Live Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Media Selection Modal */}
      <MediaPickerModal 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        onSelect={(assets) => {
          const asset = assets[0];
          if (asset && category) {
            setCategory({ ...category, heroImage: asset.url });
            toast.success("Hero image attached");
          }
          setIsMediaOpen(false);
        }} 
      />
      {/* Banner Image Modal */}
      <MediaPickerModal 
        isOpen={isBannerMediaOpen} 
        onClose={() => setIsBannerMediaOpen(false)} 
        onSelect={(assets) => {
          const asset = assets[0];
          if (asset && category) {
            setCategory({ ...category, bannerImage: asset.url });
            toast.success("Slider banner attached");
          }
          setIsBannerMediaOpen(false);
        }} 
      />

      {/* Product Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-10 max-w-2xl shadow-2xl backdrop-blur-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Assign Inventory</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-zinc-400 dark:text-white/30 pt-1 uppercase tracking-[0.2em]">Select products to link with {category.name}</DialogDescription>
          </DialogHeader>

          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/20" size={16} />
            <Input 
              placeholder="Search global inventory..." 
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              className="h-12 pl-12 rounded-xl bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30"
            />
          </div>

          <div className="flex-1 overflow-y-auto mt-6 pr-2 scrollbar-hide">
            {assignLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin opacity-20" size={32} />
              </div>
            ) : (
              <div className="space-y-2">
                {allProducts.filter(p => p.title.toLowerCase().includes(assignSearch.toLowerCase())).map(p => {
                  const isAssigned = p.category === category.name;
                  return (
                    <div 
                      key={p._id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                        isAssigned ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/5"
                      )}
                      onClick={() => handleToggleProduct(p)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                          <SafeImage src={p.media?.mainImage} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-zinc-800 dark:text-white">{p.title}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-white/30 font-black uppercase tracking-widest">{p.brand || 'No Brand'}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        isAssigned ? "bg-[var(--primary)] border-[var(--primary)]" : "border-zinc-300 dark:border-white/10"
                      )}>
                        {isAssigned && <Check size={14} className="text-white" strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button onClick={() => setIsAssignModalOpen(false)} className="w-full h-14 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] shadow-2xl">
              Done Selecting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryHeroPreview({ data, mode }: { data: Category, mode: 'desktop' | 'mobile' }) {
  const alignment = data.heroAlignment || 'left';
  
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center mx-auto',
    right: 'items-end text-right ml-auto',
  };

  const gradient = 
    alignment === 'left' ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent' :
    alignment === 'center' ? 'bg-gradient-to-b from-black/40 via-transparent to-black/80' :
    'bg-gradient-to-l from-black/80 via-black/40 to-transparent';

  return (
    <div className="w-full h-full relative flex items-center overflow-hidden bg-zinc-900">
      {data.heroImage ? (
        <img src={data.heroImage} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <ImageIcon size={100} />
        </div>
      )}
      
      <div className={cn("absolute inset-0 z-10", gradient)} />

      <div className={cn(
        "relative z-20 w-full px-8 sm:px-12 flex flex-col gap-3",
        alignmentClasses[alignment]
      )}>
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white/50 animate-in fade-in slide-in-from-bottom-2 duration-700">
          Exclusive Selection
        </span>
        <h2 className={cn(
          "font-black tracking-tighter leading-[1.1] text-white animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100",
          mode === 'desktop' ? "text-5xl" : "text-3xl"
        )}>
          {data.heroTitle || data.name}
        </h2>
        <p className={cn(
          "font-medium text-white/60 leading-relaxed max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200",
          mode === 'desktop' ? "text-sm" : "text-[12px]"
        )}>
          {data.heroSubtitle || "Explore the latest curation in " + data.name}
        </p>
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Button className="rounded-full px-8 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-white/90">
            Discover {data.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
