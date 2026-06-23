'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Check,
  X as XIcon,
  Trash2,
  Search,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getReviews, updateReviewStatus, deleteReview, getReviewStats } from '@/app/actions/reviews';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Review {
  _id: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  productId?: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [stats, setStats] = useState<any>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { reviews: fetchedReviews, total, totalPages: pages } = await getReviews({
        page,
        limit,
        search: debouncedSearch,
        status: selectedStatus === 'All Status' ? undefined : selectedStatus.toLowerCase()
      });
      setReviews(fetchedReviews);
      setTotalReviews(total);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateReviewStatus(id, newStatus);
      toast.success(`Review marked as ${newStatus}`);
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteReview(deleteConfirmId);
      toast.success('Review permanently deleted');
      setDeleteConfirmId(null);
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <PageHeader
        title={<>Review <span className="text-neutral-400">Hub</span></>}
        subtitle="Customer Feedback & Moderation Queue"
        badge="Feedback"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Average Rating', value: `${stats?.average ?? 4.5} ★`, desc: 'Across approved entries', color: 'text-amber-500' },
          { label: 'Pending Approval', value: stats?.pending?.toString() || '0', desc: 'Awaiting moderation', color: 'text-blue-500' },
          { label: 'Approved Live', value: stats?.approved?.toString() || '0', desc: 'Active on storefront', color: 'text-emerald-500' },
          { label: 'Total Submissions', value: stats?.total?.toString() || '0', desc: 'All guest reviews', color: 'text-purple-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-4 group hover:border-[var(--primary)]/50 transition-all duration-500 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">{stat.label}</p>
            <p className={cn("text-2xl font-bold tracking-tighter mb-1", stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]/60 font-medium uppercase tracking-tight">{stat.desc}</p>
          </Card>
        ))}
      </div>

      {/* Moderation Queue Section */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 pb-4 border-b border-[var(--border)]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <h3 className="text-xl font-bold tracking-tight uppercase">Feedback Queue</h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="flex items-center p-1 bg-[var(--background)] rounded-2xl border border-[var(--border)] w-full md:w-80 shadow-inner">
                <Search className="w-4 h-4 text-zinc-500 shrink-0 ml-3.5" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 bg-transparent border-none text-[11px] font-bold focus-visible:ring-0 placeholder:text-neutral-500 placeholder:uppercase placeholder:tracking-widest"
                />
              </div>

              {/* Status Filter */}
              <Select
                onValueChange={(val) => { setSelectedStatus(val ?? 'All Status'); setPage(1); }}
                value={selectedStatus}
              >
                <SelectTrigger className="w-40 h-11 rounded-2xl border-[var(--border)] bg-[var(--background)] text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-[var(--primary)]/20 transition-all shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)] rounded-2xl p-1 shadow-2xl">
                  <SelectItem value="All Status" className="rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer">All Status</SelectItem>
                  <SelectItem value="Approved" className="rounded-xl font-bold text-[11px] uppercase tracking-wider text-emerald-600 focus:text-emerald-700 cursor-pointer">Approved</SelectItem>
                  <SelectItem value="Pending" className="rounded-xl font-bold text-[11px] uppercase tracking-wider text-amber-600 focus:text-amber-700 cursor-pointer">Pending</SelectItem>
                  <SelectItem value="Rejected" className="rounded-xl font-bold text-[11px] uppercase tracking-wider text-red-600 focus:text-red-700 cursor-pointer">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || selectedStatus !== 'All Status') && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="h-11 px-4 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-transparent transition-all"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Fetching feedback...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]/40">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">No Feedback Found</p>
                <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto mt-2 leading-relaxed">
                  No reviews matched your search criteria or moderation filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]/10">
              {reviews.map((review) => (
                <div key={review._id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="space-y-3 flex-1">
                    {/* Header: reviewer details & star score */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="text-sm font-black uppercase">{review.reviewerName}</span>
                      {review.reviewerEmail && (
                        <span className="text-xs text-[var(--muted-foreground)] lowercase">{review.reviewerEmail}</span>
                      )}
                      
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < review.rating ? "fill-[#FFB800] text-[#FFB800]" : "fill-zinc-200 text-zinc-200"}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-bold text-[var(--muted-foreground)]/40 uppercase tracking-wider">
                        {new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Product Context */}
                    {review.productId ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] opacity-50">Product:</span>
                        <Link
                          href={`/products/${review.productId._id}/edit`}
                          className="text-[10px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1 uppercase tracking-tight"
                        >
                          {review.productId.title}
                          <ExternalLink size={10} />
                        </Link>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--background)]/50 border border-[var(--border)] border-dashed">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/70">Orphaned/Deleted Product</span>
                      </div>
                    )}

                    {/* Review Text */}
                    <p className="text-xs leading-relaxed text-[var(--foreground)]/80 font-medium whitespace-pre-line bg-[var(--background)]/[0.02] p-4 rounded-xl border border-[var(--border)]/5">
                      {review.comment}
                    </p>

                    {/* Review Image (Optional) */}
                    {review.image && (
                      <div className="mt-3">
                        <a
                          href={review.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block group relative cursor-zoom-in"
                        >
                          <img
                            src={review.image}
                            alt="Attachment"
                            className="max-w-[150px] max-h-[150px] rounded-lg object-cover border border-[var(--border)] group-hover:opacity-90 transition-opacity"
                          />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center md:flex-col gap-3 shrink-0 self-center md:self-start md:items-end">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                        review.status === 'approved' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        review.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        review.status === 'rejected' && "bg-red-500/10 text-red-600 border-red-500/20"
                      )}
                    >
                      {review.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {review.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateStatus(review._id, 'approved')}
                          className="w-9 h-9 rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          title="Approve Review"
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      {review.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateStatus(review._id, 'rejected')}
                          className="w-9 h-9 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 transition-colors"
                          title="Reject Review"
                        >
                          <XIcon size={14} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(review._id)}
                        className="w-9 h-9 rounded-xl border-[var(--border)] text-zinc-500 hover:text-red-500 hover:border-red-500/20 transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Page {page} of {totalPages} ({totalReviews} Reviews)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                >
                  <ChevronLeft size={12} />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-6 overflow-hidden z-[201] text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="text-lg font-black tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Erase Review
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Are you sure you want to permanently erase this review from the database? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={executeDelete}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Erase Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dummy loader icon component definition
function Loader2({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
