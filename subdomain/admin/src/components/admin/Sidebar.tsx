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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { useSearchParams } from 'next/navigation';

/* ── nav structure (unchanged) ─────────────────────────────── */
const navItems = [
  {
    label: 'Command',
    items: [
      { name: 'Dashboard', faIcon: 'fa-solid fa-gauge-high', color: '#06b6d4', href: '/' },
      { name: 'Analytics', faIcon: 'fa-solid fa-chart-line', color: '#8b5cf6', href: '/analytics' },
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
    items: [{ name: 'Assets', faIcon: 'fa-solid fa-photo-film', color: '#a855f7', href: '/media' }],
  },
  {
    label: 'Inbox',
    items: [{ name: 'Inbox Hub', faIcon: 'fa-solid fa-inbox', color: '#f43f5e', href: '/inbox' }],
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
        href: '/intelligence',
        subItems: [
          { name: 'Product Intel', href: '/intelligence?tab=product' },
          { name: 'SEO Share', href: '/intelligence?tab=seo' },
          { name: 'Social Radar', href: '/intelligence?tab=social' },
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
        href: '/pinterest',
        subItems: [
          { name: 'Create Pin', href: '/pinterest?view=publisher' },
          { name: 'Moderation', href: '/pinterest?view=moderation' },
          { name: 'Scheduled', href: '/pinterest?view=scheduled' },
          { name: 'Published', href: '/pinterest?view=published' },
          { name: 'Analytics', href: '/pinterest?view=analytics' },
        ]
      }
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Operators', faIcon: 'fa-solid fa-user-gear', color: '#2dd4bf', href: '/operators' },
      { name: 'My Profile', faIcon: 'fa-solid fa-address-card', color: '#38bdf8', href: '/profile' },
      { name: 'Configuration', faIcon: 'fa-solid fa-sliders', color: '#94a3b8', href: '/configuration' },
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

  const isItemPermitted = useCallback((name: string) => {
    if (!profile) return false;
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
        case 'Main Site Editor':
        case 'Store':
          return !!perms.store;
        case 'Products':
          return !!perms.products;
        case 'Assets':
          return !!perms.media;
        case 'Inbox Hub':
          return !!perms.inbox;
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
    sideBg: '#080808',
    sideBorder: 'rgba(255,255,255,0.05)',
    headerBg: '#050505',
    labelColor: 'rgba(255,255,255,0.3)',
    itemDefault: 'rgba(255,255,255,0.65)',
    itemHoverBg: 'rgba(255,255,255,0.06)',
    itemHoverTxt: 'rgba(255,255,255,1)',
    activeBg: 'rgba(255,255,255,0.08)',
    activeTxt: '#ffffff',
    activeDot: '#f43f5e',
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
    sideBg: '#fafafa',
    sideBorder: 'rgba(0,0,0,0.07)',
    headerBg: '#fff',
    labelColor: 'rgba(0,0,0,0.4)',
    itemDefault: 'rgba(0,0,0,0.55)',
    itemHoverBg: 'rgba(0,0,0,0.04)',
    itemHoverTxt: 'rgba(0,0,0,0.9)',
    activeBg: 'rgba(0,0,0,0.06)',
    activeTxt: '#000000',
    activeDot: '#e11d48',
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
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 99px; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: ${t.scrollbar} transparent; }
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
          className="fixed inset-0 z-[140] md:hidden"
          style={{ background: t.overlay, backdropFilter: 'blur(2px)' }}
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* ── sidebar shell ── */}
      <aside
        onMouseEnter={showToggle}
        onMouseLeave={hideToggle}
        style={{
          position: 'fixed',
          top: 62, /* below topbar */
          left: 0,
          bottom: 0,
          width: sideW,
          background: t.sideBg,
          borderRight: `1px solid ${t.sideBorder}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 150,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          transform: isOpen || typeof isOpen === 'undefined' ? 'translateX(0)' : undefined,
          overflowX: 'hidden',
        }}
        className={cn(
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >





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
            <div key={section.label} style={{ marginBottom: 8 }}>
              {/* section label */}
              {!isCollapsed && (
                <div className="sidebar-label-anim" style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: t.labelColor,
                  padding: '0 10px',
                  marginBottom: 4,
                  marginTop: si === 0 ? 0 : 8,
                  whiteSpace: 'nowrap',
                }}>
                  {section.label}
                </div>
              )}

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
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
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
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
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
