'use client';

import React, { useState, useEffect } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Store, 
  Tag, 
  DollarSign,
  Loader2,
  Plus,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { getCategories } from '@/app/actions/categories';
import { createProduct } from '@/app/actions/products';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setManualImageUrl(''); // Clear manual URL if file is picked
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      // NOTE: Firebase Storage was used here. 
      // For MongoDB migration, we'll use the manual URL or a placeholder if no storage provider is set up yet.
      let finalImageUrl = manualImageUrl || imagePreview || '';
      
      if (image && !manualImageUrl) {
        toast.info("Local file upload requires a storage provider (e.g. Cloudinary). Using preview URL for now.");
      }

      await createProduct({
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price') as string) || 0,
        salePrice: formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : null,
        merchant: formData.get('merchant'),
        category: formData.get('category'),
        subCategory: formData.get('subCategory'),
        affiliateLink: formData.get('affiliateLink'),
        image: finalImageUrl,
        status: 'active',
      });

      toast.success("Product created successfully");
      router.push('/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-[var(--border)]" asChild>
            <Link href="/products">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-[13px] text-[var(--muted-foreground)]">Create a new affiliate product entry.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 px-4 border-[var(--border)]" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            form="product-form" 
            disabled={loading} 
            size="sm"
            className="h-9 px-6 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-sm gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Product
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] opacity-60">General Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[12px] font-semibold">Product Title</Label>
                <Input 
                  id="title"
                  name="title" 
                  required 
                  placeholder="e.g. Oversized Mohair Cardigan" 
                  className="h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[12px] font-semibold">Description</Label>
                <Textarea 
                  id="description"
                  name="description" 
                  placeholder="Describe the product details, aesthetic, and fit..." 
                  className="min-h-[160px] bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] opacity-60">Affiliate Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="affiliateLink" className="text-[12px] font-semibold">Destination URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  <Input 
                    id="affiliateLink"
                    name="affiliateLink" 
                    required 
                    placeholder="https://merchant.com/product/..." 
                    className="pl-9 h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant" className="text-[12px] font-semibold">Merchant / Brand</Label>
                <Input id="merchant" name="merchant" required placeholder="e.g. Farfetch" className="h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[12px] font-semibold">Category</Label>
                <Select name="category" value={selectedCategory} onValueChange={(val: string | null) => setSelectedCategory(val || '')}>
                  <SelectTrigger className="h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--background)] border-[var(--border)]">
                    {categories.filter(cat => !cat.parentCategory).map(cat => (
                      <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && categories.some(c => c.parentCategory === selectedCategory) && (
                <div className="space-y-2">
                  <Label htmlFor="subCategory" className="text-[12px] font-semibold">Sub Category</Label>
                  <Select name="subCategory">
                    <SelectTrigger className="h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20">
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--background)] border-[var(--border)]">
                      {categories.filter(cat => cat.parentCategory === selectedCategory).map(cat => (
                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assets & Pricing */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] opacity-60">Product Image</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div 
                onClick={() => document.getElementById('image-upload')?.click()}
                className={cn(
                  "aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative group bg-[var(--background)]",
                  imagePreview ? "border-transparent" : "border-[var(--border)] hover:bg-[var(--primary)]/[0.02] hover:border-[var(--primary)]/30"
                )}
              >
                {imagePreview ? (
                  <>
                    <SafeImage src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                       <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                         <Upload className="text-white w-5 h-5" />
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/5 flex items-center justify-center border border-[var(--primary)]/10">
                      <ImageIcon className="text-[var(--primary)] w-6 h-6 opacity-40" />
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-bold">Click to upload</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">3:4 aspect ratio recommended</p>
                    </div>
                  </>
                )}
              </div>
              <input id="image-upload" type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] opacity-60">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[12px] font-semibold">Retail Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-bold text-sm">$</span>
                  <Input 
                    id="price"
                    name="price" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00" 
                    className="pl-7 h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]/20 font-bold" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-[12px] font-semibold">Sale Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">$</span>
                  <Input 
                    id="salePrice"
                    name="salePrice" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="pl-7 h-10 bg-[var(--background)] border-[var(--border)] focus-visible:ring-emerald-500/20 text-emerald-500 font-bold" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
