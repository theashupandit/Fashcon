'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Check, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';

type Blog = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  coverImage?: string;
};

type SiteContentState = {
  content: {
    home: {
      blog: {
        title: string;
        subtitle: string;
        emptyTitle: string;
        emptyMessage: string;
        pinnedBlogIds: string[];
      };
    };
  };
};

const fallbackState: SiteContentState = {
  content: {
    home: {
      blog: {
        title: 'The Fashcon Feed',
        subtitle: 'Latest editorial edits and fashion reports',
        emptyTitle: 'Stories are being written',
        emptyMessage: 'New blog posts will appear here soon.',
        pinnedBlogIds: [],
      },
    },
  },
};

export default function BlogPanelPage() {
  const [siteContent, setSiteContent] = useState<SiteContentState>(fallbackState);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [contentRes, blogsRes] = await Promise.all([
          fetch('/api/site-content'),
          fetch('/api/blogs?status=published'),
        ]);

        const contentData = await contentRes.json();
        const blogData = await blogsRes.json();

        setSiteContent(contentData?.content ? contentData : fallbackState);
        setBlogs(Array.isArray(blogData) ? blogData : []);
      } catch (error) {
        toast.error('Failed to load blog panel data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const blogSection = (siteContent?.content?.home?.blog) || fallbackState.content.home.blog;
  const pinnedBlogIds = useMemo(() => blogSection?.pinnedBlogIds || [], [blogSection?.pinnedBlogIds]);
  
  const pinnedSet = useMemo(() => new Set(pinnedBlogIds), [pinnedBlogIds]);
  const pinnedBlogs = blogs.filter((blog) => pinnedSet.has(blog._id));
  const availableBlogs = blogs.filter((blog) => !pinnedSet.has(blog._id));

  const togglePinned = (blogId: string) => {
    setSiteContent((current) => {
      const currentContent = current?.content || fallbackState.content;
      const currentHome = currentContent?.home || fallbackState.content.home;
      const currentBlog = currentHome?.blog || fallbackState.content.home.blog;
      const currentIds = currentBlog?.pinnedBlogIds || [];
      
      const exists = currentIds.includes(blogId);
      const nextIds = exists
        ? currentIds.filter((id) => id !== blogId)
        : [...currentIds, blogId];

      return {
        ...current,
        content: {
          ...currentContent,
          home: {
            ...currentHome,
            blog: {
              ...currentBlog,
              pinnedBlogIds: nextIds,
            },
          },
        },
      };
    });
  };

  const savePanel = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { home: { blog: blogSection } } }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save blog panel settings');
      }

      toast.success('Blog panel settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Blog Panel</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-2 max-w-2xl">
            Pin editorial posts to the homepage &quot;Fashcon Feed&quot; section. Choose stories that define the season.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest">
            <Link href="/blogs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Story
            </Link>
          </Button>
          <Button onClick={savePanel} disabled={saving} className="h-11 px-6 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Sync Panel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6 items-start">
        <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Featured Stories</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {pinnedBlogs.length > 0 ? (
              pinnedBlogs.map((blog) => (
                <div key={blog._id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="relative h-16 w-24 overflow-hidden rounded-xl bg-[var(--muted)] shrink-0">
                    <SafeImage src={blog.coverImage || '/placeholder.png'} alt={blog.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black uppercase tracking-tight truncate">{blog.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{blog.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest" onClick={() => togglePinned(blog._id)}>
                    Unpin
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)] mb-3">{blogSection.emptyTitle}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{blogSection.emptyMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Editorial Library</CardTitle>
              <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Select published stories to feature on the feed.</p>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
              {availableBlogs.length} Available
            </Badge>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {availableBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBlogs.map((blog) => (
                  <button
                    key={blog._id}
                    onClick={() => togglePinned(blog._id)}
                    className="text-left rounded-3xl border border-[var(--border)] bg-[var(--background)] p-4 hover:border-[var(--primary)]/30 transition-all group"
                  >
                    <div className="aspect-video rounded-2xl overflow-hidden bg-[var(--muted)] relative mb-4">
                      <SafeImage src={blog.coverImage || '/placeholder.png'} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-tight line-clamp-2">{blog.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">{blog.category}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                      Feature on Home
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-lg font-black uppercase tracking-tight mb-2">No other stories yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-5">Create a new blog post to pin it to the feed.</p>
                <Button asChild className="rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px]">
                  <Link href="/blogs/new">Write Story</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
