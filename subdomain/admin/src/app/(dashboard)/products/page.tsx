'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  ShoppingBag,
  LayoutDashboard,
  CheckCircle2,
  FileEdit,
  MousePointer2,
  DollarSign,
  Package,
  Zap,
  BarChart3,
  Trash2,
} from 'lucide-react';
import {
  getProducts,
  deleteProduct,
  updateProductStatus,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  bulkUpdateProducts,
  duplicateProduct,
  getProductStats,
} from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/admin/products/data-table';
import { getColumns, Product } from '@/components/admin/products/columns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import StatsCard from '@/components/admin/StatsCard';
import PageHeader from '@/components/admin/PageHeader';
import BackButton from '@/components/admin/BackButton';
import TrashPanel from '@/components/admin/products/TrashPanel';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  // Filter & Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  // Bulk edit state
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: '',
    status: '',
    brand: '',
    badge: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getProductStats();
      setStats(data);
      setTrashCount(data.trash || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products, totalPages, total } = await getProducts({
        page,
        limit,
        search: debouncedSearch,
        category: selectedCategory === 'All Categories' ? undefined : selectedCategory,
        status: selectedStatus === 'All Status' ? undefined : selectedStatus as any,
      });
      setProducts(products as any);
      setTotalPages(totalPages);
      setTotalProducts(total);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    try {
      await updateProductStatus(product._id, newStatus);
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProduct(id);
      toast.success('Product duplicated successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleBulkStatusChange = async (status: 'published' | 'draft') => {
    try {
      await bulkUpdateProductStatus(selectedProductIds, status);
      toast.success(`Bulk updated ${selectedProductIds.length} products to ${status}`);
      setSelectedProductIds([]);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProductIds.length} products permanently?`)) return;
    try {
      await bulkDeleteProducts(selectedProductIds);
      toast.success(`Successfully deleted ${selectedProductIds.length} products`);
      setSelectedProductIds([]);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Bulk deletion failed');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const updateData: any = {};
      if (bulkEditData.category) updateData.category = bulkEditData.category === 'none' ? '' : bulkEditData.category;
      if (bulkEditData.status) updateData.status = bulkEditData.status;
      if (bulkEditData.brand) updateData.brand = bulkEditData.brand;
      if (bulkEditData.badge) updateData.badge = bulkEditData.badge === 'None' ? '' : bulkEditData.badge;

      await bulkUpdateProducts(selectedProductIds, updateData);
      toast.success('Batch update applied');
      setIsBulkEditOpen(false);
      setSelectedProductIds([]);
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast.error('Batch update failed');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Status');
    setPage(1);
  };

  const columns = getColumns({
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onToggleStatus: handleToggleStatus,
  });

  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <PageHeader
        title={<>Product <span className="text-neutral-400">Vault</span></>}
        subtitle="Luxury Fashion Catalog Management"
        badge="Inventory"
        actions={
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-2xl border-4 border-[var(--background)] bg-[var(--card)] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-transparent animate-pulse" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-2xl border-4 border-[var(--background)] bg-[var(--card)] flex items-center justify-center text-[10px] font-bold">
                +12
              </div>
            </div>
            <Button
              asChild
              className="h-14 px-8 rounded-3xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-[12px] font-bold uppercase tracking-widest shadow-2xl border-none active:scale-95 transition-all"
            >
              <Link href="/products/add">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xl bg-[var(--background)]/10 flex items-center justify-center">
                    <span className="text-lg">+</span>
                  </div>
                  Inject New Manifest
                </div>
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vault Value', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: ShoppingBag, color: 'text-blue-500' },
          { label: 'Active Clicks', value: stats?.clicks?.toLocaleString() || '0', icon: Zap, color: 'text-amber-500' },
          { label: 'Conversion', value: '3.2%', icon: BarChart3, color: 'text-emerald-500' },
          { label: 'Total Products', value: stats?.total?.toString() || '0', icon: Filter, color: 'text-purple-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-4 group hover:border-[var(--primary)]/50 transition-all duration-500 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
            <stat.icon className={cn("w-4 h-4 mb-2.5 opacity-40", stat.color)} />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">{stat.label}</p>
            <p className="text-xl font-bold tracking-tighter">{stat.value}</p>
          </Card>
        ))}
      </div>
      {/* Vault Repository Section */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <CardHeader className="p-4 pb-2 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Vault Repository</CardTitle>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Elastic Search & Filter Bar */}
              <div
                ref={searchRef}
                className={cn(
                  "flex items-center p-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  isSearchExpanded 
                    ? "w-full md:w-[420px] bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-inner" 
                    : "w-[44px] overflow-hidden bg-transparent border-transparent"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="h-9 w-9 shrink-0 rounded-xl transition-colors hover:bg-transparent"
                >
                  <Search className={cn("w-4 h-4 transition-all duration-500", isSearchExpanded ? "opacity-100 scale-110" : "opacity-70 scale-100")} />
                </Button>

                <div className={cn(
                  "flex items-center transition-all duration-500 flex-1 min-w-0",
                  isSearchExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                )}>
                  <Input
                    placeholder="Search vault..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 bg-transparent border-none text-[11px] font-bold focus-visible:ring-0 placeholder:text-neutral-500 placeholder:uppercase placeholder:tracking-widest"
                  />

                  <div className="w-px h-5 bg-[var(--border)] mx-1 opacity-50 shrink-0" />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-[var(--foreground)]/5 transition-all shrink-0"
                      >
                        <Filter className="w-3.5 h-3.5" />
                        Filter
                        {(selectedCategory !== 'All Categories' || selectedStatus !== 'All Status') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-2xl p-1.5"
                    >
                      <DropdownMenuLabel className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2 py-1.5">
                        Category Scope
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => { setSelectedCategory('All Categories'); setPage(1); }}
                        className={cn('rounded-xl cursor-pointer text-[12px] font-bold', selectedCategory === 'All Categories' && 'bg-[var(--primary)]/5')}
                      >
                        All Categories
                      </DropdownMenuItem>
                      {categories.map((cat) => (
                        <DropdownMenuItem
                          key={cat._id}
                          onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
                          className={cn('rounded-xl cursor-pointer text-[12px] font-bold', selectedCategory === cat.name && 'bg-[var(--primary)]/5')}
                        >
                          {cat.name}
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="bg-[var(--border)] my-1.5" />
                      <DropdownMenuLabel className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2 py-1.5">
                        Publication Status
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => { setSelectedStatus('All Status'); setPage(1); }}
                        className={cn('rounded-xl cursor-pointer text-[12px] font-bold', selectedStatus === 'All Status' && 'bg-[var(--primary)]/5')}
                      >
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelectedStatus('published'); setPage(1); }}
                        className={cn('rounded-xl cursor-pointer text-[12px] font-bold', selectedStatus === 'published' && 'bg-[var(--primary)]/5')}
                      >
                        Published
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelectedStatus('draft'); setPage(1); }}
                        className={cn('rounded-xl cursor-pointer text-[12px] font-bold', selectedStatus === 'draft' && 'bg-[var(--primary)]/5')}
                      >
                        Draft
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Vault Trash Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsTrashOpen(true)}
                    className="h-9 w-9 rounded-xl hover:bg-red-500/10 group transition-all relative"
                    title="Vault Trash"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    {trashCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        {trashCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions Integrated */}
              {selectedProductIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 px-5 border-neutral-900 bg-neutral-900 text-white rounded-2xl gap-2 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg animate-in zoom-in-95 duration-200"
                    >
                      Bulk ({selectedProductIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[var(--card)] border border-[var(--border)] shadow-sm rounded-2xl p-1.5"
                  >
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange('published')}
                      className="text-emerald-600 rounded-xl focus:bg-emerald-50 focus:text-emerald-700 font-bold text-[12px] cursor-pointer"
                    >
                      Publish Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange('draft')}
                      className="text-amber-600 rounded-xl focus:bg-amber-50 focus:text-amber-700 font-bold text-[12px] cursor-pointer"
                    >
                      Draft Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsBulkEditOpen(true)}
                      className="text-blue-600 rounded-xl focus:bg-blue-50 focus:text-blue-700 font-bold text-[12px] cursor-pointer"
                    >
                      Batch Edit Fields
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[var(--border)] my-1.5 mx-2" />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-red-600 rounded-xl focus:bg-red-50 focus:text-red-700 font-bold text-[12px] cursor-pointer"
                    >
                      Erase Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Compact Active Filters Chips */}
          {(selectedCategory !== 'All Categories' || selectedStatus !== 'All Status') && (
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]/10 animate-in fade-in slide-in-from-top-1 duration-300">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'All Categories' && (
                  <Badge variant="secondary" className="bg-[var(--primary)]/5 text-[var(--primary)] text-[9px] font-black uppercase px-2.5 py-0.5 border border-[var(--primary)]/10 rounded-lg group cursor-pointer" onClick={() => setSelectedCategory('All Categories')}>
                    {selectedCategory}
                    <span className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                  </Badge>
                )}
                {selectedStatus !== 'All Status' && (
                  <Badge variant="secondary" className="bg-[var(--primary)]/5 text-[var(--primary)] text-[9px] font-black uppercase px-2.5 py-0.5 border border-[var(--primary)]/10 rounded-lg group cursor-pointer" onClick={() => setSelectedStatus('All Status')}>
                    {selectedStatus}
                    <span className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:bg-transparent" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalProducts={totalProducts}
          limit={limit}
          onPageChange={setPage}
          onSelectionChange={setSelectedProductIds}
          onClearFilters={handleClearFilters}
          onRowClick={(product) => window.location.href = `/products/${product._id}/edit`}
        />
      </Card>

      <TrashPanel 
        isOpen={isTrashOpen} 
        onClose={() => setIsTrashOpen(false)} 
        onRefresh={() => {
          fetchProducts();
          fetchStats();
        }} 
      />

      {/* Bulk edit dialog */}

      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <FileEdit className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight">Bulk Edit Scope</DialogTitle>
            </div>
            <DialogDescription className="text-[11px] font-bold uppercase tracking-widest opacity-40">
              Synchronizing {selectedProductIds.length} vault entries
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">
                Category Scope
              </Label>
              <Select
                onValueChange={(val) => setBulkEditData({ ...bulkEditData, category: val ?? '' })}
                value={bulkEditData.category}
              >
                <SelectTrigger className="h-12 rounded-2xl border-[var(--border)] bg-[var(--background)] text-[12px] font-bold focus:ring-1 focus:ring-[var(--primary)]/20 transition-all">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="none" className="rounded-xl font-bold text-[12px] cursor-pointer">Clear Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name} className="rounded-xl font-bold text-[12px] cursor-pointer">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">
                Publication Status
              </Label>
              <Select
                onValueChange={(val) => setBulkEditData({ ...bulkEditData, status: val ?? '' })}
                value={bulkEditData.status}
              >
                <SelectTrigger className="h-12 rounded-2xl border-[var(--border)] bg-[var(--background)] text-[12px] font-bold focus:ring-1 focus:ring-[var(--primary)]/20 transition-all">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="published" className="rounded-xl font-bold text-[12px] cursor-pointer">Published</SelectItem>
                  <SelectItem value="draft" className="rounded-xl font-bold text-[12px] cursor-pointer">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">
                Brand Identity
              </Label>
              <Input
                placeholder="Enter Brand Name"
                className="h-12 rounded-2xl border-[var(--border)] bg-[var(--background)] text-[12px] font-bold focus-visible:ring-1 focus-visible:ring-[var(--primary)]/20 placeholder:opacity-30 transition-all"
                value={bulkEditData.brand}
                onChange={(e) => setBulkEditData({ ...bulkEditData, brand: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">
                Product Badge
              </Label>
              <Select
                onValueChange={(val) => setBulkEditData({ ...bulkEditData, badge: val ?? '' })}
                value={bulkEditData.badge}
              >
                <SelectTrigger className="h-12 rounded-2xl border-[var(--border)] bg-[var(--background)] text-[12px] font-bold focus:ring-1 focus:ring-[var(--primary)]/20 transition-all">
                  <SelectValue placeholder="Select Badge" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="None" className="rounded-xl font-bold text-[12px] cursor-pointer">None</SelectItem>
                  <SelectItem value="Luxury" className="rounded-xl font-bold text-[12px] cursor-pointer">Luxury</SelectItem>
                  <SelectItem value="Hot Sale" className="rounded-xl font-bold text-[12px] cursor-pointer">Hot Sale</SelectItem>
                  <SelectItem value="New Arrival" className="rounded-xl font-bold text-[12px] cursor-pointer">New Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-8 bg-[var(--background)]/50 border-t border-[var(--border)] gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsBulkEditOpen(false)}
              className="h-11 px-6 rounded-xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              className="h-11 px-6 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-[11px] font-black uppercase tracking-widest shadow-xl border-none active:scale-95 transition-all"
            >
              Manifest Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Floating Action Button (FAB) ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-12 right-12 z-[100]"
      >
        <Link 
          href="/products/add" 
          className="group relative flex items-center justify-center"
        >
          {/* Label tooltip on hover */}
          <span className="absolute right-full mr-4 bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap pointer-events-none">
            Inject Product
          </span>
          
          <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-2xl hover:scale-110 transition-all border border-white/10 active:scale-90">
            <Plus size={24} strokeWidth={2.5} />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}


