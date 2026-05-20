'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Menu, ChevronRight, TrendingUp,
  Image as ImageIcon, FileText,
  House, ShoppingBag, Bell, Zap, X,
  Settings, LogOut, User, ExternalLink,
  ShieldCheck, ShieldOff, AlertTriangle,
  Lock, Eye, EyeOff, KeyRound, Loader2, Clock
} from 'lucide-react';
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
import BackButton from './BackButton';

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isParticlesEnabled: boolean;
  setIsParticlesEnabled: (v: boolean) => void;
  animationMode: 'network' | 'drift' | 'pulse';
  setAnimationMode: (v: 'network' | 'drift' | 'pulse') => void;
  particleConfig: { particleColor: string; lineColor: string };
  setParticleConfig: (v: { particleColor: string; lineColor: string }) => void;
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
  { name: 'Crimson', particle: "244,63,94", line: "225,29,72", color: '#f43f5e' },
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

export default function Topbar({
  onMenuClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isParticlesEnabled,
  setIsParticlesEnabled,
  animationMode,
  setAnimationMode,
  particleConfig,
  setParticleConfig
}: TopbarProps) {
  const router = useRouter();
  const { user, profile, logout, loginRequired, toggleLoginGate, sessionTimeRemaining, extendSession, setSessionExpiryTime } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [clockHour, setClockHour] = useState(() => {
    const d = new Date();
    const future = new Date(d.getTime() + 600000);
    let h = future.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [clockMinute, setClockMinute] = useState(() => {
    const d = new Date();
    const future = new Date(d.getTime() + 600000);
    return future.getMinutes();
  });
  const [clockAmPm, setClockAmPm] = useState(() => {
    const d = new Date();
    const future = new Date(d.getTime() + 600000);
    return future.getHours() >= 12 ? 'PM' : 'AM';
  });
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');
  const clockRef = useRef<HTMLDivElement>(null);

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
    const x = e.clientX - rect.left - 60; // relative to center (60, 60) for 120x120 clock
    const y = e.clientY - rect.top - 60;

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
    (profile?.role === 'manager' && !!profile?.permissions?.settings);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Product Synced', desc: 'Elegant Pink Sheath Dress added to vault.', time: '2m ago', type: 'success' },
    { id: '2', title: 'System Update', desc: 'Pinterest Engine optimization complete.', time: '1h ago', type: 'info' },
    { id: '3', title: 'Security Alert', desc: 'New login detected from Mumbai, India.', time: '3h ago', type: 'warning' },
    { id: '4', title: 'Inventory Low', desc: 'Velvet Evening Gown is almost out of stock.', time: '5h ago', type: 'error' },
  ]);
  const [hasUnread, setHasUnread] = useState(true);

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
  const [isSitemapDropdownOpen, setIsSitemapDropdownOpen] = useState(false);

  useEffect(() => {
    if (isSitemapDropdownOpen) {
      fetch('/api/sitemap')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setSitemapData(data);
        })
        .catch((err) => console.error('Error fetching sitemap dry-run:', err));
    }
  }, [isSitemapDropdownOpen]);

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
            time: 'Just now',
            type: 'success',
          },
          ...prev,
        ]);
        setHasUnread(true);
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
          time: 'Just now',
          type: 'success',
        },
        ...prev,
      ]);
      setHasUnread(true);
    } catch (err) {
      console.error('Error downloading sitemap:', err);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
    setHasUnread(false);
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
    barBg: scrolled ? 'rgba(5,5,5,0.85)' : 'rgba(5,5,5,0.7)',
    barBorder: 'rgba(255,255,255,0.05)',
    barShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.65)' : 'none',
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
    dropBg: 'rgba(18,18,18,0.92)',
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
    barBg: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.72)',
    barBorder: 'rgba(0,0,0,0.07)',
    barShadow: scrolled ? '0 1px 32px rgba(0,0,0,0.07)' : 'none',
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
    dropBg: 'rgba(255,255,255,0.95)',
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
    width: 36, height: 36,
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: t.btnBg,
    border: `1px solid ${t.btnBorder}`,
    color: t.btnColor,
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.15s',
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
          top: 0, left: 0, right: 0,
          zIndex: 60,
          height: 62,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          background: t.barBg,
          borderBottom: `1px solid ${t.barBorder}`,
          boxShadow: t.barShadow,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'background 0.3s, box-shadow 0.3s',
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16, position: 'relative' }}>

          {/* ── LEFT ─────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <BackButton
              style={{
                background: t.btnBg,
                border: `1px solid ${t.btnBorder}`,
                color: t.btnColor,
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
            >
              <Menu style={{ width: 16, height: 16 }} />
            </button>

            {/* brand */}
            <span className="hidden md:inline-flex" style={{ alignItems: 'center', gap: 8, userSelect: 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', textTransform: 'uppercase', color: t.textPrimary }}>
                Fashcon
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#f43f5e',
                background: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)',
                padding: '2px 7px', borderRadius: 99,
              }}>
                Admin
              </span>
            </span>
          </div>

          {/* ── CENTRE: search ───────────────────────── */}
          <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 440, margin: '0 auto' }}>
            <Search style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14,
              color: isFocused ? '#f43f5e' : t.textMuted,
              transition: 'color 0.2s',
              zIndex: 1,
            }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search anything…"
              style={{
                width: '100%',
                height: 36,
                paddingLeft: 36,
                paddingRight: searchQuery ? 32 : 12,
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 500,
                background: isFocused ? t.inputFocusBg : t.inputBg,
                border: `1px solid ${isFocused ? 'rgba(244,63,94,0.45)' : t.inputBorder}`,
                outline: 'none',
                color: t.inputText,
                boxShadow: isFocused ? '0 0 0 3px rgba(244,63,94,0.08)' : 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {/* placeholder color via className since inline style can't target ::placeholder */}
            <style>{`
              .topbar-search::placeholder { color: ${t.inputPh}; }
            `}</style>

            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setIsFocused(false); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex' }}
              >
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}

            {/* suggestions */}
            {isFocused && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 120,
                background: t.dropBg,
                border: `1px solid ${t.dropBorder}`,
                borderRadius: 18,
                boxShadow: t.dropShadow,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                overflow: 'hidden',
                padding: 6,
              }}>
                {filtered.map((item, idx) => {
                  const active = selectedIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { router.push(item.href); setIsFocused(false); setSearchQuery(''); }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: active ? '#f43f5e' : 'transparent',
                        transition: 'background 0.1s',
                        textAlign: 'left',
                      }}
                      onMouseLeave={() => setSelectedIdx(-1)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? 'rgba(255,255,255,0.2)' : t.btnBg,
                          flexShrink: 0,
                        }}>
                          <item.icon style={{ width: 13, height: 13, color: active ? '#fff' : t.btnColor }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : t.dropItemText, margin: 0, lineHeight: 1.2 }}>{item.title}</p>
                          <p style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: active ? 'rgba(255,255,255,0.6)' : t.textMuted, margin: 0 }}>{item.category}</p>
                        </div>
                      </div>
                      <ChevronRight style={{ width: 13, height: 13, color: active ? 'rgba(255,255,255,0.8)' : t.textMuted, opacity: active ? 1 : 0.3 }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Main Site Button */}
            <a
              href="https://www.fashcon.store"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...iconBtnStyle,
                width: 'auto',
                padding: '0 12px',
                gap: 8,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                textDecoration: 'none',
              }}
              className="hidden lg:flex"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textPrimary }}>
                Main Site
              </span>
              <ExternalLink style={{ width: 12, height: 12, opacity: 0.5 }} />
            </a>

            {/* login gate toggle */}
            {canManageSettings && (
              <button
                onClick={async () => {
                  if (loginRequired) {
                    // Turning login OFF → open password confirmation modal
                    setGatePassword('');
                    setGateError('');
                    setShowGatePassword(false);
                    setIsGateModalOpen(true);
                    setTimeout(() => gateInputRef.current?.focus(), 150);
                  } else {
                    // Turning login ON → no password needed (re-securing)
                    await toggleLoginGate();
                  }
                }}
                title={loginRequired ? 'Login Gate: ON — Click to disable' : 'Login Gate: OFF — Click to enable'}
                style={{
                  ...iconBtnStyle,
                  position: 'relative',
                  background: loginRequired
                    ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)')
                    : (isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)'),
                  border: `1px solid ${loginRequired ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                }}
              >
                {loginRequired ? (
                  <ShieldCheck style={{ width: 15, height: 15, color: '#10b981' }} />
                ) : (
                  <ShieldOff style={{ width: 15, height: 15, color: '#f43f5e' }} />
                )}
                {/* status dot */}
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 5, height: 5, borderRadius: '50%',
                  background: loginRequired ? '#10b981' : '#f43f5e',
                  outline: `2px solid ${t.notifRing}`,
                  animation: loginRequired ? 'none' : 'pulse 2s infinite',
                }} />
              </button>
            )}

            {/* Session Timer Countdown Pill */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: sessionTimeRemaining < 60 
                    ? 'rgba(239, 68, 68, 0.15)' 
                    : sessionTimeRemaining < 180 
                    ? 'rgba(245, 158, 11, 0.15)' 
                    : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${
                    sessionTimeRemaining < 60 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : sessionTimeRemaining < 180 
                      ? 'rgba(245, 158, 11, 0.3)' 
                      : t.btnBorder
                  }`,
                  transition: 'all 0.3s ease',
                }}
                className={cn(
                  "hidden sm:flex items-center",
                  (sessionTimeRemaining < 180) && "animate-pulse"
                )}
              >
                <Clock 
                  size={13} 
                  className={cn(
                    sessionTimeRemaining < 60 
                      ? 'text-red-500 animate-bounce' 
                      : sessionTimeRemaining < 180 
                      ? 'text-amber-500' 
                      : isDark ? 'text-white/60' : 'text-black/60'
                  )} 
                />
                <span 
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: 12, 
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: sessionTimeRemaining < 60 
                      ? '#ef4444' 
                      : sessionTimeRemaining < 180 
                      ? '#f59e0b' 
                      : t.textPrimary
                  }}
                >
                  {(() => {
                    const mins = Math.floor(sessionTimeRemaining / 60);
                    const secs = sessionTimeRemaining % 60;
                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  })()}
                </span>
                
                {/* Visual divider */}
                <div style={{ width: 1, height: 14, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                
                {/* Reduce button */}
                <button
                  onClick={() => extendSession(-60)} // -1 minute
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px 4px',
                    fontSize: 9.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    color: sessionTimeRemaining < 60 
                      ? '#ef4444' 
                      : sessionTimeRemaining < 180 
                      ? '#f59e0b' 
                      : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                  }}
                  className="hover:scale-105 active:scale-95 transition-transform"
                  title="Reduce session by 1 minute"
                >
                  -1m
                </button>

                {/* Visual divider */}
                <div style={{ width: 1, height: 14, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

                {/* Extend button */}
                <button
                  onClick={() => extendSession(300)} // +5 minutes
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px 4px',
                    fontSize: 9.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    color: sessionTimeRemaining < 60 
                      ? '#ef4444' 
                      : sessionTimeRemaining < 180 
                      ? '#f59e0b' 
                      : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                  }}
                  className="hover:scale-105 active:scale-95 transition-transform"
                  title="Extend session by 5 minutes"
                >
                  +5m
                </button>

                {/* Visual divider */}
                <div style={{ width: 1, height: 14, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

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
                        : sessionTimeRemaining < 60
                        ? '#ef4444'
                        : sessionTimeRemaining < 180
                        ? '#f59e0b'
                        : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    }}
                    className="hover:scale-110 transition-transform"
                    title="Set absolute logout clock time"
                  >
                    <Clock size={11} />
                  </button>

                  {/* POP-OVER CLOCK DIAL WINDOW */}
                  {isClockPickerOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: -10,
                        marginTop: 12,
                        zIndex: 9999,
                        width: 200,
                        padding: 12,
                        borderRadius: 14,
                        background: isDark ? 'rgba(15, 15, 15, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: t.textPrimary,
                      }}
                    >
                      {/* Title */}
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', marginBottom: 8 }}>
                        Custom Expiry Watch
                      </span>

                      {/* Interactive Mode Toggles */}
                      <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 6, padding: 2, width: '100%', marginBottom: 8 }}>
                        <button
                          onClick={() => setPickerMode('hour')}
                          style={{
                            flex: 1, padding: '3px 0', border: 'none', borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                            background: pickerMode === 'hour' ? (isDark ? '#3b82f6' : '#2563eb') : 'none',
                            color: pickerMode === 'hour' ? '#fff' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Hour ({clockHour})
                        </button>
                        <button
                          onClick={() => setPickerMode('minute')}
                          style={{
                            flex: 1, padding: '3px 0', border: 'none', borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                            background: pickerMode === 'minute' ? (isDark ? '#3b82f6' : '#2563eb') : 'none',
                            color: pickerMode === 'minute' ? '#fff' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Min ({clockMinute.toString().padStart(2, '0')})
                        </button>
                      </div>

                      {/* SVG Clock Dial */}
                      <svg
                        width="120"
                        height="120"
                        viewBox="0 0 150 150"
                        onClick={handleClockClick}
                        style={{ cursor: 'crosshair', userSelect: 'none', background: isDark ? '#121212' : '#f5f5f7', borderRadius: '50%', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)' }}
                      >
                        {/* Dial face background circle */}
                        <circle cx="75" cy="75" r="70" fill="none" stroke={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} strokeWidth="1" />
                        <circle cx="75" cy="75" r="60" fill="none" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeWidth="1" />
                        
                        {/* Render numbers 1-12 in circle */}
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const num = idx + 1;
                          const angle = (num * 30 * Math.PI) / 180;
                          const r = 50; // radial distance from center
                          const x = 75 + r * Math.sin(angle);
                          const y = 75 - r * Math.cos(angle);
                          const isSelectedHour = pickerMode === 'hour' && clockHour === num;
                          return (
                            <text
                              key={num}
                              x={x}
                              y={y + 3.5}
                              textAnchor="middle"
                              style={{
                                fontSize: 10,
                                fontWeight: isSelectedHour ? 900 : 500,
                                fill: isSelectedHour ? '#ef4444' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
                                transition: 'fill 0.15s ease'
                              }}
                            >
                              {num}
                            </text>
                          );
                        })}

                        {/* Hand selection indicators (highlight arcs) */}
                        {/* Hour Hand */}
                        <line
                          x1="75"
                          y1="75"
                          x2={75 + 32 * Math.sin(((clockHour % 12 * 30 + clockMinute / 60 * 30) * Math.PI) / 180)}
                          y2={75 - 32 * Math.cos(((clockHour % 12 * 30 + clockMinute / 60 * 30) * Math.PI) / 180)}
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Minute Hand */}
                        <line
                          x1="75"
                          y1="75"
                          x2={75 + 46 * Math.sin((clockMinute * 6 * Math.PI) / 180)}
                          y2={75 - 46 * Math.cos((clockMinute * 6 * Math.PI) / 180)}
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Center Pin */}
                        <circle cx="75" cy="75" r="3.5" fill={isDark ? '#fff' : '#000'} />
                      </svg>

                      {/* AM / PM Selector */}
                      <div style={{ display: 'flex', gap: 4, margin: '8px 0 6px 0', width: '100%' }}>
                        <button
                          onClick={() => setClockAmPm('AM')}
                          style={{
                            flex: 1, padding: '3px 0', border: '1px solid', borderRadius: 6, fontSize: 8.5, fontWeight: 900, cursor: 'pointer',
                            background: clockAmPm === 'AM' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'none',
                            borderColor: clockAmPm === 'AM' ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : 'transparent',
                            color: clockAmPm === 'AM' ? t.textPrimary : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
                          }}
                        >
                          AM
                        </button>
                        <button
                          onClick={() => setClockAmPm('PM')}
                          style={{
                            flex: 1, padding: '3px 0', border: '1px solid', borderRadius: 6, fontSize: 8.5, fontWeight: 900, cursor: 'pointer',
                            background: clockAmPm === 'PM' ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'none',
                            borderColor: clockAmPm === 'PM' ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : 'transparent',
                            color: clockAmPm === 'PM' ? t.textPrimary : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
                          }}
                        >
                          PM
                        </button>
                      </div>

                      {/* Display Info */}
                      <div style={{ fontSize: 8.5, textAlign: 'center', margin: '2px 0 8px 0', lineHeight: '1.3', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        Target: <strong style={{ color: t.textPrimary }}>{clockHour}:{clockMinute.toString().padStart(2, '0')} {clockAmPm}</strong>
                        <br />
                        {(() => {
                          const target = getTargetDate();
                          const diff = target.getTime() - Date.now();
                          const hours = Math.floor(diff / 3600000);
                          const minutes = Math.floor((diff % 3600000) / 60000);
                          const isTomorrow = target.getDate() !== new Date().getDate();
                          return `(${isTomorrow ? 'Tomorrow' : 'Today'} in ${hours > 0 ? `${hours}h ` : ''}${minutes}m)`;
                        })()}
                      </div>

                      {/* Apply button */}
                      <button
                        onClick={() => {
                          const target = getTargetDate();
                          setSessionExpiryTime(target.getTime());
                          setIsClockPickerOpen(false);
                        }}
                        style={{
                          width: '100%',
                          height: 26,
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                        }}
                        className="hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Set Expiry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* theme toggle */}
            <ToggleTheme
              duration={500}
              style={iconBtnStyle}
            />

            {/* sitemap engine control */}
            {canManageSettings && (
              <DropdownMenu onOpenChange={setIsSitemapDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button style={{ ...iconBtnStyle, position: 'relative' }} title="Sitemap Generator">
                    <i className="fa-solid fa-sitemap" style={{
                      background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: 13,
                    }} />
                    {sitemapData?.success && (
                      <span style={{
                        position: 'absolute', top: 7, right: 7,
                        width: 5, height: 5, borderRadius: '50%',
                        background: '#10b981',
                        outline: `2.5px solid ${t.notifRing}`,
                      }} />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ ...dropContentStyle, width: 280, padding: 0 }} className="p-0 border-none">
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-nodes text-emerald-500 text-xs animate-pulse" />
                      <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.textPrimary }}>Sitemap Engine</p>
                    </div>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.textMuted, marginTop: 2 }}>SEO Indexing Control</p>
                  </div>

                  <div style={{ padding: '16px' }} className="flex flex-col gap-4">
                    {/* Sitemap Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center">
                        <span className="text-xs font-black text-emerald-500 tracking-tight leading-none mb-1">
                          {sitemapData?.counts?.products ?? '...'}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Products</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center">
                        <span className="text-xs font-black text-cyan-500 tracking-tight leading-none mb-1">
                          {sitemapData?.counts?.blogs ?? '...'}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Blogs</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center">
                        <span className="text-xs font-black text-indigo-500 tracking-tight leading-none mb-1">
                          {sitemapData?.counts?.categories ?? '...'}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Categories</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center">
                        <span className="text-xs font-black text-rose-500 tracking-tight leading-none mb-1">
                          {sitemapData?.counts?.total ?? '...'}
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total URLs</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Primary CTA */}
                      <button
                        onClick={handleGenerateSitemap}
                        disabled={isGeneratingSitemap}
                        className="flex-1 relative py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider text-white shadow-lg overflow-hidden border-t border-white/25 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                        }}
                      >
                        {isGeneratingSitemap ? (
                          <>
                            <i className="fa-solid fa-spinner animate-spin text-xs" />
                            Compiling...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-rocket group-hover:animate-bounce text-xs" />
                            Generate
                          </>
                        )}
                      </button>

                      {/* Download XML Button */}
                      <a
                        href="/api/sitemap?fullXml=true"
                        download="sitemap.xml"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          color: t.textPrimary,
                          pointerEvents: (isGeneratingSitemap || !sitemapData?.success) ? 'none' : 'auto',
                          opacity: (isGeneratingSitemap || !sitemapData?.success) ? 0.4 : 1,
                        }}
                        className="py-2.5 px-3.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border"
                        title="Download XML File to Disk"
                      >
                        <i className="fa-solid fa-download text-xs text-cyan-500" />
                        Save XML
                      </a>
                    </div>
                    
                    {sitemapData?.success && sitemapData.path && (
                      <div className="text-center">
                        <p className="text-[8.5px] font-medium text-emerald-500 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <i className="fa-solid fa-circle-check" />
                          Live dynamic sitemap is active
                        </p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* visual engine control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ ...iconBtnStyle, position: 'relative' }}>
                  <Zap
                    style={{
                      width: 14, height: 14,
                      color: isParticlesEnabled ? '#f43f5e' : t.textMuted,
                      fill: isParticlesEnabled ? '#f43f5e' : 'none',
                      opacity: isParticlesEnabled ? 1 : 0.5
                    }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ ...dropContentStyle, width: 240 }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${t.dropDivider}` }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textPrimary }}>Visual Engine</p>
                    <button
                      onClick={() => setIsParticlesEnabled(!isParticlesEnabled)}
                      style={{
                        fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                        color: isParticlesEnabled ? '#10b981' : '#f43f5e',
                        background: isParticlesEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                        padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer'
                      }}
                    >
                      {isParticlesEnabled ? 'Enabled' : 'Disabled'}
                    </button>
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

                <div style={{ padding: '0 12px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 10 }}>Colour Palette</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {particlePresets.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => setParticleConfig({ particleColor: p.particle, lineColor: p.line })}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 6,
                          background: p.color,
                          border: particleConfig.particleColor === p.particle ? `2px solid ${t.textPrimary}` : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          transform: particleConfig.particleColor === p.particle ? 'scale(1.1)' : 'scale(1)',
                        }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* notifications */}
            <DropdownMenu onOpenChange={(open) => { if (open) setHasUnread(false); }}>
              <DropdownMenuTrigger asChild>
                <button style={{ ...iconBtnStyle, position: 'relative' }}>
                  <i className="fa-solid fa-bell" style={{ fontSize: 14, color: '#f59e0b' }} />
                  {hasUnread && (
                    <span style={{
                      position: 'absolute', top: 7, right: 7,
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#f43f5e',
                      outline: `2px solid ${t.notifRing}`,
                    }} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ ...dropContentStyle, width: 320, padding: 0, overflow: 'hidden' }} className="p-0 border-none">
                <div style={{ padding: '20px', borderBottom: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', backdropFilter: 'blur(12px)' }} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.textPrimary }}>Notifications</p>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', color: t.textMuted, marginTop: 2 }}>Activity Stream</p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(244,63,94,0.2)' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 380, overflowY: 'auto' }} className="custom-scrollbar bg-transparent">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <div key={n.id} style={{ padding: 20, borderBottom: `1px solid ${t.dropDivider}`, transition: 'background 0.2s' }} className="hover:bg-black/5 dark:hover:bg-white/5 group cursor-pointer relative overflow-hidden">
                        <div className="flex gap-4 relative z-10">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110",
                            n.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                              n.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                n.type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                  "bg-blue-500/10 border-blue-500/20 text-blue-500"
                          )}>
                            <Zap size={16} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                              <p style={{ fontSize: 12, fontWeight: 800, color: t.textPrimary }} className="truncate tracking-tight">{n.title}</p>
                              <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.textMuted }}>{n.time}</span>
                            </div>
                            <p style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }} className="line-clamp-1 font-medium leading-relaxed italic">{n.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 px-10 text-center flex flex-col items-center gap-4">
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${t.dropDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted }}>
                        <Bell size={32} strokeWidth={1} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.textMuted }}>Pure Silence</p>
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: t.textMuted, opacity: 0.5, marginTop: 4 }}>Everything is up to date</p>
                      </div>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div style={{ padding: 12, borderTop: `1px solid ${t.dropDivider}`, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }} className="text-center">
                    <button style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: t.textMuted }} className="hover:text-primary transition-all duration-300">
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
                  className="hidden sm:flex"
                  style={{
                    alignItems: 'center', gap: 7,
                    height: 36, padding: '0 14px',
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: t.createBg,
                    color: t.createText,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                    boxShadow: t.createShadow,
                    transition: 'opacity 0.15s, transform 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-plus-circle" style={{ fontSize: 13, color: isDark ? '#f43f5e' : '#fff' }} />
                  Create
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
            <div className="hidden sm:block" style={{ width: 1, height: 20, background: t.btnBorder, margin: '0 2px' }} />

            {/* avatar / profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    height: 36, paddingLeft: 4, paddingRight: 10,
                    borderRadius: 12,
                    background: t.avatarPillBg,
                    border: `1px solid ${t.avatarPillBorder}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 27, height: 27, borderRadius: 9,
                    background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#f472b6,#f43f5e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 900, flexShrink: 0,
                    overflow: 'hidden', position: 'relative'
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                    ) : initials}
                  </div>
                  <div className="hidden md:block" style={{ textAlign: 'left', lineHeight: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: t.textPrimary, margin: 0, letterSpacing: '-0.01em', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {username}
                    </p>
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.textMuted, margin: '2px 0 0' }}>
                      {profile?.role ?? 'Super Admin'}
                    </p>
                  </div>
                  <ChevronRight className="hidden md:block" style={{ width: 12, height: 12, color: t.textMuted, transform: 'rotate(90deg)' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ ...dropContentStyle, width: 240 }}>
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

                {[
                  { label: 'Profile Settings', href: '/profile', icon: User },
                  { label: 'System Config', href: '/configuration', icon: Settings },
                ].map(item => (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: t.dropItemText }}
                    className="focus:outline-none"
                  >
                    <item.icon style={{ width: 13, height: 13, color: t.textMuted }} />
                    {item.label}
                  </DropdownMenuItem>
                ))}

                <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${t.dropDivider}` }}>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#f43f5e' }}
                    className="focus:outline-none"
                  >
                    <LogOut style={{ width: 13, height: 13 }} />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* spacer – keeps content from going behind the fixed bar */}
      <div style={{ height: 62, flexShrink: 0 }} aria-hidden />

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
