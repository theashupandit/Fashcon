import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { File as FileIcon, Info, Check, PlayCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetContextMenu } from './AssetContextMenu';
import { MediaAsset } from './types';

interface MediaGalleryProps {
  assets: MediaAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: MediaAsset) => void;
  isLoading: boolean;
  hasClipboard?: boolean;
  onCopyAsset?: (asset: MediaAsset) => void;
  onCutAsset?: (asset: MediaAsset) => void;
  onPasteAsset?: () => void;
  onRenameAsset?: (asset: MediaAsset) => void;
  onMoveAsset?: (asset: MediaAsset) => void;
  onDeleteAsset?: (asset: MediaAsset) => void;
  onRestoreAsset?: (asset: MediaAsset) => void;
  isTrashMode?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onBulkSelect: (ids: string[]) => void;
  onClearSelection: () => void;
  viewMode?: 'grid' | 'details';
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  isLoading,
  hasClipboard = false,
  onCopyAsset,
  onCutAsset,
  onPasteAsset,
  onRenameAsset,
  onMoveAsset,
  onDeleteAsset,
  onRestoreAsset,
  isTrashMode = false,
  selectedIds,
  onToggleSelect,
  onBulkSelect,
  onClearSelection,
  viewMode = 'grid',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const formatDisplayName = (name: string) => {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/\.[^/.]+$/, "")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatImageId = (id: string) => {
    return id.split('/').pop() || id;
  };

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    // If dragging a selected item, we move the whole selection
    const ids = selectedIds.has(asset._id) ? Array.from(selectedIds) : [asset._id];
    
    e.dataTransfer.setData('assetIds', JSON.stringify(ids));
    e.dataTransfer.setData('assetId', asset._id);
    e.dataTransfer.effectAllowed = 'move';

    // Premium drag ghost image
    if (ids.length > 1) {
      const dragBadge = document.createElement('div');
      dragBadge.style.background = 'var(--primary)';
      dragBadge.style.color = 'white';
      dragBadge.style.padding = '4px 12px';
      dragBadge.style.borderRadius = '20px';
      dragBadge.style.fontSize = '12px';
      dragBadge.style.fontWeight = '900';
      dragBadge.style.position = 'absolute';
      dragBadge.style.top = '-1000px';
      dragBadge.innerText = `Moving ${ids.length} items`;
      document.body.appendChild(dragBadge);
      e.dataTransfer.setDragImage(dragBadge, 0, 0);
      setTimeout(() => document.body.removeChild(dragBadge), 0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start lasso if clicking the background
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.asset-card')) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
    setIsSelecting(true);

    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      onClearSelection();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !selectionBox) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox(prev => prev ? { ...prev, x2: x, y2: y } : null);

    // Live update selection
    const x1 = Math.min(selectionBox.x1, x);
    const y1 = Math.min(selectionBox.y1, y);
    const x2 = Math.max(selectionBox.x1, x);
    const y2 = Math.max(selectionBox.y1, y);

    const cards = containerRef.current?.querySelectorAll('.asset-card');
    const newSelectedIds: string[] = [];

    cards?.forEach((card) => {
      const cardRect = (card as HTMLElement).getBoundingClientRect();
      const relativeCardRect = {
        left: cardRect.left - rect.left,
        top: cardRect.top - rect.top,
        right: cardRect.right - rect.left,
        bottom: cardRect.bottom - rect.top,
      };

      if (
        relativeCardRect.left < x2 &&
        relativeCardRect.right > x1 &&
        relativeCardRect.top < y2 &&
        relativeCardRect.bottom > y1
      ) {
        const id = card.getAttribute('data-id');
        if (id) newSelectedIds.push(id);
      }
    });

    if (newSelectedIds.length > 0) {
      onBulkSelect(newSelectedIds);
    }
  }, [isSelecting, selectionBox, onBulkSelect]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);

  useEffect(() => {
    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  const handleCardClick = (e: React.MouseEvent, asset: MediaAsset, index: number) => {
    e.stopPropagation();

    if (e.shiftKey && lastSelectedIndex !== null) {
      // Range selection
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = assets.slice(start, end + 1).map(a => a._id);
      onBulkSelect(rangeIds);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      onToggleSelect(asset._id);
      setLastSelectedIndex(index);
    } else {
      // Single selection
      onClearSelection();
      onToggleSelect(asset._id);
      setLastSelectedIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-2">
            <div className="w-full aspect-square bg-black/5 dark:bg-white/5 rounded-md animate-pulse" />
            <div className="h-3 w-3/4 bg-black/5 dark:bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileIcon size={40} className="text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-2">No assets found</h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
          This folder is currently empty. Start by uploading some high-quality media.
        </p>
      </div>
    );
  }

  const renderCard = (asset: MediaAsset, index: number) => {
    const isSelected = selectedIds.has(asset._id);
    const isCurrent = selectedAssetId === asset._id;

    const isVideo = asset.metadata.format === 'mp4' || 
                    asset.metadata.format === 'webm' || 
                    asset.url.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i);

    // For videos, if no thumbnail, try to get the Cloudinary poster image with auto-seek
    let displayUrl = asset.thumbnailUrl || asset.mediumUrl || asset.url;
    if (isVideo && !asset.thumbnailUrl && displayUrl.includes('res.cloudinary.com')) {
      // THE MOST RELIABLE CLOUDINARY POSTER PATTERN:
      displayUrl = asset.url
        .replace(/\/v\d+\//, '/') // Remove version for cleaner transformation
        .replace('/video/upload/', '/video/upload/so_auto,w_500,c_limit/')
        .replace(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i, '.jpg');
    }

    return (
      <div
        key={asset._id}
        data-id={asset._id}
        className="group relative asset-card"
        draggable
        onDragStart={(e) => handleDragStart(e, asset)}
        onClick={(e) => handleCardClick(e, asset, index)}
        onDoubleClick={() => onSelectAsset(asset)}
      >
        <div className={cn(
          "flex flex-col items-center p-2 rounded-lg transition-all border border-transparent select-none cursor-default",
          isSelected || isCurrent
            ? "bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/30 ring-1 ring-blue-500/20"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}>
          <div className="relative w-full aspect-square mb-2 flex items-center justify-center overflow-hidden rounded-md bg-black/[0.03] dark:bg-white/[0.03]">
            {/* Windows 11 Selection Checkbox */}
            <div 
              className={cn(
                "absolute top-1 left-1 z-20 h-4 w-4 rounded bg-white dark:bg-black border border-black/20 dark:border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-sm",
                isSelected ? "opacity-100 bg-blue-500 border-blue-500" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(asset._id);
              }}
            >
              {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
            </div>

            {isVideo && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-xl border border-white/20 group-hover:scale-110 transition-transform">
                  <PlayCircle size={18} fill="currentColor" className="ml-0.5" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded text-[7px] font-black uppercase text-white tracking-widest border border-white/10">
                  Video
                </div>
              </div>
            )}

            <div className="relative w-full h-full p-1">
              <SafeImage
                src={displayUrl}
                alt={asset.displayName || asset.originalFilename}
                fill
                className={cn("object-contain transition-transform duration-500", isVideo && "group-hover:scale-105")}
                sizes="120px"
              />
            </div>
          </div>

          <div className="w-full px-1">
            <p className={cn(
              "text-[11px] text-center leading-snug line-clamp-2 break-words transition-colors",
              isSelected || isCurrent ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-foreground/80"
            )}>
              {formatDisplayName(asset.displayName || asset.originalFilename)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsRow = (asset: MediaAsset, index: number) => {
    const isSelected = selectedIds.has(asset._id);
    const isCurrent = selectedAssetId === asset._id;

    return (
      <div
        key={asset._id}
        data-id={asset._id}
        className="group relative asset-card w-full"
        onClick={(e) => handleCardClick(e, asset, index)}
        onDoubleClick={() => onSelectAsset(asset)}
      >
        <div className={cn(
          "flex items-center px-4 py-2 rounded transition-all border border-transparent select-none cursor-default gap-4",
          isSelected || isCurrent
            ? "bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/30"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        )}>
          <div 
            className={cn(
              "h-4 w-4 rounded bg-white dark:bg-black border border-black/20 dark:border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0",
              isSelected ? "opacity-100 bg-blue-500 border-blue-500" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(asset._id);
            }}
          >
            {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-3">
            <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={cn(
              "text-[12px] truncate transition-colors",
              isSelected || isCurrent ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-foreground/80"
            )}>
              {formatDisplayName(asset.displayName || asset.originalFilename)}
            </span>
          </div>

          <div className="w-24 text-[11px] text-foreground/40 text-right">
            {asset.metadata.size} KB
          </div>
          <div className="w-24 text-[11px] text-foreground/40 text-right">
            {asset.metadata.format.toUpperCase()}
          </div>
          <div className="w-32 text-[11px] text-foreground/40 text-right">
            {new Date(asset.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  const hasContextMenu = onCopyAsset && onCutAsset && onPasteAsset && onRenameAsset && onMoveAsset && onDeleteAsset;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative items-start content-start gap-4 pb-10 min-h-full select-none",
        viewMode === 'grid' 
          ? "grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))]" 
          : "flex flex-col gap-1"
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Lasso Box */}
      {selectionBox && (
        <div
          className="absolute z-[100] border border-blue-500 bg-blue-500/20 pointer-events-none shadow-sm"
          style={{
            left: Math.min(selectionBox.x1, selectionBox.x2),
            top: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x2 - selectionBox.x1),
            height: Math.abs(selectionBox.y2 - selectionBox.y1),
          }}
        />
      )}

      <AnimatePresence mode="popLayout">
        {assets.map((asset, index) => (
          hasContextMenu ? (
            <AssetContextMenu
              key={asset._id}
              asset={asset}
              hasClipboard={hasClipboard}
              selectionCount={selectedIds.size}
              isAssetSelected={selectedIds.has(asset._id)}
              onOpen={onSelectAsset}
              onCopy={onCopyAsset}
              onCut={onCutAsset}
              onPaste={onPasteAsset}
              onRename={onRenameAsset}
              onMove={onMoveAsset}
              onDelete={onDeleteAsset}
              onRestore={onRestoreAsset}
              isTrashMode={isTrashMode}
            >
              {viewMode === 'grid' ? renderCard(asset, index) : renderDetailsRow(asset, index)}
            </AssetContextMenu>
          ) : (
            viewMode === 'grid' ? renderCard(asset, index) : renderDetailsRow(asset, index)
          )
        ))}
      </AnimatePresence>
    </div>
  );
};
