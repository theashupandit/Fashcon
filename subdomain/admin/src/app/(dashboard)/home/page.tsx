'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MediaPickerModal, HeroPreview, LexicalEditor } from '../../../components/admin';
import LexicalToolbar from '../../../components/admin/lexical/LexicalToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Sparkles, Image as ImageIcon, Grid2X2, Store, Eye, Plus, MoreVertical, Edit2, Trash2, Layers, ShoppingBag, FileText, Search, Settings2, History as HistoryIcon, Megaphone, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';

import { useRouter, useSearchParams } from 'next/navigation';
import { getCategories, createCategory, deleteCategory, updateCategory } from '@/app/actions/categories';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { $getRoot, $insertNodes, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, REDO_COMMAND, UNDO_COMMAND, SELECTION_CHANGE_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTheme } from '../../../components/admin/lexical/LexicalTheme';

const LEXICAL_NODES = [HeadingNode, ListNode, ListItemNode, QuoteNode];

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

function FieldSyncPlugin({ initialHtml, onChange }: { initialHtml: string, onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!hasHydrated && initialHtml !== undefined) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml || '<p></p>', 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
      setHasHydrated(true);
    }
  }, [editor, initialHtml, hasHydrated]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor);
          onChange(html);
        });
      }}
    />
  );
}

// ── types ──────────────────────────────────────────────────────────────────
type Hero = {
  eyebrow: string; title: string; subtitle: string;
  primaryCtaLabel: string; primaryCtaHref: string;
  secondaryCtaLabel: string; secondaryCtaHref: string;
  imageUrl: string; imageAssetId: string;
  tabletImageUrl: string; tabletImageAssetId: string;
  mobileImageUrl: string; mobileImageAssetId: string;
  titleFont: string; titleColor: string;
  contentAlignment: 'top' | 'middle' | 'bottom';
  titleShadowColor?: string;
  titleShadowX?: number;
  titleShadowY?: number;
  titleShadowBlur?: number;
};
type Categories = {
  title: string;
  subtitle: string;
  marqueeItems: string[];
  marqueeLinks: string[];
};
type Store = { title: string; subtitle: string; emptyTitle: string; emptyMessage: string; pinnedProductIds: string[] };
type About = {
  title: string; tagline: string; intro: string;
  mainText1: string; mainText2: string;
  beliefs: string[]; mission: string; vision: string;
  footerTitle: string; footerTagline: string;
  imageUrl: string; imageAssetId: string;
  tabletImageUrl: string; tabletImageAssetId: string;
  mobileImageUrl: string; mobileImageAssetId: string;
  imageName?: string; imagePost?: string;
};
type Announcement = {
  text: string;
  linkText: string;
  linkHref: string;
  isActive: boolean;
  gradientStart: string;
  gradientVia: string;
  gradientEnd: string;
  textColor: string;
  accentColor: string;
};
type HomeContent = { hero: Hero; announcement: Announcement; categories: Categories; store: Store; about: About };

const FALLBACK: HomeContent = {
  hero: {
    eyebrow: 'Premium Fashion Finds • 2026 Edition',
    title: 'Elevate Your Everyday Aesthetic',
    subtitle: 'Discover hand-picked fashion edits, insider styling tips, and the season\u2019s most coveted looks.',
    primaryCtaLabel: 'Steal the Look', primaryCtaHref: '/categories',
    secondaryCtaLabel: 'Read the Latest', secondaryCtaHref: '/blog',
    imageUrl: '/placeholder-hero.jpg', imageAssetId: '',
    tabletImageUrl: '', tabletImageAssetId: '',
    mobileImageUrl: '', mobileImageAssetId: '',
    titleFont: '', titleColor: '#ffffff',
    contentAlignment: 'middle',
    titleShadowColor: 'rgba(0,0,0,0.4)',
    titleShadowX: 0,
    titleShadowY: 4,
    titleShadowBlur: 12,
  },
  categories: {
    title: "What's In Store?",
    subtitle: 'Discover the latest in every category',
    marqueeItems: ['Jewelry', 'Accessories', 'Dresses'],
    marqueeLinks: ['/category/jewelry', '/category/accessories', '/category/dresses'],
  },
  store: {
    title: 'Shop the Trends', subtitle: 'The most loved pieces this week',
    emptyTitle: 'Products are coming soon',
    emptyMessage: 'Add products from the admin store to feature them here.',
    pinnedProductIds: [],
  },
  about: {
    title: 'Our Story',
    tagline: 'At Fashcon, fashion is more than clothing — it’s identity, confidence, and self-expression.',
    intro: 'Fashcon was created with a simple vision: to make modern fashion feel iconic, wearable, and accessible for everyday people. In a world full of fast-changing trends, we wanted to build a brand that combines timeless aesthetics with the energy of modern style culture.',
    mainText1: 'From carefully selected outfits to trend-driven collections, every piece at Fashcon is chosen to help people express themselves with confidence. We believe style should feel effortless, bold, and personal — whether it’s a minimal everyday look or a statement outfit.',
    mainText2: 'Our journey started with a passion for fashion inspiration, aesthetics, and digital culture. Over time, that passion evolved into a growing fashion brand focused on delivering stylish, modern, and visually inspiring products for the new generation.',
    beliefs: [
      'Fashion should feel confident, not complicated.',
      'Trends should inspire individuality, not copy it.',
      'Quality visuals and aesthetic experiences matter.',
      'Style is a lifestyle, not just an outfit.'
    ],
    mission: 'To build a fashion destination where modern aesthetics meet everyday confidence.',
    vision: 'To become a globally recognized fashion brand known for iconic style, trend-forward collections, and a strong visual identity.',
    footerTitle: 'Fashcon',
    footerTagline: 'Iconic Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    imageAssetId: '',
    tabletImageUrl: '', tabletImageAssetId: '',
    mobileImageUrl: '', mobileImageAssetId: '',
    imageName: 'Apurva',
    imagePost: 'Founder & Creative Director',
  },
  announcement: {
    text: 'The Glow Up Edit is Here',
    linkText: 'Unlock 15% Off Your First Order',
    linkHref: '#newsletter',
    isActive: true,
    gradientStart: '#1a052e',
    gradientVia: '#6b0f6c',
    gradientEnd: '#be123c',
    textColor: '#ffffff',
    accentColor: '#FF8FB1',
  },
};

