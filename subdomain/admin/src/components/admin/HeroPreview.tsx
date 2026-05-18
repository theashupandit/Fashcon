'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import {
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Monitor, Smartphone, Maximize2, X, ExternalLink,
} from 'lucide-react'

type HeroContent = {
  eyebrow: string
  title: string
  subtitle: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  imageUrl: string
  mobileImageUrl?: string
  titleFont?: string
  titleColor?: string
  contentAlignment?: 'top' | 'middle' | 'bottom'
  titleShadowColor?: string
  titleShadowX?: number
  titleShadowY?: number
  titleShadowBlur?: number
}

function getSafeSrc(url: string) {
  if (typeof url === 'string' && (url.includes('res.cloudinary.com') || url.startsWith('/') || url.startsWith('http')))
    return url
  return '/placeholder.png'
}

function RichText({ html }: { html: string }) {
  const hasTag = /<[a-z][\s\S]*>/i.test(html ?? '')
  if (hasTag) return <span dangerouslySetInnerHTML={{ __html: html }} />
  return <span>{html}</span>
}

function stripHtml(html: string) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function getGradient(align: string) {
  return ({
    top:    'bg-gradient-to-b from-black/80 via-black/20 to-transparent',
    middle: 'bg-gradient-to-r from-black/80 via-black/40 to-transparent',
    bottom: 'bg-gradient-to-t from-black/80 via-transparent to-transparent',
  } as Record<string, string>)[align] ?? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'
}

