'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  RotateCw, Crop, Maximize2, Smartphone, Square,
  Pin, Layout, Undo2, Redo2, RefreshCcw, Grid3X3, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

// ─── Aspect Ratio Presets ──────────────────────────────────────────────────────
const ASPECT_RATIOS = [
  { label: 'Pinterest Std', value: 2 / 3,       icon: Pin,       sub: '2:3',      color: 'text-red-500' },
  { label: 'Pinterest Tall', value: 1 / 2.1,    icon: Pin,       sub: '1:2.1',    color: 'text-rose-500' },
  { label: 'Story',          value: 9 / 16,      icon: Smartphone, sub: '9:16',     color: 'text-purple-500' },
  { label: 'Portrait',       value: 4 / 5,       icon: Crop,      sub: '4:5',      color: 'text-blue-500' },
  { label: 'Square',         value: 1 / 1,       icon: Square,    sub: '1:1',      color: 'text-emerald-500' },
  { label: 'Slider Banner',  value: 3 / 4,       icon: Crop,      sub: '600x800',  color: 'text-rose-400' },
  { label: 'Hero (Desktop)', value: 1920 / 450,  icon: Layout,    sub: '1920x450', color: 'text-cyan-500' },
  { label: 'Hero (Tablet)',  value: 1024 / 450,  icon: Layout,    sub: '1024x450', color: 'text-teal-500' },
  { label: 'Hero (Mobile)',  value: 640 / 500,   icon: Layout,    sub: '640x500',  color: 'text-sky-500' },
  { label: 'Free',           value: NaN,         icon: Maximize2, sub: 'Any',      color: 'text-zinc-500 dark:text-zinc-400' },
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

  const cropperRef = useRef<ReactCropperElement>(null);

  // ── Core state ────────────────────────────────────────────────────────────────
  const [zoom, setZoom]           = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [aspect, setAspect]       = useState<number>(initialAspect || NaN);

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [showGrid, setShowGrid]   = useState(true);
  const [fillMode, setFillMode]   = useState<'fill' | 'fit'>('fill');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Undo / Redo ───────────────────────────────────────────────────────────────
  const history      = useRef<any[]>([]);
  const historyIndex = useRef(-1);

  const pushHistory = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const cropData = cropper.getData();
    const canvasData = cropper.getCanvasData();
    const state = { cropData, canvasData, aspect };

    const last = history.current[historyIndex.current];
    if (last && JSON.stringify(last.cropData) === JSON.stringify(state.cropData)) return;

    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(JSON.parse(JSON.stringify(state)));
    historyIndex.current = history.current.length - 1;
  }, [aspect]);

  // ── Reset on open ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setAspect(initialAspect || NaN);
      setTimeout(() => pushHistory(), 500); // initial history
    } else {
      history.current = [];
      historyIndex.current = -1;
    }
  }, [open, initialAspect, pushHistory]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
      setZoom(1);
      setRotation(0);
      setAspect(initialAspect || NaN);
      cropper.setAspectRatio(initialAspect || NaN);
    }
  }, [initialAspect]);

  const handleDone = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    setIsProcessing(true);
    try {
      const canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob);
            onOpenChange(false);
          }
          setIsProcessing(false);
        }, 'image/jpeg', 0.95);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('Final crop failed', e);
      setIsProcessing(false);
    }
  }, [onCropComplete, onOpenChange]);

  const handlePushFull = useCallback(async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(image);
      const blob = await res.blob();
      onCropComplete(blob);
      onOpenChange(false);
    } catch (e) {
      console.error('Failed to get original image', e);
    } finally {
      setIsProcessing(false);
    }
  }, [image, onCropComplete, onOpenChange]);

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const s = history.current[historyIndex.current];
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        setAspect(s.aspect);
        cropper.setAspectRatio(s.aspect);
        cropper.setCanvasData(s.canvasData);
        cropper.setData(s.cropData);
      }
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const s = history.current[historyIndex.current];
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        setAspect(s.aspect);
        cropper.setAspectRatio(s.aspect);
        cropper.setCanvasData(s.canvasData);
        cropper.setData(s.cropData);
      }
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

  // Handle external controls
  const handleZoomChange = (v: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Cropper.js zoom is relative to original, but zoomTo is absolute scale.
      // However zoomTo(v) sets the ratio of canvas to natural size.
      // So let's use zoomTo.
      cropper.zoomTo(v);
      setZoom(v);
    }
  };

  const handleRotationChange = (v: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotateTo(v);
      setRotation(v);
    }
  };

  const handleAspectChange = (v: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(v);
      setAspect(v);
      pushHistory();
    }
  };

  const onCropEnd = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Update local zoom/rotation states based on cropper internal state
      const canvasData = cropper.getCanvasData();
      const imageData = cropper.getImageData();
      setZoom(canvasData.width / imageData.naturalWidth);
      setRotation(imageData.rotate || 0);
      pushHistory();
    }
  };

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
                onClick={handlePushFull}
                disabled={isProcessing}
                variant="outline"
                className="h-9 px-5 rounded-xl border-[var(--primary)] text-[var(--primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/10"
              >
                {isProcessing ? 'Saving…' : 'Push Full Image'}
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
              <div className="absolute inset-0">
                <Cropper
                  src={image}
                  style={{ height: '100%', width: '100%' }}
                  initialAspectRatio={initialAspect || NaN}
                  aspectRatio={aspect}
                  guides={showGrid}
                  ref={cropperRef}
                  viewMode={fillMode === 'fill' ? 1 : 2}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                  cropend={onCropEnd}
                  zoom={onCropEnd}
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
                    min={0.1} max={5} step={0.1}
                    onValueChange={([v]) => handleZoomChange(v)}
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
                      onValueChange={([v]) => handleRotationChange(v)}
                      className="flex-1 [&_[role=slider]]:bg-[var(--primary)] [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:border-[1.5px] [&_[role=slider]]:border-white"
                    />
                    <button
                      onClick={() => handleRotationChange((rotation + 90) % 360)}
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
                    {ASPECT_RATIOS.map(r => {
                      // Compare aspect to r.value (using isNaN for Free)
                      const isSelected = (isNaN(r.value) && isNaN(aspect)) || aspect === r.value;
                      return (
                      <button
                        key={r.label}
                        onClick={() => handleAspectChange(r.value)}
                        className={cn(
                          'relative flex flex-col items-start px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group/item',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                            : 'border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-white/40 hover:border-zinc-300 dark:hover:border-white/15 hover:bg-zinc-100 dark:hover:bg-white/[0.03]',
                        )}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <r.icon size={12} className={cn("shrink-0", r.color)} />
                          <span className={cn("text-[9px] font-black uppercase tracking-wider truncate", r.color)}>{r.label}</span>
                          {isSelected && (
                            <Check size={10} className="ml-auto shrink-0" />
                          )}
                        </div>
                        <span className="text-[8px] font-bold opacity-40 mt-0.5 tracking-wide">{r.sub}</span>
                      </button>
                    )})}
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
