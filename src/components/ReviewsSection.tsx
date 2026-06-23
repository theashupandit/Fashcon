'use client';

import React, { useState, useTransition, useRef, useCallback, useEffect } from 'react';
import {
  Star, Loader2, Sparkles, Calendar,
  MessageSquare, X, CheckCircle2, Camera, ChevronDown,
  Quote, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addCustomerReview } from '@/app/actions/reviews';
import { toast } from 'sonner';

/* ─── Types ──────────────────────────────────────────────── */
interface Review {
  _id: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
}

const PAGE_SIZE = 5;

const RATING_LABELS: Record<number, string> = {
  1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent',
};

/* ─── StarRow ─────────────────────────────────────────────── */
function StarRow({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating
              ? 'fill-[#FFB800] text-[#FFB800]'
              : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
          }
        />
      ))}
    </div>
  );
}

/* ─── Cloudinary thumbnail helper ───────────────────────── */
/**
 * Transforms a Cloudinary upload URL to serve a compressed thumbnail.
 * Inserts w_300,h_300,c_fill,q_auto,f_auto before the upload path.
 * Falls back to the original URL for non-Cloudinary sources.
 */
function cloudinaryThumb(url: string, w = 300, h = 300): string {
  if (!url) return url;
  // Match standard Cloudinary upload URL pattern
  const match = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  if (!match) return url;
  return `${match[1]}w_${w},h_${h},c_fill,q_auto,f_auto/${match[2]}`;
}

/* ─── ImageLightbox ──────────────────────────────────────── */
interface LightboxState {
  url: string;
  reviewer: string;
  rating: number;
}

function ImageLightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  // Lock body scroll + Escape key handler
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <motion.div
      key="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Review photo"
    >
      {/* Panel — stop propagation so clicking image doesn't close */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-4 max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Full-res image */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={state.url}
            alt={`Review photo by ${state.reviewer}`}
            className="w-full max-h-[70vh] object-contain bg-black"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Reviewer info bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-black text-[var(--primary)]">
              {state.reviewer.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
            {state.reviewer}
          </span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={9}
                className={i <= state.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-white/20 text-white/20'} />
            ))}
          </div>
          <span className="text-[9px] text-white/30 ml-auto pl-3">
            Tap outside or press Esc to close
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── ReviewCard ──────────────────────────────────────────── */
function ReviewCard({
  review,
  index,
  onOpenLightbox,
}: {
  review: Review;
  index: number;
  onOpenLightbox: (state: LightboxState) => void;
}) {
  const initials = review.reviewerName
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString([], {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.25), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative p-4 rounded-2xl border border-[var(--foreground)]/[0.06] bg-[var(--foreground)]/[0.015] hover:bg-[var(--foreground)]/[0.03] transition-colors duration-300 space-y-3 overflow-hidden">
        <Quote
          size={36}
          className="absolute top-3 right-3 text-[var(--foreground)]/[0.04] fill-[var(--foreground)]/[0.04] pointer-events-none"
          aria-hidden
        />
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/20 flex items-center justify-center">
                <span className="text-[10px] font-black text-[var(--primary)] tracking-wider">{initials}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--background)] flex items-center justify-center">
                <CheckCircle2 size={10} className="text-emerald-500 fill-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider leading-tight">{review.reviewerName}</p>
              <StarRow rating={review.rating} size={10} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[var(--foreground)]/25 shrink-0">
            <Calendar size={8} />{date}
          </div>
        </div>

        <div className="h-px w-full bg-[var(--foreground)]/[0.04]" />

        <p className="text-xs leading-relaxed text-[var(--foreground)]/65 font-medium whitespace-pre-line">
          {review.comment}
        </p>

        {review.image && (
          <button
            type="button"
            onClick={() => onOpenLightbox({ url: review.image!, reviewer: review.reviewerName, rating: review.rating })}
            className="inline-block relative rounded-xl overflow-hidden border border-[var(--foreground)]/10 group/img cursor-zoom-in"
            aria-label="View full-size review photo"
          >
            {/* Optimised thumbnail — 300×300 via Cloudinary transforms */}
            <img
              src={cloudinaryThumb(review.image, 300, 300)}
              alt="Review attachment"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="w-24 h-24 object-cover group-hover/img:scale-110 transition-transform duration-500"
            />
            {/* Full View overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/55 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                <ZoomIn size={14} className="text-white" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">
                  Full View
                </span>
              </div>
            </div>
          </button>
        )}
      </div>
    </motion.article>
  );
}

/* ─── Main ────────────────────────────────────────────────── */
export default function ReviewsSection({ productId, initialReviews }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPending, startTransition] = useTransition();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Stats */
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 4.5;
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { distribution[Math.max(1, Math.min(5, Math.round(r.rating))) - 1]++; });

  /* Upload */
  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    setUploadingImage(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fashconcloud';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fashcon_upload_preset';
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', uploadPreset); fd.append('folder', 'Collection/reviews');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImage(data.secure_url);
      toast.success('Photo uploaded!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload photo.');
    } finally { setUploadingImage(false); }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) uploadImage(file);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0]; if (file) uploadImage(file);
  };

  const resetForm = () => {
    setName(''); setEmail(''); setRating(5); setComment(''); setImage(''); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name.'); return; }
    if (!comment.trim()) { toast.error('Please enter a comment.'); return; }
    if (rating < 1 || rating > 5) { toast.error('Please select a rating.'); return; }

    startTransition(async () => {
      const res = await addCustomerReview({
        productId, reviewerName: name, reviewerEmail: email || undefined,
        rating, comment, image: image || undefined,
      });
      if (res.success && res.review) {
        toast.success('Thank you! Your review has been posted.');
        setReviews((prev) => [res.review, ...prev]);
        setVisibleCount((v) => v + 1);
        resetForm();
      } else { toast.error(res.error || 'Failed to submit review.'); }
    });
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < totalReviews;
  const activeRating = hoverRating ?? rating;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[var(--foreground)]/[0.06]">

      {/* Section header — compact */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--primary)] mb-0.5">Community</p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic leading-none">
            Guest Reviews
          </h2>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--foreground)]/35">
          Verified customer feedback &amp; ratings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

        {/* ── Left: Stats ──────────────────────────────────────── */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">

          {/* Rating summary — editorial split layout */}
          <div className="flex gap-4 items-stretch">

            {/* Big score + stars */}
            <div className="flex flex-col justify-center items-center gap-1 pr-4 border-r border-[var(--foreground)]/[0.08] shrink-0">
              <span className="text-6xl font-black italic tracking-tighter text-[var(--primary)] leading-none tabular-nums">
                {averageRating}
              </span>
              <StarRow rating={Math.round(averageRating)} size={13} />
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/30 text-center mt-0.5">
                {totalReviews === 0
                  ? 'No reviews'
                  : `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-5 text-[8px] font-black text-[var(--foreground)]/30 flex items-center gap-0.5 shrink-0 tabular-nums">
                      {stars}<Star size={7} className="fill-[var(--foreground)]/30 text-[var(--foreground)]/30" />
                    </span>
                    <div className="flex-1 h-1 bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: pct > 0 ? 'linear-gradient(90deg,#ff2d64,#ff6b6b)' : 'transparent' }}
                      />
                    </div>
                    <span className="w-6 text-right text-[8px] font-black text-[var(--foreground)]/20 shrink-0 tabular-nums">
                      {count > 0 ? `${Math.round(pct)}%` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write review CTA */}
          {!showForm && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles size={11} className="text-[var(--primary)]" />
              Write A Review
            </motion.button>
          )}
        </div>

        {/* ── Right: Form or Reviews ────────────────────────────── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">

            {showForm ? (
              /* ── Form ─────────────────────────────────────────── */
              <motion.form
                key="review-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSubmit}
                className="relative p-5 sm:p-7 rounded-3xl border border-[var(--foreground)]/[0.08] bg-[var(--foreground)]/[0.015] space-y-5 overflow-hidden"
              >
                {/* Glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle,rgba(255,45,100,0.07) 0%,transparent 70%)' }} aria-hidden />

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--primary)]">Share Your Style</p>
                    <h3 className="text-lg font-black uppercase tracking-tight italic leading-tight mt-0.5">Submit Review</h3>
                  </div>
                  <button type="button" onClick={resetForm}
                    className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center transition-colors"
                    aria-label="Close form">
                    <X size={12} />
                  </button>
                </div>

                <div className="h-px w-full bg-[var(--foreground)]/[0.06]" />

                {/* Stars */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block">Rating</label>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-110 active:scale-90"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}>
                        <Star size={26}
                          className={`transition-all duration-150 ${star <= activeRating ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-transparent text-[var(--foreground)]/15'}`}
                          style={star <= activeRating ? { filter: 'drop-shadow(0 0 6px rgba(255,184,0,0.5))' } : {}}
                        />
                      </button>
                    ))}
                    <AnimatePresence mode="wait">
                      <motion.span key={activeRating}
                        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }}
                        transition={{ duration: 0.12 }}
                        className="ml-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/45">
                        {RATING_LABELS[activeRating]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="review-name" className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block">
                      Name <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input id="review-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Stella Carter"
                      className="w-full h-10 px-3.5 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--foreground)]/[0.08] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:opacity-25" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="review-email" className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block">
                      Email <span className="text-[var(--foreground)]/25 font-medium normal-case tracking-normal text-[9px]">(private, optional)</span>
                    </label>
                    <input id="review-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. stella@gmail.com"
                      className="w-full h-10 px-3.5 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--foreground)]/[0.08] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:opacity-25" />
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="review-comment" className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                      Review <span className="text-[var(--primary)]">*</span>
                    </label>
                    <span className={`text-[9px] font-bold tabular-nums ${comment.length > 900 ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/25'}`}>
                      {comment.length}/1000
                    </span>
                  </div>
                  <textarea id="review-comment" required maxLength={1000} rows={4} value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the craftsmanship, fit, fabric quality, and your overall experience…"
                    className="w-full p-3.5 rounded-2xl bg-[var(--foreground)]/[0.04] border border-[var(--foreground)]/[0.08] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all resize-none placeholder:opacity-25 leading-relaxed" />
                </div>

                {/* Photo upload */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block">
                    Photo <span className="text-[var(--foreground)]/25 font-medium normal-case tracking-normal text-[9px]">(optional)</span>
                  </label>

                  {image ? (
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--foreground)]/10 shrink-0">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImage('')}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 flex items-center justify-center" aria-label="Remove">
                          <X size={9} className="text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Photo attached</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="text-[9px] text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70 transition-colors mt-0.5">
                          Change photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/[0.04]' : 'border-[var(--foreground)]/[0.09] hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/[0.02]'}`}>
                      {uploadingImage ? (
                        <><Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">Uploading…</span></>
                      ) : (
                        <><Camera size={16} className={isDragging ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/30'} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/45">Drop photo or click to browse</p>
                          </div></>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" id="review-image-upload" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-1">
                  <button type="submit" disabled={isPending || uploadingImage}
                    className="px-8 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                    {isPending ? <><Loader2 size={12} className="animate-spin" />Posting…</> : 'Post Review'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/30 hover:text-[var(--foreground)]/60 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.form>

            ) : (
              /* ── Reviews List ──────────────────────────────────── */
              <motion.div key="reviews-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="py-14 px-6 rounded-3xl border border-[var(--foreground)]/[0.06] bg-[var(--foreground)]/[0.01] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/[0.04] flex items-center justify-center">
                      <MessageSquare size={18} className="text-[var(--foreground)]/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest">No Reviews Yet</p>
                      <p className="text-[11px] text-[var(--foreground)]/40 max-w-xs leading-relaxed">
                        Be the first to share your thoughts on this piece.
                      </p>
                    </div>
                    <button onClick={() => setShowForm(true)}
                      className="px-7 py-2.5 rounded-full border border-[var(--foreground)]/15 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
                      Write First Review
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/35">
                        {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                      </p>
                      <button onClick={() => setShowForm(true)}
                        className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline">
                        + Add Yours
                      </button>
                    </div>

                    <div className="space-y-3">
                      {visibleReviews.map((r, idx) => (
                        <ReviewCard key={r._id} review={r} index={idx} onOpenLightbox={setLightbox} />
                      ))}
                    </div>

                    {hasMore && (
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                        className="w-full mt-2 py-3 rounded-full border border-[var(--foreground)]/[0.1] hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/[0.03] transition-all text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-98">
                        <ChevronDown size={12} className="text-[var(--foreground)]/40" />
                        Load More ({totalReviews - visibleCount} remaining)
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* ── Image Lightbox ──────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && <ImageLightbox state={lightbox} onClose={closeLightbox} />}
      </AnimatePresence>
    </section>
  );
}