// ── Desktop hero ───────────────────────────────────────────────────────────
// fluid=true → fills 100% of parent (used in fullscreen)
// fluid=false → fixed 1280×600 then scaled by parent (used in panel)
function DesktopHero({ content, fluid = false }: { content: HeroContent; fluid?: boolean }) {
  const align = content.contentAlignment || 'middle'
  const alignClass = { top: 'items-start pt-20', middle: 'items-center', bottom: 'items-end pb-24' }[align]

  return (
    <section
      className="relative overflow-hidden bg-black"
      style={fluid ? { width: '100%', height: '100%' } : { width: 1280, height: 600 }}
    >
      <img src={getSafeSrc(content.imageUrl)} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className={`absolute inset-0 pointer-events-none z-10 ${getGradient(align)}`} />
      <div className="relative z-20 h-full">
        <div className={`max-w-7xl mx-auto px-8 h-full pt-16 flex ${alignClass}`}>
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-3">
              <RichText html={content.eyebrow} />
            </p>
            {(() => {
              const shadowStyle = content.titleShadowColor
                ? `${content.titleShadowX ?? 0}px ${content.titleShadowY ?? 4}px ${content.titleShadowBlur ?? 12}px ${content.titleShadowColor}`
                : '0px 4px 12px rgba(0,0,0,0.4)';
              return (
                <h1 
                  className="text-[68px] leading-[1.05] font-black italic text-white mb-6 tracking-tight"
                  style={{ textShadow: shadowStyle }}
                >
                  <RichText html={content.title} />
                </h1>
              );
            })()}
            <div className="text-base text-white/75 max-w-md mb-10 leading-relaxed prose prose-invert prose-sm"
              dangerouslySetInnerHTML={{ __html: content.subtitle }} />
            <div className="flex flex-wrap gap-3">
              {content.primaryCtaLabel && (
                <span className="bg-red-600 text-white px-8 py-3 rounded-[16px] font-bold text-sm shadow-[0_8px_24px_rgba(230,0,35,0.4)]">
                  <RichText html={content.primaryCtaLabel} />
                </span>
              )}
              {content.secondaryCtaLabel && (
                <span className="bg-white/15 backdrop-blur-sm text-white border border-white/25 px-8 py-3 rounded-[16px] font-bold text-sm">
                  <RichText html={content.secondaryCtaLabel} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Mobile hero ────────────────────────────────────────────────────────────
function MobileHero({ content }: { content: HeroContent }) {
  const align = content.contentAlignment || 'middle'
  const alignClass = { top: 'items-start pt-10', middle: 'items-center', bottom: 'items-end pb-10' }[align]

  return (
    <div style={{ width: 390, height: 844, overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-4 bg-white/90 backdrop-blur border-b border-black/10"
        style={{ height: 64, position: 'relative', zIndex: 10 }}>
        <div className="flex flex-col gap-[5px]">
          <span className="block w-5 h-[2px] bg-black rounded" />
          <span className="block w-5 h-[2px] bg-black rounded" />
          <span className="block w-5 h-[2px] bg-black rounded" />
        </div>
        <span className="text-[20px] font-black tracking-tighter text-red-600 italic">FASHCON</span>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span className="bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-[10px]">Explore</span>
        </div>
      </div>
      <section className="relative overflow-hidden bg-black" style={{ marginTop: -64, height: 844 }}>
        <img src={getSafeSrc(content.mobileImageUrl || content.imageUrl)} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className={`absolute inset-0 pointer-events-none z-10 ${getGradient(align)}`} />
        <div className="relative z-20 h-full">
          <div className={`px-4 h-full pt-16 flex ${alignClass}`}>
            <div className="max-w-[280px]">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-3">
                <RichText html={content.eyebrow} />
              </p>
              {(() => {
                const shadowStyle = content.titleShadowColor
                  ? `${content.titleShadowX ?? 0}px ${content.titleShadowY ?? 4}px ${content.titleShadowBlur ?? 12}px ${content.titleShadowColor}`
                  : '0px 4px 12px rgba(0,0,0,0.4)';
                return (
                  <h1 
                    className="text-[36px] leading-[1.05] font-black italic text-white mb-4 tracking-tight"
                    style={{ textShadow: shadowStyle }}
                  >
                    <RichText html={content.title} />
                  </h1>
                );
              })()}
              <div className="text-sm text-white/75 mb-6 leading-relaxed prose prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: content.subtitle }} />
              <div className="flex flex-wrap gap-2">
                {content.primaryCtaLabel && (
                  <span className="bg-red-600 text-white px-5 py-2.5 rounded-[14px] font-bold text-xs shadow-[0_6px_18px_rgba(230,0,35,0.4)]">
                    <RichText html={content.primaryCtaLabel} />
                  </span>
                )}
                {content.secondaryCtaLabel && (
                  <span className="bg-white/15 backdrop-blur-sm text-white border border-white/25 px-5 py-2.5 rounded-[14px] font-bold text-xs">
                    <RichText html={content.secondaryCtaLabel} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Alignment pill ─────────────────────────────────────────────────────────
const ALIGN_ICONS = {
  top:    AlignVerticalJustifyStart,
  middle: AlignVerticalJustifyCenter,
  bottom: AlignVerticalJustifyEnd,
} as const

function AlignControls({ current, onChange }: {
  current: string
  onChange: (a: 'top' | 'middle' | 'bottom') => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 10 }}>
      {(['top', 'middle', 'bottom'] as const).map((a) => {
        const Icon = ALIGN_ICONS[a]
        return (
          <button key={a} onClick={() => onChange(a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: current === a ? '#fff' : 'transparent',
              color: current === a ? '#000' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
            }}>
            <Icon size={12} />{a}
          </button>
        )
      })}
    </div>
  )
}

// ── Fullscreen portal ──────────────────────────────────────────────────────
function FullscreenPreview({ content, mode, onClose, onAlignmentChange }: {
  content: HeroContent
  mode: 'desktop' | 'mobile'
  onClose: () => void
  onAlignmentChange: (a: 'top' | 'middle' | 'bottom') => void
}) {
  const currentAlign = content.contentAlignment || 'middle'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', fn)
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    // z-index: 2147483647 = max possible — nothing can be above this
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 2147483647,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 20px',
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {/* Live dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
            Fullscreen — {mode === 'desktop' ? 'Desktop' : 'Mobile'}
          </span>
        </div>

        {/* Alignment — centred */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <AlignControls current={currentAlign} onChange={onAlignmentChange} />
        </div>

        {/* EXIT button — red, large, unmissable */}
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 20px',
            background: '#ef4444',
            color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(239,68,68,0.45)',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
        >
          <X size={15} />
          Exit Fullscreen
        </button>
      </div>

      {/* ── Preview area — fills remaining space ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 20, background: '#0f0f0f' }}>

        {mode === 'desktop' ? (
          <div style={{ width: '100%', maxWidth: 1440, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Browser chrome */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '14px 14px 0 0',
              padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'block' }} />
              </div>
              <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 7, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>fashcon.store</span>
              </div>
            </div>
            {/* Hero — fluid, fills full width, aspect ratio 1280:600 */}
            <div style={{
              width: '100%',
              aspectRatio: '1280 / 600',
              overflow: 'hidden',
              borderRadius: '0 0 14px 14px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: 'none',
              position: 'relative',
            }}>
              <DesktopHero content={content} fluid />
            </div>
          </div>
        ) : (
          // Mobile — phone at 1:1 scale (390px), vertically centred
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 414,
              background: 'linear-gradient(145deg, #2c2c2e, #1c1c1e)',
              borderRadius: 52,
              padding: '16px 12px',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: '0 60px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ width: 88, height: 7, background: '#111', borderRadius: 99 }} />
              </div>
              {/* Screen at true 390px — no scaling */}
              <div style={{ width: 390, height: 844, overflow: 'hidden', borderRadius: 32 }}>
                <MobileHero content={content} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <div style={{ width: 68, height: 5, background: '#3a3a3c', borderRadius: 99 }} />
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
              iPhone 14 · 390 × 844 · 1:1
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ── Main HeroPreview component ─────────────────────────────────────────────
export default function HeroPreview({
  content,
  onAlignmentChange,
}: {
  content: HeroContent
  onAlignmentChange: (align: 'top' | 'middle' | 'bottom') => void
}) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
  const [fullscreen, setFullscreen] = useState<'desktop' | 'mobile' | null>(null)
  const currentAlign = content.contentAlignment || 'middle'

  const DW = 1280, DH = 600
  const MW = 390,  MH = 844

  const dContainerW = 860
  const dScale = dContainerW / DW

  const mContainerW = 280
  const mScale = mContainerW / MW

  return (
    <>
      {fullscreen && (
        <FullscreenPreview
          content={content}
          mode={fullscreen}
          onClose={() => setFullscreen(null)}
          onAlignmentChange={onAlignmentChange}
        />
      )}

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0c] w-full">

        {/* Topbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8">
          <div className="flex items-center gap-2 mr-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Live Preview</span>
          </div>

          {/* Device */}
          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-lg">
            {(['desktop', 'mobile'] as const).map((d) => (
              <button key={d} onClick={() => setMode(d)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all',
                  mode === d ? 'bg-white text-black' : 'text-white/40 hover:text-white')}>
                {d === 'desktop' ? <Monitor size={11} /> : <Smartphone size={11} />}
                {d}
              </button>
            ))}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-lg">
            {(['top', 'middle', 'bottom'] as const).map((a) => {
              const Icon = ALIGN_ICONS[a]
              return (
                <button key={a} onClick={() => onAlignmentChange(a)}
                  className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                    currentAlign === a ? 'bg-white text-black' : 'text-white/40 hover:text-white')}>
                  <Icon size={11} />
                  <span className="hidden lg:inline">{a}</span>
                </button>
              )
            })}
          </div>

          {/* Fullscreen */}
          <button onClick={() => setFullscreen(mode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all">
            <Maximize2 size={11} />
            <span className="hidden sm:inline">Full</span>
          </button>
        </div>

        {/* Canvas */}
        <div className="bg-[#0f0f0f] p-4 flex justify-center">

          {mode === 'desktop' && (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full rounded-xl overflow-hidden border border-white/10" style={{ maxWidth: dContainerW }}>
                <div className="h-8 bg-[#1a1a1a] flex items-center px-3 gap-2 border-b border-white/8">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 mx-2 h-5 bg-white/5 rounded flex items-center px-2.5 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0" />
                    <span className="text-[10px] text-white/30 font-mono">fashcon.store</span>
                  </div>
                  <button onClick={() => setFullscreen('desktop')} className="text-white/20 hover:text-white/60 transition-colors" title="Fullscreen">
                    <ExternalLink size={11} />
                  </button>
                </div>
                <div style={{ width: '100%', maxWidth: dContainerW, height: DH * dScale, overflow: 'hidden' }}>
                  <div style={{ width: DW, height: DH, transform: `scale(${dScale})`, transformOrigin: 'top left' }}>
                    <DesktopHero content={content} />
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                <Monitor size={9} /> 1280 × 600 · scale {dScale.toFixed(2)} ·
                <button onClick={() => setFullscreen('desktop')} className="underline hover:text-white/50 transition-colors">fullscreen</button>
              </span>
            </div>
          )}

          {mode === 'mobile' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div style={{
                width: mContainerW + 20,
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                borderRadius: 40, padding: '12px 10px',
                border: '1.5px solid rgba(255,255,255,0.12)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
                <div className="flex justify-center mb-2">
                  <div style={{ width: 72, height: 7, background: '#111', borderRadius: 99 }} />
                </div>
                <div style={{ width: mContainerW, height: MH * mScale, overflow: 'hidden', borderRadius: 26 }}>
                  <div style={{ width: MW, height: MH, transform: `scale(${mScale})`, transformOrigin: 'top left' }}>
                    <MobileHero content={content} />
                  </div>
                </div>
                <div className="flex justify-center mt-2">
                  <div style={{ width: 56, height: 4, background: '#444', borderRadius: 99 }} />
                </div>
              </div>
              <button onClick={() => setFullscreen('mobile')}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors">
                <Maximize2 size={9} /> 390 × 844 · fullscreen
              </button>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="border-t border-white/8 px-4 py-2.5 flex items-center gap-5 overflow-x-auto">
          {[
            { label: 'Eyebrow',  val: stripHtml(content.eyebrow) },
            { label: 'Headline', val: stripHtml(content.title) },
            { label: 'CTA 1',   val: stripHtml(content.primaryCtaLabel) || '—' },
            { label: 'CTA 2',   val: stripHtml(content.secondaryCtaLabel) || '—' },
            { label: 'Align',   val: currentAlign },
          ].map(({ label, val }) => (
            <div key={label} className="shrink-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">{label}</p>
              <p className="text-[11px] font-semibold text-white/50 max-w-[140px] truncate">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
