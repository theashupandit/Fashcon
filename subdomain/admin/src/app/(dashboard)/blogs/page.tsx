'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Tag,
  Loader2,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Image as ImageIcon,
  Sparkles,
  Type,
  Layout,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBlogs, deleteBlog, createBlog } from '@/app/actions/blogs';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from "@/lib/utils";
import StatsCard from '@/components/admin/StatsCard';
import PageHeader from '@/components/admin/PageHeader';


interface Blog {
  _id: string;
  title: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  blogType?: 'infographic' | 'richtext';
  coverImage: string;
  createdAt: string;
  views?: number;
  slug: string;
  clicks?: number;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlog(id);
      setBlogs(blogs.filter(b => b._id !== id));
      toast.success("Blog post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const filteredBlogs = React.useMemo(() => {
    let result = blogs.filter(b => 
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      result = result.filter(b => b.category === selectedCategory);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(b => {
        if (!b.createdAt) return false;
        const created = new Date(b.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (dateFilter === '24h') return diffDays <= 1;
        if (dateFilter === '7d') return diffDays <= 7;
        if (dateFilter === '30d') return diffDays <= 30;
        return true;
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  }, [blogs, searchQuery, selectedCategory, dateFilter, sortBy]);

  return (
    <>
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <PageHeader
        title={<>Editorial <span className="text-neutral-400">Hub</span></>}
        subtitle="Luxury Fashion Editorial & Articles"
        badge="Editorial"
        actions={
          <>
            <Button variant="outline" className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all active:scale-95" asChild>
              <Link href="/analytics">
                <BarChart2 className="w-4 h-4 mr-2" />
                Insights
              </Link>
            </Button>
            <Button className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95" asChild>
              <Link href="/blogs/new">
                <Plus className="w-4 h-4" />
                Manifest Post
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard 
          label="Total Articles" 
          value={blogs.length.toString()} 
          icon={FileText} 
          color="text-blue-500" 
        />
        <StatsCard 
          label="Published Post" 
          value={blogs.filter(b => b.status === 'published').length.toString()} 
          icon={CheckCircle2} 
          color="text-emerald-500" 
        />
        <StatsCard 
          label="Avg. Visibility" 
          value={blogs.length > 0 ? Math.round(blogs.reduce((acc, b) => acc + (b.views || 0), 0) / blogs.length).toLocaleString() : '0'} 
          icon={Eye} 
          color="text-purple-500" 
        />
      </div>


      {/* Table Section */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
            <Input 
              placeholder="Filter editorial archives..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-[var(--background)] border-transparent rounded-2xl text-[13px] font-bold focus:bg-[var(--background)] focus:border-[var(--primary)]/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Temporal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-11 px-5 border-[var(--border)] rounded-2xl gap-2 text-[11px] font-black uppercase tracking-widest transition-all",
                    (dateFilter !== 'all' || sortBy !== 'newest') ? "border-[var(--primary)]/30 text-[var(--primary)] opacity-100 bg-[var(--primary)]/5" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  Temporal
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[var(--card)] border-[var(--border)] rounded-2xl p-1.5 shadow-2xl z-[150]">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] px-2.5 py-2">Recency Filter</DropdownMenuLabel>
                {[
                  { value: 'all', label: 'All Time' },
                  { value: '24h', label: 'Last 24 Hours' },
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                ].map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setDateFilter(opt.value as any)}
                    className={cn(
                      "text-[12px] font-bold rounded-xl cursor-pointer px-2.5 py-1.5 flex items-center justify-between",
                      dateFilter === opt.value ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]"
                    )}
                  >
                    {opt.label}
                    {dateFilter === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-[var(--border)] my-1" />

                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] px-2.5 py-2">Sort Direction</DropdownMenuLabel>
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'views', label: 'Most Viewed' },
                ].map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as any)}
                    className={cn(
                      "text-[12px] font-bold rounded-xl cursor-pointer px-2.5 py-1.5 flex items-center justify-between",
                      sortBy === opt.value ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]"
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Taxonomy Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-11 px-5 border-[var(--border)] rounded-2xl gap-2 text-[11px] font-black uppercase tracking-widest transition-all",
                    selectedCategory !== 'all' ? "border-[var(--primary)]/30 text-[var(--primary)] opacity-100 bg-[var(--primary)]/5" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Tag className="w-4 h-4" />
                  Taxonomy
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[var(--card)] border-[var(--border)] rounded-2xl p-1.5 shadow-2xl z-[150] max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] px-2.5 py-2">Filter by Category</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "text-[12px] font-bold rounded-xl cursor-pointer px-2.5 py-1.5 flex items-center justify-between",
                    selectedCategory === 'all' ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]"
                  )}
                >
                  All Categories ({blogs.length})
                  {selectedCategory === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                </DropdownMenuItem>

                {Array.from(new Set(blogs.map(b => b.category).filter(Boolean))).map((cat) => {
                  const count = blogs.filter(b => b.category === cat).length;
                  return (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "text-[12px] font-bold rounded-xl cursor-pointer px-2.5 py-1.5 flex items-center justify-between",
                        selectedCategory === cat ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--muted)]"
                      )}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className="text-[10px] opacity-40 font-normal">({count})</span>
                      {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedCategory !== 'all' || dateFilter !== 'all' || sortBy !== 'newest') && (
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-[var(--border)] bg-[var(--muted)]/5 animate-in slide-in-from-top duration-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mr-1">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1.5 h-6 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                Taxonomy: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedCategory('all')} />
              </Badge>
            )}
            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1.5 h-6 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                Recency: {dateFilter === '24h' ? 'Last 24h' : dateFilter === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setDateFilter('all')} />
              </Badge>
            )}
            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1.5 h-6 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                Sort: {sortBy === 'oldest' ? 'Oldest First' : 'Most Viewed'}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setSortBy('newest')} />
              </Badge>
            )}
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setDateFilter('all');
                setSortBy('newest');
              }} 
              className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--muted)]/20">
              <TableRow className="border-[var(--border)] hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Article Specification</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Contributor</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Taxonomy</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Metrics</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] text-center">Status</TableHead>
                <TableHead className="w-[80px] pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                      <p className="text-[12px] font-medium text-[var(--muted-foreground)]">Accessing editorial archives...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-[var(--muted-foreground)]/20" />
                      <p className="text-[13px] font-medium text-[var(--muted-foreground)]">No articles found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog._id} className="border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-colors group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3 py-2">
                        <div className="relative w-14 h-9 rounded bg-[var(--muted)] overflow-hidden border border-[var(--border)] shrink-0 shadow-sm">
                          {blog.coverImage ? (
                            <SafeImage 
                              src={blog.coverImage} 
                              alt={blog.title} 
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/5">
                              <ImageIcon className="w-3 h-3 text-[var(--primary)]/20" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-[320px]">
                          <Link href={`/blogs/edit/${blog._id}`} className="text-[13px] font-semibold leading-tight hover:text-[var(--primary)] transition-colors line-clamp-1 flex items-center gap-1.5">
                            {blog.title}
                            {blog.blogType === 'richtext' && <Badge variant="outline" className="text-[7px] px-1 py-0 border-blue-500/20 text-blue-500 bg-blue-500/5 font-black uppercase">RT</Badge>}
                          </Link>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5 font-medium uppercase tracking-tighter">
                            <Clock className="w-2.5 h-2.5" />
                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-[var(--border)]">
                          <AvatarFallback className="bg-[var(--primary)]/5 text-[var(--primary)] text-[10px] font-bold">
                            {blog.author?.substring(0, 2).toUpperCase() || 'AD'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[12px] font-medium">{blog.author || 'Admin'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-[var(--border)] bg-[var(--background)]">
                        {blog.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" />
                          <span className="text-[12px] font-bold tabular-nums">{(blog.views || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                          <ArrowUpRight className="w-3 h-3" />
                          <span className="text-[10px] font-bold">12%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border",
                        blog.status === 'published' 
                          ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                          : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                      )}>
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-[var(--muted)]">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[var(--background)] border-[var(--border)]">
                          <DropdownMenuItem asChild>
                            <Link href={`/blogs/edit/${blog._id}`} className="gap-2 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" /> Edit Article
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a 
                              href={`/blog/${blog.slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 cursor-pointer w-full"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview Post
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[var(--border)]" />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(blog._id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/10 flex items-center justify-between">
          <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
            Showing {filteredBlogs.length} of {blogs.length} articles
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="w-7 h-7 rounded border-[var(--border)]" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" className="w-7 h-7 rounded bg-[var(--primary)] text-white text-[11px] font-bold">1</Button>
            <Button variant="outline" size="icon" className="w-7 h-7 rounded border-[var(--border)]" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>

      {/* ── Floating Action Button (FAB) ── */}
      <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {showFabMenu && (
            <div className="flex flex-col items-end gap-3 mb-2">
              {/* Option 2: Rich Text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ delay: 0.05 }}
              >
                <Link 
                  href="/blogs/new?type=richtext" 
                  className="group flex items-center gap-4 pr-2"
                  onClick={() => setShowFabMenu(false)}
                >
                  <span className="bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                    Rich Text Editor
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20 hover:scale-110 transition-all border border-blue-400/20">
                    <Type size={16} strokeWidth={2.5} />
                  </div>
                </Link>
              </motion.div>

              {/* Option 1: Infographic */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
              >
                <Link 
                  href="/blogs/new?type=infographic" 
                  className="group flex items-center gap-4 pr-2"
                  onClick={() => setShowFabMenu(false)}
                >
                  <span className="bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                    Infographic Builder
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-xl hover:scale-110 transition-all border border-white/10">
                    <Layout size={16} strokeWidth={2.5} />
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10",
            showFabMenu 
              ? "bg-red-500 text-white rotate-45" 
              : "bg-[var(--foreground)] text-[var(--background)] hover:scale-105"
          )}
        >
          <Plus size={24} strokeWidth={2.5} className={cn("transition-transform duration-500", showFabMenu && "-rotate-45")} />
        </button>
      </div>
    </>
  );
}


