'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, ShoppingBag,
  Grid2X2, Image as ImageIcon, Link2,
  Settings, Users, LogOut, History,
  House, ChevronLeft, ChevronRight, Globe,
  Send, CheckCircle2, Clock, ExternalLink,
  ChevronDown, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { useSearchParams } from 'next/navigation';

/* ── nav structure ─────────────────────────────── */
const navItems = [
  {
    label: 'Command',
    items: [
      { name: 'Dashboard', faIcon: 'fa-solid fa-gauge-high', color: '#06b6d4', href: '/' },
      { name: 'Analytics', faIcon: 'fa-solid fa-chart-line', color: '#8b5cf6', href: '/analytics' },
      { name: 'Visitor Click IDs', faIcon: 'fa-solid fa-users', color: '#10b981', href: '/visitor-logs' },
      { name: 'Audit Stream', faIcon: 'fa-solid fa-bolt', color: '#f59e0b', href: '/logs' },
      { 
        name: 'Main Site Editor', 
        faIcon: 'fa-solid fa-earth-americas', 
        color: '#10b981', 
        href: '/home',
        subItems: [
          { name: 'Hero Scene', href: '/home?tab=hero' },
          { name: 'Taxonomy', href: '/home?tab=taxonomy' },
          { name: 'Store Intro', href: '/home?tab=store' },
          { name: 'About Story', href: '/home?tab=about' },
        ]
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { name: 'Store', faIcon: 'fa-solid fa-shop', color: '#3b82f6', href: '/store' },
      { 
        name: 'Products', 
        faIcon: 'fa-solid fa-shirt', 
        color: '#f43f5e', 
        href: '/products',
        subItems: [
          { name: 'Vault', href: '/products' },
          { name: 'Inject New', href: '/products/add' },
          { name: 'Profile Pins', href: '/pinterest?view=live-pins' },
          { name: 'Categories', href: '/home?tab=taxonomy' },
        ]
      },
    ],
  },
  {
    label: 'Media',
    items: [{ name: 'Media', faIcon: 'fa-solid fa-photo-film', color: '#a855f7', href: '/media' }],
  },
  {
    label: 'Inbox',
    items: [
      { name: 'Inbox Hub', faIcon: 'fa-solid fa-inbox', color: '#f43f5e', href: '/inbox' },
      { name: 'Reviews', faIcon: 'fa-solid fa-star', color: '#f59e0b', href: '/reviews' }
    ],
  },
  {
    label: 'Editorial',
    items: [
      { name: 'Blog Feed', faIcon: 'fa-solid fa-rss', color: '#f59e0b', href: '/blog-panel' },
      { 
        name: 'Blog Posts', 
        faIcon: 'fa-solid fa-newspaper', 
        color: '#84cc16', 
        href: '/blogs',
        subItems: [
          { name: 'Library', href: '/blogs' },
          { name: 'Compose', href: '/blogs/new' },
          { name: 'Feed Manager', href: '/blog-panel' },
        ]
      }
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Affiliate Hub', faIcon: 'fa-solid fa-link', color: '#0ea5e9', href: '/affiliate' },
      { 
        name: 'Market Intel', 
        faIcon: 'fa-solid fa-brain', 
        color: '#d946ef', 
        href: '/growth/seo-command',
        subItems: [
          { name: 'SEO Command Center', href: '/growth/seo-command' },
          { name: 'Google Analytics', href: '/growth/analytics' },
          { name: 'Search Console', href: '/growth/search-console' },
          { name: 'Keyword Intelligence', href: '/growth/keywords' },
          { name: 'Technical SEO', href: '/growth/technical-seo' },
          { name: 'Performance Lab', href: '/growth/performance' },
          { name: 'Core Web Vitals', href: '/growth/core-web-vitals' },
          { name: 'Index Monitor', href: '/growth/index-monitor' },
          { name: 'Sitemap Manager', href: '/growth/sitemaps' },
          { name: 'Rich Results', href: '/growth/rich-results' },
          { name: 'Content Optimizer', href: '/growth/content-optimizer' },
          { name: 'Audience Insights', href: '/growth/audience' },
          { name: 'Conversion Tracking', href: '/growth/conversions' },
          { name: 'Trend Radar', href: '/growth/trends' },
          { name: 'Competitor Watch', href: '/growth/competitors' },
          { name: 'AI Recommendations', href: '/growth/ai-recommendations' },
        ]
      },
    ],
  },
  {
    label: 'Pinterest',
    items: [
      { 
        name: 'Pinterest Engine', 
        faIcon: 'fa-brands fa-pinterest', 
        color: '#e11d48', 
        href: '/pinterest/studio',
        subItems: [
          { name: 'Studio', href: '/pinterest/studio' },
          { name: 'Pipeline', href: '/pinterest/pipeline' },
          { name: 'Scheduler', href: '/pinterest/scheduler' },
          { name: 'Analytics', href: '/pinterest/analytics' },
          { name: 'Trends', href: '/pinterest/trends' },
          { name: 'AI Lab', href: '/pinterest/ai-lab' },
        ]
      }
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Operators', faIcon: 'fa-solid fa-user-gear', color: '#2dd4bf', href: '/operators' },
      { name: 'My Profile', faIcon: 'fa-solid fa-address-card', color: '#38bdf8', href: '/profile' },
      { 
        name: 'Configuration', 
        faIcon: 'fa-solid fa-sliders', 
        color: '#94a3b8', 
        href: '/configuration',
        subItems: [
          { name: 'API Connections', href: '/configuration/api' },
          { name: 'OAuth Manager', href: '/configuration/oauth' },
          { name: 'Environment Variables', href: '/configuration/env' },
          { name: 'Cron Jobs', href: '/configuration/cron' },
          { name: 'AI Providers', href: '/configuration/ai' },
          { name: 'Cloudinary', href: '/configuration/cloudinary' },
          { name: 'Pinterest API', href: '/configuration/pinterest' },
          { name: 'Google APIs', href: '/configuration/google' },
          { name: 'Security', href: '/configuration/security' },
        ]
      },
    ],
  },
];

function BlogsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (v: boolean) => void;
}

