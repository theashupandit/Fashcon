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
  LayoutGrid
} from 'lucide-react';
import { toast } from "sonner";
import { 
  getPinterestBoards, 
  getPinterestAnalytics, 
  createPin, 
  getPins, 
  updatePin, 
  deletePin,
  publishPinImmediately 
} from '@/app/actions/pinterest';
import { getProducts } from '@/app/actions/products';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import PinterestCard from '@/components/admin/PinterestCard';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'next/navigation';

export default function PinterestEngine() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [activeTab, setActiveTab] = useState(viewParam || 'publisher');
  const [boards, setBoards] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (viewParam) {
      setActiveTab(viewParam);
    }
  }, [viewParam]);

  // Publisher State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [altText, setAltText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boardsData, productsData, analyticsData, pinsData] = await Promise.all([
        getPinterestBoards(),
        getProducts({ limit: 100 }),
        getPinterestAnalytics(),
        getPins()
      ]);
      setBoards(boardsData);
      setProducts(productsData.products);
      setAnalytics(analyticsData);
      setPins(pinsData);
    } catch (error) {
      console.error(error);
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
      setPrice(product.prices?.offer || product.prices?.original || 0);
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
    setPrice(0);
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
    } catch (error) {
      toast.error("Failed to create draft");
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

  // Extract gallery images from selected product
  const productGallery = selectedProduct ? [
    selectedProduct.media?.mainImage,
    ...(selectedProduct.media?.gallery || [])
  ].filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Pinterest Engine</h1>
          <p className="text-muted-foreground text-sm">Luxury visual automation & moderation center.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="bg-white/5 border-white/10">
            <RefreshCw className={loading ? "animate-spin w-4 h-4 mr-2" : "w-4 h-4 mr-2"} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-white/10 backdrop-blur-md p-1 h-12 flex items-center justify-start gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="publisher" className="data-[state=active]:bg-white/10 text-xs px-4">Create Pin</TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-white/10 text-xs px-4">Moderation</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-white/10 text-xs px-4">Scheduled</TabsTrigger>
          <TabsTrigger value="published" className="data-[state=active]:bg-white/10 text-xs px-4">Published</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 text-xs px-4">Analytics</TabsTrigger>
        </TabsList>

        {/* Create Pin Tab */}
        <TabsContent value="publisher" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" /> Composer
                  </CardTitle>
                  <CardDescription>Draft a new shoppable luxury pin.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2">
                  <Trash2 className="w-4 h-4" /> Clear Fields
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5" /> Fashcon Product
                    </Label>
                    <Select onValueChange={(val) => handleProductSelect(val || '')} value={selectedProduct?._id || ''}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Choose product..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {products.map(p => (
                          <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5" /> Destination Board
                    </Label>
                    <Select onValueChange={(val) => setSelectedBoard(val || '')} value={selectedBoard}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select board..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {boards.map(b => (
                          <SelectItem key={b.boardId} value={b.boardId}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pin Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10" placeholder="e.g. Elegant Silk Gown in Emerald" />
                </div>

                <div className="space-y-2">
                  <Label>Narration (Description)</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px]" placeholder="Add a luxury narrative for this piece..." />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-primary/80">
                    <FileText className="w-3.5 h-3.5" /> Accessibility Alt Text
                  </Label>
                  <Input value={altText} onChange={e => setAltText(e.target.value)} className="bg-white/5 border-white/10 border-primary/20" placeholder="Describe the image for visually impaired users..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Schedule Time
                    </Label>
                    <Input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (INR)</Label>
                    <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleCreateDraft} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-11">
                    Create Draft Pin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center">
              <Label className="mb-4 uppercase tracking-widest text-[10px] text-muted-foreground font-black">Live Preview</Label>
              <PinterestCard 
                title={title} 
                description={description} 
                imageUrl={selectedImage} 
                destinationUrl={selectedProduct ? `fashcon.in/go/${selectedProduct.slug}` : ''}
                price={price}
              />
              
              <div className="mt-6 w-full space-y-4">
                {/* Image Source Selection */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Image Source</Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
                        onClick={() => setIsMediaPickerOpen(true)}
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Media Library
                      </Button>
                      
                      <MediaPickerModal 
                        isOpen={isMediaPickerOpen}
                        onClose={() => setIsMediaPickerOpen(false)}
                        onSelect={(assets) => {
                          setSelectedImage(assets[0]?.url || '');
                          setIsMediaPickerOpen(false);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input 
                      value={selectedImage} 
                      onChange={e => setSelectedImage(e.target.value)} 
                      placeholder="Paste image URL..." 
                      className="bg-white/5 border-white/10 text-xs h-9"
                    />

                    {/* Product Inventory (Gallery) Picker */}
                    {selectedProduct && productGallery.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground/60 flex items-center gap-1.5">
                          <LayoutGrid className="w-3 h-3" /> Product Inventory
                        </Label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {productGallery.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedImage(img)}
                              className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage === img ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt={`Product view ${i}`} className="object-cover w-full h-full" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {pins.filter(p => p.status === 'draft' || p.status === 'rejected').map(pin => (
                <motion.div 
                  key={pin._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-black/20 border-white/10 overflow-hidden flex flex-col h-full">
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant={pin.status === 'draft' ? 'secondary' : 'destructive'} className="uppercase text-[9px] font-black tracking-widest">
                          {pin.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(pin.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-center mb-6">
                        <PinterestCard 
                          title={pin.title} 
                          description={pin.description} 
                          imageUrl={pin.imageUrl} 
                          destinationUrl={pin.destinationUrl}
                          price={pin.price}
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/5 bg-white/5 grid grid-cols-2 gap-2">
                      <Button onClick={() => updateStatus(pin._id, 'approved')} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                      </Button>
                      <Button onClick={() => updateStatus(pin._id, 'rejected')} variant="ghost" className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/5">
                        <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                      </Button>
                      <Button variant="outline" className="bg-transparent border-white/10 text-xs font-bold">
                        Edit
                      </Button>
                      <Button onClick={() => handleImmediatePublish(pin._id)} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 text-xs font-bold">
                        Publish Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {pins.filter(p => p.status === 'draft' || p.status === 'rejected').length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-50">
                <Archive className="w-10 h-10 mb-4" />
                <p className="text-sm font-medium">No pins pending moderation.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pins.filter(p => p.status === 'approved' || p.status === 'scheduled').map(pin => (
              <Card key={pin._id} className="bg-black/20 border-white/10 overflow-hidden group">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 uppercase text-[9px] font-black tracking-widest">
                      {pin.status}
                    </Badge>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex justify-center mb-6">
                    <PinterestCard 
                      title={pin.title} 
                      description={pin.description} 
                      imageUrl={pin.imageUrl} 
                      destinationUrl={pin.destinationUrl}
                      price={pin.price}
                      className="scale-90 group-hover:scale-95 transition-transform"
                    />
                  </div>
                  <div className="space-y-1 text-center border-t border-white/5 pt-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Scheduled For</p>
                    <p className="text-sm font-bold text-white">{new Date(pin.scheduledFor).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pins.filter(p => p.status === 'published').map(pin => (
              <Card key={pin._id} className="bg-black/20 border-white/10 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 uppercase text-[9px] font-black tracking-widest">
                      Published
                    </Badge>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex justify-center mb-6">
                    <PinterestCard 
                      title={pin.title} 
                      description={pin.description} 
                      imageUrl={pin.imageUrl} 
                      destinationUrl={pin.destinationUrl}
                      price={pin.price}
                      className="scale-90 grayscale-[0.2]"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">{pin.pinterestPinId}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" asChild>
                      <a href={`https://pinterest.com/pin/${pin.pinterestPinId}`} target="_blank" rel="noopener noreferrer">View Live</a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-black/20 border-white/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Total Impressions</p>
              <h3 className="text-3xl font-black text-white">{analytics?.stats?.totalImpressions?.toLocaleString() || '0'}</h3>
              <div className="mt-4 h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%]" />
              </div>
            </Card>
            <Card className="bg-black/20 border-white/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Total Saves</p>
              <h3 className="text-3xl font-black text-white">{analytics?.stats?.totalSaves?.toLocaleString() || '0'}</h3>
              <div className="mt-4 h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[42%]" />
              </div>
            </Card>
            <Card className="bg-black/20 border-white/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Outbound Clicks</p>
              <h3 className="text-3xl font-black text-white">{analytics?.stats?.outboundClicks?.toLocaleString() || '0'}</h3>
              <div className="mt-4 h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[28%]" />
              </div>
            </Card>
          </div>

          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>High-Impact Pins</CardTitle>
              <CardDescription>Top performing visual assets by outbound engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {analytics?.topPins.map((pin: any) => (
                  <div key={pin.id} className="space-y-2 group">
                    <div className="aspect-[2/3] relative rounded-2xl overflow-hidden border border-white/10">
                      <img src={pin.thumbnail} alt={pin.title || 'Pinterest Pin'} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <BarChart3 className="w-8 h-8 text-white/50" />
                      </div>
                    </div>
                    <p className="text-[11px] font-bold truncate">{pin.title}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-black">
                      <span>{pin.clicks} CLICKS</span>
                      <span className="text-emerald-400">+{((pin.clicks/pin.impressions)*100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
