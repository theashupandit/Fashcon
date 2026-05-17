'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight,
  MousePointerClick, Package, Trophy, Cloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

/* ── types ──────────────────────────────────────────────── */
interface BaseCard {
  variant?: 'affiliate' | 'products' | 'category' | 'storage' | 'generic' | 'gradient' | 'default' | 'minimal';
  className?: string;
}

interface GenericData extends BaseCard {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
  change?: string;
  trend?: 'up' | 'down';
}

interface AffiliateData extends BaseCard {
  variant: 'affiliate';
  clicks: number;           // total CTA clicks across site
  change?: string;          // e.g. "+12%"
  trend?: 'up' | 'down';
}

interface ProductsData extends BaseCard {
  variant: 'products';
  total: number;            // total live products
  newThisWeek?: number;
  trend?: 'up' | 'down';
}

interface CategoryData extends BaseCard {
  variant: 'category';
  name: string;             // e.g. "Evening Gowns"
  clicks: number;           // e.g. 469
  change?: string;
}

interface StorageData extends BaseCard {
  variant: 'storage';
  usedMb: number;           // used in MB
  totalMb: number;          // plan limit in MB
  fileCount?: number;
}

type StatsCardProps = GenericData | AffiliateData | ProductsData | CategoryData | StorageData;

/* ── helpers ─────────────────────────────────────────────── */
function fmt(n: number | string): string {
  if (typeof n === 'string') return n;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtMb(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB';
  return mb.toFixed(0) + ' MB';
}

/* ── shared token helper ─────────────────────────────────── */
function useTokens(isDark: boolean) {
  return {
    cardBg: isDark ? '#111' : '#fff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    cardHover: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    labelColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.38)',
    valueColor: isDark ? '#f2f2f2' : '#111',
    subColor: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)',
    divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  };
}

