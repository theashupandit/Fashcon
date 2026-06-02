'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Search as SearchIcon, Globe, Share2, CheckCircle2, AlertTriangle, XCircle,
  MessageSquare, Tag, TrendingUp, Eye, Sparkles, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { calculateSEOHealth } from '@/lib/seoHealthCheck';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBlogSeoMeta } from '@/app/actions/ai';
import { toast } from 'sonner';

interface SEOPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  excerpt: string;
  coverImage: string;
  onMetaDescriptionChange: (val: string) => void;
  onKeywordsChange: (val: string[]) => void;
}

export default function SEOPanel({
  isOpen, onClose,
  title, slug, metaDescription, keywords, content, excerpt, coverImage,
  onMetaDescriptionChange, onKeywordsChange
}: SEOPanelProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'social'>('health');
  const [keywordInput, setKeywordInput] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    toast.loading("AI is analyzing blog content & optimizing SEO...", { id: "seo-ai" });
    try {
      const data = await generateBlogSeoMeta({
        title,
        excerpt: excerpt || '',
        content: content || ''
      });
      if (data.focusKeyword) {
        setFocusKeyword(data.focusKeyword);
      }
      if (data.metaDescription) {
        onMetaDescriptionChange(data.metaDescription);
      }
      if (data.keywords && Array.isArray(data.keywords)) {
        onKeywordsChange(data.keywords);
      }
      toast.success("SEO Metadata successfully optimized by AI!", { id: "seo-ai" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to optimize SEO with AI", { id: "seo-ai" });
    } finally {
      setIsGenerating(false);
    }
  };

  const report = useMemo(() => calculateSEOHealth({
    title, slug, metaDescription, keywords, content, excerpt, coverImage, focusKeyword
  }), [title, slug, metaDescription, keywords, content, excerpt, coverImage, focusKeyword]);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      onKeywordsChange([...keywords, kw]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    onKeywordsChange(keywords.filter(k => k !== kw));
  };

  const scoreColor = report.score >= 80 ? 'text-emerald-500' : report.score >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = report.score >= 80 ? 'bg-emerald-500' : report.score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = report.score >= 80 ? 'Excellent' : report.score >= 50 ? 'Needs Work' : 'Poor';

  const statusIcon = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (status === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
  };

  // Truncate for social preview
  const previewTitle = title || 'Your Blog Post Title';
  const previewDesc = metaDescription || excerpt || 'Add a meta description to see how your post appears when shared on social platforms.';
  const domain = 'fashcon.com';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[61] bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[var(--foreground)]/[0.03] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">SEO Command</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Search engine optimization</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-8 w-8 bg-[var(--foreground)]/5 border border-[var(--border)] hover:bg-red-500 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Score Ring */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(report.score / 100) * 175.9} 175.9`} strokeLinecap="round" className={scoreColor} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-lg font-black", scoreColor)}>{report.score}</span>
                  </div>
                </div>
                <div>
                  <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none text-white", scoreBg)}>{scoreLabel}</Badge>
                  <p className="text-[10px] opacity-50 mt-1 font-medium">
                    {report.checks.filter(c => c.status === 'pass').length}/{report.checks.length} checks passed
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 p-1 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                {(['health', 'social'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      activeTab === tab
                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5"
                    )}
                  >
                    {tab === 'health' ? '🔍 Health Check' : '📱 Social Preview'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {activeTab === 'health' ? (
                <>
                  {/* AI SEO Assistant */}
                  <div className="p-4 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 blur-xl rounded-full pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-400">AI SEO Assistant</h4>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-zinc-400">Optimize with one-click</p>
                        </div>
                      </div>
                      <p className="text-[9px] leading-normal opacity-70">
                        Analyzes your blog content, title, and structure to generate the ideal focus keyword, click-worthy meta description, and keywords list.
                      </p>
                      <Button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="w-full h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Optimizing SEO...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Auto-Generate SEO Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Focus Keyword */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-2">Focus Keyword</label>
                    <input
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="e.g. luxury fashion"
                      className="w-full h-9 px-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[12px] font-bold placeholder:opacity-30 focus:border-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Meta Description</label>
                      <span className={cn("text-[9px] font-black tabular-nums", metaDescription.length > 160 ? "text-red-500" : "opacity-30")}>
                        {metaDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => onMetaDescriptionChange(e.target.value)}
                      placeholder="Write a compelling description for search engines..."
                      maxLength={200}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[12px] font-medium placeholder:opacity-30 focus:border-[var(--primary)]/50 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-2">Tags / Keywords</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Add keyword..."
                        className="flex-1 h-8 px-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[11px] font-bold placeholder:opacity-30 focus:border-[var(--primary)]/50 outline-none transition-all"
                      />
                      <Button onClick={addKeyword} size="sm" className="h-8 px-3 bg-[var(--primary)] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Add</Button>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw) => (
                          <Badge key={kw} variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-[var(--border)] gap-1 bg-[var(--background)]">
                            {kw}
                            <button onClick={() => removeKeyword(kw)} className="opacity-40 hover:opacity-100 transition-opacity">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Check Results */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-3">Analysis Results</label>
                    <div className="space-y-2">
                      {report.checks.map(check => (
                        <div key={check.id} className={cn(
                          "flex items-start gap-2.5 p-3 rounded-xl border transition-all",
                          check.status === 'pass' ? "border-emerald-500/10 bg-emerald-500/5" :
                          check.status === 'warning' ? "border-amber-500/10 bg-amber-500/5" :
                          "border-red-500/10 bg-red-500/5"
                        )}>
                          {statusIcon(check.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold">{check.label}</p>
                            <p className="text-[9px] opacity-60 mt-0.5">{check.message}</p>
                          </div>
                          <span className="text-[9px] font-black opacity-30 shrink-0">{check.points}/{check.maxPoints}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Facebook Preview */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-3 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3" /> Facebook / Social Preview
                    </p>
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--background)]">
                      <div className="aspect-[1.91/1] bg-[var(--muted)] relative overflow-hidden">
                        {coverImage ? (
                          <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-8 h-8 opacity-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-1 border-t border-[var(--border)]">
                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-40">{domain}</p>
                        <p className="text-[13px] font-bold leading-tight line-clamp-2">{previewTitle}</p>
                        <p className="text-[11px] opacity-60 line-clamp-2 leading-snug">{previewDesc.slice(0, 160)}</p>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Preview */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> WhatsApp Preview
                    </p>
                    <div className="bg-[#e5ded8] dark:bg-[#1a1a1a] p-4 rounded-2xl">
                      <div className="bg-white dark:bg-[#262d31] rounded-xl overflow-hidden shadow-sm max-w-[280px]">
                        {coverImage && (
                          <div className="aspect-[1.4/1] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3 space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600">{domain}</p>
                          <p className="text-[12px] font-bold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">{previewTitle}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">{previewDesc.slice(0, 120)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Preview */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-3 flex items-center gap-1.5">
                      <SearchIcon className="w-3 h-3" /> Google Search Preview
                    </p>
                    <div className="p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-[#202124] space-y-1">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">{domain} › blog › {slug || 'your-post-slug'}</p>
                      <p className="text-[16px] text-[#1a0dab] dark:text-[#8ab4f8] font-normal leading-tight hover:underline cursor-pointer">{previewTitle}</p>
                      <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{previewDesc.slice(0, 160)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
