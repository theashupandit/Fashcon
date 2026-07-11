'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Menu, ChevronRight, TrendingUp,
  Image as ImageIcon, FileText,
  House, ShoppingBag, Bell, Zap, X, Palette,
  Settings, LogOut, User, ExternalLink,
  ShieldCheck, ShieldOff, AlertTriangle,
  Lock, Eye, EyeOff, KeyRound, Loader2, Clock,
  Timer, TimerOff, Globe, ChevronUp, ChevronDown,
  MousePointer2, Mail, RefreshCw, AlertCircle, CheckSquare
} from 'lucide-react';
import { getDashboardNotifications } from '@/app/actions/notifications';
import { toast } from 'sonner';
import { useScrollStore } from '@/lib/store';
import { ToggleTheme } from '@/components/ToggleTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from './BackButton';

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  bgStyle: 'particles' | 'grid' | 'aurora' | 'solid';
  setBgStyle: (v: 'particles' | 'grid' | 'aurora' | 'solid') => void;
  animationMode: 'network' | 'drift' | 'pulse';
  setAnimationMode: (v: 'network' | 'drift' | 'pulse') => void;
  particleConfig: any;
  setParticleConfig: (v: any) => void;
}

const suggestions = [
  { title: 'Homepage Editor', icon: House, href: '/home', category: 'Content' },
  { title: 'Store Manager', icon: ShoppingBag, href: '/store', category: 'Catalog' },
  { title: 'Add New Product', icon: Plus, href: '/products/add', category: 'Action' },
  { title: 'Trending Analytics', icon: TrendingUp, href: '/analytics', category: 'Report' },
  { title: 'Recent Media', icon: ImageIcon, href: '/media', category: 'Assets' },
  { title: 'New Blog Post', icon: FileText, href: '/blogs/new', category: 'Editorial' },
];

const quickActions = [
  { label: 'New Product', href: '/products/add', icon: Plus },
  { label: 'New Post', href: '/blogs/new', icon: FileText },
  { label: 'Upload Media', href: '/media', icon: ImageIcon },
];

const particlePresets = [
  { name: 'Indigo', particle: "160,140,255", line: "120,100,240", color: '#8b5cf6' },
  { name: 'Crimson', particle: "255,45,100", line: "220,30,80", color: '#ff2d64' },
  { name: 'Emerald', particle: "16,185,129", line: "5,150,105", color: '#10b981' },
  { name: 'Amber', particle: "245,158,11", line: "217,119,6", color: '#f59e0b' },
  { name: 'Sky', particle: "14,165,233", line: "2,132,199", color: '#0ea5e9' },
  { name: 'Rose', particle: "225,29,72", line: "190,18,60", color: '#e11d48' },
  { name: 'Lime', particle: "132,204,22", line: "101,163,13", color: '#84cc16' },
  { name: 'Cyan', particle: "6,182,212", line: "8,145,178", color: '#06b6d4' },
  { name: 'Fuchsia', particle: "217,70,239", line: "192,38,211", color: '#d946ef' },
  { name: 'Slate', particle: "100,116,139", line: "71,85,105", color: '#64748b' },
  { name: 'Orange', particle: "249,115,22", line: "234,88,12", color: '#f97316' },
  { name: 'Teal', particle: "20,184,166", line: "13,148,136", color: '#14b8a6' },
];

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : null;
}