/* ═══════════════════════════════════════════════════════════
   CARD 0 — Generic Stats Card
══════════════════════════════════════════════════════════════ */
function GenericCard({ label, value, icon: Icon, color, change, trend, className }: GenericData) {
  const { theme } = useTheme();
  const t = useTokens(theme === 'dark');
  const [hov, setHov] = useState(false);

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn('group relative overflow-hidden rounded-2xl cursor-default transition-all duration-300', className)}
      style={{
        background: t.cardBg,
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : t.cardBorder}`,
        boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        padding: '18px 18px 16px',
        transition: 'all 0.25s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className={cn("w-9 h-9 rounded-xl glass-strong flex items-center justify-center transition-transform", hov && "scale-110")}>
          <Icon className={cn("w-4.5 h-4.5 opacity-70", color)} />
        </div>

        {change && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            padding: '3px 7px', borderRadius: 6,
            background: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
            color: trend === 'up' ? '#22c55e' : '#f43f5e',
          }}>
            {trend === 'up' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {change}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: t.valueColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {fmt(value)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: t.labelColor, marginTop: 6 }}>
          {label}
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 1 — Affiliate Clicks
══════════════════════════════════════════════════════════════ */
function AffiliateCard({ clicks, change, trend = 'up', className }: AffiliateData & { className?: string }) {
  const { theme } = useTheme();
  const t = useTokens(theme === 'dark');
  const [hov, setHov] = useState(false);

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn('group relative overflow-hidden rounded-2xl cursor-default transition-all duration-300', className)}
      style={{
        background: t.cardBg,
        border: `1px solid ${hov ? 'rgba(99,102,241,0.35)' : t.cardBorder}`,
        boxShadow: hov ? '0 8px 32px rgba(99,102,241,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        padding: '18px 18px 16px',
        transition: 'all 0.25s',
      }}
    >
      {/* glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 65%)' : 'none',
        transition: 'all 0.35s',
      }} />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: hov ? 'scale(1.08) rotate(-4deg)' : 'none',
        }}>
          <MousePointerClick style={{ width: 16, height: 16, color: '#818cf8' }} />
        </div>

        {change && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            padding: '3px 7px', borderRadius: 6,
            background: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
            color: trend === 'up' ? '#22c55e' : '#f43f5e',
          }}>
            {trend === 'up' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {change}
          </span>
        )}
      </div>

      {/* value */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: t.valueColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {fmt(clicks)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: t.labelColor, marginTop: 5 }}>
          Affiliate Clicks
        </div>
      </div>

      {/* sub */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 10, color: t.subColor, fontWeight: 600 }}>
          Tracked across all CTA touchpoints
        </span>
      </div>

      {/* bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 2,
        width: hov ? '100%' : '0%',
        background: 'linear-gradient(90deg,#6366f1,#818cf8)',
        borderRadius: '0 0 2px 2px',
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 2 — Active Products
══════════════════════════════════════════════════════════════ */
function ProductsCard({ total, newThisWeek, trend = 'up', className }: ProductsData & { className?: string }) {
  const { theme } = useTheme();
  const t = useTokens(theme === 'dark');
  const [hov, setHov] = useState(false);

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn('group relative overflow-hidden rounded-2xl cursor-default transition-all duration-300', className)}
      style={{
        background: t.cardBg,
        border: `1px solid ${hov ? 'rgba(16,185,129,0.35)' : t.cardBorder}`,
        boxShadow: hov ? '0 8px 32px rgba(16,185,129,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        padding: '18px 18px 16px',
        transition: 'all 0.25s',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 100% 0%, rgba(16,185,129,0.07) 0%, transparent 65%)' : 'none',
        transition: 'all 0.35s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(16,185,129,0.11)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: hov ? 'scale(1.08) rotate(4deg)' : 'none',
        }}>
          <Package style={{ width: 16, height: 16, color: '#10b981' }} />
        </div>

        {newThisWeek !== undefined && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            padding: '3px 7px', borderRadius: 6,
            background: trend === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            color: trend === 'up' ? '#10b981' : '#f43f5e',
          }}>
            {trend === 'up' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {newThisWeek} this week
          </span>
        )}
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: t.valueColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {fmt(total)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: t.labelColor, marginTop: 5 }}>
          Active Products
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ fontSize: 10, color: t.subColor, fontWeight: 600 }}>
          Live catalog — visible to shoppers now
        </span>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 2,
        width: hov ? '100%' : '0%',
        background: 'linear-gradient(90deg,#10b981,#34d399)',
        borderRadius: '0 0 2px 2px',
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 3 — Top Performing Category
══════════════════════════════════════════════════════════════ */
function CategoryCard({ name, clicks, change, className }: CategoryData & { className?: string }) {
  const { theme } = useTheme();
  const t = useTokens(theme === 'dark');
  const [hov, setHov] = useState(false);

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn('group relative overflow-hidden rounded-2xl cursor-default transition-all duration-300', className)}
      style={{
        background: t.cardBg,
        border: `1px solid ${hov ? 'rgba(245,158,11,0.35)' : t.cardBorder}`,
        boxShadow: hov ? '0 8px 32px rgba(245,158,11,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        padding: '18px 18px 16px',
        transition: 'all 0.25s',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.07) 0%, transparent 65%)' : 'none',
        transition: 'all 0.35s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(245,158,11,0.11)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: hov ? 'scale(1.08) rotate(-3deg)' : 'none',
        }}>
          <Trophy style={{ width: 16, height: 16, color: '#f59e0b' }} />
        </div>

        {change && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            padding: '3px 7px', borderRadius: 6,
            background: 'rgba(245,158,11,0.1)',
            color: '#f59e0b',
          }}>
            <ArrowUpRight size={9} />{change}
          </span>
        )}
      </div>

      {/* category name — prominent */}
      <div style={{ marginBottom: 4 }}>
        <div style={{
          fontSize: name.length > 14 ? 18 : 22,
          fontWeight: 900,
          color: t.valueColor,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: t.labelColor, marginTop: 5 }}>
          Top Performing Category
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
        <MousePointerClick style={{ width: 11, height: 11, color: '#f59e0b' }} />
        <span style={{ fontSize: 10, color: t.subColor, fontWeight: 600 }}>
          {clicks.toLocaleString()} clicks this period
        </span>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 2,
        width: hov ? '100%' : '0%',
        background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
        borderRadius: '0 0 2px 2px',
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 4 — Cloudinary Storage Health
══════════════════════════════════════════════════════════════ */
function StorageCard({ usedMb, totalMb, fileCount, className }: StorageData & { className?: string }) {
  const { theme } = useTheme();
  const t = useTokens(theme === 'dark');
  const [hov, setHov] = useState(false);

  const pct = Math.min((usedMb / totalMb) * 100, 100);
  const isWarn = pct > 75;
  const isCrit = pct > 90;

  const barColor = isCrit ? '#f43f5e' : isWarn ? '#f59e0b' : '#06b6d4';
  const bgColor = isCrit ? 'rgba(244,63,94,0.1)' : isWarn ? 'rgba(245,158,11,0.1)' : 'rgba(6,182,212,0.1)';
  const iconColor = isCrit ? '#f43f5e' : isWarn ? '#f59e0b' : '#06b6d4';
  const glowClr = isCrit ? 'rgba(244,63,94,0.07)' : isWarn ? 'rgba(245,158,11,0.07)' : 'rgba(6,182,212,0.07)';
  const borderHov = isCrit ? 'rgba(244,63,94,0.35)' : isWarn ? 'rgba(245,158,11,0.35)' : 'rgba(6,182,212,0.35)';

  const statusLabel = isCrit ? 'Critical — clean up soon' : isWarn ? 'Getting full' : 'Healthy';

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn('group relative overflow-hidden rounded-2xl cursor-default', className)}
      style={{
        background: t.cardBg,
        border: `1px solid ${hov ? borderHov : t.cardBorder}`,
        boxShadow: hov ? `0 8px 32px ${glowClr}` : '0 1px 4px rgba(0,0,0,0.06)',
        padding: '18px 18px 16px',
        transition: 'all 0.25s',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: hov ? `radial-gradient(ellipse at 100% 100%, ${glowClr} 0%, transparent 65%)` : 'none',
        transition: 'all 0.35s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.25s',
          transform: hov ? 'scale(1.08)' : 'none',
        }}>
          <Cloud style={{ width: 16, height: 16, color: iconColor }} />
        </div>

        <span style={{
          fontSize: 10, fontWeight: 800,
          padding: '3px 7px', borderRadius: 6,
          background: bgColor,
          color: barColor,
          letterSpacing: '0.04em',
        }}>
          {pct.toFixed(0)}% used
        </span>
      </div>

      {/* used / total */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: t.valueColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {fmtMb(usedMb)}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.subColor }}>
            / {fmtMb(totalMb)}
          </span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: t.labelColor, marginTop: 5 }}>
          Cloudinary Storage
        </div>
      </div>

      {/* progress bar */}
      <div style={{
        height: 5, borderRadius: 99,
        background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        overflow: 'hidden',
        marginBottom: 10,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 99,
          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${barColor}66`,
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${t.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: barColor }} />
          <span style={{ fontSize: 10, color: t.subColor, fontWeight: 600 }}>{statusLabel}</span>
        </div>
        {fileCount !== undefined && (
          <span style={{ fontSize: 10, color: t.subColor, fontWeight: 600 }}>
            {fileCount.toLocaleString()} files
          </span>
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 2,
        width: hov ? '100%' : '0%',
        background: `linear-gradient(90deg,${barColor}cc,${barColor})`,
        borderRadius: '0 0 2px 2px',
        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORT — smart router
══════════════════════════════════════════════════════════════ */
export default function StatsCard(props: StatsCardProps) {
  switch (props.variant) {
    case 'affiliate': return <AffiliateCard {...props as AffiliateData} />;
    case 'products': return <ProductsCard  {...props as ProductsData} />;
    case 'category': return <CategoryCard  {...props as CategoryData} />;
    case 'storage': return <StorageCard   {...props as StorageData} />;
    case 'generic':
    case 'gradient':
    case 'default':
    case 'minimal':
    default: return <GenericCard   {...props as GenericData} />;
  }
}