type FieldKey =
  | 'hero.eyebrow' | 'hero.title' | 'hero.subtitle'
  | 'hero.primaryCtaLabel' | 'hero.secondaryCtaLabel'
  | 'categories.title' | 'categories.subtitle'
  | 'categories.marqueeItems' | 'categories.marqueeLinks'
  | 'store.title' | 'store.subtitle' | 'store.emptyTitle' | 'store.emptyMessage'
  | 'about.title' | 'about.tagline' | 'about.intro' | 'about.mainText1' | 'about.mainText2'
  | 'about.mission' | 'about.vision' | 'about.footerTitle' | 'about.footerTagline';

const FIELD_LABELS: Record<FieldKey, string> = {
  'hero.eyebrow': 'Eyebrow', 'hero.title': 'Headline', 'hero.subtitle': 'Subtitle',
  'hero.primaryCtaLabel': 'CTA 1', 'hero.secondaryCtaLabel': 'CTA 2',
  'categories.title': 'Cat. Title', 'categories.subtitle': 'Cat. Sub',
  'categories.marqueeItems': 'Marquee Text', 'categories.marqueeLinks': 'Marquee Links',
  'store.title': 'Store Title', 'store.subtitle': 'Store Sub',
  'store.emptyTitle': 'Empty Title', 'store.emptyMessage': 'Empty Msg',
  'about.title': 'About Title', 'about.tagline': 'About Tagline', 'about.intro': 'About Intro',
  'about.mainText1': 'Main Text 1', 'about.mainText2': 'Main Text 2',
  'about.mission': 'Mission', 'about.vision': 'Vision',
  'about.footerTitle': 'Footer Title', 'about.footerTagline': 'Footer Tagline',
};



// ── inline editable field ──────────────────────────────────────────────────
function InlineField({ fieldKey, value, placeholder, onFocus, activeField, onChange, singleLine = false }: {
  fieldKey: FieldKey; value: string; placeholder: string;
  onFocus: (key: FieldKey, editor: any) => void;
  activeField: FieldKey | null;
  onChange: (key: FieldKey, html: string) => void;
  singleLine?: boolean;
}) {
  const isActive = activeField === fieldKey;

  const initialConfig = useMemo(() => ({
    namespace: fieldKey,
    theme: LexicalTheme,
    nodes: LEXICAL_NODES,
    onError: (e: Error) => console.error(e),
  }), [fieldKey]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={`rounded-xl border transition-all cursor-text relative ${isActive
            ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--background)]'
            : 'border-[var(--border)] bg-[var(--background)]/50 hover:border-[var(--primary)]/40'
          }`}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable className={cn(
            "focus:outline-none w-full p-3 prose prose-sm dark:prose-invert max-w-none [&_p]:my-0",
            singleLine ? 'min-h-[44px]' : 'min-h-[88px]'
          )} />}
          placeholder={<div className="absolute top-3 left-3 opacity-20 text-sm pointer-events-none">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <FieldSyncPlugin initialHtml={value} onChange={(html) => onChange(fieldKey, html)} />
        <EditorCapturer onFocus={(editor) => onFocus(fieldKey, editor)} isActive={isActive} />
      </div>
    </LexicalComposer>
  );
}

function EditorCapturer({ onFocus, isActive }: { onFocus: (editor: any) => void; isActive: boolean }) {
  const [editor] = useLexicalComposerContext();
  return (
    <div
      className={`absolute inset-0 z-[1] cursor-text ${isActive ? 'pointer-events-none' : ''}`}
      onClick={() => {
        editor.focus();
        onFocus(editor);
      }}
    />
  );
}