function rgbToHex(rgb: string): string {
  const parts = rgb.split(',').map(x => parseInt(x.trim(), 10));
  if (parts.length < 3 || parts.some(isNaN)) return '#8b5cf6';
  return '#' + parts.map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default function Topbar({
  onMenuClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  bgStyle,
  setBgStyle,
  animationMode,
  setAnimationMode,
  particleConfig,
  setParticleConfig
}: TopbarProps) {
  const router = useRouter();
  const { user, profile, logout, loginRequired, toggleLoginGate, sessionTimeRemaining, extendSession, setSessionExpiryTime, isTimerEnabled, setIsTimerEnabled } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSmoothScrollEnabled, toggleSmoothScroll } = useScrollStore();
  const isDark = theme === 'dark';

  const [showSitemapControl, setShowSitemapControl] = useState(false);
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [clockHour, setClockHour] = useState(12);
  const [clockMinute, setClockMinute] = useState(0);
  const [clockAmPm, setClockAmPm] = useState<'AM' | 'PM'>('PM');
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');
  const clockRef = useRef<HTMLDivElement>(null);
  const [liveCurrentTime, setLiveCurrentTime] = useState<string>('');

  // Sync clock picker state to actual current session expiry time when opened
  useEffect(() => {
    if (isClockPickerOpen) {
      const expiryTimestamp = Date.now() + sessionTimeRemaining * 1000;
      const target = new Date(expiryTimestamp);
      let h = target.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      let displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setClockHour(displayHour);
      setClockMinute(target.getMinutes());
      setClockAmPm(ampm);
    }
  }, [isClockPickerOpen]);

  // Keep a ticking live clock for the user's reference while the picker is open
  useEffect(() => {
    if (!isClockPickerOpen) return;

    const updateTime = () => {
      const d = new Date();
      let h = d.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const m = d.getMinutes().toString().padStart(2, '0');
      const s = d.getSeconds().toString().padStart(2, '0');
      setLiveCurrentTime(`${h}:${m}:${s} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isClockPickerOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clockRef.current && !clockRef.current.contains(event.target as Node)) {
        setIsClockPickerOpen(false);
      }
    }
    if (isClockPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClockPickerOpen]);

  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 70; // relative to center (70, 70) for 140x140 clock
    const y = e.clientY - rect.top - 70;

    let angleRad = Math.atan2(y, x);
    let angleDeg = (angleRad * 180) / Math.PI;
    let angle360 = (angleDeg + 90 + 360) % 360;

    if (pickerMode === 'hour') {
      let hr = Math.round(angle360 / 30);
      if (hr === 0) hr = 12;
      setClockHour(hr);
      setPickerMode('minute');
    } else {
      let min = Math.round(angle360 / 6);
      if (min === 60) min = 0;
      setClockMinute(min);
    }
  };

  const getTargetDate = () => {
    const now = new Date();
    let targetHours = clockHour;
    if (clockAmPm === 'PM' && targetHours < 12) targetHours += 12;
    if (clockAmPm === 'AM' && targetHours === 12) targetHours = 0;

    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, clockMinute, 0, 0);
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate;
  };

  const canManageSettings =
    profile?.role === 'super_admin' ||
    profile?.role === 'admin' ||
    (['manager', 'blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(profile?.role || '') && !!profile?.permissions?.settings);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
 
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'alerts' | 'messages' | 'activity'>('all');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [renderNotifList, setRenderNotifList] = useState(false);

  useEffect(() => {
    if (isNotifOpen) {
      const handle = requestAnimationFrame(() => {
        setRenderNotifList(true);
      });
      return () => cancelAnimationFrame(handle);
    } else {
      setRenderNotifList(false);
    }
  }, [isNotifOpen]);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await getDashboardNotifications();
      console.log('[Topbar] Fetched notifications:', data.map((n: any) => n.id));
      setNotifications(data);
    } catch (err) {
      console.error('[Topbar] Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync read status whenever the user changes or logs in
  useEffect(() => {
    if (user?.email) {
      const userKey = `fashcon_read_notifications_${user.email}`;
      let storedRead = localStorage.getItem(userKey);
      
      // Fallback to legacy global key for backward compatibility
      if (!storedRead) {
        storedRead = localStorage.getItem('fashcon_read_notifications');
        if (storedRead) {
          localStorage.setItem(userKey, storedRead);
        }
      }

      console.log('[Topbar] Loaded storedRead for user:', user.email, storedRead);
      if (storedRead) {
        try {
          const parsed = JSON.parse(storedRead);
          console.log('[Topbar] Parsed readIds:', parsed);
          setReadIds(parsed);
        } catch (err) {
          console.error('[Topbar] Failed to parse read notifications:', err);
        }
      } else {
        setReadIds([]);
      }
    } else {
      setReadIds([]);
    }
  }, [user?.email]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const formatNotifTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const diffMs = new Date().getTime() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadIds(prev => {
      if (!prev.includes(id)) {
        const updated = [...prev, id];
        console.log('[Topbar] markAsRead - saving to localStorage:', updated);
        if (user?.email) {
          localStorage.setItem(`fashcon_read_notifications_${user.email}`, JSON.stringify(updated));
        }
        localStorage.setItem('fashcon_read_notifications', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    console.log('[Topbar] markAllAsRead - saving to localStorage:', allIds);
    setReadIds(allIds);
    if (user?.email) {
      localStorage.setItem(`fashcon_read_notifications_${user.email}`, JSON.stringify(allIds));
    }
    localStorage.setItem('fashcon_read_notifications', JSON.stringify(allIds));
    toast.success('All notifications marked as read');
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'all') return true;
      if (notifFilter === 'alerts') return n.type === 'error' || n.type === 'warning';
      if (notifFilter === 'messages') return n.category === 'Inbox' || n.category === 'Newsletter';
      if (notifFilter === 'activity') return n.category === 'Activity' || n.category === 'Pinterest' || n.category === 'Inventory';
      return true;
    });
  }, [notifications, notifFilter]);

  // Login Gate Modal State
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [showGatePassword, setShowGatePassword] = useState(false);
  const gateInputRef = useRef<HTMLInputElement>(null);

  // Sitemap States & Generator
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);

  useEffect(() => {
    fetch('/api/sitemap')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSitemapData(data);
      })
      .catch((err) => console.warn('Sitemap dry-run fetch skipped (dev server compiling):', err?.message || err));
  }, []);

  const handleGenerateSitemap = async () => {
    try {
      setIsGeneratingSitemap(true);
      const res = await fetch('/api/sitemap', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSitemapData(data);
        setNotifications((prev) => [
          {
            id: Math.random().toString(),
            title: 'Sitemap Regenerated',
            desc: `Generated ${data.counts.total} URLs for search indexing.`,
            timestamp: new Date(),
            type: 'success',
            category: 'Activity'
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Error generating sitemap:', err);
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      const res = await fetch('/api/sitemap?fullXml=true');
      if (!res.ok) throw new Error('Failed to fetch sitemap XML');
      const xmlText = await res.text();
      
      const blob = new Blob([xmlText], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setNotifications((prev) => [
        {
          id: Math.random().toString(),
          title: 'Sitemap Downloaded',
          desc: 'sitemap.xml was saved successfully to your downloads.',
          timestamp: new Date(),
          type: 'success',
          category: 'Activity'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error downloading sitemap:', err);
    }
  };

  const handleDownloadCSVLinks = (scope: 'storefront' | 'admin') => {
    try {
      window.location.assign(`/api/sitemap?allUrls=true&scope=${scope}`);

      const titleScope = scope === 'admin' ? 'Admin' : 'Storefront';

      setNotifications((prev) => [
        {
          id: Math.random().toString(),
          title: `CSV ${titleScope} Links Downloaded`,
          desc: `Exporting all ${scope} URLs... check your download folder.`,
          timestamp: new Date(),
          type: 'success',
          category: 'Activity'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(`Error downloading CSV ${scope} links:`, err);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
    setReadIds([]);
    if (user?.email) {
      localStorage.removeItem(`fashcon_read_notifications_${user.email}`);
    }
    localStorage.removeItem('fashcon_read_notifications');
  };

  /* scroll depth → strengthen glass */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSelectedIdx(-1);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filtered = searchQuery.length
    ? suggestions.filter(s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : suggestions;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(p => Math.min(p + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(p => Math.max(p - 1, -1)); }
    if (e.key === 'Enter' && selectedIdx >= 0) {
      router.push(filtered[selectedIdx].href);
      setIsFocused(false);
      setSearchQuery('');
    }
    if (e.key === 'Escape') setIsFocused(false);
  };

  const initials = profile?.displayName?.[0].toUpperCase() ?? user?.email?.[0].toUpperCase() ?? 'A';
  const username = profile?.displayName ?? user?.email?.split('@')[0] ?? 'Admin';
  const avatarUrl = profile?.photoURL;

  /* ── per-theme token objects so EVERY colour is explicit ── */
  const t = isDark ? {
    /* bar */
    barBg: scrolled ? 'rgba(10, 10, 10, 0.65)' : 'rgba(10, 10, 10, 0.4)',
    barBorder: 'rgba(255,255,255,0.05)',
    barShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
    /* text */
    textPrimary: '#ffffff',
    textMuted: '#777',
    /* icon buttons */
    btnBg: 'rgba(255,255,255,0.06)',
    btnBorder: 'rgba(255,255,255,0.09)',
    btnHover: 'rgba(255,255,255,0.11)',
    btnColor: '#ccc',
    /* search */
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.09)',
    inputFocusBg: 'rgba(255,255,255,0.1)',
    inputText: '#f2f2f2',
    inputPh: '#555',
    /* create btn */
    createBg: '#fff',
    createText: '#000',
    createShadow: '0 2px 14px rgba(255,255,255,0.08)',
    /* dropdown */
    dropBg: 'rgba(18,18,18,0.75)',
    dropBorder: 'rgba(255,255,255,0.08)',
    dropShadow: '0 12px 48px rgba(0,0,0,0.6)',
    dropItemText: '#e0e0e0',
    dropItemHover: 'rgba(255,255,255,0.06)',
    dropDivider: 'rgba(255,255,255,0.07)',
    /* avatar pill */
    avatarPillBg: 'rgba(255,255,255,0.06)',
    avatarPillBorder: 'rgba(255,255,255,0.09)',
    /* notification ring */
    notifRing: '#0a0a0a',
  } : {
    /* bar */
    barBg: scrolled ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)',
    barBorder: 'rgba(0,0,0,0.05)',
    barShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.05)' : 'none',
    /* text */
    textPrimary: '#111',
    textMuted: '#999',
    /* icon buttons */
    btnBg: 'rgba(0,0,0,0.04)',
    btnBorder: 'rgba(0,0,0,0.07)',
    btnHover: 'rgba(0,0,0,0.08)',
    btnColor: '#555',
    /* search */
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.08)',
    inputFocusBg: '#fff',
    inputText: '#111',
    inputPh: '#aaa',
    /* create btn */
    createBg: '#111',
    createText: '#fff',
    createShadow: '0 2px 14px rgba(0,0,0,0.16)',
    /* dropdown */
    dropBg: 'rgba(255,255,255,0.75)',
    dropBorder: 'rgba(0,0,0,0.07)',
    dropShadow: '0 12px 48px rgba(0,0,0,0.10)',
    dropItemText: '#222',
    dropItemHover: 'rgba(0,0,0,0.04)',
    dropDivider: 'rgba(0,0,0,0.07)',
    /* avatar pill */
    avatarPillBg: 'rgba(0,0,0,0.04)',
    avatarPillBorder: 'rgba(0,0,0,0.07)',
    /* notification ring */
    notifRing: '#fff',
  };

  /* ── shared inline style helpers ── */
  const iconBtnStyle: React.CSSProperties = {
    width: 40, height: 40,
    borderRadius: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: t.btnColor,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  };

  const dropContentStyle: React.CSSProperties = {
    background: t.dropBg,
    border: `1px solid ${t.dropBorder}`,
    boxShadow: t.dropShadow,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 18,
    padding: '6px',
    marginTop: 8,
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════ TOPBAR */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? 0 : (isSidebarCollapsed ? 64 : 200),
          right: 0,
          zIndex: 60,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 12px' : '0 24px',
          background: t.barBg,
          borderBottom: `1px solid ${t.barBorder}`,
          boxShadow: t.barShadow,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1), background 0.35s, box-shadow 0.35s',
        }}
      >
        {/* noise grain – decorative */}
        <div
          aria-hidden
          style={{
            pointerEvents: 'none',
            position: 'absolute', inset: 0,
            opacity: isDark ? 0.03 : 0.015,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: isMobile ? 8 : 16, position: 'relative' }}>

          {/* ── LEFT ─────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flexShrink: 0 }}>
            <BackButton
              style={{
                background: 'none',
                border: 'none',
                color: t.btnColor,
                width: 40, height: 40,
              }}
            />
            {/* mobile hamburger */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  onMenuClick();
                } else {
                  setIsSidebarCollapsed?.(!isSidebarCollapsed);
                }
              }}
              style={iconBtnStyle}
              className="hover:bg-white/5"
            >
              <Menu style={{ width: 18, height: 18 }} />
            </button>

            {/* brand - mobile only */}
            {isMobile && (
              <a 
                href="https://www.fashcon.store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                style={{ textDecoration: 'none', userSelect: 'none' }}
                title="Open Main Site"
              >
                <img src="/Admin favicon_io/android-chrome-192x192.png" alt="Fashcon Logo" className="h-10 w-10 object-contain drop-shadow-lg" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', textTransform: 'uppercase', color: t.textPrimary }}>
                    Fashcon
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#f43f5e',
                    background: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)',
                    padding: '3px 8px', borderRadius: 99,
                  }}>
                    {(() => {
                      const r = profile?.role || 'super_admin';
                      if (r === 'super_admin') return 'SUPR';
                      if (r === 'admin') return 'ADM';
                      if (r === 'manager') return 'MGR';
                      if (r === 'blog_writer') return 'EDIT';
                      if (r === 'support_agent') return 'SUPP';
                      if (r === 'store_manager') return 'STR';
                      if (r === 'marketing_specialist') return 'MKT';
                      return 'USER';
                    })()}
                  </span>
                </div>
              </a>
            )}
          </div>

          {/* ── CENTRE: Spacer ───────────────────────── */}
          <div style={{ flex: 1 }} />

          {/* ── RIGHT ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6, flexShrink: 0 }}>

            {/* Search Button */}
            <button 
              onClick={() => setIsFocused(true)}
              style={iconBtnStyle}
              className="hover:bg-white/5"
              title="Search anything..."
            >
              <Search style={{ width: 18, height: 18 }} />
            </button>

            {/* Search Modal Overlay */}
            {mounted && createPortal(
              <AnimatePresence>
                {isFocused && (
                  <div
                    className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setIsFocused(false)}
                  >
                    <motion.div
                      ref={searchRef}
                      initial={{ opacity: 0, scale: 0.95, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        maxWidth: 650,
                        background: isDark ? 'rgba(18, 18, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: `1px solid ${t.dropBorder}`,
                        borderRadius: 28,
                        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.7)',
                        padding: 16,
                        backdropFilter: 'blur(30px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Search style={{
                          position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                          width: 22, height: 22,
                          color: '#f43f5e',
                        }} />
                        <input
                          autoFocus
                          className="topbar-search"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Search for anything..."
                          style={{
                            width: '100%',
                            height: 64,
                            paddingLeft: 56,
                            paddingRight: 56,
                            borderRadius: 18,
                            fontSize: 18,
                            fontWeight: 600,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: 'none',
                            outline: 'none',
                            color: t.textPrimary,
                          }}
                        />
                        <button
                          onClick={() => setIsFocused(false)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {filtered.length > 0 && (
                        <div 
                          className="mt-6 overflow-y-auto pr-2 custom-scrollbar"
                          style={{
                            maxHeight: '60vh',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#f43f5e transparent',
                          }}
                        >
                          <div className="px-2 mb-4 flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Search Results</span>
                            <span className="text-[9px] font-bold text-zinc-600 italic">ESC to close</span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 pb-4">
                            {filtered.map((item, idx) => {
                              const active = selectedIdx === idx;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => { router.push(item.href); setIsFocused(false); setSearchQuery(''); }}
                                  onMouseEnter={() => setSelectedIdx(idx)}
                                  className="group"
                                  style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 18px', borderRadius: 18, border: 'none', cursor: 'pointer',
                                    background: active ? '#f43f5e' : 'transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                      width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: active ? 'rgba(255,255,255,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                      transition: 'transform 0.2s',
                                    }} className="group-hover:scale-110">
                                      <item.icon style={{ width: 18, height: 18, color: active ? '#fff' : t.btnColor }} />
                                    </div>
                                    <div>
                                      <p style={{ fontSize: 15, fontWeight: 800, color: active ? '#fff' : t.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>{item.title}</p>
                                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: active ? 'rgba(255,255,255,0.6)' : t.textMuted, margin: 2 }}>{item.category}</p>
                                    </div>
                                  </div>
                                  <ChevronRight style={{ width: 18, height: 18, color: active ? '#fff' : t.textMuted, opacity: active ? 1 : 0.3 }} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}

            {/* Session Timer Countdown Pill */}
            {/* Session Timer Countdown Pill */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12,
                  padding: isMobile ? '4px 10px' : '4px 16px',
                  height: 38,
                  borderRadius: 999,
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  boxShadow: `inset 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={cn(
                  "flex items-center",
                  (isTimerEnabled && sessionTimeRemaining < 180) && "animate-pulse"
                )}
              >
                <Clock 
                  size={15} 
                  className={cn(
                    isTimerEnabled ? (
                      sessionTimeRemaining < 60 
                        ? 'text-red-500 animate-bounce' 
                        : sessionTimeRemaining < 180 
                        ? 'text-amber-500' 
                        : isDark ? 'text-white/60' : 'text-black/60'
                    ) : (isDark ? 'text-white/20' : 'text-black/20')
                  )} 
                />
                <span 
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: 13, 
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: !isTimerEnabled 
                      ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                      : sessionTimeRemaining < 60 
                      ? '#ef4444' 
                      : sessionTimeRemaining < 180 
                      ? '#f59e0b' 
                      : t.textPrimary
                  }}
                >
                  {(() => {
                    if (!isTimerEnabled) return '--:--';
                    const mins = Math.floor(sessionTimeRemaining / 60);
                    const secs = sessionTimeRemaining % 60;
                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  })()}
                </span>
                
                {/* Adjust buttons only on desktop */}
                {!isMobile && (
                  <>
                    {/* Visual divider */}
                    <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                    
                    {/* Reduce button */}
                    <button
                      onClick={() => extendSession(-60)} // -1 minute
                      disabled={!isTimerEnabled}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 6px',
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: isTimerEnabled ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        color: !isTimerEnabled 
                          ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                          : sessionTimeRemaining < 60 
                          ? '#ef4444' 
                          : sessionTimeRemaining < 180 
                          ? '#f59e0b' 
                          : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        transition: 'all 0.2s',
                      }}
                      className="hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                      title={isTimerEnabled ? "Reduce session by 1 minute" : "Timer disabled"}
                    >
                      -1m
                    </button>

                    {/* Visual divider */}
                    <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

                    {/* Extend button */}
                    <button
                      onClick={() => extendSession(600)} // +10 minutes
                      disabled={!isTimerEnabled}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 6px',
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: isTimerEnabled ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        color: !isTimerEnabled 
                          ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                          : sessionTimeRemaining < 60 
                          ? '#ef4444' 
                          : sessionTimeRemaining < 180 
                          ? '#f59e0b' 
                          : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        transition: 'all 0.2s',
                      }}
                      className="hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                      title={isTimerEnabled ? "Extend session by 10 minutes" : "Timer disabled"}
                    >
                      +10m
                    </button>
                  </>
                )}

                {/* Visual divider */}
                <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

                {/* Clock Picker Trigger */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={clockRef}>
                  <button
                    onClick={() => setIsClockPickerOpen(!isClockPickerOpen)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: isClockPickerOpen
                        ? '#3b82f6'
                        : !isTimerEnabled
                        ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
                        : sessionTimeRemaining < 60
                        ? '#ef4444'
                        : sessionTimeRemaining < 180
                        ? '#f59e0b'
                        : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    }}
                    className="hover:scale-110 transition-transform"
                    title={isTimerEnabled ? "Set absolute logout clock time" : "Session timer is disabled"}
                  >
                    {isTimerEnabled ? <Timer size={15} /> : <TimerOff size={15} />}
                  </button>

                  {/* POP-OVER CLOCK DIAL WINDOW */}
                  <AnimatePresence>
                    {isClockPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: isMobile ? -140 : -80 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: isMobile ? -140 : -80 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: isMobile ? -140 : -80 }}
                        style={{
                          position: 'absolute', top: '100%', left: 0, marginTop: 15,
                          width: 240, background: t.dropBg, border: `1px solid ${t.dropBorder}`,
                          borderRadius: 20, boxShadow: t.dropShadow, padding: 18, zIndex: 100,
                          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                        }}
                      >
                        {/* Header with On/Off Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textPrimary }}>
                              Session Watch
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 500, color: t.textMuted }}>
                              {isTimerEnabled ? 'Active Security' : 'Manual Control'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: isTimerEnabled ? '#10b981' : t.textMuted }}>
                              {isTimerEnabled ? 'On' : 'Off'}
                            </span>
                            <Switch
                              checked={isTimerEnabled}
                              onCheckedChange={setIsTimerEnabled}
                              className="scale-75 origin-right"
                            />
                          </div>
                        </div>

                        {/* Live Current Time Display */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderRadius: 12,
                          marginBottom: 16
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted }}>
                            Current Time
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: '#ff2d64' }}>
                            {liveCurrentTime || '--:--:-- --'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                          {/* Hour */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockHour(h => h === 12 ? 1 : h + 1); }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}><ChevronUp size={14}/></button>
                            <span style={{ fontSize: 24, fontWeight: 900, color: t.textPrimary, fontFamily: 'monospace' }}>{clockHour}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockHour(h => h === 1 ? 12 : h - 1); }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}><ChevronDown size={14}/></button>
                          </div>
                          <span style={{ fontSize: 24, fontWeight: 900, color: t.textMuted, marginTop: -4 }}>:</span>
                          {/* Minute */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockMinute(m => (m + 1) % 60); }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}><ChevronUp size={14}/></button>
                            <span style={{ fontSize: 24, fontWeight: 900, color: t.textPrimary, fontFamily: 'monospace' }}>{clockMinute.toString().padStart(2, '0')}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockMinute(m => (m - 1 + 60) % 60); }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}><ChevronDown size={14}/></button>
                          </div>
                        </div>

                        {/* AM / PM Selector */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, width: '100%' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockAmPm('AM'); }}
                            style={{
                              flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer',
                              background: clockAmPm === 'AM' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
                              color: clockAmPm === 'AM' ? t.textPrimary : t.textMuted,
                              boxShadow: clockAmPm === 'AM' ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClockAmPm('PM'); }}
                            style={{
                              flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer',
                              background: clockAmPm === 'PM' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
                              color: clockAmPm === 'PM' ? t.textPrimary : t.textMuted,
                              boxShadow: clockAmPm === 'PM' ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            PM
                          </button>
                        </div>

                        {/* Display Info */}
                        <div style={{ 
                          padding: '12px', 
                          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', 
                          borderRadius: 14, 
                          marginBottom: 16,
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                            Target Expiry
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.02em' }}>
                            {clockHour}:{clockMinute.toString().padStart(2, '0')} <span style={{ fontSize: 10, color: t.textMuted }}>{clockAmPm}</span>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: isTimerEnabled ? '#3b82f6' : t.textMuted, marginTop: 2 }}>
                            {(() => {
                              const target = getTargetDate();
                              const diff = target.getTime() - Date.now();
                              const hours = Math.floor(diff / 3600000);
                              const minutes = Math.floor((diff % 3600000) / 60000);
                              const isTomorrow = target.getDate() !== new Date().getDate();
                              return `${isTomorrow ? 'Tomorrow' : 'Today'} in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
                            })()}
                          </div>
                        </div>

                        {/* Apply button */}
                        <button
                          onClick={() => {
                            const target = getTargetDate();
                            setSessionExpiryTime(target.getTime());
                            setIsClockPickerOpen(false);
                          }}
                          disabled={!isTimerEnabled}
                          style={{
                            width: '100%',
                            height: 40,
                            background: isTimerEnabled ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            border: 'none',
                            borderRadius: 12,
                            color: isTimerEnabled ? '#fff' : t.textMuted,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: isTimerEnabled ? 'pointer' : 'not-allowed',
                            boxShadow: isTimerEnabled ? '0 10px 20px rgba(37,99,235,0.2)' : 'none',
                          }}
                          className={isTimerEnabled ? "hover:scale-[1.02] active:scale-[0.98] transition-all" : ""}
                        >
                          Confirm Expiry
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}



            {/* theme toggle */}
            <ToggleTheme
              duration={500}
              style={{
                ...iconBtnStyle,
                background: 'none',
                border: 'none',
              }}
              className="hover:bg-white/5"
            />

            {/* theme engine control */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{ ...iconBtnStyle, position: 'relative' }} className="hover:bg-white/5">
                    <Palette
                      style={{
                        width: 17, height: 17,
                        color: bgStyle !== 'solid' ? '#f43f5e' : t.textMuted,
                        fill: bgStyle !== 'solid' ? '#f43f5e' : 'none',
                        opacity: bgStyle !== 'solid' ? 1 : 0.5
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ ...dropContentStyle, width: 240 }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${t.dropDivider}` }}>
                    <div className="flex items-center justify-between">
                      <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textPrimary }}>Theme Engine</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 10 }}>Background Style</p>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                      {(['particles', 'grid', 'aurora', 'solid'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setBgStyle(s)}
                          style={{
                            padding: '6px 0',
                            fontSize: 7.5,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            borderRadius: 6,
                            background: bgStyle === s ? t.dropBg : 'transparent',
                            color: bgStyle === s ? t.textPrimary : t.textMuted,
                            boxShadow: bgStyle === s ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 10 }}>Animation Mode</p>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                      {(['network', 'drift', 'pulse'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setAnimationMode(m)}
                          style={{
                            padding: '6px 0',
                            fontSize: 8,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            borderRadius: 6,
                            background: animationMode === m ? t.dropBg : 'transparent',
                            color: animationMode === m ? t.textPrimary : t.textMuted,
                            boxShadow: animationMode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${t.dropDivider}`, paddingTop: 12 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 10 }}>Colour Palette</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {particlePresets.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => setParticleConfig({ ...particleConfig, particleColor: p.particle, lineColor: p.line })}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: 6,
                            background: p.color,
                            border: particleConfig.particleColor === p.particle ? `2px solid ${t.textPrimary}` : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        />
                      ))}
                    </div>

                    {/* Custom Hex Input / Color Picker */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.dropBorder}`, borderRadius: 8 }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: `rgb(${particleConfig.particleColor || '160,140,255'})`,
                        border: `1px solid ${t.dropBorder}`,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="color" 
                          value={rgbToHex(particleConfig.particleColor || '160,140,255')}
                          onChange={(e) => {
                            const hex = e.target.value;
                            const rgb = hexToRgb(hex);
                            if (rgb) {
                              setParticleConfig({
                                ...particleConfig,
                                particleColor: rgb,
                                lineColor: rgb
                              });
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: -4, left: -4,
                            width: 28, height: 28,
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 8.5, fontWeight: 900, color: t.textPrimary, fontFamily: 'monospace' }}>
                        HEX: {rgbToHex(particleConfig.particleColor || '160,140,255').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {bgStyle === 'particles' && (
                    <>
                      <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${t.dropDivider}`, paddingTop: 12 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 10 }}>Animation Mode</p>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {(['network', 'drift', 'pulse'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setAnimationMode(m)}
                              style={{
                                padding: '6px 0',
                                fontSize: 8,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                borderRadius: 6,
                                background: animationMode === m ? t.dropBg : 'transparent',
                                color: animationMode === m ? t.textPrimary : t.textMuted,
                                boxShadow: animationMode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '0 12px 12px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 8 }}>Density</p>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {[
                            { label: 'Quiet', value: 25 },
                            { label: 'Balanced', value: 45 },
                            { label: 'Dense', value: 75 }
                          ].map((d) => (
                            <button
                              key={d.value}
                              onClick={() => setParticleConfig({ ...particleConfig, particleCount: d.value })}
                              style={{
                                padding: '5px 0',
                                fontSize: 8,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                borderRadius: 6,
                                background: (particleConfig.particleCount ?? 45) === d.value ? t.dropBg : 'transparent',
                                color: (particleConfig.particleCount ?? 45) === d.value ? t.textPrimary : t.textMuted,
                                boxShadow: (particleConfig.particleCount ?? 45) === d.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '0 12px 12px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 8 }}>Animation Speed</p>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {[
                            { label: 'Slow', value: 0.2 },
                            { label: 'Normal', value: 0.5 },
                            { label: 'Hyper', value: 1.0 }
                          ].map((s) => (
                            <button
                              key={s.value}
                              onClick={() => setParticleConfig({ ...particleConfig, speed: s.value })}
                              style={{
                                padding: '5px 0',
                                fontSize: 8,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                borderRadius: 6,
                                background: (particleConfig.speed ?? 0.5) === s.value ? t.dropBg : 'transparent',
                                color: (particleConfig.speed ?? 0.5) === s.value ? t.textPrimary : t.textMuted,
                                boxShadow: (particleConfig.speed ?? 0.5) === s.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '0 12px 12px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 8 }}>Mouse Repel Force</p>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                          {[
                            { label: 'Off', value: 0 },
                            { label: 'Normal', value: 2 },
                            { label: 'Strong', value: 4 }
                          ].map((f) => (
                            <button
                              key={f.value}
                              onClick={() => setParticleConfig({ ...particleConfig, mouseRepelForce: f.value })}
                              style={{
                                padding: '5px 0',
                                fontSize: 8,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                borderRadius: 6,
                                background: (particleConfig.mouseRepelForce ?? 2) === f.value ? t.dropBg : 'transparent',
                                color: (particleConfig.mouseRepelForce ?? 2) === f.value ? t.textPrimary : t.textMuted,
                                boxShadow: (particleConfig.mouseRepelForce ?? 2) === f.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* notifications */}
            <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
              <DropdownMenuTrigger asChild>
                <button style={{ ...iconBtnStyle, position: 'relative' }} className="hover:bg-white/5">
                  <Bell style={{ width: 17, height: 17, color: unreadCount > 0 ? '#f59e0b' : t.btnColor }} />
                  {unreadCount > 0 && (
                    <span 
                      style={{
                        position: 'absolute', top: 3, right: 3,
                        minWidth: 16, height: 16, borderRadius: 8,
                        background: '#f43f5e',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        outline: `2px solid ${t.notifRing}`,
                      }}
                      className="animate-pulse"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                style={{ 
                  ...dropContentStyle, 
                  width: isMobile ? 320 : 360, 
                  marginRight: isMobile ? 12 : undefined,
                  padding: 0, 
                  overflow: 'hidden' 
                }} 
                className="p-0 border-none"
              >
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', backdropFilter: 'blur(12px)' }} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.textPrimary }}>Notifications</p>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.textMuted, marginTop: 2 }}>Real-time Feed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchNotifications}
                      disabled={notifLoading}
                      style={{
                        background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                        padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="Refresh Notifications"
                      className="hover:scale-110 active:scale-95 transition-transform"
                    >
                      <i className={cn("fa-solid fa-rotate text-[11px]", notifLoading && "fa-spin")} style={{ color: t.textMuted }} />
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textPrimary, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: 99, border: 'none' }}
                        className="hover:opacity-80 active:scale-95 transition-all"
                      >
                        Mark All Read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '5px 10px', borderRadius: 99, border: '1px solid rgba(244,63,94,0.2)' }}
                        className="hover:bg-red-500/20 active:scale-95 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }} className="px-2 py-1 gap-1">
                  {(['all', 'alerts', 'messages', 'activity'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={(e) => { e.stopPropagation(); setNotifFilter(tab); }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: 8.5,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        borderRadius: 8,
                        background: notifFilter === tab ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
                        color: notifFilter === tab ? t.textPrimary : t.textMuted,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      className="hover:text-[var(--primary)]"
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Notifications Scroll Area */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }} className="custom-scrollbar bg-transparent">
                  {notifLoading || !renderNotifList ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textMuted }}>Syncing feed...</p>
                    </div>
                  ) : filteredNotifs.length > 0 ? (
                    filteredNotifs.map((n: any) => {
                      const isRead = readIds.includes(n.id);
                      return (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          style={{ 
                            padding: '16px 20px', 
                            borderBottom: `1px solid ${t.dropDivider}`, 
                            transition: 'all 0.2s',
                            opacity: isRead ? 0.6 : 1,
                            background: isRead ? 'transparent' : (isDark ? 'rgba(244,63,94,0.02)' : 'rgba(244,63,94,0.01)')
                          }} 
                          className="hover:bg-black/5 dark:hover:bg-white/5 group cursor-pointer relative overflow-hidden flex items-start gap-4"
                        >
                          {/* Indicator dot */}
                          {!isRead && (
                            <span style={{
                              position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                              width: 5, height: 5, borderRadius: '50%', background: '#f43f5e'
                            }} className="animate-pulse" />
                          )}

                          {/* Icon Container */}
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105",
                            n.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                              n.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                n.type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                  "bg-blue-500/10 border-blue-500/20 text-blue-500"
                          )}>
                            {n.category === 'Inbox' ? <i className="fa-solid fa-envelope text-[13px]" /> :
                              n.category === 'Inventory' ? <i className="fa-solid fa-triangle-exclamation text-[13px]" /> :
                                n.category === 'Pinterest' ? <i className="fa-brands fa-pinterest text-[13px]" /> :
                                  <i className="fa-solid fa-bolt text-[13px]" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p style={{ fontSize: 12, fontWeight: 800, color: t.textPrimary }} className="truncate tracking-tight">{n.title}</p>
                              <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted }} className="shrink-0">{formatNotifTime(n.timestamp)}</span>
                            </div>
                            <p style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }} className="line-clamp-2 font-medium leading-relaxed italic">{n.desc}</p>
                          </div>

                          {/* Dismiss Button */}
                          <button
                            onClick={(e) => dismissNotification(n.id, e)}
                            style={{
                              background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                              padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                            title="Dismiss"
                          >
                            <i className="fa-solid fa-xmark text-[11px]" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 px-10 text-center flex flex-col items-center gap-4">
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${t.dropDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted }}>
                        <Bell size={26} strokeWidth={1} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.textMuted }}>No Notifications</p>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: t.textMuted, opacity: 0.5, marginTop: 4 }}>Everything is quiet in this category</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer link to Audit Log */}
                {notifications.length > 0 && (
                  <div style={{ padding: 12, borderTop: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }} className="text-center">
                    <button 
                      onClick={() => router.push('/logs')}
                      style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: t.textMuted, border: 'none', background: 'none', cursor: 'pointer' }} 
                      className="hover:text-primary transition-all duration-300"
                    >
                      View Audit Log
                    </button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden sm:flex group items-center justify-center relative overflow-hidden"
                  style={{
                    alignItems: 'center', gap: 8,
                    height: 40, padding: '0 20px',
                    borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, black))',
                    color: '#fff',
                    fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)';
                  }}
                >
                  <Plus style={{ width: 14, height: 14, strokeWidth: 3 }} />
                  <span>Create</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={dropContentStyle} className="w-48">
                {quickActions.map(a => (
                  <DropdownMenuItem
                    key={a.href}
                    onClick={() => router.push(a.href)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                    className="focus:outline-none"
                  >
                    <a.icon style={{ width: 13, height: 13, color: t.textMuted }} />
                    {a.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* divider */}
            <div className="hidden sm:block" style={{ width: 1, height: 24, background: t.btnBorder, margin: '0 4px' }} />

            {/* avatar / profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="group relative overflow-hidden"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    height: 40, paddingLeft: 4, paddingRight: isMobile ? 4 : 14,
                    borderRadius: 999,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, black))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 900, flexShrink: 0,
                    overflow: 'hidden', position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                    ) : initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start justify-center" style={{ lineHeight: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: t.textPrimary, margin: '0 0 2px 0', letterSpacing: '-0.01em', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {username}
                    </p>
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.textMuted, margin: 0 }}>
                                {profile?.role ?? 'Super Admin'}
                  </p>
                </div>
                <ChevronDown className="hidden md:block transition-transform group-hover:translate-y-0.5" style={{ width: 12, height: 12, color: t.textMuted, marginLeft: 2 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              style={{ 
                ...dropContentStyle, 
                width: isMobile ? 280 : 240,
                maxHeight: isMobile ? '82vh' : undefined,
                overflowY: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 12 : undefined 
              }}
            >
              {/* user card */}
              <div style={{ padding: '10px 12px 10px', marginBottom: 4, borderBottom: `1px solid ${t.dropDivider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                    background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#f472b6,#f43f5e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 900,
                    overflow: 'hidden', position: 'relative'
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                    ) : initials}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: 12, fontWeight: 900, color: t.dropItemText, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
                    <p style={{ fontSize: 10, color: t.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <p className="px-3 py-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Account</p>
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                  className="focus:outline-none"
                >
                  <i className="fa-solid fa-user text-[13px]" style={{ width: 13, color: t.textMuted, textAlign: 'center' }} />
                  Profile Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => handleDownloadCSVLinks('storefront')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                  className="focus:outline-none"
                >
                  <i className="fa-solid fa-file-csv text-[13px] text-pink-400" style={{ width: 13, textAlign: 'center' }} />
                  Download Storefront Links
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDownloadCSVLinks('admin')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                  className="focus:outline-none"
                >
                  <i className="fa-solid fa-file-csv text-[13px] text-cyan-400" style={{ width: 13, textAlign: 'center' }} />
                  Download Admin Links
                </DropdownMenuItem>
              </div>

              <div className="py-1 border-t border-white/5 mt-1">
                <p className="px-3 py-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Management</p>
                
                {/* Login Gate Toggle in Menu */}
                {canManageSettings && (
                  <DropdownMenuItem
                    onClick={async () => {
                      if (loginRequired) {
                        setGatePassword('');
                        setGateError('');
                        setShowGatePassword(false);
                        setIsGateModalOpen(true);
                        setTimeout(() => gateInputRef.current?.focus(), 150);
                      } else {
                        await toggleLoginGate();
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                    className="focus:outline-none"
                  >
                    {loginRequired ? (
                      <>
                        <i className="fa-solid fa-shield-halved text-[13px] text-emerald-500" style={{ width: 13, textAlign: 'center' }} />
                        <span>Login Gate: ON</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield text-[13px] text-rose-500" style={{ width: 13, textAlign: 'center' }} />
                        <span>Login Gate: OFF</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {/* Smooth Scroll Toggle in Menu */}
                <DropdownMenuItem
                  onClick={() => toggleSmoothScroll()}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                  className="focus:outline-none"
                >
                  {isSmoothScrollEnabled ? (
                    <>
                      <i className="fa-solid fa-mouse-pointer text-[13px] text-emerald-500" style={{ width: 13, textAlign: 'center' }} />
                      <span>Smooth Scroll: ON</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-mouse-pointer text-[13px] text-rose-500" style={{ width: 13, textAlign: 'center' }} />
                      <span>Smooth Scroll: OFF</span>
                    </>
                  )}
                </DropdownMenuItem>


                {/* Sitemap Generator UI Integrated into Menu */}
                {canManageSettings && (
                  <div className="mt-1 border-t border-white/5 pt-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSitemapControl(prev => !prev);
                      }}
                      className="w-full focus:outline-none flex items-center justify-between transition-colors hover:bg-white/5"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 11,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        color: t.dropItemText,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <i className="fa-solid fa-globe text-[13px] text-cyan-400" style={{ width: 13, textAlign: 'center' }} />
                        <span>Sitemap Control</span>
                      </div>
                      {showSitemapControl ? (
                        <ChevronUp className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showSitemapControl && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 space-y-3">
                            {/* Sitemap Stats Grid */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { label: 'Products', val: sitemapData?.counts?.products ?? '...', color: '#10b981' },
                                { label: 'Blogs', val: sitemapData?.counts?.blogs ?? '...', color: '#06b6d4' },
                                { label: 'Categories', val: sitemapData?.counts?.categories ?? '...', color: '#8b5cf6' },
                                { label: 'Total', val: sitemapData?.counts?.total ?? '...', color: '#f43f5e' },
                              ].map((s, i) => (
                                <div key={i} className="p-2 bg-black/15 dark:bg-white/5 rounded-lg border border-white/5 text-center">
                                  <p className="text-[11px] font-black leading-none mb-1" style={{ color: s.color }}>{s.val}</p>
                                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{s.label}</p>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleGenerateSitemap();
                                }}
                                disabled={isGeneratingSitemap}
                                className="flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                              >
                                {isGeneratingSitemap ? (
                                  <i className="fa-solid fa-circle-notch fa-spin text-[10px]" />
                                ) : (
                                  <i className="fa-solid fa-bolt text-[10px]" />
                                )}
                                Generate
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDownloadSitemap();
                                }}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                title="Save XML"
                              >
                                <i className="fa-solid fa-download text-[11px] text-cyan-500" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${t.dropDivider}` }}>
                <DropdownMenuItem
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#f43f5e' }}
                  className="focus:outline-none"
                >
                  <i className="fa-solid fa-right-from-bracket text-[13px]" style={{ width: 13, textAlign: 'center' }} />
                  Sign Out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          </div>
        </div>
      </header>

      {/* spacer is removed, layout handles padding-top: 76px */}

      {/* ═══════════════════════════════════ LOGIN GATE WARNING BANNER */}
      {!loginRequired && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '10px 24px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(127,29,29,0.92), rgba(153,27,27,0.88))'
              : 'linear-gradient(135deg, rgba(254,226,226,0.95), rgba(254,202,202,0.92))',
            borderTop: `1px solid ${isDark ? 'rgba(244,63,94,0.3)' : 'rgba(220,38,38,0.2)'}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 -4px 24px rgba(244,63,94,0.15)',
            animation: 'slideUpBanner 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: isDark ? 'rgba(244,63,94,0.2)' : 'rgba(220,38,38,0.12)',
              border: `1px solid ${isDark ? 'rgba(244,63,94,0.3)' : 'rgba(220,38,38,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <AlertTriangle style={{ width: 14, height: 14, color: isDark ? '#fca5a5' : '#dc2626' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: isDark ? '#fca5a5' : '#991b1b',
            }}>
              Security Warning — Login Gate Disabled
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              color: isDark ? 'rgba(252,165,165,0.6)' : 'rgba(153,27,27,0.6)',
              letterSpacing: '0.02em',
            }}>
              Anyone can access the admin panel without credentials. Enable login to secure your system.
            </span>
          </div>
          <button
            onClick={() => toggleLoginGate()}
            style={{
              fontSize: 9,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#fff',
              background: isDark ? '#dc2626' : '#991b1b',
              padding: '7px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
            }}
          >
            Enable Now
          </button>
        </div>
      )}

      {/* ═══════════════════════════════ SECURITY GATE MODAL */}
      {isGateModalOpen && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => !gateLoading && setIsGateModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              margin: '0 16px',
              background: isDark
                ? 'linear-gradient(145deg, rgba(20,20,20,0.97), rgba(12,12,12,0.99))'
                : 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,248,248,0.99))',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 24,
              boxShadow: isDark
                ? '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset'
                : '0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
              overflow: 'hidden',
              animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '28px 28px 20px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: isDark ? 'rgba(244,63,94,0.04)' : 'rgba(244,63,94,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)',
                  border: `1px solid rgba(244,63,94,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <KeyRound style={{ width: 18, height: 18, color: '#f43f5e' }} />
                </div>
                <button
                  onClick={() => !gateLoading && setIsGateModalOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: t.textMuted,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <h3 style={{
                fontSize: 16, fontWeight: 900, color: t.textPrimary,
                letterSpacing: '-0.02em', margin: 0,
              }}>
                Security Verification
              </h3>
              <p style={{
                fontSize: 11, fontWeight: 600, color: t.textMuted,
                margin: '6px 0 0', lineHeight: 1.5,
              }}>
                Enter the security password to disable the login gate. This action will allow access without credentials.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!gatePassword.trim()) {
                  setGateError('Password is required');
                  return;
                }
                setGateLoading(true);
                setGateError('');
                const result = await toggleLoginGate(gatePassword);
                setGateLoading(false);
                if (result.success) {
                  setIsGateModalOpen(false);
                  setGatePassword('');
                } else {
                  setGateError(result.error || 'Verification failed');
                  setGatePassword('');
                  gateInputRef.current?.focus();
                }
              }}
              style={{ padding: '24px 28px 28px' }}
            >
              <label style={{
                display: 'block',
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.15em', color: t.textMuted,
                marginBottom: 10, paddingLeft: 2,
              }}>
                Security Password
              </label>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Lock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15,
                  color: gateError ? '#f43f5e' : t.textMuted,
                  transition: 'color 0.2s',
                  zIndex: 1,
                }} />
                <input
                  ref={gateInputRef}
                  type={showGatePassword ? 'text' : 'password'}
                  value={gatePassword}
                  onChange={(e) => { setGatePassword(e.target.value); setGateError(''); }}
                  placeholder="Enter security password"
                  autoComplete="off"
                  disabled={gateLoading}
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 44,
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1.5px solid ${gateError ? 'rgba(244,63,94,0.5)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                    outline: 'none',
                    color: t.textPrimary,
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    animation: gateError ? 'shake 0.4s ease-out' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowGatePassword(!showGatePassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 30, height: 30, borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.textMuted,
                  }}
                >
                  {showGatePassword
                    ? <EyeOff style={{ width: 15, height: 15 }} />
                    : <Eye style={{ width: 15, height: 15 }} />
                  }
                </button>
              </div>

              {/* Error message */}
              {gateError && (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#f43f5e',
                  background: isDark ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.06)',
                  border: '1px solid rgba(244,63,94,0.15)',
                  borderRadius: 10, padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                  animation: 'fadeIn 0.2s ease-out',
                }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {gateError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsGateModalOpen(false)}
                  disabled={gateLoading}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    color: t.textPrimary,
                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gateLoading || !gatePassword.trim()}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: gateLoading || !gatePassword.trim()
                      ? (isDark ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.4)')
                      : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: gateLoading || !gatePassword.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                    boxShadow: gateLoading || !gatePassword.trim() ? 'none' : '0 4px 16px rgba(244,63,94,0.3)',
                    opacity: gateLoading || !gatePassword.trim() ? 0.6 : 1,
                  }}
                >
                  {gateLoading ? (
                    <>
                      <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                      Verifying
                    </>
                  ) : (
                    <>
                      <ShieldOff style={{ width: 13, height: 13 }} />
                      Disable Login
                    </>
                  )}
                </button>
              </div>

              <p style={{
                fontSize: 9, fontWeight: 700, color: t.textMuted,
                textAlign: 'center', marginTop: 16, opacity: 0.5,
                letterSpacing: '0.02em',
              }}>
                This password is different from your login credentials.
              </p>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* keyframes */}
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
