'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  RotateCw, Crop, Maximize2, Smartphone, Square,
  Pin, Layout, Undo2, Redo2, RefreshCcw, Grid3X3, Check, X
} from 'lucide-react';
import getCroppedImg from '@/lib/cropImage';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

// ─── Aspect Ratio Presets ──────────────────────────────────────────────────────
const ASPECT_RATIOS = [
  { label: 'Pinterest Std', value: 2 / 3,       icon: Pin,       sub: '2:3' },
  { label: 'Pinterest Tall', value: 1 / 2.1,    icon: Pin,       sub: '1:2.1' },
  { label: 'Story',          value: 9 / 16,      icon: Smartphone, sub: '9:16' },
  { label: 'Portrait',       value: 4 / 5,       icon: Crop,      sub: '4:5' },
  { label: 'Square',         value: 1 / 1,       icon: Square,    sub: '1:1' },
  { label: 'Banner',         value: 16 / 9,      icon: Layout,    sub: '16:9' },
  { label: 'Free',           value: undefined,   icon: Maximize2, sub: 'Any' },
];

interface CropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
}

export function CropperModal({
  open,
  onOpenChange,
  image,
  onCropComplete,
  aspectRatio: initialAspect = 4 / 5,
}: CropperModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // ── Core state ────────────────────────────────────────────────────────────────
  const [crop, setCrop]           = useState({ x: 0, y: 0 });
  const [zoom, setZoom]           = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [aspect, setAspect]       = useState<number | undefined>(initialAspect);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [showGrid, setShowGrid]   = useState(true);
  const [fillMode, setFillMode]   = useState<'fill' | 'fit'>('fill');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Undo / Redo ───────────────────────────────────────────────────────────────
  const history      = useRef<any[]>([]);
  const historyIndex = useRef(-1);

  const pushHistory = useCallback((state: any) => {
    const last = history.current[historyIndex.current];
    if (
      last &&
      JSON.stringify(last.crop) === JSON.stringify(state.crop) &&
      last.zoom === state.zoom &&
      last.rotation === state.rotation &&
      last.aspect === state.aspect
    ) return;
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(JSON.parse(JSON.stringify(state)));
    historyIndex.current = history.current.length - 1;
  }, []);

  // ── Reset on open ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      const init = { crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, aspect: initialAspect };
      history.current   = [init];
      historyIndex.current = 0;
      setCrop(init.crop);
      setZoom(1);
      setRotation(0);
      setAspect(initialAspect);
    }
  }, [open, initialAspect]);

  // ── Crop complete callback ────────────────────────────────────────────────────
  const onCropCompleteInternal = useCallback(
    (_: any, croppedAreaPx: any) => setCroppedPixels(croppedAreaPx),
    [],
  );

  // Push history when crop pixels change (end of drag / zoom)
  useEffect(() => {
    if (open && croppedPixels) pushHistory({ crop, zoom, rotation, aspect });
  }, [croppedPixels]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setAspect(initialAspect);
    pushHistory({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, aspect: initialAspect });
  }, [initialAspect, pushHistory]);

  const handleDone = useCallback(async () => {
    if (!croppedPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(image, croppedPixels, rotation);
      if (blob) { onCropComplete(blob); onOpenChange(false); }
    } catch (e) {
      console.error('Final crop failed', e);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedPixels, image, rotation, onCropComplete, onOpenChange]);

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const s = history.current[historyIndex.current];
      setCrop(s.crop); setZoom(s.zoom); setRotation(s.rotation); setAspect(s.aspect);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const s = history.current[historyIndex.current];
      setCrop(s.crop); setZoom(s.zoom); setRotation(s.rotation); setAspect(s.aspect);
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey) resetAll();
      if (e.key === 'Enter') handleDone();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, undo, redo, resetAll, handleDone]);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Full-viewport modal, NO scroll, sharp border, deep shadow
          '!w-[96vw] !max-w-[1320px]',
          'p-0 bg-white dark:bg-[#080808] border border-zinc-200 dark:border-white/[0.06]',
          '!rounded-[2rem] shadow-[0_32px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_120px_rgba(0,0,0,0.9)]',
          '!z-[10000]',
          // Fixed height — nothing overflows
          'h-[92vh] max-h-[900px] overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        {/* ── Outer flex column ── */}
        <div className="flex flex-col h-full overflow-hidden">

          {/* ── HEADER ────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between px-6 h-[60px] shrink-0 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-black/30 backdrop-blur-3xl">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                <Crop size={18} strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block leading-none">
                <DialogTitle className="text-[13px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">
                  Studio Pro
                </DialogTitle>
                <p className="text-[8px] font-bold text-zinc-400 dark:text-white/25 uppercase tracking-[0.25em] mt-0.5">
                  Calibrating Asset Architecture
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Undo / Redo */}
              <div className="flex bg-zinc-100 dark:bg-white/[0.04] rounded-xl p-0.5 border border-zinc-200 dark:border-white/[0.06]">
                <Button
                  variant="ghost" size="icon"
                  onClick={undo}
                  title="Undo (Ctrl+Z)"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-white/40 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5"
                >
                  <Undo2 size={15} />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  onClick={redo}
                  title="Redo (Ctrl+Y)"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-white/40 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5"
                >
                  <Redo2 size={15} />
                </Button>
              </div>

              <div className="h-5 w-px bg-zinc-200 dark:bg-white/10 mx-1" />

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-5 rounded-xl border-zinc-200 dark:border-white/10 text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDone}
                disabled={isProcessing}
                className="h-9 px-7 rounded-xl bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all"
              >
                {isProcessing ? 'Saving…' : 'Confirm'}
              </Button>
            </div>
          </header>

          {/* ── BODY ─────────────────────────────────────────────────────── */}
          {/* min-h-0 is critical: lets flex children shrink below content size */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── CANVAS ─────────────────────────────────────────────────── */}
            <div className="flex-1 relative bg-zinc-100 dark:bg-[#060606] overflow-hidden min-w-0 group">
              {/*
                react-easy-crop fills its container.
                We give the container explicit h/w via absolute inset-0 so the
                cropper never bleeds outside.
              */}
              <div className="absolute inset-0">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropCompleteInternal}
                  objectFit={fillMode === 'fill' ? 'cover' : 'contain'}
                  // Use the library's built-in grid — avoids the broken overlay
                  showGrid={showGrid}
                  style={{
                    containerStyle: {
                      background: 'transparent',
                      // Ensure the container respects the parent bounds
                      position: 'absolute',
                      inset: 0,
                    },
                    cropAreaStyle: {
                      border: '2px solid var(--primary)',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                    },
                  }}
                />
              </div>

              {/* Active-lens HUD (appears on hover) */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border border-white/[0.08]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Lens</span>
                </div>
              </div>

              {/* Keyboard tips */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {['Ctrl+Z Undo', 'R Reset', 'Enter Save'].map(t => (
                  <kbd key={t} className="px-2 py-1 bg-white/10 rounded-md text-[8px] font-bold text-white/50 border border-white/[0.06] uppercase">
                    {t}
                  </kbd>
                ))}
              </div>
            </div>

            {/* ── SIDEBAR ────────────────────────────────────────────────── */}
            {/*
              KEY FIX:
              - Fixed width 300px
              - overflow-hidden  → NO scrollbar, nothing hidden behind scroll
              - flex flex-col with gap-0 → each section is tightly packed
              - All spacing tightened so everything fits in the visible area
            */}
            <aside className="w-[300px] shrink-0 flex flex-col overflow-hidden bg-zinc-50/50 dark:bg-[#080808] border-l border-zinc-200 dark:border-white/[0.06]">

              {/* Scrollable inner — only scrolls if truly needed on small screens */}
              <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col p-5 gap-5">

                {/* ── Fill / Fit toggle ────────────────────────────────── */}
                <div className="flex items-center p-1 bg-zinc-100 dark:bg-white/[0.04] rounded-xl border border-zinc-200 dark:border-white/[0.06]">
                  {(['fill', 'fit'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setFillMode(mode)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                        fillMode === mode
                          ? 'bg-[var(--primary)] text-white shadow'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-white/35 dark:hover:text-white/70',
                      )}
                    >
                      {mode === 'fill' ? 'Fill Frame' : 'Fit Image'}
                    </button>
                  ))}
                </div>

                {/* ── Magnification ────────────────────────────────────── */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/50">Magnification</span>
                    </div>
                    <span className="text-[10px] font-black text-[var(--primary)] tabular-nums">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1} max={3} step={0.01}
                    onValueChange={([v]) => setZoom(v)}
                    className="[&_[role=slider]]:bg-[var(--primary)] [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:border-[1.5px] [&_[role=slider]]:border-white"
                  />
                </div>

                {/* ── Orbital Rotation ─────────────────────────────────── */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/50">Orbital Rotation</span>
                    </div>
                    <span className="text-[10px] font-black text-[var(--primary)] tabular-nums">
                      {rotation}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[rotation]}
                      min={0} max={360} step={1}
                      onValueChange={([v]) => setRotation(v)}
                      className="flex-1 [&_[role=slider]]:bg-[var(--primary)] [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:border-[1.5px] [&_[role=slider]]:border-white"
                    />
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/40 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center justify-center transition-all active:scale-90 shrink-0"
                      title="+90°"
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>
                </div>

                {/* ── Grid / Reset ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowGrid(g => !g)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all',
                      showGrid
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-white/35 hover:border-zinc-300 dark:hover:border-white/15 hover:bg-zinc-100 dark:hover:bg-transparent',
                    )}
                  >
                    <Grid3X3 size={13} />
                    Overlay Grid
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-white/35 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    <RefreshCcw size={13} />
                    Reset Lens
                  </button>
                </div>

                {/* ── Platform Presets ─────────────────────────────────── */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/50">Platform Presets</span>
                  </div>

                  {/*
                    2-column compact grid instead of 1-column tall list.
                    Each item fits in ~40px height — all 7 visible at once.
                  */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {ASPECT_RATIOS.map(r => (
                      <button
                        key={r.label}
                        onClick={() => setAspect(r.value)}
                        className={cn(
                          'relative flex flex-col items-start px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group/item',
                          aspect === r.value
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                            : 'border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-white/40 hover:border-zinc-300 dark:hover:border-white/15 hover:bg-zinc-100 dark:hover:bg-white/[0.03]',
                        )}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <r.icon size={12} className="shrink-0" />
                          <span className="text-[9px] font-black uppercase tracking-wider truncate">{r.label}</span>
                          {aspect === r.value && (
                            <Check size={10} className="ml-auto shrink-0" />
                          )}
                        </div>
                        <span className="text-[8px] font-bold opacity-40 mt-0.5 tracking-wide">{r.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>{/* end scrollable inner */}

            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
