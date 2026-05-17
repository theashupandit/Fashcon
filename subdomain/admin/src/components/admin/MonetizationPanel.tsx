'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  MousePointer2, 
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  Store,
  DollarSign,
} from 'lucide-react';
import { 
  getAffiliateLinks, 
  createAffiliateLink, 
  deleteAffiliateLink, 
  updateAffiliateLink 
} from '@/app/actions/affiliate';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StatsCard from '@/components/admin/StatsCard';

interface AffiliateLink {
  _id: string;
  label: string;
  url: string;
  merchant: string;
  clicks: number;
  earnings?: number;
  status: 'active' | 'expired';
  lastClicked?: any;
}

export default function MonetizationPanel() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ label: '', url: '', merchant: '', status: 'active' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await getAffiliateLinks();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("Failed to load affiliate links");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (link: AffiliateLink) => {
    setEditingId(link._id);
    setFormData({
      label: link.label,
      url: link.url,
      merchant: link.merchant,
      status: link.status
    });
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ label: '', url: '', merchant: '', status: 'active' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.label || !formData.url || !formData.merchant) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateAffiliateLink(editingId, formData);
        if (result.success) {
          toast.success("Affiliate link updated");
          setIsDialogOpen(false);
          fetchLinks();
        } else {
          toast.error(result.error || "Failed to update link");
        }
      } else {
        const result = await createAffiliateLink({
          ...formData,
          clicks: 0,
          earnings: 0,
        });
        
        if (result.success) {
          toast.success("Affiliate link created");
          setIsDialogOpen(false);
          setFormData({ label: '', url: '', merchant: '', status: 'active' });
          fetchLinks();
        } else {
          toast.error(result.error || "Failed to create link");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this affiliate link?')) return;
    try {
      const result = await deleteAffiliateLink(id);
      if (result.success) {
        setLinks(links.filter(l => l._id !== id));
        toast.success("Link removed");
      } else {
        toast.error(result.error || "Failed to delete link");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const filteredLinks = links.filter(l => 
    l.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Monetization Registry</h1>
          <p className="text-[13px] text-muted-foreground">Manage tracked affiliate destinations and monitor performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleOpenCreate}
                className="h-9 px-4 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 rounded-2xl p-6 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight text-white">
                  {editingId ? "Edit Affiliate Link" : "New Affiliate Link"}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground pt-1">
                  {editingId ? "Update your affiliate tracking parameters." : "Create a new tracked destination for monetization."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Link Label</Label>
                  <Input 
                    placeholder="e.g. Summer Dress Collection" 
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary/30 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Destination URL</Label>
                  <Input 
                    placeholder="https://shop.example.com/..." 
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary/30 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Merchant Name</Label>
                  <Input 
                    placeholder="e.g. Myntra, Amazon" 
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary/30 font-medium"
                  />
                </div>

                {editingId && (
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                    <div className="flex gap-2">
                      {['active', 'expired'].map((s) => (
                        <Button
                          key={s}
                          variant="ghost"
                          onClick={() => setFormData({ ...formData, status: s as any })}
                          className={cn(
                            "flex-1 h-10 rounded-lg font-bold uppercase text-[10px] tracking-widest border border-white/10",
                            formData.status === s 
                              ? "bg-primary text-white hover:bg-primary" 
                              : "bg-white/5 opacity-40 hover:opacity-100"
                          )}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !formData.label || !formData.url}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "Update Link" : "Generate Tracker")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard 
          label="Total Clicks" 
          value={links.reduce((acc, curr) => acc + (curr.clicks || 0), 0).toLocaleString()} 
          change="+14.2%" 
          trend="up"
          icon={MousePointer2} 
          color="text-blue-500"
        />
        <StatsCard 
          label="Est. Earnings" 
          value={`$${links.reduce((acc, curr) => acc + (curr.earnings || 0), 0).toLocaleString()}`} 
          change="+8.1%" 
          trend="up"
          icon={DollarSign} 
          color="text-emerald-500"
        />
        <StatsCard 
          label="Active Merchants" 
          value={new Set(links.map(l => l.merchant)).size.toString()} 
          change={`${links.filter(l => l.status === 'active').length} Active`} 
          trend="up"
          icon={Store} 
          color="text-purple-500"
        />
        <StatsCard 
          label="Conversion Rate" 
          value="3.2%" 
          change="+0.4%" 
          trend="up"
          icon={TrendingUp} 
          color="text-rose-500"
        />
      </div>

      {/* Content Section */}
      <Card className="bg-black/20 border-white/10 overflow-hidden shadow-sm rounded-xl backdrop-blur-md">
        <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by label or merchant..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-black/40 border-white/10 focus:border-primary/20 rounded-lg text-[13px] font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="pl-6 h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Affiliate Target</TableHead>
                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Merchant</TableHead>
                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Performance</TableHead>
                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
                <TableHead className="w-[100px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="h-64 text-center">
                      <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
                      <p className="text-[12px] font-medium text-muted-foreground">Syncing Engine Data...</p>
                   </TableCell>
                 </TableRow>
              ) : filteredLinks.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={5} className="h-64 text-center">
                      <LinkIcon size={32} className="opacity-10 mx-auto mb-4" />
                      <p className="text-[13px] font-medium text-muted-foreground">No matching links in registry</p>
                   </TableCell>
                 </TableRow>
              ) : (
                filteredLinks.map((link) => (
                  <TableRow key={link._id} className="border-white/5 hover:bg-white/5 transition-all group">
                     <TableCell className="pl-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-[14px] font-bold leading-tight group-hover:text-primary transition-colors text-white">{link.label}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">{link.url}</p>
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className="bg-black/40 text-white border-white/10 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                          {link.merchant}
                        </Badge>
                     </TableCell>
                     <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                             <span className="text-[16px] font-bold tabular-nums text-white">{(link.clicks || 0).toLocaleString()}</span>
                            <TrendingUp size={12} className="text-emerald-500" />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground opacity-50">Hits</span>
                        </div>
                     </TableCell>
                     <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border",
                          link.status === 'active' 
                            ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                            : "bg-red-500/5 text-red-500 border-red-500/10"
                        )}>
                          {link.status}
                        </Badge>
                     </TableCell>
                     <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.url)} className="w-8 h-8 rounded-md hover:bg-white/10">
                             <Copy size={14} className="opacity-60" />
                           </Button>
                           <Button variant="ghost" size="icon" asChild className="w-8 h-8 rounded-md hover:bg-white/10">
                             <a href={link.url} target="_blank" rel="noopener noreferrer">
                               <ExternalLink size={14} className="opacity-60" />
                             </a>
                           </Button>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-white/10">
                                  <MoreVertical size={14} className="opacity-60" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-xl p-1 w-40">
                                 <DropdownMenuItem 
                                    onClick={() => handleOpenEdit(link)}
                                    className="gap-2 font-medium text-[12px] rounded-lg cursor-pointer"
                                 >
                                    <Edit2 size={14} className="opacity-60" /> Edit Entry
                                 </DropdownMenuItem>
                                 <DropdownMenuItem 
                                    onClick={() => handleDelete(link._id)}
                                    className="gap-2 font-medium text-[12px] rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/5 cursor-pointer"
                                 >
                                    <Trash2 size={14} /> Burn Link
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
