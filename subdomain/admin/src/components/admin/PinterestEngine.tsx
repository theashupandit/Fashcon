'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/text-area";
import { 
  Send, 
  Calendar, 
  BarChart3, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Package, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Archive,
  Trash2,
  FileText,
  LayoutGrid,
  ExternalLink,
  Sparkles,
  Eye,
  Target,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { toast } from "sonner";
import { 
  getPinterestBoards, 
  getPinterestAnalytics, 
  createPin, 
  getPins, 
  updatePin, 
  deletePin,
  publishPinImmediately,
  generatePinContentAI,
  saveGeminiApiKey,
  getPinterestIntegration,
  importPinAsProduct
} from '@/app/actions/pinterest';
import { getProducts } from '@/app/actions/products';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import PinterestOverallPerformance from './PinterestOverallPerformance';
import PinterestCard from '@/components/admin/PinterestCard';
import PremiumDateTimePicker from './PremiumDateTimePicker';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPinterest } from 'react-icons/fa';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

import { useSearchParams } from 'next/navigation';

function formatDisplayName(str: string, maxLength: number = 60) {
  if (!str) return '';
  let formatted = str;
  if (str === str.toUpperCase()) {
    formatted = str
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (!word) return '';
        if (word === '|' || word === '-' || word === '&') return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
  if (formatted.length > maxLength) {
    return formatted.slice(0, maxLength) + '...';
  }
  return formatted;
}

export default function PinterestEngine({ initialView }: { initialView?: string }) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  
  // Map new route slugs to internal tab names
  const viewMapping: Record<string, string> = {
    'studio': 'publisher',
    'pipeline': 'moderation',
    'scheduler': 'scheduled',
    'analytics': 'analytics',
    'trends': 'live-pins',
    'ai-lab': 'settings'
  };

  const getEffectiveView = () => {
    if (initialView && viewMapping[initialView]) return viewMapping[initialView];
    if (initialView) return initialView;
    if (viewParam && viewMapping[viewParam]) return viewMapping[viewParam];
    if (viewParam) return viewParam;
    return 'publisher';
  };

  const [activeTab, setActiveTab] = useState(getEffectiveView());
  const [boards, setBoards] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    const effectiveView = getEffectiveView();
    setActiveTab(effectiveView);
  }, [viewParam, initialView]);

  // Publisher State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [altText, setAltText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  // AI states
  const [isGeneratingAI, setIsGeneratingAI] = useState<Record<string, boolean>>({
    title: false,
    description: false,
    altText: false,
    all: false
  });
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const handleSaveApiKey = async () => {
    if (!geminiKeyInput || geminiKeyInput === '••••••••••••••••') {
      toast.error("Please enter a valid API key");
      return;
    }
    setIsSavingKey(true);
    try {
      await saveGeminiApiKey(geminiKeyInput);
      toast.success("Gemini API key saved successfully!");
      setHasApiKey(true);
      setGeminiKeyInput('••••••••••••••••');
    } catch (error) {
      toast.error("Failed to save API key");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleAIGenerate = async (type: 'title' | 'description' | 'altText' | 'all') => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }
    
    setIsGeneratingAI(prev => ({ ...prev, [type]: true }));
    try {
      const result = await generatePinContentAI(
        selectedProduct._id,
        selectedImage || selectedProduct.media?.mainImage || '',
        type
      );
      
      if (type === 'title' || type === 'all') {
        if (result.title) setTitle(result.title);
      }
      if (type === 'description' || type === 'all') {
        if (result.description) setDescription(result.description);
      }
      if (type === 'altText' || type === 'all') {
        if (result.altText) setAltText(result.altText);
      }
      
      toast.success(`AI successfully generated ${type === 'all' ? 'fields' : type}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || `Failed to generate ${type}`);
    } finally {
      setIsGeneratingAI(prev => ({ ...prev, [type]: false }));
    }
  };

  const fetchData = async (force: boolean = false) => {
    setLoading(true);
    try {
      const [boardsData, productsData, analyticsData, pinsData, integrationData] = await Promise.all([
        getPinterestBoards(force),
        getProducts({ limit: 100 }),
        getPinterestAnalytics(force),
        getPins(),
        getPinterestIntegration()
      ]);
      setBoards(boardsData);
      setProducts(productsData.products);
      setAnalytics(analyticsData);
      setPins(pinsData);
      
      if (integrationData?.geminiApiKey) {
        setHasApiKey(true);
        setGeminiKeyInput('••••••••••••••••');
      } else {
        setHasApiKey(false);
      }

      if (force) {
        toast.success("Pinterest workspace synced successfully with live API!");
      }
    } catch (error: any) {
      console.error(error);
      if (force) {
        toast.error(error?.message || "Failed to sync Pinterest workspace with live API.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setTitle(product.title);
      setDescription(product.description || '');
      setPrice(product.prices?.offer || product.prices?.original || undefined);
      setSelectedImage(product.media?.mainImage || '');
      setAltText(product.title); // Default alt text to product title
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedImage('');
    setAltText('');
    setTitle('');
    setDescription('');
    setPrice(undefined);
    setSelectedBoard('');
    setScheduledFor('');
    toast.info("Fields cleared");
  };

  const handleCreateDraft = async () => {
    if (!selectedBoard || !selectedProduct || !selectedImage) {
      toast.error("Required fields missing");
      return;
    }

    try {
      await createPin({
        productId: selectedProduct._id,
        boardId: selectedBoard,
        imageUrl: selectedImage,
        altText,
        destinationUrl: `https://fashcon.in/go/${selectedProduct.slug}`,
        title,
        description,
        price,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 86400000), // default 24h
        status: 'draft'
      });
      toast.success("Pin created as draft");
      fetchData();
      setActiveTab('moderation');
    } catch (error: any) {
      console.error("Draft Creation Error:", error);
      toast.error(error?.message || "Failed to create draft");
    }
  };

  const handlePublishImmediately = async () => {
    if (!selectedBoard || !selectedProduct || !selectedImage) {
      toast.error("Required fields missing");
      return;
    }

    const toastId = toast.loading("Creating and publishing Pin to Pinterest...");
    try {
      const pin = await createPin({
        productId: selectedProduct._id,
        boardId: selectedBoard,
        imageUrl: selectedImage,
        altText,
        destinationUrl: `https://fashcon.in/go/${selectedProduct.slug}`,
        title,
        description,
        price,
        scheduledFor: new Date(),
        status: 'approved'
      });

      await publishPinImmediately(pin._id);
      
      toast.success("Successfully published to Pinterest!", { id: toastId });
      resetForm();
      fetchData();
      setActiveTab('moderation');
    } catch (error: any) {
      console.error("Immediate Publish Error:", error);
      toast.error(error?.message || "Failed to publish Pin", { id: toastId });
    }
  };

  const handleSchedulePin = async () => {
    if (!selectedBoard || !selectedProduct || !selectedImage) {
      toast.error("Required fields missing");
      return;
    }
    if (!scheduledFor) {
      toast.error("Please select a schedule date and time");
      return;
    }

    const toastId = toast.loading("Scheduling Pin...");
    try {
      await createPin({
        productId: selectedProduct._id,
        boardId: selectedBoard,
        imageUrl: selectedImage,
        altText,
        destinationUrl: `https://fashcon.in/go/${selectedProduct.slug}`,
        title,
        description,
        price,
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled'
      });
      toast.success("Pin scheduled successfully!", { id: toastId });
      resetForm();
      fetchData();
      setActiveTab('moderation');
    } catch (error: any) {
      console.error("Schedule Error:", error);
      toast.error(error?.message || "Failed to schedule Pin", { id: toastId });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updatePin(id, { status });
      toast.success(`Pin status: ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleImmediatePublish = async (id: string) => {
    try {
      await publishPinImmediately(id);
      toast.success("Pin published to Pinterest!");
      fetchData();
    } catch (error) {
      toast.error("Publish failed");
    }
  };

  const handleImportPinAsProduct = async (pinData: {
    title: string;
    description: string;
    imageUrl: string;
    imageUrls?: string[];
    destinationUrl?: string;
    price?: number;
  }) => {
    const loadingToast = toast.loading("Importing Pinterest asset to Fashcon product catalog...");
    try {
      await importPinAsProduct(pinData);
      toast.success("Successfully imported Pin as draft product!", { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.message || "Failed to import Pin", { id: loadingToast });
    }
  };

  // Extract gallery images from selected product
  const productGallery = selectedProduct ? [
    selectedProduct.media?.mainImage,
    ...(selectedProduct.media?.gallery || [])
  ].filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Pinterest Engine</h1>
          <p className="text-muted-foreground text-sm font-medium">Luxury visual automation & moderation center.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white">
            <RefreshCw className={loading ? "animate-spin w-4 h-4 mr-2" : "w-4 h-4 mr-2"} />
            Sync Live API
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-none p-0 h-auto flex flex-wrap items-center justify-start gap-2 mb-8 no-scrollbar">
          {[
            { value: 'publisher', label: 'Create Pin' },
            { value: 'moderation', label: 'Moderation' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'published', label: 'Published' },
            { value: 'live-pins', label: 'Profile Pins' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'settings', label: 'AI Settings', icon: <Sparkles className="w-3.5 h-3.5 text-primary" /> }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="relative px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border border-white/5 bg-white/[0.03] text-zinc-500 data-[state=active]:bg-primary/10 data-[state=active]:border-primary/40 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] flex items-center gap-2 hover:text-zinc-200 hover:bg-white/10"
            >
              {tab.icon}
              {tab.value === activeTab && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-full border border-primary/50 pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Create Pin Tab */}
        <TabsContent value="publisher" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Workstation Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-white/5 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg flex items-center gap-2 text-zinc-900 dark:text-white font-bold">
                      <Edit3 className="w-5 h-5 text-primary" /> Visual Strategy Composer
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">Draft and configure a luxury shoppable asset.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAIGenerate('all')}
                      disabled={isGeneratingAI.all || !selectedProduct}
                      className="border-primary/20 hover:border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold gap-1.5 h-8 px-3 rounded-lg disabled:opacity-40"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI.all ? "animate-spin" : ""}`} />
                      {isGeneratingAI.all ? "Writing..." : "AI Auto-Fill"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10 gap-2 h-8 px-3 rounded-lg">
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-white/80">
                        <Package className="w-3.5 h-3.5 text-zinc-400" /> Fashcon Product
                      </Label>
                      <Select onValueChange={(val) => handleProductSelect(val || '')} value={selectedProduct?._id || ''}>
                        <SelectTrigger className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 h-10 rounded-xl text-xs text-zinc-900 dark:text-zinc-100">
                          <SelectValue placeholder="Choose product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p._id} value={p._id}>
                              {formatDisplayName(p.title, 65)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-white/80">
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-400" /> Destination Board
                      </Label>
                      <Select onValueChange={(val) => setSelectedBoard(val || '')} value={selectedBoard}>
                        <SelectTrigger className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 h-10 rounded-xl text-xs text-zinc-900 dark:text-zinc-100">
                          <SelectValue placeholder="Select board..." />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.map(b => (
                            <SelectItem key={b.boardId} value={b.boardId}>
                              {formatDisplayName(b.name, 65)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Visual Asset Selector */}
                  <div className="space-y-2 p-3 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-white/40 flex items-center gap-1.5">
                        <LayoutGrid className="w-3 h-3 text-primary" /> Visual Asset Selector
                      </Label>
                    </div>
                    
                    {selectedProduct && productGallery.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar pt-1">
                        {productGallery.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedImage(img)}
                            className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                              selectedImage === img 
                                ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-md shadow-primary/25' 
                                : 'border-zinc-200 dark:border-white/10 opacity-55 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`Variant ${i}`} className="object-cover w-full h-full" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-zinc-300 dark:border-white/10 flex flex-col items-center justify-center gap-1 bg-zinc-200/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-all text-zinc-600 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Library</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input 
                          value={selectedImage} 
                          onChange={e => setSelectedImage(e.target.value)} 
                          placeholder="Paste image URL or choose from library..." 
                          className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-xs h-10 rounded-xl flex-1"
                        />
                        <Button 
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white rounded-xl h-10 px-3 text-xs"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {selectedProduct && (
                      <Input 
                        value={selectedImage} 
                        onChange={e => setSelectedImage(e.target.value)} 
                        placeholder="Or customize image URL..." 
                        className="bg-zinc-100/30 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-[10px] h-7 rounded-lg text-zinc-600 dark:text-white/60 focus:text-zinc-900 dark:focus:text-white"
                      />
                    )}
                    
                    <MediaPickerModal 
                      isOpen={isMediaPickerOpen}
                      onClose={() => setIsMediaPickerOpen(false)}
                      onSelect={(assets) => {
                        setSelectedImage(assets[0]?.url || '');
                        setIsMediaPickerOpen(false);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-zinc-800 dark:text-white/80">Pin Title</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('title')}
                        disabled={isGeneratingAI.title || !selectedProduct}
                        className="h-6 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10 px-2 rounded-md gap-1 disabled:opacity-40"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${isGeneratingAI.title ? "animate-pulse" : ""}`} />
                        {isGeneratingAI.title ? "Generating..." : "AI Suggest Name"}
                      </Button>
                    </div>
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 h-10 rounded-xl text-xs" placeholder="e.g. Elegant Silk Gown in Emerald" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-zinc-800 dark:text-white/80">Narration (Description)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('description')}
                        disabled={isGeneratingAI.description || !selectedProduct}
                        className="h-6 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10 px-2 rounded-md gap-1 disabled:opacity-40"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${isGeneratingAI.description ? "animate-pulse" : ""}`} />
                        {isGeneratingAI.description ? "Generating..." : "AI Generate Bio"}
                      </Button>
                    </div>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 min-h-[90px] rounded-xl text-xs" placeholder="Add a luxury narrative for this piece..." />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-white/80">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" /> Accessibility Alt Text
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('altText')}
                        disabled={isGeneratingAI.altText || !selectedProduct}
                        className="h-6 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10 px-2 rounded-md gap-1 disabled:opacity-40"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${isGeneratingAI.altText ? "animate-pulse" : ""}`} />
                        {isGeneratingAI.altText ? "Analyzing..." : "AI Generate Alt Tag"}
                      </Button>
                    </div>
                    <Input value={altText} onChange={e => setAltText(e.target.value)} className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 h-10 rounded-xl text-xs" placeholder="Describe the image for visually impaired users..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Schedule Time
                      </Label>
                      <PremiumDateTimePicker value={scheduledFor} onChange={setScheduledFor} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-800 dark:text-white/80">Price (INR) <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span></Label>
                      <Input 
                        type="number" 
                        value={price === undefined ? '' : price} 
                        onChange={e => {
                          const val = e.target.value;
                          setPrice(val === '' ? undefined : Number(val));
                        }} 
                        className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 h-10 rounded-xl text-xs font-medium"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/5 mt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={resetForm}
                      className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 hover:bg-red-500/5 h-10 rounded-xl px-4 transition-all"
                    >
                      Discard
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCreateDraft} 
                        className="border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white/80 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-black uppercase tracking-widest h-10 rounded-xl px-5 transition-all"
                      >
                        Save Draft
                      </Button>
                      
                      {scheduledFor ? (
                        <Button 
                          type="button"
                          onClick={handleSchedulePin}
                          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase tracking-widest h-10 rounded-xl px-6 shadow-lg shadow-teal-600/20 gap-2 transition-all active:scale-95"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Schedule Pin
                        </Button>
                      ) : (
                        <Button 
                          type="button"
                          onClick={handlePublishImmediately}
                          className="bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-widest h-10 rounded-xl px-6 shadow-lg shadow-primary/20 gap-2 transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Immersive Pinterest Live Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center lg:sticky lg:top-6">
              <div className="w-full flex flex-col items-center justify-center py-10 px-6 rounded-[32px] bg-zinc-100/50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 backdrop-blur-md shadow-inner relative overflow-hidden group/preview">
                {/* Visual subtle grid background to represent Pinterest board */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 flex flex-col items-center w-full">
                  <span className="mb-6 uppercase tracking-widest text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold bg-zinc-200/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 px-3 py-1 rounded-full">
                    Live Pinterest Preview
                  </span>
                  
                  <PinterestCard 
                    title={title} 
                    description={description} 
                    imageUrl={selectedImage} 
                    destinationUrl={selectedProduct ? `fashcon.in/go/${selectedProduct.slug}` : ''}
                    price={price}
                    className="shadow-2xl border border-zinc-200/80 dark:border-white/5 max-w-[340px] md:max-w-[360px] w-full scale-[1.02] transition-transform duration-500 rounded-[32px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {pins.filter(p => p.status === 'draft' || p.status === 'rejected').map(pin => (
                <motion.div 
                  key={pin._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col space-y-2.5 group relative"
                >
                  <PinterestCard 
                    title={pin.title} 
                    description={pin.description} 
                    imageUrl={pin.imageUrl} 
                    destinationUrl={pin.destinationUrl}
                    price={pin.price}
                    className="w-full"
                  />
                  
                  {/* Status indicator */}
                  <div className="flex items-center justify-between px-0.5">
                    <Badge variant={pin.status === 'draft' ? 'secondary' : 'destructive'} className="uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full">
                      {pin.status}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {new Date(pin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Compact action buttons */}
                  <div className="grid grid-cols-2 gap-1.5 px-0.5">
                    <Button onClick={() => updateStatus(pin._id, 'approved')} size="sm" className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold h-7 rounded-lg">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => updateStatus(pin._id, 'rejected')} variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 text-[10px] font-bold h-7 rounded-lg">
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                    <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 text-[10px] font-bold h-7 rounded-lg">
                      <Edit3 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button onClick={() => handleImmediatePublish(pin._id)} size="sm" className="bg-primary/15 hover:bg-primary/25 text-primary border-0 text-[10px] font-bold h-7 rounded-lg">
                      <Send className="w-3 h-3 mr-1" /> Publish
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {pins.filter(p => p.status === 'draft' || p.status === 'rejected').length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl text-zinc-400 dark:text-zinc-500">
                <Archive className="w-10 h-10 mb-4 opacity-50" />
                <p className="text-sm font-semibold">No pins pending moderation.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pins.filter(p => p.status === 'approved' || p.status === 'scheduled').map(pin => (
              <div key={pin._id} className="flex flex-col space-y-2.5 group relative">
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  {pin.imageUrl ? (
                    <img src={pin.imageUrl} alt={pin.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">No Image</span>
                    </div>
                  )}

                  {/* Scheduled badge on image */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <div className="flex items-center gap-1 bg-blue-500/90 text-white text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full shadow-md">
                      <Clock className="w-2.5 h-2.5" /> Scheduled
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
                    <div className="flex justify-end">
                      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full text-xs shadow-lg transform hover:scale-105 transition-all">
                        Save
                      </button>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      {pin.destinationUrl && (
                        <div className="bg-white/90 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-[150px] shadow-md cursor-pointer transition-colors">
                          <ExternalLink className="w-3 h-3 text-black shrink-0" />
                          <span className="text-[10px] font-bold text-black truncate">{pin.destinationUrl.replace('https://', '').replace('http://', '').split('/')[0]}</span>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 px-0.5">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">{pin.title}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-blue-600 dark:text-blue-400 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(pin.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0">F</div>
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">Fashcon</span>
                  </div>
                </div>
              </div>
            ))}
            {pins.filter(p => p.status === 'approved' || p.status === 'scheduled').length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl text-zinc-400 dark:text-zinc-500">
                <Clock className="w-10 h-10 mb-4 opacity-50 text-zinc-500" />
                <p className="text-sm font-semibold">No pins currently scheduled.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pins.filter(p => p.status === 'published').map(pin => (
              <div key={pin._id} className="flex flex-col space-y-2.5 group relative">
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  {pin.imageUrl ? (
                    <img src={pin.imageUrl} alt={pin.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">No Image</span>
                    </div>
                  )}

                  {/* Published badge on image */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <div className="flex items-center gap-1 bg-emerald-500/90 text-white text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full shadow-md">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Live
                    </div>
                  </div>

                  {/* Mobile-only Push to Store button */}
                  <div className="md:hidden absolute top-2.5 right-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleImportPinAsProduct({
                          title: pin.title,
                          description: pin.description || '',
                          imageUrl: pin.imageUrl,
                          destinationUrl: pin.destinationUrl,
                          price: pin.price
                        });
                      }}
                      className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg active:scale-95 border border-white/20"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hover Overlay with icon-only actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 z-10">
                    <div /> {/* Top spacer */}
                    <div className="flex justify-between items-center w-full">
                      <a 
                        href={`https://pinterest.com/pin/${pin.pinterestPinId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-black/60 backdrop-blur-md hover:bg-black/85 text-white text-[9px] font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1 transition-all"
                      >
                        <span>pinterest.com</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleImportPinAsProduct({
                            title: pin.title,
                            description: pin.description || '',
                            imageUrl: pin.imageUrl,
                            destinationUrl: pin.destinationUrl,
                            price: pin.price
                          });
                        }}
                        title="Sync to Store"
                        className="w-8 h-8 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 px-0.5">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">{pin.title}</p>
                  {pin.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{pin.description}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0">F</div>
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">Fashcon</span>
                  </div>
                </div>
              </div>
            ))}
            {pins.filter(p => p.status === 'published').length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl text-zinc-400 dark:text-zinc-500">
                <CheckCircle2 className="w-10 h-10 mb-4 opacity-50 text-zinc-500" />
                <p className="text-sm font-semibold">No pins currently published.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div className="space-y-0.5">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Pinterest Performance Workspace</h2>
              <p className="text-xs text-muted-foreground">Comprehensive Pinterest growth, engagement, and click-through analysis.</p>
            </div>
            {analytics?.stats?.isSimulated ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full">
                Simulated Sandbox Data
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full">
                Live Pinterest Account
              </Badge>
            )}
          </div>

          {/* Pinterest Overall Performance workspace */}
          <PinterestOverallPerformance
            stats={analytics?.stats}
            refreshing={loading}
          />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly trends Area Chart */}
            <Card className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 p-5 lg:col-span-8 rounded-2xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">Growth Trends & Activity Flow</CardTitle>
                <CardDescription className="text-xs">Weekly views, saves, and link clicks.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics?.stats?.weeklyTrends || [
                      { name: 'Week 1', impressions: 400, saves: 12, clicks: 50 },
                      { name: 'Week 2', impressions: 700, saves: 18, clicks: 80 },
                      { name: 'Week 3', impressions: 600, saves: 15, clicks: 75 },
                      { name: 'Week 4', impressions: 1100, saves: 28, clicks: 120 },
                      { name: 'Week 5', impressions: 950, saves: 24, clicks: 110 },
                      { name: 'Week 6', impressions: 1420, saves: 42, clicks: 188 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-white/5" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderColor: '#e4e4e7',
                        color: '#18181b', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                      itemStyle={{ color: '#18181b' }}
                      labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                    />
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
                    <Area type="monotone" dataKey="saves" name="Saves" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSaves)" />
                    <Area type="monotone" dataKey="clicks" name="Link Clicks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Board stats Bar Chart */}
            <Card className="bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/10 p-5 lg:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">Board Performance</CardTitle>
                <CardDescription className="text-xs">Impressions distribution by key Pinterest boards.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.stats?.boardStats || [
                      { name: 'Luxury Gowns', impressions: 650 },
                      { name: 'Bridal Couture', impressions: 420 },
                      { name: 'Ready-To-Wear', impressions: 280 },
                      { name: 'Accessories', impressions: 180 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-white/5" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderColor: '#e4e4e7',
                        color: '#18181b', 
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                      itemStyle={{ color: '#18181b' }}
                      labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                    />
                    <Bar dataKey="impressions" name="Impressions" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        {/* Live Pins Tab */}
        <TabsContent value="live-pins" className="mt-6">
          <div className="space-y-6">
            <div className="border-b border-zinc-200/50 dark:border-white/5 pb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Active Live Catalog & Profile Pins</h2>
              <p className="text-xs text-muted-foreground font-medium">Direct visual assets fetched from your verified Pinterest profile.</p>
            </div>
            
            {analytics?.livePins && analytics.livePins.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {analytics.livePins.map((pin: any) => (
                  <div key={pin.id} className="space-y-2.5 group flex flex-col relative">
                    <div className="aspect-[2/3] relative rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all duration-300 bg-zinc-100 dark:bg-zinc-900">
                      {pin.thumbnail ? (
                        <img 
                          src={pin.thumbnail} 
                          alt={pin.title || 'Pinterest Pin'} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">No Thumbnail</span>
                        </div>
                      )}
                      
                      {/* Mobile-only Push to Store button */}
                      <div className="md:hidden absolute top-2.5 right-2.5 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleImportPinAsProduct({
                              title: pin.title || 'Pinterest Pin Asset',
                              description: pin.description || '',
                              imageUrl: pin.thumbnail || '',
                              imageUrls: pin.allImages || [],
                              destinationUrl: pin.link || `https://pinterest.com/pin/${pin.id}`,
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg active:scale-95 border border-white/20"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Authentic Pinterest Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 z-10">
                        <div /> {/* Top spacer */}
                        <div className="flex justify-between items-center w-full">
                          <a 
                            href={`https://pinterest.com/pin/${pin.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-black/60 backdrop-blur-md hover:bg-black/85 text-white text-[9px] font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1 transition-all"
                          >
                            <span>pinterest.com</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleImportPinAsProduct({
                                title: pin.title || 'Pinterest Pin Asset',
                                description: pin.description || '',
                                imageUrl: pin.thumbnail || '',
                                imageUrls: pin.allImages || [],
                                destinationUrl: pin.link || `https://pinterest.com/pin/${pin.id}`,
                              });
                            }}
                            title="Sync to Store"
                            className="w-8 h-8 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 px-0.5">{pin.title}</p>
                      {pin.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 px-0.5">{pin.description}</p>
                      )}
                      
                      {/* Pinterest Board Info Row */}
                      <div className="flex items-center gap-2 px-0.5 pt-1.5">
                        <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase shadow-inner shrink-0">
                          {pin.boardName ? pin.boardName.charAt(0) : 'P'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate leading-tight">
                            {pin.boardName || 'Pinterest Board'}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-medium leading-none">
                            {pin.createdAt ? new Date(pin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
                <p className="text-sm">No live pins found.</p>
                <p className="text-xs mt-1">Check that your board contains pins or that your token is active.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                <FaPinterest className="w-5 h-5 text-red-500" /> Pinterest Connection
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Connect your Pinterest account to automatically sync your live boards and pins.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">OAuth2 Authentication</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Link your account securely. Tokens will auto-refresh automatically.
                  </p>
                </div>
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-none">
                  <a href="/api/pinterest/auth">
                    Connect Pinterest Account
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                <Sparkles className="w-5 h-5 text-primary" /> Gemini AI Configuration
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure your Gemini API key to enable AI-powered Title, Description, and Alt Tag generation.</p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-zinc-800 dark:text-zinc-200 font-semibold text-xs">Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="bg-zinc-100/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
                  />
                  <Button onClick={handleSaveApiKey} disabled={isSavingKey} className="bg-primary hover:bg-primary/95 text-white font-bold">
                    {isSavingKey ? "Saving..." : "Save Key"}
                  </Button>
                </div>
                {hasApiKey && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Gemini API Key is configured and ready.
                  </p>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Get a free or paid API key from Google AI Studio. This key will be used to power smart titles, narration (bio), and image descriptions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