// ── tab definitions ────────────────────────────────────────────────────────
type TabId = 'hero' | 'announcement' | 'store' | 'taxonomy' | 'about' | 'preview';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'hero', label: 'Hero Section', icon: ImageIcon },
  { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
  { id: 'taxonomy', label: 'Taxonomy', icon: Layers },
  { id: 'store', label: 'Store Intro', icon: Store },
  { id: 'about', label: 'Our Story', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
];

// ── main page ──────────────────────────────────────────────────────────────
export default function HomeContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [home, setHome] = useState<HomeContent>(FALLBACK);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialTab = (searchParams.get('tab') as TabId) || 'hero';
  const [tab, setTab] = useState<TabId>(TABS.some(t => t.id === initialTab) ? initialTab : 'hero');

  // Sync tab state with URL query parameter
  useEffect(() => {
    const t = searchParams.get('tab') as TabId;
    if (t && TABS.some(tab => tab.id === t) && t !== tab) {
      setTab(t);
    }
  }, [searchParams, tab]);

  const handleTabChange = (id: TabId) => {
    setTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isTabletMediaOpen, setIsTabletMediaOpen] = useState(false);
  const [isMobileMediaOpen, setIsMobileMediaOpen] = useState(false);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [activeEditor, setActiveEditor] = useState<any>(null);
  const [marqueeTextInput, setMarqueeTextInput] = useState(FALLBACK.categories.marqueeItems.join('\n'));
  const [marqueeLinkInput, setMarqueeLinkInput] = useState(FALLBACK.categories.marqueeLinks.join('\n'));
  const [beliefsInput, setBeliefsInput] = useState('');
  const [isAboutMediaOpen, setIsAboutMediaOpen] = useState(false);
  const [isAboutTabletMediaOpen, setIsAboutTabletMediaOpen] = useState(false);
  const [isAboutMobileMediaOpen, setIsAboutMobileMediaOpen] = useState(false);

  // Taxonomy State
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [selectedParentFilter, setSelectedParentFilter] = useState('PARENTS_ONLY');
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', type: 'product' as 'product' | 'blog', icon: 'fa-tag', color: '#6366f1', parentCategory: '' });
  const [catSubmitting, setCatSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [siteRes, catRes] = await Promise.all([
          fetch('/api/site-content'),
          getCategories()
        ]);
        const siteData = await siteRes.json();
        if (siteData?.content) {
          const homeData = siteData.content.home || {};
          const announcementData = siteData.content.announcement || {};
          const nextHome = {
            ...FALLBACK,
            ...homeData,
            announcement: {
              ...FALLBACK.announcement,
              ...announcementData,
            },
            hero: {
              ...FALLBACK.hero,
              ...(homeData.hero || {}),
            },
            categories: {
              ...FALLBACK.categories,
              ...(homeData.categories || {}),
            },
            about: {
              ...FALLBACK.about,
              ...(homeData.about || {}),
            }
          };
          setHome(nextHome);
          setMarqueeTextInput((nextHome.categories.marqueeItems || []).join('\n'));
          setMarqueeLinkInput((nextHome.categories.marqueeLinks || []).join('\n'));
          setBeliefsInput((nextHome.about.beliefs || []).join('\n'));
        }
        setCategories(catRes || []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshCategories = async () => {
    setCatLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      toast.error("Failed to refresh categories");
    } finally {
      setCatLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.name) return;
    setCatSubmitting(true);
    try {
      const slug = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const created = await createCategory({ ...newCat, slug, count: 0 });
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCatDialogOpen(false);
      setNewCat({ name: '', type: 'product', icon: 'fa-tag', color: '#6366f1', parentCategory: '' });
      toast.success("Category created");
    } catch (e) {
      toast.error("Failed to create category");
    } finally {
      setCatSubmitting(false);
    }
  };

  const [deleteCategoryConfirmId, setDeleteCategoryConfirmId] = useState<string | null>(null);

  const handleDeleteCategory = (id: string) => {
    setDeleteCategoryConfirmId(id);
  };

  const executeDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Category deleted");
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = useMemo(() => {
    let list = categories.filter(cat =>
      cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      cat.slug.toLowerCase().includes(catSearch.toLowerCase())
    );

    if (selectedParentFilter === 'PARENTS_ONLY') {
      list = list.filter(cat => !cat.parentCategory);
    } else if (selectedParentFilter === 'SUBS_ONLY') {
      list = list.filter(cat => !!cat.parentCategory);
    } else if (selectedParentFilter !== 'ALL') {
      list = list.filter(cat => cat.parentCategory === selectedParentFilter || cat.name === selectedParentFilter);
    }

    if (selectedParentFilter === 'ALL') {
      const parents = list.filter(c => !c.parentCategory);
      const subs = list.filter(c => !!c.parentCategory);
      
      const sortedList: any[] = [];
      parents.forEach(parent => {
        sortedList.push(parent);
        const childs = subs.filter(c => c.parentCategory === parent.name);
        sortedList.push(...childs);
      });
      
      const orphaned = subs.filter(sub => !parents.some(p => p.name === sub.parentCategory));
      sortedList.push(...orphaned);
      
      return sortedList;
    }

    return list;
  }, [categories, catSearch, selectedParentFilter]);

  const handleFocus = useCallback((key: FieldKey, editor: any) => {
    setActiveField(key);
    setActiveEditor(editor);
  }, []);

  const handleChange = useCallback((key: FieldKey, html: string) => {
    const [section, field] = key.split('.') as [keyof HomeContent, string];
    setHome(prev => ({ ...prev, [section]: { ...(prev[section] as any), [field]: html } }));
  }, []);

  const updateHero = (field: keyof Hero, value: any) =>
    setHome(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));

  const updateAbout = (field: keyof About, value: any) =>
    setHome(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));

  const updateAnnouncement = (field: keyof Announcement, value: any) =>
    setHome(prev => ({
      ...prev,
      announcement: {
        ...(prev.announcement || FALLBACK.announcement),
        [field]: value
      }
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const marqueeItems = marqueeTextInput
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
      const marqueeLinks = marqueeLinkInput
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const beliefs = beliefsInput
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const { about, announcement, ...homeWithoutAbout } = {
        ...home,
        categories: {
          ...home.categories,
          marqueeItems,
          marqueeLinks,
        },
        about: {
          ...home.about,
          beliefs,
        },
      };

      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { home: homeWithoutAbout, about, announcement } }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('Homepage content saved');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
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

  const fieldProps = { onFocus: handleFocus, activeField, onChange: handleChange };

  return (
    <div className="pb-20">

      {/* ── Main content ── */}
      <div className="pt-6 space-y-6">
        {/* Sticky Toolbar for Home Fields */}
        <div className="sticky top-[62px] z-[60] -mx-4 px-4 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] mb-6 shadow-md transition-shadow">
          <LexicalToolbar
            editor={tab === 'preview' || tab === 'taxonomy' ? null : activeEditor}
            activeFieldLabel={activeField ? FIELD_LABELS[activeField] : undefined}
          />
        </div>

        <PageHeader
          title="Home Content"
          subtitle="Editorial design and section management"
          badge="Layout"
          actions={
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-8 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Manifest Changes
            </Button>
          }
        />

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-3 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${tab === id
                ? 'text-[var(--primary)] font-black after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="min-h-[60vh]">

          {/* HERO TAB */}
          {tab === 'hero' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <Label>Eyebrow</Label>
                <InlineField fieldKey="hero.eyebrow" value={home.hero.eyebrow} placeholder="Eyebrow text" {...fieldProps} singleLine />
              </div>
              <div>
                <Label>Headline</Label>
                <InlineField fieldKey="hero.title" value={home.hero.title} placeholder="Hero headline" {...fieldProps} singleLine />
              </div>
              <div>
                <Label>Subtitle</Label>
                <InlineField fieldKey="hero.subtitle" value={home.hero.subtitle} placeholder="Hero subtitle" {...fieldProps} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary CTA Label</Label>
                  <InlineField fieldKey="hero.primaryCtaLabel" value={home.hero.primaryCtaLabel} placeholder="Button label" {...fieldProps} singleLine />
                </div>
                <div>
                  <Label>Primary CTA Link</Label>
                  <Input value={home.hero.primaryCtaHref} onChange={e => updateHero('primaryCtaHref', e.target.value)} placeholder="/categories" className="h-10 rounded-xl" />
                </div>
                <div>
                  <Label>Secondary CTA Label</Label>
                  <InlineField fieldKey="hero.secondaryCtaLabel" value={home.hero.secondaryCtaLabel} placeholder="Button label" {...fieldProps} singleLine />
                </div>
                <div>
                  <Label>Secondary CTA Link</Label>
                  <Input value={home.hero.secondaryCtaHref} onChange={e => updateHero('secondaryCtaHref', e.target.value)} placeholder="/blog" className="h-10 rounded-xl" />
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              <div>
                <Label>Desktop Image URL</Label>
                <div className="flex gap-2">
                  <Input value={home.hero.imageUrl} onChange={e => updateHero('imageUrl', e.target.value)} placeholder="https://..." className="h-10 rounded-xl flex-1" />
                  <Button type="button" variant="outline" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => setIsMediaOpen(true)}>Assets</Button>
                  <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => updateHero('imageUrl', '')}>Clear</Button>
                </div>
              </div>

              <div>
                <Label>Tablet Image URL <span className="normal-case font-normal opacity-60">(optional — falls back to desktop)</span></Label>
                <div className="flex gap-2">
                  <Input value={home.hero.tabletImageUrl} onChange={e => updateHero('tabletImageUrl', e.target.value)} placeholder="https://..." className="h-10 rounded-xl flex-1" />
                  <Button type="button" variant="outline" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => setIsTabletMediaOpen(true)}>Assets</Button>
                  <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => { updateHero('tabletImageUrl', ''); updateHero('tabletImageAssetId', ''); }}>Clear</Button>
                </div>
              </div>

              <div>
                <Label>Mobile Image URL <span className="normal-case font-normal opacity-60">(optional — falls back to desktop)</span></Label>
                <div className="flex gap-2">
                  <Input value={home.hero.mobileImageUrl} onChange={e => updateHero('mobileImageUrl', e.target.value)} placeholder="https://..." className="h-10 rounded-xl flex-1" />
                  <Button type="button" variant="outline" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => setIsMobileMediaOpen(true)}>Assets</Button>
                  <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => { updateHero('mobileImageUrl', ''); updateHero('mobileImageAssetId', ''); }}>Clear</Button>
                </div>
              </div>

              <div className="h-px bg-[var(--border)] my-6" />
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-white/50 mb-4">Headline Text Shadow Curation</h3>
              <div className="space-y-4 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Shadow Color</Label>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-xl border border-white/10 shrink-0 relative overflow-hidden">
                        <input
                          type="color"
                          value={home.hero.titleShadowColor?.startsWith('#') ? home.hero.titleShadowColor : '#000000'}
                          onChange={e => updateHero('titleShadowColor', e.target.value)}
                          className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                        />
                      </div>
                      <Input
                        value={home.hero.titleShadowColor || 'rgba(0,0,0,0.4)'}
                        onChange={e => updateHero('titleShadowColor', e.target.value)}
                        placeholder="#000000 or rgba(0,0,0,0.4)"
                        className="h-10 rounded-xl flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Blur Radius <span className="opacity-60 font-normal">({home.hero.titleShadowBlur ?? 12}px)</span></Label>
                    <div className="flex items-center gap-3 h-10">
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={home.hero.titleShadowBlur ?? 12}
                        onChange={e => updateHero('titleShadowBlur', parseInt(e.target.value))}
                        className="flex-1 accent-[var(--primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Horizontal Offset (X) <span className="opacity-60 font-normal">({home.hero.titleShadowX ?? 0}px)</span></Label>
                    <div className="flex items-center gap-3 h-10">
                      <input
                        type="range"
                        min="-25"
                        max="25"
                        value={home.hero.titleShadowX ?? 0}
                        onChange={e => updateHero('titleShadowX', parseInt(e.target.value))}
                        className="flex-1 accent-[var(--primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Vertical Offset (Y) <span className="opacity-60 font-normal">({home.hero.titleShadowY ?? 4}px)</span></Label>
                    <div className="flex items-center gap-3 h-10">
                      <input
                        type="range"
                        min="-25"
                        max="25"
                        value={home.hero.titleShadowY ?? 4}
                        onChange={e => updateHero('titleShadowY', parseInt(e.target.value))}
                        className="flex-1 accent-[var(--primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENT TAB */}
          {tab === 'announcement' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold">Active Status</Label>
                    <p className="text-xs text-zinc-500 dark:text-white/40">Toggle the announcement bar visibility across the entire website.</p>
                  </div>
                  <Switch
                    checked={home.announcement?.isActive ?? true}
                    onCheckedChange={(checked) => updateAnnouncement('isActive', checked)}
                  />
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Announcement Text</Label>
                    <Input
                      value={home.announcement?.text ?? ''}
                      onChange={(e) => updateAnnouncement('text', e.target.value)}
                      placeholder="e.g. The Glow Up Edit is Here"
                      className="h-12 rounded-xl bg-transparent border-[var(--border)] focus:border-[var(--primary)]/30 text-[14px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Link Text (CTA)</Label>
                      <Input
                        value={home.announcement?.linkText ?? ''}
                        onChange={(e) => updateAnnouncement('linkText', e.target.value)}
                        placeholder="e.g. Unlock 15% Off Your First Order"
                        className="h-12 rounded-xl bg-transparent border-[var(--border)] focus:border-[var(--primary)]/30 text-[14px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Link Destination (URL)</Label>
                      <Input
                        value={home.announcement?.linkHref ?? ''}
                        onChange={(e) => updateAnnouncement('linkHref', e.target.value)}
                        placeholder="e.g. #newsletter or /categories"
                        className="h-12 rounded-xl bg-transparent border-[var(--border)] focus:border-[var(--primary)]/30 text-[14px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Background Gradient Setup */}
                  <div className="space-y-4 bg-zinc-100/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-2xl p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Background Gradient</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Start Color</Label>
                        <div className="flex gap-2 w-36">
                          <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0 relative overflow-hidden">
                            <input
                              type="color"
                              value={home.announcement?.gradientStart || '#1a052e'}
                              onChange={e => updateAnnouncement('gradientStart', e.target.value)}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                            />
                          </div>
                          <Input
                            value={home.announcement?.gradientStart || '#1a052e'}
                            onChange={e => updateAnnouncement('gradientStart', e.target.value)}
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Via Color (Middle)</Label>
                        <div className="flex gap-2 w-36">
                          <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0 relative overflow-hidden">
                            <input
                              type="color"
                              value={home.announcement?.gradientVia || '#6b0f6c'}
                              onChange={e => updateAnnouncement('gradientVia', e.target.value)}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                            />
                          </div>
                          <Input
                            value={home.announcement?.gradientVia || '#6b0f6c'}
                            onChange={e => updateAnnouncement('gradientVia', e.target.value)}
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">End Color</Label>
                        <div className="flex gap-2 w-36">
                          <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0 relative overflow-hidden">
                            <input
                              type="color"
                              value={home.announcement?.gradientEnd || '#be123c'}
                              onChange={e => updateAnnouncement('gradientEnd', e.target.value)}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                            />
                          </div>
                          <Input
                            value={home.announcement?.gradientEnd || '#be123c'}
                            onChange={e => updateAnnouncement('gradientEnd', e.target.value)}
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography / Foreground Colors */}
                  <div className="space-y-4 bg-zinc-100/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-2xl p-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Foreground Elements</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Text Color</Label>
                        <div className="flex gap-2 w-36">
                          <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0 relative overflow-hidden">
                            <input
                              type="color"
                              value={home.announcement?.textColor || '#ffffff'}
                              onChange={e => updateAnnouncement('textColor', e.target.value)}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                            />
                          </div>
                          <Input
                            value={home.announcement?.textColor || '#ffffff'}
                            onChange={e => updateAnnouncement('textColor', e.target.value)}
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Accent & Link Color</Label>
                        <div className="flex gap-2 w-36">
                          <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0 relative overflow-hidden">
                            <input
                              type="color"
                              value={home.announcement?.accentColor || '#FF8FB1'}
                              onChange={e => updateAnnouncement('accentColor', e.target.value)}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                            />
                          </div>
                          <Input
                            value={home.announcement?.accentColor || '#FF8FB1'}
                            onChange={e => updateAnnouncement('accentColor', e.target.value)}
                            className="h-8 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview inside editor */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Preview</Label>
                  <div 
                    style={{ 
                      background: `linear-gradient(to right, ${home.announcement?.gradientStart || '#1a052e'}, ${home.announcement?.gradientVia || '#6b0f6c'}, ${home.announcement?.gradientEnd || '#be123c'})`,
                      color: home.announcement?.textColor || '#ffffff'
                    }}
                    className="relative z-10 flex min-h-[44px] w-full items-center justify-center overflow-hidden px-3 py-2.5 rounded-2xl shadow-md border border-white/5 transition-all duration-300"
                  >
                    <div className="relative flex w-full items-center justify-center">
                      <div className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                        <span className="opacity-90 flex items-center gap-1.5">
                          <span className="text-yellow-400">★</span> {home.announcement?.text || "The Glow Up Edit is Here"}
                        </span>
                        <span style={{ color: home.announcement?.accentColor || '#FF8FB1' }}>✦</span>
                        <span
                          style={{ color: home.announcement?.accentColor || '#FF8FB1' }}
                          className="italic underline underline-offset-4 cursor-pointer"
                        >
                          {home.announcement?.linkText || "Unlock 15% Off Your First Order"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}



          {/* STORE TAB */}
          {tab === 'store' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Section Title</Label>
                <InlineField fieldKey="store.title" value={home.store.title} placeholder="Store section title" {...fieldProps} singleLine />
              </div>
              <div>
                <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Section Subtitle</Label>
                <InlineField fieldKey="store.subtitle" value={home.store.subtitle} placeholder="Store section subtitle" {...fieldProps} />
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div>
                <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Empty State Title</Label>
                <InlineField fieldKey="store.emptyTitle" value={home.store.emptyTitle} placeholder="Empty state title" {...fieldProps} singleLine />
              </div>
              <div>
                <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Empty State Message</Label>
                <InlineField fieldKey="store.emptyMessage" value={home.store.emptyMessage} placeholder="Empty state message" {...fieldProps} />
              </div>
            </div>
          )}

          {/* TAXONOMY HUB (Merged) */}
          {tab === 'taxonomy' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Global Section Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Grid2X2 size={16} className="text-[var(--primary)]" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Section Display</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Hero Title</Label>
                      <InlineField fieldKey="categories.title" value={home.categories.title} placeholder="Category section title" {...fieldProps} singleLine />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Hero Subtitle</Label>
                      <InlineField fieldKey="categories.subtitle" value={home.categories.subtitle} placeholder="Category section subtitle" {...fieldProps} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <HistoryIcon size={16} className="text-[var(--primary)]" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Marquee Engine</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Labels</Label>
                      <textarea
                        value={marqueeTextInput}
                        onChange={(e) => setMarqueeTextInput(e.target.value)}
                        placeholder={"Jewelry\nAccessories"}
                        className="w-full min-h-[100px] rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]/40 transition-all"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold opacity-30 uppercase ml-1">Targets</Label>
                      <textarea
                        value={marqueeLinkInput}
                        onChange={(e) => setMarqueeLinkInput(e.target.value)}
                        placeholder={"/category/jewelry\n/category/accessories"}
                        className="w-full min-h-[100px] rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[var(--border)]" />

              {/* Category Management */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative group flex-1 max-w-sm">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                      <Input
                        placeholder="Filter taxonomy..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="h-10 pl-12 rounded-xl bg-transparent border-[var(--border)] focus:border-[var(--primary)]/30 transition-all font-bold text-[13px]"
                      />
                    </div>
                    <Select value={selectedParentFilter} onValueChange={(v) => setSelectedParentFilter(v ?? 'ALL')}>
                      <SelectTrigger className="w-48 h-10 rounded-xl border-[var(--border)] bg-transparent text-[11px] font-bold uppercase tracking-widest">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[var(--border)]">
                        <SelectItem value="ALL" className="text-xs font-bold cursor-pointer rounded-lg">All Categories</SelectItem>
                        <SelectItem value="PARENTS_ONLY" className="text-xs font-bold cursor-pointer rounded-lg">Parents Only</SelectItem>
                        <SelectItem value="SUBS_ONLY" className="text-xs font-bold cursor-pointer rounded-lg">Subcategories Only</SelectItem>
                        {categories.filter(c => !c.parentCategory).map(c => (
                          <SelectItem key={c._id} value={c.name} className="text-xs font-bold cursor-pointer rounded-lg">
                            {toTitleCase(c.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={refreshCategories}
                      disabled={catLoading}
                      className="h-10 w-10 p-0 rounded-xl border-[var(--border)] transition-all"
                    >
                      <Loader2 className={cn("w-4 h-4", catLoading && "animate-spin")} />
                    </Button>
                    <Button
                      onClick={() => setIsCatDialogOpen(true)}
                      className="h-10 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                    >
                      <Plus size={16} strokeWidth={3} /> New Category
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-[var(--border)] bg-zinc-50/50 dark:bg-white/[0.01]">
                         <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Identity</th>
                         <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-center">Visual</th>
                         <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Context</th>
                         <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-center">Assets</th>
                         <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border)]">
                       {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                         const isSub = !!cat.parentCategory;
                         return (
                         <tr 
                           key={cat._id} 
                           className="group hover:bg-white/[0.01] transition-colors cursor-pointer"
                           onClick={() => router.push(`/categories/${cat._id}`)}
                         >
                           <td className="px-4 py-1.5">
                             <div className={cn("flex items-center gap-2", isSub && "pl-5")}>
                               {isSub && (
                                 <span className="text-[var(--muted-foreground)] text-xs opacity-20 -mr-1.5 select-none">{'\u2514'}</span>
                               )}
                               <div
                                 className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-105"
                                 style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                               >
                                 <i className={`fa-solid ${cat.icon || 'fa-tag'}`} />
                               </div>
                               <div>
                                 <p className={cn(
                                   "font-bold tracking-tight group-hover:text-[var(--primary)] transition-colors text-xs",
                                   isSub ? "opacity-75" : "text-sm"
                                 )}>{cat.name}</p>
                                 <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest leading-none mt-0.5">/{cat.slug}</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-4 py-1.5 text-center">
                             <div className="w-10 h-6.5 rounded-md overflow-hidden border border-[var(--border)] mx-auto relative">
                               {cat.bannerImage ? (
                                 <img src={cat.bannerImage} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center opacity-15"><ImageIcon size={10} /></div>
                               )}
                             </div>
                           </td>
                           <td className="px-4 py-1.5">
                             <div className="flex flex-col gap-0.5 items-start justify-center">
                               <Badge
                                 variant="outline"
                                 className="rounded-md border-transparent px-1.5 py-0 text-[7px] font-black uppercase tracking-widest"
                                 style={{ backgroundColor: `${cat.color}10`, color: cat.color }}
                               >
                                 {cat.type}
                               </Badge>
                               {isSub && (
                                 <span className="text-[7px] font-bold uppercase tracking-widest opacity-35 leading-none">
                                   {'\u21B3'} {cat.parentCategory}
                                 </span>
                               )}
                             </div>
                           </td>
                           <td className="px-4 py-1.5 text-center">
                             <span className="text-sm font-black italic tracking-tighter opacity-75">{cat.count || 0}</span>
                           </td>
                           <td className="px-4 py-1.5 text-right">
                             <div className="flex items-center justify-end gap-0.5">
                               <Link href={`/categories/${cat._id}`} onClick={(e) => e.stopPropagation()}>
                                 <Button variant="ghost" size="icon" className="w-6.5 h-6.5 rounded-md hover:bg-[var(--primary)] hover:text-white transition-all">
                                   <Settings2 size={11} />
                                 </Button>
                               </Link>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteCategory(cat._id);
                                 }}
                                 className="w-6.5 h-6.5 rounded-md hover:bg-red-500/10 text-red-500 transition-all"
                               >
                                 <Trash2 size={11} />
                               </Button>
                             </div>
                           </td>
                         </tr>
                       );}) : (
                         <tr>
                           <td colSpan={5} className="px-6 py-10 text-center opacity-20 italic text-xs">
                             No categories found matching your filter...
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {tab === 'about' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <Label>Page Title</Label>
                    <InlineField fieldKey="about.title" value={home.about.title} placeholder="Our Story" {...fieldProps} singleLine />
                  </div>
                  <div>
                    <Label>Top Tagline</Label>
                    <InlineField fieldKey="about.tagline" value={home.about.tagline} placeholder="Main tagline" {...fieldProps} />
                  </div>
                  <div>
                    <Label>Intro Paragraph</Label>
                    <InlineField fieldKey="about.intro" value={home.about.intro} placeholder="First paragraph" {...fieldProps} />
                  </div>
                </div>

                <div className="space-y-5">
                  <Label>Story Image</Label>
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)] relative group">
                    {home.about.imageUrl ? (
                      <>
                        <img src={home.about.imageUrl} alt="Story" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setIsAboutMediaOpen(true)}>Change</Button>
                          <Button size="sm" variant="destructive" onClick={() => { updateAbout('imageUrl', ''); updateAbout('imageAssetId', ''); }}>Remove</Button>
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => setIsAboutMediaOpen(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-[var(--primary)]/5 transition-colors"
                      >
                        <ImageIcon size={32} className="opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Choose Image</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Image Subject Name</Label>
                      <Input
                        value={home.about.imageName || ''}
                        onChange={(e) => updateAbout('imageName', e.target.value)}
                        placeholder="e.g. Apurva"
                        className="h-10 rounded-xl bg-transparent border-[var(--border)] text-sm px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Role / Post</Label>
                      <Input
                        value={home.about.imagePost || ''}
                        onChange={(e) => updateAbout('imagePost', e.target.value)}
                        placeholder="e.g. Founder & Creative Director"
                        className="h-10 rounded-xl bg-transparent border-[var(--border)] text-sm px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <Label>Tablet Story Image <span className="normal-case font-normal opacity-60">(optional)</span></Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={home.about.tabletImageUrl || ''} onChange={e => updateAbout('tabletImageUrl', e.target.value)} placeholder="https://..." className="h-10 rounded-xl flex-1 bg-transparent border-[var(--border)]" />
                        <Button type="button" variant="outline" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => setIsAboutTabletMediaOpen(true)}>Assets</Button>
                        <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => { updateAbout('tabletImageUrl', ''); updateAbout('tabletImageAssetId', ''); }}>Clear</Button>
                      </div>
                    </div>
                    <div>
                      <Label>Mobile Story Image <span className="normal-case font-normal opacity-60">(optional)</span></Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={home.about.mobileImageUrl || ''} onChange={e => updateAbout('mobileImageUrl', e.target.value)} placeholder="https://..." className="h-10 rounded-xl flex-1 bg-transparent border-[var(--border)]" />
                        <Button type="button" variant="outline" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => setIsAboutMobileMediaOpen(true)}>Assets</Button>
                        <Button type="button" variant="ghost" size="sm" className="rounded-xl text-[11px] font-black uppercase tracking-widest shrink-0" onClick={() => { updateAbout('mobileImageUrl', ''); updateAbout('mobileImageAssetId', ''); }}>Clear</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[var(--border)] my-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Story Part 1</Label>
                  <InlineField fieldKey="about.mainText1" value={home.about.mainText1} placeholder="Second paragraph" {...fieldProps} />
                </div>
                <div>
                  <Label>Story Part 2</Label>
                  <InlineField fieldKey="about.mainText2" value={home.about.mainText2} placeholder="Third paragraph" {...fieldProps} />
                </div>
              </div>

              <div>
                <Label>What We Believe (One per line)</Label>
                <textarea
                  value={beliefsInput}
                  onChange={(e) => setBeliefsInput(e.target.value)}
                  placeholder={"Fashion should feel confident...\nTrends should inspire..."}
                  className="w-full min-h-[160px] rounded-xl border border-[var(--border)] bg-[var(--background)]/50 px-3 py-3 text-sm outline-none focus:border-[var(--primary)]/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Our Mission</Label>
                  <InlineField fieldKey="about.mission" value={home.about.mission} placeholder="Mission statement" {...fieldProps} />
                </div>
                <div>
                  <Label>Our Vision</Label>
                  <InlineField fieldKey="about.vision" value={home.about.vision} placeholder="Vision statement" {...fieldProps} />
                </div>
              </div>

              <div className="h-px bg-[var(--border)] my-8" />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Footer Branding Title</Label>
                  <InlineField fieldKey="about.footerTitle" value={home.about.footerTitle} placeholder="Fashcon" {...fieldProps} singleLine />
                </div>
                <div>
                  <Label>Footer Branding Tagline</Label>
                  <InlineField fieldKey="about.footerTagline" value={home.about.footerTagline} placeholder="Iconic Fashion" {...fieldProps} singleLine />
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {tab === 'preview' && (
            <div className="w-full">
              <div className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] p-8 mb-8 text-center">
                <p className="text-sm font-bold opacity-60">Homepage Hero Preview</p>
              </div>
              <HeroPreview
                content={home.hero}
                onAlignmentChange={(align) => updateHero('contentAlignment', align)}
              />
            </div>
          )}

        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateHero('imageUrl', a.url); updateHero('imageAssetId', a.imageId || a.id || ''); setIsMediaOpen(false); toast.success('Desktop image updated'); }} />

      <MediaPickerModal
        isOpen={isTabletMediaOpen}
        onClose={() => setIsTabletMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateHero('tabletImageUrl', a.url); updateHero('tabletImageAssetId', a.imageId || a.id || ''); setIsTabletMediaOpen(false); toast.success('Tablet image updated'); }} />

      <MediaPickerModal
        isOpen={isMobileMediaOpen}
        onClose={() => setIsMobileMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateHero('mobileImageUrl', a.url); updateHero('mobileImageAssetId', a.imageId || a.id || ''); setIsMobileMediaOpen(false); toast.success('Mobile image updated'); }} />
      <MediaPickerModal isOpen={isAboutMediaOpen} onClose={() => setIsAboutMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateAbout('imageUrl', a.url); updateAbout('imageAssetId', a.imageId || a.id || ''); setIsAboutMediaOpen(false); toast.success('Story image updated'); }} />
      <MediaPickerModal
        isOpen={isAboutTabletMediaOpen}
        onClose={() => setIsAboutTabletMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateAbout('tabletImageUrl', a.url); updateAbout('tabletImageAssetId', a.imageId || a.id || ''); setIsAboutTabletMediaOpen(false); toast.success('About tablet image updated'); }} />
      <MediaPickerModal
        isOpen={isAboutMobileMediaOpen}
        onClose={() => setIsAboutMobileMediaOpen(false)}
        onSelect={(assets) => { const a = assets[0]; updateAbout('mobileImageUrl', a.url); updateAbout('mobileImageAssetId', a.imageId || a.id || ''); setIsAboutMobileMediaOpen(false); toast.success('About mobile image updated'); }} />
      {/* Category Creation Dialog */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto scrollbar-hide max-w-lg shadow-2xl backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">New Taxonomy</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-zinc-400 dark:text-white/30 pt-1 uppercase tracking-[0.2em]">Define a new content bucket</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Display Name</Label>
              <Input
                placeholder="e.g. Streetwear Essentials"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="h-14 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-transparent focus:border-[var(--primary)]/30 text-[16px] font-bold px-6 placeholder:opacity-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Parent Category (Optional)</Label>
              <Select value={newCat.parentCategory || ''} onValueChange={(value) => setNewCat({ ...newCat, parentCategory: value || '' })}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 focus:border-[var(--primary)]/30 text-sm font-medium px-4 outline-none">
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/10">
                  <SelectItem value="" className="text-sm font-medium py-2 px-3 focus:bg-zinc-100 dark:focus:bg-white/5 cursor-pointer rounded-lg">None (Top Level)</SelectItem>
                  {categories.filter(c => !c.parentCategory).map(c => (
                    <SelectItem key={c._id} value={c.name} className="text-sm font-medium py-2 px-3 focus:bg-zinc-100 dark:focus:bg-white/5 cursor-pointer rounded-lg">{toTitleCase(c.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Context Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewCat({ ...newCat, type: 'product' })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 transition-all",
                      newCat.type === 'product' ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]" : "border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-white/40 opacity-30"
                    )}
                  >
                    <ShoppingBag size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Products</span>
                  </button>
                  <button
                    onClick={() => setNewCat({ ...newCat, type: 'blog' })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 transition-all",
                      newCat.type === 'blog' ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]" : "border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-white/40 opacity-30"
                    )}
                  >
                    <FileText size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Articles</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Brand Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'].map(c => (
                    <button
                      key={c}
                      onClick={() => setNewCat({ ...newCat, color: c })}
                      className={cn(
                        "w-full aspect-square rounded-lg border-2 transition-all",
                        newCat.color === c ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Visual Icon</Label>
              <div className="grid grid-cols-6 gap-3">
                {['fa-shirt', 'fa-gem', 'fa-shoe-prints', 'fa-bag-shopping', 'fa-glasses', 'fa-spray-can-sparkles'].map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewCat({ ...newCat, icon })}
                    className={cn(
                      "flex items-center justify-center h-12 rounded-xl border-2 transition-all text-lg",
                      newCat.icon === icon ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]" : "border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-white/40 opacity-30 hover:opacity-100"
                    )}
                  >
                    <i className={`fa-solid ${icon}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddCategory}
              disabled={catSubmitting || !newCat.name}
              className="w-full h-14 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[var(--primary)]/30 active:scale-95 transition-all"
            >
              {catSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Finalize Taxonomy Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCategoryConfirmId} onOpenChange={(open) => !open && setDeleteCategoryConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-6 overflow-hidden z-[201] text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="text-lg font-black tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Are you sure you want to delete this category?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryConfirmId(null)}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteCategoryConfirmId) {
                  executeDeleteCategory(deleteCategoryConfirmId);
                  setDeleteCategoryConfirmId(null);
                }
              }}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