const W_FULL = 200;
const W_COLLAPSED = 64;

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout, profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hoverRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isItemPermitted = useCallback((name: string) => {
    if (!profile) return false;
    
    // STRICT: Operators only for Super Admin
    if (name === 'Operators') return profile.role === 'super_admin';
    
    if (profile.role === 'super_admin' || profile.role === 'admin') return true;
    if (['manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile.role)) {
      const perms = profile.permissions || {
        dashboard: true,
        analytics: false,
        store: false,
        products: false,
        media: false,
        inbox: false,
        blogs: false,
        marketing: false,
        pinterest: false,
        settings: false
      };
      switch (name) {
        case 'Dashboard':
          return !!perms.dashboard;
        case 'Analytics':
          return !!perms.analytics;
        case 'Visitor Click IDs':
          return !!perms.dashboard || !!perms.analytics;
        case 'Main Site Editor':
        case 'Store':
          return !!perms.store;
        case 'Products':
          return !!perms.products;
        case 'Assets':
          return !!perms.media;
        case 'Inbox Hub':
          return !!perms.inbox;
        case 'Reviews':
          return !!perms.products || !!perms.inbox;
        case 'Blog Feed':
        case 'Blog Posts':
          return !!perms.blogs;
        case 'Affiliate Hub':
        case 'Market Intel':
          return !!perms.marketing;
        case 'Pinterest Engine':
          return !!perms.pinterest;
        case 'Configuration':
          return !!perms.settings;
        case 'Audit Stream':
        case 'Operators':
        default:
          return false;
      }
    }
    return false;
  }, [profile]);

  const permittedNavItems = useMemo(() => {
    return navItems.map(section => {
      const filteredItems = section.items.filter(item => isItemPermitted(item.name));
      return {
        ...section,
        items: filteredItems
      };
    }).filter(section => section.items.length > 0);
  }, [isItemPermitted]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleLogout = async () => {
    try { await logout(); window.location.href = '/login'; }
    catch (e) { console.error(e); }
  };

  /* hover-reveal collapse toggle: only on md+ */
  const showToggle = () => {
    if (hoverRef.current) clearTimeout(hoverRef.current);
  };
  const hideToggle = () => {
    hoverRef.current = setTimeout(() => { }, 200);
  };

  /* ── theme tokens ── */
  const t = isDark ? {
    sideBg: 'rgba(20, 20, 20, 0.4)',
    sideBorder: 'rgba(255,255,255,0.05)',
    headerBg: '#050505',
    labelColor: 'rgba(255,255,255,0.3)',
    itemDefault: 'rgba(255,255,255,0.65)',
    itemHoverBg: 'rgba(255,255,255,0.06)',
    itemHoverTxt: 'rgba(255,255,255,1)',
    activeBg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    activeTxt: 'var(--primary)',
    activeDot: 'var(--primary)',
    toggleBg: 'rgba(255,255,255,0.05)',
    toggleBorder: 'rgba(255,255,255,0.08)',
    toggleColor: 'rgba(255,255,255,0.6)',
    logoutBg: 'rgba(244,63,94,0.08)',
    logoutBorder: 'rgba(244,63,94,0.18)',
    logoutColor: '#f43f5e',
    scrollbar: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0,0,0,0.7)',
    brandSub: 'rgba(255,255,255,0.3)',
    brandMain: '#fff',
  } : {
    sideBg: 'rgba(255, 255, 255, 0.15)',
    sideBorder: 'rgba(0,0,0,0.08)',
    headerBg: '#fff',
    labelColor: 'rgba(0,0,0,0.4)',
    itemDefault: 'rgba(0,0,0,0.55)',
    itemHoverBg: 'rgba(0,0,0,0.04)',
    itemHoverTxt: 'rgba(0,0,0,0.9)',
    activeBg: 'color-mix(in srgb, var(--primary) 8%, transparent)',
    activeTxt: 'var(--primary)',
    activeDot: 'var(--primary)',
    toggleBg: 'rgba(0,0,0,0.04)',
    toggleBorder: 'rgba(0,0,0,0.09)',
    toggleColor: 'rgba(0,0,0,0.6)',
    logoutBg: 'rgba(244,63,94,0.07)',
    logoutBorder: 'rgba(244,63,94,0.16)',
    logoutColor: '#e11d48',
    scrollbar: 'rgba(0,0,0,0.06)',
    overlay: 'rgba(0,0,0,0.45)',
    brandSub: 'rgba(0,0,0,0.4)',
    brandMain: '#0a0a0a',
  };

  const sideW = isCollapsed ? W_COLLAPSED : W_FULL;

  return (
    <>
      {/* ── global scrollbar hide + sidebar custom scrollbar ── */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { display: none; }
        .sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .sidebar-nav-item { transition: background 0.15s, color 0.15s, transform 0.2s; }
        .sidebar-nav-item:hover { transform: translateX(2px); }
        .sidebar-toggle { transition: opacity 0.2s, transform 0.2s; }
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sidebar-label-anim { animation: sidebarFadeIn 0.22s ease forwards; }
      `}</style>

      {/* ── mobile overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] md:hidden"
          style={{ background: t.overlay, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* ── sidebar shell ── */}
      <aside
        onMouseEnter={showToggle}
        onMouseLeave={hideToggle}
        style={{
          position: 'fixed',
          top: isMobile ? 0 : 64,
          left: 0,
          bottom: 0,
          width: isMobile ? 260 : sideW,
          background: isMobile 
            ? (isDark ? 'rgba(10, 10, 10, 0.75)' : 'rgba(255, 255, 255, 0.75)')
            : t.sideBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${t.sideBorder}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          boxShadow: isMobile ? '10px 0 40px rgba(0, 0, 0, 0.4)' : 'none',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          overflowX: 'hidden',
        }}
        className={cn(
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Mobile-only close button */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${t.sideBorder}`,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src="/Admin favicon_io/android-chrome-192x192.png"
                alt="Fashcon Logo"
                className="h-8 w-8 object-contain"
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: t.brandMain,
                  fontFamily: 'Geist, sans-serif'
                }}
              >
                Fashcon
              </span>
            </div>
            <button
              onClick={() => setIsOpen?.(false)}
              style={{
                background: 'none',
                border: 'none',
                color: t.itemDefault,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hover:scale-110 active:scale-95 transition-transform"
            >
              <X size={18} />
            </button>
          </div>
        )}





        {/* ── navigation ── */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isCollapsed ? '20px 10px' : '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {permittedNavItems.map((section, si) => (
            <div key={section.label} style={{ marginBottom: 4 }}>
              {/* Optional top margin for separation between groups */}
              {si > 0 && <div style={{ height: 6 }} />}

              {isCollapsed && si > 0 && (
                <div style={{ height: 1, background: t.sideBorder, margin: '8px 8px 12px' }} />
              )}

              {/* nav items */}
              {section.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.includes(item.name);
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : item.href === '/configuration'
                    ? pathname === '/configuration'
                    : pathname.startsWith(item.href);

                return (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      className="sidebar-nav-item group"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        borderRadius: 12,
                        background: isActive ? t.activeBg : 'transparent',
                        color: isActive ? t.activeTxt : t.itemDefault,
                        marginBottom: 1,
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = t.itemHoverBg;
                          e.currentTarget.style.color = t.itemHoverTxt;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = t.itemDefault;
                        }
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen?.(false)}
                        title={isCollapsed ? item.name : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isCollapsed ? 0 : 10,
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: isCollapsed ? '10px 0' : '9px 12px',
                          textDecoration: 'none',
                          color: 'inherit',
                          flex: 1,
                        }}
                      >
                        {/* active accent bar */}
                        {isActive && (
                          <span style={{
                            position: 'absolute',
                            left: 0, top: '20%', bottom: '20%',
                            width: 3,
                            borderRadius: '0 3px 3px 0',
                            background: t.activeDot,
                          }} />
                        )}

                        {/* icon */}
                        <div style={{
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <i
                            className={item.faIcon}
                            style={{
                              fontSize: 14,
                              color: item.color,
                              filter: 'brightness(1.1) saturate(1.2)',
                              transition: 'transform 0.2s, color 0.2s',
                            }}
                          />
                        </div>

                        {/* label */}
                        {!isCollapsed && (
                          <span className="sidebar-label-anim" style={{
                            fontSize: 12,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}>
                            {item.name}
                          </span>
                        )}

                        {/* collapsed tooltip label */}
                        {isCollapsed && (
                          <span style={{
                            position: 'absolute',
                            left: '100%',
                            marginLeft: 10,
                            background: isDark ? '#1a1a1a' : '#fff',
                            border: `1px solid ${t.toggleBorder}`,
                            color: t.itemHoverTxt,
                            fontSize: 12,
                            fontWeight: 500,
                            padding: '5px 10px',
                            borderRadius: 8,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            pointerEvents: 'none',
                            opacity: 0,
                            zIndex: 200,
                            transition: 'opacity 0.15s',
                          }}
                            className="sidebar-tooltip"
                          >
                            {item.name}
                          </span>
                        )}
                      </Link>

                      {/* Dropdown Toggle Arrow */}
                      {!isCollapsed && hasSubItems && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpand(item.name);
                          }}
                          className="h-full px-3 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l border-white/5"
                          style={{ color: 'inherit' }}
                        >
                          <ChevronDown 
                            size={14} 
                            className={cn(
                              "transition-transform duration-200 opacity-40",
                              isExpanded && "rotate-180 opacity-100"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub Items */}
                    {!isCollapsed && hasSubItems && isExpanded && (
                      <div className="flex flex-col gap-0.5 ml-4 mt-1 border-l border-[var(--border)] pl-3 mb-2 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems?.map((sub) => {
                          const subSearch = sub.href.split('?')[1] || '';
                          const isSubActive = pathname === sub.href.split('?')[0] && 
                            (!subSearch || searchParams.toString().includes(subSearch));
                          
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsOpen?.(false)}
                              className="group/sub flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg transition-all"
                              style={{
                                color: isSubActive ? t.activeTxt : t.itemDefault,
                                background: isSubActive ? t.activeBg : 'transparent',
                              }}
                              onMouseEnter={e => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = t.itemHoverBg;
                                  e.currentTarget.style.color = t.itemHoverTxt;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = t.itemDefault;
                                }
                              }}
                            >
                              {isSubActive && (
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)] shrink-0" />
                              )}
                              <span className={cn(
                                "transition-transform group-hover/sub:translate-x-0.5",
                                !isSubActive && "ml-0"
                              )}>
                                {sub.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>


      </aside>

      {/* ── hover-to-reveal toggle button CSS trick ── */}
      <style>{`
        /* show the collapse toggle only while hovering the aside */
        aside:hover .sidebar-toggle {
          opacity: 1 !important;
        }
        /* tooltip on collapsed icon hover */
        .sidebar-nav-item:hover .sidebar-tooltip {
          opacity: 1 !important;
        }
        /* mobile: nice momentum scroll */
        @media (max-width: 767px) {
          .sidebar-scroll {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
}
